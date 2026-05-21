const databaseUrl = process.env.GCOS_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

if (!databaseUrl || /USER:PASSWORD|HOST|DATABASE/.test(databaseUrl)) {
  console.error("GCOS database smoke check blocked: set GCOS_DATABASE_URL or DATABASE_URL to a real managed Postgres connection string.");
  process.exit(1);
}

const { Pool } = await import("pg");
const pool = new Pool({
  connectionString: databaseUrl,
  max: Number(process.env.GCOS_DATABASE_POOL_SIZE ?? 2),
  ssl: process.env.GCOS_DATABASE_SSL === "1" ? { rejectUnauthorized: false } : undefined
});

const smokeId = `cli-smoke-${Date.now()}`;
let client;

try {
  client = await pool.connect();
  await client.query("create schema if not exists gcos_core");
  await client.query(`
    create table if not exists gcos_core.database_smoke_checks (
      id text primary key,
      actor text,
      payload jsonb not null,
      created_at timestamptz not null default now()
    )
  `);
  await client.query(
    `insert into gcos_core.database_smoke_checks (id, actor, payload)
     values ($1, $2, $3::jsonb)`,
    [smokeId, "database-smoke-check", JSON.stringify({ checkedAt: new Date().toISOString(), source: "cli" })]
  );
  const readBack = await client.query("select payload from gcos_core.database_smoke_checks where id = $1", [smokeId]);
  if (readBack.rowCount !== 1 || readBack.rows[0]?.payload?.source !== "cli") {
    throw new Error("smoke row was not readable after insert");
  }
  await client.query("delete from gcos_core.database_smoke_checks where id = $1", [smokeId]);
  const migrationRows = await client.query("select count(*)::int as count from information_schema.tables where table_schema = 'gcos_core'");
  console.log(`GCOS database smoke check passed. gcos_core tables visible: ${migrationRows.rows[0]?.count ?? 0}`);
} catch (error) {
  console.error(`GCOS database smoke check failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
