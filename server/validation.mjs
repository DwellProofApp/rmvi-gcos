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
    if (body.email !== undefined) requireEmail(body.email, "email");
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.authority !== undefined) requireString(body.authority, "authority");
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

  "POST /api/reports/:id/evidence": (body) => {
    if (body.evidenceStatus !== undefined) requireString(body.evidenceStatus, "evidenceStatus");
  },

  "POST /api/reports/:id/review": (body) => {
    if (body.note !== undefined) requireString(body.note, "note");
  },

  "POST /api/reports/:id/verify": (body) => {
    if (body.state !== undefined) requireString(body.state, "state");
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

  "POST /api/tasks/:id/watch": (body) => {
    if (body.watcher !== undefined) requireString(body.watcher, "watcher");
  },

  "POST /api/tasks/:id/duplicate": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.assignee !== undefined) requireString(body.assignee, "assignee");
    if (body.due !== undefined) requireString(body.due, "due");
  },

  "POST /api/tasks/bulk/complete": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
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

  "POST /api/policies/:id/duplicate": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
  },

  "POST /api/policies/bulk/activate": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
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

  "POST /api/calendar-events/:id/duplicate": (body) => {
    if (body.title !== undefined) requireString(body.title, "title");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.date !== undefined) requireString(body.date, "date");
  },

  "POST /api/calendar-events/bulk/complete": (body) => {
    if (body.ids !== undefined) requireStringArray(body.ids, "ids");
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

  "POST /api/offices": (body) => {
    requireString(body.name, "name");
    requireEmail(body.email, "email");
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
