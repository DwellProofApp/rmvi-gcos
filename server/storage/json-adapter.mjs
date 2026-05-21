import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
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
          liveSessions: persisted.liveSessions ?? seed.liveSessions ?? [],
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

    async backupManifest(state) {
      const backupDir = join(dirname(dataPath), "backups");
      let files = [];
      try {
        files = (await readdir(backupDir)).filter((file) => file.endsWith(".json"));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      const backups = await Promise.all(files.map(async (file) => {
        const path = join(backupDir, file);
        const details = await stat(path);
        let metadata = {};
        try {
          const parsed = JSON.parse(await readFile(path, "utf8"));
          metadata = {
            label: parsed.label ?? file.replace(/^gcos-/, "").replace(/\.json$/, ""),
            hash: parsed.hash ?? `sha256:${createHash("sha256").update(JSON.stringify(parsed.state ?? parsed)).digest("hex")}`,
            createdAt: parsed.exportedAt ?? details.mtime.toISOString(),
            createdBy: parsed.exportedBy ?? "unknown",
            provider: parsed.provider ?? "json"
          };
        } catch {
          metadata = {
            label: file.replace(/^gcos-/, "").replace(/\.json$/, ""),
            hash: `sha256:${createHash("sha256").update(await readFile(path)).digest("hex")}`,
            createdAt: details.mtime.toISOString(),
            createdBy: "unknown",
            provider: "json"
          };
        }
        return {
          path,
          file,
          bytes: details.size,
          ...metadata
        };
      }));
      backups.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return buildBackupManifest(state, {
        provider: "json",
        mode: "json-file",
        backupsPath: backupDir,
        backups
      });
    },

    async restoreDrill(state) {
      const manifest = await this.backupManifest(state);
      const latest = manifest.backups[0];
      if (!latest?.path) return buildRestoreDrill(state, manifest, null, "No backup available for restore drill");
      try {
        const parsed = JSON.parse(await readFile(latest.path, "utf8"));
        return buildRestoreDrill(state, manifest, parsed, null);
      } catch (error) {
        return buildRestoreDrill(state, manifest, null, error.message);
      }
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

    cutoverChecklist(state) {
      return buildCutoverChecklist(state, this.importDryRun(state));
    },

    async databaseSmoke(state, { actor } = {}) {
      return {
        generatedAt: new Date().toISOString(),
        generatedBy: actor ?? "system",
        provider: "json",
        mode: "json-file",
        connected: false,
        schemaReady: false,
        readWrite: false,
        projectionTablesReady: false,
        status: "skipped",
        checks: [
          { name: "database-provider", ok: false, detail: "JSON provider is active" },
          { name: "connection", ok: false, detail: "Set GCOS_STORAGE_PROVIDER=database and GCOS_DATABASE_URL" },
          { name: "read-write", ok: false, detail: "Database smoke test requires Postgres" }
        ],
        records: recordCounts(state),
        nextAction: "Configure managed Postgres before running a production database smoke check"
      };
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
    liveSessions: (state.liveSessions ?? []).length,
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

function buildBackupManifest(state, { provider, mode, backupsPath, backups }) {
  const totalBytes = backups.reduce((sum, backup) => sum + (backup.bytes ?? 0), 0);
  const latest = backups[0] ?? state.persistenceMeta?.lastBackup ?? null;
  const checks = [
    { name: "backup-present", ok: backups.length > 0 || Boolean(state.persistenceMeta?.lastBackup), detail: backups.length ? `${backups.length} backup files` : "No backup file found" },
    { name: "hashes", ok: backups.every((backup) => String(backup.hash ?? "").startsWith("sha256:")), detail: backups.length ? `${backups.length} hashes recorded` : "No hashes recorded" },
    { name: "latest-known", ok: Boolean(latest?.createdAt), detail: latest?.createdAt ?? "No latest backup timestamp" }
  ];
  const status = checks.every((check) => check.ok) ? "protected" : "needs-backup";
  return {
    generatedAt: new Date().toISOString(),
    provider,
    mode,
    backupsPath,
    total: backups.length,
    totalBytes,
    latest,
    backups,
    checks,
    status,
    nextAction: status === "protected" ? "Record backup manifest before database cutover" : "Create a persistence backup"
  };
}

function buildRestoreDrill(liveState, manifest, snapshot, error) {
  const snapshotState = snapshot?.state ?? null;
  const snapshotHash = snapshotState ? hashState(snapshotState) : null;
  const snapshotCounts = snapshotState ? recordCounts(snapshotState) : {};
  const liveCounts = recordCounts(liveState);
  const rowDelta = Object.keys(liveCounts).reduce((sum, key) => sum + Math.abs((liveCounts[key] ?? 0) - (snapshotCounts[key] ?? 0)), 0);
  const checks = [
    { name: "backup-readable", ok: Boolean(snapshotState) && !error, detail: error ?? "Latest backup JSON parsed" },
    { name: "hash-match", ok: Boolean(snapshot?.hash && snapshotHash === snapshot.hash), detail: snapshotHash ? `${snapshotHash}${snapshotHash === snapshot?.hash ? "" : " does not match manifest hash"}` : "No snapshot hash" },
    { name: "state-shape", ok: Boolean(snapshotState?.stations && snapshotState?.audit && snapshotState?.messages), detail: snapshotState ? "Core GCOS collections present" : "No state payload" },
    { name: "record-counts", ok: Object.keys(snapshotCounts).length > 0, detail: `${Object.values(snapshotCounts).reduce((sum, count) => sum + count, 0)} restorable records` }
  ];
  const restorable = checks.every((check) => check.ok);
  return {
    generatedAt: new Date().toISOString(),
    provider: manifest.provider,
    mode: manifest.mode,
    backup: manifest.latest,
    valid: restorable,
    status: restorable ? "restorable" : "blocked",
    liveHash: hashState(liveState),
    backupHash: snapshot?.hash ?? null,
    computedBackupHash: snapshotHash,
    recordDelta: rowDelta,
    liveRecords: liveCounts,
    backupRecords: snapshotCounts,
    checks,
    nextAction: restorable ? "Record restore drill before production cutover" : "Create a readable backup and rerun restore drill"
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

function buildCutoverChecklist(state, dryRun) {
  const meta = state.persistenceMeta ?? {};
  const checks = [
    {
      name: "backup",
      ok: Boolean(meta.lastBackup?.hash),
      detail: meta.lastBackup ? `${meta.lastBackup.label} at ${meta.lastBackup.createdAt}` : "Create a JSON backup before cutover"
    },
    {
      name: "verification",
      ok: Boolean(meta.lastVerifiedAt && meta.lastVerifiedHash),
      detail: meta.lastVerifiedAt ? `${meta.lastVerifiedHash} verified by ${meta.lastVerifiedBy}` : "Verify persistence hash before cutover"
    },
    {
      name: "migration-bundle",
      ok: Boolean(meta.lastMigrationExport?.hash),
      detail: meta.lastMigrationExport ? `${meta.lastMigrationExport.estimatedRows} rows exported` : "Export a database migration bundle"
    },
    {
      name: "schema-package",
      ok: Boolean(meta.lastSchemaExport?.hash),
      detail: meta.lastSchemaExport ? `${meta.lastSchemaExport.tableCount} tables exported` : "Export the Postgres schema package"
    },
    {
      name: "import-dry-run",
      ok: Boolean(meta.lastImportDryRun?.valid),
      detail: meta.lastImportDryRun ? `${meta.lastImportDryRun.estimatedBatches} batches, ${meta.lastImportDryRun.blockers} blockers` : "Record an import dry-run"
    },
    {
      name: "restore-drill",
      ok: Boolean(meta.lastRestoreDrill?.valid),
      detail: meta.lastRestoreDrill ? `${meta.lastRestoreDrill.status} with ${meta.lastRestoreDrill.recordDelta} record delta` : "Record a restore drill"
    },
    {
      name: "object-storage",
      ok: dryRun.objectStorage.files === 0 || dryRun.warnings.some((warning) => warning.includes("Object-vault")),
      detail: dryRun.objectStorage.files ? `${dryRun.objectStorage.files} files require object storage copy` : "No binary object records"
    },
    {
      name: "database-provider",
      ok: false,
      detail: "Set GCOS_STORAGE_PROVIDER=database only after managed database verification"
    }
  ];
  const blockers = checks.filter((check) => !check.ok).map((check) => check.name);
  const ready = blockers.length === 1 && blockers[0] === "database-provider";
  return {
    generatedAt: new Date().toISOString(),
    provider: "json",
    targetProvider: "database",
    ready,
    status: ready ? "go-with-provider-switch" : "hold",
    checks,
    blockers,
    requiredSwitches: [
      { name: "GCOS_STORAGE_PROVIDER", value: "database", ready },
      { name: "GCOS_DATABASE_URL", value: "required", ready: false }
    ],
    rollbackPlan: [
      "Keep GCOS_STORAGE_PROVIDER=json until database verification completes",
      "Retain latest JSON backup and migration bundle",
      "Switch provider back to json if database smoke checks fail"
    ],
    nextAction: ready ? "Configure GCOS_DATABASE_URL and run staging smoke tests" : `Complete ${blockers.length} cutover checks`
  };
}
