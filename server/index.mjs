import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { audit, createSeedState, getPermissions, normalizeStationEmail } from "./domain.mjs";
import { createServices } from "./services.mjs";
import { createStorageAdapter } from "./storage/index.mjs";
import { validateRequest } from "./validation.mjs";

const PORT = Number(process.env.GCOS_API_PORT ?? process.env.PORT ?? 8787);
const HOST = process.env.GCOS_HOST ?? "127.0.0.1";
const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_PATH = join(SERVER_DIR, "..", "data", "gcos-state.json");
const DATA_PATH = process.env.GCOS_DATA_PATH ?? DEFAULT_DATA_PATH;
const STORAGE_PROVIDER = process.env.GCOS_STORAGE_PROVIDER ?? "json";
const DATABASE_URL = process.env.GCOS_DATABASE_URL ?? "";
const OBJECT_VAULT_PATH = process.env.GCOS_OBJECT_VAULT_PATH ?? join(dirname(DATA_PATH), "object-vault");
const SERVE_WEB = process.env.GCOS_SERVE_WEB === "1";
const WEB_DIST_PATH = process.env.GCOS_WEB_DIST_PATH ?? join(SERVER_DIR, "..", "dist");
const DOMAIN = process.env.GCOS_DOMAIN ?? "rmvi.org";
const DEPLOYMENT_TARGET = process.env.GCOS_DEPLOYMENT_TARGET ?? "";
const STARTED_AT = new Date();
const ALLOWED_ORIGIN = process.env.GCOS_ALLOWED_ORIGIN ?? "*";
const parsedMaxBodyBytes = Number(process.env.GCOS_MAX_BODY_BYTES ?? 1024 * 1024);
const MAX_BODY_BYTES = Number.isFinite(parsedMaxBodyBytes) && parsedMaxBodyBytes > 0
  ? parsedMaxBodyBytes
  : 1024 * 1024;
const DEV_RESET_ENABLED = process.env.GCOS_ENABLE_DEV_RESET === "1" || process.env.NODE_ENV !== "production";
const LOGIN_RATE_LIMIT = positiveNumber(process.env.GCOS_LOGIN_RATE_LIMIT, 8);
const LOGIN_RATE_WINDOW_MS = positiveNumber(process.env.GCOS_LOGIN_RATE_WINDOW_MS, 5 * 60 * 1000);
const MUTATION_RATE_LIMIT = positiveNumber(process.env.GCOS_MUTATION_RATE_LIMIT, 2000);
const MUTATION_RATE_WINDOW_MS = positiveNumber(process.env.GCOS_MUTATION_RATE_WINDOW_MS, 60 * 1000);
const storage = createStorageAdapter({ provider: STORAGE_PROVIDER, dataPath: DATA_PATH, databaseUrl: DATABASE_URL });

const state = await loadState();
const services = createServices({ state, record, requirePermission, findById });
const sessions = new Map();
const rateLimitBuckets = new Map();

const routes = {
  "GET /health": () => ok({ status: "ok", service: "gcos-api", time: new Date().toISOString() }),
  "GET /api/readiness": () => ok(readinessReport()),
  "GET /api/readiness/digest": () => ok(readinessDigest()),
  "POST /api/readiness/bulk/acknowledge": ({ body, session }) => ok(bulkAcknowledgeReadiness(body, session.email)),
  "POST /api/readiness/:name/acknowledge": ({ params, body, session }) => ok(acknowledgeReadiness(params.name, body, session.email)),
  "POST /api/readiness/:name/override": ({ params, body, session }) => ok(overrideReadiness(params.name, body, session.email)),
  "POST /api/readiness/:name/owner": ({ params, body, session }) => ok(assignReadinessOwner(params.name, body, session.email)),
  "POST /api/readiness/:name/recheck": ({ params, body, session }) => ok(scheduleReadinessRecheck(params.name, body, session.email)),
  "POST /api/readiness/:name/remediation": ({ params, body, session }) => createdResponse(createReadinessRemediation(params.name, body, session.email)),
  "POST /api/readiness/:name/archive": ({ params, body, session }) => ok(archiveReadiness(params.name, body, session.email)),
  "GET /api/security-controls": () => ok(securityControlsReport()),
  "GET /api/security-controls/digest": () => ok(securityControlsDigest()),
  "POST /api/security-controls/bulk/test": ({ body, session }) => ok(bulkTestSecurityControls(body, session.email)),
  "POST /api/security-controls/:name/status": ({ params, body, session }) => ok(updateSecurityControlStatus(params.name, body, session.email)),
  "POST /api/security-controls/:name/owner": ({ params, body, session }) => ok(assignSecurityControlOwner(params.name, body, session.email)),
  "POST /api/security-controls/:name/evidence": ({ params, body, session }) => ok(attachSecurityControlEvidence(params.name, body, session.email)),
  "POST /api/security-controls/:name/test": ({ params, body, session }) => ok(testSecurityControl(params.name, body, session.email)),
  "POST /api/security-controls/:name/rotate": ({ params, body, session }) => ok(rotateSecurityControl(params.name, body, session.email)),
  "POST /api/security-controls/:name/exception": ({ params, body, session }) => ok(openSecurityControlException(params.name, body, session.email)),
  "POST /api/security-controls/:name/remediation": ({ params, body, session }) => createdResponse(createSecurityControlRemediation(params.name, body, session.email)),
  "POST /api/security-controls/:name/verify": ({ params, body, session }) => ok(verifySecurityControl(params.name, body, session.email)),
  "GET /api/status": () => ok(operationalStatus()),
  "GET /api/ops/monitor": async () => ok(await operationalMonitor()),
  "POST /api/ops/monitor": async ({ session }) => ok(await recordOperationalMonitor(session.email)),
  "GET /api/project/completion": async () => ok(await projectCompletionReport()),
  "GET /api/enterprise/completion": async () => ok(await enterpriseCompletionReport()),
  "GET /api/rollout/readiness": async () => ok(await rolloutReadinessReport()),
  "GET /api/production/secrets-plan": () => ok(productionSecretsPlan()),
  "GET /api/launch/readiness": async () => ok(await launchReadiness()),
  "POST /api/launch/readiness": async ({ session }) => ok(await recordLaunchReadiness(session.email)),
  "GET /api/launch/deployment-plan": async () => ok(await launchDeploymentPlan()),
  "POST /api/launch/deployment-plan": async ({ session }) => ok(await recordLaunchDeploymentPlan(session.email)),
  "GET /api/launch/signoff": async () => ok(await launchSignoffMatrix()),
  "POST /api/launch/signoff": async ({ session }) => ok(await recordLaunchSignoff(session.email)),
  "GET /api/files": () => ok(state.files ?? []),
  "POST /api/files/upload": async ({ body, session }) => createdResponse(await uploadFile(body, session.email)),
  "GET /api/files/:id/download": async ({ params, session }) => readStoredFile(params.id, session.email),
  "POST /api/documents/:id/file": ({ params, body, session }) => ok(linkDocumentFile(params.id, body, session.email)),
  "POST /api/reports/:id/file": ({ params, body, session }) => ok(linkReportFile(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/file": ({ params, body, session }) => ok(linkEvidenceFile(params.id, body, session.email)),
  "GET /api/persistence/status": async () => ok(await persistenceStatus()),
  "POST /api/persistence/backup": async ({ body, session }) => createdResponse(await createPersistenceBackup(body, session.email)),
  "GET /api/persistence/backup-manifest": async () => ok(await persistenceBackupManifest()),
  "POST /api/persistence/backup-manifest": async ({ session }) => ok(await recordPersistenceBackupManifest(session.email)),
  "GET /api/persistence/restore-drill": async () => ok(await persistenceRestoreDrill()),
  "POST /api/persistence/restore-drill": async ({ session }) => ok(await recordPersistenceRestoreDrill(session.email)),
  "POST /api/persistence/verify": async ({ session }) => ok(await verifyPersistence(session.email)),
  "GET /api/persistence/export": ({ session }) => ok(persistenceExport(session.email)),
  "GET /api/persistence/migration-plan": () => ok(persistenceMigrationPlan()),
  "POST /api/persistence/migration-export": async ({ body, session }) => createdResponse(await createPersistenceMigrationExport(body, session.email)),
  "GET /api/persistence/schema-plan": () => ok(persistenceSchemaPlan()),
  "POST /api/persistence/schema-export": async ({ body, session }) => createdResponse(await createPersistenceSchemaExport(body, session.email)),
  "GET /api/persistence/import-dry-run": () => ok(persistenceImportDryRun()),
  "POST /api/persistence/import-dry-run": ({ session }) => ok(recordPersistenceImportDryRun(session.email)),
  "GET /api/persistence/cutover-checklist": () => ok(persistenceCutoverChecklist()),
  "POST /api/persistence/cutover-checklist": ({ session }) => ok(recordPersistenceCutoverChecklist(session.email)),
  "GET /api/sessions": () => ok(sessionSummary({ includeIds: true })),
  "GET /api/sessions/digest": () => ok(sessionDigest()),
  "POST /api/sessions/renew": ({ session }) => ok(renewSession(session.token, session.email)),
  "POST /api/sessions/station/revoke": ({ session, body }) => ok(revokeStationSessions(body.email ?? session.email, session.token, session.email)),
  "POST /api/sessions/bulk/revoke": ({ session, body }) => ok(bulkRevokeSessions(body, session.token, session.email)),
  "POST /api/sessions/:id/revoke": ({ params, session }) => ok(revokeSession(params.id, session.email)),
  "POST /api/sessions/:id/flag": ({ params, session, body }) => ok(flagSession(params.id, session.email, body.reason)),
  "POST /api/sessions/:id/extend": ({ params, session, body }) => ok(extendSession(params.id, session.email, body.minutes)),
  "POST /api/sessions/:id/lock": ({ params, session, body }) => ok(lockSession(params.id, session.email, body.reason)),
  "POST /api/sessions/:id/unlock": ({ params, session, body }) => ok(unlockSession(params.id, session.email, body.reason)),
  "POST /api/sessions/:id/trust": ({ params, session, body }) => ok(trustSession(params.id, session.email, body.reason)),
  "POST /api/sessions/:id/mfa": ({ params, session, body }) => ok(requireSessionMfa(params.id, session.email, body.reason)),
  "POST /api/sessions/:id/device": ({ params, session, body }) => ok(labelSessionDevice(params.id, session.email, body.label)),
  "POST /api/sessions/:id/note": ({ params, session, body }) => ok(noteSession(params.id, session.email, body.note)),
  "GET /api/bootstrap": () => ok(services.publicState()),
  "GET /api/command-center/briefing": () => ok(services.commandBriefing()),
  "POST /api/command-center/briefing/archive": ({ session, body }) => createdResponse(services.archiveCommandBriefing({ ...body, actor: session.email })),
  "POST /api/command-center/directive": ({ session, body }) => createdResponse(services.issueCommandDirective({ ...body, actor: session.email })),
  "POST /api/command-center/task": ({ session, body }) => createdResponse(services.createCommandTask({ ...body, actor: session.email })),
  "POST /api/command-center/escalation": ({ session, body }) => createdResponse(services.openCommandEscalation({ ...body, actor: session.email })),
  "POST /api/dev/reset": () => {
    if (!DEV_RESET_ENABLED) throw new HttpError(403, "Development reset is disabled");
    Object.assign(state, createSeedState());
    record("DevReset", "System", "GCOS API", "Seed state restored");
    return ok(services.publicState());
  },
  "GET /api/stations": () => ok(state.stations),
  "GET /api/station-auth": () => ok(services.stationAuthRegistry()),
  "GET /api/station-auth/digest": () => ok(services.stationAuthDigest()),
  "GET /api/hierarchy/digest": () => ok(services.hierarchyDigest()),
  "POST /api/stations/bulk/verify": ({ body }) => ok(services.bulkVerifyStations(body)),
  "POST /api/stations/:id/level": ({ params, body }) => ok(services.updateStationLevel(params.id, body)),
  "POST /api/stations/:id/authority": ({ params, body }) => ok(services.updateStationAuthority(params.id, body)),
  "POST /api/stations/:id/verify": ({ params, body }) => ok(services.verifyStation(params.id, body)),
  "POST /api/stations/:id/watch": ({ params, body }) => ok(services.watchStation(params.id, body)),
  "POST /api/stations/:id/suspend": ({ params, body }) => ok(services.suspendStation(params.id, body)),
  "POST /api/stations/:id/activate": ({ params, body }) => ok(services.activateStation(params.id, body)),
  "POST /api/stations/:id/mirror": ({ params, body }) => createdResponse(services.mirrorStation(params.id, body)),
  "POST /api/stations/:id/credential/rotate": ({ params, body }) => ok(services.rotateStationCredential(params.id, body)),
  "POST /api/stations/:id/credential/reset": ({ params, body }) => ok(services.forceStationPasswordReset(params.id, body)),
  "POST /api/stations/:id/credential/mfa": ({ params, body }) => ok(services.requireStationMfa(params.id, body)),
  "POST /api/stations/:id/credential/lock": ({ params, body }) => ok(services.lockStationCredential(params.id, body)),
  "POST /api/stations/:id/credential/unlock": ({ params, body }) => ok(services.unlockStationCredential(params.id, body)),
  "GET /api/messages": () => ok(state.messages),
  "POST /api/messages": ({ body }) => createdResponse(services.createMessage(body)),
  "POST /api/messages/bulk/approve": ({ body }) => ok(services.bulkApproveMessages(body)),
  "GET /api/messages/digest": () => ok(services.messageDigest()),
  "POST /api/messages/:id/classify": ({ params, body }) => ok(services.classifyMessage(params.id, body)),
  "POST /api/messages/:id/status": ({ params, body }) => ok(services.updateMessageStatus(params.id, body)),
  "POST /api/messages/:id/route": ({ params, body }) => ok(services.updateMessageRoute(params.id, body)),
  "POST /api/messages/:id/priority": ({ params, body }) => ok(services.updateMessagePriority(params.id, body)),
  "POST /api/messages/:id/escalate": ({ params, body }) => ok(services.escalateMessage(params.id, body)),
  "POST /api/messages/:id/approve": ({ params, body }) => ok(services.approveMessage(params.id, body)),
  "POST /api/messages/:id/archive": ({ params, body }) => ok(services.archiveMessage(params.id, body)),
  "POST /api/messages/:id/watch": ({ params, body }) => ok(services.watchMessage(params.id, body)),
  "POST /api/messages/:id/duplicate": ({ params, body }) => createdResponse(services.duplicateMessage(params.id, body)),
  "GET /api/reports": () => ok(state.reports),
  "POST /api/reports": ({ body }) => createdResponse(services.createReport(body)),
  "POST /api/reports/:id/submit": ({ params, body }) => ok(services.submitReport(params.id, body)),
  "POST /api/reports/:id/correction": ({ params, body }) => ok(services.requestReportCorrection(params.id, body)),
  "POST /api/reports/:id/due": ({ params, body }) => ok(services.updateReportDue(params.id, body)),
  "POST /api/reports/:id/score": ({ params, body }) => ok(services.updateReportScore(params.id, body)),
  "POST /api/reports/:id/owner": ({ params, body }) => ok(services.updateReportOwner(params.id, body)),
  "POST /api/reports/:id/path": ({ params, body }) => ok(services.updateReportPath(params.id, body)),
  "POST /api/reports/:id/details": ({ params, body, session }) => ok(services.updateReportDetails(params.id, { ...body, actor: session.email })),
  "POST /api/reports/:id/evidence": ({ params, body }) => ok(services.markReportEvidence(params.id, body)),
  "POST /api/reports/:id/review": ({ params, body }) => ok(services.reviewReport(params.id, body)),
  "POST /api/reports/:id/verify": ({ params, body }) => ok(services.verifyReport(params.id, body)),
  "POST /api/reports/:id/packet": ({ params, body, session }) => createdResponse(services.buildReportGovernancePacket(params.id, { ...body, actor: session.email })),
  "POST /api/reports/:id/watch": ({ params, body }) => ok(services.watchReport(params.id, body)),
  "POST /api/reports/:id/duplicate": ({ params, body }) => createdResponse(services.duplicateReport(params.id, body)),
  "POST /api/reports/:id/archive": ({ params, body }) => ok(services.archiveReport(params.id, body)),
  "POST /api/reports/bulk/submit": ({ body }) => ok(services.bulkSubmitReports(body)),
  "POST /api/reports/bulk/correction": ({ body }) => ok(services.bulkRequestReportCorrections(body)),
  "GET /api/reports/digest": () => ok(services.reportDigest()),
  "GET /api/approvals": () => ok(state.approvals),
  "POST /api/approvals": ({ body }) => createdResponse(services.createApproval(body)),
  "POST /api/approvals/:id/approve": ({ params, body }) => ok(services.approveRequest(params.id, body)),
  "POST /api/approvals/:id/route": ({ params, body }) => ok(services.updateApprovalRoute(params.id, body)),
  "POST /api/approvals/:id/sign": ({ params, body }) => ok(services.signApproval(params.id, body)),
  "POST /api/approvals/:id/reject": ({ params, body }) => ok(services.rejectRequest(params.id, body)),
  "POST /api/approvals/:id/limit": ({ params, body }) => ok(services.updateApprovalLimit(params.id, body)),
  "POST /api/approvals/:id/delegate": ({ params, body }) => ok(services.delegateApproval(params.id, body)),
  "POST /api/approvals/:id/hold": ({ params, body }) => ok(services.holdApproval(params.id, body)),
  "POST /api/approvals/:id/release": ({ params, body }) => ok(services.releaseApprovalHold(params.id, body)),
  "POST /api/approvals/:id/execute": ({ params, body, session }) => createdResponse(services.executeApproval(params.id, { ...body, actor: session.email })),
  "POST /api/approvals/:id/watch": ({ params, body }) => ok(services.watchApproval(params.id, body)),
  "POST /api/approvals/:id/duplicate": ({ params, body }) => createdResponse(services.duplicateApproval(params.id, body)),
  "POST /api/approvals/:id/archive": ({ params, body }) => ok(services.archiveApproval(params.id, body)),
  "POST /api/approvals/bulk/sign": ({ body }) => ok(services.bulkSignApprovals(body)),
  "POST /api/approvals/bulk/approve": ({ body }) => ok(services.bulkApproveRequests(body)),
  "POST /api/approvals/bulk/reject": ({ body }) => ok(services.bulkRejectRequests(body)),
  "GET /api/approvals/digest": () => ok(services.approvalDigest()),
  "GET /api/workflows/digest": () => ok(services.workflowDigest()),
  "GET /api/tasks": () => ok(state.tasks),
  "POST /api/tasks": ({ body }) => createdResponse(services.createTask(body)),
  "POST /api/tasks/:id/advance": ({ params, body }) => ok(services.advanceTask(params.id, body)),
  "POST /api/tasks/:id/assignee": ({ params, body }) => ok(services.updateTaskAssignee(params.id, body)),
  "POST /api/tasks/:id/priority": ({ params, body }) => ok(services.updateTaskPriority(params.id, body)),
  "POST /api/tasks/:id/due": ({ params, body }) => ok(services.updateTaskDue(params.id, body)),
  "POST /api/tasks/:id/owner": ({ params, body }) => ok(services.updateTaskOwner(params.id, body)),
  "POST /api/tasks/:id/block": ({ params, body }) => ok(services.blockTask(params.id, body)),
  "POST /api/tasks/:id/unblock": ({ params, body }) => ok(services.unblockTask(params.id, body)),
  "POST /api/tasks/:id/watch": ({ params, body }) => ok(services.watchTask(params.id, body)),
  "POST /api/tasks/:id/dependency": ({ params, body }) => ok(services.addTaskDependency(params.id, body)),
  "POST /api/tasks/:id/approval": ({ params, body }) => ok(services.requestTaskApproval(params.id, body)),
  "POST /api/tasks/:id/sla": ({ params, body }) => ok(services.updateTaskSla(params.id, body)),
  "POST /api/tasks/:id/evidence": ({ params, body }) => ok(services.attachTaskEvidence(params.id, body)),
  "POST /api/tasks/:id/handoff": ({ params, body }) => ok(services.handoffTask(params.id, body)),
  "POST /api/tasks/:id/escalate": ({ params, body }) => ok(services.escalateTask(params.id, body)),
  "POST /api/tasks/:id/comment": ({ params, body }) => ok(services.commentTask(params.id, body)),
  "POST /api/tasks/:id/checkpoint": ({ params, body }) => ok(services.addTaskCheckpoint(params.id, body)),
  "POST /api/tasks/:id/schedule": ({ params, body }) => ok(services.scheduleTask(params.id, body)),
  "POST /api/tasks/:id/dispatch": ({ params, body }) => ok(services.dispatchTask(params.id, body)),
  "POST /api/tasks/:id/time": ({ params, body }) => ok(services.logTaskTime(params.id, body)),
  "POST /api/tasks/:id/qa": ({ params, body }) => ok(services.qaReviewTask(params.id, body)),
  "POST /api/tasks/:id/risk": ({ params, body }) => ok(services.acceptTaskRisk(params.id, body)),
  "POST /api/tasks/:id/template": ({ params, body }) => ok(services.saveTaskTemplate(params.id, body)),
  "POST /api/tasks/:id/report": ({ params, body }) => ok(services.linkTaskReport(params.id, body)),
  "POST /api/tasks/:id/approval-link": ({ params, body }) => ok(services.linkTaskApproval(params.id, body)),
  "POST /api/tasks/:id/archive": ({ params, body }) => ok(services.archiveTask(params.id, body)),
  "POST /api/tasks/:id/duplicate": ({ params, body }) => createdResponse(services.duplicateTask(params.id, body)),
  "POST /api/tasks/bulk/complete": ({ body }) => ok(services.bulkCompleteTasks(body)),
  "POST /api/tasks/bulk/escalate": ({ body }) => ok(services.bulkEscalateTasks(body)),
  "POST /api/tasks/bulk/schedule": ({ body }) => ok(services.bulkScheduleTasks(body)),
  "GET /api/tasks/digest": () => ok(services.taskDigest()),
  "GET /api/policies": () => ok(state.policies),
  "POST /api/policies": ({ body }) => createdResponse(services.createPolicy(body)),
  "POST /api/policies/:id/acknowledge": ({ params, body }) => ok(services.acknowledgePolicy(params.id, body)),
  "POST /api/policies/:id/status": ({ params, body }) => ok(services.updatePolicyStatus(params.id, body)),
  "POST /api/policies/:id/retire": ({ params, body }) => ok(services.retirePolicy(params.id, body)),
  "POST /api/policies/:id/owner": ({ params, body }) => ok(services.updatePolicyOwner(params.id, body)),
  "POST /api/policies/:id/category": ({ params, body }) => ok(services.updatePolicyCategory(params.id, body)),
  "POST /api/policies/:id/summary": ({ params, body }) => ok(services.updatePolicySummary(params.id, body)),
  "POST /api/policies/:id/version": ({ params, body }) => ok(services.bumpPolicyVersion(params.id, body)),
  "POST /api/policies/:id/review": ({ params, body }) => ok(services.schedulePolicyReview(params.id, body)),
  "POST /api/policies/:id/watch": ({ params, body }) => ok(services.watchPolicy(params.id, body)),
  "POST /api/policies/:id/compliance": ({ params, body }) => ok(services.checkPolicyCompliance(params.id, body)),
  "POST /api/policies/:id/evidence": ({ params, body }) => ok(services.bindPolicyEvidence(params.id, body)),
  "POST /api/policies/:id/distribute": ({ params, body }) => ok(services.distributePolicy(params.id, body)),
  "POST /api/policies/:id/exception": ({ params, body }) => ok(services.grantPolicyException(params.id, body)),
  "POST /api/policies/:id/training": ({ params, body }) => ok(services.assignPolicyTraining(params.id, body)),
  "POST /api/policies/:id/hold": ({ params, body }) => ok(services.holdPolicy(params.id, body)),
  "POST /api/policies/:id/task": ({ params, body }) => ok(services.linkPolicyTask(params.id, body)),
  "POST /api/policies/:id/approval-link": ({ params, body }) => ok(services.linkPolicyApproval(params.id, body)),
  "POST /api/policies/:id/archive": ({ params, body }) => ok(services.archivePolicy(params.id, body)),
  "POST /api/policies/:id/duplicate": ({ params, body }) => createdResponse(services.duplicatePolicy(params.id, body)),
  "POST /api/policies/bulk/activate": ({ body }) => ok(services.bulkActivatePolicies(body)),
  "POST /api/policies/bulk/review": ({ body }) => ok(services.bulkReviewPolicies(body)),
  "GET /api/policies/digest": () => ok(services.policyDigest()),
  "GET /api/calendar-events": () => ok(state.calendarEvents),
  "POST /api/calendar-events": ({ body }) => createdResponse(services.createCalendarEvent(body)),
  "POST /api/calendar-events/:id/complete": ({ params, body }) => ok(services.completeCalendarEvent(params.id, body)),
  "POST /api/calendar-events/:id/date": ({ params, body }) => ok(services.updateCalendarEventDate(params.id, body)),
  "POST /api/calendar-events/:id/priority": ({ params, body }) => ok(services.updateCalendarEventPriority(params.id, body)),
  "POST /api/calendar-events/:id/risk": ({ params, body }) => ok(services.markCalendarEventAtRisk(params.id, body)),
  "POST /api/calendar-events/:id/owner": ({ params, body }) => ok(services.updateCalendarEventOwner(params.id, body)),
  "POST /api/calendar-events/:id/category": ({ params, body }) => ok(services.updateCalendarEventCategory(params.id, body)),
  "POST /api/calendar-events/:id/reschedule": ({ params, body }) => ok(services.rescheduleCalendarEvent(params.id, body)),
  "POST /api/calendar-events/:id/watch": ({ params, body }) => ok(services.watchCalendarEvent(params.id, body)),
  "POST /api/calendar-events/:id/check-in": ({ params, body }) => ok(services.checkInCalendarEvent(params.id, body)),
  "POST /api/calendar-events/:id/venue": ({ params, body }) => ok(services.updateCalendarVenue(params.id, body)),
  "POST /api/calendar-events/:id/agenda": ({ params, body }) => ok(services.attachCalendarAgenda(params.id, body)),
  "POST /api/calendar-events/:id/attendance": ({ params, body }) => ok(services.logCalendarAttendance(params.id, body)),
  "POST /api/calendar-events/:id/reminder": ({ params, body }) => ok(services.sendCalendarReminder(params.id, body)),
  "POST /api/calendar-events/:id/readiness": ({ params, body }) => ok(services.markCalendarReadiness(params.id, body)),
  "POST /api/calendar-events/:id/task": ({ params, body }) => ok(services.linkCalendarTask(params.id, body)),
  "POST /api/calendar-events/:id/report": ({ params, body }) => ok(services.linkCalendarReport(params.id, body)),
  "POST /api/calendar-events/:id/archive": ({ params, body }) => ok(services.archiveCalendarEvent(params.id, body)),
  "POST /api/calendar-events/:id/duplicate": ({ params, body }) => createdResponse(services.duplicateCalendarEvent(params.id, body)),
  "POST /api/calendar-events/bulk/complete": ({ body }) => ok(services.bulkCompleteCalendarEvents(body)),
  "POST /api/calendar-events/bulk/reschedule": ({ body }) => ok(services.bulkRescheduleCalendarEvents(body)),
  "GET /api/calendar-events/digest": () => ok(services.calendarDigest()),
  "GET /api/personnel": () => ok(state.personnel),
  "POST /api/personnel": ({ body }) => createdResponse(services.createPerson(body)),
  "POST /api/personnel/:id/assignment": ({ params, body }) => ok(services.updatePersonAssignment(params.id, body)),
  "POST /api/personnel/:id/role": ({ params, body }) => ok(services.updatePersonRole(params.id, body)),
  "POST /api/personnel/:id/status": ({ params, body }) => ok(services.updatePersonStatus(params.id, body)),
  "POST /api/personnel/:id/deactivate": ({ params, body }) => ok(services.deactivatePerson(params.id, body)),
  "POST /api/personnel/:id/onboard": ({ params, body }) => ok(services.onboardPerson(params.id, body)),
  "POST /api/personnel/:id/credentials/reset": ({ params, body }) => ok(services.resetPersonCredentials(params.id, body)),
  "POST /api/personnel/:id/leave": ({ params, body }) => ok(services.placePersonOnLeave(params.id, body)),
  "POST /api/personnel/:id/clearance": ({ params, body }) => ok(services.updatePersonClearance(params.id, body)),
  "POST /api/personnel/:id/credentials/verify": ({ params, body }) => ok(services.verifyPersonCredentials(params.id, body)),
  "POST /api/personnel/:id/training": ({ params, body }) => ok(services.assignPersonTraining(params.id, body)),
  "POST /api/personnel/:id/access": ({ params, body }) => ok(services.grantPersonStationAccess(params.id, body)),
  "POST /api/personnel/:id/incident": ({ params, body }) => ok(services.flagPersonIncident(params.id, body)),
  "POST /api/personnel/:id/task": ({ params, body }) => ok(services.linkPersonTask(params.id, body)),
  "POST /api/personnel/:id/review": ({ params, body }) => ok(services.reviewPerson(params.id, body)),
  "POST /api/personnel/:id/archive": ({ params, body }) => ok(services.archivePerson(params.id, body)),
  "POST /api/personnel/bulk/credential-review": ({ body }) => ok(services.bulkCredentialReviewPersonnel(body)),
  "GET /api/personnel/digest": () => ok(services.personnelDigest()),
  "GET /api/escalations": () => ok(state.escalations),
  "POST /api/escalations": ({ body }) => createdResponse(services.createEscalation(body)),
  "POST /api/escalations/:id/owner": ({ params, body }) => ok(services.updateEscalationOwner(params.id, body)),
  "POST /api/escalations/:id/severity": ({ params, body }) => ok(services.updateEscalationSeverity(params.id, body)),
  "POST /api/escalations/:id/route": ({ params, body }) => ok(services.routeEscalation(params.id, body)),
  "POST /api/escalations/:id/resolve": ({ params, body }) => ok(services.resolveEscalation(params.id, body)),
  "POST /api/escalations/:id/triage": ({ params, body }) => ok(services.triageEscalation(params.id, body)),
  "POST /api/escalations/:id/sla": ({ params, body }) => ok(services.updateEscalationSla(params.id, body)),
  "POST /api/escalations/:id/watch": ({ params, body }) => ok(services.watchEscalation(params.id, body)),
  "POST /api/escalations/:id/merge": ({ params, body }) => ok(services.mergeEscalation(params.id, body)),
  "POST /api/escalations/:id/evidence": ({ params, body }) => ok(services.attachEscalationEvidence(params.id, body)),
  "POST /api/escalations/:id/comment": ({ params, body }) => ok(services.commentEscalation(params.id, body)),
  "POST /api/escalations/:id/resolution-note": ({ params, body }) => ok(services.noteEscalationResolution(params.id, body)),
  "POST /api/escalations/:id/due": ({ params, body }) => ok(services.updateEscalationDue(params.id, body)),
  "POST /api/escalations/:id/task": ({ params, body }) => ok(services.linkEscalationTask(params.id, body)),
  "POST /api/escalations/:id/report": ({ params, body }) => ok(services.linkEscalationReport(params.id, body)),
  "POST /api/escalations/:id/approval-link": ({ params, body }) => ok(services.linkEscalationApproval(params.id, body)),
  "POST /api/escalations/:id/impact": ({ params, body }) => ok(services.scoreEscalationImpact(params.id, body)),
  "POST /api/escalations/:id/archive": ({ params, body }) => ok(services.archiveEscalation(params.id, body)),
  "POST /api/escalations/bulk/resolve": ({ body }) => ok(services.bulkResolveEscalations(body)),
  "GET /api/escalations/digest": () => ok(services.escalationDigest()),
  "GET /api/offices": () => ok(state.offices),
  "POST /api/offices": ({ body }) => {
    const result = services.createOffice(body);
    if (result.conflict) return conflict({ error: result.error });
    return createdResponse(result);
  },
  "POST /api/offices/:id/supervisor": ({ params, body }) => ok(services.updateOfficeSupervisor(params.id, body)),
  "POST /api/offices/:id/status": ({ params, body }) => ok(services.updateOfficeStatus(params.id, body)),
  "POST /api/offices/:id/activate": ({ params, body }) => ok(services.activateOffice(params.id, body)),
  "POST /api/offices/:id/suspend": ({ params, body }) => ok(services.suspendOffice(params.id, body)),
  "POST /api/offices/:id/password/rotate": ({ params, body }) => ok(services.rotateOfficePassword(params.id, body)),
  "POST /api/offices/:id/station/activate": ({ params, body }) => ok(services.activateOfficeStation(params.id, body)),
  "POST /api/offices/:id/department": ({ params, body }) => ok(services.updateOfficeDepartment(params.id, body)),
  "POST /api/offices/:id/level": ({ params, body }) => ok(services.updateOfficeLevel(params.id, body)),
  "POST /api/offices/:id/email/verify": ({ params, body }) => ok(services.verifyOfficeEmail(params.id, body)),
  "POST /api/offices/:id/watch": ({ params, body }) => ok(services.watchOffice(params.id, body)),
  "POST /api/offices/:id/note": ({ params, body }) => ok(services.noteOffice(params.id, body)),
  "POST /api/offices/:id/capacity": ({ params, body }) => ok(services.updateOfficeCapacity(params.id, body)),
  "POST /api/offices/:id/compliance": ({ params, body }) => ok(services.reviewOfficeCompliance(params.id, body)),
  "POST /api/offices/:id/archive": ({ params, body }) => ok(services.archiveOffice(params.id, body)),
  "POST /api/offices/bulk/activate": ({ body }) => ok(services.bulkActivateOffices(body)),
  "GET /api/offices/digest": () => ok(services.officeDigest()),
  "GET /api/transfers": () => ok(state.transfers),
  "POST /api/transfers": ({ body }) => createdResponse(services.createTransfer(body)),
  "POST /api/transfers/:id/acknowledge": ({ params, body }) => ok(services.acknowledgeTransfer(params.id, body)),
  "POST /api/transfers/:id/risk": ({ params, body }) => ok(services.updateTransferRisk(params.id, body)),
  "POST /api/transfers/:id/prepare": ({ params, body }) => ok(services.prepareTransfer(params.id, body)),
  "POST /api/transfers/:id/revoke-access": ({ params, body }) => ok(services.revokeTransferAccess(params.id, body)),
  "POST /api/transfers/:id/activate-station": ({ params, body }) => ok(services.activateTransferStation(params.id, body)),
  "POST /api/transfers/:id/verify": ({ params, body }) => ok(services.verifyTransfer(params.id, body)),
  "POST /api/transfers/:id/letter": ({ params, body }) => ok(services.recordTransferLetter(params.id, body)),
  "POST /api/transfers/:id/schedule": ({ params, body }) => ok(services.scheduleTransfer(params.id, body)),
  "POST /api/transfers/:id/note": ({ params, body }) => ok(services.noteTransfer(params.id, body)),
  "POST /api/transfers/:id/watch": ({ params, body }) => ok(services.watchTransfer(params.id, body)),
  "POST /api/transfers/:id/personnel-link": ({ params, body }) => ok(services.linkTransferPersonnel(params.id, body)),
  "POST /api/transfers/:id/task": ({ params, body }) => ok(services.linkTransferTask(params.id, body)),
  "POST /api/transfers/:id/report": ({ params, body }) => ok(services.linkTransferReport(params.id, body)),
  "POST /api/transfers/:id/archive": ({ params, body }) => ok(services.archiveTransfer(params.id, body)),
  "POST /api/transfers/bulk/verify": ({ body }) => ok(services.bulkVerifyTransfers(body)),
  "GET /api/transfers/digest": () => ok(services.transferDigest()),
  "POST /api/transfers/:id/execute": ({ params, body }) => ok(services.executeTransfer(params.id, body)),
  "GET /api/documents": () => ok(state.documents),
  "POST /api/documents": ({ body }) => createdResponse(services.createDocument(body)),
  "POST /api/documents/:id/classification": ({ params, body }) => ok(services.updateDocumentClassification(params.id, body)),
  "POST /api/documents/:id/owner": ({ params, body }) => ok(services.updateDocumentOwner(params.id, body)),
  "POST /api/documents/:id/review": ({ params, body }) => ok(services.markDocumentInReview(params.id, body)),
  "POST /api/documents/:id/archive": ({ params, body }) => ok(services.markDocumentArchived(params.id, body)),
  "POST /api/documents/:id/seal": ({ params, body }) => ok(services.sealDocument(params.id, body)),
  "POST /api/documents/:id/hold": ({ params, body }) => ok(services.placeDocumentHold(params.id, body)),
  "POST /api/documents/:id/retention": ({ params, body }) => ok(services.updateDocumentRetention(params.id, body)),
  "POST /api/documents/:id/duplicate": ({ params, body }) => createdResponse(services.duplicateDocument(params.id, body)),
  "POST /api/documents/:id/verify": ({ params, body }) => ok(services.verifyDocument(params.id, body)),
  "POST /api/documents/:id/custody": ({ params, body }) => ok(services.assignDocumentCustody(params.id, body)),
  "POST /api/documents/:id/chain": ({ params, body }) => ok(services.updateDocumentChain(params.id, body)),
  "POST /api/documents/:id/extract": ({ params, body }) => ok(services.extractDocumentText(params.id, body)),
  "POST /api/documents/:id/link-report": ({ params, body }) => ok(services.linkDocumentReport(params.id, body)),
  "POST /api/documents/:id/link-approval": ({ params, body }) => ok(services.linkDocumentApproval(params.id, body)),
  "POST /api/documents/:id/watch": ({ params, body }) => ok(services.watchDocument(params.id, body)),
  "POST /api/documents/:id/export": ({ params, body }) => ok(services.exportDocument(params.id, body)),
  "POST /api/documents/bulk/seal": ({ body }) => ok(services.bulkSealDocuments(body)),
  "GET /api/archive/manifest": () => ok(services.archiveManifest()),
  "GET /api/audit": () => ok(state.audit),
  "POST /api/audit/note": ({ body }) => createdResponse(services.createAuditNote(body)),
  "POST /api/audit/bulk/flag": ({ body }) => ok(services.bulkFlagAuditRows(body)),
  "POST /api/audit/bulk/seal": ({ body }) => ok(services.bulkSealAuditRows(body)),
  "POST /api/audit/bulk/verify": ({ body }) => ok(services.bulkVerifyAuditRows(body)),
  "GET /api/audit/digest": () => ok(services.auditDigest()),
  "POST /api/audit/:id/flag": ({ params, body }) => ok(services.flagAuditRow(params.id, body)),
  "POST /api/audit/:id/seal": ({ params, body }) => ok(services.sealAuditRow(params.id, body)),
  "POST /api/audit/:id/verify": ({ params, body }) => ok(services.verifyAuditRow(params.id, body)),
  "POST /api/audit/:id/severity": ({ params, body }) => ok(services.updateAuditSeverity(params.id, body)),
  "POST /api/audit/:id/category": ({ params, body }) => ok(services.updateAuditCategory(params.id, body)),
  "POST /api/audit/:id/reviewer": ({ params, body }) => ok(services.assignAuditReviewer(params.id, body)),
  "POST /api/audit/:id/comment": ({ params, body }) => ok(services.appendAuditComment(params.id, body)),
  "POST /api/audit/:id/investigate": ({ params, body }) => ok(services.openAuditInvestigation(params.id, body)),
  "POST /api/audit/:id/close": ({ params, body }) => ok(services.closeAuditInvestigation(params.id, body)),
  "POST /api/audit/:id/hold": ({ params, body }) => ok(services.placeAuditHold(params.id, body)),
  "POST /api/audit/:id/release-hold": ({ params, body }) => ok(services.releaseAuditHold(params.id, body)),
  "GET /api/compliance-reviews": () => ok(complianceReviewsReport()),
  "GET /api/compliance-reviews/digest": () => ok(complianceReviewDigest()),
  "POST /api/compliance-reviews/bulk/review": ({ body, session }) => ok(bulkReviewCompliance(body, session.email)),
  "POST /api/compliance-reviews/:id/route": ({ params, body, session }) => ok(routeComplianceReview(params.id, body, session.email)),
  "POST /api/compliance-reviews/:id/evidence": ({ params, body, session }) => ok(attachComplianceEvidence(params.id, body, session.email)),
  "POST /api/compliance-reviews/:id/score": ({ params, body, session }) => ok(scoreComplianceRisk(params.id, body, session.email)),
  "POST /api/compliance-reviews/:id/attest": ({ params, body, session }) => ok(attestComplianceReview(params.id, body, session.email)),
  "POST /api/compliance-reviews/:id/packet": ({ params, body, session }) => ok(prepareCompliancePacket(params.id, body, session.email)),
  "POST /api/compliance-reviews/:id/export": ({ params, body, session }) => ok(exportComplianceReview(params.id, body, session.email)),
  "POST /api/compliance-reviews/:id/archive": ({ params, body, session }) => ok(archiveComplianceReview(params.id, body, session.email)),
  "POST /api/compliance-reviews/:id/escalate": ({ params, body, session }) => ok(escalateComplianceReview(params.id, body, session.email)),
  "GET /api/evidence-vault": () => ok(evidenceVaultReport()),
  "GET /api/evidence-vault/digest": () => ok(evidenceVaultDigest()),
  "POST /api/evidence-vault/bulk/seal": ({ body, session }) => ok(bulkSealEvidence(body, session.email)),
  "POST /api/evidence-vault/:id/custody": ({ params, body, session }) => ok(assignEvidenceCustody(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/classification": ({ params, body, session }) => ok(updateEvidenceClassification(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/chain": ({ params, body, session }) => ok(updateEvidenceChain(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/retention": ({ params, body, session }) => ok(scheduleEvidenceRetention(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/seal": ({ params, body, session }) => ok(sealEvidence(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/verify": ({ params, body, session }) => ok(verifyEvidence(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/hold": ({ params, body, session }) => ok(placeEvidenceHold(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/export": ({ params, body, session }) => ok(exportEvidence(params.id, body, session.email)),
  "POST /api/evidence-vault/:id/archive": ({ params, body, session }) => ok(archiveEvidence(params.id, body, session.email)),
  "GET /api/events": () => ok(state.events),
  "GET /api/events/digest": () => ok(services.eventDigest()),
  "POST /api/events": ({ body }) => createdResponse(services.recordManualEvent(body)),
  "POST /api/events/clear": ({ body }) => ok(services.clearEventLog(body)),
  "POST /api/events/bulk/archive": ({ body }) => ok(services.bulkArchiveEvents(body)),
  "POST /api/events/:id/acknowledge": ({ params, body }) => ok(services.acknowledgeEvent(params.id, body)),
  "POST /api/events/:id/pin": ({ params, body }) => ok(services.pinEvent(params.id, body)),
  "POST /api/events/:id/severity": ({ params, body }) => ok(services.updateEventSeverity(params.id, body)),
  "POST /api/events/:id/route": ({ params, body }) => ok(services.routeEvent(params.id, body)),
  "POST /api/events/:id/replay": ({ params, body }) => ok(services.replayEvent(params.id, body)),
  "POST /api/events/:id/mute": ({ params, body }) => ok(services.muteEvent(params.id, body)),
  "POST /api/events/:id/owner": ({ params, body }) => ok(services.assignEventOwner(params.id, body)),
  "POST /api/events/:id/archive": ({ params, body }) => ok(services.archiveEvent(params.id, body)),
  "GET /api/export": ({ session }) => ok(exportSnapshot(session)),
  "POST /api/export/archive": ({ session, body }) => createdResponse(services.archiveGovernanceSnapshot({ ...body, actor: session.email })),
  "GET /api/ai-drafts": () => ok(state.aiDrafts),
  "POST /api/ai-drafts": ({ body }) => createdResponse(services.createAiDraft(body)),
  "POST /api/ai-drafts/bulk/refresh": ({ body }) => ok(services.bulkRefreshAiDrafts(body)),
  "GET /api/ai-drafts/digest": () => ok(services.aiDraftDigest()),
  "POST /api/ai-drafts/:id/archive": ({ params, body }) => createdResponse(services.archiveAiDraft(params.id, body)),
  "POST /api/ai-drafts/:id/refresh": ({ params, body }) => ok(services.refreshAiDraft(params.id, body)),
  "POST /api/ai-drafts/:id/status": ({ params, body }) => ok(services.updateAiDraftStatus(params.id, body)),
  "POST /api/ai-drafts/:id/publish": ({ params, body }) => ok(services.publishAiDraft(params.id, body)),
  "POST /api/ai-drafts/:id/sources": ({ params, body }) => ok(services.bindAiDraftSources(params.id, body)),
  "POST /api/ai-drafts/:id/confidence": ({ params, body }) => ok(services.scoreAiDraft(params.id, body)),
  "POST /api/ai-drafts/:id/seal": ({ params, body }) => ok(services.sealAiDraft(params.id, body)),
  "POST /api/ai-drafts/:id/watch": ({ params, body }) => ok(services.watchAiDraft(params.id, body)),
  "POST /api/ai-drafts/:id/duplicate": ({ params, body }) => createdResponse(services.duplicateAiDraft(params.id, body)),
  "POST /api/offline-sync": ({ body }) => ok(services.syncOfflineActions(body)),
  "POST /api/auth/login": ({ body }) => {
    assertLoginRateLimit(body.email, body.clientIp);
    const result = services.login(body);
    if (result.unauthorized) return unauthorized({ error: result.error });
    const session = createSession(result.station.email);
    return ok({ ...result, permissions: getPermissions(result.station), token: session.token, expiresAt: session.expiresAt });
  }
};

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") return send(response, { status: 204, body: null });
    const pathname = new URL(request.url ?? "/", `http://${request.headers.host}`).pathname;
    assertMutationRateLimit(request, pathname);
    const requestBody = await readJson(request);
    const match = matchRoute(request.method, pathname);
    if (!match) {
      if (request.method === "GET" && SERVE_WEB && !pathname.startsWith("/api/") && pathname !== "/health") {
        const webAsset = await readWebAsset(pathname);
        if (webAsset) return sendRaw(response, webAsset);
      }
      return send(response, notFound({ error: "Route not found" }));
    }
    validateRequest(match.pattern, requestBody);
    const session = authenticateRequest(request, pathname);
    const body = session ? { ...requestBody, actor: session.email } : { ...requestBody, clientIp: clientIp(request) };
    const payload = await match.handler({ body, params: match.params, session });
    if (payload?.raw) return sendRaw(response, payload);
    if (request.method !== "GET") await saveState();
    return send(response, payload);
  } catch (error) {
    if (error instanceof HttpError || Number.isInteger(error.status)) {
      return send(response, { status: error.status, body: { error: error.message } });
    }
    return send(response, serverError({ error: error.message }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`GCOS API listening on http://${HOST}:${PORT}`);
});

function record(event, actor, object, result) {
  state.audit.unshift(audit(actor ?? "System", event, object, result));
  state.events.unshift(`${event}: ${object}`);
  state.events = state.events.slice(0, 20);
}

function operationalStatus() {
  return {
    status: "ok",
    service: "gcos-api",
    time: new Date().toISOString(),
    startedAt: STARTED_AT.toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    serveWeb: SERVE_WEB,
    persistence: storage.dataPath ?? storage.databaseUrl ?? DATA_PATH,
    storageProvider: storage.provider,
    persistenceStatus: persistenceStatusSync(),
    limits: {
      maxBodyBytes: MAX_BODY_BYTES,
      devResetEnabled: DEV_RESET_ENABLED,
      rateLimits: rateLimitStatus()
    },
    sessions: sessionSummary(),
    counts: {
      stations: state.stations.length,
      messages: state.messages.length,
      reports: state.reports.length,
      approvals: state.approvals.length,
      tasks: state.tasks.length,
      policies: state.policies.length,
      calendarEvents: state.calendarEvents.length,
      personnel: state.personnel.length,
      escalations: state.escalations.length,
      transfers: state.transfers.length,
      offices: state.offices.length,
      documents: state.documents.length,
      files: (state.files ?? []).length,
      audit: state.audit.length,
      events: state.events.length
    }
  };
}

async function launchReadiness() {
  const status = operationalStatus();
  const persistence = await persistenceStatus();
  const backupManifest = await persistenceBackupManifest();
  const restoreDrill = await persistenceRestoreDrill();
  const cutover = persistenceCutoverChecklist();
  const counts = status.counts;
  const checks = [
    { name: "web-shell", category: "mvp", ok: SERVE_WEB, detail: SERVE_WEB ? "API serves the built web app" : "Set GCOS_SERVE_WEB=1 for web delivery" },
    { name: "workflow-data", category: "mvp", ok: counts.stations > 0 && counts.messages > 0 && counts.reports > 0 && counts.approvals > 0 && counts.tasks > 0, detail: `${counts.stations} stations, ${counts.tasks} tasks, ${counts.approvals} approvals` },
    { name: "auth-sessions", category: "mvp", ok: state.authCredentials && Object.keys(state.authCredentials).length > 0, detail: `${Object.keys(state.authCredentials ?? {}).length} station credentials` },
    { name: "audit-ledger", category: "mvp", ok: counts.audit > 0, detail: `${counts.audit} audit rows` },
    { name: "object-vault", category: "mvp", ok: Boolean(OBJECT_VAULT_PATH), detail: OBJECT_VAULT_PATH },
    { name: "persistence", category: "mvp", ok: Boolean(persistence.hash), detail: `${persistence.provider}/${persistence.mode}` },
    { name: "migration-cockpit", category: "mvp", ok: persistenceCutoverChecklist().checks.length >= 3, detail: cutover.nextAction },
    { name: "production-profile", category: "production", ok: process.env.NODE_ENV === "production", detail: process.env.NODE_ENV ?? "not set" },
    { name: "public-domain", category: "production", ok: DOMAIN === "rmvi.org", detail: DOMAIN },
    { name: "deployment-target", category: "production", ok: Boolean(DEPLOYMENT_TARGET), detail: DEPLOYMENT_TARGET || "not configured" },
    { name: "serve-web", category: "production", ok: SERVE_WEB, detail: SERVE_WEB ? "Web served by API" : "Set GCOS_SERVE_WEB=1" },
    { name: "production-reset-lock", category: "production", ok: !DEV_RESET_ENABLED, detail: DEV_RESET_ENABLED ? "Development reset enabled" : "Development reset disabled" },
    { name: "managed-database", category: "production", ok: STORAGE_PROVIDER === "database" && Boolean(DATABASE_URL), detail: STORAGE_PROVIDER === "database" ? "Database provider selected" : "JSON provider active" },
    { name: "database-ssl", category: "production", ok: process.env.GCOS_DATABASE_SSL === "1" || STORAGE_PROVIDER !== "database", detail: process.env.GCOS_DATABASE_SSL === "1" ? "Database SSL enabled" : "Database SSL not required for current provider" },
    { name: "cors-origin", category: "production", ok: ALLOWED_ORIGIN !== "*", detail: ALLOWED_ORIGIN },
    { name: "healthcheck-domain", category: "production", ok: (process.env.GCOS_HEALTHCHECK_URL ?? "").includes(DOMAIN), detail: process.env.GCOS_HEALTHCHECK_URL ?? "not configured" },
    { name: "object-vault-path", category: "production", ok: !OBJECT_VAULT_PATH.includes("/data/object-vault") || process.env.GCOS_OBJECT_VAULT_PATH !== undefined, detail: OBJECT_VAULT_PATH },
    { name: "body-limit", category: "production", ok: MAX_BODY_BYTES >= 1048576, detail: `${MAX_BODY_BYTES} bytes` },
    { name: "rate-limit-protection", category: "production", ok: LOGIN_RATE_LIMIT > 0 && MUTATION_RATE_LIMIT > 0, detail: `${LOGIN_RATE_LIMIT} login attempts / ${Math.round(LOGIN_RATE_WINDOW_MS / 1000)}s` },
    { name: "backup-manifest", category: "production", ok: backupManifest.status === "protected", detail: `${backupManifest.total} backups, ${backupManifest.totalBytes} bytes` },
    { name: "restore-drill", category: "production", ok: restoreDrill.status === "restorable", detail: restoreDrill.nextAction },
    { name: "database-pool", category: "production", ok: Number(process.env.GCOS_DATABASE_POOL_SIZE ?? 0) >= 2, detail: process.env.GCOS_DATABASE_POOL_SIZE ?? "default" }
  ];
  const mvpChecks = checks.filter((check) => check.category === "mvp");
  const productionChecks = checks.filter((check) => check.category === "production");
  const mvpScore = scoreChecks(mvpChecks);
  const productionScore = scoreChecks(productionChecks);
  return {
    generatedAt: new Date().toISOString(),
    targetDomain: "rmvi.org",
    status: mvpScore >= 95 ? "mvp-launch-ready" : "mvp-hold",
    mvpScore,
    productionScore,
    checks,
    blockers: checks.filter((check) => !check.ok).map((check) => check.name),
    nextActions: checks.filter((check) => !check.ok).slice(0, 4).map((check) => check.detail),
    summary: mvpScore >= 95
      ? "GCOS is ready for a controlled web MVP launch."
      : "Complete remaining MVP launch checks before public rollout."
  };
}

async function operationalMonitor() {
  const status = operationalStatus();
  const launch = await launchReadiness();
  const persistence = await persistenceStatus();
  const backupManifest = await persistenceBackupManifest();
  const restoreDrill = await persistenceRestoreDrill();
  const sessionInfo = sessionSummary();
  const failedChecks = launch.checks.filter((check) => !check.ok);
  const lockedSessions = sessionInfo.stations.filter((session) => session.status === "Locked").length;
  const mfaSessions = sessionInfo.stations.filter((session) => session.mfaRequired).length;
  const criticalSignals = [
    ...failedChecks.filter((check) => check.category === "production").slice(0, 5).map((check) => ({
      name: check.name,
      severity: ["managed-database", "production-reset-lock", "backup-manifest", "restore-drill"].includes(check.name) ? "High" : "Medium",
      detail: check.detail
    })),
    ...(lockedSessions > 0 ? [{ name: "locked-sessions", severity: "Medium", detail: `${lockedSessions} locked sessions` }] : []),
    ...(mfaSessions > 0 ? [{ name: "mfa-required", severity: "Medium", detail: `${mfaSessions} sessions require MFA` }] : [])
  ];
  const score = Math.round((launch.mvpScore * 0.35) + (launch.productionScore * 0.45) + (backupManifest.status === "protected" ? 10 : 0) + (restoreDrill.valid ? 10 : 0));
  return {
    generatedAt: new Date().toISOString(),
    status: criticalSignals.some((signal) => signal.severity === "High") ? "attention" : "healthy",
    score,
    uptimeSeconds: status.uptimeSeconds,
    domain: DOMAIN,
    service: status.service,
    storageProvider: status.storageProvider,
    readiness: {
      mvpScore: launch.mvpScore,
      productionScore: launch.productionScore,
      blockers: launch.blockers.length,
      nextAction: launch.nextActions[0] ?? "No launch blockers"
    },
    persistence: {
      provider: persistence.provider,
      mode: persistence.mode,
      hash: persistence.hash,
      records: persistence.records,
      backupStatus: backupManifest.status,
      backups: backupManifest.total,
      restoreStatus: restoreDrill.status,
      restoreValid: restoreDrill.valid
    },
    sessions: sessionInfo,
    criticalSignals,
    nextActions: criticalSignals.length
      ? criticalSignals.slice(0, 4).map((signal) => signal.detail)
      : ["Continue scheduled production smoke checks"]
  };
}

async function projectCompletionReport() {
  const status = operationalStatus();
  const launch = await launchReadiness();
  const signoff = await launchSignoffMatrix();
  const deployment = await launchDeploymentPlan();
  const persistence = await persistenceStatus();
  const security = securityControlsDigest();
  const evidence = evidenceVaultDigest();
  const modules = [
    { name: "Sign-in portal", complete: state.stations.length >= 7 && Object.keys(state.authCredentials ?? {}).length >= 7 },
    { name: "Station workstations", complete: status.counts.stations >= 7 },
    { name: "ChurchMail", complete: status.counts.messages > 0 },
    { name: "Reports", complete: status.counts.reports > 0 },
    { name: "Approvals", complete: status.counts.approvals > 0 },
    { name: "Tasks", complete: status.counts.tasks > 0 },
    { name: "Policies", complete: status.counts.policies > 0 },
    { name: "Calendar", complete: status.counts.calendarEvents > 0 },
    { name: "Personnel and transfers", complete: status.counts.personnel > 0 && status.counts.transfers > 0 },
    { name: "Offices and hierarchy", complete: status.counts.offices > 0 && status.counts.stations > 0 },
    { name: "Archive and evidence", complete: status.counts.documents > 0 && evidence.total > 0 },
    { name: "Audit and security", complete: status.counts.audit > 0 && security.total > 0 },
    { name: "Persistence and backups", complete: Boolean(persistence.hash) && persistence.backupSupport !== false },
    { name: "Deployment readiness", complete: deployment.smokeUrls.length >= 5 && deployment.commands.includes("npm run domain:check") }
  ];
  const moduleScore = scoreChecks(modules.map((module) => ({ ok: module.complete })));
  const productionBlockers = deployment.requiredSecrets.filter((secret) => !secret.configured).map((secret) => secret.name);
  return {
    generatedAt: new Date().toISOString(),
    project: "Remedy Movement International GCOS",
    targetDomain: DOMAIN,
    status: launch.mvpScore >= 95 ? "controlled-mvp-ready" : "build-hold",
    moduleScore,
    mvpScore: launch.mvpScore,
    productionScore: launch.productionScore,
    enterpriseScore: signoff.tracks.find((track) => track.id === "enterprise-deployment")?.score ?? 0,
    modules,
    releaseCommands: [
      "npm test",
      "npm run build",
      "npm run release:check",
      "npm run production:check",
      "npm run replit:run",
      "GCOS_HEALTHCHECK_URL=https://rmvi.org npm run healthcheck",
      "npm run domain:check"
    ],
    smokeUrls: deployment.smokeUrls,
    productionBlockers,
    nextActions: productionBlockers.length
      ? [
        "Set the missing Replit production secrets.",
        "Switch GCOS_STORAGE_PROVIDER to database after GCOS_DATABASE_URL is configured.",
        "Run backup, restore drill, launch readiness, and launch signoff from the Audit workspace.",
        "Run domain smoke checks after rmvi.org points to this Replit deployment."
      ]
      : ["Run the release commands and record launch signoff."]
  };
}

async function enterpriseCompletionReport() {
  const status = operationalStatus();
  const launch = await launchReadiness();
  const deployment = await launchDeploymentPlan();
  const security = securityControlsDigest();
  const compliance = complianceReviewDigest();
  const evidence = evidenceVaultDigest();
  const auditDigest = services.auditDigest();
  const searchCollections = [
    state.stations,
    state.messages,
    state.reports,
    state.approvals,
    state.tasks,
    state.policies,
    state.calendarEvents,
    state.personnel,
    state.escalations,
    state.transfers,
    state.offices,
    state.documents
  ];
  const tracks = [
    enterpriseTrack("identity", "Real authentication and user lifecycle", [
      { name: "credential-registry", ok: Object.keys(state.authCredentials ?? {}).length >= 7, detail: `${Object.keys(state.authCredentials ?? {}).length} station credentials registered` },
      { name: "session-controls", ok: Boolean(routes["GET /api/sessions"]) && Boolean(routes["POST /api/sessions/:id/revoke"]), detail: "Session revoke, renew, trust, lock, MFA controls available" },
      { name: "transfer-session-invalidation", ok: state.transfers.length > 0 && status.counts.personnel > 0, detail: "Transfer workflow updates personnel and station access" }
    ]),
    enterpriseTrack("database-storage", "Real database and file storage", [
      { name: "postgres-adapter", ok: STORAGE_PROVIDER === "database" && Boolean(DATABASE_URL), detail: STORAGE_PROVIDER === "database" ? "Database provider selected" : "JSON provider active" },
      { name: "object-vault", ok: Boolean(process.env.GCOS_OBJECT_VAULT_PATH), detail: OBJECT_VAULT_PATH },
      { name: "file-upload-api", ok: Boolean(routes["POST /api/files/upload"]) && Boolean(routes["POST /api/reports/:id/file"]), detail: "File upload and report evidence routes available" }
    ]),
    enterpriseTrack("role-templates", "Role templates and permissions", [
      { name: "station-permissions", ok: state.stations.length >= 7, detail: `${state.stations.length} station roles seeded` },
      { name: "permission-model", ok: typeof getPermissions("International HQ").canOverride === "boolean", detail: "Hierarchy permission model active" },
      { name: "department-coverage", ok: new Set(state.offices.map((office) => office.department)).size >= 3, detail: `${new Set(state.offices.map((office) => office.department)).size} departments represented` }
    ]),
    enterpriseTrack("report-signing", "Report signing and locked packets", [
      { name: "report-attestation", ok: state.reports.some((report) => report.attestation || report.preparedBy), detail: "Reports support preparer and attestation fields" },
      { name: "governance-packet", ok: Boolean(routes["POST /api/reports/:id/packet"]), detail: "Report packet builder route available" },
      { name: "approval-signatures", ok: state.approvals.some((approval) => /complete|\d+\/\d+|signature/i.test(approval.signatures)), detail: "Approval signature chain active" }
    ]),
    enterpriseTrack("notifications", "Notifications and escalations", [
      { name: "churchmail-notices", ok: state.messages.length > 0, detail: `${state.messages.length} ChurchMail records` },
      { name: "escalation-engine", ok: state.escalations.length > 0, detail: `${state.escalations.length} escalation records` },
      { name: "deadline-signals", ok: state.tasks.some((task) => task.slaStatus || task.priority === "Critical") || state.calendarEvents.some((event) => event.status === "At Risk"), detail: "Task/calendar risk signals available" }
    ]),
    enterpriseTrack("offline-sync", "Offline sync hardening", [
      { name: "offline-sync-route", ok: Boolean(routes["POST /api/offline-sync"]), detail: "Offline sync endpoint available" },
      { name: "audit-queue-model", ok: status.counts.audit > 0, detail: "Offline actions use audit row shape" },
      { name: "conflict-resolution-plan", ok: launch.checks.some((check) => check.name === "web-shell"), detail: "Launch readiness tracks web/offline shell" }
    ]),
    enterpriseTrack("global-search", "Search across everything", [
      { name: "searchable-collections", ok: searchCollections.every((collection) => Array.isArray(collection)), detail: `${searchCollections.length} collections indexed in app shell` },
      { name: "document-indexing", ok: state.documents.some((document) => document.extractedText || document.fileHash || document.storageKey), detail: "Archive records carry searchable metadata" },
      { name: "audit-search", ok: status.counts.audit > 0, detail: `${status.counts.audit} audit rows searchable` }
    ]),
    enterpriseTrack("organization-onboarding", "Organization onboarding", [
      { name: "office-creation", ok: Boolean(routes["POST /api/offices"]), detail: "Office creation route available" },
      { name: "station-generation", ok: state.offices.some((office) => office.email?.endsWith("@rmvi.org")), detail: "Office emails use rmvi.org station identity" },
      { name: "hierarchy-graph", ok: Boolean(routes["GET /api/hierarchy/digest"]), detail: "Hierarchy digest route available" }
    ]),
    enterpriseTrack("data-import", "Data import and migration", [
      { name: "migration-plan", ok: Boolean(routes["GET /api/persistence/migration-plan"]), detail: "Migration plan API available" },
      { name: "schema-export", ok: Boolean(routes["POST /api/persistence/schema-export"]), detail: "Postgres schema export available" },
      { name: "import-dry-run", ok: Boolean(routes["GET /api/persistence/import-dry-run"]), detail: "Import dry run available" }
    ]),
    enterpriseTrack("production-operations", "Production operations", [
      { name: "backup-manifest", ok: launch.checks.some((check) => check.name === "backup-manifest"), detail: "Backup manifest launch gate active" },
      { name: "restore-drill", ok: launch.checks.some((check) => check.name === "restore-drill"), detail: "Restore drill launch gate active" },
      { name: "operations-monitor", ok: Boolean(routes["GET /api/ops/monitor"]), detail: "Operations monitor API available" }
    ]),
    enterpriseTrack("legal-policy", "Legal, privacy, retention, and audit policy", [
      { name: "active-policies", ok: state.policies.length >= 3, detail: `${state.policies.length} policies registered` },
      { name: "retention-controls", ok: state.documents.some((document) => document.retainedUntil) && evidence.permanent >= 1, detail: "Document and evidence retention controls active" },
      { name: "immutable-audit", ok: auditDigest.sealed >= 1 || auditDigest.verified >= 1, detail: `${auditDigest.sealed} sealed, ${auditDigest.verified} verified audit rows` }
    ]),
    enterpriseTrack("ai-controls", "Real AI controls and governance", [
      { name: "ai-desk", ok: state.aiDrafts.length > 0, detail: `${state.aiDrafts.length} AI drafts available` },
      { name: "source-binding", ok: state.aiDrafts.some((draft) => draft.sourceNote || draft.sourceCount > 0), detail: "AI drafts track source count/notes" },
      { name: "ai-audit-controls", ok: state.aiDrafts.some((draft) => draft.sealed || draft.confidence || draft.status), detail: "AI drafts support status, confidence, and sealing" }
    ])
  ];
  const overallScore = scoreChecks(tracks.map((track) => ({ ok: track.score === 100 })));
  return {
    generatedAt: new Date().toISOString(),
    project: "Remedy Movement International GCOS",
    targetDomain: DOMAIN,
    status: overallScore === 100 ? "enterprise-ready" : "enterprise-hardening",
    overallScore,
    mvpScore: launch.mvpScore,
    productionScore: launch.productionScore,
    tracks,
    blockers: tracks.flatMap((track) => track.blockers.map((blocker) => `${track.name}: ${blocker}`)),
    nextActions: [
      ...deployment.requiredSecrets.filter((secret) => !secret.configured).map((secret) => productionSecretAction(secret.name)),
      ...tracks.flatMap((track) => track.nextActions).slice(0, 8)
    ].slice(0, 10)
  };
}

function enterpriseTrack(id, name, gates) {
  const score = scoreChecks(gates);
  return {
    id,
    name,
    score,
    status: score === 100 ? "complete" : score >= 67 ? "usable" : "needs-build",
    gates,
    blockers: gates.filter((gate) => !gate.ok).map((gate) => gate.name),
    nextActions: gates.filter((gate) => !gate.ok).map((gate) => enterpriseGateAction(id, gate.name))
  };
}

function enterpriseGateAction(trackId, gateName) {
  const actions = {
    "database-storage:postgres-adapter": "Set GCOS_DATABASE_URL and keep GCOS_STORAGE_PROVIDER=database in Replit.",
    "database-storage:object-vault": "Set GCOS_OBJECT_VAULT_PATH to durable Replit storage or object storage.",
    "legal-policy:immutable-audit": "Seal and verify at least one audit row during launch signoff.",
    "report-signing:report-attestation": "Open a report and save preparer, attestation, and required checklist fields.",
    "ai-controls:ai-audit-controls": "Score, seal, and publish AI drafts only after source review.",
    "offline-sync:conflict-resolution-plan": "Run an offline queue sync drill from a station workstation."
  };
  return actions[`${trackId}:${gateName}`] ?? `Complete ${gateName} for ${trackId}.`;
}

async function rolloutReadinessReport() {
  const launch = await launchReadiness();
  const deployment = await launchDeploymentPlan();
  const migrationPlan = persistenceMigrationPlan();
  const importDryRun = persistenceImportDryRun();
  const backupManifest = await persistenceBackupManifest();
  const restoreDrill = await persistenceRestoreDrill();
  const security = securityControlsDigest();
  const compliance = complianceReviewDigest();
  const personnelDigest = services.personnelDigest();
  const policyDigest = services.policyDigest();
  const tracks = [
    rolloutTrack("deployment", "Deployment", [
      { name: "release-gate", ok: deployment.commands.includes("npm run launch:verify:live"), detail: "Live launch verification command registered" },
      { name: "domain-smoke", ok: deployment.smokeUrls.includes(`https://${DOMAIN}/health`), detail: `${DOMAIN} smoke URLs prepared` },
      { name: "production-secrets", ok: deployment.requiredSecrets.filter((secret) => !secret.configured).length === 0, detail: `${deployment.requiredSecrets.filter((secret) => !secret.configured).length} missing secrets` }
    ]),
    rolloutTrack("real-data", "Real Data", [
      { name: "migration-plan", ok: migrationPlan.estimatedRows > 0, detail: `${migrationPlan.estimatedRows} records mapped for migration` },
      { name: "schema-package", ok: persistenceSchemaPlan().tableCount > 0, detail: `${persistenceSchemaPlan().tableCount} Postgres tables planned` },
      { name: "import-dry-run", ok: importDryRun.valid, detail: `${importDryRun.estimatedRows} rows dry-run ready` }
    ]),
    rolloutTrack("user-rollout", "User Rollout", [
      { name: "station-accounts", ok: state.stations.length >= 7, detail: `${state.stations.length} station accounts` },
      { name: "credential-controls", ok: Object.keys(state.authCredentials ?? {}).length >= 7, detail: `${Object.keys(state.authCredentials ?? {}).length} credential records` },
      { name: "personnel-onboarding", ok: state.personnel.length > 0 && personnelDigest.training >= 1, detail: `${state.personnel.length} personnel, ${personnelDigest.training} training assignments` }
    ]),
    rolloutTrack("policy-pack", "Policies", [
      { name: "active-policy-pack", ok: policyDigest.active >= 2, detail: `${policyDigest.active} active policies` },
      { name: "compliance-reviews", ok: compliance.total >= 3, detail: `${compliance.total} compliance reviews` },
      { name: "retention-policy", ok: state.documents.some((document) => document.retainedUntil), detail: "Document retention metadata present" }
    ]),
    rolloutTrack("training", "Training", [
      { name: "policy-training", ok: policyDigest.training >= 1, detail: `${policyDigest.training} policy training assignments` },
      { name: "personnel-training", ok: personnelDigest.training >= 1, detail: `${personnelDigest.training} personnel training records` },
      { name: "station-guides", ok: state.reports.length >= 10 && state.policies.length >= 3, detail: "Report templates and policies support station training" }
    ]),
    rolloutTrack("live-operations", "Live Operations", [
      { name: "backup-manifest", ok: backupManifest.status === "protected", detail: `${backupManifest.total} backups / ${backupManifest.status}` },
      { name: "restore-drill", ok: restoreDrill.valid, detail: restoreDrill.nextAction },
      { name: "security-controls", ok: security.total >= 6 && launch.productionScore >= 90, detail: `${security.total} controls, ${launch.productionScore}% production profile` }
    ])
  ];
  const overallScore = Math.round(tracks.reduce((sum, track) => sum + track.score, 0) / tracks.length);
  return {
    generatedAt: new Date().toISOString(),
    project: "Remedy Movement International GCOS",
    targetDomain: DOMAIN,
    status: overallScore === 100 ? "rollout-ready" : "rollout-hardening",
    overallScore,
    tracks,
    blockers: tracks.flatMap((track) => track.blockers.map((blocker) => `${track.name}: ${blocker}`)),
    nextActions: [
      ...deployment.requiredSecrets.filter((secret) => !secret.configured).map((secret) => productionSecretAction(secret.name)),
      ...tracks.flatMap((track) => track.nextActions)
    ].slice(0, 8)
  };
}

function rolloutTrack(id, name, gates) {
  const score = scoreChecks(gates);
  return {
    id,
    name,
    score,
    status: score === 100 ? "complete" : score >= 67 ? "field-ready" : "needs-work",
    gates,
    blockers: gates.filter((gate) => !gate.ok).map((gate) => gate.name),
    nextActions: gates.filter((gate) => !gate.ok).map((gate) => rolloutGateAction(id, gate.name))
  };
}

function rolloutGateAction(trackId, gateName) {
  const actions = {
    "deployment:production-secrets": "Set all Replit production secrets, especially GCOS_DATABASE_URL.",
    "user-rollout:personnel-onboarding": "Assign training to each first-wave station user before rollout.",
    "policy-pack:active-policy-pack": "Activate privacy, retention, audit, access, and acceptable-use policies.",
    "training:station-guides": "Publish station training guides for Local, District, National, Finance, Audit, Mission, and International users.",
    "live-operations:backup-manifest": "Create and record a production backup manifest.",
    "live-operations:restore-drill": "Run and record a restore drill before inviting users."
  };
  return actions[`${trackId}:${gateName}`] ?? `Complete ${gateName} for ${trackId}.`;
}

async function recordOperationalMonitor(actor) {
  requirePermission(actor, "canApprove");
  const monitor = await operationalMonitor();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastOperationalMonitor = {
    generatedAt: monitor.generatedAt,
    actor,
    status: monitor.status,
    score: monitor.score,
    signals: monitor.criticalSignals.length
  };
  record("OperationalMonitorRecorded", actor, "GCOS operations", `${monitor.status} / ${monitor.score}%`);
  return { monitor, status: persistenceStatusSync() };
}

async function recordLaunchReadiness(actor) {
  requirePermission(actor, "canApprove");
  const launch = await launchReadiness();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastLaunchReadiness = {
    generatedAt: launch.generatedAt,
    actor,
    status: launch.status,
    mvpScore: launch.mvpScore,
    productionScore: launch.productionScore,
    blockers: launch.blockers.length
  };
  record("LaunchReadinessChecked", actor, "GCOS launch", `${launch.status} ${launch.mvpScore}% MVP`);
  return { launch, status: persistenceStatusSync() };
}

async function launchDeploymentPlan() {
  const launch = await launchReadiness();
  const requiredSecrets = productionSecretEntries();
  const commands = [
    "npm install",
    "npm run build",
    "npm run production:check",
    "npm run secrets:plan",
    "npm run replit:run",
    "GCOS_HEALTHCHECK_URL=https://rmvi.org npm run healthcheck",
    "npm run domain:check",
    "npm run launch:verify:live"
  ];
  return {
    generatedAt: new Date().toISOString(),
    targetDomain: DOMAIN,
    deploymentTarget: DEPLOYMENT_TARGET || "replit",
    readiness: {
      mvpScore: launch.mvpScore,
      productionScore: launch.productionScore,
      status: launch.status,
      blockers: launch.blockers
    },
    requiredSecrets,
    commands,
    smokeUrls: [
      `https://${DOMAIN}/health`,
      `https://${DOMAIN}/api/status`,
      `https://${DOMAIN}/api/launch/readiness`,
      `https://${DOMAIN}/manifest.webmanifest`,
      `https://${DOMAIN}/`
    ],
    goLive: launch.productionScore >= 90,
    nextAction: launch.productionScore >= 90
      ? "Run production smoke checks and sign off the rmvi.org deployment"
      : "Set the missing Replit secrets, then rerun npm run production:check"
  };
}

function productionSecretEntries() {
  return [
    { name: "NODE_ENV", value: "production", configured: process.env.NODE_ENV === "production", sensitive: false },
    { name: "GCOS_DOMAIN", value: DOMAIN, configured: DOMAIN === "rmvi.org", sensitive: false },
    { name: "GCOS_DEPLOYMENT_TARGET", value: DEPLOYMENT_TARGET || "replit", configured: Boolean(DEPLOYMENT_TARGET), sensitive: false },
    { name: "GCOS_SERVE_WEB", value: SERVE_WEB ? "1" : "1", configured: SERVE_WEB, sensitive: false },
    { name: "GCOS_ALLOWED_ORIGIN", value: "https://rmvi.org", configured: ALLOWED_ORIGIN === "https://rmvi.org", sensitive: false },
    { name: "GCOS_HEALTHCHECK_URL", value: "https://rmvi.org", configured: (process.env.GCOS_HEALTHCHECK_URL ?? "") === "https://rmvi.org", sensitive: false },
    { name: "GCOS_ENABLE_DEV_RESET", value: "0", configured: !DEV_RESET_ENABLED, sensitive: false },
    { name: "GCOS_STORAGE_PROVIDER", value: "database", configured: STORAGE_PROVIDER === "database", sensitive: false },
    { name: "GCOS_DATABASE_URL", value: DATABASE_URL ? redactSecret(DATABASE_URL) : "required", configured: Boolean(DATABASE_URL), sensitive: true },
    { name: "GCOS_DATABASE_SSL", value: "1", configured: process.env.GCOS_DATABASE_SSL === "1", sensitive: false },
    { name: "GCOS_DATABASE_POOL_SIZE", value: process.env.GCOS_DATABASE_POOL_SIZE ?? "5", configured: Number(process.env.GCOS_DATABASE_POOL_SIZE ?? 0) >= 2, sensitive: false },
    { name: "GCOS_OBJECT_VAULT_PATH", value: OBJECT_VAULT_PATH, configured: Boolean(process.env.GCOS_OBJECT_VAULT_PATH), sensitive: false },
    { name: "GCOS_LOGIN_RATE_LIMIT", value: String(LOGIN_RATE_LIMIT), configured: LOGIN_RATE_LIMIT >= 5, sensitive: false },
    { name: "GCOS_LOGIN_RATE_WINDOW_MS", value: String(LOGIN_RATE_WINDOW_MS), configured: LOGIN_RATE_WINDOW_MS >= 60000, sensitive: false },
    { name: "GCOS_MUTATION_RATE_LIMIT", value: String(MUTATION_RATE_LIMIT), configured: MUTATION_RATE_LIMIT >= 100, sensitive: false },
    { name: "GCOS_MUTATION_RATE_WINDOW_MS", value: String(MUTATION_RATE_WINDOW_MS), configured: MUTATION_RATE_WINDOW_MS >= 60000, sensitive: false },
    { name: "GCOS_MANAGED_RESTORE_DRILL", value: "1", configured: process.env.GCOS_MANAGED_RESTORE_DRILL === "1", sensitive: false }
  ];
}

function productionSecretsPlan() {
  const entries = productionSecretEntries().map((secret) => ({
    ...secret,
    status: secret.configured ? "ready" : "needed",
    displayValue: secret.sensitive && secret.configured ? "configured secret" : secret.value,
    nextAction: secret.configured ? "No action needed" : productionSecretAction(secret.name)
  }));
  const required = entries.length;
  const ready = entries.filter((entry) => entry.configured).length;
  const missing = entries.filter((entry) => !entry.configured).map((entry) => entry.name);
  return {
    generatedAt: new Date().toISOString(),
    targetDomain: DOMAIN,
    status: missing.length ? "secrets-pending" : "secrets-ready",
    required,
    ready,
    missing,
    entries,
    nextActions: missing.length
      ? missing.slice(0, 5).map((name) => productionSecretAction(name))
      : ["Run npm run launch:verify:live from Replit."]
  };
}

function productionSecretAction(name) {
  if (name === "GCOS_DATABASE_URL") return "Create/connect managed Postgres and set GCOS_DATABASE_URL in Replit Secrets.";
  if (name === "GCOS_OBJECT_VAULT_PATH") return "Set GCOS_OBJECT_VAULT_PATH to a persistent upload vault path.";
  if (name === "NODE_ENV") return "Set NODE_ENV=production in Replit Secrets.";
  if (name === "GCOS_ALLOWED_ORIGIN") return "Set GCOS_ALLOWED_ORIGIN=https://rmvi.org.";
  if (name === "GCOS_HEALTHCHECK_URL") return "Set GCOS_HEALTHCHECK_URL=https://rmvi.org.";
  return `Set ${name} in Replit Secrets.`;
}

async function launchSignoffMatrix() {
  const launch = await launchReadiness();
  const monitor = await operationalMonitor();
  const cutover = persistenceCutoverChecklist();
  const backupManifest = await persistenceBackupManifest();
  const restoreDrill = await persistenceRestoreDrill();
  const security = securityControlsDigest();
  const compliance = complianceReviewDigest();
  const evidence = evidenceVaultDigest();
  const mvpGates = [
    { name: "web-workstation", ok: launch.checks.find((check) => check.name === "web-shell")?.ok ?? false, detail: "Web app served from the API process" },
    { name: "workflow-coverage", ok: ["stations", "messages", "reports", "approvals", "tasks"].every((key) => operationalStatus().counts[key] > 0), detail: "Core governance modules have seed data and API coverage" },
    { name: "audit-operations", ok: operationalStatus().counts.audit > 0, detail: "Audit ledger is recording actions" },
    { name: "operator-cockpit", ok: monitor.score > 0, detail: `Operational monitor score ${monitor.score}%` }
  ];
  const productionGates = [
    { name: "production-env", ok: process.env.NODE_ENV === "production", detail: process.env.NODE_ENV ?? "not set" },
    { name: "domain-and-cors", ok: DOMAIN === "rmvi.org" && ALLOWED_ORIGIN === "https://rmvi.org", detail: `${DOMAIN} / ${ALLOWED_ORIGIN}` },
    { name: "managed-database", ok: STORAGE_PROVIDER === "database" && Boolean(DATABASE_URL), detail: STORAGE_PROVIDER === "database" ? "Database provider selected" : "JSON provider active" },
    { name: "backup-and-restore", ok: backupManifest.status === "protected" && restoreDrill.valid, detail: `${backupManifest.status} / ${restoreDrill.status}` },
    { name: "deployment-monitor", ok: monitor.status === "healthy", detail: `${monitor.status} with ${monitor.criticalSignals.length} signals` }
  ];
  const enterpriseGates = [
    { name: "security-controls", ok: security.verified >= 2 && security.exceptions === 0, detail: `${security.verified} verified, ${security.exceptions} exceptions` },
    { name: "compliance-evidence", ok: compliance.attested >= 1 && evidence.sealed >= 1 && evidence.verified >= 1, detail: `${compliance.attested} attestations, ${evidence.sealed} sealed evidence` },
    { name: "immutable-audit", ok: services.auditDigest().sealed >= 1 && services.auditDigest().verified >= 1, detail: "Audit rows sealed and verified" },
    { name: "database-cutover", ok: cutover.ready || cutover.status === "go", detail: cutover.nextAction },
    { name: "operational-signals", ok: monitor.criticalSignals.length === 0, detail: `${monitor.criticalSignals.length} critical signals` }
  ];
  const tracks = [
    readinessTrack("usable-web-mvp", "Usable web MVP", mvpGates),
    readinessTrack("production-readiness", "Production readiness", productionGates),
    readinessTrack("enterprise-deployment", "Enterprise deployment", enterpriseGates)
  ];
  const overallScore = Math.round(tracks.reduce((sum, track) => sum + track.score, 0) / tracks.length);
  return {
    generatedAt: new Date().toISOString(),
    targetDomain: DOMAIN,
    overallScore,
    status: tracks.every((track) => track.score === 100) ? "signed-off" : "in-progress",
    tracks,
    blockers: tracks.flatMap((track) => track.blockers.map((blocker) => `${track.name}: ${blocker}`)),
    nextActions: tracks.flatMap((track) => track.gates.filter((gate) => !gate.ok).slice(0, 2).map((gate) => gate.detail)).slice(0, 6)
  };
}

async function recordLaunchSignoff(actor) {
  requirePermission(actor, "canApprove");
  const signoff = await launchSignoffMatrix();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastLaunchSignoff = {
    generatedAt: signoff.generatedAt,
    actor,
    status: signoff.status,
    overallScore: signoff.overallScore,
    blockers: signoff.blockers.length
  };
  record("LaunchSignoffRecorded", actor, "GCOS launch signoff", `${signoff.status} / ${signoff.overallScore}%`);
  return { signoff, status: persistenceStatusSync() };
}

function readinessTrack(id, name, gates) {
  const score = scoreChecks(gates);
  return {
    id,
    name,
    score,
    status: score === 100 ? "complete" : "in-progress",
    gates,
    blockers: gates.filter((gate) => !gate.ok).map((gate) => gate.name)
  };
}

async function recordLaunchDeploymentPlan(actor) {
  requirePermission(actor, "canApprove");
  const plan = await launchDeploymentPlan();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastDeploymentPlan = {
    generatedAt: plan.generatedAt,
    actor,
    productionScore: plan.readiness.productionScore,
    goLive: plan.goLive,
    missingSecrets: plan.requiredSecrets.filter((secret) => !secret.configured).length
  };
  record("LaunchDeploymentPlanChecked", actor, "GCOS deployment", plan.nextAction);
  return { plan, status: persistenceStatusSync() };
}

function scoreChecks(checks) {
  if (!checks.length) return 0;
  return Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);
}

function rateLimitStatus() {
  return {
    login: {
      limit: LOGIN_RATE_LIMIT,
      windowSeconds: Math.round(LOGIN_RATE_WINDOW_MS / 1000)
    },
    mutations: {
      limit: MUTATION_RATE_LIMIT,
      windowSeconds: Math.round(MUTATION_RATE_WINDOW_MS / 1000)
    }
  };
}

function assertLoginRateLimit(email, ip) {
  const normalizedEmail = normalizeStationEmail(email);
  assertRateLimit(`login:${ip}:${normalizedEmail}`, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_MS, "Too many login attempts");
}

function assertMutationRateLimit(request, pathname) {
  if (!pathname.startsWith("/api/")) return;
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") return;
  if (pathname === "/api/auth/login") return;
  assertRateLimit(`mutation:${clientIp(request)}`, MUTATION_RATE_LIMIT, MUTATION_RATE_WINDOW_MS, "Too many API mutations");
}

function assertRateLimit(key, limit, windowMs, message) {
  if (!limit || !windowMs) return;
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key) ?? { count: 0, resetAt: now + windowMs };
  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);
  pruneRateLimitBuckets(now);
  if (bucket.count > limit) throw new HttpError(429, message);
}

function pruneRateLimitBuckets(now) {
  if (rateLimitBuckets.size < 5000) return;
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}

function clientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return request.socket.remoteAddress ?? "unknown";
}

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function redactSecret(value) {
  return value.replace(/:\/\/([^:@/]+):([^@/]+)@/, "://$1:***@");
}

function persistenceStatusSync() {
  return storage.statusSync(state);
}

async function persistenceStatus() {
  return storage.status(state);
}

async function createPersistenceBackup(body, actor) {
  requirePermission(actor, "canApprove");
  const backup = await storage.backupState(state, { actor, label: body.label });
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastBackup = backup;
  record("PersistenceBackupCreated", actor, "Persistence store", backup.path ?? backup.label);
  return { backup, status: await persistenceStatus() };
}

async function persistenceBackupManifest() {
  return storage.backupManifest(state);
}

async function recordPersistenceBackupManifest(actor) {
  requirePermission(actor, "canApprove");
  const manifest = await persistenceBackupManifest();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastBackupManifest = {
    generatedAt: manifest.generatedAt,
    actor,
    status: manifest.status,
    total: manifest.total,
    totalBytes: manifest.totalBytes,
    latestHash: manifest.latest?.hash ?? null
  };
  record("PersistenceBackupManifestRecorded", actor, "Persistence backups", `${manifest.total} backups / ${manifest.status}`);
  return { manifest, status: await persistenceStatus() };
}

async function persistenceRestoreDrill() {
  return storage.restoreDrill(state);
}

async function recordPersistenceRestoreDrill(actor) {
  requirePermission(actor, "canApprove");
  const drill = await persistenceRestoreDrill();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastRestoreDrill = {
    generatedAt: drill.generatedAt,
    actor,
    valid: drill.valid,
    status: drill.status,
    backupHash: drill.backupHash,
    recordDelta: drill.recordDelta
  };
  record("PersistenceRestoreDrillRecorded", actor, "Persistence backups", `${drill.status} / delta ${drill.recordDelta}`);
  return { drill, status: await persistenceStatus() };
}

async function verifyPersistence(actor) {
  requirePermission(actor, "canApprove");
  const status = await persistenceStatus();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastVerifiedAt = new Date().toISOString();
  state.persistenceMeta.lastVerifiedBy = actor;
  state.persistenceMeta.lastVerifiedHash = status.hash;
  record("PersistenceVerified", actor, "Persistence store", status.hash);
  return { verified: true, status: await persistenceStatus() };
}

function persistenceExport(actor) {
  return storage.exportState(state, actor);
}

function persistenceMigrationPlan() {
  return storage.migrationPlan(state);
}

function persistenceSchemaPlan() {
  return storage.schemaPlan(state);
}

function persistenceImportDryRun() {
  return storage.importDryRun(state);
}

function persistenceCutoverChecklist() {
  return storage.cutoverChecklist(state);
}

function recordPersistenceImportDryRun(actor) {
  requirePermission(actor, "canApprove");
  const dryRun = persistenceImportDryRun();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastImportDryRun = {
    generatedAt: dryRun.generatedAt,
    actor,
    valid: dryRun.valid,
    estimatedRows: dryRun.estimatedRows,
    estimatedBatches: dryRun.estimatedBatches,
    blockers: dryRun.blockers.length,
    warnings: dryRun.warnings.length
  };
  record("PersistenceImportDryRun", actor, "Database import", dryRun.nextAction);
  return { dryRun, status: persistenceStatusSync() };
}

function recordPersistenceCutoverChecklist(actor) {
  requirePermission(actor, "canApprove");
  const checklist = persistenceCutoverChecklist();
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastCutoverChecklist = {
    generatedAt: checklist.generatedAt,
    actor,
    ready: checklist.ready,
    status: checklist.status,
    blockers: checklist.blockers.length
  };
  record("PersistenceCutoverChecked", actor, "Database cutover", checklist.nextAction);
  return { checklist, status: persistenceStatusSync() };
}

async function createPersistenceMigrationExport(body, actor) {
  requirePermission(actor, "canApprove");
  const migration = await storage.exportMigrationBundle(state, { actor, label: body.label });
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastMigrationExport = {
    path: migration.path,
    label: migration.label,
    hash: migration.hash,
    createdAt: migration.createdAt,
    createdBy: migration.createdBy,
    estimatedRows: migration.plan.estimatedRows
  };
  record("PersistenceMigrationExported", actor, "Database migration bundle", migration.path ?? migration.label);
  return { migration, status: await persistenceStatus() };
}

async function createPersistenceSchemaExport(body, actor) {
  requirePermission(actor, "canApprove");
  const schema = await storage.exportSchemaPackage(state, { actor, label: body.label });
  state.persistenceMeta ??= {};
  state.persistenceMeta.lastSchemaExport = {
    path: schema.path,
    label: schema.label,
    hash: schema.hash,
    createdAt: schema.createdAt,
    createdBy: schema.createdBy,
    tableCount: schema.schema.tableCount
  };
  record("PersistenceSchemaExported", actor, "Database schema package", schema.path ?? schema.label);
  return { schema, status: await persistenceStatus() };
}

async function uploadFile(body, actor) {
  const bytes = decodeBase64Payload(body.contentBase64);
  const now = new Date().toISOString();
  const hash = hashBuffer(bytes);
  const extension = extensionForFile(body.name, body.contentType);
  const safeName = String(body.name).toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)/g, "") || `upload${extension}`;
  const id = randomUUID();
  const objectKey = `${id}/${safeName}`;
  const diskPath = resolve(OBJECT_VAULT_PATH, objectKey);
  if (!diskPath.startsWith(resolve(OBJECT_VAULT_PATH))) throw new HttpError(400, "Invalid object key");
  await mkdir(dirname(diskPath), { recursive: true });
  await writeFile(diskPath, bytes);
  state.files ??= [];
  const file = {
    id,
    name: body.name,
    contentType: body.contentType,
    size: bytes.length,
    hash,
    objectKey,
    storagePath: diskPath,
    uploadedAt: now,
    uploadedBy: actor,
    source: body.source ?? "Object Vault",
    linkedTo: []
  };
  state.files.unshift(file);
  record("FileUploaded", actor, file.name, `${file.size} bytes ${file.hash}`);
  return file;
}

function linkDocumentFile(id, body, actor) {
  const document = findById(state.documents, id);
  const file = getFile(body.fileId);
  document.files ??= [];
  if (!document.files.some((item) => item.id === file.id)) {
    document.files.push(fileReference(file));
  }
  document.storageKey = file.objectKey;
  document.fileHash = file.hash;
  document.fileSize = file.size;
  document.contentType = file.contentType;
  linkFileTo(file, "document", document.id);
  record("FileLinked", actor, document.name, `Linked ${file.name}`);
  return document;
}

function linkReportFile(id, body, actor) {
  const reportRecord = findById(state.reports, id);
  const file = getFile(body.fileId);
  reportRecord.evidenceFiles ??= [];
  if (!reportRecord.evidenceFiles.some((item) => item.id === file.id)) {
    reportRecord.evidenceFiles.push(fileReference(file));
  }
  reportRecord.evidenceStatus = `${reportRecord.evidenceFiles.length} evidence file${reportRecord.evidenceFiles.length === 1 ? "" : "s"} attached`;
  reportRecord.routingStage = "Evidence review";
  reportRecord.score = Math.max(reportRecord.score ?? 0, 72);
  linkFileTo(file, "report", reportRecord.id);
  record("ReportEvidenceFileLinked", actor, reportRecord.name, `Linked ${file.name}`);
  return reportRecord;
}

function linkEvidenceFile(id, body, actor) {
  const file = getFile(body.fileId);
  const evidence = getEvidence(id);
  const files = [...(evidence.files ?? [])];
  if (!files.some((item) => item.id === file.id)) files.push(fileReference(file));
  linkFileTo(file, "evidence", evidence.id);
  return patchEvidence(id, {
    files,
    fileCount: Math.max(evidence.fileCount ?? 0, files.length),
    latestFileHash: file.hash,
    latestFileAt: new Date().toISOString()
  }, actor, "FileLinked", `Linked ${file.name}`);
}

async function readStoredFile(id, actor) {
  const file = getFile(id);
  const body = await readFile(file.storagePath);
  file.downloadedAt = new Date().toISOString();
  file.downloadedBy = actor;
  record("FileDownloaded", actor, file.name, file.hash);
  await saveState();
  return {
    raw: true,
    status: 200,
    body,
    contentType: file.contentType,
    filename: file.name
  };
}

function getFile(id) {
  const decoded = decodeURIComponent(String(id ?? ""));
  const file = (state.files ?? []).find((item) => item.id === decoded);
  if (!file) throw new HttpError(404, "File not found");
  return file;
}

function fileReference(file) {
  return {
    id: file.id,
    name: file.name,
    contentType: file.contentType,
    size: file.size,
    hash: file.hash,
    objectKey: file.objectKey
  };
}

function linkFileTo(file, kind, id) {
  file.linkedTo ??= [];
  if (!file.linkedTo.some((item) => item.kind === kind && item.id === id)) {
    file.linkedTo.push({ kind, id, linkedAt: new Date().toISOString() });
  }
}

function decodeBase64Payload(value) {
  const raw = String(value ?? "").replace(/^data:[^;]+;base64,/, "");
  const bytes = Buffer.from(raw, "base64");
  if (!bytes.length) throw new HttpError(400, "File content is required");
  return bytes;
}

function extensionForFile(name, contentType) {
  const current = extname(name ?? "");
  if (current) return current;
  if (contentType === "application/pdf") return ".pdf";
  if (contentType === "image/png") return ".png";
  if (contentType === "image/jpeg") return ".jpg";
  if (contentType === "text/plain") return ".txt";
  return ".bin";
}

function hashBuffer(buffer) {
  return `sha256:${createHash("sha256").update(buffer).digest("hex")}`;
}

function readinessReport() {
  const status = operationalStatus();
  const persistence = status.persistenceStatus;
  const actions = ensureReadinessActions();
  const checks = [
    { name: "web", ok: SERVE_WEB, detail: SERVE_WEB ? "Web shell served by API" : "API-only mode" },
    { name: "persistence", ok: Boolean(persistence?.mode), detail: `${persistence?.provider ?? "unknown"}:${persistence?.mode ?? "unavailable"}` },
    { name: "stations", ok: state.stations.length >= 4, detail: `${state.stations.length} station identities` },
    { name: "audit", ok: state.audit.length > 0, detail: `${state.audit.length} audit rows` },
    { name: "security", ok: DEV_RESET_ENABLED === false || process.env.NODE_ENV !== "production", detail: DEV_RESET_ENABLED ? "Development reset enabled" : "Development reset disabled" },
    { name: "exports", ok: true, detail: "Governance snapshot endpoint available" },
    { name: "sessions", ok: status.sessions.active >= 0, detail: `${status.sessions.active} active sessions` },
    { name: "workflows", ok: state.reports.length > 0 && state.approvals.length > 0, detail: `${state.reports.length} reports, ${state.approvals.length} approvals` }
  ].map((check) => ({ ...check, ...(actions[check.name] ?? {}) })).filter((check) => !check.archived);
  return {
    status: checks.every((check) => check.ok) ? "ready" : "attention",
    checkedAt: new Date().toISOString(),
    checks
  };
}

function ensureReadinessActions() {
  state.readinessActions ??= {};
  return state.readinessActions;
}

function getReadinessCheck(name) {
  const decoded = decodeURIComponent(String(name ?? ""));
  const check = readinessReport().checks.find((item) => item.name === decoded);
  if (!check) throw new HttpError(404, "Readiness check not found");
  return check;
}

function patchReadiness(name, patch, actor, event, result) {
  const check = getReadinessCheck(name);
  const actions = ensureReadinessActions();
  actions[check.name] = { ...(actions[check.name] ?? {}), ...patch };
  record(event, actor, check.name, result);
  return { check: { ...check, ...actions[check.name] }, readiness: readinessReport() };
}

function acknowledgeReadiness(name, body, actor) {
  return patchReadiness(name, {
    acknowledged: true,
    acknowledgedBy: actor,
    acknowledgedAt: new Date().toISOString()
  }, actor, "ReadinessAcknowledged", body.reason ?? "Readiness check acknowledged");
}

function overrideReadiness(name, body, actor) {
  requirePermission(actor, "canOverride");
  return patchReadiness(name, {
    override: true,
    overrideReason: body.reason ?? "Readiness override approved",
    ok: true
  }, actor, "ReadinessOverrideApproved", body.reason ?? "Readiness override approved");
}

function assignReadinessOwner(name, body, actor) {
  return patchReadiness(name, {
    owner: body.owner ?? actor
  }, actor, "ReadinessOwnerAssigned", body.owner ?? actor);
}

function scheduleReadinessRecheck(name, body, actor) {
  return patchReadiness(name, {
    recheckAt: body.recheckAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  }, actor, "ReadinessRecheckScheduled", body.recheckAt ?? "Next 24 hours");
}

function archiveReadiness(name, body, actor) {
  return patchReadiness(name, {
    archived: true,
    archiveReason: body.reason ?? "Readiness check archived"
  }, actor, "ReadinessCheckArchived", body.reason ?? "Readiness check archived");
}

function bulkAcknowledgeReadiness(body, actor) {
  const names = body.names?.length ? body.names : readinessReport().checks.slice(0, 3).map((item) => item.name);
  const updated = names.map((name) => acknowledgeReadiness(name, body, actor).check);
  record("ReadinessBulkAcknowledged", actor, "Readiness checks", `${updated.length} checks acknowledged`);
  return { count: updated.length, updated, readiness: readinessReport() };
}

function createReadinessRemediation(name, body, actor) {
  const check = getReadinessCheck(name);
  const created = services.createTask({
    title: body.title ?? `Remediate readiness: ${check.name}`,
    owner: "Platform Readiness",
    assignee: body.assignee ?? actor,
    priority: body.priority ?? (check.ok ? "Medium" : "High"),
    due: body.due ?? "Today",
    actor
  });
  patchReadiness(name, { remediationTaskId: created.id, owner: body.assignee ?? actor }, actor, "ReadinessRemediationCreated", created.title);
  return created;
}

function readinessDigest() {
  const report = readinessReport();
  return {
    generatedAt: new Date().toISOString(),
    total: report.checks.length,
    ready: report.checks.filter((check) => check.ok).length,
    attention: report.checks.filter((check) => !check.ok).length,
    acknowledged: report.checks.filter((check) => check.acknowledged).length,
    overrides: report.checks.filter((check) => check.override).length,
    owned: report.checks.filter((check) => check.owner).length,
    scheduled: report.checks.filter((check) => check.recheckAt).length,
    nextCheck: report.checks.find((check) => !check.acknowledged)?.name ?? report.checks[0]?.name ?? "No checks"
  };
}

const baseSecurityControls = [
  { name: "RBAC", detail: "Role-based permissions protect delegated authority and approval gates.", status: "Active" },
  { name: "ABAC", detail: "Attribute-based context controls station level, department, and hierarchy visibility.", status: "Active" },
  { name: "Station permissions", detail: "Every workstation inherits station-scoped permissions and reporting limits.", status: "Active" },
  { name: "Session invalidation", detail: "Transfers, locks, and station revocations can invalidate active sessions.", status: "Active" },
  { name: "End-to-end encryption", detail: "ChurchMail attachments and administrative packets require encryption controls.", status: "Warning" },
  { name: "Immutable logging", detail: "Audit rows, event-bus updates, and governance actions are permanently recorded.", status: "Active" }
];

function ensureSecurityControls() {
  state.securityControls ??= {};
  return state.securityControls;
}

function securityControlsReport() {
  const actions = ensureSecurityControls();
  return baseSecurityControls.map((control) => ({
    ...control,
    ...(actions[control.name] ?? {})
  }));
}

function getSecurityControl(name) {
  const decoded = decodeURIComponent(String(name ?? ""));
  const control = securityControlsReport().find((item) => item.name === decoded);
  if (!control) throw new HttpError(404, "Security control not found");
  return control;
}

function patchSecurityControl(name, patch, actor, event, result) {
  const control = getSecurityControl(name);
  const controls = ensureSecurityControls();
  controls[control.name] = {
    ...(controls[control.name] ?? {}),
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: actor
  };
  record(event, actor, control.name, result);
  return { control: { ...control, ...controls[control.name] }, controls: securityControlsReport() };
}

function updateSecurityControlStatus(name, body, actor) {
  requirePermission(actor, "canApprove");
  return patchSecurityControl(name, {
    status: body.status ?? "Active",
    statusReason: body.reason ?? "Status updated from audit security controls"
  }, actor, "SecurityControlStatusUpdated", body.reason ?? body.status ?? "Status updated");
}

function assignSecurityControlOwner(name, body, actor) {
  return patchSecurityControl(name, {
    owner: body.owner ?? actor
  }, actor, "SecurityControlOwnerAssigned", body.owner ?? actor);
}

function attachSecurityControlEvidence(name, body, actor) {
  return patchSecurityControl(name, {
    evidence: body.evidence ?? "Evidence packet attached",
    evidenceAt: new Date().toISOString()
  }, actor, "SecurityControlEvidenceAttached", body.evidence ?? "Evidence packet attached");
}

function testSecurityControl(name, body, actor) {
  return patchSecurityControl(name, {
    lastTest: new Date().toISOString(),
    lastTestResult: body.result ?? "Control test passed",
    status: body.status ?? "Active"
  }, actor, "SecurityControlTested", body.result ?? "Control test passed");
}

function rotateSecurityControl(name, body, actor) {
  requirePermission(actor, "canApprove");
  return patchSecurityControl(name, {
    lastRotation: new Date().toISOString(),
    rotationReason: body.reason ?? "Control secret or policy rotation completed",
    status: "Active"
  }, actor, "SecurityControlRotated", body.reason ?? "Control rotation completed");
}

function openSecurityControlException(name, body, actor) {
  requirePermission(actor, "canApprove");
  return patchSecurityControl(name, {
    status: "Exception",
    exceptionReason: body.reason ?? "Temporary exception opened from audit desk",
    exceptionAt: new Date().toISOString()
  }, actor, "SecurityControlExceptionOpened", body.reason ?? "Temporary exception opened");
}

function createSecurityControlRemediation(name, body, actor) {
  const control = getSecurityControl(name);
  const created = services.createTask({
    title: body.title ?? `Remediate security control: ${control.name}`,
    owner: "Security Controls",
    assignee: body.assignee ?? actor,
    priority: body.priority ?? (control.status === "Warning" || control.status === "Exception" ? "High" : "Medium"),
    due: body.due ?? "Today",
    actor
  });
  patchSecurityControl(name, {
    remediationTaskId: created.id,
    owner: body.assignee ?? actor
  }, actor, "SecurityControlRemediationCreated", created.title);
  return created;
}

function verifySecurityControl(name, body, actor) {
  return patchSecurityControl(name, {
    verified: true,
    verifiedAt: new Date().toISOString(),
    verification: body.result ?? "Control verified from audit desk",
    status: "Active"
  }, actor, "SecurityControlVerified", body.result ?? "Control verified");
}

function bulkTestSecurityControls(body, actor) {
  const names = body.names?.length ? body.names : securityControlsReport().slice(0, 3).map((control) => control.name);
  const updated = names.map((name) => testSecurityControl(name, { result: body.result ?? "Bulk control test passed" }, actor).control);
  record("SecurityControlsBulkTested", actor, "Security Controls", `${updated.length} controls tested`);
  return { count: updated.length, updated, controls: securityControlsReport() };
}

function securityControlsDigest() {
  const controls = securityControlsReport();
  return {
    generatedAt: new Date().toISOString(),
    total: controls.length,
    active: controls.filter((control) => control.status === "Active").length,
    warning: controls.filter((control) => control.status === "Warning").length,
    exceptions: controls.filter((control) => control.status === "Exception").length,
    verified: controls.filter((control) => control.verified).length,
    evidence: controls.filter((control) => control.evidence).length,
    owners: controls.filter((control) => control.owner).length,
    rotations: controls.filter((control) => control.lastRotation).length,
    nextControl: controls.find((control) => control.status !== "Active")?.name ?? controls.find((control) => !control.verified)?.name ?? controls[0]?.name ?? "No controls"
  };
}

const baseComplianceReviews = [
  {
    id: "comp-finance-q2",
    title: "Quarterly finance packet",
    scope: "National -> County finance reports",
    status: "Open",
    risk: "High",
    score: 72,
    reviewer: "National Audit Desk",
    due: "Today",
    evidence: "Financial report chain"
  },
  {
    id: "comp-transfer-access",
    title: "Transfer access revocation",
    scope: "Personnel transfer controls",
    status: "Open",
    risk: "Medium",
    score: 64,
    reviewer: "Security Controls",
    due: "Tomorrow",
    evidence: "Session invalidation logs"
  },
  {
    id: "comp-churchmail-archive",
    title: "ChurchMail archive retention",
    scope: "Governance communication records",
    status: "In Review",
    risk: "Medium",
    score: 58,
    reviewer: "Compliance Engine",
    due: "This week",
    evidence: "Archive manifest"
  }
];

function ensureComplianceReviews() {
  state.complianceReviews ??= {};
  return state.complianceReviews;
}

function complianceReviewsReport() {
  const actions = ensureComplianceReviews();
  return baseComplianceReviews
    .map((review) => ({ ...review, ...(actions[review.id] ?? {}) }))
    .filter((review) => !review.archived);
}

function getComplianceReview(id) {
  const decoded = decodeURIComponent(String(id ?? ""));
  const review = complianceReviewsReport().find((item) => item.id === decoded);
  if (!review) throw new HttpError(404, "Compliance review not found");
  return review;
}

function patchComplianceReview(id, patch, actor, event, result) {
  const review = getComplianceReview(id);
  const reviews = ensureComplianceReviews();
  reviews[review.id] = {
    ...(reviews[review.id] ?? {}),
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: actor
  };
  record(event, actor, review.title, result);
  return { review: { ...review, ...reviews[review.id] }, reviews: complianceReviewsReport() };
}

function routeComplianceReview(id, body, actor) {
  return patchComplianceReview(id, {
    reviewer: body.reviewer ?? actor,
    routedAt: new Date().toISOString(),
    status: "In Review"
  }, actor, "ComplianceReviewRouted", body.reviewer ?? actor);
}

function attachComplianceEvidence(id, body, actor) {
  return patchComplianceReview(id, {
    evidence: body.evidence ?? "Evidence packet attached",
    evidenceCount: (getComplianceReview(id).evidenceCount ?? 0) + 1,
    evidenceAt: new Date().toISOString()
  }, actor, "ComplianceEvidenceAttached", body.evidence ?? "Evidence packet attached");
}

function scoreComplianceRisk(id, body, actor) {
  const score = body.score ?? 75;
  const risk = body.risk ?? (score >= 80 ? "Critical" : score >= 65 ? "High" : score >= 40 ? "Medium" : "Low");
  return patchComplianceReview(id, {
    score,
    risk,
    scoredAt: new Date().toISOString()
  }, actor, "ComplianceRiskScored", `${risk} ${score}`);
}

function attestComplianceReview(id, body, actor) {
  return patchComplianceReview(id, {
    attested: true,
    attestedBy: actor,
    attestedAt: new Date().toISOString(),
    attestation: body.attestation ?? "Reviewer attestation recorded",
    status: "Attested"
  }, actor, "ComplianceReviewAttested", body.attestation ?? "Reviewer attestation recorded");
}

function prepareCompliancePacket(id, body, actor) {
  return patchComplianceReview(id, {
    packetId: body.packetId ?? `packet-${Date.now()}`,
    packetPreparedAt: new Date().toISOString(),
    status: "Packet Ready"
  }, actor, "CompliancePacketPrepared", body.packetId ?? "Audit packet prepared");
}

function exportComplianceReview(id, body, actor) {
  return patchComplianceReview(id, {
    exported: true,
    exportedAt: new Date().toISOString(),
    exportFormat: body.format ?? "PDF"
  }, actor, "ComplianceReviewExported", body.format ?? "PDF");
}

function archiveComplianceReview(id, body, actor) {
  return patchComplianceReview(id, {
    archived: true,
    archivedAt: new Date().toISOString(),
    archiveReason: body.reason ?? "Compliance review archived"
  }, actor, "ComplianceReviewArchived", body.reason ?? "Compliance review archived");
}

function escalateComplianceReview(id, body, actor) {
  requirePermission(actor, "canApprove");
  const review = patchComplianceReview(id, {
    status: "Escalated",
    risk: body.risk ?? "Critical",
    escalationReason: body.reason ?? "Escalated from compliance review queue",
    escalatedAt: new Date().toISOString()
  }, actor, "ComplianceReviewEscalated", body.reason ?? "Compliance review escalated");
  services.createEscalation({
    item: review.review.title,
    reason: body.reason ?? "Compliance review escalated",
    owner: review.review.reviewer ?? actor,
    severity: body.risk ?? "Critical",
    actor
  });
  return review;
}

function bulkReviewCompliance(body, actor) {
  const ids = body.ids?.length ? body.ids : complianceReviewsReport().slice(0, 2).map((review) => review.id);
  const updated = ids.map((id) => patchComplianceReview(id, {
    status: "In Review",
    reviewer: body.reviewer ?? actor,
    reviewedAt: new Date().toISOString()
  }, actor, "ComplianceReviewBulkReviewed", body.reviewer ?? actor).review);
  record("ComplianceReviewsBulkReviewed", actor, "Compliance Review Queue", `${updated.length} reviews routed`);
  return { count: updated.length, updated, reviews: complianceReviewsReport() };
}

function complianceReviewDigest() {
  const reviews = complianceReviewsReport();
  return {
    generatedAt: new Date().toISOString(),
    total: reviews.length,
    open: reviews.filter((review) => review.status === "Open").length,
    inReview: reviews.filter((review) => review.status === "In Review").length,
    attested: reviews.filter((review) => review.attested).length,
    packetReady: reviews.filter((review) => review.packetId).length,
    exported: reviews.filter((review) => review.exported).length,
    escalated: reviews.filter((review) => review.status === "Escalated").length,
    highRisk: reviews.filter((review) => ["High", "Critical"].includes(review.risk)).length,
    nextReview: reviews.find((review) => !review.attested)?.title ?? reviews[0]?.title ?? "No reviews"
  };
}

const baseEvidenceVault = [
  {
    id: "ev-finance-ledger",
    title: "County finance ledger packet",
    source: "Compliance Review",
    classification: "Financial",
    custody: "National Audit Desk",
    status: "Open",
    chainHash: "hash-finance-ledger",
    retention: "7 years",
    fileCount: 12
  },
  {
    id: "ev-transfer-session",
    title: "Transfer session invalidation logs",
    source: "Security Controls",
    classification: "Security",
    custody: "Security Controls",
    status: "Open",
    chainHash: "hash-transfer-session",
    retention: "Permanent",
    fileCount: 7
  },
  {
    id: "ev-churchmail-archive",
    title: "ChurchMail archive manifest",
    source: "Archive",
    classification: "Governance",
    custody: "Compliance Engine",
    status: "In Review",
    chainHash: "hash-churchmail-archive",
    retention: "Permanent",
    fileCount: 21
  }
];

function ensureEvidenceVault() {
  state.evidenceVault ??= {};
  return state.evidenceVault;
}

function evidenceVaultReport() {
  const actions = ensureEvidenceVault();
  return baseEvidenceVault
    .map((evidence) => ({ ...evidence, ...(actions[evidence.id] ?? {}) }))
    .filter((evidence) => !evidence.archived);
}

function getEvidence(id) {
  const decoded = decodeURIComponent(String(id ?? ""));
  const evidence = evidenceVaultReport().find((item) => item.id === decoded);
  if (!evidence) throw new HttpError(404, "Evidence record not found");
  return evidence;
}

function patchEvidence(id, patch, actor, event, result) {
  const evidence = getEvidence(id);
  const records = ensureEvidenceVault();
  records[evidence.id] = {
    ...(records[evidence.id] ?? {}),
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: actor
  };
  record(event, actor, evidence.title, result);
  return { evidence: { ...evidence, ...records[evidence.id] }, vault: evidenceVaultReport() };
}

function assignEvidenceCustody(id, body, actor) {
  return patchEvidence(id, {
    custody: body.custody ?? actor,
    custodyAt: new Date().toISOString(),
    status: "In Review"
  }, actor, "EvidenceCustodyAssigned", body.custody ?? actor);
}

function updateEvidenceClassification(id, body, actor) {
  return patchEvidence(id, {
    classification: body.classification ?? "Governance"
  }, actor, "EvidenceClassificationUpdated", body.classification ?? "Governance");
}

function updateEvidenceChain(id, body, actor) {
  return patchEvidence(id, {
    chainHash: body.chainHash ?? `hash-${Date.now()}`,
    chainUpdatedAt: new Date().toISOString()
  }, actor, "EvidenceChainUpdated", body.chainHash ?? "Chain hash refreshed");
}

function scheduleEvidenceRetention(id, body, actor) {
  return patchEvidence(id, {
    retention: body.retention ?? "Permanent",
    retentionReviewAt: body.reviewAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString()
  }, actor, "EvidenceRetentionScheduled", body.retention ?? "Permanent");
}

function sealEvidence(id, body, actor) {
  requirePermission(actor, "canApprove");
  return patchEvidence(id, {
    sealed: true,
    sealedAt: new Date().toISOString(),
    sealReason: body.reason ?? "Evidence sealed from audit vault",
    status: "Sealed"
  }, actor, "EvidenceSealed", body.reason ?? "Evidence sealed");
}

function verifyEvidence(id, body, actor) {
  return patchEvidence(id, {
    verified: true,
    verifiedAt: new Date().toISOString(),
    verification: body.result ?? "Evidence verified",
    status: "Verified"
  }, actor, "EvidenceVerified", body.result ?? "Evidence verified");
}

function placeEvidenceHold(id, body, actor) {
  return patchEvidence(id, {
    hold: true,
    holdReason: body.reason ?? "Evidence hold placed",
    holdAt: new Date().toISOString(),
    status: "On Hold"
  }, actor, "EvidenceHoldPlaced", body.reason ?? "Evidence hold placed");
}

function exportEvidence(id, body, actor) {
  return patchEvidence(id, {
    exported: true,
    exportFormat: body.format ?? "PDF",
    exportedAt: new Date().toISOString()
  }, actor, "EvidenceExported", body.format ?? "PDF");
}

function archiveEvidence(id, body, actor) {
  return patchEvidence(id, {
    archived: true,
    archivedAt: new Date().toISOString(),
    archiveReason: body.reason ?? "Evidence archived"
  }, actor, "EvidenceArchived", body.reason ?? "Evidence archived");
}

function bulkSealEvidence(body, actor) {
  requirePermission(actor, "canApprove");
  const ids = body.ids?.length ? body.ids : evidenceVaultReport().slice(0, 2).map((evidence) => evidence.id);
  const updated = ids.map((id) => sealEvidence(id, { reason: body.reason ?? "Bulk evidence seal" }, actor).evidence);
  record("EvidenceBulkSealed", actor, "Evidence Vault", `${updated.length} records sealed`);
  return { count: updated.length, updated, vault: evidenceVaultReport() };
}

function evidenceVaultDigest() {
  const vault = evidenceVaultReport();
  return {
    generatedAt: new Date().toISOString(),
    total: vault.length,
    sealed: vault.filter((evidence) => evidence.sealed).length,
    verified: vault.filter((evidence) => evidence.verified).length,
    holds: vault.filter((evidence) => evidence.hold).length,
    exported: vault.filter((evidence) => evidence.exported).length,
    permanent: vault.filter((evidence) => evidence.retention === "Permanent").length,
    custody: new Set(vault.map((evidence) => evidence.custody).filter(Boolean)).size,
    files: vault.reduce((sum, evidence) => sum + (evidence.fileCount ?? 0), 0),
    nextEvidence: vault.find((evidence) => !evidence.verified)?.title ?? vault[0]?.title ?? "No evidence"
  };
}

function exportSnapshot(session) {
  return {
    exportedAt: new Date().toISOString(),
    exportedBy: session.email,
    service: "gcos-api",
    version: "0.1.0",
    counts: operationalStatus().counts,
    state: services.publicState()
  };
}

function createSession(email) {
  const token = `gcos.${randomUUID()}`;
  const id = `sid_${randomUUID()}`;
  const startedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  sessions.set(token, { id, token, email, startedAt, expiresAt, status: "Active", flags: [] });
  return { token, startedAt, expiresAt };
}

function renewSession(token, actor) {
  const session = sessions.get(token);
  if (!session) throw new HttpError(404, "Session not found");
  session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  session.status = "Renewed";
  record("SessionRenewed", actor, session.email, session.expiresAt);
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function revokeSession(id, actor) {
  const found = findSessionById(id);
  const [token, session] = found ?? [];
  if (!session) throw new HttpError(404, "Session not found");
  sessions.delete(token);
  record("SessionRevoked", actor, session.email, "Session revoked");
  return { revoked: id, sessions: privateSessionSummary() };
}

function revokeStationSessions(email, currentToken, actor) {
  let revoked = 0;
  for (const [token, session] of sessions.entries()) {
    if (session.email === email && token !== currentToken) {
      sessions.delete(token);
      revoked += 1;
    }
  }
  record("StationSessionsRevoked", actor, email, `${revoked} sessions revoked`);
  return { revoked, sessions: privateSessionSummary() };
}

function flagSession(id, actor, reason) {
  const session = findSessionById(id)?.[1];
  if (!session) throw new HttpError(404, "Session not found");
  session.status = "Flagged";
  session.flags = [...(session.flags ?? []), reason ?? "Suspicious session flagged"];
  record("SessionFlagged", actor, session.email, reason ?? "Suspicious session flagged");
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function extendSession(id, actor, minutes) {
  const session = findSessionById(id)?.[1];
  if (!session) throw new HttpError(404, "Session not found");
  const extensionMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 120;
  session.expiresAt = new Date(Date.parse(session.expiresAt) + extensionMinutes * 60000).toISOString();
  session.status = "Extended";
  record("SessionExtended", actor, session.email, `${extensionMinutes} minutes added`);
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function lockSession(id, actor, reason) {
  const session = findSessionById(id)?.[1];
  if (!session) throw new HttpError(404, "Session not found");
  session.status = "Locked";
  session.lockReason = reason ?? "Session locked from audit console";
  record("SessionLocked", actor, session.email, session.lockReason);
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function unlockSession(id, actor, reason) {
  const session = findSessionById(id)?.[1];
  if (!session) throw new HttpError(404, "Session not found");
  session.status = "Active";
  session.lockReason = undefined;
  record("SessionUnlocked", actor, session.email, reason ?? "Session unlocked");
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function trustSession(id, actor, reason) {
  const session = findSessionById(id)?.[1];
  if (!session) throw new HttpError(404, "Session not found");
  session.trusted = true;
  record("SessionTrusted", actor, session.email, reason ?? "Session marked trusted");
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function requireSessionMfa(id, actor, reason) {
  const session = findSessionById(id)?.[1];
  if (!session) throw new HttpError(404, "Session not found");
  session.mfaRequired = true;
  session.status = "MFA Required";
  record("SessionMfaRequired", actor, session.email, reason ?? "Step-up MFA required");
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function labelSessionDevice(id, actor, label) {
  const session = findSessionById(id)?.[1];
  if (!session) throw new HttpError(404, "Session not found");
  session.deviceLabel = label ?? "Managed workstation";
  record("SessionDeviceLabeled", actor, session.email, session.deviceLabel);
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function noteSession(id, actor, note) {
  const session = findSessionById(id)?.[1];
  if (!session) throw new HttpError(404, "Session not found");
  session.notes = [...(session.notes ?? []), `${actor}: ${note ?? "Session note added"}`];
  record("SessionNoteAdded", actor, session.email, note ?? "Session note added");
  return { session: summarizeSession(session), sessions: privateSessionSummary() };
}

function bulkRevokeSessions(body, currentToken, actor) {
  const requested = body.ids?.length
    ? body.ids
    : Array.from(sessions.entries()).filter(([token]) => token !== currentToken).slice(0, 3).map(([, session]) => session.id);
  let revoked = 0;
  for (const id of requested) {
    const token = findSessionById(id)?.[0];
    if (token === currentToken) continue;
    if (token && sessions.delete(token)) revoked += 1;
  }
  record("SessionsBulkRevoked", actor, "Session monitor", `${revoked} sessions revoked`);
  return { revoked, sessions: privateSessionSummary() };
}

function sessionDigest() {
  const summary = sessionSummary();
  return {
    generatedAt: new Date().toISOString(),
    active: summary.active,
    expiringSoon: summary.expiringSoon,
    flagged: summary.stations.filter((session) => session.status === "Flagged").length,
    locked: summary.stations.filter((session) => session.status === "Locked").length,
    trusted: summary.stations.filter((session) => session.trusted).length,
    mfaRequired: summary.stations.filter((session) => session.mfaRequired).length,
    labeled: summary.stations.filter((session) => session.deviceLabel).length,
    nextSession: summary.stations[0]?.email ?? "No sessions"
  };
}

function sessionSummary({ includeIds = false } = {}) {
  const now = Date.now();
  const active = [];
  for (const [token, session] of sessions.entries()) {
    if (Date.parse(session.expiresAt) <= now) {
      sessions.delete(token);
      continue;
    }
    active.push({
      ...(includeIds ? { id: session.id } : {}),
      email: session.email,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      minutesRemaining: Math.max(0, Math.round((Date.parse(session.expiresAt) - now) / 60000)),
      status: session.status ?? "Active",
      flags: session.flags ?? [],
      trusted: Boolean(session.trusted),
      mfaRequired: Boolean(session.mfaRequired),
      deviceLabel: session.deviceLabel,
      notes: session.notes ?? [],
      lockReason: session.lockReason
    });
  }
  return {
    active: active.length,
    expiringSoon: active.filter((session) => session.minutesRemaining <= 30).length,
    stations: active
  };
}

function privateSessionSummary() {
  return sessionSummary({ includeIds: true });
}

function summarizeSession(session) {
  return {
    id: session.id,
    email: session.email,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
    minutesRemaining: Math.max(0, Math.round((Date.parse(session.expiresAt) - Date.now()) / 60000)),
    status: session.status ?? "Active",
    flags: session.flags ?? [],
    trusted: Boolean(session.trusted),
    mfaRequired: Boolean(session.mfaRequired),
    deviceLabel: session.deviceLabel,
    notes: session.notes ?? [],
    lockReason: session.lockReason
  };
}

function findSessionById(id) {
  for (const entry of sessions.entries()) {
    if (entry[1].id === id) return entry;
  }
  return null;
}

function authenticateRequest(request, pathname) {
  const requiresSession = pathname.startsWith("/api/sessions")
    || (pathname.startsWith("/api/")
    && pathname !== "/api/auth/login"
    && pathname !== "/api/dev/reset"
    && (request.method !== "GET" || pathname === "/api/export" || pathname === "/api/persistence/export" || (pathname.startsWith("/api/files/") && pathname.endsWith("/download"))));
  if (!requiresSession) return null;

  const token = readBearerToken(request.headers.authorization);
  if (!token) throw new HttpError(401, "Missing session token");

  const session = sessions.get(token);
  if (!session) throw new HttpError(401, "Invalid session token");
  if (Date.parse(session.expiresAt) <= Date.now()) {
    sessions.delete(token);
    throw new HttpError(401, "Expired session token");
  }
  return { ...session, token };
}

function readBearerToken(header) {
  if (!header) return "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token ?? "" : "";
}

function requirePermission(actor, permission) {
  const station = state.stations.find((item) => item.email === actor);
  if (!station) throw new HttpError(403, "Unknown station actor");
  const permissions = getPermissions(station);
  if (!permissions[permission]) throw new HttpError(403, `Station lacks ${permission}`);
}

async function loadState() {
  return storage.loadState({ seed: createSeedState(), migrate: migratePersistedState });
}

function migratePersistedState(loadedState) {
  const migratedState = JSON.parse(JSON.stringify(loadedState).replaceAll("@rmi.org", "@rmvi.org").replaceAll("@gcos.org", "@rmvi.org"));
  for (const station of migratedState.stations) station.email = normalizeStationEmail(station.email);
  for (const office of migratedState.offices) office.email = normalizeStationEmail(office.email);
  const seenStationEmails = new Set();
  migratedState.stations = migratedState.stations.filter((station) => {
    if (seenStationEmails.has(station.email)) return false;
    seenStationEmails.add(station.email);
    return true;
  });
  return migratedState;
}

async function saveState() {
  await storage.saveState(state);
}

function findById(collection, id) {
  const item = collection.find((entry) => entry.id === id);
  if (!item) throw new HttpError(404, "Resource not found");
  return item;
}

function matchRoute(method, pathname) {
  const key = `${method} ${pathname}`;
  if (routes[key]) return { handler: routes[key], params: {}, pattern: key };
  for (const [pattern, handler] of Object.entries(routes)) {
    const [routeMethod, routePath] = pattern.split(" ");
    if (routeMethod !== method) continue;
    const params = matchParams(routePath, pathname);
    if (params) return { handler, params, pattern };
  }
  return null;
}

function matchParams(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const part = patternParts[index];
    if (part.startsWith(":")) {
      params[part.slice(1)] = pathParts[index];
    } else if (part !== pathParts[index]) {
      return null;
    }
  }
  return params;
}

async function readJson(request) {
  if (!["POST", "PUT", "PATCH"].includes(request.method ?? "")) return {};
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "Request body too large");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}

function send(response, payload) {
  response.writeHead(payload.status, {
    ...baseHeaders(),
    "content-type": "application/json"
  });
  response.end(payload.body === null ? "" : JSON.stringify(payload.body));
}

function baseHeaders() {
  return {
    "access-control-allow-origin": ALLOWED_ORIGIN,
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer"
  };
}

async function readWebAsset(pathname) {
  const root = resolve(WEB_DIST_PATH);
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const assetPath = resolve(root, relativePath);
  if (!assetPath.startsWith(root)) return null;

  try {
    return {
      status: 200,
      body: await readFile(assetPath),
      contentType: contentTypeFor(assetPath)
    };
  } catch (error) {
    if (extname(decodedPath) || error.code === "EACCES") return null;
    try {
      return {
        status: 200,
        body: await readFile(join(root, "index.html")),
        contentType: "text/html; charset=utf-8"
      };
    } catch {
      return null;
    }
  }
}

function sendRaw(response, payload) {
  const headers = {
    ...baseHeaders(),
    "content-type": payload.contentType,
    "cache-control": payload.contentType.startsWith("text/html") ? "no-cache" : "public, max-age=31536000, immutable"
  };
  if (payload.filename) headers["content-disposition"] = `inline; filename="${String(payload.filename).replaceAll("\"", "")}"`;
  response.writeHead(payload.status, headers);
  response.end(payload.body);
}

function contentTypeFor(pathname) {
  const extension = extname(pathname);
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js") return "text/javascript; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".json" || extension === ".webmanifest") return "application/json; charset=utf-8";
  if (extension === ".png") return "image/png";
  if (extension === ".ico") return "image/x-icon";
  return "application/octet-stream";
}

function ok(body) {
  return { status: 200, body };
}

function createdResponse(body) {
  return { status: 201, body };
}

function conflict(body) {
  return { status: 409, body };
}

function unauthorized(body) {
  return { status: 401, body };
}

function notFound(body) {
  return { status: 404, body };
}

function serverError(body) {
  return { status: 500, body };
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
