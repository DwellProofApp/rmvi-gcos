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

    commandBriefing(body = {}) {
      const openEscalations = state.escalations.filter((item) => item.status !== "Resolved");
      const pendingApprovals = state.approvals.filter((item) => item.state !== "Approved");
      const activeReports = state.reports.filter((item) => item.state !== "Approved");
      const blockedTasks = state.tasks.filter((item) => item.status === "Blocked");
      const atRiskCalendar = state.calendarEvents.filter((item) => item.status === "At Risk");
      const transferPending = state.personnel.filter((item) => item.status === "Transfer Pending");
      const riskScore = Math.min(100, (openEscalations.length * 16) + (pendingApprovals.length * 8) + (activeReports.length * 6) + (blockedTasks.length * 12) + (atRiskCalendar.length * 10) + (transferPending.length * 7));
      const title = body.title ?? "Executive command briefing";
      return {
        title,
        generatedAt: new Date().toISOString(),
        riskScore,
        counts: {
          openEscalations: openEscalations.length,
          pendingApprovals: pendingApprovals.length,
          activeReports: activeReports.length,
          blockedTasks: blockedTasks.length,
          atRiskCalendar: atRiskCalendar.length,
          transferPending: transferPending.length
        },
        priorities: [
          openEscalations[0]?.item ?? "No open escalation",
          pendingApprovals[0]?.request ?? "No pending approval",
          blockedTasks[0]?.title ?? "No blocked task",
          atRiskCalendar[0]?.title ?? "No calendar risk"
        ]
      };
    },

    archiveCommandBriefing(body) {
      const briefing = this.commandBriefing({ title: body.title ?? "Executive command briefing" });
      const created = documentRecord(`${briefing.title}.json`, "Command briefing", "Control Center", body.actor, "JSON", "Archived");
      state.documents.unshift(created);
      record("CommandBriefingArchived", body.actor, created.name, `${briefing.riskScore}% risk score`);
      return { document: created, briefing };
    },

    issueCommandDirective(body) {
      requirePermission(body.actor, "canApprove");
      const briefing = this.commandBriefing({ title: "Directive context" });
      const created = message("Directive", body.subject ?? "Executive command directive", body.actor ?? "Control Center", "Ready", body.files ?? "Command briefing");
      state.messages.unshift(created);
      record("CommandDirectiveIssued", body.actor, created.subject, `${briefing.riskScore}% risk context`);
      return created;
    },

    createCommandTask(body) {
      const briefing = this.commandBriefing({ title: "Task context" });
      const created = task(body.title ?? "Command center follow-up", body.owner ?? "Control Center", body.assignee ?? body.actor, body.priority ?? "High", body.due ?? "Today", "In Progress");
      state.tasks.unshift(created);
      record("CommandTaskCreated", body.actor, created.title, `${briefing.counts.openEscalations} escalations in context`);
      return created;
    },

    openCommandEscalation(body) {
      const briefing = this.commandBriefing({ title: "Escalation context" });
      const created = escalation("Control Center", body.item ?? "Command center risk", body.reason ?? `Risk score ${briefing.riskScore}% requires attention`, body.severity ?? "High", body.owner ?? body.actor ?? "Control Center");
      state.escalations.unshift(created);
      record("CommandEscalationOpened", body.actor, created.item, created.reason);
      return created;
    },

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

    onboardPerson(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.status = "Onboarding";
      item.credentialStatus = "Provisioning";
      record("PersonOnboardingStarted", body.actor, item.name, body.reason ?? "Onboarding started");
      return item;
    },

    resetPersonCredentials(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.credentialStatus = "Reset required";
      record("PersonCredentialsReset", body.actor, item.name, body.reason ?? "Credential reset requested");
      return item;
    },

    placePersonOnLeave(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.status = "On Leave";
      record("PersonLeavePlaced", body.actor, item.name, body.reason ?? "Leave recorded");
      return item;
    },

    updatePersonClearance(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.clearance = body.clearance ?? "Station";
      record("PersonClearanceUpdated", body.actor, item.name, item.clearance);
      return item;
    },

    personnelDigest() {
      const active = state.personnel.filter((item) => item.status === "Active" || item.status === "Assigned");
      const transferPending = state.personnel.filter((item) => item.status === "Transfer Pending");
      const onboarding = state.personnel.filter((item) => item.status === "Onboarding");
      const inactive = state.personnel.filter((item) => item.status === "Inactive" || item.status === "On Leave");
      return {
        generatedAt: new Date().toISOString(),
        active: active.length,
        transferPending: transferPending.length,
        onboarding: onboarding.length,
        inactive: inactive.length,
        primaryStation: transferPending[0]?.assignedStation ?? active[0]?.assignedStation ?? "No active station",
        nextPerson: transferPending[0]?.name ?? onboarding[0]?.name ?? active[0]?.name ?? "No personnel record"
      };
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

    bulkSubmitReports(body) {
      const ids = Array.isArray(body.ids) && body.ids.length ? body.ids : state.reports.filter((item) => item.state !== "Approved").map((item) => item.id);
      const updated = ids.map((id) => {
        const item = findById(state.reports, id);
        item.state = "Approved";
        item.score = 100;
        return item;
      });
      record("ReportsBulkSubmitted", body.actor, "Reporting center", `${updated.length} reports submitted`);
      return { updated, count: updated.length };
    },

    bulkRequestReportCorrections(body) {
      const ids = Array.isArray(body.ids) && body.ids.length ? body.ids : state.reports.filter((item) => item.state !== "Approved").map((item) => item.id);
      const updated = ids.map((id) => {
        const item = findById(state.reports, id);
        item.state = "Correction Requested";
        item.score = Math.min(item.score, 45);
        return item;
      });
      record("ReportsBulkCorrectionRequested", body.actor, "Reporting center", body.reason ?? `${updated.length} corrections requested`);
      return { updated, count: updated.length };
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

    bulkApproveRequests(body) {
      requirePermission(body.actor, "canApprove");
      const ids = Array.isArray(body.ids) && body.ids.length ? body.ids : state.approvals.filter((item) => item.state !== "Approved").map((item) => item.id);
      const updated = ids.map((id) => {
        const item = findById(state.approvals, id);
        item.state = "Approved";
        item.signatures = "complete";
        return item;
      });
      record("ApprovalsBulkApproved", body.actor, "Approval engine", `${updated.length} approvals granted`);
      return { updated, count: updated.length };
    },

    bulkRejectRequests(body) {
      requirePermission(body.actor, "canApprove");
      const ids = Array.isArray(body.ids) && body.ids.length ? body.ids : state.approvals.filter((item) => item.state !== "Approved").map((item) => item.id);
      const updated = ids.map((id) => {
        const item = findById(state.approvals, id);
        item.state = "Rejected";
        item.signatures = "closed";
        return item;
      });
      record("ApprovalsBulkRejected", body.actor, "Approval engine", body.reason ?? `${updated.length} approvals rejected`);
      return { updated, count: updated.length };
    },

    workflowDigest() {
      const reportsOpen = state.reports.filter((item) => item.state !== "Approved");
      const approvalsOpen = state.approvals.filter((item) => item.state !== "Approved");
      const escalatedReports = state.reports.filter((item) => item.state === "Escalated" || item.due === "Overdue");
      const escalatedApprovals = state.approvals.filter((item) => item.state === "Escalated");
      return {
        generatedAt: new Date().toISOString(),
        reportsOpen: reportsOpen.length,
        approvalsOpen: approvalsOpen.length,
        escalatedReports: escalatedReports.length,
        escalatedApprovals: escalatedApprovals.length,
        nextReport: reportsOpen[0]?.name ?? "No open reports",
        nextApproval: approvalsOpen[0]?.request ?? "No open approvals"
      };
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

    triageEscalation(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.owner = body.owner ?? body.actor ?? item.owner;
      item.severity = body.severity ?? item.severity;
      item.status = "Open";
      record("EscalationTriaged", body.actor, item.item, `${item.owner} triaged as ${item.severity}`);
      return item;
    },

    updateEscalationSla(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.sla = body.sla ?? "24 hours";
      record("EscalationSlaUpdated", body.actor, item.item, item.sla);
      return item;
    },

    watchEscalation(id, body) {
      const item = findById(state.escalations, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      item.status = item.status === "Resolved" ? item.status : "Watching";
      record("EscalationWatcherAdded", body.actor, item.item, watcher);
      return item;
    },

    mergeEscalation(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.status = "Merged";
      item.reason = `${item.reason} | Merged into ${body.target ?? "primary escalation"}`;
      record("EscalationMerged", body.actor, item.item, body.target ?? "primary escalation");
      return item;
    },

    escalationDigest() {
      const open = state.escalations.filter((item) => item.status !== "Resolved" && item.status !== "Merged");
      const critical = open.filter((item) => item.severity === "Critical");
      const watched = open.filter((item) => item.watchers?.length);
      return {
        generatedAt: new Date().toISOString(),
        open: open.length,
        critical: critical.length,
        watched: watched.length,
        resolved: state.escalations.filter((item) => item.status === "Resolved").length,
        primary: critical[0]?.item ?? open[0]?.item ?? "No open escalations",
        owner: critical[0]?.owner ?? open[0]?.owner ?? "None"
      };
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

    activateOffice(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.status = "Active";
      record("OfficeActivated", body.actor, item.name, "Office activated");
      return item;
    },

    suspendOffice(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.status = "Suspended";
      record("OfficeSuspended", body.actor, item.name, body.reason ?? "Office suspended");
      return item;
    },

    rotateOfficePassword(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.password = body.password ?? `gcos-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
      record("OfficePasswordRotated", body.actor, item.name, "Station credential rotated");
      return item;
    },

    activateOfficeStation(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      if (!state.stations.some((entry) => entry.email === item.email)) {
        state.stations.push(station(item.email, `${item.name} Workstation`, item.level, `${item.department}, supervised by ${item.supervisor}`));
      }
      item.status = "Active";
      record("OfficeStationActivated", body.actor, item.name, `${item.email} ready`);
      return item;
    },

    officeDigest() {
      return {
        generatedAt: new Date().toISOString(),
        total: state.offices.length,
        active: state.offices.filter((item) => item.status === "Active").length,
        provisioned: state.offices.filter((item) => item.status === "Provisioned").length,
        suspended: state.offices.filter((item) => item.status === "Suspended").length,
        stationIdentities: state.stations.length,
        nextOffice: state.offices.find((item) => item.status !== "Active")?.name ?? state.offices[0]?.name ?? "No offices"
      };
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

    prepareTransfer(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.step = "Pre-migration checklist";
      item.risk = body.note ?? "Identity graph prepared";
      record("TransferPrepared", body.actor, item.person, item.risk);
      return item;
    },

    revokeTransferAccess(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.step = "Previous access revoked";
      item.risk = "Old station credentials disabled";
      record("TransferAccessRevoked", body.actor, item.person, body.reason ?? item.risk);
      return item;
    },

    activateTransferStation(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.step = "New station activated";
      item.risk = "New workstation ready";
      record("TransferStationActivated", body.actor, item.person, item.to);
      return item;
    },

    verifyTransfer(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.step = "Verified";
      item.risk = body.result ?? "Identity migration verified";
      record("TransferVerified", body.actor, item.person, item.risk);
      return item;
    },

    transferDigest() {
      const ready = state.transfers.filter((item) => item.step === "New station login ready" || item.step === "Verified");
      const risky = state.transfers.filter((item) => /risk|pending|required|review/i.test(item.risk));
      const pending = state.transfers.filter((item) => !ready.includes(item));
      return {
        generatedAt: new Date().toISOString(),
        total: state.transfers.length,
        ready: ready.length,
        pending: pending.length,
        risk: risky.length,
        nextTransfer: pending[0]?.person ?? ready[0]?.person ?? "No transfers"
      };
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

    sealDocument(id, body) {
      const item = findById(state.documents, id);
      item.status = "Sealed";
      record("DocumentSealed", body.actor, item.name, body.reason ?? "Document sealed");
      return item;
    },

    placeDocumentHold(id, body) {
      const item = findById(state.documents, id);
      item.status = "Legal Hold";
      record("DocumentHoldPlaced", body.actor, item.name, body.reason ?? "Legal hold placed");
      return item;
    },

    updateDocumentRetention(id, body) {
      const item = findById(state.documents, id);
      item.retainedUntil = body.retainedUntil ?? "Permanent";
      record("DocumentRetentionUpdated", body.actor, item.name, item.retainedUntil);
      return item;
    },

    duplicateDocument(id, body) {
      const item = findById(state.documents, id);
      const created = documentRecord(body.name ?? `Copy of ${item.name}`, item.classification, item.source, body.owner ?? item.owner, item.fileType, "Archived");
      state.documents.unshift(created);
      record("DocumentDuplicated", body.actor, created.name, item.name);
      return created;
    },

    archiveManifest() {
      const byStatus = state.documents.reduce((counts, item) => {
        counts[item.status] = (counts[item.status] ?? 0) + 1;
        return counts;
      }, {});
      const bySource = state.documents.reduce((counts, item) => {
        counts[item.source] = (counts[item.source] ?? 0) + 1;
        return counts;
      }, {});
      return {
        generatedAt: new Date().toISOString(),
        total: state.documents.length,
        byStatus,
        bySource,
        permanent: state.documents.filter((item) => item.retainedUntil === "Permanent").length
      };
    },

    createAuditNote(body) {
      record("AuditNote", body.actor, body.object ?? "Audit console", body.note ?? "Manual audit note recorded");
      return state.audit[0];
    },

    flagAuditRow(id, body) {
      const item = findById(state.audit, id);
      item.result = `Flagged: ${body.reason ?? item.result}`;
      record("AuditRowFlagged", body.actor, item.object, item.result);
      return item;
    },

    recordManualEvent(body) {
      record("ManualEventRecorded", body.actor, body.object ?? "Event bus", body.result ?? "Manual event recorded");
      return { event: state.events[0], audit: state.audit[0] };
    },

    clearEventLog(body) {
      state.events.length = 0;
      record("EventLogCleared", body.actor, "Event bus", body.reason ?? "Event log cleared");
      return { events: state.events };
    },

    archiveGovernanceSnapshot(body) {
      const created = documentRecord(`Governance snapshot ${new Date().toISOString().slice(0, 10)}.json`, "Governance snapshot", "Audit", body.actor, "JSON", "Archived");
      state.documents.unshift(created);
      record("GovernanceSnapshotArchived", body.actor, created.name, created.storageKey);
      return created;
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
