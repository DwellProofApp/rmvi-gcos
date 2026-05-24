import { execFileSync, spawn } from "node:child_process";

const service = process.env.GCOS_CLOUD_RUN_SERVICE ?? "rmvi-gcos-api";
const region = process.env.GCOS_CLOUD_RUN_REGION ?? "us-central1";
const project = process.env.GCOS_FIREBASE_PROJECT_ID ?? "rmvi-gcos";
const branch = process.env.GCOS_BUILD_BRANCH ?? readGit(["rev-parse", "--abbrev-ref", "HEAD"]) ?? "codex/gcos-account-request-flow";
const commit = process.env.GCOS_BUILD_COMMIT ?? readGit(["rev-parse", "--short", "HEAD"]);

if (!commit) {
  console.error("Unable to resolve the current Git commit. Set GCOS_BUILD_COMMIT and rerun.");
  process.exit(1);
}

if (!commandAvailable("gcloud")) {
  console.error("gcloud is not installed in this environment. Run this command from Google Cloud Shell.");
  process.exit(1);
}

const accounts = capture("gcloud", ["auth", "list", "--filter=status:ACTIVE", "--format=value(account)"]).trim();
if (!accounts) {
  console.error("No active gcloud account is selected. Run `gcloud auth login`, paste the verification code, then rerun `npm run cloudrun:align`.");
  process.exit(1);
}

console.log(`Active gcloud account: ${accounts.split("\n")[0]}`);
console.log(`Aligning ${service} in ${project}/${region} to ${commit} (${branch})...`);

await run("gcloud", [
  "run",
  "services",
  "update",
  service,
  "--project",
  project,
  "--region",
  region,
  "--update-env-vars",
  [
    `GCOS_BUILD_COMMIT=${commit}`,
    `GCOS_BUILD_BRANCH=${branch}`,
    "GCOS_MANAGED_RESTORE_DRILL=1"
  ].join(",")
]);

await run("npm", ["run", "deployment:align"], {
  GCOS_HEALTHCHECK_URL: process.env.GCOS_HEALTHCHECK_URL ?? "https://rmvi.org"
});

console.log(`Cloud Run API metadata aligned to ${commit}.`);

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
