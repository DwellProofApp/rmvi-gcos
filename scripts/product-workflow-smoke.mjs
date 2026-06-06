import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const baseUrl = (process.env.GCOS_PRODUCT_SMOKE_URL ?? process.env.GCOS_SMOKE_URL ?? process.env.GCOS_HEALTHCHECK_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const mutate = process.env.GCOS_PRODUCT_SMOKE_MUTATE === "1";
const liveEmailTest = process.env.GCOS_PRODUCT_SMOKE_EMAIL_TEST === "1";
const email = process.env.GCOS_SMOKE_EMAIL ?? "admin@rmvi.org";
const password = requiredEnv("GCOS_SMOKE_PASSWORD");
const requestTimeoutMs = Number(process.env.GCOS_PRODUCT_SMOKE_TIMEOUT_MS ?? 30000);
const stationLogins = [
  ["finance@rmvi.org", requiredEnv("GCOS_FINANCE_SMOKE_PASSWORD")],
  ["audit@rmvi.org", requiredEnv("GCOS_AUDIT_SMOKE_PASSWORD")],
  ["mission@rmvi.org", requiredEnv("GCOS_MISSION_SMOKE_PASSWORD")],
  ["np@rmvi.org", requiredEnv("GCOS_NATIONAL_SMOKE_PASSWORD")],
  ["local_branch_017@rmvi.org", requiredEnv("GCOS_LOCAL_SMOKE_PASSWORD")]
];

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  actor: email,
  mode: mutate ? "mutating-product-workflow" : "read-only-product-gate",
  liveEmailTest,
  checks: []
};

let adminToken = "";
let publicStatus = null;
const stationTokens = new Map();
const smokeId = `product-smoke-${Date.now().toString(36)}`;
const isLocalTarget = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(baseUrl);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} before running product workflow smoke.`);
  return value;
}

await check("01 platform and storage are reachable", async () => {
  const health = await request("/health", { token: "" });
  const status = await request("/api/status", { token: "" });
  publicStatus = status;
  const recordStorage = status.storageProvider ?? status.persistenceStatus?.provider ?? status.storageProfile?.records?.provider;
  return [
    health.status === "ok",
    status.status === "ok",
    status.service === "gcos-api",
    status.deployment?.app === "rmvi-gcos",
    recordStorage
  ].every(Boolean)
    ? `API ok; storage ${recordStorage}`
    : fail("GCOS API or storage status did not report ready.");
});

await check("02 admin authentication works", async () => {
  const login = await request("/api/auth/login", {
    method: "POST",
    token: "",
    body: { email, password, deviceLabel: "product-workflow-smoke" }
  });
  adminToken = login.token ?? "";
  if (!adminToken || login.station?.email !== email) fail("Admin login did not return a valid session token.");
  return `${login.station.title ?? "Admin station"} signed in`;
}, "Set GCOS_SMOKE_EMAIL and GCOS_SMOKE_PASSWORD to a valid administrator station.");

await check("03 protected APIs reject anonymous access", async () => {
  if (publicStatus?.limits?.requireApiAuth === false && isLocalTarget) {
    return "local development API allows public reads; production gate remains covered by runtime smoke";
  }
  const response = await raw("/api/readiness", { token: "", allowStatus: [401, 403] });
  if (![401, 403].includes(response.status)) fail(`Expected 401/403, received ${response.status}.`);
  return "protected readiness endpoint requires a bearer session";
});

await check("04 station sign-ins work", async () => {
  const signedIn = [];
  for (const [stationEmail, stationPassword] of stationLogins) {
    const login = await request("/api/auth/login", {
      method: "POST",
      token: "",
      body: { email: stationEmail, password: stationPassword, deviceLabel: "product-workflow-smoke" }
    });
    if (!login.token || login.station?.email !== stationEmail) fail(`${stationEmail} did not return a valid token.`);
    stationTokens.set(stationEmail, login.token);
    signedIn.push(stationEmail);
  }
  return `${signedIn.length} role-based stations signed in`;
}, "Confirm first-wave station credentials are active and rerun the product smoke.");

await check("05 role restrictions are enforced", async () => {
  const localToken = stationTokens.get("local_branch_017@rmvi.org");
  if (!localToken) fail("Local branch station token was not available.");
  const response = await raw("/api/offices", {
    method: "POST",
    token: localToken,
    body: {
      name: `Unauthorized Office ${smokeId}`,
      email: `${smokeId}@rmvi.org`,
      level: "Local Branch",
      department: "Smoke Test",
      supervisor: "International HQ",
      password: "not-used"
    },
    allowStatus: [401, 403]
  });
  if (![401, 403].includes(response.status)) fail(`Expected office creation denial for local branch, received ${response.status}.`);
  return "local branch cannot create organization nodes";
});

await check("06 integration readiness is visible", async () => {
  const readiness = await request("/api/integrations/readiness");
  const durableStorage = readiness.checks?.find((item) => item.name === "Durable record storage");
  if (!isLocalTarget && durableStorage && !durableStorage.ok) fail(durableStorage.detail ?? "Durable record storage is not configured.");
  if (!Array.isArray(readiness.checks) || !readiness.email || !readiness.video) fail("Integration readiness did not return provider checks.");
  const emailMode = readiness.email?.deliveryMode ?? readiness.email?.provider ?? "unknown";
  const videoMode = readiness.video?.provider ?? "unknown";
  return `provider checks visible; email ${emailMode}; video ${videoMode}`;
}, "Connect Firebase/Firestore, Resend, and video provider settings, then rerun the product smoke.");

await check("07 ChurchMail email activation is live or explicitly tracked", async () => {
  const activation = await request("/api/integrations/email/activation");
  if (!activation.ready && activation.provider !== "log") fail("Email activation is not live and not in local log mode.");
  return `${activation.status ?? "email status"}; provider ${activation.provider ?? "unknown"}; score ${activation.score ?? 0}%`;
}, "Verify rmvi.org in Resend, set GCOS_RESEND_API_KEY, and send a delivery test.");

if (liveEmailTest) {
  await check("08 live ChurchMail email delivery test", async () => {
    const result = await request("/api/integrations/email/test", {
      method: "POST",
      body: { to: process.env.GCOS_PRODUCT_SMOKE_EMAIL_TO ?? "admin@rmvi.org", reason: "product-workflow-smoke" }
    });
    if (!result.ok) fail("Email delivery test failed.");
    return `test message accepted by ${result.provider ?? "email provider"}`;
  }, "Fix Resend API key, sender, and DNS records, then rerun with GCOS_PRODUCT_SMOKE_EMAIL_TEST=1.");
} else {
  skip("08 live ChurchMail email delivery test", "skipped by default to avoid sending real email", "Run with GCOS_PRODUCT_SMOKE_EMAIL_TEST=1 after confirming the destination inbox.");
}

if (mutate) {
  await check("09 ChurchMail send, route, approve, archive", async () => {
    const message = await request("/api/messages", {
      method: "POST",
      body: {
        subject: `Product smoke directive ${smokeId}`,
        kind: "Directive",
        from: email,
        to: "National Presidency Workstation",
        classification: "Internal",
        message: "Product smoke verifies ChurchMail routing, approval, and archive behavior.",
        status: "Ready",
        files: "No attachments",
        priority: "Medium"
      }
    });
    const routed = await request(`/api/messages/${message.id}/route`, { method: "POST", body: { route: "International HQ -> National HQ", actor: email } });
    await request(`/api/messages/${message.id}/approve`, { method: "POST", body: { actor: email, result: "Approved during product smoke" } });
    const archived = await request(`/api/messages/${message.id}/archive`, { method: "POST", body: { actor: email, reason: "Product smoke complete" } });
    if (!message.id || !routed.id || !archived.status) fail("ChurchMail workflow did not return expected records.");
    return `message ${message.id} routed and archived`;
  });

  await check("10 report submit, verify, packet, archive", async () => {
    const created = await request("/api/reports", {
      method: "POST",
      body: {
        name: `Product smoke report ${smokeId}`,
        category: "Administrative",
        owner: "System Administrator Workstation",
        state: "Ready",
        path: "Local Branch -> Area Office -> District HQ",
        due: "Today",
        score: 35,
        evidenceStatus: "Evidence attached",
        preparedBy: email,
        attestation: "Product smoke report attestation."
      }
    });
    await request(`/api/reports/${created.id}/details`, { method: "POST", body: { reportFields: { summary: "Product smoke report details recorded." }, note: "Product smoke report details recorded." } });
    await request(`/api/reports/${created.id}/submit`, { method: "POST", body: { actor: email, destination: "Area Office" } });
    await request(`/api/reports/${created.id}/verify`, { method: "POST", body: { actor: email, result: "Verified during product smoke" } });
    const packet = await request(`/api/reports/${created.id}/packet`, { method: "POST", body: { approvalRequest: `Product smoke report packet ${smokeId}` } });
    await request(`/api/reports/${created.id}/archive`, { method: "POST", body: { actor: email, reason: "Product smoke complete" } });
    if (!created.id || !packet.document?.id) fail("Report workflow did not return report and packet IDs.");
    return `report ${created.id} submitted, verified, and packeted`;
  });

  await check("11 approval create, sign, approve, execute, archive", async () => {
    const approval = await request("/api/approvals", {
      method: "POST",
      body: {
        request: `Product smoke approval ${smokeId}`,
        route: "District -> County -> National",
        limit: "$1,250",
        state: "Validation",
        authority: "District Finance",
        signatures: "0/3"
      }
    });
    await request(`/api/approvals/${approval.id}/sign`, { method: "POST", body: { actor: email, signature: "Product smoke signature" } });
    await request(`/api/approvals/${approval.id}/approve`, { method: "POST", body: { actor: email, result: "Approved during product smoke" } });
    const executed = await request(`/api/approvals/${approval.id}/execute`, { method: "POST", body: { result: "Executed during product smoke" } });
    await request(`/api/approvals/${approval.id}/archive`, { method: "POST", body: { actor: email, reason: "Product smoke complete" } });
    if (!approval.id || !executed.document?.id) fail("Approval workflow did not execute.");
    return `approval ${approval.id} signed, approved, and executed`;
  });

  await check("12 archive evidence verification", async () => {
    const document = await request("/api/documents", {
      method: "POST",
      body: {
        name: `Product smoke evidence ${smokeId}`,
        classification: "Evidence",
        source: "Product Smoke",
        fileType: "JSON",
        owner: "Audit Desk Workstation",
        status: "In Review"
      }
    });
    const verified = await request(`/api/documents/${document.id}/verify`, { method: "POST", body: { actor: email, result: "Verified during product smoke" } });
    if (!document.id || !verified.id) fail("Evidence record did not verify.");
    return `evidence ${document.id} verified`;
  });

  await check("13 live communication session can be created", async () => {
    const session = await request("/api/live-sessions", {
      method: "POST",
      body: {
        title: `Product smoke live session ${smokeId}`,
        office: "International HQ",
        type: "Executive Briefing",
        status: "Scheduled",
        provider: "jitsi",
        participants: [email, "np@rmvi.org"]
      }
    });
    if (!session.id) fail("Live session did not return an ID.");
    return `live session ${session.id} created`;
  });
} else {
  skip("09 ChurchMail send, route, approve, archive", "read-only mode", "Run with GCOS_PRODUCT_SMOKE_MUTATE=1 to create and archive a ChurchMail test record.");
  skip("10 report submit, verify, packet, archive", "read-only mode", "Run with GCOS_PRODUCT_SMOKE_MUTATE=1 to verify report submission end to end.");
  skip("11 approval create, sign, approve, execute, archive", "read-only mode", "Run with GCOS_PRODUCT_SMOKE_MUTATE=1 to verify approval execution end to end.");
  skip("12 archive evidence verification", "read-only mode", "Run with GCOS_PRODUCT_SMOKE_MUTATE=1 to verify evidence archive workflow.");
  skip("13 live communication session can be created", "read-only mode", "Run with GCOS_PRODUCT_SMOKE_MUTATE=1 to verify live communication creation.");
}

await check("14 backup and restore controls are present", async () => {
  const backup = await request("/api/persistence/status");
  const restore = await request("/api/persistence/restore-drill");
  const validState = backup.status || backup.provider || backup.nextAction;
  if (!validState) fail("Backup status did not return launch controls.");
  return `backup ${backup.status ?? backup.provider ?? "tracked"}; restore ${restore.status ?? "tracked"}`;
}, "Run managed Firebase/Firestore export or restore rehearsal, then record the restore drill attestation.");

await check("15 operational monitor is working", async () => {
  const monitor = await request("/api/ops/monitor");
  if (typeof monitor.score !== "number" && typeof monitor.productionScore !== "number") fail("Operational monitor score was missing.");
  return `monitor score ${monitor.score ?? monitor.productionScore}%`;
});

await check("16 rollout and training boards are connected", async () => {
  const rollout = await request("/api/rollout/readiness");
  const training = await request("/api/rollout/station-training");
  const trainingRecords = training.records ?? training.stations ?? [];
  if (!Array.isArray(rollout.tracks) || !Array.isArray(trainingRecords)) fail("Rollout/training records were missing.");
  return `rollout ${rollout.overallScore ?? 0}%; training stations ${trainingRecords.length}; trained ${training.trained ?? 0}`;
});

const failures = report.checks.filter((item) => item.status === "failed");
const skipped = report.checks.filter((item) => item.status === "skipped");
report.status = failures.length ? "failed" : skipped.length ? "passed-with-skips" : "passed";
report.nextActions = failures.length
  ? failures.map((item) => item.fix ?? `Fix ${item.name}`)
  : skipped.length
    ? skipped.map((item) => item.fix)
    : ["Product workflow smoke passed. Run launch verification, record restore drill evidence, and publish final signoff."];

await mkdir(REPORT_DIR, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-");
const jsonPath = join(REPORT_DIR, `product-workflow-smoke-${stamp}.json`);
const mdPath = join(REPORT_DIR, `product-workflow-smoke-${stamp}.md`);
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, renderMarkdown(report));

for (const item of report.checks) {
  const marker = item.status === "passed" ? "✓" : item.status === "skipped" ? "-" : "✕";
  console.log(`${marker} ${item.name}: ${item.summary}`);
}
console.log(`Product workflow report: ${jsonPath}`);
console.log(`Product workflow summary: ${mdPath}`);
console.log(`Product workflow status: ${report.status}`);

if (failures.length) process.exitCode = 1;

async function request(path, options = {}) {
  const response = await raw(path, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${body.error ?? text}`);
  return body;
}

async function raw(path, options = {}) {
  const headers = {};
  if (options.body !== undefined) headers["content-type"] = "application/json";
  const bearer = options.token === undefined ? adminToken : options.token;
  if (bearer) headers.authorization = `Bearer ${bearer}`;
  const method = options.method ?? "GET";
  const requestBody = options.body === undefined ? undefined : JSON.stringify(options.body);
  const retryStatuses = new Set([502, 503, 504]);
  const maxAttempts = options.noRetry ? 1 : 3;
  let response;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: requestBody,
        signal: controller.signal
      });
    } catch (error) {
      if (error.name === "AbortError") throw new Error(`${method} ${path} timed out after ${requestTimeoutMs}ms`);
      throw new Error(`${method} ${path} failed: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }
    if (!retryStatuses.has(response.status) || attempt === maxAttempts || options.allowStatus?.includes(response.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
  }
  if (!response.ok && !options.allowStatus?.includes(response.status)) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
  }
  return response;
}

async function check(name, fn, fix) {
  const startedAt = new Date().toISOString();
  console.log(`… ${name}`);
  try {
    const summary = await fn();
    console.log(`✓ ${name}: ${summary}`);
    report.checks.push({
      name,
      status: "passed",
      ok: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      summary
    });
  } catch (error) {
    console.log(`✕ ${name}: ${error.message}`);
    report.checks.push({
      name,
      status: "failed",
      ok: false,
      startedAt,
      finishedAt: new Date().toISOString(),
      summary: error.message,
      fix: fix ?? defaultFix(name)
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

function defaultFix(name) {
  if (name.includes("ChurchMail")) return "Confirm ChurchMail API routes, Resend delivery settings, and admin station permissions.";
  if (name.includes("report")) return "Confirm report create, submit, verify, packet, and archive routes are working for the admin station.";
  if (name.includes("approval")) return "Confirm approval create, signature, approval, execute, and archive routes are working for the admin station.";
  if (name.includes("restore")) return "Record a managed restore drill attestation after provider backup/export evidence is reviewed.";
  if (name.includes("station")) return "Confirm station credentials and first-wave accounts are active.";
  return `Review ${name} and rerun npm run product:smoke.`;
}

function renderMarkdown(result) {
  const lines = [
    "# GCOS Product Workflow Smoke",
    "",
    `Generated: ${result.generatedAt}`,
    `Base URL: ${result.baseUrl}`,
    `Mode: ${result.mode}`,
    `Status: ${result.status}`,
    "",
    "## Checks",
    ""
  ];
  for (const item of result.checks) {
    lines.push(`- ${item.status.toUpperCase()} - ${item.name}: ${item.summary}`);
  }
  lines.push("", "## Next Actions", "");
  for (const action of result.nextActions) lines.push(`- ${action}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}
