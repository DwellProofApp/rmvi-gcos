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

const validators = {
  "POST /api/auth/login": (body) => {
    requireEmail(body.email, "email");
    requireString(body.password, "password");
  },

  "POST /api/messages": (body) => {
    requireEnum(body.kind, messageKinds, "kind");
    requireString(body.subject, "subject");
    requireString(body.from, "from");
    if (body.status !== undefined) requireEnum(body.status, statuses, "status");
    if (body.files !== undefined) requireString(body.files, "files");
  },

  "POST /api/reports": (body) => {
    requireString(body.name, "name");
    requireString(body.path, "path");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.due !== undefined) requireString(body.due, "due");
    if (body.state !== undefined) requireEnum(body.state, statuses, "state");
    if (body.score !== undefined) requireNumber(body.score, "score");
  },

  "POST /api/approvals": (body) => {
    requireString(body.request, "request");
    requireString(body.route, "route");
    if (body.limit !== undefined) requireString(body.limit, "limit");
    if (body.state !== undefined) requireString(body.state, "state");
    if (body.signatures !== undefined) requireString(body.signatures, "signatures");
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

  "POST /api/policies": (body) => {
    requireString(body.title, "title");
    requireString(body.category, "category");
    requireString(body.summary, "summary");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.status !== undefined) requireEnum(body.status, policyStatuses, "status");
    if (body.acknowledgements !== undefined) requireNumber(body.acknowledgements, "acknowledgements");
  },

  "POST /api/calendar-events": (body) => {
    requireString(body.title, "title");
    requireString(body.category, "category");
    requireString(body.date, "date");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.priority !== undefined) requireEnum(body.priority, calendarPriorities, "priority");
    if (body.status !== undefined) requireEnum(body.status, calendarStatuses, "status");
  },

  "POST /api/personnel": (body) => {
    requireString(body.name, "name");
    requireString(body.role, "role");
    requireString(body.currentStation, "currentStation");
    requireString(body.assignedStation, "assignedStation");
    if (body.status !== undefined) requireEnum(body.status, personnelStatuses, "status");
  },

  "POST /api/personnel/:id/status": (body) => {
    if (body.status !== undefined) requireEnum(body.status, personnelStatuses, "status");
  },

  "POST /api/escalations": (body) => {
    requireString(body.source, "source");
    requireString(body.item, "item");
    requireString(body.reason, "reason");
    if (body.severity !== undefined) requireEnum(body.severity, severities, "severity");
    if (body.owner !== undefined) requireString(body.owner, "owner");
  },

  "POST /api/offices": (body) => {
    requireString(body.name, "name");
    requireEmail(body.email, "email");
    requireEnum(body.level, stationLevels, "level");
    requireString(body.department, "department");
    requireString(body.supervisor, "supervisor");
  },

  "POST /api/documents": (body) => {
    requireString(body.name, "name");
    requireString(body.classification, "classification");
    requireString(body.source, "source");
    requireString(body.fileType, "fileType");
    if (body.owner !== undefined) requireString(body.owner, "owner");
    if (body.status !== undefined) requireEnum(body.status, documentStatuses, "status");
  },

  "POST /api/transfers": (body) => {
    requireString(body.person, "person");
    requireString(body.from, "from");
    requireString(body.to, "to");
    if (body.step !== undefined) requireString(body.step, "step");
    if (body.risk !== undefined) requireString(body.risk, "risk");
  },

  "POST /api/ai-drafts": (body) => {
    if (body.kind !== undefined) requireEnum(body.kind, aiKinds, "kind");
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
