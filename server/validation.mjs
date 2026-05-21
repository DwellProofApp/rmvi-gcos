const stationLevels = [
  "International HQ",
  "Regional HQ",
  "National HQ",
  "County/State HQ",
  "District HQ",
  "Area HQ",
  "Local Branch"
];

const messageKinds = ["Directive", "Report", "Approval", "Notification", "Transfer"];
const statuses = ["Ready", "In Review", "Escalated", "Approved", "Queued"];
const severities = ["Medium", "High", "Critical"];
const aiKinds = ["Executive Summary", "Memo", "Report Brief"];
const documentStatuses = ["Archived", "In Review", "Queued"];
const taskPriorities = ["Low", "Medium", "High", "Critical"];
const taskStatuses = ["Queued", "In Progress", "Blocked", "Complete"];
const policyStatuses = ["Draft", "Active", "Review", "Retired"];
const calendarPriorities = ["Low", "Medium", "High", "Critical"];
const calendarStatuses = ["Scheduled", "At Risk", "Complete"];
const personnelStatuses = ["Active", "Transfer Pending", "Assigned", "Inactive", "Onboarding", "On Leave"];
const officeStatuses = ["Provisioned", "Suspended", "Active"];
const auditSeverities = ["Info", "Low", "Medium", "High", "Critical"];
const securityControlStatuses = ["Active", "Warning", "Exception", "Disabled", "Testing"];
const complianceRisks = ["Low", "Medium", "High", "Critical"];
const complianceExportFormats = ["PDF", "CSV", "JSON"];
const evidenceClassifications = ["Financial", "Security", "Governance", "Personnel", "Legal", "Archive"];

const validators = {
  "POST /api/auth/login": (body) => {
    requireEmail(body.email, "email");
    requireString(body.password, "password");
  },

  "POST /api/sessions/station/revoke": (body) => {
    if (body.email !== undefined) requireEmail(body.email, "email");
  },

  "POST /api/sessions/:id/flag": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/sessions/:id/extend": (body) => {
    if (body.minutes !== undefined) requireNumber(body.minutes, "minutes");
  },

  "POST /api/sessions/:id/lock": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/sessions/:id/unlock": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/sessions/:id/trust": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/sessions/:id/mfa": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/sessions/:id/device": (body) => {
    if (body.label !== undefined) requireString(body.label, "label");
  },

  "POST /api/sessions/:id/note": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/sessions/bulk/revoke": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/command-center/briefing/archive": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
  },

  "POST /api/command-center/directive": (body) => {
    if (body.subject !== undefined) requireString(body.subject, "subject");
    if (body.files !== undefined) requireString(body.files, "files");
  },

  "POST /api/command-center/task": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.assignee !== undefined) requireString(body.assignee, "assignee");
    if (body.priority !== undefined) requireEnum(body.priority, taskPriorities, "priority");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/command-center/escalation": (body) => {
    if (body.item !== undefined) requireString(body.item, "item");
    if (body.reason !== undefined) requireString(body.reason, "reason");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.severity !== undefined) requireEnum(body.severity, severities, "severity");
  },

  "POST /api/readiness/:name/acknowledge": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/readiness/:name/override": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/readiness/:name/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/readiness/:name/recheck": (body) => {
    if (body.recheckAt !== undefined) requireString(body.recheckAt, "recheckAt");
  },

  "POST /api/readiness/:name/remediation": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.assignee !== undefined) requireString(body.assignee, "assignee");
    if (body.priority !== undefined) requireEnum(body.priority, taskPriorities, "priority");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/readiness/:name/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/readiness/bulk/acknowledge": (body) => {
    if (body.names !== undefined) requireStringArray(body.names, "names");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/persistence/backup": (body) => {
    if (body.label !== undefined) requireString(body.label, "label");
  },

  "POST /api/persistence/backup-manifest": () => {},

  "POST /api/persistence/restore-drill": () => {},

  "POST /api/persistence/verify": () => {},

  "POST /api/persistence/migration-export": (body) => {
    if (body.label !== undefined) requireString(body.label, "label");
  },

  "POST /api/persistence/schema-export": (body) => {
    if (body.label !== undefined) requireString(body.label, "label");
  },

  "POST /api/persistence/import-dry-run": () => {},

  "POST /api/persistence/cutover-checklist": () => {},

  "POST /api/launch/readiness": () => {},

  "POST /api/launch/deployment-plan": () => {},

  "POST /api/launch/signoff": () => {},

  "POST /api/ops/monitor": () => {},

  "POST /api/files/upload": (body) => {
    requireString(body.name, "name");
    requireString(body.contentType, "contentType");
    requireString(body.contentBase64, "contentBase64");
    if (body.source !== undefined) requireString(body.source, "source");
  },

  "POST /api/documents/:id/file": (body) => {
    requireString(body.fileId, "fileId");
  },

  "POST /api/reports/:id/file": (body) => {
    requireString(body.fileId, "fileId");
  },

  "POST /api/evidence-vault/:id/file": (body) => {
    requireString(body.fileId, "fileId");
  },

  "POST /api/security-controls/:name/status": (body) => {
    if (body.status !== undefined) requireEnum(body.status, securityControlStatuses, "status");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/security-controls/:name/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/security-controls/:name/evidence": (body) => {
    if (body.evidence !== undefined) requireString(body.evidence, "evidence");
  },

  "POST /api/security-controls/:name/test": (body) => {
    if (body.result !== undefined) requireString(body.result, "result");
    if (body.status !== undefined) requireEnum(body.status, securityControlStatuses, "status");
  },

  "POST /api/security-controls/:name/rotate": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/security-controls/:name/exception": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/security-controls/:name/remediation": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.assignee !== undefined) requireString(body.assignee, "assignee");
    if (body.priority !== undefined) requireEnum(body.priority, taskPriorities, "priority");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/security-controls/:name/verify": (body) => {
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/security-controls/bulk/test": (body) => {
    if (body.names !== undefined) requireStringArray(body.names, "names");
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/compliance-reviews/:id/route": (body) => {
    if (body.reviewer !== undefined) requireString(body.reviewer, "reviewer");
  },

  "POST /api/compliance-reviews/:id/evidence": (body) => {
    if (body.evidence !== undefined) requireString(body.evidence, "evidence");
  },

  "POST /api/compliance-reviews/:id/score": (body) => {
    if (body.score !== undefined) requireNumber(body.score, "score");
    if (body.risk !== undefined) requireEnum(body.risk, complianceRisks, "risk");
  },

  "POST /api/compliance-reviews/:id/attest": (body) => {
    if (body.attestation !== undefined) requireString(body.attestation, "attestation");
  },

  "POST /api/compliance-reviews/:id/packet": (body) => {
    if (body.packetId !== undefined) requireString(body.packetId, "packetId");
  },

  "POST /api/compliance-reviews/:id/export": (body) => {
    if (body.format !== undefined) requireEnum(body.format, complianceExportFormats, "format");
  },

  "POST /api/compliance-reviews/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/compliance-reviews/:id/escalate": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
    if (body.risk !== undefined) requireEnum(body.risk, complianceRisks, "risk");
  },

  "POST /api/compliance-reviews/bulk/review": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reviewer !== undefined) requireString(body.reviewer, "reviewer");
  },

  "POST /api/evidence-vault/:id/custody": (body) => {
    if (body.custody !== undefined) requireString(body.custody, "custody");
  },

  "POST /api/evidence-vault/:id/classification": (body) => {
    if (body.classification !== undefined) requireEnum(body.classification, evidenceClassifications, "classification");
  },

  "POST /api/evidence-vault/:id/chain": (body) => {
    if (body.chainHash !== undefined) requireString(body.chainHash, "chainHash");
  },

  "POST /api/evidence-vault/:id/retention": (body) => {
    if (body.retention !== undefined) requireString(body.retention, "retention");
    if (body.reviewAt !== undefined) requireString(body.reviewAt, "reviewAt");
  },

  "POST /api/evidence-vault/:id/seal": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/evidence-vault/:id/verify": (body) => {
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/evidence-vault/:id/hold": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/evidence-vault/:id/export": (body) => {
    if (body.format !== undefined) requireEnum(body.format, complianceExportFormats, "format");
  },

  "POST /api/evidence-vault/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/evidence-vault/bulk/seal": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/stations/:id/level": (body) => {
    if (body.level !== undefined) requireEnum(body.level, stationLevels, "level");
  },

  "POST /api/stations/:id/authority": (body) => {
    if (body.authority !== undefined) requireString(body.authority, "authority");
  },

  "POST /api/stations/:id/verify": (body) => {
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/stations/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/stations/:id/suspend": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/stations/:id/activate": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/stations/:id/mirror": (body) => {
    if (body.email !== undefined) requireRmviEmail(body.email, "email");
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.authority !== undefined) requireString(body.authority, "authority");
    if (body.password !== undefined) requireString(body.password, "password");
  },

  "POST /api/stations/:id/credential/rotate": (body) => {
    if (body.password !== undefined) requireString(body.password, "password");
  },

  "POST /api/stations/:id/credential/reset": (body) => {
    if (body.password !== undefined) requireString(body.password, "password");
  },

  "POST /api/stations/:id/credential/mfa": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/stations/:id/credential/lock": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
    if (body.lockedUntil !== undefined) requireString(body.lockedUntil, "lockedUntil");
  },

  "POST /api/stations/:id/credential/unlock": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/stations/bulk/verify": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/messages": (body) => {
    requireEnum(body.kind, messageKinds, "kind");
    requireString(body.subject, "subject");
    requireString(body.from, "from");
    if (body.status !== undefined) requireEnum(body.status, statuses, "status");
    if (body.files !== undefined) requireString(body.files, "files");
  },

  "POST /api/messages/:id/classify": (body) => {
    if (body.kind !== undefined) requireEnum(body.kind, messageKinds, "kind");
  },

  "POST /api/messages/:id/status": (body) => {
    if (body.status !== undefined) requireEnum(body.status, statuses, "status");
  },

  "POST /api/messages/:id/route": (body) => {
    if (body.route !== undefined) requireString(body.route, "route");
  },

  "POST /api/messages/:id/priority": (body) => {
    if (body.priority !== undefined) requireEnum(body.priority, ["Low", "Medium", "High", "Critical"], "priority");
  },

  "POST /api/messages/:id/escalate": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/messages/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/messages/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/messages/:id/duplicate": (body) => {
    if (body.subject !== undefined) requireString(body.subject, "subject");
    if (body.from !== undefined) requireString(body.from, "from");
  },

  "POST /api/messages/bulk/approve": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/reports": (body) => {
    requireString(body.name, "name");
    requireString(body.path, "path");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.due !== undefined) requireString(body.due, "due");
    if (body.state !== undefined) requireEnum(body.state, statuses, "state");
    if (body.score !== undefined) requireNumber(body.score, "score");
    if (body.templateId !== undefined) requireString(body.templateId, "templateId");
    if (body.preparedBy !== undefined) requireString(body.preparedBy, "preparedBy");
    if (body.attestation !== undefined) requireString(body.attestation, "attestation");
    if (body.approvalLimit !== undefined) requireString(body.approvalLimit, "approvalLimit");
    if (body.templateChecklist !== undefined) requireStringArray(body.templateChecklist, "templateChecklist");
    if (body.reportFields !== undefined && (body.reportFields === null || typeof body.reportFields !== "object" || Array.isArray(body.reportFields))) throw validationError("reportFields must be an object");
  },

  "POST /api/reports/:id/score": (body) => {
    requireNumber(body.score, "score");
    if (body.state !== undefined) requireString(body.state, "state");
  },

  "POST /api/reports/:id/due": (body) => {
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/reports/:id/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/reports/:id/path": (body) => {
    if (body.path !== undefined) requireString(body.path, "path");
  },

  "POST /api/reports/:id/details": (body) => {
    if (body.preparedBy !== undefined) requireString(body.preparedBy, "preparedBy");
    if (body.attestation !== undefined) requireString(body.attestation, "attestation");
    if (body.approvalLimit !== undefined) requireString(body.approvalLimit, "approvalLimit");
    if (body.templateChecklist !== undefined) requireStringArray(body.templateChecklist, "templateChecklist");
    if (body.reportFields !== undefined && (body.reportFields === null || typeof body.reportFields !== "object" || Array.isArray(body.reportFields))) throw validationError("reportFields must be an object");
    if (body.routingStage !== undefined) requireString(body.routingStage, "routingStage");
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/reports/:id/evidence": (body) => {
    if (body.evidenceStatus !== undefined) requireString(body.evidenceStatus, "evidenceStatus");
  },

  "POST /api/reports/:id/review": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/reports/:id/verify": (body) => {
    if (body.state !== undefined) requireString(body.state, "state");
  },

  "POST /api/reports/:id/packet": (body) => {
    if (body.approvalRequest !== undefined) requireString(body.approvalRequest, "approvalRequest");
    if (body.route !== undefined) requireString(body.route, "route");
    if (body.limit !== undefined) requireString(body.limit, "limit");
    if (body.delegate !== undefined) requireString(body.delegate, "delegate");
    if (body.reason !== undefined) requireString(body.reason, "reason");
    if (body.note !== undefined) requireString(body.note, "note");
    if (body.escalate !== undefined && typeof body.escalate !== "boolean") throw validationError("escalate must be boolean");
  },

  "POST /api/reports/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/reports/:id/duplicate": (body) => {
    if (body.name !== undefined) requireString(body.name, "name");
    if (body.path !== undefined) requireString(body.path, "path");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/reports/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/reports/bulk/submit": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/reports/bulk/correction": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/approvals": (body) => {
    requireString(body.request, "request");
    requireString(body.route, "route");
    if (body.limit !== undefined) requireString(body.limit, "limit");
    if (body.state !== undefined) requireString(body.state, "state");
    if (body.signatures !== undefined) requireString(body.signatures, "signatures");
  },

  "POST /api/approvals/:id/sign": (body) => {
    if (body.state !== undefined) requireString(body.state, "state");
    if (body.signatures !== undefined) requireString(body.signatures, "signatures");
  },

  "POST /api/approvals/:id/route": (body) => {
    if (body.route !== undefined) requireString(body.route, "route");
    if (body.state !== undefined) requireString(body.state, "state");
  },

  "POST /api/approvals/:id/limit": (body) => {
    if (body.limit !== undefined) requireString(body.limit, "limit");
  },

  "POST /api/approvals/:id/delegate": (body) => {
    if (body.delegate !== undefined) requireString(body.delegate, "delegate");
  },

  "POST /api/approvals/:id/hold": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/approvals/:id/release": (body) => {
    if (body.state !== undefined) requireString(body.state, "state");
  },

  "POST /api/approvals/:id/execute": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
  },

  "POST /api/approvals/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/approvals/:id/duplicate": (body) => {
    if (body.request !== undefined) requireString(body.request, "request");
    if (body.route !== undefined) requireString(body.route, "route");
    if (body.limit !== undefined) requireString(body.limit, "limit");
  },

  "POST /api/approvals/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/approvals/bulk/sign": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.signatures !== undefined) requireString(body.signatures, "signatures");
  },

  "POST /api/approvals/bulk/approve": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/approvals/bulk/reject": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/tasks": (body) => {
    requireString(body.title, "title");
    requireString(body.assignee, "assignee");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.priority !== undefined) requireEnum(body.priority, taskPriorities, "priority");
    if (body.due !== undefined) requireString(body.due, "due");
    if (body.status !== undefined) requireEnum(body.status, taskStatuses, "status");
  },

  "POST /api/tasks/:id/advance": (body) => {
    if (body.status !== undefined) requireEnum(body.status, taskStatuses, "status");
  },

  "POST /api/tasks/:id/assignee": (body) => {
    if (body.assignee !== undefined) requireString(body.assignee, "assignee");
  },

  "POST /api/tasks/:id/priority": (body) => {
    if (body.priority !== undefined) requireEnum(body.priority, taskPriorities, "priority");
  },

  "POST /api/tasks/:id/due": (body) => {
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/tasks/:id/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/tasks/:id/block": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/tasks/:id/unblock": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/tasks/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/tasks/:id/dependency": (body) => {
    if (body.dependency !== undefined) requireString(body.dependency, "dependency");
  },

  "POST /api/tasks/:id/approval": (body) => {
    if (body.route !== undefined) requireString(body.route, "route");
  },

  "POST /api/tasks/:id/sla": (body) => {
    if (body.sla !== undefined) requireString(body.sla, "sla");
    if (body.status !== undefined) requireString(body.status, "status");
  },

  "POST /api/tasks/:id/evidence": (body) => {
    if (body.evidence !== undefined) requireString(body.evidence, "evidence");
  },

  "POST /api/tasks/:id/handoff": (body) => {
    if (body.to !== undefined) requireString(body.to, "to");
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/tasks/:id/escalate": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
    if (body.priority !== undefined) requireEnum(body.priority, taskPriorities, "priority");
  },

  "POST /api/tasks/:id/comment": (body) => {
    if (body.comment !== undefined) requireString(body.comment, "comment");
  },

  "POST /api/tasks/:id/checkpoint": (body) => {
    if (body.checkpoint !== undefined) requireString(body.checkpoint, "checkpoint");
  },

  "POST /api/tasks/:id/schedule": (body) => {
    if (body.scheduledFor !== undefined) requireString(body.scheduledFor, "scheduledFor");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/tasks/:id/dispatch": (body) => {
    if (body.team !== undefined) requireString(body.team, "team");
    if (body.location !== undefined) requireString(body.location, "location");
  },

  "POST /api/tasks/:id/time": (body) => {
    if (body.hours !== undefined) requireNumber(body.hours, "hours");
  },

  "POST /api/tasks/:id/qa": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
    if (body.reviewer !== undefined) requireString(body.reviewer, "reviewer");
  },

  "POST /api/tasks/:id/risk": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/tasks/:id/template": (body) => {
    if (body.templateName !== undefined) requireString(body.templateName, "templateName");
  },

  "POST /api/tasks/:id/report": (body) => {
    if (body.reportId !== undefined) requireString(body.reportId, "reportId");
  },

  "POST /api/tasks/:id/approval-link": (body) => {
    if (body.approvalId !== undefined) requireString(body.approvalId, "approvalId");
  },

  "POST /api/tasks/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/tasks/:id/duplicate": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.assignee !== undefined) requireString(body.assignee, "assignee");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/tasks/bulk/complete": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/tasks/bulk/escalate": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/tasks/bulk/schedule": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.scheduledFor !== undefined) requireString(body.scheduledFor, "scheduledFor");
  },

  "POST /api/policies": (body) => {
    requireString(body.title, "title");
    requireString(body.category, "category");
    requireString(body.summary, "summary");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.status !== undefined) requireEnum(body.status, policyStatuses, "status");
    if (body.acknowledgements !== undefined) requireNumber(body.acknowledgements, "acknowledgements");
  },

  "POST /api/policies/:id/status": (body) => {
    if (body.status !== undefined) requireEnum(body.status, policyStatuses, "status");
  },

  "POST /api/policies/:id/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/policies/:id/category": (body) => {
    if (body.category !== undefined) requireString(body.category, "category");
  },

  "POST /api/policies/:id/summary": (body) => {
    if (body.summary !== undefined) requireString(body.summary, "summary");
  },

  "POST /api/policies/:id/version": (body) => {
    if (body.version !== undefined) requireString(body.version, "version");
    if (body.status !== undefined) requireEnum(body.status, policyStatuses, "status");
  },

  "POST /api/policies/:id/review": (body) => {
    if (body.reviewBy !== undefined) requireString(body.reviewBy, "reviewBy");
  },

  "POST /api/policies/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/policies/:id/compliance": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
    if (body.score !== undefined) requireNumber(body.score, "score");
  },

  "POST /api/policies/:id/evidence": (body) => {
    if (body.evidence !== undefined) requireString(body.evidence, "evidence");
  },

  "POST /api/policies/:id/distribute": (body) => {
    if (body.audience !== undefined) requireString(body.audience, "audience");
  },

  "POST /api/policies/:id/exception": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
    if (body.expires !== undefined) requireString(body.expires, "expires");
  },

  "POST /api/policies/:id/training": (body) => {
    if (body.audience !== undefined) requireString(body.audience, "audience");
  },

  "POST /api/policies/:id/hold": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/policies/:id/task": (body) => {
    if (body.taskId !== undefined) requireString(body.taskId, "taskId");
  },

  "POST /api/policies/:id/approval-link": (body) => {
    if (body.approvalId !== undefined) requireString(body.approvalId, "approvalId");
  },

  "POST /api/policies/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/policies/:id/duplicate": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
  },

  "POST /api/policies/bulk/activate": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/policies/bulk/review": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reviewBy !== undefined) requireString(body.reviewBy, "reviewBy");
  },

  "POST /api/calendar-events": (body) => {
    requireString(body.title, "title");
    requireString(body.category, "category");
    requireString(body.date, "date");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.priority !== undefined) requireEnum(body.priority, calendarPriorities, "priority");
    if (body.status !== undefined) requireEnum(body.status, calendarStatuses, "status");
  },

  "POST /api/calendar-events/:id/priority": (body) => {
    if (body.priority !== undefined) requireEnum(body.priority, calendarPriorities, "priority");
  },

  "POST /api/calendar-events/:id/date": (body) => {
    if (body.date !== undefined) requireString(body.date, "date");
  },

  "POST /api/calendar-events/:id/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/calendar-events/:id/category": (body) => {
    if (body.category !== undefined) requireString(body.category, "category");
  },

  "POST /api/calendar-events/:id/reschedule": (body) => {
    if (body.date !== undefined) requireString(body.date, "date");
  },

  "POST /api/calendar-events/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/calendar-events/:id/check-in": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
    if (body.by !== undefined) requireString(body.by, "by");
  },

  "POST /api/calendar-events/:id/venue": (body) => {
    if (body.venue !== undefined) requireString(body.venue, "venue");
  },

  "POST /api/calendar-events/:id/agenda": (body) => {
    if (body.agenda !== undefined) requireString(body.agenda, "agenda");
  },

  "POST /api/calendar-events/:id/attendance": (body) => {
    if (body.count !== undefined) requireNumber(body.count, "count");
  },

  "POST /api/calendar-events/:id/reminder": (body) => {
    if (body.audience !== undefined) requireString(body.audience, "audience");
  },

  "POST /api/calendar-events/:id/readiness": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
  },

  "POST /api/calendar-events/:id/task": (body) => {
    if (body.taskId !== undefined) requireString(body.taskId, "taskId");
  },

  "POST /api/calendar-events/:id/report": (body) => {
    if (body.reportId !== undefined) requireString(body.reportId, "reportId");
  },

  "POST /api/calendar-events/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/calendar-events/:id/duplicate": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.date !== undefined) requireString(body.date, "date");
  },

  "POST /api/calendar-events/bulk/complete": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/calendar-events/bulk/reschedule": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.date !== undefined) requireString(body.date, "date");
  },

  "POST /api/live-sessions": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.host !== undefined) requireString(body.host, "host");
    if (body.sessionType !== undefined) requireString(body.sessionType, "sessionType");
    if (body.status !== undefined) requireString(body.status, "status");
    if (body.linkedRecord !== undefined) requireString(body.linkedRecord, "linkedRecord");
    if (body.route !== undefined) requireString(body.route, "route");
    if (body.purpose !== undefined) requireString(body.purpose, "purpose");
    if (body.participants !== undefined) requireStringArray(body.participants, "participants");
  },

  "POST /api/live-sessions/:id/status": (body) => {
    requireString(body.status, "status");
  },

  "POST /api/live-sessions/:id/file": (body) => {
    if (body.file !== undefined) requireString(body.file, "file");
    if (body.fileName !== undefined) requireString(body.fileName, "fileName");
  },

  "POST /api/live-sessions/:id/note": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/live-sessions/:id/invite": (body) => {
    if (body.participant !== undefined) requireString(body.participant, "participant");
    if (body.email !== undefined) requireEmail(body.email, "email");
  },

  "POST /api/live-sessions/:id/check-in": (body) => {
    if (body.participant !== undefined) requireString(body.participant, "participant");
    if (body.email !== undefined) requireEmail(body.email, "email");
  },

  "POST /api/live-sessions/:id/chat": (body) => {
    requireString(body.message, "message");
  },

  "POST /api/live-sessions/:id/decision": (body) => {
    requireString(body.decision, "decision");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/live-sessions/:id/summary-message": (body) => {
    if (body.subject !== undefined) requireString(body.subject, "subject");
    if (body.route !== undefined) requireString(body.route, "route");
  },

  "POST /api/live-sessions/:id/follow-up-task": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.assignee !== undefined) requireString(body.assignee, "assignee");
    if (body.priority !== undefined) requireEnum(body.priority, taskPriorities, "priority");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/live-sessions/:id/calendar-event": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.date !== undefined) requireString(body.date, "date");
    if (body.priority !== undefined) requireEnum(body.priority, calendarPriorities, "priority");
    if (body.agenda !== undefined) requireString(body.agenda, "agenda");
  },

  "POST /api/live-sessions/:id/packet": (body) => {
    if (body.name !== undefined) requireString(body.name, "name");
  },

  "POST /api/live-sessions/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/personnel": (body) => {
    requireString(body.name, "name");
    requireString(body.role, "role");
    requireString(body.currentStation, "currentStation");
    requireString(body.assignedStation, "assignedStation");
    if (body.status !== undefined) requireEnum(body.status, personnelStatuses, "status");
  },

  "POST /api/personnel/:id/assignment": (body) => {
    if (body.currentStation !== undefined) requireString(body.currentStation, "currentStation");
    if (body.assignedStation !== undefined) requireString(body.assignedStation, "assignedStation");
    if (body.status !== undefined) requireEnum(body.status, personnelStatuses, "status");
  },

  "POST /api/personnel/:id/role": (body) => {
    if (body.role !== undefined) requireString(body.role, "role");
  },

  "POST /api/personnel/:id/status": (body) => {
    if (body.status !== undefined) requireEnum(body.status, personnelStatuses, "status");
  },

  "POST /api/personnel/:id/deactivate": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/personnel/:id/onboard": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/personnel/:id/credentials/reset": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/personnel/:id/leave": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/personnel/:id/clearance": (body) => {
    if (body.clearance !== undefined) requireString(body.clearance, "clearance");
  },

  "POST /api/personnel/:id/credentials/verify": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
  },

  "POST /api/personnel/:id/training": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
    if (body.track !== undefined) requireString(body.track, "track");
  },

  "POST /api/personnel/:id/access": (body) => {
    if (body.station !== undefined) requireString(body.station, "station");
    if (body.status !== undefined) requireString(body.status, "status");
  },

  "POST /api/personnel/:id/incident": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
    if (body.severity !== undefined) requireString(body.severity, "severity");
  },

  "POST /api/personnel/:id/task": (body) => {
    if (body.taskId !== undefined) requireString(body.taskId, "taskId");
  },

  "POST /api/personnel/:id/review": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/personnel/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/personnel/bulk/credential-review": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.status !== undefined) requireString(body.status, "status");
  },

  "POST /api/escalations": (body) => {
    requireString(body.source, "source");
    requireString(body.item, "item");
    requireString(body.reason, "reason");
    if (body.severity !== undefined) requireEnum(body.severity, severities, "severity");
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/escalations/:id/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/escalations/:id/severity": (body) => {
    if (body.severity !== undefined) requireEnum(body.severity, severities, "severity");
  },

  "POST /api/escalations/:id/triage": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.severity !== undefined) requireEnum(body.severity, severities, "severity");
  },

  "POST /api/escalations/:id/sla": (body) => {
    if (body.sla !== undefined) requireString(body.sla, "sla");
  },

  "POST /api/escalations/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/escalations/:id/merge": (body) => {
    if (body.target !== undefined) requireString(body.target, "target");
  },

  "POST /api/escalations/:id/evidence": (body) => {
    if (body.evidence !== undefined) requireString(body.evidence, "evidence");
  },

  "POST /api/escalations/:id/comment": (body) => {
    if (body.comment !== undefined) requireString(body.comment, "comment");
  },

  "POST /api/escalations/:id/resolution-note": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/escalations/:id/due": (body) => {
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/escalations/:id/task": (body) => {
    if (body.taskId !== undefined) requireString(body.taskId, "taskId");
  },

  "POST /api/escalations/:id/report": (body) => {
    if (body.reportId !== undefined) requireString(body.reportId, "reportId");
  },

  "POST /api/escalations/:id/approval-link": (body) => {
    if (body.approvalId !== undefined) requireString(body.approvalId, "approvalId");
  },

  "POST /api/escalations/:id/impact": (body) => {
    if (body.score !== undefined) requireNumber(body.score, "score");
    if (body.summary !== undefined) requireString(body.summary, "summary");
  },

  "POST /api/escalations/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/escalations/bulk/resolve": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/offices": (body) => {
    requireString(body.name, "name");
    requireRmviEmail(body.email, "email");
    requireEnum(body.level, stationLevels, "level");
    requireString(body.department, "department");
    requireString(body.supervisor, "supervisor");
  },

  "POST /api/offices/:id/status": (body) => {
    if (body.status !== undefined) requireEnum(body.status, officeStatuses, "status");
  },

  "POST /api/offices/:id/supervisor": (body) => {
    if (body.supervisor !== undefined) requireString(body.supervisor, "supervisor");
  },

  "POST /api/offices/:id/suspend": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/offices/:id/password/rotate": (body) => {
    if (body.password !== undefined) requireString(body.password, "password");
  },

  "POST /api/offices/:id/department": (body) => {
    if (body.department !== undefined) requireString(body.department, "department");
  },

  "POST /api/offices/:id/level": (body) => {
    if (body.level !== undefined) requireEnum(body.level, stationLevels, "level");
  },

  "POST /api/offices/:id/email/verify": () => {},

  "POST /api/offices/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/offices/:id/note": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/offices/:id/capacity": (body) => {
    if (body.capacity !== undefined) requireNumber(body.capacity, "capacity");
  },

  "POST /api/offices/:id/compliance": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
  },

  "POST /api/offices/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/offices/bulk/activate": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/documents": (body) => {
    requireString(body.name, "name");
    requireString(body.classification, "classification");
    requireString(body.source, "source");
    requireString(body.fileType, "fileType");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.status !== undefined) requireEnum(body.status, documentStatuses, "status");
  },

  "POST /api/documents/:id/classification": (body) => {
    if (body.classification !== undefined) requireString(body.classification, "classification");
  },

  "POST /api/documents/:id/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/documents/:id/review": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/documents/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/documents/:id/seal": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/documents/:id/hold": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/documents/:id/retention": (body) => {
    if (body.retainedUntil !== undefined) requireString(body.retainedUntil, "retainedUntil");
  },

  "POST /api/documents/:id/duplicate": (body) => {
    if (body.name !== undefined) requireString(body.name, "name");
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/documents/:id/verify": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/documents/:id/custody": (body) => {
    if (body.custodian !== undefined) requireString(body.custodian, "custodian");
  },

  "POST /api/documents/:id/chain": (body) => {
    if (body.chainHash !== undefined) requireString(body.chainHash, "chainHash");
  },

  "POST /api/documents/:id/extract": (body) => {
    if (body.text !== undefined) requireString(body.text, "text");
  },

  "POST /api/documents/:id/link-report": (body) => {
    if (body.reportId !== undefined) requireString(body.reportId, "reportId");
  },

  "POST /api/documents/:id/link-approval": (body) => {
    if (body.approvalId !== undefined) requireString(body.approvalId, "approvalId");
  },

  "POST /api/documents/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/documents/:id/export": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/documents/bulk/seal": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
  },

  "POST /api/audit/note": (body) => {
    if (body.object !== undefined) requireString(body.object, "object");
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/audit/:id/flag": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/audit/:id/seal": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/audit/:id/verify": (body) => {
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/audit/:id/severity": (body) => {
    if (body.severity !== undefined) requireEnum(body.severity, auditSeverities, "severity");
  },

  "POST /api/audit/:id/category": (body) => {
    if (body.category !== undefined) requireString(body.category, "category");
  },

  "POST /api/audit/:id/reviewer": (body) => {
    if (body.reviewer !== undefined) requireString(body.reviewer, "reviewer");
  },

  "POST /api/audit/:id/comment": (body) => {
    if (body.comment !== undefined) requireString(body.comment, "comment");
  },

  "POST /api/audit/:id/investigate": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/audit/:id/close": (body) => {
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/audit/:id/hold": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/audit/:id/release-hold": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/audit/bulk/flag": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/audit/bulk/seal": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/audit/bulk/verify": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/events": (body) => {
    if (body.object !== undefined) requireString(body.object, "object");
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/events/:id/acknowledge": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/events/:id/pin": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/events/:id/severity": (body) => {
    if (body.severity !== undefined) requireEnum(body.severity, auditSeverities, "severity");
  },

  "POST /api/events/:id/route": (body) => {
    if (body.route !== undefined) requireString(body.route, "route");
  },

  "POST /api/events/:id/replay": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/events/:id/mute": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/events/:id/owner": (body) => {
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/events/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/events/bulk/archive": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/events/clear": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/export/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/transfers": (body) => {
    requireString(body.person, "person");
    requireString(body.from, "from");
    requireString(body.to, "to");
    if (body.step !== undefined) requireString(body.step, "step");
    if (body.risk !== undefined) requireString(body.risk, "risk");
  },

  "POST /api/transfers/:id/acknowledge": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/transfers/:id/risk": (body) => {
    if (body.risk !== undefined) requireString(body.risk, "risk");
  },

  "POST /api/transfers/:id/prepare": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/transfers/:id/revoke-access": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/transfers/:id/verify": (body) => {
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/transfers/:id/letter": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
    if (body.reference !== undefined) requireString(body.reference, "reference");
  },

  "POST /api/transfers/:id/schedule": (body) => {
    if (body.scheduledFor !== undefined) requireString(body.scheduledFor, "scheduledFor");
  },

  "POST /api/transfers/:id/note": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/transfers/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/transfers/:id/personnel-link": (body) => {
    if (body.personnelId !== undefined) requireString(body.personnelId, "personnelId");
  },

  "POST /api/transfers/:id/task": (body) => {
    if (body.taskId !== undefined) requireString(body.taskId, "taskId");
  },

  "POST /api/transfers/:id/report": (body) => {
    if (body.reportId !== undefined) requireString(body.reportId, "reportId");
  },

  "POST /api/transfers/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/transfers/bulk/verify": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.result !== undefined) requireString(body.result, "result");
  },

  "POST /api/ai-drafts": (body) => {
    if (body.kind !== undefined) requireEnum(body.kind, aiKinds, "kind");
    if (body.focus !== undefined) requireString(body.focus, "focus");
  },

  "POST /api/ai-drafts/:id/archive": (body) => {
    if (body.reason !== undefined) requireString(body.reason, "reason");
  },

  "POST /api/ai-drafts/:id/refresh": (body) => {
    if (body.focus !== undefined) requireString(body.focus, "focus");
  },

  "POST /api/ai-drafts/:id/status": (body) => {
    if (body.status !== undefined) requireString(body.status, "status");
  },

  "POST /api/ai-drafts/:id/sources": (body) => {
    if (body.sourceNote !== undefined) requireString(body.sourceNote, "sourceNote");
    if (body.sourceCount !== undefined) requireNumber(body.sourceCount, "sourceCount");
  },

  "POST /api/ai-drafts/:id/confidence": (body) => {
    if (body.confidence !== undefined) requireNumber(body.confidence, "confidence");
  },

  "POST /api/ai-drafts/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/ai-drafts/:id/duplicate": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
  },

  "POST /api/ai-drafts/bulk/refresh": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
    if (body.focus !== undefined) requireString(body.focus, "focus");
  },

  "POST /api/offline-sync": (body) => {
    if (!Array.isArray(body.actions)) throw new ValidationError("actions must be an array");
    body.actions.forEach((action, index) => {
      if (action.event !== undefined) requireString(action.event, `actions[${index}].event`);
      if (action.object !== undefined) requireString(action.object, `actions[${index}].object`);
      if (action.result !== undefined) requireString(action.result, `actions[${index}].result`);
    });
  }
};

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

export function validateRequest(pattern, body) {
  const validator = validators[pattern];
  if (!validator) return;
  validator(body ?? {});
}

function requireString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }
}

function requireEmail(value, field) {
  requireString(value, field);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new ValidationError(`${field} must be a valid email address`);
  }
}

function requireRmviEmail(value, field) {
  requireEmail(value, field);
  if (!String(value).toLowerCase().endsWith("@rmvi.org")) {
    throw new ValidationError(`${field} must use the rmvi.org domain`);
  }
}

function requireEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}`);
  }
}

function requireNumber(value, field) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`${field} must be a number`);
  }
}

function requireStringArray(value, field) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new ValidationError(`${field} must be an array of strings`);
  }
}
