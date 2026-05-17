import { randomUUID } from "node:crypto";

export const stationPasswords = {
  "international@gcos.org": "gcos-global",
  "np@rmi.org": "gcos-national",
  "district_admin@rmi.org": "gcos-district",
  "local_branch_017@gcos.org": "gcos-local"
};

export function createSeedState() {
  const riverbendOffice = office("Riverbend Area Office", "riverbend_area@gcos.org", "Area HQ", "Area Coordination", "Buchanan District");
  return {
    stations: [
      station("international@gcos.org", "International Executive Workstation", "International HQ", "Global override, policy registry, audit control"),
      station("np@rmi.org", "National Presidency Workstation", "National HQ", "National directives, county oversight, executive summaries"),
      station("district_admin@rmi.org", "District Command Workstation", "District HQ", "Branch oversight, workflow monitor, transfer approvals"),
      station("local_branch_017@gcos.org", "Local Branch Workstation", "Local Branch", "Local reports, member registry, directive acknowledgement"),
      station(riverbendOffice.email, `${riverbendOffice.name} Workstation`, riverbendOffice.level, `${riverbendOffice.department}, supervised by ${riverbendOffice.supervisor}`)
    ],
    messages: [
      message("Directive", "Q2 governance reporting directive", "Regional HQ - West Africa", "Ready", "Policy memo"),
      message("Report", "District construction progress packet", "Buchanan District Office", "In Review", "PDF, photos"),
      message("Approval", "Finance release request: mission transport", "County Finance", "Escalated", "Form, signatures"),
      message("Transfer", "Official reassignment letter", "Mission Office", "Queued", "Signed letter")
    ],
    reports: [
      report("National mission activity report", "National Programs", "Local -> Area -> District -> County -> National", "Today", "In Review", 86),
      report("County finance summary", "County Finance", "County -> National", "Tomorrow", "Ready", 94),
      report("Construction milestone report", "District Works", "District -> County", "Overdue", "Escalated", 58)
    ],
    approvals: [
      approval("County youth program budget", "District -> County -> National", "$24,800", "Validation", "0/3"),
      approval("Area vehicle repair release", "Area -> District Finance", "$3,400", "Signature", "1/2"),
      approval("Regional conference logistics", "National -> Regional -> International", "$62,000", "Escalated", "2/5")
    ],
    tasks: [
      task("Review county finance packet", "County Finance", "National Secretariat", "High", "Today", "In Progress"),
      task("Confirm district construction photos", "District Works", "Buchanan District Office", "Critical", "Overdue", "Blocked"),
      task("Prepare regional mission briefing", "National Programs", "National Presidency", "Medium", "Tomorrow", "Queued")
    ],
    policies: [
      policy("Financial approval delegation policy", "Finance", "National HQ", "Active", "All finance requests above $5,000 require delegated authority validation."),
      policy("Transfer session invalidation rule", "Transfers", "International HQ", "Active", "Previous station sessions must be revoked before new station access is activated."),
      policy("Report evidence retention standard", "Archive", "Regional HQ", "Review", "Report evidence packets remain permanently available in the object vault.")
    ],
    calendarEvents: [
      calendarEvent("National audit packet deadline", "Audit", "National Secretariat", "2026-05-18", "High", "Scheduled"),
      calendarEvent("Regional mission briefing", "Meeting", "Regional HQ - West Africa", "2026-05-20", "Medium", "Scheduled"),
      calendarEvent("Construction evidence review", "Review", "District Works", "2026-05-17", "Critical", "At Risk")
    ],
    personnel: [
      person("Rev. Daniel Moore", "District Coordinator", "Buchanan District", "Riverbend Area Office", "Transfer Pending"),
      person("Sis. Amelia Hart", "Education Desk Officer", "Local Branch 017", "County Education Desk", "Active"),
      person("Bro. Nathan Cole", "Media Director", "National Media", "Regional Communications", "Active")
    ],
    escalations: [
      escalation("Report", "Construction milestone report", "Overdue packet with incomplete supporting photos", "Critical", "District Works"),
      escalation("Approval", "Regional conference logistics", "Authority limit requires executive review", "High", "Regional Secretariat")
    ],
    transfers: [
      transfer("Rev. Daniel Moore", "Buchanan District", "Riverbend Area Office", "Recipient acknowledgement", "Session switch pending"),
      transfer("Sis. Amelia Hart", "Local Branch 017", "County Education Desk", "Permissions migration", "Role graph update ready")
    ],
    offices: [riverbendOffice],
    documents: [
      documentRecord("Q2 governance directive.pdf", "Policy memo", "ChurchMail", "Regional HQ - West Africa", "PDF", "Archived"),
      documentRecord("Construction progress photos.zip", "Report evidence", "Report", "Buchanan District Office", "Images", "In Review"),
      documentRecord("Official reassignment letter.pdf", "Transfer letter", "Transfer", "Mission Office", "PDF", "Archived")
    ],
    aiDrafts: [],
    audit: [
      audit("System", "Boot", "GCOS API", "Seeded in-memory governance state")
    ],
    events: [
      "ApiStarted: GCOS backend",
      "OfficeCreated: Riverbend Area Office",
      "EscalationTriggered: Construction milestone report"
    ],
    offlineQueue: []
  };
}

export function station(email, title, level, authority) {
  return { id: randomUUID(), email, title, level, authority };
}

export function message(kind, subject, from, status, files) {
  return { id: randomUUID(), kind, subject, from, age: "now", status, files };
}

export function report(name, owner, path, due, state, score) {
  return { id: randomUUID(), name, owner, path, due, state, score };
}

export function approval(request, route, limit, state, signatures) {
  return { id: randomUUID(), request, route, limit, state, signatures };
}

export function task(title, owner, assignee, priority, due, status = "Queued") {
  return { id: randomUUID(), title, owner, assignee, priority, due, status };
}

export function policy(title, category, owner, status, summary, acknowledgements = 0) {
  return { id: randomUUID(), title, category, owner, status, summary, acknowledgements };
}

export function calendarEvent(title, category, owner, date, priority, status = "Scheduled") {
  return { id: randomUUID(), title, category, owner, date, priority, status };
}

export function person(name, role, currentStation, assignedStation, status = "Active") {
  return { id: randomUUID(), name, role, currentStation, assignedStation, status };
}

export function escalation(source, item, reason, severity, owner) {
  return { id: randomUUID(), source, item, reason, severity, status: "Open", owner };
}

export function transfer(person, from, to, step, risk) {
  return { id: randomUUID(), person, from, to, step, risk };
}

export function office(name, email, level, department, supervisor) {
  return {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    level,
    department,
    supervisor,
    password: `gcos-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    status: "Provisioned"
  };
}

export function documentRecord(name, classification, source, owner, fileType, status = "Archived") {
  return {
    id: randomUUID(),
    name,
    classification,
    source,
    owner,
    fileType,
    status,
    storageKey: `gcos-object-vault/${randomUUID()}/${name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)/g, "")}`,
    retainedUntil: "Permanent",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
}

export function audit(actor, event, object, result) {
  return {
    id: randomUUID(),
    event,
    actor: actor ?? "System",
    object,
    result,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
}

export function aiDraft(kind, title, body, sourceCount) {
  return {
    id: randomUUID(),
    kind,
    title,
    body,
    sourceCount,
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
}

export function getPermissions(station) {
  const level = station.level;
  return {
    canCreateOffices: ["International HQ", "Regional HQ", "National HQ"].includes(level),
    canApprove: ["International HQ", "Regional HQ", "National HQ", "County/State HQ", "District HQ"].includes(level),
    canExecuteTransfers: ["International HQ", "Regional HQ", "National HQ", "District HQ"].includes(level),
    canOverride: ["International HQ", "Regional HQ"].includes(level)
  };
}
