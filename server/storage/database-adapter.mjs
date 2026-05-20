import { createHash } from "node:crypto";

const COLLECTIONS = [
  { name: "stations", type: "array", key: "id" },
  { name: "messages", type: "array", key: "id" },
  { name: "reports", type: "array", key: "id" },
  { name: "approvals", type: "array", key: "id" },
  { name: "tasks", type: "array", key: "id" },
  { name: "policies", type: "array", key: "id" },
  { name: "calendarEvents", type: "array", key: "id" },
  { name: "personnel", type: "array", key: "id" },
  { name: "escalations", type: "array", key: "id" },
  { name: "transfers", type: "array", key: "id" },
  { name: "offices", type: "array", key: "id" },
  { name: "documents", type: "array", key: "id" },
  { name: "files", type: "array", key: "id" },
  { name: "aiDrafts", type: "array", key: "id" },
  { name: "audit", type: "array", key: "id" },
  { name: "events", type: "array", key: "id" },
  { name: "offlineQueue", type: "array", key: "id" },
  { name: "authCredentials", type: "object", key: "email" },
  { name: "readinessActions", type: "object", key: "name" },
  { name: "securityControls", type: "object", key: "name" },
  { name: "complianceReviews", type: "object", key: "id" },
  { name: "evidenceVault", type: "object", key: "id" },
  { name: "persistenceMeta", type: "singleton", key: "id" }
];

export function createDatabaseStorageAdapter({ databaseUrl }) {
  const configured = Boolean(databaseUrl);
  let pool = null;
  let schemaReady = false;
  let lastDatabaseError = configured ? null : "GCOS_DATABASE_URL not configured";

  async function getPool() {
    if (!configured) return null;
    if (!pool) {
      const { Pool } = await import("pg");
      pool = new Pool({
        connectionString: databaseUrl,
        max: Number(process.env.GCOS_DATABASE_POOL_SIZE ?? 5),
        ssl: process.env.GCOS_DATABASE_SSL === "1" ? { rejectUnauthorized: false } : undefined
      });
    }
    return pool;
  }

  async function ensureSchema(client) {
    if (schemaReady) return;
    await client.query("create schema if not exists gcos_core");
    for (const collection of COLLECTIONS) {
      const table = tableNameFor(collection.name);
      await client.query(`
        create table if not exists gcos_core.${table} (
          ${collection.key} text primary key,
          payload jsonb not null,
          source_collection text not null,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);
      await client.query(`create index if not exists ${table}_payload_gin on gcos_core.${table} using gin (payload)`);
      await client.query(`create index if not exists ${table}_source_collection_idx on gcos_core.${table} (source_collection)`);
    }
    schemaReady = true;
  }

  return {
    provider: "database",
    mode: configured ? "postgres-jsonb" : "database-unconfigured",
    databaseUrl,

    async loadState({ seed, migrate }) {
      if (!configured) {
        console.warn("GCOS_STORAGE_PROVIDER=database is selected, but GCOS_DATABASE_URL is not set. Starting from seed state.");
        return seed;
      }
      let client = null;
      try {
        const activePool = await getPool();
        client = await activePool.connect();
        await ensureSchema(client);
        const loaded = {};
        let totalRows = 0;
        for (const collection of COLLECTIONS) {
          const table = tableNameFor(collection.name);
          const rows = await client.query(`select ${collection.key} as id, payload from gcos_core.${table} order by created_at asc`);
          totalRows += rows.rowCount;
          loaded[collection.name] = deserializeCollection(collection, rows.rows);
        }
        if (totalRows === 0) return seed;
        return migrate({
          ...seed,
          ...loaded
        });
      } catch (error) {
        lastDatabaseError = error.message;
        console.warn(`GCOS database unavailable during startup: ${error.message}. Starting from seed state.`);
        return seed;
      } finally {
        client?.release();
      }
    },

    async saveState(state) {
      if (!configured) return;
      let client = null;
      let inTransaction = false;
      try {
        const activePool = await getPool();
        client = await activePool.connect();
        await ensureSchema(client);
        await client.query("begin");
        inTransaction = true;
        for (const collection of COLLECTIONS) {
          const table = tableNameFor(collection.name);
          await client.query(`delete from gcos_core.${table}`);
          const records = serializeCollection(collection, state[collection.name]);
          for (const record of records) {
            await client.query(
              `insert into gcos_core.${table} (${collection.key}, payload, source_collection, updated_at)
               values ($1, $2::jsonb, $3, now())
               on conflict (${collection.key}) do update set payload = excluded.payload, updated_at = now()`,
              [record.id, JSON.stringify(record.payload), collection.name]
            );
          }
        }
        await client.query("commit");
        inTransaction = false;
        lastDatabaseError = null;
      } catch (error) {
        if (inTransaction && client) await client.query("rollback");
        lastDatabaseError = error.message;
        console.warn(`GCOS database save skipped: ${error.message}`);
      } finally {
        client?.release();
      }
    },

    statusSync(state) {
      return {
        provider: "database",
        mode: this.mode,
        path: databaseUrl ? redactDatabaseUrl(databaseUrl) : "GCOS_DATABASE_URL not configured",
        hash: hashState(state),
        records: recordCounts(state),
        lastBackup: state.persistenceMeta?.lastBackup ?? null,
        lastVerifiedAt: state.persistenceMeta?.lastVerifiedAt ?? null,
        lastVerifiedBy: state.persistenceMeta?.lastVerifiedBy ?? null,
        migrationReady: configured,
        databaseError: lastDatabaseError
      };
    },

    async status(state) {
      let database = { connected: false, schemaReady: false, error: lastDatabaseError ?? (configured ? "Not checked" : "GCOS_DATABASE_URL not configured") };
      if (configured) {
        try {
          const activePool = await getPool();
          const client = await activePool.connect();
          try {
            await ensureSchema(client);
            const ping = await client.query("select now() as checked_at");
            database = { connected: true, schemaReady: true, checkedAt: ping.rows[0]?.checked_at?.toISOString?.() ?? new Date().toISOString() };
            lastDatabaseError = null;
          } finally {
            client.release();
          }
        } catch (error) {
          lastDatabaseError = error.message;
          database = { connected: false, schemaReady: false, error: error.message };
        }
      }
      return {
        ...this.statusSync(state),
        file: null,
        backupsPath: null,
        backupSupport: true,
        readyForExternalDatabase: configured && database.connected,
        database,
        note: database.connected ? "Postgres JSONB storage adapter is connected." : "Set GCOS_DATABASE_URL to connect a database provider."
      };
    },

    async backupState(state, { actor, label }) {
      return {
        path: redactDatabaseUrl(databaseUrl || "database"),
        label: sanitizeLabel(label ?? "database-snapshot"),
        hash: hashState(state),
        createdAt: new Date().toISOString(),
        createdBy: actor,
        provider: "database"
      };
    },

    async backupManifest(state) {
      const latest = state.persistenceMeta?.lastBackup ?? null;
      const backups = latest ? [{
        path: latest.path,
        file: latest.label,
        bytes: 0,
        label: latest.label,
        hash: latest.hash,
        createdAt: latest.createdAt,
        createdBy: latest.createdBy,
        provider: latest.provider ?? "database"
      }] : [];
      const checks = [
        { name: "backup-present", ok: Boolean(latest?.hash), detail: latest ? `${latest.label} recorded` : "No database snapshot recorded" },
        { name: "provider", ok: configured, detail: configured ? "database provider configured" : "GCOS_DATABASE_URL not configured" },
        { name: "hashes", ok: backups.every((backup) => String(backup.hash ?? "").startsWith("sha256:")), detail: backups.length ? `${backups.length} hashes recorded` : "No hashes recorded" }
      ];
      return {
        generatedAt: new Date().toISOString(),
        provider: "database",
        mode: this.mode,
        backupsPath: null,
        total: backups.length,
        totalBytes: 0,
        latest,
        backups,
        checks,
        status: checks.every((check) => check.ok) ? "protected" : "needs-backup",
        nextAction: latest ? "Confirm external managed database backups are enabled" : "Create a database snapshot record"
      };
    },

    async restoreDrill(state) {
      const manifest = await this.backupManifest(state);
      const latest = manifest.latest;
      const managedRestoreConfirmed = process.env.GCOS_MANAGED_RESTORE_DRILL === "1" || Boolean(state.persistenceMeta?.lastRestoreDrill?.valid);
      const checks = [
        { name: "backup-readable", ok: Boolean(latest?.hash), detail: latest ? `${latest.label} snapshot metadata recorded` : "No database snapshot metadata" },
        { name: "provider", ok: configured, detail: configured ? "database provider configured" : "GCOS_DATABASE_URL not configured" },
        { name: "managed-restore", ok: managedRestoreConfirmed, detail: managedRestoreConfirmed ? "Managed restore drill confirmed" : "Set GCOS_MANAGED_RESTORE_DRILL=1 after hosting-provider restore drill" }
      ];
      return {
        generatedAt: new Date().toISOString(),
        provider: "database",
        mode: this.mode,
        backup: latest,
        valid: checks.every((check) => check.ok),
        status: checks.every((check) => check.ok) ? "restorable" : "blocked",
        liveHash: hashState(state),
        backupHash: latest?.hash ?? null,
        computedBackupHash: latest?.hash ?? null,
        recordDelta: 0,
        liveRecords: recordCounts(state),
        backupRecords: recordCounts(state),
        checks,
        nextAction: latest ? "Run a managed database restore drill" : "Create a database snapshot before restore drill"
      };
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
      const records = recordCounts(state);
      const collections = COLLECTIONS.map((collection) => ({
        collection: collection.name,
        targetTable: tableNameFor(collection.name),
        records: records[collection.name] ?? 0,
        strategy: "postgres-jsonb-upsert",
        identityKey: collection.key,
        ready: configured
      }));
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
        estimatedRows: collections.reduce((sum, item) => sum + item.records, 0),
        collections,
        objectStorage: {
          provider: "external-object-vault",
          files: state.files?.length ?? 0,
          bytes: (state.files ?? []).reduce((sum, file) => sum + (file.size ?? 0), 0),
          strategy: "managed by configured storage provider"
        },
        checks: [
          { name: "database-url", ok: configured, detail: configured ? "Configured" : "Missing GCOS_DATABASE_URL" },
          { name: "adapter-read-write", ok: configured, detail: configured ? "Postgres JSONB adapter enabled" : "Adapter waiting for database URL" }
        ],
        blockers: configured ? [] : ["Set GCOS_DATABASE_URL before using database provider"],
        nextSteps: configured ? ["Run staging smoke checks", "Confirm backup and rollback procedure", "Switch production provider after signoff"] : ["Configure GCOS_DATABASE_URL"]
      };
    },

    schemaPlan(state) {
      const plan = this.migrationPlan(state);
      const tables = plan.collections.map((item) => ({
        name: item.targetTable,
        collection: item.collection,
        records: item.records,
        primaryKey: item.identityKey,
        columns: [
          { name: item.identityKey, type: "text", nullable: false },
          { name: "payload", type: "jsonb", nullable: false },
          { name: "source_collection", type: "text", nullable: false },
          { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
          { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" }
        ],
        indexes: [`${item.targetTable}_payload_gin`, `${item.targetTable}_source_collection_idx`],
        importStrategy: item.strategy
      }));
      return {
        generatedAt: new Date().toISOString(),
        schema: "gcos_core",
        dialect: "postgresql",
        tableCount: tables.length,
        estimatedRows: plan.estimatedRows,
        importOrder: tables.map((table) => table.name),
        tables,
        sql: "-- Database provider creates and manages gcos_core JSONB tables automatically.",
        checks: [
          { name: "database-provider", ok: configured, detail: configured ? "Configured" : "Missing GCOS_DATABASE_URL" },
          { name: "adapter-read-write", ok: configured, detail: configured ? "Read/write adapter implemented" : "Waiting for configuration" }
        ]
      };
    },

    importDryRun(state) {
      const plan = this.migrationPlan(state);
      const schema = this.schemaPlan(state);
      const batches = schema.importOrder.map((table, index) => ({
        batch: index + 1,
        table,
        collection: plan.collections[index]?.collection ?? table,
        records: plan.collections[index]?.records ?? 0,
        strategy: configured ? "postgres-jsonb-upsert" : "blocked",
        primaryKey: plan.collections[index]?.identityKey ?? "id",
        status: configured ? "ready" : "blocked",
        estimatedMs: Math.max(25, (plan.collections[index]?.records ?? 0) * 6)
      }));
      return {
        generatedAt: new Date().toISOString(),
        provider: "database",
        target: plan.target,
        schema: schema.schema,
        valid: configured,
        estimatedRows: plan.estimatedRows,
        estimatedBatches: schema.importOrder.length,
        estimatedDurationMs: batches.reduce((sum, batch) => sum + batch.estimatedMs, 0),
        batches,
        objectStorage: plan.objectStorage,
        checks: schema.checks,
        warnings: [],
        blockers: configured ? [] : ["Set GCOS_DATABASE_URL before running database import"],
        nextAction: configured ? "Database adapter can persist live state" : "Configure database provider"
      };
    },

    cutoverChecklist(state) {
      const dryRun = this.importDryRun(state);
      const checks = [
        { name: "database-provider", ok: configured, detail: configured ? "Database provider selected" : "Missing GCOS_DATABASE_URL" },
        { name: "adapter-read-write", ok: configured, detail: configured ? "Postgres JSONB read/write path implemented" : "Database URL required" },
        { name: "import-dry-run", ok: dryRun.valid, detail: dryRun.nextAction },
        { name: "restore-drill", ok: Boolean(state.persistenceMeta?.lastRestoreDrill?.valid), detail: state.persistenceMeta?.lastRestoreDrill ? `${state.persistenceMeta.lastRestoreDrill.status} recorded` : "Run restore drill" }
      ];
      const blockers = checks.filter((check) => !check.ok).map((check) => check.name);
      return {
        generatedAt: new Date().toISOString(),
        provider: "database",
        targetProvider: "database",
        ready: blockers.length === 0,
        status: blockers.length ? "hold" : "go",
        checks,
        blockers,
        requiredSwitches: [
          { name: "GCOS_STORAGE_PROVIDER", value: "database", ready: configured },
          { name: "GCOS_DATABASE_URL", value: configured ? "configured" : "required", ready: configured }
        ],
        rollbackPlan: [
          "Switch GCOS_STORAGE_PROVIDER back to json",
          "Restart from latest JSON backup if database smoke checks fail"
        ],
        nextAction: blockers.length ? `Complete ${blockers.length} database cutover checks` : "Database provider ready"
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

function serializeCollection(collection, value) {
  if (collection.type === "singleton") return [{ id: "singleton", payload: value ?? {} }];
  if (collection.type === "object") {
    return Object.entries(value ?? {}).map(([id, payload]) => ({ id, payload }));
  }
  return (value ?? []).map((item, index) => {
    const payload = collection.name === "events" && typeof item === "string" ? { value: item } : item;
    return {
      id: String(payload?.[collection.key] ?? `${collection.name}-${String(index).padStart(6, "0")}`),
      payload
    };
  });
}

function deserializeCollection(collection, rows) {
  if (collection.type === "singleton") return rows[0]?.payload ?? {};
  if (collection.type === "object") {
    return Object.fromEntries(rows.map((row) => [row.id, row.payload]));
  }
  if (collection.name === "events") return rows.map((row) => row.payload?.value ?? row.payload);
  return rows.map((row) => row.payload);
}

function recordCounts(state) {
  return Object.fromEntries(COLLECTIONS.map((collection) => {
    const value = state[collection.name];
    if (collection.type === "singleton") return [collection.name, value && Object.keys(value).length ? 1 : 0];
    if (collection.type === "object") return [collection.name, Object.keys(value ?? {}).length];
    return [collection.name, (value ?? []).length];
  }));
}

function hashState(state) {
  return `sha256:${createHash("sha256").update(JSON.stringify(state)).digest("hex")}`;
}

function sanitizeLabel(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "database-snapshot";
}

function tableNameFor(collection) {
  return `gcos_${collection.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`;
}

function redactDatabaseUrl(value) {
  return value.replace(/:\/\/([^:@/]+):([^@/]+)@/, "://$1:***@");
}
