export function createDatabaseStorageAdapter({ databaseUrl }) {
  const configured = Boolean(databaseUrl);
  return {
    provider: "database",
    mode: configured ? "database-configured" : "database-unconfigured",
    databaseUrl,

    async loadState({ seed }) {
      if (!configured) {
        console.warn("GCOS_STORAGE_PROVIDER=database is selected, but GCOS_DATABASE_URL is not set. Starting from seed state.");
        return seed;
      }
      throw new Error("Database storage adapter is configured but not implemented yet");
    },

    async saveState() {
      if (!configured) return;
      throw new Error("Database storage adapter save is not implemented yet");
    },

    statusSync(state) {
      return {
        provider: "database",
        mode: this.mode,
        path: databaseUrl ? redactDatabaseUrl(databaseUrl) : "GCOS_DATABASE_URL not configured",
        hash: "unavailable",
        records: {
          stations: state.stations.length,
          messages: state.messages.length,
          reports: state.reports.length,
          approvals: state.approvals.length,
          tasks: state.tasks.length,
          policies: state.policies.length,
          calendarEvents: state.calendarEvents.length,
          personnel: state.personnel.length,
          escalations: state.escalations.length,
          transfers: state.transfers.length,
          offices: state.offices.length,
          documents: state.documents.length,
          files: (state.files ?? []).length,
          aiDrafts: state.aiDrafts.length,
          audit: state.audit.length,
          events: state.events.length
        },
        lastBackup: null,
        lastVerifiedAt: state.persistenceMeta?.lastVerifiedAt ?? null,
        lastVerifiedBy: state.persistenceMeta?.lastVerifiedBy ?? null,
        migrationReady: false
      };
    },

    async status(state) {
      return {
        ...this.statusSync(state),
        file: null,
        backupsPath: null,
        backupSupport: false,
        readyForExternalDatabase: Boolean(databaseUrl),
        note: configured ? "Database adapter shell is configured." : "Set GCOS_DATABASE_URL to connect a database provider."
      };
    },

    async backupState() {
      throw new Error("Database storage backups are not implemented yet");
    },

    exportState(state, actor) {
      return {
        exportedAt: new Date().toISOString(),
        exportedBy: actor,
        provider: "database",
        status: this.statusSync(state),
        state
      };
    },

    migrationPlan(state) {
      return {
        generatedAt: new Date().toISOString(),
        source: {
          provider: "database",
          mode: this.mode,
          source: databaseUrl ? redactDatabaseUrl(databaseUrl) : "GCOS_DATABASE_URL not configured"
        },
        target: {
          provider: "database",
          schema: "gcos_core",
          mode: configured ? "live-provider" : "unconfigured"
        },
        estimatedRows: Object.values(this.statusSync(state).records).reduce((sum, count) => sum + count, 0),
        collections: Object.entries(this.statusSync(state).records).map(([collection, records]) => ({
          collection,
          targetTable: `gcos_${collection.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`,
          records,
          strategy: "provider-managed",
          identityKey: "id",
          ready: configured
        })),
        objectStorage: {
          provider: "external-object-vault",
          files: state.files?.length ?? 0,
          bytes: (state.files ?? []).reduce((sum, file) => sum + (file.size ?? 0), 0),
          strategy: "managed by configured storage provider"
        },
        checks: [
          { name: "database-url", ok: configured, detail: configured ? "Configured" : "Missing GCOS_DATABASE_URL" }
        ],
        blockers: configured ? [] : ["Set GCOS_DATABASE_URL before using database provider"],
        nextSteps: configured ? ["Implement database adapter read/write operations"] : ["Configure GCOS_DATABASE_URL"]
      };
    },

    schemaPlan(state) {
      const plan = this.migrationPlan(state);
      return {
        generatedAt: new Date().toISOString(),
        schema: "gcos_core",
        dialect: "postgresql",
        tableCount: plan.collections.length,
        estimatedRows: plan.estimatedRows,
        importOrder: plan.collections.map((item) => item.targetTable),
        tables: plan.collections.map((item) => ({
          name: item.targetTable,
          collection: item.collection,
          records: item.records,
          primaryKey: item.identityKey,
          columns: [],
          indexes: [],
          importStrategy: item.strategy
        })),
        sql: "-- Database provider schema is managed by the configured adapter.",
        checks: [
          { name: "database-provider", ok: configured, detail: configured ? "Configured" : "Missing GCOS_DATABASE_URL" }
        ]
      };
    },

    importDryRun(state) {
      const plan = this.migrationPlan(state);
      const schema = this.schemaPlan(state);
      return {
        generatedAt: new Date().toISOString(),
        provider: "database",
        target: plan.target,
        schema: schema.schema,
        valid: configured,
        estimatedRows: plan.estimatedRows,
        estimatedBatches: schema.importOrder.length,
        estimatedDurationMs: 0,
        batches: schema.importOrder.map((table, index) => ({
          batch: index + 1,
          table,
          collection: plan.collections[index]?.collection ?? table,
          records: plan.collections[index]?.records ?? 0,
          strategy: "provider-managed",
          primaryKey: plan.collections[index]?.identityKey ?? "id",
          status: configured ? "ready" : "blocked",
          estimatedMs: 0
        })),
        objectStorage: plan.objectStorage,
        checks: schema.checks,
        warnings: [],
        blockers: configured ? [] : ["Set GCOS_DATABASE_URL before running database import"],
        nextAction: configured ? "Implement adapter import execution" : "Configure database provider"
      };
    },

    async exportMigrationBundle() {
      throw new Error("Database migration export is only available from the JSON provider");
    },

    async exportSchemaPackage() {
      throw new Error("Database schema export is only available from the JSON provider");
    }
  };
}

function redactDatabaseUrl(value) {
  return value.replace(/:\/\/([^:@/]+):([^@/]+)@/, "://$1:***@");
}
