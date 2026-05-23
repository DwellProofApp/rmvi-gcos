import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const args = new Set(process.argv.slice(2));
const live = args.has("--live");
const firebase = args.has("--firebase") || String(process.env.GCOS_DEPLOYMENT_TARGET ?? "").toLowerCase() === "firebase";
const strict = args.has("--strict") || live;
const defaultsFile = firebase ? ".env.firebase.example" : ".env.production.example";
const baseEnv = loadProductionDefaults(await readOptional(join(ROOT, defaultsFile)));
const env = { ...baseEnv, ...process.env };
const report = {
  generatedAt: new Date().toISOString(),
  mode: live ? "live" : "local-gate",
  deploymentTarget: firebase ? "firebase" : env.GCOS_DEPLOYMENT_TARGET || "replit",
  targetDomain: env.GCOS_DOMAIN || "rmvi.org",
  strict,
  checks: [],
  nextActions: []
};

await runStep("release-check", "npm", ["run", "release:check"], { required: true });
await runStep("enterprise-check", "npm", ["run", "enterprise:check"], { required: true });
await runStep("secrets-plan", "npm", ["run", "secrets:plan"], { required: false, env });
await runStep("build", "npm", ["run", "build"], { required: true });
await runStep("test", "npm", ["test"], { required: true });
await runStep("production-profile", "npm", ["run", "production:check"], { required: strict, env });

if (live) {
  await runStep("healthcheck", "npm", ["run", "healthcheck"], { required: true, env });
  await runStep("runtime-smoke", "npm", ["run", "runtime:smoke"], { required: true, env });
  await runStep("deployment-alignment", "npm", ["run", "deployment:align"], { required: true, env });
  await runStep("domain-check", "npm", ["run", "domain:check"], { required: true, env });
  await runStep("hosting-security-check", "npm", ["run", "hosting:security-check"], { required: true, env });
  if (firebase) {
    await runStep("firebase-domain-check", "npm", ["run", "firebase:domain-check"], { required: true, env });
  }
} else {
  report.nextActions.push("Run npm run runtime:smoke against the deployed service, then run npm run launch:verify:live from Replit after production secrets and rmvi.org DNS are active.");
}

const failed = report.checks.filter((check) => !check.ok && check.required);
if (failed.length) {
  report.status = "hold";
  report.nextActions.push(...failed.map((check) => check.fix ?? `Fix ${check.name}`));
} else {
  report.status = live ? "live-verified" : "local-release-ready";
  report.nextActions.push(live ? "Record launch signoff in the GCOS Audit workspace." : "Deploy to Replit and run the live verification command.");
}

await mkdir(REPORT_DIR, { recursive: true });
const reportPath = join(REPORT_DIR, `launch-verification-${new Date().toISOString().replaceAll(":", "-")}.json`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

for (const check of report.checks) {
  console.log(`${check.ok ? "✓" : "✕"} ${check.name}: ${check.summary}`);
}
console.log(`Launch verification report: ${reportPath}`);
console.log(`Launch verification status: ${report.status}`);

if (failed.length) process.exitCode = 1;

async function runStep(name, command, commandArgs, options) {
  const startedAt = new Date().toISOString();
  const result = await exec(command, commandArgs, { env: options.env });
  const check = {
    name,
    required: options.required,
    ok: result.code === 0,
    startedAt,
    finishedAt: new Date().toISOString(),
    command: [command, ...commandArgs].join(" "),
    summary: summarize(result),
    fix: fixFor(name, result),
    stdout: trimOutput(result.stdout),
    stderr: trimOutput(result.stderr)
  };
  report.checks.push(check);
  if (!check.ok && !check.required) {
    report.nextActions.push(check.fix ?? `${name} needs attention before public launch.`);
  }
}

function exec(command, commandArgs, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      cwd: ROOT,
      env: { ...process.env, ...(options.env ?? {}) },
      shell: false
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

function summarize(result) {
  const text = `${result.stdout}\n${result.stderr}`.trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.at(-1) ?? (result.code === 0 ? "passed" : "failed");
}

function fixFor(name, result) {
  if (name === "production-profile") {
    return firebase
      ? "Confirm Firebase production env matches .env.firebase.example, especially Firestore namespace and Firebase Storage bucket."
      : "Set the missing Replit secrets from .env.production.example, especially GCOS_DATABASE_URL and object vault settings.";
  }
  if (name === "healthcheck") return `Confirm the ${firebase ? "Firebase/Cloud Run" : "Replit"} deployment is running GCOS and GCOS_HEALTHCHECK_URL points to https://rmvi.org.`;
  if (name === "runtime-smoke") return "Set GCOS_SMOKE_EMAIL and GCOS_SMOKE_PASSWORD for a valid admin station and confirm protected APIs pass runtime smoke.";
  if (name === "deployment-alignment") return "Deploy Firebase Hosting and Cloud Run from the same Git commit, then rerun deployment alignment.";
  if (name === "domain-check") return `Confirm rmvi.org DNS points to the rmvi-gcos ${firebase ? "Firebase Hosting" : "Replit"} deployment and is no longer attached to another app.`;
  if (name === "hosting-security-check") return "Confirm hosting headers, app-shell cache policy, service worker cache policy, PWA manifest, and immutable asset caching are active.";
  if (name === "firebase-domain-check") return "Confirm Firebase Hosting DNS, ownership TXT, TLS certificate, web rewrites, and Cloud Run API rewrites are active for rmvi.org.";
  if (name === "build") return "Fix the frontend production build error.";
  if (name === "test") return "Fix failing API or storage tests before launch.";
  if (name === "release-check") return "Fix missing release artifacts before launch.";
  return result.code === 0 ? undefined : `Review ${name} output.`;
}

function trimOutput(output) {
  return output.trim().split("\n").slice(-40).join("\n");
}

function loadProductionDefaults(source) {
  const env = {};
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=");
    if (key === "GCOS_DATABASE_URL" && (process.env.DATABASE_URL || /USER:PASSWORD|HOST|DATABASE/.test(value))) continue;
    env[key] = value;
  }
  return env;
}

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}
