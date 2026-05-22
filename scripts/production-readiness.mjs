import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const productionDefaults = loadProductionDefaults(await readOptional(join(ROOT, ".env.production.example")));
const firebaseDefaults = loadProductionDefaults(await readOptional(join(ROOT, ".env.firebase.example")));
const defaults = { ...productionDefaults, ...firebaseDefaults };
const env = { ...defaults, ...process.env };
const databaseUrl = env.GCOS_DATABASE_URL ?? env.DATABASE_URL ?? "";
const databaseUrlSource = process.env.GCOS_DATABASE_URL ? "GCOS_DATABASE_URL" : process.env.DATABASE_URL ? "DATABASE_URL" : "";
const objectStorageProvider = String(env.GCOS_OBJECT_STORAGE_PROVIDER ?? "filesystem").toLowerCase();
const recordStorageProvider = String(env.GCOS_STORAGE_PROVIDER ?? "json").toLowerCase();

const required = [
  ["NODE_ENV", (value) => value === "production", "set NODE_ENV=production"],
  ["GCOS_DOMAIN", (value) => value === "rmvi.org", "set GCOS_DOMAIN=rmvi.org"],
  ["GCOS_DEPLOYMENT_TARGET", Boolean, "set GCOS_DEPLOYMENT_TARGET=replit"],
  ["GCOS_SERVE_WEB", (value) => value === "1", "set GCOS_SERVE_WEB=1"],
  ["GCOS_ALLOWED_ORIGIN", (value) => value === "https://rmvi.org", "set GCOS_ALLOWED_ORIGIN=https://rmvi.org"],
  ["GCOS_HEALTHCHECK_URL", (value) => value === "https://rmvi.org", "set GCOS_HEALTHCHECK_URL=https://rmvi.org"],
  ["GCOS_ENABLE_DEV_RESET", (value) => value === "0", "set GCOS_ENABLE_DEV_RESET=0"],
  ["GCOS_REQUIRE_API_AUTH", (value) => value === "1", "set GCOS_REQUIRE_API_AUTH=1"],
  ["GCOS_STORAGE_PROVIDER", (value) => ["database", "firestore", "firebase"].includes(String(value).toLowerCase()), "set GCOS_STORAGE_PROVIDER=firestore for Firebase or database for managed Postgres"],
  ["GCOS_DATABASE_URL", () => recordStorageProvider !== "database" || (Boolean(databaseUrl) && !/USER:PASSWORD|HOST|DATABASE/.test(databaseUrl)), "set a real managed Postgres URL in GCOS_DATABASE_URL or DATABASE_URL"],
  ["GCOS_DATABASE_SSL", (value) => recordStorageProvider !== "database" || value === "1", "set GCOS_DATABASE_SSL=1 for Postgres"],
  ["GCOS_DATABASE_POOL_SIZE", (value) => recordStorageProvider !== "database" || Number(value) >= 2, "set GCOS_DATABASE_POOL_SIZE to at least 2 for Postgres"],
  ["GCOS_FIREBASE_PROJECT_ID", (value) => !["firestore", "firebase"].includes(recordStorageProvider) || Boolean(value || env.GOOGLE_CLOUD_PROJECT), "set GCOS_FIREBASE_PROJECT_ID for Firestore"],
  ["GCOS_FIREBASE_NAMESPACE", (value) => !["firestore", "firebase"].includes(recordStorageProvider) || Boolean(value), "set GCOS_FIREBASE_NAMESPACE=production"],
  ["GCOS_OBJECT_STORAGE_PROVIDER", (value) => ["filesystem", "r2", "cloudflare-r2", "s3", "aws-s3", "firebase-storage", "google-cloud-storage", "gcs"].includes(String(value).toLowerCase()), "set GCOS_OBJECT_STORAGE_PROVIDER=firebase-storage, cloudflare-r2, or aws-s3 for durable object storage"],
  ["GCOS_OBJECT_VAULT_PATH", (value) => objectStorageProvider.includes("r2") || objectStorageProvider.includes("s3") || objectStorageProvider.includes("firebase") || objectStorageProvider.includes("google") || objectStorageProvider === "gcs" || Boolean(value), "set a persistent object vault path"],
  ["GCOS_R2_ACCOUNT_ID", (value) => !objectStorageProvider.includes("r2") || Boolean(value), "set GCOS_R2_ACCOUNT_ID for Cloudflare R2"],
  ["GCOS_R2_BUCKET", (value) => !objectStorageProvider.includes("r2") || Boolean(value), "set GCOS_R2_BUCKET for Cloudflare R2"],
  ["GCOS_R2_ACCESS_KEY_ID", (value) => !objectStorageProvider.includes("r2") || Boolean(value), "set GCOS_R2_ACCESS_KEY_ID for Cloudflare R2"],
  ["GCOS_R2_SECRET_ACCESS_KEY", (value) => !objectStorageProvider.includes("r2") || Boolean(value), "set GCOS_R2_SECRET_ACCESS_KEY for Cloudflare R2"],
  ["GCOS_S3_BUCKET", (value) => !objectStorageProvider.includes("s3") || Boolean(value), "set GCOS_S3_BUCKET for AWS S3"],
  ["GCOS_AWS_REGION", (value) => !objectStorageProvider.includes("s3") || Boolean(value || env.AWS_REGION), "set GCOS_AWS_REGION or AWS_REGION for AWS S3"],
  ["GCOS_FIREBASE_STORAGE_BUCKET", (value) => !(objectStorageProvider.includes("firebase") || objectStorageProvider.includes("google") || objectStorageProvider === "gcs") || Boolean(value || env.FIREBASE_STORAGE_BUCKET), "set GCOS_FIREBASE_STORAGE_BUCKET for Firebase Storage"],
  ["GCOS_LOGIN_RATE_LIMIT", (value) => Number(value) >= 5, "set GCOS_LOGIN_RATE_LIMIT to at least 5"],
  ["GCOS_LOGIN_RATE_WINDOW_MS", (value) => Number(value) >= 60000, "set GCOS_LOGIN_RATE_WINDOW_MS to at least 60000"],
  ["GCOS_MUTATION_RATE_LIMIT", (value) => Number(value) >= 100, "set GCOS_MUTATION_RATE_LIMIT to at least 100"],
  ["GCOS_MUTATION_RATE_WINDOW_MS", (value) => Number(value) >= 60000, "set GCOS_MUTATION_RATE_WINDOW_MS to at least 60000"],
  ["GCOS_BACKUP_RETENTION_DAYS", (value) => Number(value) >= 30, "set GCOS_BACKUP_RETENTION_DAYS to at least 30"],
  ["GCOS_AUDIT_RETENTION_POLICY", (value) => String(value).toLowerCase() === "immutable", "set GCOS_AUDIT_RETENTION_POLICY=immutable"],
  ["GCOS_INCIDENT_RESPONSE_OWNER", (value) => /@rmvi\.org$/i.test(String(value)), "set GCOS_INCIDENT_RESPONSE_OWNER to an RMVI address"],
  ["GCOS_SUPPORT_CONTACT", (value) => /@rmvi\.org$/i.test(String(value)), "set GCOS_SUPPORT_CONTACT to an RMVI address"],
  ["GCOS_MONITORING_MODE", (value) => ["cloud-run-healthcheck", "firebase-healthcheck", "managed"].includes(String(value).toLowerCase()), "set GCOS_MONITORING_MODE=cloud-run-healthcheck"],
  ["GCOS_MANAGED_RESTORE_DRILL", (value) => value === "1", "set GCOS_MANAGED_RESTORE_DRILL=1 after a managed restore drill"]
];

const results = required.map(([name, verify, fix]) => {
  const value = name === "GCOS_DATABASE_URL" ? databaseUrl : env[name] ?? "";
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
  if (name.includes("DATABASE_URL") && value) {
    const redacted = value.replace(/:\/\/([^:@/]+):([^@/]+)@/, "://$1:***@");
    return databaseUrlSource === "DATABASE_URL" ? `${redacted} via DATABASE_URL` : redacted;
  }
  return value;
}

function loadProductionDefaults(source) {
  const parsed = {};
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=");
    if (key === "GCOS_DATABASE_URL" && (process.env.DATABASE_URL || /USER:PASSWORD|HOST|DATABASE/.test(value))) continue;
    parsed[key] = value;
  }
  return parsed;
}

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}
