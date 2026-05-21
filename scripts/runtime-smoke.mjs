import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const baseUrl = (process.env.GCOS_SMOKE_URL ?? process.env.GCOS_HEALTHCHECK_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const email = process.env.GCOS_SMOKE_EMAIL ?? "admin@rmvi.org";
const password = process.env.GCOS_SMOKE_PASSWORD ?? "gcos-admin";
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  actor: email,
  checks: []
};

let token = "";

await check("health", "GET", "/health", undefined, async (response) => {
  const body = await response.json();
  return body.status === "ok" && body.service === "gcos-api";
});

await check("public-bootstrap", "GET", "/api/bootstrap/public", undefined, async (response) => {
  const body = await response.json();
  return Array.isArray(body.stations) && Array.isArray(body.reports) && Array.isArray(body.messages);
});

await check("status-public-safe", "GET", "/api/status", undefined, async (response) => {
  const body = await response.json();
  const productionAuth = body.limits?.requireApiAuth === true;
  return body.status === "ok" && body.service === "gcos-api" && (!productionAuth || !("sessions" in body));
});

await check("station-login", "POST", "/api/auth/login", {
  email,
  password,
  deviceLabel: "runtime-smoke"
}, async (response) => {
  const body = await response.json();
  token = body.token ?? "";
  return Boolean(token) && body.station?.email === email && body.permissions?.canApprove === true;
});

await check("protected-readiness", "GET", "/api/readiness", undefined, async (response) => {
  const body = await response.json();
  return ["ready", "attention"].includes(body.status) && Array.isArray(body.checks);
}, { token });

await check("protected-files", "GET", "/api/files", undefined, async (response) => {
  const body = await response.json();
  return Array.isArray(body);
}, { token });

await check("object-storage-smoke", "POST", "/api/files/object-smoke", {}, async (response) => {
  const body = await response.json();
  return body.smoke?.status === "passed" && body.smoke?.write === true && body.smoke?.read === true;
}, { token });

await check("launch-readiness", "GET", "/api/launch/readiness", undefined, async (response) => {
  const body = await response.json();
  return typeof body.mvpScore === "number" && typeof body.productionScore === "number";
}, { token });

await check("enterprise-completion", "GET", "/api/enterprise/completion", undefined, async (response) => {
  const body = await response.json();
  return Array.isArray(body.tracks) && typeof body.overallScore === "number";
}, { token });

await check("session-renew", "POST", "/api/sessions/renew", {}, async (response) => {
  const body = await response.json();
  return body.session?.email === email && Boolean(body.session?.expiresAt);
}, { token });

const failed = report.checks.filter((item) => !item.ok);
report.status = failed.length ? "failed" : "passed";
report.nextActions = failed.length
  ? failed.map((item) => item.fix ?? `Fix ${item.name}`)
  : ["Runtime smoke passed. Record launch signoff and keep this command in the deployment checklist."];

await mkdir(REPORT_DIR, { recursive: true });
const reportPath = join(REPORT_DIR, `runtime-smoke-${new Date().toISOString().replaceAll(":", "-")}.json`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

for (const item of report.checks) {
  console.log(`${item.ok ? "✓" : "✕"} ${item.name}: ${item.summary}`);
}
console.log(`Runtime smoke report: ${reportPath}`);
console.log(`Runtime smoke status: ${report.status}`);

if (failed.length) process.exitCode = 1;

async function check(name, method, path, body, verify, options = {}) {
  const startedAt = new Date().toISOString();
  try {
    const headers = {};
    if (body !== undefined) headers["content-type"] = "application/json";
    if (options.token) headers.authorization = `Bearer ${options.token}`;

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const ok = await verify(response);
    if (!ok) throw new Error("unexpected response body");
    report.checks.push({
      name,
      ok: true,
      method,
      path,
      startedAt,
      finishedAt: new Date().toISOString(),
      summary: "passed"
    });
  } catch (error) {
    report.checks.push({
      name,
      ok: false,
      method,
      path,
      startedAt,
      finishedAt: new Date().toISOString(),
      summary: error.message,
      fix: fixFor(name)
    });
  }
}

function fixFor(name) {
  if (name === "station-login") return "Set GCOS_SMOKE_EMAIL and GCOS_SMOKE_PASSWORD to a valid admin or approver station.";
  if (name === "object-storage-smoke") return "Fix the object vault or Cloudflare R2 secrets, then rerun npm run runtime:smoke.";
  if (name === "protected-readiness") return "Confirm GCOS_REQUIRE_API_AUTH and bearer sessions are working on the deployed API.";
  return `Confirm ${baseUrl} is serving the GCOS deployment and rerun npm run runtime:smoke.`;
}
