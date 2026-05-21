import test from "node:test";
import assert from "node:assert/strict";
import { createSeedState } from "../server/domain.mjs";
import { createDatabaseStorageAdapter } from "../server/storage/database-adapter.mjs";

test("database adapter reports an unconfigured provider without connecting", async () => {
  const adapter = createDatabaseStorageAdapter({ databaseUrl: "" });
  const seed = createSeedState();
  const loaded = await adapter.loadState({ seed, migrate: (state) => state });
  assert.equal(loaded.stations.length, seed.stations.length);

  const status = adapter.statusSync(seed);
  assert.equal(status.provider, "database");
  assert.equal(status.mode, "database-unconfigured");
  assert.equal(status.records.stations > 0, true);
  assert.equal(status.records.persistenceMeta >= 0, true);
  assert.equal(status.schemaVersion >= 2, true);
  assert.equal(status.projections.organizationNodes > 0, true);
  assert.equal(status.projectionTables.includes("organization_nodes"), true);

  const plan = adapter.migrationPlan(seed);
  assert.equal(plan.collections.some((item) => item.collection === "stations" && item.targetTable === "gcos_stations"), true);
  assert.equal(plan.projections.some((item) => item.name === "organization_nodes" && item.records > 0), true);
  assert.equal(plan.projections.some((item) => item.name === "realtime_sessions" && item.records > 0), true);
  assert.equal(plan.blockers.includes("Set GCOS_DATABASE_URL before using database provider"), true);

  const schema = adapter.schemaPlan(seed);
  assert.equal(schema.projectionTables.some((table) => table.name === "organization_nodes"), true);
  assert.equal(schema.projectionTables.some((table) => table.name === "churchmail_messages"), true);
  assert.equal(schema.sql.includes("create table if not exists gcos_core.organization_nodes"), true);
  assert.equal(schema.sql.includes("create table if not exists gcos_core.realtime_sessions"), true);

  const dryRun = adapter.importDryRun(seed);
  assert.equal(dryRun.valid, false);
  assert.equal(dryRun.batches.some((batch) => batch.table === "gcos_stations" && batch.status === "blocked"), true);
  assert.equal(dryRun.projectionBatches.some((batch) => batch.table === "organization_nodes" && batch.status === "blocked"), true);
});

test("database restore drill can be confirmed after managed restore", async () => {
  const original = process.env.GCOS_MANAGED_RESTORE_DRILL;
  process.env.GCOS_MANAGED_RESTORE_DRILL = "1";
  try {
    const adapter = createDatabaseStorageAdapter({ databaseUrl: "postgres://user:pass@db.example.com:5432/gcos" });
    const seed = createSeedState();
    seed.persistenceMeta = {
      lastBackup: {
        path: "postgres://user:***@db.example.com:5432/gcos",
        label: "managed-snapshot",
        hash: "sha256:managed",
        createdAt: new Date().toISOString(),
        createdBy: "np@rmvi.org",
        provider: "database"
      }
    };
    const drill = await adapter.restoreDrill(seed);
    assert.equal(drill.status, "restorable");
    assert.equal(drill.valid, true);
    assert.equal(drill.checks.some((check) => check.name === "managed-restore" && check.ok), true);
  } finally {
    if (original === undefined) delete process.env.GCOS_MANAGED_RESTORE_DRILL;
    else process.env.GCOS_MANAGED_RESTORE_DRILL = original;
  }
});

test("database restore drill can use a recorded managed attestation", async () => {
  const original = process.env.GCOS_MANAGED_RESTORE_DRILL;
  delete process.env.GCOS_MANAGED_RESTORE_DRILL;
  try {
    const adapter = createDatabaseStorageAdapter({ databaseUrl: "postgres://user:pass@db.example.com:5432/gcos" });
    const seed = createSeedState();
    seed.persistenceMeta = {
      lastBackup: {
        path: "postgres://user:***@db.example.com:5432/gcos",
        label: "managed-snapshot",
        hash: "sha256:managed",
        createdAt: new Date().toISOString(),
        createdBy: "np@rmvi.org",
        provider: "database"
      },
      lastRestoreDrill: {
        generatedAt: new Date().toISOString(),
        actor: "admin@rmvi.org",
        valid: true,
        status: "restorable",
        backupHash: "sha256:managed",
        recordDelta: 0,
        providerReference: "managed-provider-drill-001"
      }
    };
    const drill = await adapter.restoreDrill(seed);
    assert.equal(drill.status, "restorable");
    assert.equal(drill.valid, true);
    assert.equal(drill.checks.some((check) => check.name === "managed-restore" && check.ok), true);
  } finally {
    if (original === undefined) delete process.env.GCOS_MANAGED_RESTORE_DRILL;
    else process.env.GCOS_MANAGED_RESTORE_DRILL = original;
  }
});
