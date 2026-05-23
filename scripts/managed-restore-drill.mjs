import { mkdirSync, writeFileSync } from "node:fs";

const baseUrl = (process.env.GCOS_HEALTHCHECK_URL ?? "https://rmvi.org").replace(/\/$/, "");
const email = process.env.GCOS_SMOKE_EMAIL ?? "admin@rmvi.org";
const password = process.env.GCOS_SMOKE_PASSWORD;
const mode = process.argv.includes("--attest") ? "attest" : "prepare";
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  email,
  mode,
  steps: []
};

if (!password) {
  fail("Set GCOS_SMOKE_PASSWORD before running the managed restore drill helper.");
}

if (mode === "attest" && process.env.GCOS_RESTORE_DRILL_ATTESTATION !== "MANAGED_RESTORE_CONFIRMED") {
  fail("Attestation mode requires GCOS_RESTORE_DRILL_ATTESTATION=MANAGED_RESTORE_CONFIRMED after the provider restore/export test is complete.");
}

const login = await request("/api/auth/login", {
  method: "POST",
  body: { email, password }
});
const token = login.token;
record("admin-login", Boolean(token), login.station?.email ?? "no station");

await step("create-backup-record", "/api/persistence/backup", {
  label: `managed-restore-${new Date().toISOString().replaceAll(":", "-")}`
});
await step("record-backup-manifest", "/api/persistence/backup-manifest");
await step("verify-persistence-store", "/api/persistence/verify");

if (mode === "attest") {
  await step("record-managed-restore-attestation", "/api/persistence/restore-drill", {
    attestation: "MANAGED_RESTORE_CONFIRMED",
    providerReference: process.env.GCOS_RESTORE_DRILL_REFERENCE ?? `firebase-managed-restore-${new Date().toISOString().slice(0, 10)}`,
    evidence: process.env.GCOS_RESTORE_DRILL_EVIDENCE ?? "Firebase managed export/restore drill completed, record counts reviewed, and administrator approved evidence.",
    restoredAt: process.env.GCOS_RESTORE_DRILL_RESTORED_AT ?? new Date().toISOString()
  });
} else {
  await step("read-restore-drill-gate", "/api/persistence/restore-drill", null, "GET");
}

await step("refresh-launch-readiness", "/api/launch/readiness");
await step("refresh-operations-monitor", "/api/ops/monitor");

mkdirSync("launch-reports", { recursive: true });
const reportPath = `launch-reports/managed-restore-drill-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
writeFileSync(reportPath, JSON.stringify(report, null, 2));

const failed = report.steps.filter((item) => !item.ok);
for (const item of report.steps) {
  console.log(`${item.ok ? "✓" : "✕"} ${item.name}: ${item.summary}`);
}
console.log(`Managed restore drill helper: ${mode}${failed.length ? " hold" : " complete"}`);
console.log(`Report: ${reportPath}`);

if (mode === "prepare") {
  console.log("Next: run the Firebase/Firestore managed export or restore test, then rerun with --attest and the provider reference.");
}

if (failed.length) process.exitCode = 1;

async function step(name, path, body = {}, method = "POST") {
  try {
    const result = await request(path, { method, body, token });
    record(name, true, summarize(result));
  } catch (error) {
    record(name, false, error.message);
  }
}

function record(name, ok, summary) {
  report.steps.push({ name, ok, summary });
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { text };
    }
  }
  if (!response.ok) throw new Error(payload.error ?? `${response.status} ${response.statusText}`);
  return payload;
}

function summarize(result) {
  if (result.backup) return `backup ${String(result.backup.hash ?? result.backup.label ?? "").slice(0, 18)}`;
  if (result.manifest) return `${result.manifest.status} / ${result.manifest.total} backup records`;
  if (result.drill) return `${result.drill.status} / delta ${result.drill.recordDelta}`;
  if (result.status?.provider) return `${result.status.provider} / ${result.status.backupStatus ?? "verified"}`;
  if (result.launch) return `${result.launch.status} / production ${result.launch.productionScore}%`;
  if (result.monitor) return `${result.monitor.status} / score ${result.monitor.score}`;
  if (result.verified) return "store verified";
  return "ok";
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
