import { randomUUID } from "node:crypto";

const DEMO_PASSWORD_PREFIX = process.env.GCOS_DEMO_PASSWORD_PREFIX ?? "gcos";

export function demoStationPassword(label) {
  return [DEMO_PASSWORD_PREFIX, label].join("-");
}

export const stationPasswords = {
  "admin@rmvi.org": demoStationPassword("admin"),
  "international@rmvi.org": demoStationPassword("global"),
  "np@rmvi.org": demoStationPassword("national"),
  "district_admin@rmvi.org": demoStationPassword("district"),
  "local_branch_017@rmvi.org": demoStationPassword("local"),
  "finance@rmvi.org": demoStationPassword("finance"),
  "audit@rmvi.org": demoStationPassword("audit"),
  "mission@rmvi.org": demoStationPassword("mission")
};

export function normalizeStationEmail(email) {
  return String(email ?? "").toLowerCase().replace("@rmi.org", "@rmvi.org");
}

export function createSeedState() {
  const riverbendOffice = office("Riverbend Area Office", "riverbend_area@rmvi.org", "Area HQ", "Area Coordination", "Buchanan District");
  const riverbendStation = station(riverbendOffice.email, `${riverbendOffice.name} Workstation`, riverbendOffice.level, `${riverbendOffice.department}, supervised by ${riverbendOffice.supervisor}`);
  Object.assign(riverbendStation, {
    nodeKind: riverbendOffice.nodeKind,
    parentId: riverbendOffice.parentId,
    parentName: riverbendOffice.parentName,
    permissionPreset: riverbendOffice.permissionPreset,
    reportingRoute: riverbendOffice.reportingRoute,
    workflowAccess: riverbendOffice.workflowAccess
  });
  return {
    stations: [
      station("admin@rmvi.org", "System Administrator Workstation", "International HQ", "Full GCOS administration, deployment control, user lifecycle, audit override"),
      station("international@rmvi.org", "International Executive Workstation", "International HQ", "Global override, policy registry, audit control"),
      station("np@rmvi.org", "National Presidency Workstation", "National HQ", "National directives, county oversight, executive summaries"),
      station("district_admin@rmvi.org", "District Command Workstation", "District HQ", "Branch oversight, workflow monitor, transfer approvals"),
      station("local_branch_017@rmvi.org", "Local Branch Workstation", "Local Branch", "Local reports, member registry, directive acknowledgement"),
      station("finance@rmvi.org", "Finance Desk Workstation", "National HQ", "Financial reports, budgets, releases, reconciliation, audit evidence"),
      station("audit@rmvi.org", "Audit Desk Workstation", "National HQ", "Compliance review, audit packets, evidence sealing, control testing"),
      station("mission@rmvi.org", "Mission Office Workstation", "National HQ", "Mission outreach, transfers, church planting, personnel movement"),
      riverbendStation
    ],
    messages: [
      message("Directive", "Q2 governance reporting directive", "Regional HQ - West Africa", "Ready", "Policy memo"),
      message("Report", "District construction progress packet", "Buchanan District Office", "In Review", "PDF, photos"),
      message("Approval", "Finance release request: mission transport", "County Finance", "Escalated", "Form, signatures"),
      message("Transfer", "Official reassignment letter", "Mission Office", "Queued", "Signed letter")
    ],
    reports: [
      report("National mission activity report", "National Programs", "Local -> Area -> District -> County -> National", "Today", "In Review", 86, { type: "Mission", period: "May 2026", routingStage: "National review", evidenceStatus: "Evidence attached" }),
      report("County finance summary", "County Finance", "County -> National", "Tomorrow", "Ready", 94, { type: "Financial", period: "Q2 2026", routingStage: "County validation", evidenceStatus: "Ledger pending" }),
      report("Construction milestone report", "District Works", "District -> County", "Overdue", "Escalated", 58, { type: "Construction", period: "May 2026", routingStage: "District correction", evidenceStatus: "Photo packet incomplete", correctionReason: "Missing site photos" })
    ],
    reportAssignments: [],
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
    liveSessions: [
      liveSession("District reporting review", "National Presidency Workstation", "Video Meeting", "Live", "National mission activity report", "National HQ -> District HQ", "Report review"),
      liveSession("Finance approval discussion", "Finance Desk Workstation", "Approval Room", "Queued", "County youth program budget", "Finance Office -> District -> County", "Approval discussion"),
      liveSession("Executive emergency briefing", "International Executive Workstation", "Broadcast", "Priority", "Construction milestone report", "HQ broadcast channel", "Executive directive")
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
    aiDrafts: [
      aiDraft(
        "Executive Summary",
        "Executive Summary: Daily governance control brief",
        [
          "National operations show active report movement, pending approval chains, and two escalation items requiring supervisory review.",
          "Priority attention should remain on construction reporting, regional conference logistics, and transfer acknowledgements."
        ].join("\n"),
        8
      )
    ],
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

export function report(name, owner, path, due, state, score, metadata = {}) {
  return {
    id: randomUUID(),
    name,
    owner,
    path,
    due,
    state,
    score,
    type: metadata.type ?? "Administrative",
    period: metadata.period ?? "Current",
    routingStage: metadata.routingStage ?? state,
    evidenceStatus: metadata.evidenceStatus ?? "Evidence pending",
    correctionReason: metadata.correctionReason,
    verified: metadata.verified,
    approvedBy: metadata.approvedBy,
    templateId: metadata.templateId,
    preparedBy: metadata.preparedBy,
    attestation: metadata.attestation,
    approvalLimit: metadata.approvalLimit,
    reportFields: metadata.reportFields,
    templateChecklist: metadata.templateChecklist,
    evidenceFiles: metadata.evidenceFiles ?? []
  };
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

export function liveSession(title, host, sessionType, status, linkedRecord, route, purpose) {
  return {
    id: randomUUID(),
    title,
    host,
    sessionType,
    status,
    linkedRecord,
    route,
    purpose,
    participants: [],
    notes: [],
    files: [],
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
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

export function office(name, email, level, department, supervisor, metadata = {}) {
  const parentName = metadata.parentName ?? supervisor;
  const permissionPreset = metadata.permissionPreset ?? "Reporter";
  return {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    level,
    department,
    supervisor,
    nodeKind: metadata.nodeKind ?? "Office",
    parentId: metadata.parentId,
    parentName,
    permissionPreset,
    reportingRoute: metadata.reportingRoute ?? [level, parentName || "Parent office", "Supervising authority", "Archive vault"].join(" -> "),
    workflowAccess: metadata.workflowAccess ?? ["ChurchMail", "Reports", "Tasks", "Archive", "Live Comms"],
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
