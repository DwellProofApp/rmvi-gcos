import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const baseUrl = (process.env.GCOS_CORE_ACCEPTANCE_URL ?? process.env.GCOS_SMOKE_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const adminEmail = process.env.GCOS_SMOKE_EMAIL ?? "admin@rmvi.org";
const adminPassword = process.env.GCOS_SMOKE_PASSWORD ?? "gcos-admin";
const localEmail = process.env.GCOS_LOCAL_SMOKE_EMAIL ?? "local_branch_017@rmvi.org";
const localPassword = process.env.GCOS_LOCAL_SMOKE_PASSWORD ?? "gcos-local";
const requestTimeoutMs = Number(process.env.GCOS_CORE_ACCEPTANCE_TIMEOUT_MS ?? 20000);
const runId = `core-${Date.now().toString(36)}`;
const createdIds = {};
let officePassword = "";
let adminToken = "";
let localToken = "";

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  actor: adminEmail,
  runId,
  status: "running",
  checks: []
};

await check("01 platform health and API status", async () => {
  const health = await request("/health", { token: "" });
  const status = await request("/api/status", { token: "" });
  assert(health.status === "ok", "Health endpoint did not report ok.");
  assert(status.status === "ok" && status.service === "gcos-api", "API status did not report GCOS ready.");
  return `API ready on ${status.deployment?.target ?? "configured target"}`;
});

await check("02 admin and local branch sign-in", async () => {
  const admin = await login(adminEmail, adminPassword, "core-acceptance-admin");
  const local = await login(localEmail, localPassword, "core-acceptance-local");
  adminToken = admin.token;
  localToken = local.token;
  assert(admin.station?.email === adminEmail, "Admin station login returned the wrong account.");
  assert(local.station?.email === localEmail, "Local station login returned the wrong account.");
  return `${admin.station.title ?? adminEmail}; ${local.station.title ?? localEmail}`;
});

await check("03 office creation is admin-only", async () => {
  const denied = await raw("/api/offices", {
    method: "POST",
    token: localToken,
    body: officePayload(`denied_${runId}`),
    allowStatus: [401, 403]
  });
  assert([401, 403].includes(denied.status), `Local branch office create returned ${denied.status}, expected 401/403.`);
  return "local branch cannot create permanent office identities";
});

await check("04 manual office creation creates a permanent identity", async () => {
  const password = `Gcos-${runId}-1!`;
  const created = await request("/api/offices", {
    method: "POST",
    body: {
      ...officePayload(`acceptance_${runId}`),
      actor: adminEmail,
      password,
      permissionPreset: "Office Admin",
      workspaceTemplate: "Local branch workstation",
      defaultLanding: "Reports",
      workflowAccess: ["Control Center", "ChurchMail", "Reports", "Approvals", "Live Comms", "Archive"]
    }
  });
  assert(created.id && created.email?.endsWith("@rmvi.org"), "Office creation did not return a durable office ID.");
  createdIds.officeId = created.id;
  createdIds.officeEmail = created.email;
  officePassword = password;
  return `${created.name} created as ${created.email}`;
});

await check("05 office setup fields are writable", async () => {
  const id = required("officeId");
  await request(`/api/offices/${id}/supervisor`, {
    method: "POST",
    body: {
      actor: adminEmail,
      supervisor: "International HQ",
      parentName: "International HQ",
      reportingRoute: "Local Branch -> Area Office -> District HQ -> International HQ"
    }
  });
  await request(`/api/offices/${id}/department`, {
    method: "POST",
    body: { actor: adminEmail, department: "Acceptance and Launch" }
  });
  await request(`/api/offices/${id}/level`, {
    method: "POST",
    body: {
      actor: adminEmail,
      level: "Local Branch",
      reportingRoute: "Local Branch -> Area Office -> District HQ -> International HQ"
    }
  });
  await request(`/api/offices/${id}/capacity`, {
    method: "POST",
    body: { actor: adminEmail, capacity: 8 }
  });
  await request(`/api/offices/${id}/compliance`, {
    method: "POST",
    body: { actor: adminEmail, status: "Reviewed for launch acceptance" }
  });
  await request(`/api/offices/${id}/note`, {
    method: "POST",
    body: { actor: adminEmail, note: "Core acceptance gate verified office metadata." }
  });
  await request(`/api/offices/${id}/watch`, {
    method: "POST",
    body: { actor: adminEmail, watcher: "Audit Desk" }
  });
  return "supervisor, department, level, capacity, compliance, notes, and watch state updated";
});

await check("06 email verification, password rotation, and office activation", async () => {
  const id = required("officeId");
  const password = `Gcos-${runId}-2!`;
  await request(`/api/offices/${id}/email/verify`, {
    method: "POST",
    body: { actor: adminEmail }
  });
  await request(`/api/offices/${id}/password/rotate`, {
    method: "POST",
    body: { actor: adminEmail, password }
  });
  await request(`/api/offices/${id}/station/activate`, {
    method: "POST",
    body: { actor: adminEmail, reason: "Core acceptance station activation" }
  });
  const active = await request(`/api/offices/${id}/activate`, {
    method: "POST",
    body: { actor: adminEmail, reason: "Core acceptance activation" }
  });
  officePassword = password;
  assert(active.status === "Active", "Office did not move to Active.");
  const stationLogin = await login(required("officeEmail"), password, "core-acceptance-created-office");
  assert(stationLogin.station?.email === required("officeEmail"), "Created office station could not sign in after rotation.");
  return `${required("officeEmail")} verified, rotated, activated, and signed in`;
});

await check("07 station lifecycle routes are connected", async () => {
  const stations = await request("/api/stations");
  const station = stations.find((item) => item.email === required("officeEmail"));
  assert(station?.id, "Created office station was not visible in the station registry.");
  createdIds.stationId = station.id;
  await request(`/api/stations/${station.id}/verify`, {
    method: "POST",
    body: { actor: adminEmail, result: "Verified through core acceptance." }
  });
  await request(`/api/stations/${station.id}/credential/rotate`, {
    method: "POST",
    body: { actor: adminEmail, password: officePassword }
  });
  await request(`/api/stations/${station.id}/activate`, {
    method: "POST",
    body: { actor: adminEmail, reason: "Station lifecycle acceptance." }
  });
  return `${station.email} station verified, credential-rotated, and activated`;
});

await check("08 ChurchMail recipient delivery, acknowledge, route, and archive", async () => {
  const message = await request("/api/messages", {
    method: "POST",
    token: adminToken,
    body: {
      kind: "Directive",
      subject: `Core acceptance ChurchMail ${runId}`,
      from: adminEmail,
      to: required("officeEmail"),
      recipients: [required("officeEmail"), localEmail],
      classification: "Internal",
      status: "Ready",
      files: "No attachments",
      body: "Core acceptance verifies recipient-side ChurchMail visibility and workflow actions.",
      priority: "Medium"
    }
  });
  createdIds.messageId = message.id;
  const recipientMessages = await request("/api/messages", { token: localToken });
  assert(recipientMessages.some((item) => item.id === message.id), "Recipient account could not see the ChurchMail message.");
  await request(`/api/messages/${message.id}/status`, {
    method: "POST",
    body: { actor: localEmail, status: "In Review" }
  });
  await request(`/api/messages/${message.id}/route`, {
    method: "POST",
    body: { actor: adminEmail, route: "International HQ -> Local Branch" }
  });
  await request(`/api/messages/${message.id}/approve`, {
    method: "POST",
    body: { actor: localEmail, result: "Acknowledged by recipient in core acceptance." }
  });
  const archived = await request(`/api/messages/${message.id}/archive`, {
    method: "POST",
    body: { actor: adminEmail, reason: "Core acceptance message complete" }
  });
  assert(archived.archived === true || archived.status === "Archived", "ChurchMail archive state was not recorded.");
  return `message ${message.id} visible to recipient, acknowledged, routed, and archived`;
});

await check("09 report submission, review, sign-off packet, approval, archive", async () => {
  const reportRecord = await request("/api/reports", {
    method: "POST",
    body: {
      name: `Core acceptance report ${runId}`,
      category: "Administrative",
      owner: required("officeEmail"),
      state: "Ready",
      path: "Local Branch -> Area Office -> District HQ -> International HQ",
      due: "Today",
      score: 45,
      evidenceStatus: "Evidence pending",
      preparedBy: required("officeEmail"),
      attestation: "Core acceptance report attestation.",
      reportFields: {
        summary: "Report created by the core workflow acceptance gate.",
        period: "Current month"
      }
    }
  });
  createdIds.reportId = reportRecord.id;
  await request(`/api/reports/${reportRecord.id}/details`, {
    method: "POST",
    token: adminToken,
    body: {
      actor: adminEmail,
      reportFields: { summary: "Reviewed report details for acceptance.", period: "Current month" },
      note: "Report details updated before submission."
    }
  });
  await request(`/api/reports/${reportRecord.id}/evidence`, {
    method: "POST",
    body: { actor: required("officeEmail"), evidenceStatus: "Workbook and signature evidence attached" }
  });
  await request(`/api/reports/${reportRecord.id}/submit`, {
    method: "POST",
    body: { actor: required("officeEmail"), destination: "Area Office" }
  });
  await request(`/api/reports/${reportRecord.id}/review`, {
    method: "POST",
    body: { actor: adminEmail, note: "Supervisor reviewed report in acceptance gate." }
  });
  await request(`/api/reports/${reportRecord.id}/verify`, {
    method: "POST",
    body: { actor: adminEmail, state: "Approved" }
  });
  const packet = await request(`/api/reports/${reportRecord.id}/packet`, {
    method: "POST",
    token: adminToken,
    body: {
      actor: adminEmail,
      approvalRequest: `Core acceptance report approval ${runId}`,
      route: "Area Office -> District HQ -> International HQ",
      limit: "$0",
      note: "Acceptance packet built from submitted report."
    }
  });
  assert(packet.approval?.id && packet.document?.id, "Report packet did not create linked approval and archive document.");
  createdIds.packetApprovalId = packet.approval.id;
  await request(`/api/approvals/${packet.approval.id}/sign`, {
    method: "POST",
    body: { actor: adminEmail, signature: "Core acceptance sign-off" }
  });
  await request(`/api/approvals/${packet.approval.id}/approve`, {
    method: "POST",
    body: { actor: adminEmail, result: "Approved through report sign-off loop" }
  });
  const archived = await request(`/api/reports/${reportRecord.id}/archive`, {
    method: "POST",
    body: { actor: adminEmail, reason: "Core acceptance report complete" }
  });
  assert(archived.archived === true || archived.status === "Archived", "Report archive state was not recorded.");
  return `report ${reportRecord.id} submitted, reviewed, approved, packeted, and archived`;
});

await check("10 standalone approval decision history and execution", async () => {
  const approval = await request("/api/approvals", {
    method: "POST",
    body: {
      request: `Core acceptance approval ${runId}`,
      route: "Local Branch -> Area Office -> District HQ",
      limit: "$1,000",
      state: "Validation",
      authority: "District HQ",
      signatures: "0/3",
      linkedReport: createdIds.reportId
    }
  });
  createdIds.approvalId = approval.id;
  await request(`/api/approvals/${approval.id}/sign`, {
    method: "POST",
    body: { actor: adminEmail, signature: "Core acceptance authority signature" }
  });
  await request(`/api/approvals/${approval.id}/approve`, {
    method: "POST",
    body: { actor: adminEmail, result: "Approved during core acceptance" }
  });
  const executed = await request(`/api/approvals/${approval.id}/execute`, {
    method: "POST",
    token: adminToken,
    body: { actor: adminEmail, status: "Executed" }
  });
  await request(`/api/approvals/${approval.id}/archive`, {
    method: "POST",
    body: { actor: adminEmail, reason: "Core acceptance approval complete" }
  });
  assert(executed.document?.id, "Approval execution did not create an archive document.");
  return `approval ${approval.id} signed, approved, executed, archived`;
});

await check("11 department chat and live meeting are office-linked", async () => {
  const room = await request("/api/chat/rooms", {
    method: "POST",
    token: adminToken,
    body: {
      actor: adminEmail,
      name: `Core acceptance room ${runId}`,
      kind: "Operations",
      department: "Acceptance",
      participants: [adminEmail, required("officeEmail"), localEmail],
      linkedRecord: createdIds.reportId
    }
  });
  createdIds.chatRoomId = room.id;
  const message = await request(`/api/chat/rooms/${room.id}/messages`, {
    method: "POST",
    token: adminToken,
    body: {
      actor: adminEmail,
      body: "Core acceptance confirms department chat is connected to office identities.",
      linkedReport: createdIds.reportId,
      linkedApproval: createdIds.approvalId
    }
  });
  await request(`/api/chat/rooms/${room.id}/read`, {
    method: "POST",
    token: localToken,
    body: { actor: localEmail }
  });
  const meeting = await request(`/api/chat/rooms/${room.id}/meeting`, {
    method: "POST",
    token: adminToken,
    body: { actor: adminEmail, title: `Core acceptance meeting ${runId}` }
  });
  assert(message.id && meeting.joinUrl, "Department chat message or meeting join URL was missing.");
  return `room ${room.id} sent a message and opened video meeting`;
});

await check("12 office archive cleanup remains available", async () => {
  const archived = await request(`/api/offices/${required("officeId")}/archive`, {
    method: "POST",
    body: { actor: adminEmail, reason: "Core acceptance test office archived after verification" }
  });
  assert(archived.archived === true, "Office archive state was not recorded.");
  return `${required("officeEmail")} archived after acceptance run`;
});

const failures = report.checks.filter((item) => item.status === "failed");
report.status = failures.length ? "failed" : "passed";
report.nextActions = failures.length
  ? failures.map((item) => item.fix ?? `Fix ${item.name}`)
  : ["Core workflow acceptance passed. Record restore/signoff evidence and run role-based UAT before final production handoff."];

await mkdir(REPORT_DIR, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-");
const jsonPath = join(REPORT_DIR, `core-workflow-acceptance-${stamp}.json`);
const mdPath = join(REPORT_DIR, `core-workflow-acceptance-${stamp}.md`);
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, renderMarkdown(report));

for (const item of report.checks) {
  const marker = item.status === "passed" ? "PASS" : "FAIL";
  console.log(`${marker} ${item.name}: ${item.summary}`);
}
console.log(`Core acceptance report: ${jsonPath}`);
console.log(`Core acceptance summary: ${mdPath}`);
console.log(`Core acceptance status: ${report.status}`);

if (failures.length) process.exitCode = 1;

async function login(email, password, deviceLabel) {
  return request("/api/auth/login", {
    method: "POST",
    token: "",
    body: { email, password, deviceLabel }
  });
}

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
  console.log(`... ${name}`);
  try {
    const summary = await fn();
    console.log(`PASS ${name}: ${summary}`);
    report.checks.push({
      name,
      status: "passed",
      ok: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      summary
    });
  } catch (error) {
    console.log(`FAIL ${name}: ${error.message}`);
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

function officePayload(prefix) {
  const slug = prefix.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return {
    name: `Core Acceptance Office ${runId}`,
    email: `${slug}@rmvi.org`,
    level: "Local Branch",
    department: "Acceptance",
    supervisor: "International HQ",
    actor: adminEmail,
    nodeKind: "Office",
    parentName: "International HQ",
    reportingRoute: "Local Branch -> Area Office -> District HQ -> International HQ"
  };
}

function required(key) {
  const value = createdIds[key];
  assert(Boolean(value), `${key} was not created before this step.`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function defaultFix(name) {
  if (name.includes("office")) return "Review office create/activate/security reset routes and administrator permissions.";
  if (name.includes("station")) return "Review station registry and credential lifecycle routes.";
  if (name.includes("ChurchMail")) return "Review message recipient filtering, status, route, approve, and archive routes.";
  if (name.includes("report")) return "Review report create, evidence, submit, review, verify, packet, approval, and archive routes.";
  if (name.includes("approval")) return "Review approval sign, approve, execute, archive, and document history routes.";
  if (name.includes("chat")) return "Review department chat room, message, read, and meeting routes.";
  return `Review ${name} and rerun npm run core:acceptance.`;
}

function renderMarkdown(result) {
  const lines = [
    "# GCOS Core Workflow Acceptance",
    "",
    `Generated: ${result.generatedAt}`,
    `Base URL: ${result.baseUrl}`,
    `Run ID: ${result.runId}`,
    `Status: ${result.status}`,
    "",
    "## Checks",
    ""
  ];
  for (const item of result.checks) {
    lines.push(`- ${item.status.toUpperCase()} - ${item.name}: ${item.summary}`);
  }
  lines.push("", "## Created Records", "");
  for (const [key, value] of Object.entries(createdIds)) {
    lines.push(`- ${key}: ${value}`);
  }
  lines.push("", "## Next Actions", "");
  for (const action of result.nextActions) lines.push(`- ${action}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}
