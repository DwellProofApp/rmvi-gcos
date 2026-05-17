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
    assert.equal(Boolean(statusAfterSecondLogin.sessions.stations[0].id), true);

    const renewedSession = await postJson("/api/sessions/renew", {}, nationalToken);
    assert.equal(renewedSession.session.email, "np@rmvi.org");
    assert.equal(renewedSession.session.status, "Renewed");

    const flaggedSession = await postJson(`/api/sessions/${renewedSession.session.id}/flag`, {
      reason: "Automated suspicious session test"
    }, nationalToken);
    assert.equal(flaggedSession.session.status, "Flagged");
    assert.equal(flaggedSession.session.flags.includes("Automated suspicious session test"), true);

    const spareLocalLogin = await postJson("/api/auth/login", {
      email: "local_branch_017@gcos.org",
      password: "gcos-local"
    });

    const revokedLocalSession = await postJson(`/api/sessions/${spareLocalLogin.token}/revoke`, {}, nationalToken);
    assert.equal(revokedLocalSession.revoked, spareLocalLogin.token);
    assert.equal(revokedLocalSession.sessions.active, 2);

    const extraLogin = await postJson("/api/auth/login", {
      email: "np@rmvi.org",
      password: "gcos-national"
    });
    assert.match(extraLogin.token, /^gcos\./);

    const revokedStationSessions = await postJson("/api/sessions/station/revoke", {
      email: "np@rmvi.org"
    }, nationalToken);
    assert.equal(revokedStationSessions.revoked >= 1, true);

    const commandBriefing = await getJson("/api/command-center/briefing");
    assert.equal(commandBriefing.title, "Executive command briefing");
    assert.equal(commandBriefing.riskScore > 0, true);
    assert.equal(commandBriefing.priorities.length, 4);

    const archivedCommandBriefing = await postJson("/api/command-center/briefing/archive", {
      title: "Automated command briefing"
    }, nationalToken);
    assert.equal(archivedCommandBriefing.document.classification, "Command briefing");
    assert.equal(archivedCommandBriefing.briefing.title, "Automated command briefing");

    const commandDirective = await postJson("/api/command-center/directive", {
      subject: "Automated command directive",
      files: "Command packet"
    }, nationalToken);
    assert.equal(commandDirective.kind, "Directive");
    assert.equal(commandDirective.subject, "Automated command directive");

    const commandTask = await postJson("/api/command-center/task", {
      title: "Automated command task",
      assignee: "np@rmvi.org",
      priority: "High",
      due: "Today"
    }, nationalToken);
    assert.equal(commandTask.title, "Automated command task");
    assert.equal(commandTask.status, "In Progress");

    const commandEscalation = await postJson("/api/command-center/escalation", {
      item: "Automated command escalation",
      reason: "Automated command risk",
      owner: "np@rmvi.org",
      severity: "High"
    }, nationalToken);
    assert.equal(commandEscalation.source, "Control Center");
    assert.equal(commandEscalation.item, "Automated command escalation");

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

    const classifiedMessage = await postJson(`/api/messages/${createdMessage.id}/classify`, {
      kind: "Directive"
    }, nationalToken);
    assert.equal(classifiedMessage.kind, "Directive");

    const routedMessage = await postJson(`/api/messages/${createdMessage.id}/route`, {
      route: "National -> Regional -> Archive"
    }, nationalToken);
    assert.equal(routedMessage.route, "National -> Regional -> Archive");

    const priorityMessage = await postJson(`/api/messages/${createdMessage.id}/priority`, {
      priority: "Critical"
    }, nationalToken);
    assert.equal(priorityMessage.priority, "Critical");

    const escalatedMessage = await postJson(`/api/messages/${createdMessage.id}/escalate`, {
      reason: "Automated message escalation"
    }, nationalToken);
    assert.equal(escalatedMessage.status, "Escalated");
    assert.equal(escalatedMessage.priority, "Critical");

    const approvedMessage = await postJson(`/api/messages/${createdMessage.id}/approve`, {}, nationalToken);
    assert.equal(approvedMessage.status, "Approved");

    const archivedMessage = await postJson(`/api/messages/${createdMessage.id}/archive`, {
      reason: "Automated message archive"
    }, nationalToken);
    assert.equal(archivedMessage.archived, true);

    const watchedMessage = await postJson(`/api/messages/${createdMessage.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedMessage.watchers.includes("np@rmvi.org"), true);

    const duplicatedMessage = await postJson(`/api/messages/${createdMessage.id}/duplicate`, {
      subject: "Automated duplicated ChurchMail notice"
    }, nationalToken);
    assert.equal(duplicatedMessage.subject, "Automated duplicated ChurchMail notice");
    assert.equal(duplicatedMessage.status, "Queued");

    const bulkApprovedMessages = await postJson("/api/messages/bulk/approve", {
      ids: [duplicatedMessage.id]
    }, nationalToken);
    assert.equal(bulkApprovedMessages.count, 1);
    assert.equal(bulkApprovedMessages.updated[0].status, "Approved");

    const messageDigest = await getJson("/api/messages/digest", nationalToken);
    assert.equal(messageDigest.total > 0, true);
    assert.equal(messageDigest.approved >= 1, true);
    assert.equal(messageDigest.watched >= 1, true);

    const snapshot = await getJson("/api/export", nationalToken);
    assert.equal(snapshot.exportedBy, "np@rmvi.org");
    assert.equal(snapshot.service, "gcos-api");
    assert.equal(snapshot.counts.messages > 0, true);
    assert.equal(snapshot.state.messages.some((item) => item.subject === "Automated API test notice"), true);

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

    const dueReport = await postJson(`/api/reports/${reports[1].id}/due`, {
      due: "Overdue"
    }, nationalToken);
    assert.equal(dueReport.due, "Overdue");

    const ownerReport = await postJson(`/api/reports/${reports[1].id}/owner`, {
      owner: "National Reporting Desk"
    }, nationalToken);
    assert.equal(ownerReport.owner, "National Reporting Desk");

    const pathReport = await postJson(`/api/reports/${reports[1].id}/path`, {
      path: "Local -> District -> National -> Archive"
    }, nationalToken);
    assert.equal(pathReport.path, "Local -> District -> National -> Archive");

    const evidenceReport = await postJson(`/api/reports/${reports[1].id}/evidence`, {
      evidenceStatus: "Evidence attached"
    }, nationalToken);
    assert.equal(evidenceReport.evidenceStatus, "Evidence attached");
    assert.equal(evidenceReport.score >= 70, true);

    const reviewReport = await postJson(`/api/reports/${reports[1].id}/review`, {
      note: "Automated supervisory review"
    }, nationalToken);
    assert.equal(reviewReport.state, "In Review");

    const verifiedReport = await postJson(`/api/reports/${reports[1].id}/verify`, {
      state: "Approved"
    }, nationalToken);
    assert.equal(verifiedReport.verified, true);
    assert.equal(verifiedReport.state, "Approved");

    const watchedReport = await postJson(`/api/reports/${reports[1].id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedReport.watchers.includes("np@rmvi.org"), true);

    const duplicatedReport = await postJson(`/api/reports/${reports[1].id}/duplicate`, {
      name: "Automated duplicate report follow-up"
    }, nationalToken);
    assert.equal(duplicatedReport.name, "Automated duplicate report follow-up");
    assert.equal(duplicatedReport.state, "Ready");

    const archivedReport = await postJson(`/api/reports/${reports[1].id}/archive`, {
      reason: "Automated report archive"
    }, nationalToken);
    assert.equal(archivedReport.archived, true);

    const reportDigest = await getJson("/api/reports/digest", nationalToken);
    assert.equal(reportDigest.total > 0, true);
    assert.equal(reportDigest.verified >= 1, true);
    assert.equal(reportDigest.watched >= 1, true);

    const bulkReport = await postJson("/api/reports", {
      name: "Automated bulk workflow report",
      path: "Local -> National",
      owner: "Workflow Test",
      due: "Today"
    }, nationalToken);
    const bulkSubmittedReports = await postJson("/api/reports/bulk/submit", {
      ids: [bulkReport.id]
    }, nationalToken);
    assert.equal(bulkSubmittedReports.count, 1);
    assert.equal(bulkSubmittedReports.updated[0].state, "Approved");

    const correctionBulkReport = await postJson("/api/reports", {
      name: "Automated bulk correction report",
      path: "Local -> District",
      owner: "Workflow Test",
      due: "Overdue"
    }, nationalToken);
    const bulkCorrectedReports = await postJson("/api/reports/bulk/correction", {
      ids: [correctionBulkReport.id],
      reason: "Automated bulk correction test"
    }, nationalToken);
    assert.equal(bulkCorrectedReports.count, 1);
    assert.equal(bulkCorrectedReports.updated[0].state, "Correction Requested");

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

    const bulkApproval = await postJson("/api/approvals", {
      request: "Automated bulk approval test",
      route: "National -> Executive",
      limit: "$9,100"
    }, nationalToken);
    const bulkApproved = await postJson("/api/approvals/bulk/approve", {
      ids: [bulkApproval.id]
    }, nationalToken);
    assert.equal(bulkApproved.count, 1);
    assert.equal(bulkApproved.updated[0].state, "Approved");

    const bulkRejectApproval = await postJson("/api/approvals", {
      request: "Automated bulk reject test",
      route: "District -> National",
      limit: "$700"
    }, nationalToken);
    const bulkRejected = await postJson("/api/approvals/bulk/reject", {
      ids: [bulkRejectApproval.id],
      reason: "Automated bulk rejection test"
    }, nationalToken);
    assert.equal(bulkRejected.count, 1);
    assert.equal(bulkRejected.updated[0].state, "Rejected");

    const workflowDigest = await getJson("/api/workflows/digest");
    assert.equal(workflowDigest.reportsOpen >= 0, true);
    assert.equal(workflowDigest.approvalsOpen >= 0, true);

    const forbiddenApproval = await rawPost(`/api/approvals/${approvals[0].id}/approve`, {}, localToken);
    assert.equal(forbiddenApproval.status, 403);

    const approvedRequest = await postJson(`/api/approvals/${approvals[0].id}/approve`, {}, nationalToken);
    assert.equal(approvedRequest.state, "Approved");
    assert.equal(approvedRequest.signatures, "complete");

    const signedRequest = await postJson(`/api/approvals/${createdApproval.id}/sign`, {}, nationalToken);
    assert.equal(signedRequest.state, "Signature");
    assert.equal(signedRequest.signatures, "1/2");

    const routedRequest = await postJson(`/api/approvals/${createdApproval.id}/route`, {
      route: "National -> Executive Review",
      state: "Validation"
    }, nationalToken);
    assert.equal(routedRequest.route, "National -> Executive Review");
    assert.equal(routedRequest.state, "Validation");

    const limitedApproval = await postJson(`/api/approvals/${createdApproval.id}/limit`, {
      limit: "$25,000"
    }, nationalToken);
    assert.equal(limitedApproval.limit, "$25,000");

    const delegatedApproval = await postJson(`/api/approvals/${createdApproval.id}/delegate`, {
      delegate: "np@rmvi.org"
    }, nationalToken);
    assert.equal(delegatedApproval.delegate, "np@rmvi.org");
    assert.equal(delegatedApproval.state, "Delegated");

    const heldApproval = await postJson(`/api/approvals/${createdApproval.id}/hold`, {
      reason: "Automated authority review"
    }, nationalToken);
    assert.equal(heldApproval.state, "On Hold");
    assert.equal(heldApproval.holdReason, "Automated authority review");

    const releasedApproval = await postJson(`/api/approvals/${createdApproval.id}/release`, {
      state: "Validation"
    }, nationalToken);
    assert.equal(releasedApproval.state, "Validation");

    const watchedApproval = await postJson(`/api/approvals/${createdApproval.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedApproval.watchers.includes("np@rmvi.org"), true);

    const duplicatedApproval = await postJson(`/api/approvals/${createdApproval.id}/duplicate`, {
      request: "Automated duplicated approval follow-up"
    }, nationalToken);
    assert.equal(duplicatedApproval.request, "Automated duplicated approval follow-up");
    assert.equal(duplicatedApproval.state, "Validation");

    const archivedApproval = await postJson(`/api/approvals/${createdApproval.id}/archive`, {
      reason: "Automated approval archive"
    }, nationalToken);
    assert.equal(archivedApproval.archived, true);

    const bulkSigned = await postJson("/api/approvals/bulk/sign", {
      ids: [duplicatedApproval.id],
      signatures: "1/2"
    }, nationalToken);
    assert.equal(bulkSigned.count, 1);
    assert.equal(bulkSigned.updated[0].state, "Signature");

    const approvalDigest = await getJson("/api/approvals/digest", nationalToken);
    assert.equal(approvalDigest.total > 0, true);
    assert.equal(approvalDigest.watched >= 1, true);
    assert.equal(approvalDigest.archived >= 1, true);

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

    const assignedTask = await postJson(`/api/tasks/${tasks[1].id}/assignee`, {
      assignee: "np@rmvi.org"
    }, nationalToken);
    assert.equal(assignedTask.assignee, "np@rmvi.org");

    const priorityTask = await postJson(`/api/tasks/${tasks[1].id}/priority`, {
      priority: "Critical"
    }, nationalToken);
    assert.equal(priorityTask.priority, "Critical");

    const dueTask = await postJson(`/api/tasks/${tasks[1].id}/due`, {
      due: "Overdue"
    }, nationalToken);
    assert.equal(dueTask.due, "Overdue");

    const ownerTask = await postJson(`/api/tasks/${tasks[1].id}/owner`, {
      owner: "National Presidency Workstation"
    }, nationalToken);
    assert.equal(ownerTask.owner, "National Presidency Workstation");

    const blockedTask = await postJson(`/api/tasks/${tasks[1].id}/block`, {
      reason: "Awaiting supporting evidence"
    }, nationalToken);
    assert.equal(blockedTask.status, "Blocked");
    assert.equal(blockedTask.blocker, "Awaiting supporting evidence");

    const watchedTask = await postJson(`/api/tasks/${tasks[1].id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedTask.watchers.includes("np@rmvi.org"), true);

    const duplicatedTask = await postJson(`/api/tasks/${tasks[1].id}/duplicate`, {
      title: "Automated duplicate task follow-up"
    }, nationalToken);
    assert.equal(duplicatedTask.title, "Automated duplicate task follow-up");
    assert.equal(duplicatedTask.status, "Queued");

    const bulkCompletedTasks = await postJson("/api/tasks/bulk/complete", {
      ids: [createdTask.id]
    }, nationalToken);
    assert.equal(bulkCompletedTasks.count, 1);
    assert.equal(bulkCompletedTasks.updated[0].status, "Complete");

    const taskDigest = await getJson("/api/tasks/digest", nationalToken);
    assert.equal(taskDigest.total > 0, true);
    assert.equal(taskDigest.blocked >= 1, true);
    assert.equal(taskDigest.watched >= 1, true);

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

    const statusPolicy = await postJson(`/api/policies/${policies[0].id}/status`, {
      status: "Review"
    }, nationalToken);
    assert.equal(statusPolicy.status, "Review");

    const retiredPolicy = await postJson(`/api/policies/${policies[1].id}/retire`, {
      reason: "Replaced by updated transfer policy"
    }, nationalToken);
    assert.equal(retiredPolicy.status, "Retired");

    const ownerPolicy = await postJson(`/api/policies/${policies[0].id}/owner`, {
      owner: "National Policy Desk"
    }, nationalToken);
    assert.equal(ownerPolicy.owner, "National Policy Desk");

    const categoryPolicy = await postJson(`/api/policies/${policies[0].id}/category`, {
      category: "Governance"
    }, nationalToken);
    assert.equal(categoryPolicy.category, "Governance");

    const summaryPolicy = await postJson(`/api/policies/${policies[0].id}/summary`, {
      summary: "Automated updated policy summary."
    }, nationalToken);
    assert.equal(summaryPolicy.summary, "Automated updated policy summary.");

    const versionPolicy = await postJson(`/api/policies/${policies[0].id}/version`, {
      version: "v2",
      status: "Review"
    }, nationalToken);
    assert.equal(versionPolicy.version, "v2");
    assert.equal(versionPolicy.status, "Review");

    const reviewPolicy = await postJson(`/api/policies/${policies[0].id}/review`, {
      reviewBy: "2026-06-30"
    }, nationalToken);
    assert.equal(reviewPolicy.reviewBy, "2026-06-30");
    assert.equal(reviewPolicy.status, "Review");

    const watchedPolicy = await postJson(`/api/policies/${policies[0].id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedPolicy.watchers.includes("np@rmvi.org"), true);

    const duplicatedPolicy = await postJson(`/api/policies/${policies[0].id}/duplicate`, {
      title: "Automated duplicate policy revision"
    }, nationalToken);
    assert.equal(duplicatedPolicy.title, "Automated duplicate policy revision");
    assert.equal(duplicatedPolicy.status, "Draft");

    const bulkActivatedPolicies = await postJson("/api/policies/bulk/activate", {
      ids: [duplicatedPolicy.id]
    }, nationalToken);
    assert.equal(bulkActivatedPolicies.count, 1);
    assert.equal(bulkActivatedPolicies.updated[0].status, "Active");

    const policyDigest = await getJson("/api/policies/digest", nationalToken);
    assert.equal(policyDigest.total > 0, true);
    assert.equal(policyDigest.active >= 1, true);
    assert.equal(policyDigest.watched >= 1, true);

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

    const datedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/date`, {
      date: "2026-06-01"
    }, nationalToken);
    assert.equal(datedCalendarEvent.date, "2026-06-01");

    const priorityCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/priority`, {
      priority: "Critical"
    }, nationalToken);
    assert.equal(priorityCalendarEvent.priority, "Critical");

    const atRiskCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/risk`, {
      reason: "Deadline requires attention"
    }, nationalToken);
    assert.equal(atRiskCalendarEvent.status, "At Risk");

    const ownerCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/owner`, {
      owner: "National Calendar Desk"
    }, nationalToken);
    assert.equal(ownerCalendarEvent.owner, "National Calendar Desk");

    const categoryCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/category`, {
      category: "Governance"
    }, nationalToken);
    assert.equal(categoryCalendarEvent.category, "Governance");

    const rescheduledCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/reschedule`, {
      date: "2026-06-07"
    }, nationalToken);
    assert.equal(rescheduledCalendarEvent.date, "2026-06-07");
    assert.equal(rescheduledCalendarEvent.status, "Scheduled");

    const watchedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedCalendarEvent.watchers.includes("np@rmvi.org"), true);

    const duplicatedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/duplicate`, {
      title: "Automated duplicate calendar review",
      date: "2026-06-14"
    }, nationalToken);
    assert.equal(duplicatedCalendarEvent.title, "Automated duplicate calendar review");
    assert.equal(duplicatedCalendarEvent.status, "Scheduled");

    const bulkCompletedCalendarEvents = await postJson("/api/calendar-events/bulk/complete", {
      ids: [createdCalendarEvent.id]
    }, nationalToken);
    assert.equal(bulkCompletedCalendarEvents.count, 1);
    assert.equal(bulkCompletedCalendarEvents.updated[0].status, "Complete");

    const calendarDigest = await getJson("/api/calendar-events/digest", nationalToken);
    assert.equal(calendarDigest.total > 0, true);
    assert.equal(calendarDigest.watched >= 1, true);
    assert.equal(calendarDigest.complete >= 1, true);

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

    const reassignedPerson = await postJson(`/api/personnel/${personnel[0].id}/assignment`, {
      assignedStation: "Regional Review Desk",
      status: "Transfer Pending"
    }, nationalToken);
    assert.equal(reassignedPerson.assignedStation, "Regional Review Desk");
    assert.equal(reassignedPerson.status, "Transfer Pending");

    const rolePerson = await postJson(`/api/personnel/${personnel[0].id}/role`, {
      role: "Governance Liaison"
    }, nationalToken);
    assert.equal(rolePerson.role, "Governance Liaison");

    const deactivatedPerson = await postJson(`/api/personnel/${personnel[1].id}/deactivate`, {
      reason: "Automated deactivation test"
    }, nationalToken);
    assert.equal(deactivatedPerson.status, "Inactive");

    const onboardedPerson = await postJson(`/api/personnel/${createdPerson.id}/onboard`, {
      reason: "Automated onboarding test"
    }, nationalToken);
    assert.equal(onboardedPerson.status, "Onboarding");
    assert.equal(onboardedPerson.credentialStatus, "Provisioning");

    const credentialPerson = await postJson(`/api/personnel/${createdPerson.id}/credentials/reset`, {
      reason: "Automated credential reset test"
    }, nationalToken);
    assert.equal(credentialPerson.credentialStatus, "Reset required");

    const leavePerson = await postJson(`/api/personnel/${createdPerson.id}/leave`, {
      reason: "Automated leave test"
    }, nationalToken);
    assert.equal(leavePerson.status, "On Leave");

    const clearancePerson = await postJson(`/api/personnel/${createdPerson.id}/clearance`, {
      clearance: "Executive"
    }, nationalToken);
    assert.equal(clearancePerson.clearance, "Executive");

    const personnelDigest = await getJson("/api/personnel/digest");
    assert.equal(personnelDigest.nextPerson.length > 0, true);
    assert.equal(personnelDigest.transferPending >= 0, true);

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

    const ownedEscalation = await postJson(`/api/escalations/${escalation.id}/owner`, {
      owner: "National Presidency Workstation"
    }, nationalToken);
    assert.equal(ownedEscalation.owner, "National Presidency Workstation");

    const severityEscalation = await postJson(`/api/escalations/${escalation.id}/severity`, {
      severity: "Critical"
    }, nationalToken);
    assert.equal(severityEscalation.severity, "Critical");

    const triagedEscalation = await postJson(`/api/escalations/${escalation.id}/triage`, {
      owner: "National Triage Desk",
      severity: "Critical"
    }, nationalToken);
    assert.equal(triagedEscalation.owner, "National Triage Desk");
    assert.equal(triagedEscalation.status, "Open");

    const slaEscalation = await postJson(`/api/escalations/${escalation.id}/sla`, {
      sla: "4 hours"
    }, nationalToken);
    assert.equal(slaEscalation.sla, "4 hours");

    const watchedEscalation = await postJson(`/api/escalations/${escalation.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedEscalation.watchers.includes("np@rmvi.org"), true);

    const escalationDigest = await getJson("/api/escalations/digest");
    assert.equal(escalationDigest.open >= 1, true);
    assert.equal(escalationDigest.critical >= 1, true);

    const mergedEscalation = await postJson(`/api/escalations/${escalation.id}/merge`, {
      target: "Automated primary escalation"
    }, nationalToken);
    assert.equal(mergedEscalation.status, "Merged");

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

    const supervisedOffice = await postJson(`/api/offices/${office.id}/supervisor`, {
      supervisor: "International Headquarters"
    }, nationalToken);
    assert.equal(supervisedOffice.supervisor, "International Headquarters");

    const activatedOffice = await postJson(`/api/offices/${office.id}/activate`, {}, nationalToken);
    assert.equal(activatedOffice.status, "Active");

    const rotatedOffice = await postJson(`/api/offices/${office.id}/password/rotate`, {
      password: "gcos-automated-rotated"
    }, nationalToken);
    assert.equal(rotatedOffice.password, "gcos-automated-rotated");

    const activeStationOffice = await postJson(`/api/offices/${office.id}/station/activate`, {}, nationalToken);
    assert.equal(activeStationOffice.status, "Active");

    const suspendedAgainOffice = await postJson(`/api/offices/${office.id}/suspend`, {
      reason: "Automated office suspension test"
    }, nationalToken);
    assert.equal(suspendedAgainOffice.status, "Suspended");

    const officeDigest = await getJson("/api/offices/digest");
    assert.equal(officeDigest.total >= 1, true);
    assert.equal(officeDigest.stationIdentities >= 1, true);

    const officeLogin = await postJson("/api/auth/login", {
      email: "automated_district@gcos.org",
      password: "gcos-automated-rotated"
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

    const preparedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/prepare`, {
      note: "Automated transfer preparation"
    }, nationalToken);
    assert.equal(preparedTransfer.step, "Pre-migration checklist");

    const acknowledgedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/acknowledge`, {}, nationalToken);
    assert.equal(acknowledgedTransfer.step, "Permissions migration");
    assert.equal(acknowledgedTransfer.risk, "Acknowledgement recorded");

    const riskTransfer = await postJson(`/api/transfers/${createdTransfer.id}/risk`, {
      risk: "Supervisor review required"
    }, nationalToken);
    assert.equal(riskTransfer.risk, "Supervisor review required");

    const accessRevokedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/revoke-access`, {
      reason: "Automated revoke access test"
    }, nationalToken);
    assert.equal(accessRevokedTransfer.step, "Previous access revoked");

    const activatedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/activate-station`, {}, nationalToken);
    assert.equal(activatedTransfer.step, "New station activated");

    const verifiedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/verify`, {
      result: "Automated verification test"
    }, nationalToken);
    assert.equal(verifiedTransfer.step, "Verified");

    const transferDigest = await getJson("/api/transfers/digest");
    assert.equal(transferDigest.total >= 1, true);
    assert.equal(transferDigest.nextTransfer.length > 0, true);

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

    const classifiedDocument = await postJson(`/api/documents/${document.id}/classification`, {
      classification: "Executive packet"
    }, nationalToken);
    assert.equal(classifiedDocument.classification, "Executive packet");

    const ownedDocument = await postJson(`/api/documents/${document.id}/owner`, {
      owner: "np@rmvi.org"
    }, nationalToken);
    assert.equal(ownedDocument.owner, "np@rmvi.org");

    const reviewDocument = await postJson(`/api/documents/${document.id}/review`, {
      reason: "Automated review test"
    }, nationalToken);
    assert.equal(reviewDocument.status, "In Review");

    const archivedDocument = await postJson(`/api/documents/${document.id}/archive`, {
      reason: "Automated archive test"
    }, nationalToken);
    assert.equal(archivedDocument.status, "Archived");

    const sealedDocument = await postJson(`/api/documents/${document.id}/seal`, {
      reason: "Automated seal test"
    }, nationalToken);
    assert.equal(sealedDocument.status, "Sealed");

    const heldDocument = await postJson(`/api/documents/${document.id}/hold`, {
      reason: "Automated hold test"
    }, nationalToken);
    assert.equal(heldDocument.status, "Legal Hold");

    const retainedDocument = await postJson(`/api/documents/${document.id}/retention`, {
      retainedUntil: "Review in 2031"
    }, nationalToken);
    assert.equal(retainedDocument.retainedUntil, "Review in 2031");

    const duplicatedDocument = await postJson(`/api/documents/${document.id}/duplicate`, {
      name: "Automated duplicate packet.pdf",
      owner: "np@rmvi.org"
    }, nationalToken);
    assert.equal(duplicatedDocument.name, "Automated duplicate packet.pdf");
    assert.equal(duplicatedDocument.classification, classifiedDocument.classification);

    const archiveManifest = await getJson("/api/archive/manifest", nationalToken);
    assert.equal(archiveManifest.total >= 1, true);
    assert.equal(archiveManifest.byStatus["Legal Hold"] >= 1, true);

    const auditNote = await postJson("/api/audit/note", {
      object: "Automated audit test",
      note: "Manual test note"
    }, nationalToken);
    assert.equal(auditNote.event, "AuditNote");

    const flaggedAudit = await postJson(`/api/audit/${auditNote.id}/flag`, {
      reason: "Automated flag test"
    }, nationalToken);
    assert.match(flaggedAudit.result, /^Flagged:/);

    const sealedAudit = await postJson(`/api/audit/${auditNote.id}/seal`, {
      reason: "Automated seal test"
    }, nationalToken);
    assert.equal(sealedAudit.sealed, true);
    assert.match(sealedAudit.chainHash, /^sha256:/);

    const verifiedAudit = await postJson(`/api/audit/${auditNote.id}/verify`, {
      result: "Automated integrity verified"
    }, nationalToken);
    assert.equal(verifiedAudit.verified, true);
    assert.equal(verifiedAudit.verification, "Automated integrity verified");

    const bulkAuditFlag = await postJson("/api/audit/bulk/flag", {
      ids: [auditNote.id],
      reason: "Automated bulk flag test"
    }, nationalToken);
    assert.equal(bulkAuditFlag.count, 1);

    const auditDigest = await getJson("/api/audit/digest", nationalToken);
    assert.equal(auditDigest.total > 0, true);
    assert.equal(auditDigest.sealed >= 1, true);
    assert.equal(auditDigest.verified >= 1, true);

    const manualEvent = await postJson("/api/events", {
      object: "Automated event test",
      result: "Manual event test"
    }, nationalToken);
    assert.match(manualEvent.event, /^ManualEventRecorded:/);

    const archivedSnapshotDocument = await postJson("/api/export/archive", {
      reason: "Automated snapshot archive test"
    }, nationalToken);
    assert.equal(archivedSnapshotDocument.classification, "Governance snapshot");
    assert.equal(archivedSnapshotDocument.source, "Audit");

    const clearedEvents = await postJson("/api/events/clear", {
      reason: "Automated event clear test"
    }, nationalToken);
    assert.equal(clearedEvents.events[0], "EventLogCleared: Event bus");

    const draft = await postJson("/api/ai-drafts", {
      kind: "Executive Summary",
      focus: "Automated workflow test"
    }, nationalToken);
    assert.equal(draft.title, "Executive Summary: Automated workflow test");
    assert.equal(draft.sourceCount > 0, true);

    const refreshedDraft = await postJson(`/api/ai-drafts/${draft.id}/refresh`, {
      focus: "Automated refreshed workflow test"
    }, nationalToken);
    assert.equal(refreshedDraft.title, "Executive Summary: Automated refreshed workflow test");
    assert.equal(refreshedDraft.sourceCount > 0, true);

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
    assert.equal(persisted.messages.some((item) => item.subject === "Automated API test notice"), true);
    assert.equal(persisted.messages.some((item) => item.subject === "Automated duplicated ChurchMail notice"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfflineActionTest"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionRenewed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionFlagged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionRevoked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationSessionsRevoked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CommandBriefingArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CommandDirectiveIssued"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CommandTaskCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CommandEscalationOpened"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailClassified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailRouteUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailPriorityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailEscalated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailApproved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailsBulkApproved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportPathUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportEvidenceUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportReviewStarted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportScoreUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportDueUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportsBulkSubmitted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportsBulkCorrectionRequested"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalLimitUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalDelegated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalHeld"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalHoldReleased"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalsBulkSigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalSigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalRouteUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalsBulkApproved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalsBulkRejected"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftGenerated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskAdvanced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskAssigneeUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskPriorityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskDueUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskBlocked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TasksBulkCompleted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyPublished"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyCategoryUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicySummaryUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyVersionBumped"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyReviewScheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PoliciesBulkActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventCompleted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarDateUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarPriorityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventAtRisk"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarCategoryUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventRescheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventsBulkCompleted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonRegistered"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonAssignmentUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonRoleUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonOnboardingStarted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonCredentialsReset"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonLeavePlaced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonClearanceUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeSupervisorUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeSuspended"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficePasswordRotated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeStationActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationTriaged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationSlaUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationMerged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferRiskUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferPrepared"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferAccessRevoked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferStationActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferExecuted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentClassificationUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentHoldPlaced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentRetentionUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditNote"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowFlagged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowsBulkFlagged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ManualEventRecorded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "GovernanceSnapshotArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventLogCleared"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftRefreshed"), true);

    await stopApi(api);
    api = await startApi(dataPath, webDistPath);

    const messagesAfterRestart = await getJson("/api/messages");
    assert.equal(messagesAfterRestart.some((item) => item.subject === "Automated API test notice"), true);
    assert.equal(messagesAfterRestart.some((item) => item.subject === "Automated duplicated ChurchMail notice"), true);

    const reportsAfterRestart = await getJson("/api/reports");
    assert.equal(reportsAfterRestart.some((item) => item.name === "Automated mission finance report"), true);

    const approvalsAfterRestart = await getJson("/api/approvals");
    assert.equal(approvalsAfterRestart.some((item) => item.request === "Automated approval creation test"), true);

    const tasksAfterRestart = await getJson("/api/tasks");
    assert.equal(tasksAfterRestart.some((item) => item.title === "Automated task creation test"), true);
    assert.equal(tasksAfterRestart.some((item) => item.title === "Automated duplicate task follow-up"), true);

    const policiesAfterRestart = await getJson("/api/policies");
    assert.equal(policiesAfterRestart.some((item) => item.title === "Automated policy registry test"), true);
    assert.equal(policiesAfterRestart.some((item) => item.title === "Automated duplicate policy revision"), true);

    const calendarEventsAfterRestart = await getJson("/api/calendar-events");
    assert.equal(calendarEventsAfterRestart.some((item) => item.title === "Automated calendar event test"), true);
    assert.equal(calendarEventsAfterRestart.some((item) => item.title === "Automated duplicate calendar review"), true);

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
