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
const personnelStatuses = ["Active", "Transfer Pending", "Assigned", "Inactive"];
const officeStatuses = ["Provisioned", "Suspended", "Active"];

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

  "POST /api/events": (body) => {
    if (body.object !== undefined) requireString(body.object, "object");
    if (body.result !== undefined) requireString(body.result, "result");
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
