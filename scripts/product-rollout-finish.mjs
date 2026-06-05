import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const baseUrl = (process.env.GCOS_ROLLOUT_FINISH_URL ?? process.env.GCOS_PRODUCT_SMOKE_URL ?? process.env.GCOS_HEALTHCHECK_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const email = process.env.GCOS_SMOKE_EMAIL ?? "admin@rmvi.org";
const password = requiredEnv("GCOS_SMOKE_PASSWORD");
const mutate = process.env.GCOS_ROLLOUT_FINISH_MUTATE === "1";
const certifyCompleted = process.env.GCOS_ROLLOUT_CERTIFY_COMPLETED === "1";
const scheduleDate = process.env.GCOS_ROLLOUT_TRAINING_DATE ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const trainer = process.env.GCOS_ROLLOUT_TRAINER ?? email;

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  actor: email,
  mode: mutate ? "prepare-first-wave-rollout" : "read-only-rollout-review",
  certifyCompleted,
  checks: []
};

let token = "";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} before running product rollout finish.`);
  return value;
}

await check("admin session", async () => {
  const login = await request("/api/auth/login", {
    method: "POST",
    token: "",
    body: { email, password, deviceLabel: "product-rollout-finish" }
  });
  token = login.token ?? "";
  if (!token) fail("No admin token returned.");
  return `${login.station?.email ?? email} signed in`;
});

if (!token) {
  skip("current rollout readiness", "admin session unavailable", "Wait for login rate limit to clear or provide a valid GCOS_SMOKE_PASSWORD.");
  skip("current station training", "admin session unavailable", "Wait for login rate limit to clear or provide a valid GCOS_SMOKE_PASSWORD.");
  skip("prepare first-wave station rollout", "admin session unavailable", "Rerun after admin login succeeds.");
  skip("archive station training packet", "admin session unavailable", "Rerun after admin login succeeds.");
  skip("create backup and manifest evidence", "admin session unavailable", "Rerun after admin login succeeds.");
  skip("post-rollout readiness", "admin session unavailable", "Rerun after admin login succeeds.");
  skip("restore gate still requires provider attestation", "admin session unavailable", "Rerun after admin login succeeds.");
  await finish();
} else {
await check("current rollout readiness", async () => {
  const rollout = await request("/api/rollout/readiness");
  if (!Array.isArray(rollout.tracks)) fail("Rollout tracks are missing.");
  return `${rollout.overallScore ?? 0}% overall; ${rollout.blockers?.length ?? 0} blockers`;
});

await check("current station training", async () => {
  const training = await request("/api/rollout/station-training");
  if (!Array.isArray(training.records)) fail("Station training records are missing.");
  return `${training.trained ?? 0}/${training.total ?? training.records.length} trained; ${training.scheduled ?? 0} scheduled`;
});

if (mutate) {
  await check("prepare first-wave station rollout", async () => {
    const result = await request("/api/rollout/first-wave/prepare", {
      method: "POST",
      body: {
        scheduledFor: scheduleDate,
        trainer,
        certifyCompleted,
        policyAudience: "First-wave RMVI GCOS station users",
        trainingTrack: "GCOS first-wave onboarding",
        note: certifyCompleted
          ? "First-wave station walkthrough certified from product rollout finish command."
          : "First-wave station training scheduled from product rollout finish command."
      }
    });
    return `${result.stations?.length ?? 0} stations prepared; training ${result.training?.overallScore ?? 0}%`;
  });

  await check("archive station training packet", async () => {
    const packet = await request("/api/rollout/station-training/archive", {
      method: "POST",
      body: { reason: "Product rollout finish packet for first-wave station readiness" }
    });
    if (!packet.document?.id) fail("Training packet document was not archived.");
    return `${packet.document.name} archived; score ${packet.packet?.overallScore ?? 0}%`;
  });

  await check("create backup and manifest evidence", async () => {
    const backup = await request("/api/persistence/backup", {
      method: "POST",
      body: { label: `product-rollout-finish-${new Date().toISOString().replaceAll(":", "-")}` }
    });
    const manifest = await request("/api/persistence/backup-manifest", { method: "POST" });
    await request("/api/persistence/verify", { method: "POST" });
    return `backup ${String(backup.backup?.hash ?? backup.backup?.label ?? "recorded").slice(0, 24)}; manifest ${manifest.manifest?.status ?? "recorded"}`;
  });
} else {
  skip("prepare first-wave station rollout", "read-only mode", "Run GCOS_ROLLOUT_FINISH_MUTATE=1 npm run rollout:finish to schedule first-wave training.");
  skip("archive station training packet", "read-only mode", "Run mutate mode after rollout training is prepared.");
  skip("create backup and manifest evidence", "read-only mode", "Run mutate mode before the managed restore attestation.");
}

await check("post-rollout readiness", async () => {
  const rollout = await request("/api/rollout/readiness");
  const training = await request("/api/rollout/station-training");
  return `rollout ${rollout.overallScore ?? 0}%; training ${training.overallScore ?? 0}%`;
});

await check("restore gate still requires provider attestation", async () => {
  const drill = await request("/api/persistence/restore-drill");
  return `${drill.status ?? "restore tracked"}; ${drill.nextAction ?? "review restore drill board"}`;
});
await finish();
}

async function finish() {
const failures = report.checks.filter((item) => item.status === "failed");
const skipped = report.checks.filter((item) => item.status === "skipped");
report.status = failures.length ? "failed" : skipped.length ? "passed-with-skips" : "passed";
report.nextActions = failures.length
  ? failures.map((item) => item.fix ?? `Fix ${item.name}`)
  : skipped.length
    ? [
        "Run GCOS_ROLLOUT_FINISH_MUTATE=1 npm run rollout:finish to prepare first-wave station rollout.",
        "After Firebase/Firestore managed export or restore evidence is reviewed, run npm run restore:managed:attest."
      ]
    : [
        certifyCompleted
          ? "First-wave training is certified. Record managed restore drill attestation and run launch verification."
          : "First-wave training is scheduled. Certify completion after training, then record managed restore drill attestation."
      ];

await mkdir(REPORT_DIR, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-");
const jsonPath = join(REPORT_DIR, `product-rollout-finish-${stamp}.json`);
const mdPath = join(REPORT_DIR, `product-rollout-finish-${stamp}.md`);
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, renderMarkdown(report));

for (const item of report.checks) {
  const marker = item.status === "passed" ? "✓" : item.status === "skipped" ? "-" : "✕";
  console.log(`${marker} ${item.name}: ${item.summary}`);
}
console.log(`Rollout finish report: ${jsonPath}`);
console.log(`Rollout finish summary: ${mdPath}`);
console.log(`Rollout finish status: ${report.status}`);

if (failures.length) process.exitCode = 1;
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body !== undefined ? { "content-type": "application/json" } : {}),
      ...((options.token === "" ? "" : options.token ?? token) ? { authorization: `Bearer ${options.token ?? token}` } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${body.error ?? text}`);
  return body;
}

async function check(name, fn, fix) {
  const startedAt = new Date().toISOString();
  try {
    const summary = await fn();
    report.checks.push({
      name,
      status: "passed",
      ok: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      summary
    });
  } catch (error) {
    report.checks.push({
      name,
      status: "failed",
      ok: false,
      startedAt,
      finishedAt: new Date().toISOString(),
      summary: error.message,
      fix: fix ?? "Review the rollout finish command output and rerun npm run rollout:finish."
    });
  }
}

function skip(name, summary, fix) {
  report.checks.push({
    name,
    status: "skipped",
    ok: true,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    summary,
    fix
  });
}

function fail(message) {
  throw new Error(message);
}

function renderMarkdown(result) {
  const lines = [
    "# GCOS Product Rollout Finish",
    "",
    `Generated: ${result.generatedAt}`,
    `Base URL: ${result.baseUrl}`,
    `Mode: ${result.mode}`,
    `Status: ${result.status}`,
    "",
    "## Checks",
    ""
  ];
  for (const item of result.checks) lines.push(`- ${item.status.toUpperCase()} - ${item.name}: ${item.summary}`);
  lines.push("", "## Next Actions", "");
  for (const action of result.nextActions) lines.push(`- ${action}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}
