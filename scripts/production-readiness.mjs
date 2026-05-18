const required = [
  ["NODE_ENV", (value) => value === "production", "set NODE_ENV=production"],
  ["GCOS_DOMAIN", (value) => value === "rmvi.org", "set GCOS_DOMAIN=rmvi.org"],
  ["GCOS_DEPLOYMENT_TARGET", Boolean, "set GCOS_DEPLOYMENT_TARGET=replit"],
  ["GCOS_SERVE_WEB", (value) => value === "1", "set GCOS_SERVE_WEB=1"],
  ["GCOS_ALLOWED_ORIGIN", (value) => value === "https://rmvi.org", "set GCOS_ALLOWED_ORIGIN=https://rmvi.org"],
  ["GCOS_HEALTHCHECK_URL", (value) => value === "https://rmvi.org", "set GCOS_HEALTHCHECK_URL=https://rmvi.org"],
  ["GCOS_ENABLE_DEV_RESET", (value) => value === "0", "set GCOS_ENABLE_DEV_RESET=0"],
  ["GCOS_STORAGE_PROVIDER", (value) => value === "database", "set GCOS_STORAGE_PROVIDER=database"],
  ["GCOS_DATABASE_URL", (value) => Boolean(value) && !/USER:PASSWORD|HOST|DATABASE/.test(value), "set a real managed Postgres URL"],
  ["GCOS_DATABASE_SSL", (value) => value === "1", "set GCOS_DATABASE_SSL=1"],
  ["GCOS_DATABASE_POOL_SIZE", (value) => Number(value) >= 2, "set GCOS_DATABASE_POOL_SIZE to at least 2"],
  ["GCOS_OBJECT_VAULT_PATH", Boolean, "set a persistent object vault path"],
  ["GCOS_LOGIN_RATE_LIMIT", (value) => Number(value) >= 5, "set GCOS_LOGIN_RATE_LIMIT to at least 5"],
  ["GCOS_LOGIN_RATE_WINDOW_MS", (value) => Number(value) >= 60000, "set GCOS_LOGIN_RATE_WINDOW_MS to at least 60000"],
  ["GCOS_MUTATION_RATE_LIMIT", (value) => Number(value) >= 100, "set GCOS_MUTATION_RATE_LIMIT to at least 100"],
  ["GCOS_MUTATION_RATE_WINDOW_MS", (value) => Number(value) >= 60000, "set GCOS_MUTATION_RATE_WINDOW_MS to at least 60000"]
];

const results = required.map(([name, verify, fix]) => {
  const value = process.env[name] ?? "";
  return { name, ok: Boolean(verify(value)), value: redact(name, value), fix };
});

for (const result of results) {
  const mark = result.ok ? "✓" : "✕";
  console.log(`${mark} ${result.name}: ${result.value || "not set"}`);
  if (!result.ok) console.log(`  ${result.fix}`);
}

const score = Math.round((results.filter((item) => item.ok).length / results.length) * 100);
console.log(`Production readiness profile: ${score}%`);
if (score < 90) process.exitCode = 1;

function redact(name, value) {
  if (name.includes("DATABASE_URL") && value) return value.replace(/:\/\/([^:@/]+):([^@/]+)@/, "://$1:***@");
  return value;
}
