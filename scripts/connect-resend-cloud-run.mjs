import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const project = process.env.GCOS_FIREBASE_PROJECT_ID ?? "rmvi-gcos";
const service = process.env.GCOS_CLOUD_RUN_SERVICE ?? "rmvi-gcos-api";
const region = process.env.GCOS_CLOUD_RUN_REGION ?? "us-central1";
const provider = "resend";
const resendKey = process.env.GCOS_RESEND_API_KEY ?? "";
const from = process.env.GCOS_EMAIL_FROM ?? "churchmail@rmvi.org";
const replyTo = process.env.GCOS_EMAIL_REPLY_TO ?? "admin@rmvi.org";
const gcloud = existsSync(".tools/google-cloud-sdk/bin/gcloud") ? ".tools/google-cloud-sdk/bin/gcloud" : "gcloud";
const tokenPath = ".tools/firebase-access-token.txt";

if (!resendKey) {
  console.error("Missing GCOS_RESEND_API_KEY. Verify rmvi.org in Resend, then run:");
  console.error("GCOS_RESEND_API_KEY='re_...' npm run resend:connect");
  process.exit(1);
}

writeFirebaseAccessTokenIfAvailable();

const envVars = [
  `GCOS_EMAIL_PROVIDER=${provider}`,
  `GCOS_RESEND_API_KEY=${resendKey}`,
  `GCOS_EMAIL_FROM=${from}`,
  `GCOS_EMAIL_REPLY_TO=${replyTo}`
].join(",");

const args = [
  "run",
  "services",
  "update",
  service,
  "--region",
  region,
  "--project",
  project,
  "--update-env-vars",
  envVars,
  "--quiet"
];

if (existsSync(tokenPath)) args.push("--access-token-file", tokenPath);

console.log(`Connecting RMVI GCOS ChurchMail to Resend for ${service} in ${project}/${region}.`);
console.log(`Sender: ${from}`);
const result = spawnSync(gcloud, args, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
cleanupToken();

if (result.status !== 0) {
  console.error(redact(result.stderr || result.stdout));
  process.exit(result.status ?? 1);
}

console.log(redact(result.stdout));
console.log("Resend is connected. Next: sign in as admin and run the ChurchMail test from Audit > Service Connections.");

function writeFirebaseAccessTokenIfAvailable() {
  if (process.env.GCLOUD_ACCESS_TOKEN_FILE) return;
  const configPath = join(homedir(), ".config/configstore/firebase-tools.json");
  if (!existsSync(configPath)) return;
  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    const token = config.tokens?.access_token;
    if (token) writeFileSync(tokenPath, token);
  } catch {
    // gcloud can still use an existing login; keep the helper non-invasive.
  }
}

function cleanupToken() {
  if (existsSync(tokenPath)) rmSync(tokenPath, { force: true });
}

function redact(value) {
  return String(value ?? "").replaceAll(resendKey, "[GCOS_RESEND_API_KEY]");
}
