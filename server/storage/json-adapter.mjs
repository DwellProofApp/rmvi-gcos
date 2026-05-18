import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export function createJsonStorageAdapter({ dataPath }) {
  return {
    provider: "json",
    mode: "json-file",
    dataPath,

    async loadState({ seed, migrate }) {
      try {
        const persisted = JSON.parse(await readFile(dataPath, "utf8"));
        return migrate({
          ...seed,
          ...persisted,
          stations: persisted.stations ?? seed.stations,
          messages: persisted.messages ?? seed.messages,
          reports: persisted.reports ?? seed.reports,
          approvals: persisted.approvals ?? seed.approvals,
          tasks: persisted.tasks ?? seed.tasks,
          policies: persisted.policies ?? seed.policies,
          calendarEvents: persisted.calendarEvents ?? seed.calendarEvents,
          personnel: persisted.personnel ?? seed.personnel,
          escalations: persisted.escalations ?? seed.escalations,
          transfers: persisted.transfers ?? seed.transfers,
          offices: persisted.offices ?? seed.offices,
          documents: persisted.documents ?? seed.documents,
          files: persisted.files ?? seed.files ?? [],
          aiDrafts: persisted.aiDrafts?.length ? persisted.aiDrafts : seed.aiDrafts,
          audit: persisted.audit ?? seed.audit,
          events: persisted.events ?? seed.events,
          offlineQueue: persisted.offlineQueue ?? seed.offlineQueue,
          authCredentials: persisted.authCredentials ?? seed.authCredentials ?? {},
          readinessActions: persisted.readinessActions ?? seed.readinessActions ?? {},
          securityControls: persisted.securityControls ?? seed.securityControls ?? {},
          complianceReviews: persisted.complianceReviews ?? seed.complianceReviews ?? {},
          evidenceVault: persisted.evidenceVault ?? seed.evidenceVault ?? {},
          persistenceMeta: persisted.persistenceMeta ?? seed.persistenceMeta ?? {}
        });
      } catch (error) {
        if (error.code !== "ENOENT") console.warn(`Unable to load persisted state: ${error.message}`);
        return seed;
      }
    },

    async saveState(state) {
      await mkdir(dirname(dataPath), { recursive: true });
      await writeFile(dataPath, `${JSON.stringify(state, null, 2)}\n`);
    },

    statusSync(state) {
      return {
        provider: "json",
        mode: "json-file",
        path: dataPath,
        hash: hashState(state),
        records: recordCounts(state),
        lastBackup: state.persistenceMeta?.lastBackup ?? null,
        lastVerifiedAt: state.persistenceMeta?.lastVerifiedAt ?? null,
        lastVerifiedBy: state.persistenceMeta?.lastVerifiedBy ?? null,
        migrationReady: true
      };
    },

    async status(state) {
      let file = null;
      try {
        const details = await stat(dataPath);
        file = {
          exists: true,
          bytes: details.size,
          updatedAt: details.mtime.toISOString()
        };
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        file = { exists: false, bytes: 0, updatedAt: null };
      }
      return {
        ...this.statusSync(state),
        file,
        backupsPath: join(dirname(dataPath), "backups"),
        backupSupport: true,
        readyForExternalDatabase: true
      };
    },

    async backupState(state, { actor, label }) {
      const backupDir = join(dirname(dataPath), "backups");
      await mkdir(backupDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeLabel = String(label ?? "manual").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "manual";
      const backupPath = join(backupDir, `gcos-${timestamp}-${safeLabel}.json`);
      const snapshot = {
        exportedAt: new Date().toISOString(),
        exportedBy: actor,
        label: safeLabel,
        provider: "json",
        sourcePath: dataPath,
        hash: hashState(state),
        state
      };
      await writeFile(backupPath, `${JSON.stringify(snapshot, null, 2)}\n`);
      return {
        path: backupPath,
        label: safeLabel,
        hash: snapshot.hash,
        createdAt: snapshot.exportedAt,
        createdBy: actor
      };
    },

    exportState(state, actor) {
      return {
        exportedAt: new Date().toISOString(),
        exportedBy: actor,
        provider: "json",
        status: this.statusSync(state),
        state
      };
    },

    migrationPlan(state) {
      return buildMigrationPlan(state, { provider: "json", mode: "json-file", source: dataPath });
    },

    schemaPlan(state) {
      return buildSchemaPlan(this.migrationPlan(state));
    },

    importDryRun(state) {
      return buildImportDryRun(this.migrationPlan(state), this.schemaPlan(state));
    },

    async exportMigrationBundle(state, { actor, label }) {
      const migrationDir = join(dirname(dataPath), "migrations");
      await mkdir(migrationDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeLabel = String(label ?? "database-ready").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "database-ready";
      const bundlePath = join(migrationDir, `gcos-migration-${timestamp}-${safeLabel}.json`);
      const plan = this.migrationPlan(state);
      const bundle = {
        exportedAt: new Date().toISOString(),
        exportedBy: actor,
        label: safeLabel,
        provider: "json",
        sourcePath: dataPath,
        hash: hashState(state),
        plan,
        state
      };
      await writeFile(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`);
      return {
        path: bundlePath,
        label: safeLabel,
        hash: bundle.hash,
        createdAt: bundle.exportedAt,
        createdBy: actor,
        plan
      };
    },

    async exportSchemaPackage(state, { actor, label }) {
      const schemaDir = join(dirname(dataPath), "migrations");
      await mkdir(schemaDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeLabel = String(label ?? "schema").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "schema";
      const schemaPath = join(schemaDir, `gcos-schema-${timestamp}-${safeLabel}.sql`);
      const schema = this.schemaPlan(state);
      await writeFile(schemaPath, `${schema.sql}\n`);
      return {
        path: schemaPath,
        label: safeLabel,
        hash: `sha256:${createHash("sha256").update(schema.sql).digest("hex")}`,
        createdAt: new Date().toISOString(),
        createdBy: actor,
        schema
      };
    }
  };
}

function hashState(state) {
  return `sha256:${createHash("sha256").update(JSON.stringify(state)).digest("hex")}`;
}

function recordCounts(state) {
  return {
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
  };
}

function buildMigrationPlan(state, source) {
  const records = recordCounts(state);
  const collections = Object.entries(records).map(([collection, count]) => ({
    collection,
    targetTable: tableNameFor(collection),
    records: count,
    strategy: collection === "files" ? "metadata-table-plus-object-storage" : "bulk-upsert",
    identityKey: collection === "authCredentials" ? "email" : "id",
    ready: true
  }));
  const estimatedRows = collections.reduce((sum, item) => sum + item.records, 0);
  const fileRecords = state.files ?? [];
  return {
    generatedAt: new Date().toISOString(),
    source,
    target: {
      provider: "database",
      schema: "gcos_core",
      mode: "staged-import"
    },
    estimatedRows,
    collections,
    objectStorage: {
      provider: "external-object-vault",
      files: fileRecords.length,
      bytes: fileRecords.reduce((sum, file) => sum + (file.size ?? 0), 0),
      strategy: "copy object keys, then move binary payloads to S3/Supabase Storage"
    },
    checks: [
      { name: "json-readable", ok: true, detail: source.source },
      { name: "record-counts", ok: estimatedRows > 0, detail: `${estimatedRows} rows ready` },
      { name: "object-vault", ok: true, detail: `${fileRecords.length} file records mapped` },
      { name: "audit-chain", ok: (state.audit ?? []).length > 0, detail: `${state.audit?.length ?? 0} audit rows` }
    ],
    blockers: [],
    nextSteps: [
      "Create managed Postgres database",
      "Run schema creation for gcos_core tables",
      "Import migration bundle collections in dependency order",
      "Move object vault binaries to managed object storage",
      "Switch GCOS_STORAGE_PROVIDER to database after verification"
    ]
  };
}

function tableNameFor(collection) {
  return `gcos_${collection.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`;
}

function buildSchemaPlan(plan) {
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
    indexes: [
      `${item.targetTable}_payload_gin`,
      `${item.targetTable}_source_collection_idx`
    ],
    importStrategy: item.strategy
  }));
  const importOrder = tables.map((table) => table.name);
  const sql = [
    "-- GCOS database schema package",
    `-- Generated at ${new Date().toISOString()}`,
    "create schema if not exists gcos_core;",
    ...tables.flatMap((table) => [
      "",
      `create table if not exists gcos_core.${table.name} (`,
      `  ${table.primaryKey} text primary key,`,
      "  payload jsonb not null,",
      "  source_collection text not null,",
      "  created_at timestamptz not null default now(),",
      "  updated_at timestamptz not null default now()",
      ");",
      `create index if not exists ${table.name}_payload_gin on gcos_core.${table.name} using gin (payload);`,
      `create index if not exists ${table.name}_source_collection_idx on gcos_core.${table.name} (source_collection);`
    ])
  ].join("\n");
  return {
    generatedAt: new Date().toISOString(),
    schema: "gcos_core",
    dialect: "postgresql",
    tableCount: tables.length,
    estimatedRows: plan.estimatedRows,
    importOrder,
    tables,
    sql,
    checks: [
      { name: "schema-name", ok: true, detail: "gcos_core" },
      { name: "table-count", ok: tables.length > 0, detail: `${tables.length} tables` },
      { name: "import-order", ok: importOrder.length === tables.length, detail: `${importOrder.length} ordered imports` }
    ]
  };
}

function buildImportDryRun(plan, schema) {
  const batches = schema.importOrder.map((tableName, index) => {
    const table = schema.tables.find((item) => item.name === tableName);
    const collection = plan.collections.find((item) => item.targetTable === tableName);
    return {
      batch: index + 1,
      table: tableName,
      collection: table?.collection ?? collection?.collection ?? tableName.replace(/^gcos_/, ""),
      records: table?.records ?? collection?.records ?? 0,
      strategy: table?.importStrategy ?? collection?.strategy ?? "bulk-upsert",
      primaryKey: table?.primaryKey ?? collection?.identityKey ?? "id",
      status: collection?.ready === false ? "blocked" : "ready",
      estimatedMs: Math.max(25, Math.ceil(((table?.records ?? collection?.records ?? 0) || 1) * 6))
    };
  });
  const warnings = [
    ...batches.filter((batch) => batch.records === 0).map((batch) => `${batch.collection} has no records to import`),
    ...(plan.objectStorage.files > 0 ? ["Object-vault binaries require a separate storage copy step"] : [])
  ];
  const blockers = [
    ...plan.blockers,
    ...batches.filter((batch) => batch.status === "blocked").map((batch) => `${batch.collection} is not ready`)
  ];
  const estimatedRows = batches.reduce((sum, batch) => sum + batch.records, 0);
  return {
    generatedAt: new Date().toISOString(),
    provider: "json",
    target: plan.target,
    schema: schema.schema,
    valid: blockers.length === 0 && schema.checks.every((check) => check.ok),
    estimatedRows,
    estimatedBatches: batches.length,
    estimatedDurationMs: batches.reduce((sum, batch) => sum + batch.estimatedMs, 0),
    batches,
    objectStorage: plan.objectStorage,
    checks: [
      ...plan.checks,
      ...schema.checks,
      { name: "batch-order", ok: batches.length === schema.importOrder.length, detail: `${batches.length} ordered batches` },
      { name: "row-total", ok: estimatedRows === plan.estimatedRows, detail: `${estimatedRows} rows matched` }
    ],
    warnings,
    blockers,
    nextAction: blockers.length ? "Resolve blockers before import" : "Ready for staging database import"
  };
}
