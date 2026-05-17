import {
  aiDraft,
  approval,
  calendarEvent,
  documentRecord,
  escalation,
  message,
  office,
  person,
  policy,
  report,
  normalizeStationEmail,
  station,
  stationPasswords,
  task,
  transfer
} from "./domain.mjs";

export function createServices({ state, record, requirePermission, findById }) {
  function publicState() {
    return {
      stations: state.stations,
      messages: state.messages,
      reports: state.reports,
      approvals: state.approvals,
      tasks: state.tasks,
      policies: state.policies,
      calendarEvents: state.calendarEvents,
      personnel: state.personnel,
      escalations: state.escalations,
      transfers: state.transfers,
      offices: state.offices,
      documents: state.documents,
      aiDrafts: state.aiDrafts,
      audit: state.audit,
      events: state.events
    };
  }

  function generateDraft(kind, focus, actor) {
    const openEscalations = state.escalations.filter((item) => item.status !== "Resolved");
    const pendingApprovals = state.approvals.filter((item) => item.state !== "Approved");
    const activeReports = state.reports.filter((item) => item.state !== "Approved");
    const activeTasks = state.tasks.filter((item) => item.status !== "Complete");
    const activePolicies = state.policies.filter((item) => item.status === "Active");
    const upcomingEvents = state.calendarEvents.filter((item) => item.status !== "Complete");
    const activePersonnel = state.personnel.filter((item) => item.status !== "Inactive");
    return aiDraft(
      kind,
      `${kind}: ${focus}`,
      [
        `${actor ?? "GCOS AI"} generated this ${kind.toLowerCase()} for ${focus}.`,
        `Reports needing attention: ${activeReports.length}. Highest risk report: ${activeReports[0]?.name ?? "none"}.`,
        `Active station tasks: ${activeTasks.length}. Current task risk: ${activeTasks[0]?.title ?? "none"}.`,
        `Active policies: ${activePolicies.length}. Current policy reference: ${activePolicies[0]?.title ?? "none"}.`,
        `Upcoming calendar items: ${upcomingEvents.length}. Nearest item: ${upcomingEvents[0]?.title ?? "none"}.`,
        `Personnel records: ${activePersonnel.length}. Current station assignment: ${activePersonnel[0]?.assignedStation ?? "none"}.`,
        `Open escalations: ${openEscalations.length}. Priority item: ${openEscalations[0]?.item ?? "none"}.`,
        `Pending approvals: ${pendingApprovals.length}. Current route: ${pendingApprovals[0]?.route ?? "none"}.`
      ].join("\n"),
      activeReports.length + activeTasks.length + activePolicies.length + upcomingEvents.length + activePersonnel.length + openEscalations.length + pendingApprovals.length + state.messages.length
    );
  }

  return {
    publicState,

    createMessage(body) {
      const created = message(body.kind, body.subject, body.from, body.status ?? "Ready", body.files ?? "No attachments");
      state.messages.unshift(created);
      record("EmailSent", body.actor ?? body.from ?? "ChurchMail", created.subject, `${created.kind} routed`);
      return created;
    },

    classifyMessage(id, body) {
      const item = findById(state.messages, id);
      item.kind = body.kind ?? "Notification";
      record("EmailClassified", body.actor, item.subject, item.kind);
      return item;
    },

    updateMessageStatus(id, body) {
      const item = findById(state.messages, id);
      item.status = body.status ?? "In Review";
      record("EmailStatusUpdated", body.actor, item.subject, item.status);
      return item;
    },

    createReport(body) {
      const created = report(body.name, body.owner ?? body.actor, body.path, body.due ?? "Draft", body.state ?? "Ready", body.score ?? 15);
      state.reports.unshift(created);
      record("ReportDrafted", body.actor, created.name, "Created in reporting center");
      return created;
    },

    createApproval(body) {
      const created = approval(body.request, body.route, body.limit ?? "Policy check", body.state ?? "Validation", body.signatures ?? "0/2");
      state.approvals.unshift(created);
      record("ApprovalRequested", body.actor, created.request, "Delegation check started");
      return created;
    },

    createTask(body) {
      const created = task(body.title, body.owner ?? body.actor, body.assignee, body.priority ?? "Medium", body.due ?? "This week", body.status ?? "Queued");
      state.tasks.unshift(created);
      record("TaskCreated", body.actor, created.title, `${created.assignee} assigned`);
      return created;
    },

    advanceTask(id, body) {
      const item = findById(state.tasks, id);
      item.status = body.status ?? "Complete";
      record("TaskAdvanced", body.actor, item.title, item.status);
      return item;
    },

    updateTaskAssignee(id, body) {
      const item = findById(state.tasks, id);
      item.assignee = body.assignee ?? body.actor ?? item.assignee;
      record("TaskAssigneeUpdated", body.actor, item.title, item.assignee);
      return item;
    },

    updateTaskPriority(id, body) {
      const item = findById(state.tasks, id);
      item.priority = body.priority ?? "High";
      record("TaskPriorityUpdated", body.actor, item.title, item.priority);
      return item;
    },

    createPolicy(body) {
      requirePermission(body.actor, "canApprove");
      const created = policy(body.title, body.category, body.owner ?? body.actor, body.status ?? "Draft", body.summary, body.acknowledgements ?? 0);
      state.policies.unshift(created);
      record("PolicyPublished", body.actor, created.title, `${created.category} registry updated`);
      return created;
    },

    acknowledgePolicy(id, body) {
      const item = findById(state.policies, id);
      item.acknowledgements += 1;
      record("PolicyAcknowledged", body.actor, item.title, `${item.acknowledgements} acknowledgements`);
      return item;
    },

    updatePolicyStatus(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.status = body.status ?? "Review";
      record("PolicyStatusUpdated", body.actor, item.title, item.status);
      return item;
    },

    retirePolicy(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.status = "Retired";
      record("PolicyRetired", body.actor, item.title, body.reason ?? "Policy retired");
      return item;
    },

    createCalendarEvent(body) {
      const created = calendarEvent(body.title, body.category, body.owner ?? body.actor, body.date, body.priority ?? "Medium", body.status ?? "Scheduled");
      state.calendarEvents.unshift(created);
      record("CalendarEventCreated", body.actor, created.title, `${created.date} scheduled`);
      return created;
    },

    completeCalendarEvent(id, body) {
      const item = findById(state.calendarEvents, id);
      item.status = "Complete";
      record("CalendarEventCompleted", body.actor, item.title, "Calendar item closed");
      return item;
    },

    updateCalendarEventDate(id, body) {
      const item = findById(state.calendarEvents, id);
      item.date = body.date ?? item.date;
      record("CalendarDateUpdated", body.actor, item.title, item.date);
      return item;
    },

    updateCalendarEventPriority(id, body) {
      const item = findById(state.calendarEvents, id);
      item.priority = body.priority ?? "High";
      record("CalendarPriorityUpdated", body.actor, item.title, item.priority);
      return item;
    },

    markCalendarEventAtRisk(id, body) {
      const item = findById(state.calendarEvents, id);
      item.status = "At Risk";
      record("CalendarEventAtRisk", body.actor, item.title, body.reason ?? "Calendar risk flagged");
      return item;
    },

    createPerson(body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const created = person(body.name, body.role, body.currentStation, body.assignedStation, body.status ?? "Active");
      state.personnel.unshift(created);
      record("PersonRegistered", body.actor, created.name, `${created.role} assigned to ${created.assignedStation}`);
      return created;
    },

    updatePersonAssignment(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      if (body.currentStation) item.currentStation = body.currentStation;
      if (body.assignedStation) item.assignedStation = body.assignedStation;
      if (body.status) item.status = body.status;
      record("PersonAssignmentUpdated", body.actor, item.name, `${item.currentStation} -> ${item.assignedStation}`);
      return item;
    },

    updatePersonRole(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.role = body.role ?? item.role;
      record("PersonRoleUpdated", body.actor, item.name, item.role);
      return item;
    },

    updatePersonStatus(id, body) {
      const item = findById(state.personnel, id);
      item.status = body.status ?? "Active";
      record("PersonStatusUpdated", body.actor, item.name, item.status);
      return item;
    },

    deactivatePerson(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.status = "Inactive";
      record("PersonDeactivated", body.actor, item.name, body.reason ?? "Personnel record deactivated");
      return item;
    },

    submitReport(id, body) {
      const item = findById(state.reports, id);
      item.state = "Approved";
      item.score = 100;
      record("ReportSubmitted", body.actor, item.name, "Forwarded upward");
      return item;
    },

    requestReportCorrection(id, body) {
      const item = findById(state.reports, id);
      item.state = "Correction Requested";
      item.score = Math.min(item.score, 45);
      record("ReportCorrectionRequested", body.actor, item.name, body.reason ?? "Correction requested");
      return item;
    },

    updateReportDue(id, body) {
      const item = findById(state.reports, id);
      item.due = body.due ?? "This week";
      record("ReportDueUpdated", body.actor, item.name, item.due);
      return item;
    },

    updateReportScore(id, body) {
      const item = findById(state.reports, id);
      item.score = Math.max(0, Math.min(100, body.score ?? item.score));
      if (body.state) item.state = body.state;
      record("ReportScoreUpdated", body.actor, item.name, `${item.score}% complete`);
      return item;
    },

    approveRequest(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.state = "Approved";
      item.signatures = "complete";
      record("ApprovalGranted", body.actor, item.request, "Execution authorized");
      return item;
    },

    updateApprovalRoute(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.route = body.route ?? item.route;
      item.state = body.state ?? item.state;
      record("ApprovalRouteUpdated", body.actor, item.request, item.route);
      return item;
    },

    signApproval(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      const match = /^(\d+)\/(\d+)$/.exec(item.signatures);
      if (match) {
        const current = Number(match[1]);
        const required = Number(match[2]);
        const next = Math.min(required, current + 1);
        item.signatures = `${next}/${required}`;
        item.state = next >= required ? "Approved" : "Signature";
      } else {
        item.signatures = body.signatures ?? "1/2";
        item.state = body.state ?? "Signature";
      }
      record("ApprovalSigned", body.actor, item.request, `${item.signatures} signatures`);
      return item;
    },

    rejectRequest(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.state = "Rejected";
      item.signatures = "closed";
      record("ApprovalRejected", body.actor, item.request, body.reason ?? "Request rejected");
      return item;
    },

    createEscalation(body) {
      const created = escalation(body.source, body.item, body.reason, body.severity ?? "High", body.owner ?? "Workflow Engine");
      state.escalations.unshift(created);
      record("EscalationTriggered", body.actor, created.item, created.reason);
      return created;
    },

    updateEscalationOwner(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.owner = body.owner ?? body.actor ?? item.owner;
      record("EscalationOwnerUpdated", body.actor, item.item, item.owner);
      return item;
    },

    routeEscalation(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.status = "Upward";
      record("EscalationRouted", body.actor, item.item, "Forwarded to supervising authority");
      return item;
    },

    updateEscalationSeverity(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.severity = body.severity ?? "High";
      record("EscalationSeverityUpdated", body.actor, item.item, item.severity);
      return item;
    },

    resolveEscalation(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.status = "Resolved";
      record("EscalationResolved", body.actor, item.item, "Resolution recorded");
      return item;
    },

    createOffice(body) {
      requirePermission(body.actor, "canCreateOffices");
      if (state.stations.some((entry) => entry.email === body.email) || state.offices.some((entry) => entry.email === body.email)) {
        return { conflict: true, error: "Station email already exists" };
      }
      const created = office(body.name, body.email, body.level, body.department, body.supervisor);
      state.offices.unshift(created);
      state.stations.push(station(created.email, `${created.name} Workstation`, created.level, `${created.department}, supervised by ${created.supervisor}`));
      record("OfficeCreated", body.actor, created.name, `${created.level} workstation provisioned`);
      return created;
    },

    updateOfficeSupervisor(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.supervisor = body.supervisor ?? item.supervisor;
      const stationRecord = state.stations.find((entry) => entry.email === item.email);
      if (stationRecord) stationRecord.authority = `${item.department}, supervised by ${item.supervisor}`;
      record("OfficeSupervisorUpdated", body.actor, item.name, item.supervisor);
      return item;
    },

    updateOfficeStatus(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.status = body.status ?? "Provisioned";
      record("OfficeStatusUpdated", body.actor, item.name, item.status);
      return item;
    },

    createTransfer(body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const created = transfer(body.person, body.from, body.to, body.step ?? "Recipient acknowledgement", body.risk ?? "Session switch pending");
      state.transfers.unshift(created);
      record("TransferCreated", body.actor, created.person, `${created.from} -> ${created.to}`);
      return created;
    },

    acknowledgeTransfer(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.step = "Permissions migration";
      item.risk = "Acknowledgement recorded";
      record("TransferAcknowledged", body.actor, item.person, "Recipient acknowledgement recorded");
      return item;
    },

    updateTransferRisk(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.risk = body.risk ?? "Supervisor review required";
      record("TransferRiskUpdated", body.actor, item.person, item.risk);
      return item;
    },

    executeTransfer(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.step = "New station login ready";
      item.risk = "Previous permissions revoked";
      const personRecord = state.personnel.find((entry) => entry.name === item.person);
      if (personRecord) {
        personRecord.currentStation = item.to;
        personRecord.assignedStation = item.to;
        personRecord.status = "Assigned";
        record("PersonStatusUpdated", body.actor, personRecord.name, `Assigned to ${item.to}`);
      }
      const targetOffice = state.offices.find((entry) => entry.name === item.to);
      if (targetOffice && !state.stations.some((entry) => entry.email === targetOffice.email)) {
        state.stations.push(station(targetOffice.email, `${targetOffice.name} Workstation`, targetOffice.level, `${targetOffice.department}, supervised by ${targetOffice.supervisor}`));
        record("StationActivated", body.actor, targetOffice.name, `${targetOffice.email} ready`);
      }
      record("TransferExecuted", body.actor, item.person, "Identity migration logged");
      return item;
    },

    createDocument(body) {
      const created = documentRecord(body.name, body.classification, body.source, body.owner ?? body.actor, body.fileType, body.status ?? "Archived");
      state.documents.unshift(created);
      record("DocumentArchived", body.actor, created.name, `${created.classification} stored in object vault`);
      return created;
    },

    updateDocumentClassification(id, body) {
      const item = findById(state.documents, id);
      item.classification = body.classification ?? item.classification;
      record("DocumentClassificationUpdated", body.actor, item.name, item.classification);
      return item;
    },

    updateDocumentOwner(id, body) {
      const item = findById(state.documents, id);
      item.owner = body.owner ?? body.actor ?? item.owner;
      record("DocumentOwnerUpdated", body.actor, item.name, item.owner);
      return item;
    },

    markDocumentInReview(id, body) {
      const item = findById(state.documents, id);
      item.status = "In Review";
      record("DocumentReviewStarted", body.actor, item.name, body.reason ?? "Document marked for review");
      return item;
    },

    markDocumentArchived(id, body) {
      const item = findById(state.documents, id);
      item.status = "Archived";
      record("DocumentArchived", body.actor, item.name, body.reason ?? "Document archived");
      return item;
    },

    createAiDraft(body) {
      const draft = generateDraft(body.kind ?? "Executive Summary", body.focus ?? "Governance summary", body.actor);
      state.aiDrafts.unshift(draft);
      record("AIDraftGenerated", body.actor, draft.title, `${draft.sourceCount} governance records summarized`);
      return draft;
    },

    archiveAiDraft(id, body) {
      const draft = findById(state.aiDrafts, id);
      const created = documentRecord(`${draft.title}.txt`, "AI draft", "AI Desk", body.actor ?? "GCOS AI", "Text", "Archived");
      state.documents.unshift(created);
      record("AIDraftArchived", body.actor, draft.title, created.storageKey);
      return created;
    },

    refreshAiDraft(id, body) {
      const draft = findById(state.aiDrafts, id);
      const refreshed = generateDraft(draft.kind, body.focus ?? draft.title.replace(`${draft.kind}: `, ""), body.actor);
      draft.title = refreshed.title;
      draft.body = refreshed.body;
      draft.sourceCount = refreshed.sourceCount;
      draft.createdAt = refreshed.createdAt;
      record("AIDraftRefreshed", body.actor, draft.title, `${draft.sourceCount} governance records summarized`);
      return draft;
    },

    syncOfflineActions(body) {
      const actions = Array.isArray(body.actions) ? body.actions : [];
      for (const action of actions) {
        record(action.event ?? "OfflineAction", action.actor, action.object ?? "Queued action", `${action.result ?? "Synced"} (synced)`);
      }
      state.events.unshift(`SyncCompleted: ${actions.length} queued actions`);
      return { synced: actions.length, auditCount: state.audit.length };
    },

    login(body) {
      const normalizedEmail = normalizeStationEmail(body.email);
      const foundOffice = state.offices.find((item) => item.email === normalizedEmail);
      const configuredPassword = stationPasswords[normalizedEmail] ?? foundOffice?.password;
      if (configuredPassword !== body.password) return { unauthorized: true, error: "Invalid station credentials" };

      let foundStation = state.stations.find((item) => item.email === normalizedEmail);
      if (!foundStation && foundOffice) {
        foundStation = station(foundOffice.email, `${foundOffice.name} Workstation`, foundOffice.level, `${foundOffice.department}, supervised by ${foundOffice.supervisor}`);
        state.stations.push(foundStation);
      }
      if (!foundStation) return { unauthorized: true, error: "Invalid station credentials" };
      record("Login", body.email, foundStation.title, "Allowed");
      return { station: foundStation, token: `demo.${Buffer.from(body.email).toString("base64url")}` };
    }
  };
}
