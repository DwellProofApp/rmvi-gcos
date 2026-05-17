import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const PORT = 8797;
const BASE_URL = `http://127.0.0.1:${PORT}`;

test("GCOS API supports auth, mutations, persistence, and reset", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "gcos-api-"));
  const dataPath = join(tempDir, "state.json");
  const webDistPath = join(tempDir, "dist");
  await mkdir(join(webDistPath, "assets"), { recursive: true });
  await writeFile(join(webDistPath, "index.html"), "<!doctype html><title>GCOS Web</title><div id=\"root\"></div>");
  await writeFile(join(webDistPath, "assets", "app.css"), "body{color:#173d32}");
  let api = await startApi(dataPath, webDistPath);

  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    assert.equal(healthResponse.headers.get("access-control-allow-origin"), "https://admin.gcos.test");
    const health = await healthResponse.json();
    assert.equal(health.status, "ok");

    const status = await getJson("/api/status");
    assert.equal(status.status, "ok");
    assert.equal(status.serveWeb, true);
    assert.equal(status.limits.maxBodyBytes, 4096);
    assert.equal(status.limits.devResetEnabled, true);
    assert.equal(status.sessions.active, 0);
    assert.deepEqual(status.sessions.stations, []);
    assert.equal(status.counts.stations > 0, true);
    assert.equal(status.counts.tasks > 0, true);
    assert.equal(status.counts.policies > 0, true);
    assert.equal(status.counts.calendarEvents > 0, true);
    assert.equal(status.counts.personnel > 0, true);
    assert.equal(status.counts.audit > 0, true);

    const readiness = await getJson("/api/readiness");
    assert.equal(readiness.status, "ready");
    assert.equal(readiness.checks.length >= 6, true);

    const webShell = await fetch(`${BASE_URL}/`);
    assert.equal(webShell.status, 200);
    assert.equal((await webShell.text()).includes("GCOS Web"), true);

    const webAsset = await fetch(`${BASE_URL}/assets/app.css`);
    assert.equal(webAsset.status, 200);
    assert.equal(await webAsset.text(), "body{color:#173d32}");

    const webFallback = await fetch(`${BASE_URL}/office/deep-link`);
    assert.equal(webFallback.status, 200);
    assert.equal((await webFallback.text()).includes("GCOS Web"), true);

    const login = await postJson("/api/auth/login", {
      email: "np@rmvi.org",
      password: "gcos-national"
    });
    assert.equal(login.station.email, "np@rmvi.org");
    assert.match(login.token, /^gcos\./);
    assert.equal(Boolean(login.expiresAt), true);
    const nationalToken = login.token;

    const statusAfterLogin = await getJson("/api/status");
    assert.equal(statusAfterLogin.sessions.active, 1);
    assert.equal(statusAfterLogin.sessions.stations[0].email, "np@rmvi.org");
    assert.equal(statusAfterLogin.sessions.stations[0].minutesRemaining > 0, true);

    const localLogin = await postJson("/api/auth/login", {
      email: "local_branch_017@gcos.org",
      password: "gcos-local"
    });
    const localToken = localLogin.token;

    const statusAfterSecondLogin = await getJson("/api/status");
    assert.equal(statusAfterSecondLogin.sessions.active, 2);

    const denied = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "np@rmvi.org", password: "wrong" })
    });
    assert.equal(denied.status, 401);

    const invalidLogin = await rawPost("/api/auth/login", {
      email: "not-an-email",
      password: "gcos-national"
    });
    assert.equal(invalidLogin.status, 400);

    const missingToken = await rawPost("/api/messages", {
      kind: "Notification",
      subject: "Missing token test",
      from: "np@rmvi.org",
      status: "Ready",
      files: "none"
    });
    assert.equal(missingToken.status, 401);

    const missingExportToken = await fetch(`${BASE_URL}/api/export`);
    assert.equal(missingExportToken.status, 401);

    const invalidMessage = await rawPost("/api/messages", {
      kind: "Memo",
      subject: "Invalid kind",
      from: "np@rmvi.org"
    }, nationalToken);
    assert.equal(invalidMessage.status, 400);

    const createdMessage = await postJson("/api/messages", {
      kind: "Notification",
      subject: "Automated API test notice",
      from: "np@rmvi.org",
      status: "Ready",
      files: "none"
    }, nationalToken);
    assert.equal(createdMessage.subject, "Automated API test notice");

    const reviewedMessage = await postJson(`/api/messages/${createdMessage.id}/status`, {
      status: "In Review"
    }, nationalToken);
    assert.equal(reviewedMessage.status, "In Review");

    const snapshot = await getJson("/api/export", nationalToken);
    assert.equal(snapshot.exportedBy, "np@rmvi.org");
    assert.equal(snapshot.service, "gcos-api");
    assert.equal(snapshot.counts.messages > 0, true);
    assert.equal(snapshot.state.messages[0].subject, "Automated API test notice");

    const reports = await getJson("/api/reports");
    const invalidReport = await rawPost("/api/reports", {
      owner: "National Programs",
      path: "National -> Regional"
    }, nationalToken);
    assert.equal(invalidReport.status, 400);

    const createdReport = await postJson("/api/reports", {
      name: "Automated mission finance report",
      owner: "National Programs",
      path: "National -> Regional",
      due: "Draft"
    }, nationalToken);
    assert.equal(createdReport.name, "Automated mission finance report");
    assert.equal(createdReport.state, "Ready");

    const submittedReport = await postJson(`/api/reports/${reports[0].id}/submit`, {}, nationalToken);
    assert.equal(submittedReport.state, "Approved");
    assert.equal(submittedReport.score, 100);

    const correctionReport = await postJson(`/api/reports/${reports[1].id}/correction`, {
      reason: "Supporting documents need revision"
    }, nationalToken);
    assert.equal(correctionReport.state, "Correction Requested");
    assert.equal(correctionReport.score <= 45, true);

    const scoredReport = await postJson(`/api/reports/${reports[1].id}/score`, {
      score: 78,
      state: "In Review"
    }, nationalToken);
    assert.equal(scoredReport.score, 78);
    assert.equal(scoredReport.state, "In Review");

    const approvals = await getJson("/api/approvals");
    const invalidCreatedApproval = await rawPost("/api/approvals", {
      route: "National -> Regional",
      limit: "$1,200"
    }, nationalToken);
    assert.equal(invalidCreatedApproval.status, 400);

    const createdApproval = await postJson("/api/approvals", {
      request: "Automated approval creation test",
      route: "National -> Regional",
      limit: "$1,200"
    }, nationalToken);
    assert.equal(createdApproval.request, "Automated approval creation test");
    assert.equal(createdApproval.state, "Validation");

    const forbiddenApproval = await rawPost(`/api/approvals/${approvals[0].id}/approve`, {}, localToken);
    assert.equal(forbiddenApproval.status, 403);

    const approvedRequest = await postJson(`/api/approvals/${approvals[0].id}/approve`, {}, nationalToken);
    assert.equal(approvedRequest.state, "Approved");
    assert.equal(approvedRequest.signatures, "complete");

    const signedRequest = await postJson(`/api/approvals/${createdApproval.id}/sign`, {}, nationalToken);
    assert.equal(signedRequest.state, "Signature");
    assert.equal(signedRequest.signatures, "1/2");

    const rejectedRequest = await postJson(`/api/approvals/${approvals[1].id}/reject`, {
      reason: "Authority documentation incomplete"
    }, nationalToken);
    assert.equal(rejectedRequest.state, "Rejected");
    assert.equal(rejectedRequest.signatures, "closed");

    const tasks = await getJson("/api/tasks");
    const invalidTask = await rawPost("/api/tasks", {
      owner: "National Programs",
      assignee: "District Desk"
    }, nationalToken);
    assert.equal(invalidTask.status, 400);

    const createdTask = await postJson("/api/tasks", {
      title: "Automated task creation test",
      owner: "National Programs",
      assignee: "District Desk",
      priority: "High",
      due: "Today"
    }, nationalToken);
    assert.equal(createdTask.title, "Automated task creation test");
    assert.equal(createdTask.status, "Queued");

    const advancedTask = await postJson(`/api/tasks/${tasks[0].id}/advance`, {
      status: "Complete"
    }, nationalToken);
    assert.equal(advancedTask.status, "Complete");

    const priorityTask = await postJson(`/api/tasks/${tasks[1].id}/priority`, {
      priority: "Critical"
    }, nationalToken);
    assert.equal(priorityTask.priority, "Critical");

    const policies = await getJson("/api/policies");
    const invalidPolicy = await rawPost("/api/policies", {
      category: "Finance",
      summary: "Missing title"
    }, nationalToken);
    assert.equal(invalidPolicy.status, 400);

    const forbiddenPolicy = await rawPost("/api/policies", {
      title: "Forbidden local policy",
      category: "Local",
      summary: "Local branch should not publish global policy"
    }, localToken);
    assert.equal(forbiddenPolicy.status, 403);

    const createdPolicy = await postJson("/api/policies", {
      title: "Automated policy registry test",
      category: "Compliance",
      owner: "National Programs",
      status: "Active",
      summary: "Automated test policy for governance registry."
    }, nationalToken);
    assert.equal(createdPolicy.title, "Automated policy registry test");
    assert.equal(createdPolicy.acknowledgements, 0);

    const acknowledgedPolicy = await postJson(`/api/policies/${policies[0].id}/acknowledge`, {}, localToken);
    assert.equal(acknowledgedPolicy.acknowledgements > 0, true);

    const retiredPolicy = await postJson(`/api/policies/${policies[1].id}/retire`, {
      reason: "Replaced by updated transfer policy"
    }, nationalToken);
    assert.equal(retiredPolicy.status, "Retired");

    const calendarEvents = await getJson("/api/calendar-events");
    const invalidCalendarEvent = await rawPost("/api/calendar-events", {
      category: "Audit",
      date: "2026-05-30"
    }, nationalToken);
    assert.equal(invalidCalendarEvent.status, 400);

    const createdCalendarEvent = await postJson("/api/calendar-events", {
      title: "Automated calendar event test",
      category: "Audit",
      owner: "National Programs",
      date: "2026-05-30",
      priority: "High"
    }, nationalToken);
    assert.equal(createdCalendarEvent.title, "Automated calendar event test");
    assert.equal(createdCalendarEvent.status, "Scheduled");

    const completedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[0].id}/complete`, {}, nationalToken);
    assert.equal(completedCalendarEvent.status, "Complete");

    const atRiskCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/risk`, {
      reason: "Deadline requires attention"
    }, nationalToken);
    assert.equal(atRiskCalendarEvent.status, "At Risk");

    const personnel = await getJson("/api/personnel");
    const invalidPerson = await rawPost("/api/personnel", {
      role: "Coordinator",
      currentStation: "District",
      assignedStation: "Area"
    }, nationalToken);
    assert.equal(invalidPerson.status, 400);

    const forbiddenPerson = await rawPost("/api/personnel", {
      name: "Forbidden Person",
      role: "Local Volunteer",
      currentStation: "Local Branch",
      assignedStation: "Area Office"
    }, localToken);
    assert.equal(forbiddenPerson.status, 403);

    const createdPerson = await postJson("/api/personnel", {
      name: "Automated personnel registry test",
      role: "District Coordinator",
      currentStation: "National Programs",
      assignedStation: "Regional Desk",
      status: "Transfer Pending"
    }, nationalToken);
    assert.equal(createdPerson.name, "Automated personnel registry test");
    assert.equal(createdPerson.status, "Transfer Pending");

    const updatedPerson = await postJson(`/api/personnel/${personnel[0].id}/status`, {
      status: "Assigned"
    }, nationalToken);
    assert.equal(updatedPerson.status, "Assigned");

    const deactivatedPerson = await postJson(`/api/personnel/${personnel[1].id}/deactivate`, {
      reason: "Automated deactivation test"
    }, nationalToken);
    assert.equal(deactivatedPerson.status, "Inactive");

    const escalation = await postJson("/api/escalations", {
      source: "Report",
      item: "Automated escalation test",
      reason: "Test workflow escalation",
      severity: "High",
      owner: "Test Office"
    }, nationalToken);
    assert.equal(escalation.status, "Open");

    const forbiddenRoute = await rawPost(`/api/escalations/${escalation.id}/route`, {}, localToken);
    assert.equal(forbiddenRoute.status, 403);

    const routedEscalation = await postJson(`/api/escalations/${escalation.id}/route`, {}, nationalToken);
    assert.equal(routedEscalation.status, "Upward");

    const severityEscalation = await postJson(`/api/escalations/${escalation.id}/severity`, {
      severity: "Critical"
    }, nationalToken);
    assert.equal(severityEscalation.severity, "Critical");

    const resolvedEscalation = await postJson(`/api/escalations/${escalation.id}/resolve`, {}, nationalToken);
    assert.equal(resolvedEscalation.status, "Resolved");

    const forbiddenOffice = await rawPost("/api/offices", {
      name: "Forbidden Branch Office",
      email: "forbidden_branch@gcos.org",
      level: "Area HQ",
      department: "Area Coordination",
      supervisor: "District HQ"
    }, localToken);
    assert.equal(forbiddenOffice.status, 403);

    const invalidOffice = await rawPost("/api/offices", {
      name: "Invalid Office",
      email: "invalid-office-email",
      level: "District HQ",
      department: "District Command",
      supervisor: "County HQ"
    }, nationalToken);
    assert.equal(invalidOffice.status, 400);

    const office = await postJson("/api/offices", {
      name: "Automated District Office",
      email: "automated_district@gcos.org",
      level: "District HQ",
      department: "District Command",
      supervisor: "County HQ"
    }, nationalToken);
    assert.equal(office.email, "automated_district@gcos.org");
    assert.equal(office.password, "gcos-automated-district-office");

    const suspendedOffice = await postJson(`/api/offices/${office.id}/status`, {
      status: "Suspended"
    }, nationalToken);
    assert.equal(suspendedOffice.status, "Suspended");

    const officeLogin = await postJson("/api/auth/login", {
      email: "automated_district@gcos.org",
      password: office.password
    });
    assert.equal(officeLogin.station.email, "automated_district@gcos.org");
    assert.equal(officeLogin.station.level, "District HQ");

    const duplicateOffice = await fetch(`${BASE_URL}/api/offices`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${nationalToken}` },
      body: JSON.stringify({
        name: "Duplicate Office",
        email: "automated_district@gcos.org",
        level: "District HQ",
        department: "District Command",
        supervisor: "County HQ"
      })
    });
    assert.equal(duplicateOffice.status, 409);

    const stations = await getJson("/api/stations");
    assert.equal(stations.some((station) => station.email === "automated_district@gcos.org"), true);

    const transfers = await getJson("/api/transfers");
    const forbiddenCreatedTransfer = await rawPost("/api/transfers", {
      person: "Forbidden Transfer",
      from: "Local Branch 017",
      to: "County Office"
    }, localToken);
    assert.equal(forbiddenCreatedTransfer.status, 403);

    const invalidCreatedTransfer = await rawPost("/api/transfers", {
      person: "Invalid Transfer",
      from: "National Office"
    }, nationalToken);
    assert.equal(invalidCreatedTransfer.status, 400);

    const createdTransfer = await postJson("/api/transfers", {
      person: "Automated transfer test",
      from: "National Office",
      to: "Regional Office"
    }, nationalToken);
    assert.equal(createdTransfer.person, "Automated transfer test");
    assert.equal(createdTransfer.step, "Recipient acknowledgement");

    const acknowledgedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/acknowledge`, {}, nationalToken);
    assert.equal(acknowledgedTransfer.step, "Permissions migration");
    assert.equal(acknowledgedTransfer.risk, "Acknowledgement recorded");

    const forbiddenTransfer = await rawPost(`/api/transfers/${transfers[0].id}/execute`, {}, localToken);
    assert.equal(forbiddenTransfer.status, 403);

    const executedTransfer = await postJson(`/api/transfers/${transfers[0].id}/execute`, {}, nationalToken);
    assert.equal(executedTransfer.step, "New station login ready");
    assert.equal(executedTransfer.risk, "Previous permissions revoked");
    const personnelAfterTransfer = await getJson("/api/personnel");
    const transferredPerson = personnelAfterTransfer.find((item) => item.name === executedTransfer.person);
    assert.equal(transferredPerson.status, "Assigned");
    assert.equal(transferredPerson.currentStation, executedTransfer.to);

    const invalidDocument = await rawPost("/api/documents", {
      name: "Missing classification.pdf",
      source: "ChurchMail",
      fileType: "PDF"
    }, nationalToken);
    assert.equal(invalidDocument.status, 400);

    const document = await postJson("/api/documents", {
      name: "Automated signed packet.pdf",
      classification: "Signed document",
      source: "ChurchMail",
      owner: "National Secretariat",
      fileType: "PDF"
    }, nationalToken);
    assert.equal(document.name, "Automated signed packet.pdf");
    assert.equal(document.status, "Archived");
    assert.match(document.storageKey, /^gcos-object-vault\//);

    const reviewDocument = await postJson(`/api/documents/${document.id}/review`, {
      reason: "Automated review test"
    }, nationalToken);
    assert.equal(reviewDocument.status, "In Review");

    const archivedDocument = await postJson(`/api/documents/${document.id}/archive`, {
      reason: "Automated archive test"
    }, nationalToken);
    assert.equal(archivedDocument.status, "Archived");

    const draft = await postJson("/api/ai-drafts", {
      kind: "Executive Summary",
      focus: "Automated workflow test"
    }, nationalToken);
    assert.equal(draft.title, "Executive Summary: Automated workflow test");
    assert.equal(draft.sourceCount > 0, true);

    const archivedDraft = await postJson(`/api/ai-drafts/${draft.id}/archive`, {
      reason: "Automated AI archive test"
    }, nationalToken);
    assert.equal(archivedDraft.classification, "AI draft");
    assert.equal(archivedDraft.source, "AI Desk");

    const sync = await postJson("/api/offline-sync", {
      actions: [
        {
          event: "OfflineActionTest",
          object: "Cached branch report",
          result: "Queued locally"
        }
      ]
    }, localToken);
    assert.equal(sync.synced, 1);

    const persisted = JSON.parse(await readFile(dataPath, "utf8"));
    assert.equal(persisted.messages[0].subject, "Automated API test notice");
    assert.equal(persisted.audit.some((row) => row.event === "OfflineActionTest"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportScoreUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalSigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftGenerated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskAdvanced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyPublished"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventCompleted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonRegistered"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferExecuted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentArchived"), true);

    await stopApi(api);
    api = await startApi(dataPath, webDistPath);

    const messagesAfterRestart = await getJson("/api/messages");
    assert.equal(messagesAfterRestart[0].subject, "Automated API test notice");

    const reportsAfterRestart = await getJson("/api/reports");
    assert.equal(reportsAfterRestart[0].name, "Automated mission finance report");

    const approvalsAfterRestart = await getJson("/api/approvals");
    assert.equal(approvalsAfterRestart[0].request, "Automated approval creation test");

    const tasksAfterRestart = await getJson("/api/tasks");
    assert.equal(tasksAfterRestart[0].title, "Automated task creation test");

    const policiesAfterRestart = await getJson("/api/policies");
    assert.equal(policiesAfterRestart[0].title, "Automated policy registry test");

    const calendarEventsAfterRestart = await getJson("/api/calendar-events");
    assert.equal(calendarEventsAfterRestart[0].title, "Automated calendar event test");

    const personnelAfterRestart = await getJson("/api/personnel");
    assert.equal(personnelAfterRestart[0].name, "Automated personnel registry test");

    const transfersAfterRestart = await getJson("/api/transfers");
    assert.equal(transfersAfterRestart[0].person, "Automated transfer test");

    const officesAfterRestart = await getJson("/api/offices");
    assert.equal(officesAfterRestart.some((item) => item.email === "automated_district@gcos.org"), true);

    const documentsAfterRestart = await getJson("/api/documents");
    assert.equal(documentsAfterRestart.some((item) => item.name === "Automated signed packet.pdf"), true);
    assert.equal(documentsAfterRestart.some((item) => item.classification === "AI draft"), true);

    const reset = await postJson("/api/dev/reset", {});
    assert.equal(reset.messages[0].subject, "Q2 governance reporting directive");
    assert.equal(reset.tasks[0].title, "Review county finance packet");
    assert.equal(reset.policies[0].title, "Financial approval delegation policy");
    assert.equal(reset.calendarEvents[0].title, "National audit packet deadline");
    assert.equal(reset.personnel[0].name, "Rev. Daniel Moore");
    assert.equal(reset.audit[0].event, "DevReset");

    const malformedJson = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{bad-json"
    });
    assert.equal(malformedJson.status, 400);

    const oversizedBody = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "np@rmvi.org", password: "x".repeat(5000) })
    });
    assert.equal(oversizedBody.status, 413);

    await stopApi(api);
    api = await startApi(dataPath, webDistPath, {
      NODE_ENV: "production",
      GCOS_ENABLE_DEV_RESET: "0"
    });

    const disabledReset = await rawPost("/api/dev/reset", {});
    assert.equal(disabledReset.status, 403);
  } finally {
    await stopApi(api);
    await rm(tempDir, { recursive: true, force: true });
  }
});

function startApi(dataPath, webDistPath, extraEnv = {}) {
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      GCOS_API_PORT: String(PORT),
      GCOS_DATA_PATH: dataPath,
      GCOS_SERVE_WEB: "1",
      GCOS_WEB_DIST_PATH: webDistPath,
      GCOS_ALLOWED_ORIGIN: "https://admin.gcos.test",
      GCOS_MAX_BODY_BYTES: "4096",
      GCOS_ENABLE_DEV_RESET: "1",
      ...extraEnv
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`API did not start. Output:\n${output}`));
    }, 5000);

    child.stdout.on("data", () => {
      if (output.includes(`http://127.0.0.1:${PORT}`)) {
        clearTimeout(timeout);
        resolve(child);
      }
    });

    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code !== null && code !== 0) reject(new Error(`API exited with ${code}. Output:\n${output}`));
    });
  });
}

function stopApi(child) {
  if (!child || child.killed) return Promise.resolve();
  return new Promise((resolve) => {
    child.once("exit", () => resolve());
    child.kill();
    setTimeout(resolve, 1000);
  });
}

async function getJson(path, token = "") {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  });
  assert.equal(response.ok, true, `${path} returned ${response.status}`);
  return response.json();
}

async function postJson(path, body, token = "") {
  const response = await rawPost(path, body, token);
  assert.equal(response.ok, true, `${path} returned ${response.status}`);
  return response.json();
}

function rawPost(path, body, token = "") {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}
