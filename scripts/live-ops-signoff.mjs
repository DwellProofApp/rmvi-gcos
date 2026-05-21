const baseUrl = (process.env.GCOS_HEALTHCHECK_URL ?? "https://rmvi.org").replace(/\/$/, "");
const email = process.env.GCOS_SMOKE_EMAIL ?? "admin@rmvi.org";
const password = process.env.GCOS_SMOKE_PASSWORD;
const restoreAttestation = process.env.GCOS_RESTORE_DRILL_ATTESTATION;
const providerReference = process.env.GCOS_RESTORE_DRILL_REFERENCE ?? `managed-restore-${new Date().toISOString().slice(0, 10)}`;

if (!password) {
  console.error("Set GCOS_SMOKE_PASSWORD to run live operations signoff.");
  process.exit(1);
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  email,
  steps: []
};

const login = await request("/api/auth/login", {
  method: "POST",
  body: { email, password }
});
const token = login.token;
record("login", Boolean(token), login.station?.email ?? "no station");

await step("persistence-backup", "/api/persistence/backup", {
  label: `live-signoff-${new Date().toISOString().replaceAll(":", "-")}`
});
await step("backup-manifest", "/api/persistence/backup-manifest");

const restoreBody = restoreAttestation === "MANAGED_RESTORE_CONFIRMED"
  ? {
      attestation: restoreAttestation,
      providerReference,
      evidence: process.env.GCOS_RESTORE_DRILL_EVIDENCE ?? "Managed provider restore drill completed and reviewed by launch administrator."
    }
  : {};
await step("restore-drill", "/api/persistence/restore-drill", restoreBody);
await step("persistence-verify", "/api/persistence/verify");
await step("operations-monitor", "/api/ops/monitor");
await step("launch-readiness", "/api/launch/readiness");
await step("deployment-plan", "/api/launch/deployment-plan");
await step("launch-signoff", "/api/launch/signoff");

const failed = report.steps.filter((item) => !item.ok);
for (const item of report.steps) {
  console.log(`${item.ok ? "✓" : "✕"} ${item.name}: ${item.summary}`);
}
console.log(`Live operations signoff status: ${failed.length ? "hold" : "recorded"}`);
if (failed.length) process.exitCode = 1;

async function step(name, path, body = {}) {
  try {
    const result = await request(path, { method: "POST", body, token });
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
  if (result.drill) return `${result.drill.status} / delta ${result.drill.recordDelta}`;
  if (result.manifest) return `${result.manifest.status} / ${result.manifest.total} backups`;
  if (result.backup) return result.backup.hash;
  if (result.monitor) return `${result.monitor.status} / score ${result.monitor.score}`;
  if (result.launch) return `${result.launch.status} / production ${result.launch.productionScore}%`;
  if (result.signoff) return `overall ${result.signoff.overallScore}%`;
  if (result.plan) return `${result.plan.status ?? "plan"} / ${result.plan.requiredSecrets?.length ?? 0} secrets`;
  if (result.verified) return `verified ${result.status?.hash ?? ""}`;
  return "ok";
}
