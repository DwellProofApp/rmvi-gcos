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

  const plan = adapter.migrationPlan(seed);
  assert.equal(plan.collections.some((item) => item.collection === "stations" && item.targetTable === "gcos_stations"), true);
  assert.equal(plan.blockers.includes("Set GCOS_DATABASE_URL before using database provider"), true);

  const dryRun = adapter.importDryRun(seed);
  assert.equal(dryRun.valid, false);
  assert.equal(dryRun.batches.some((batch) => batch.table === "gcos_stations" && batch.status === "blocked"), true);
});
