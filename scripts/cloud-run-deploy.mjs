import { execFileSync, spawn } from "node:child_process";

const service = process.env.GCOS_CLOUD_RUN_SERVICE ?? "rmvi-gcos-api";
const region = process.env.GCOS_CLOUD_RUN_REGION ?? "us-central1";
const project = process.env.GCOS_FIREBASE_PROJECT_ID ?? "rmvi-gcos";
const branch = process.env.GCOS_BUILD_BRANCH ?? readGit(["rev-parse", "--abbrev-ref", "HEAD"]) ?? "main";
const commit = process.env.GCOS_BUILD_COMMIT ?? readGit(["rev-parse", "--short", "HEAD"]);

if (!commit) {
  console.error("Unable to resolve the current Git commit. Set GCOS_BUILD_COMMIT and rerun.");
  process.exit(1);
}

if (!commandAvailable("gcloud")) {
  console.error("gcloud is not installed in this environment. Run `npm run cloudrun:deploy` from Google Cloud Shell.");
  process.exit(1);
}

const activeAccount = capture("gcloud", ["auth", "list", "--filter=status:ACTIVE", "--format=value(account)"]).trim().split("\n")[0];
if (!activeAccount) {
  console.error("No active gcloud account is selected. Run `gcloud auth login`, then rerun `npm run cloudrun:deploy`.");
  process.exit(1);
}

console.log(`Active gcloud account: ${activeAccount}`);
console.log(`Deploying ${service} in ${project}/${region} from ${commit} (${branch})...`);

const existingEnv = readExistingCloudRunEnv();
const envVars = {
  NODE_ENV: "production",
  GCOS_DOMAIN: "rmvi.org",
  GCOS_DEPLOYMENT_TARGET: "firebase",
  GCOS_STORAGE_PROVIDER: "firestore",
  GCOS_FIREBASE_PROJECT_ID: project,
  GCOS_FIREBASE_NAMESPACE: process.env.GCOS_FIREBASE_NAMESPACE ?? "production",
  GCOS_AUTH_PROVIDER: process.env.GCOS_AUTH_PROVIDER ?? "firebase",
  GCOS_FIREBASE_WEB_API_KEY: process.env.GCOS_FIREBASE_WEB_API_KEY ?? existingEnv.GCOS_FIREBASE_WEB_API_KEY,
  GCOS_AUTH_FALLBACK_LOCAL: process.env.GCOS_AUTH_FALLBACK_LOCAL ?? existingEnv.GCOS_AUTH_FALLBACK_LOCAL ?? "0",
  GCOS_OBJECT_STORAGE_PROVIDER: "firebase-storage",
  GCOS_FIREBASE_STORAGE_BUCKET: process.env.GCOS_FIREBASE_STORAGE_BUCKET ?? "rmvi-gcos.firebasestorage.app",
  GCOS_EMAIL_PROVIDER: process.env.GCOS_EMAIL_PROVIDER ?? "resend",
  GCOS_EMAIL_FROM: process.env.GCOS_EMAIL_FROM ?? "churchmail@rmvi.org",
  GCOS_EMAIL_REPLY_TO: process.env.GCOS_EMAIL_REPLY_TO ?? existingEnv.GCOS_EMAIL_REPLY_TO ?? "admin@rmvi.org",
  GCOS_RESEND_API_KEY: process.env.GCOS_RESEND_API_KEY ?? existingEnv.GCOS_RESEND_API_KEY,
  GCOS_VIDEO_PROVIDER: process.env.GCOS_VIDEO_PROVIDER ?? "jitsi",
  GCOS_SERVE_WEB: "1",
  GCOS_ALLOWED_ORIGIN: "https://rmvi.org",
  GCOS_HEALTHCHECK_URL: "https://rmvi.org",
  GCOS_ENABLE_DEV_RESET: "0",
  GCOS_REQUIRE_API_AUTH: "1",
  GCOS_LOGIN_RATE_LIMIT: "8",
  GCOS_LOGIN_RATE_WINDOW_MS: "300000",
  GCOS_MUTATION_RATE_LIMIT: "2000",
  GCOS_MUTATION_RATE_WINDOW_MS: "60000",
  GCOS_BACKUP_RETENTION_DAYS: "365",
  GCOS_AUDIT_RETENTION_POLICY: "immutable",
  GCOS_INCIDENT_RESPONSE_OWNER: process.env.GCOS_INCIDENT_RESPONSE_OWNER ?? "admin@rmvi.org",
  GCOS_SUPPORT_CONTACT: process.env.GCOS_SUPPORT_CONTACT ?? "admin@rmvi.org",
  GCOS_MONITORING_MODE: "cloud-run-healthcheck",
  GCOS_MANAGED_RESTORE_DRILL: process.env.GCOS_MANAGED_RESTORE_DRILL ?? existingEnv.GCOS_MANAGED_RESTORE_DRILL ?? "0",
  GCOS_BUILD_COMMIT: commit,
  GCOS_BUILD_BRANCH: branch
};

await run("gcloud", [
  "run",
  "deploy",
  service,
  "--source",
  ".",
  "--project",
  project,
  "--region",
  region,
  "--allow-unauthenticated",
  "--set-env-vars",
  Object.entries(envVars).filter(([, value]) => value !== undefined && value !== "").map(([key, value]) => `${key}=${value}`).join(",")
]);

await run("npm", ["run", "deployment:align"], {
  GCOS_DOMAIN: "rmvi.org",
  GCOS_DEPLOYMENT_TARGET: "firebase"
});

console.log(`Cloud Run API deployed and aligned to ${commit}.`);

function readGit(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function commandAvailable(command) {
  try {
    execFileSync("which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function capture(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    return "";
  }
}

function readExistingCloudRunEnv() {
  const output = capture("gcloud", [
    "run",
    "services",
    "describe",
    service,
    "--project",
    project,
    "--region",
    region,
    "--format=json"
  ]);
  if (!output) return {};
  try {
    const serviceJson = JSON.parse(output);
    const env = serviceJson.spec?.template?.spec?.containers?.[0]?.env ?? [];
    return Object.fromEntries(env.filter((item) => item.name && "value" in item).map((item) => [item.name, item.value]));
  } catch {
    return {};
  }
}

function run(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: { ...process.env, ...extraEnv },
      shell: false,
      stdio: "inherit"
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}
