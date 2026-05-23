import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "launch-reports");
const deploymentTarget = String(process.env.GCOS_DEPLOYMENT_TARGET ?? "").toLowerCase();
const TEMPLATE_PATH = join(ROOT, deploymentTarget === "firebase" ? ".env.firebase.example" : ".env.production.example");
const generatedAt = new Date().toISOString();
const template = await readFile(TEMPLATE_PATH, "utf8");
const entries = parseEnv(template).map((entry) => {
  const alternateDatabaseUrl = entry.name === "GCOS_DATABASE_URL" ? process.env.DATABASE_URL ?? "" : "";
  const actual = process.env[entry.name] ?? alternateDatabaseUrl;
  const source = process.env[entry.name] ? "environment" : alternateDatabaseUrl ? "DATABASE_URL" : "template";
  const value = actual || entry.value;
  const placeholder = isPlaceholder(entry.name, value);
  const sensitive = entry.name.includes("URL") || entry.name.includes("PASSWORD") || entry.name.includes("SECRET") || entry.name.includes("KEY");
  return {
    ...entry,
    source,
    required: isRequired(entry.name),
    sensitive,
    placeholder,
    ready: Boolean(value) && !placeholder,
    displayValue: sensitive ? redact(value, source) : value
  };
});

const required = entries.filter((entry) => entry.required);
const missing = required.filter((entry) => !entry.ready);
const report = {
  generatedAt,
  deploymentTarget: valueOf("GCOS_DEPLOYMENT_TARGET") || deploymentTarget || "replit",
  storageProvider: valueOf("GCOS_STORAGE_PROVIDER") || "json",
  objectStorageProvider: valueOf("GCOS_OBJECT_STORAGE_PROVIDER") || "filesystem",
  targetDomain: valueOf("GCOS_DOMAIN") || "rmvi.org",
  status: missing.length ? "secrets-pending" : "secrets-ready",
  required: required.length,
  ready: required.length - missing.length,
  missing: missing.map((entry) => entry.name),
  entries
};

await mkdir(OUT_DIR, { recursive: true });
const jsonPath = join(OUT_DIR, "production-secrets-plan.json");
const mdPath = join(OUT_DIR, "production-secrets-plan.md");
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, renderMarkdown(report));

for (const entry of entries) {
  const mark = entry.ready || !entry.required ? "✓" : "✕";
  const suffix = entry.required ? "" : " optional";
  console.log(`${mark} ${entry.name}${suffix}: ${entry.displayValue || "blank"}`);
}
console.log(`Production secrets plan: ${mdPath}`);
console.log(`Production secrets status: ${report.status} (${report.ready}/${report.required} required ready)`);
if (missing.length) {
  console.log(`Next: set ${missing.slice(0, 5).map((entry) => entry.name).join(", ")} in ${report.deploymentTarget === "firebase" ? "Cloud Run/Firebase environment variables" : "Replit Secrets"}.`);
}

function parseEnv(source) {
  return source.split("\n").flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return [];
    const [name, ...rest] = trimmed.split("=");
    return [{ name, value: rest.join("=") }];
  });
}

function isPlaceholder(name, value) {
  if (!value) return true;
  if (name === "GCOS_DATABASE_URL") return /USER:PASSWORD|HOST|DATABASE|<managed postgres/i.test(value);
  if (name === "GCOS_OBJECT_VAULT_PATH") return /<persistent/i.test(value);
  return false;
}

function isRequired(name) {
  if (["VITE_GCOS_API_BASE", "GCOS_API_PORT", "GCOS_DATA_PATH", "GCOS_OBJECT_VAULT_PATH"].includes(name)) return false;
  const recordStorageProvider = String(process.env.GCOS_STORAGE_PROVIDER ?? valueFromTemplate("GCOS_STORAGE_PROVIDER") ?? "json").toLowerCase();
  const objectStorageProvider = String(process.env.GCOS_OBJECT_STORAGE_PROVIDER ?? valueFromTemplate("GCOS_OBJECT_STORAGE_PROVIDER") ?? "filesystem").toLowerCase();
  if (["GCOS_DATABASE_URL", "GCOS_DATABASE_SSL", "GCOS_DATABASE_POOL_SIZE"].includes(name)) return recordStorageProvider === "database";
  if (["GCOS_FIREBASE_PROJECT_ID", "GCOS_FIREBASE_NAMESPACE"].includes(name)) return ["firestore", "firebase"].includes(recordStorageProvider);
  if (name.startsWith("GCOS_R2_")) return objectStorageProvider.includes("r2");
  if (["GCOS_S3_BUCKET", "GCOS_AWS_REGION"].includes(name)) return objectStorageProvider.includes("s3");
  if (name === "GCOS_FIREBASE_STORAGE_BUCKET") return objectStorageProvider.includes("firebase") || objectStorageProvider.includes("google") || objectStorageProvider === "gcs";
  return true;
}

function valueFromTemplate(name) {
  for (const line of template.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key === name) return rest.join("=");
  }
  return "";
}

function redact(value, source = "") {
  if (!value) return "";
  if (/^[A-Za-z0-9_-]{16,}$/.test(value) && !value.includes("://")) return "configured";
  const redacted = value.replace(/:\/\/([^:@/]+):([^@/]+)@/, "://$1:***@");
  return source === "DATABASE_URL" ? `${redacted} via DATABASE_URL` : redacted;
}

function valueOf(name) {
  return entries.find((entry) => entry.name === name)?.displayValue ?? "";
}

function renderMarkdown(plan) {
  const rows = plan.entries.map((entry) => `| ${entry.ready || !entry.required ? "Ready" : "Needed"} | ${entry.name} | ${entry.required ? "Yes" : "No"} | ${entry.source} | \`${entry.displayValue || ""}\` |`);
  return `# RMVI GCOS Production Secrets Plan

Generated: ${plan.generatedAt}

Deployment target: \`${plan.deploymentTarget}\`

Record storage: \`${plan.storageProvider}\`

Object storage: \`${plan.objectStorageProvider}\`

Target domain: \`${plan.targetDomain}\`

Status: \`${plan.status}\`

Required ready: ${plan.ready}/${plan.required}

## Replit Secret Checklist

| Status | Name | Required | Source | Value |
| --- | --- | --- | --- | --- |
${rows.join("\n")}

## Next Actions

${plan.missing.length ? plan.missing.map((name) => `- Set \`${name}\` in ${plan.deploymentTarget === "firebase" ? "Cloud Run/Firebase environment variables" : "Replit Secrets"}.`).join("\n") : "- All required secrets are ready for live verification."}

After the required values are ready, run:

\`\`\`bash
npm run launch:verify:live
\`\`\`
`;
}
