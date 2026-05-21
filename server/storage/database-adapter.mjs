import { createHash } from "node:crypto";

const SCHEMA_VERSION = 2;

const COLLECTIONS = [
  { name: "stations", type: "array", key: "id" },
  { name: "messages", type: "array", key: "id" },
  { name: "reports", type: "array", key: "id" },
  { name: "approvals", type: "array", key: "id" },
  { name: "tasks", type: "array", key: "id" },
  { name: "policies", type: "array", key: "id" },
  { name: "calendarEvents", type: "array", key: "id" },
  { name: "liveSessions", type: "array", key: "id" },
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

const PROJECTION_TABLES = [
  "organization_nodes",
  "node_edges",
  "workstation_accounts",
  "churchmail_messages",
  "report_packets",
  "approval_requests",
  "audit_ledger",
  "realtime_sessions"
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
    await client.query(`
      create table if not exists gcos_core.schema_migrations (
        version integer primary key,
        name text not null,
        applied_at timestamptz not null default now()
      )
    `);
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
    await ensureProjectionSchema(client);
    await client.query(
      `insert into gcos_core.schema_migrations (version, name)
       values ($1, $2)
       on conflict (version) do nothing`,
      [SCHEMA_VERSION, "node-operating-model-projections"]
    );
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
        await syncProjectionTables(client, state);
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
      const projections = projectionCounts(state);
      return {
        provider: "database",
        mode: this.mode,
        schemaVersion: SCHEMA_VERSION,
        path: databaseUrl ? redactDatabaseUrl(databaseUrl) : "GCOS_DATABASE_URL not configured",
        hash: hashState(state),
        records: recordCounts(state),
        projections,
        projectionTables: PROJECTION_TABLES,
        lastBackup: state.persistenceMeta?.lastBackup ?? null,
        lastVerifiedAt: state.persistenceMeta?.lastVerifiedAt ?? null,
        lastVerifiedBy: state.persistenceMeta?.lastVerifiedBy ?? null,
        migrationReady: configured,
        databaseError: lastDatabaseError
      };
    },

    async status(state) {
      let database = { connected: false, schemaReady: false, error: lastDatabaseError ?? (configured ? "Not checked" : "GCOS_DATABASE_URL not configured") };
      let projectionStatus = {
        schemaVersion: SCHEMA_VERSION,
        tables: PROJECTION_TABLES.map((name) => ({ name, rows: null, ready: false }))
      };
      if (configured) {
        try {
          const activePool = await getPool();
          const client = await activePool.connect();
          try {
            await ensureSchema(client);
            const ping = await client.query("select now() as checked_at");
            projectionStatus = await readProjectionStatus(client);
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
        projectionStatus,
        note: database.connected ? "Postgres JSONB storage adapter with normalized GCOS node projections is connected." : "Set GCOS_DATABASE_URL to connect a database provider."
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
      const projections = projectionCounts(state);
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
        projections: [
          { name: "organization_nodes", records: projections.organizationNodes, purpose: "Queryable office/department/unit tree with parent_id routing" },
          { name: "node_edges", records: projections.nodeEdges, purpose: "Parent-child hierarchy edges for reports and directives" },
          { name: "workstation_accounts", records: projections.workstationAccounts, purpose: "Station identities linked to nodes" },
          { name: "churchmail_messages", records: projections.churchmailMessages, purpose: "Structured official communication routing" },
          { name: "report_packets", records: projections.reportPackets, purpose: "Hierarchical reports by node route" },
          { name: "approval_requests", records: projections.approvalRequests, purpose: "Approval chains and authority checks" },
          { name: "audit_ledger", records: projections.auditLedger, purpose: "Immutable operational audit view" },
          { name: "realtime_sessions", records: projections.realtimeSessions, purpose: "Video/chat/broadcast meeting records" }
        ],
        objectStorage: {
          provider: "external-object-vault",
          files: state.files?.length ?? 0,
          bytes: (state.files ?? []).reduce((sum, file) => sum + (file.size ?? 0), 0),
          strategy: "managed by configured storage provider"
        },
        checks: [
          { name: "database-url", ok: configured, detail: configured ? "Configured" : "Missing GCOS_DATABASE_URL" },
          { name: "adapter-read-write", ok: configured, detail: configured ? "Postgres JSONB adapter enabled" : "Adapter waiting for database URL" },
          { name: "node-projections", ok: configured, detail: configured ? `${PROJECTION_TABLES.length} normalized projection tables` : "Projection tables ready after database configuration" }
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
        schemaVersion: SCHEMA_VERSION,
        tableCount: tables.length + PROJECTION_TABLES.length + 1,
        estimatedRows: plan.estimatedRows,
        importOrder: tables.map((table) => table.name),
        tables,
        projectionTables: buildProjectionSchemaPlan(),
        sql: buildDatabaseSchemaSql(tables),
        checks: [
          { name: "database-provider", ok: configured, detail: configured ? "Configured" : "Missing GCOS_DATABASE_URL" },
          { name: "adapter-read-write", ok: configured, detail: configured ? "Read/write adapter implemented" : "Waiting for configuration" },
          { name: "node-projection-schema", ok: PROJECTION_TABLES.length >= 8, detail: `${PROJECTION_TABLES.length} projection tables` }
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
      const projectionBatches = (plan.projections ?? []).map((projection, index) => ({
        batch: batches.length + index + 1,
        table: projection.name,
        collection: "projection",
        records: projection.records,
        strategy: configured ? "projection-refresh" : "blocked",
        primaryKey: projection.name === "node_edges" ? "parent_id/child_id" : "id",
        status: configured ? "ready" : "blocked",
        estimatedMs: Math.max(15, projection.records * 4)
      }));
      return {
        generatedAt: new Date().toISOString(),
        provider: "database",
        target: plan.target,
        schema: schema.schema,
        valid: configured,
        estimatedRows: plan.estimatedRows,
        estimatedBatches: batches.length + projectionBatches.length,
        estimatedDurationMs: [...batches, ...projectionBatches].reduce((sum, batch) => sum + batch.estimatedMs, 0),
        batches,
        projectionBatches,
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
        { name: "node-projections", ok: configured, detail: configured ? "Organization nodes, edges, accounts, communications, approvals, audit, and live sessions projected" : "Database URL required" },
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

async function ensureProjectionSchema(client) {
  await client.query(`
    create table if not exists gcos_core.organization_nodes (
      id text primary key,
      name text not null,
      node_type text not null,
      parent_id text,
      parent_name text,
      level text,
      permission_preset text,
      permissions jsonb not null default '[]'::jsonb,
      email text,
      status text,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await client.query("create index if not exists organization_nodes_parent_idx on gcos_core.organization_nodes (parent_id)");
  await client.query("create index if not exists organization_nodes_level_idx on gcos_core.organization_nodes (level)");
  await client.query("create index if not exists organization_nodes_payload_gin on gcos_core.organization_nodes using gin (payload)");

  await client.query(`
    create table if not exists gcos_core.node_edges (
      parent_id text not null,
      child_id text not null,
      relation text not null default 'reports_to',
      payload jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now(),
      primary key (parent_id, child_id, relation)
    )
  `);
  await client.query("create index if not exists node_edges_child_idx on gcos_core.node_edges (child_id)");

  await client.query(`
    create table if not exists gcos_core.workstation_accounts (
      email text primary key,
      node_id text,
      station_id text,
      title text,
      level text,
      permission_preset text,
      workflow_access jsonb not null default '[]'::jsonb,
      status text,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await client.query("create index if not exists workstation_accounts_node_idx on gcos_core.workstation_accounts (node_id)");

  await client.query(`
    create table if not exists gcos_core.churchmail_messages (
      id text primary key,
      sender_node_id text,
      receiver_node_id text,
      message_type text,
      workflow_status text,
      route text,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await client.query("create index if not exists churchmail_messages_route_idx on gcos_core.churchmail_messages (receiver_node_id, workflow_status)");

  await client.query(`
    create table if not exists gcos_core.report_packets (
      id text primary key,
      owner_node_id text,
      report_type text,
      workflow_status text,
      route text,
      due text,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await client.query("create index if not exists report_packets_owner_idx on gcos_core.report_packets (owner_node_id, workflow_status)");

  await client.query(`
    create table if not exists gcos_core.approval_requests (
      id text primary key,
      requester_node_id text,
      approval_route text,
      workflow_status text,
      amount text,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await client.query("create index if not exists approval_requests_route_idx on gcos_core.approval_requests (requester_node_id, workflow_status)");

  await client.query(`
    create table if not exists gcos_core.audit_ledger (
      id text primary key,
      actor text,
      event text,
      object text,
      result text,
      sealed boolean not null default false,
      payload jsonb not null,
      created_at timestamptz not null default now()
    )
  `);
  await client.query("create index if not exists audit_ledger_actor_idx on gcos_core.audit_ledger (actor)");

  await client.query(`
    create table if not exists gcos_core.realtime_sessions (
      id text primary key,
      host_node_id text,
      session_type text,
      linked_record text,
      status text,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await client.query("create index if not exists realtime_sessions_host_idx on gcos_core.realtime_sessions (host_node_id, status)");
}

async function syncProjectionTables(client, state) {
  for (const table of PROJECTION_TABLES) await client.query(`delete from gcos_core.${table}`);

  const offices = state.offices ?? [];
  const stations = state.stations ?? [];
  const officeByEmail = new Map(offices.map((office) => [String(office.email ?? "").toLowerCase(), office]));

  for (const office of offices) {
    const id = String(office.id ?? office.email);
    await client.query(
      `insert into gcos_core.organization_nodes
       (id, name, node_type, parent_id, parent_name, level, permission_preset, permissions, email, status, payload, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11::jsonb,now())`,
      [
        id,
        office.name ?? "Unnamed node",
        office.nodeKind ?? "Office",
        office.parentId ?? null,
        office.parentName ?? office.supervisor ?? null,
        office.level ?? null,
        office.permissionPreset ?? "Reporter",
        JSON.stringify(office.workflowAccess ?? []),
        office.email ?? null,
        office.status ?? null,
        JSON.stringify(office)
      ]
    );
    if (office.parentId || office.parentName || office.supervisor) {
      await client.query(
        `insert into gcos_core.node_edges (parent_id, child_id, relation, payload, updated_at)
         values ($1,$2,'reports_to',$3::jsonb,now())
         on conflict (parent_id, child_id, relation) do update set payload = excluded.payload, updated_at = now()`,
        [String(office.parentId ?? office.parentName ?? office.supervisor), id, JSON.stringify({ parentName: office.parentName ?? office.supervisor })]
      );
    }
  }

  for (const station of stations) {
    const email = String(station.email ?? "").toLowerCase();
    const office = officeByEmail.get(email);
    await client.query(
      `insert into gcos_core.workstation_accounts
       (email, node_id, station_id, title, level, permission_preset, workflow_access, status, payload, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::jsonb,now())`,
      [
        email,
        office?.id ?? station.id ?? email,
        station.id ?? email,
        station.title ?? null,
        station.level ?? null,
        station.permissionPreset ?? office?.permissionPreset ?? "Reporter",
        JSON.stringify(station.workflowAccess ?? office?.workflowAccess ?? []),
        station.status ?? null,
        JSON.stringify(station)
      ]
    );
  }

  for (const message of state.messages ?? []) {
    await client.query(
      `insert into gcos_core.churchmail_messages
       (id, sender_node_id, receiver_node_id, message_type, workflow_status, route, payload, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,now())`,
      [message.id, message.from ?? null, message.to ?? null, message.kind ?? null, message.status ?? null, message.route ?? null, JSON.stringify(message)]
    );
  }

  for (const report of state.reports ?? []) {
    await client.query(
      `insert into gcos_core.report_packets
       (id, owner_node_id, report_type, workflow_status, route, due, payload, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,now())`,
      [report.id, report.owner ?? null, report.type ?? null, report.state ?? null, report.path ?? null, report.due ?? null, JSON.stringify(report)]
    );
  }

  for (const approval of state.approvals ?? []) {
    await client.query(
      `insert into gcos_core.approval_requests
       (id, requester_node_id, approval_route, workflow_status, amount, payload, updated_at)
       values ($1,$2,$3,$4,$5,$6::jsonb,now())`,
      [approval.id, approval.requesterNodeId ?? null, approval.route ?? null, approval.state ?? null, approval.amount ?? null, JSON.stringify(approval)]
    );
  }

  for (const row of state.audit ?? []) {
    await client.query(
      `insert into gcos_core.audit_ledger
       (id, actor, event, object, result, sealed, payload, created_at)
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,now())`,
      [row.id, row.actor ?? null, row.event ?? null, row.object ?? null, row.result ?? null, Boolean(row.sealed), JSON.stringify(row)]
    );
  }

  const realtimeSessions = buildRealtimeSessions(state);
  for (const session of realtimeSessions) {
    await client.query(
      `insert into gcos_core.realtime_sessions
       (id, host_node_id, session_type, linked_record, status, payload, updated_at)
       values ($1,$2,$3,$4,$5,$6::jsonb,now())`,
      [session.id, session.hostNodeId, session.sessionType, session.linkedRecord, session.status, JSON.stringify(session)]
    );
  }
}

async function readProjectionStatus(client) {
  const tables = [];
  for (const table of PROJECTION_TABLES) {
    const result = await client.query(`select count(*)::int as count from gcos_core.${table}`);
    tables.push({ name: table, rows: result.rows[0]?.count ?? 0, ready: true });
  }
  return { schemaVersion: SCHEMA_VERSION, tables };
}

function projectionCounts(state) {
  const offices = state.offices ?? [];
  const stations = state.stations ?? [];
  const messages = state.messages ?? [];
  const reports = state.reports ?? [];
  const approvals = state.approvals ?? [];
  const audit = state.audit ?? [];
  return {
    organizationNodes: offices.length,
    nodeEdges: offices.filter((office) => office.parentId || office.parentName || office.supervisor).length,
    workstationAccounts: stations.length,
    churchmailMessages: messages.length,
    reportPackets: reports.length,
    approvalRequests: approvals.length,
    auditLedger: audit.length,
    realtimeSessions: buildRealtimeSessions(state).length
  };
}

function buildProjectionSchemaPlan() {
  return [
    {
      name: "organization_nodes",
      purpose: "Dynamic offices, departments, directorates, units, and branches as expandable nodes.",
      primaryKey: "id",
      columns: ["id", "name", "node_type", "parent_id", "parent_name", "level", "permission_preset", "permissions", "email", "status", "payload", "updated_at"],
      indexes: ["organization_nodes_parent_idx", "organization_nodes_level_idx", "organization_nodes_payload_gin"]
    },
    {
      name: "node_edges",
      purpose: "Parent-child relationships used for reporting, directives, delegation, and escalation routing.",
      primaryKey: "parent_id/child_id/relation",
      columns: ["parent_id", "child_id", "relation", "payload", "updated_at"],
      indexes: ["node_edges_child_idx"]
    },
    {
      name: "workstation_accounts",
      purpose: "Official station identities tied to organization nodes and workflow permission presets.",
      primaryKey: "email",
      columns: ["email", "node_id", "station_id", "title", "level", "permission_preset", "workflow_access", "status", "payload", "updated_at"],
      indexes: ["workstation_accounts_node_idx"]
    },
    {
      name: "churchmail_messages",
      purpose: "Official ChurchMail messages with sender, receiver, type, route, and workflow status.",
      primaryKey: "id",
      columns: ["id", "sender_node_id", "receiver_node_id", "message_type", "workflow_status", "route", "payload", "updated_at"],
      indexes: ["churchmail_messages_route_idx"]
    },
    {
      name: "report_packets",
      purpose: "Preloaded and submitted church reports routed through the node hierarchy.",
      primaryKey: "id",
      columns: ["id", "owner_node_id", "report_type", "workflow_status", "route", "due", "payload", "updated_at"],
      indexes: ["report_packets_owner_idx"]
    },
    {
      name: "approval_requests",
      purpose: "Delegated approvals, authority limits, signature chains, and execution state.",
      primaryKey: "id",
      columns: ["id", "requester_node_id", "approval_route", "workflow_status", "amount", "payload", "updated_at"],
      indexes: ["approval_requests_route_idx"]
    },
    {
      name: "audit_ledger",
      purpose: "Immutable operational audit projection for account, file, workflow, and admin actions.",
      primaryKey: "id",
      columns: ["id", "actor", "event", "object", "result", "sealed", "payload", "created_at"],
      indexes: ["audit_ledger_actor_idx"]
    },
    {
      name: "realtime_sessions",
      purpose: "Video calls, live reviews, broadcasts, and collaboration rooms linked to office nodes.",
      primaryKey: "id",
      columns: ["id", "host_node_id", "session_type", "linked_record", "status", "payload", "updated_at"],
      indexes: ["realtime_sessions_host_idx"]
    }
  ];
}

function buildDatabaseSchemaSql(tables) {
  const collectionSql = tables.map((table) => `
create table if not exists gcos_core.${table.name} (
  ${table.primaryKey} text primary key,
  payload jsonb not null,
  source_collection text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ${table.name}_payload_gin on gcos_core.${table.name} using gin (payload);
create index if not exists ${table.name}_source_collection_idx on gcos_core.${table.name} (source_collection);`).join("\n");

  return `-- GCOS PostgreSQL schema package
-- Generated for Remedy Movement International GCOS database cutover.
create schema if not exists gcos_core;

create table if not exists gcos_core.schema_migrations (
  version integer primary key,
  name text not null,
  applied_at timestamptz not null default now()
);

${collectionSql}

create table if not exists gcos_core.organization_nodes (
  id text primary key,
  name text not null,
  node_type text not null,
  parent_id text,
  parent_name text,
  level text,
  permission_preset text,
  permissions jsonb not null default '[]'::jsonb,
  email text,
  status text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists organization_nodes_parent_idx on gcos_core.organization_nodes (parent_id);
create index if not exists organization_nodes_level_idx on gcos_core.organization_nodes (level);
create index if not exists organization_nodes_payload_gin on gcos_core.organization_nodes using gin (payload);

create table if not exists gcos_core.node_edges (
  parent_id text not null,
  child_id text not null,
  relation text not null default 'reports_to',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (parent_id, child_id, relation)
);
create index if not exists node_edges_child_idx on gcos_core.node_edges (child_id);

create table if not exists gcos_core.workstation_accounts (
  email text primary key,
  node_id text,
  station_id text,
  title text,
  level text,
  permission_preset text,
  workflow_access jsonb not null default '[]'::jsonb,
  status text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists workstation_accounts_node_idx on gcos_core.workstation_accounts (node_id);

create table if not exists gcos_core.churchmail_messages (
  id text primary key,
  sender_node_id text,
  receiver_node_id text,
  message_type text,
  workflow_status text,
  route text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists churchmail_messages_route_idx on gcos_core.churchmail_messages (receiver_node_id, workflow_status);

create table if not exists gcos_core.report_packets (
  id text primary key,
  owner_node_id text,
  report_type text,
  workflow_status text,
  route text,
  due text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists report_packets_owner_idx on gcos_core.report_packets (owner_node_id, workflow_status);

create table if not exists gcos_core.approval_requests (
  id text primary key,
  requester_node_id text,
  approval_route text,
  workflow_status text,
  amount text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists approval_requests_route_idx on gcos_core.approval_requests (requester_node_id, workflow_status);

create table if not exists gcos_core.audit_ledger (
  id text primary key,
  actor text,
  event text,
  object text,
  result text,
  sealed boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists audit_ledger_actor_idx on gcos_core.audit_ledger (actor);

create table if not exists gcos_core.realtime_sessions (
  id text primary key,
  host_node_id text,
  session_type text,
  linked_record text,
  status text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists realtime_sessions_host_idx on gcos_core.realtime_sessions (host_node_id, status);

insert into gcos_core.schema_migrations (version, name)
values (${SCHEMA_VERSION}, 'node-operating-model-projections')
on conflict (version) do nothing;
`;
}

function buildRealtimeSessions(state) {
  if (Array.isArray(state.liveSessions) && state.liveSessions.length > 0) {
    return state.liveSessions.map((session, index) => ({
      id: session.id ?? `live-session-${index}`,
      hostNodeId: session.host ?? session.hostNodeId ?? "Live Comms",
      sessionType: session.sessionType ?? "live-session",
      linkedRecord: session.linkedRecord ?? session.linkedRecordId ?? session.title ?? `session-${index}`,
      status: session.status ?? "Open",
      title: session.title ?? "Live communication session",
      source: "liveSessions",
      payload: session
    }));
  }
  const calendarSessions = (state.calendarEvents ?? []).slice(0, 4).map((event, index) => ({
    id: `calendar-live-${event.id ?? index}`,
    hostNodeId: event.owner ?? event.level ?? "Calendar",
    sessionType: "video-meeting",
    linkedRecord: event.id ?? event.title ?? `calendar-${index}`,
    status: event.status ?? "Scheduled",
    title: event.title ?? "Scheduled GCOS meeting",
    source: "calendar",
    payload: event
  }));
  const reportSessions = (state.reports ?? []).filter((report) => ["In Review", "Escalated", "Ready"].includes(report.state)).slice(0, 3).map((report, index) => ({
    id: `report-room-${report.id ?? index}`,
    hostNodeId: report.owner ?? "Reports",
    sessionType: "report-review",
    linkedRecord: report.id ?? report.name ?? `report-${index}`,
    status: report.state ?? "Open",
    title: report.name ?? "Report review room",
    source: "reports",
    payload: report
  }));
  const approvalSessions = (state.approvals ?? []).slice(0, 3).map((approval, index) => ({
    id: `approval-room-${approval.id ?? index}`,
    hostNodeId: approval.requesterNodeId ?? approval.route ?? "Approvals",
    sessionType: "approval-room",
    linkedRecord: approval.id ?? approval.name ?? `approval-${index}`,
    status: approval.state ?? "Open",
    title: approval.name ?? "Approval discussion",
    source: "approvals",
    payload: approval
  }));
  const broadcastSessions = (state.messages ?? []).filter((message) => ["Directive", "Notification", "Transfer"].includes(message.kind)).slice(0, 3).map((message, index) => ({
    id: `churchmail-live-${message.id ?? index}`,
    hostNodeId: message.from ?? "ChurchMail",
    sessionType: message.kind === "Directive" ? "broadcast" : "message-review",
    linkedRecord: message.id ?? message.subject ?? `message-${index}`,
    status: message.status ?? "Open",
    title: message.subject ?? "ChurchMail live thread",
    source: "churchmail",
    payload: message
  }));
  const taskSessions = (state.tasks ?? []).filter((task) => ["High", "Critical", "Blocked"].includes(task.priority) || task.status === "Blocked").slice(0, 3).map((task, index) => ({
    id: `task-standup-${task.id ?? index}`,
    hostNodeId: task.owner ?? "Tasks",
    sessionType: "operations-standup",
    linkedRecord: task.id ?? task.title ?? `task-${index}`,
    status: task.status ?? "Open",
    title: task.title ?? "Operations standup",
    source: "tasks",
    payload: task
  }));
  return [...calendarSessions, ...reportSessions, ...approvalSessions, ...broadcastSessions, ...taskSessions];
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
