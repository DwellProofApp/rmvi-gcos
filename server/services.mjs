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
  liveSession,
  normalizeStationEmail,
  station,
  stationPasswords,
  task,
  transfer
} from "./domain.mjs";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const LOCKOUT_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

export function createServices({ state, record, requirePermission, findById }) {
  ensureAuthCredentials();

  function findStationIdentity(id) {
    const decoded = decodeURIComponent(String(id ?? ""));
    const item = state.stations.find((entry) => entry.id === decoded || entry.email === decoded);
    if (item) return item;
    return findById(state.stations, id);
  }

  function findEventIndex(id) {
    const decoded = decodeURIComponent(String(id ?? ""));
    const numeric = Number(decoded);
    if (Number.isInteger(numeric) && numeric >= 0 && numeric < state.events.length) return numeric;
    const index = state.events.findIndex((entry) => entry === decoded);
    if (index >= 0) return index;
    throw Object.assign(new Error("Event not found"), { status: 404 });
  }

  function publicState() {
    return {
      stations: state.stations,
      messages: state.messages,
      reports: state.reports,
      approvals: state.approvals,
      tasks: state.tasks,
      policies: state.policies,
      calendarEvents: state.calendarEvents,
      liveSessions: state.liveSessions ?? [],
      personnel: state.personnel,
      escalations: state.escalations,
      transfers: state.transfers,
      offices: state.offices,
      documents: state.documents,
      files: state.files ?? [],
      aiDrafts: state.aiDrafts,
      audit: state.audit,
      events: state.events
    };
  }

  function ensureAuthCredentials() {
    state.authCredentials ??= {};
    for (const stationRecord of state.stations ?? []) {
      ensureStationCredential(stationRecord.email, stationPasswords[stationRecord.email] ?? `gcos-${stationRecord.email.split("@")[0].replace(/[^a-z0-9]+/gi, "-")}`);
    }
    for (const officeRecord of state.offices ?? []) {
      ensureStationCredential(officeRecord.email, officeRecord.password);
    }
  }

  function ensureStationCredential(email, password) {
    const normalizedEmail = normalizeStationEmail(email);
    state.authCredentials ??= {};
    if (!state.authCredentials[normalizedEmail]) {
      state.authCredentials[normalizedEmail] = credentialRecord(normalizedEmail, password ?? `gcos-${normalizedEmail.split("@")[0]}`);
    }
    return state.authCredentials[normalizedEmail];
  }

  function credentialRecord(email, password) {
    const salt = randomBytes(16).toString("hex");
    return {
      email: normalizeStationEmail(email),
      passwordHash: hashPassword(password, salt),
      salt,
      algorithm: "pbkdf2-sha256",
      status: "Active",
      failedAttempts: 0,
      mfaRequired: false,
      forceReset: false,
      updatedAt: new Date().toISOString()
    };
  }

  function hashPassword(password, salt) {
    return pbkdf2Sync(String(password ?? ""), salt, 120000, 32, "sha256").toString("hex");
  }

  function passwordMatches(password, credential) {
    const expected = Buffer.from(credential.passwordHash, "hex");
    const actual = Buffer.from(hashPassword(password, credential.salt), "hex");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  function publicCredential(credential) {
    return {
      email: credential.email,
      status: credential.status ?? "Active",
      failedAttempts: credential.failedAttempts ?? 0,
      lockedUntil: credential.lockedUntil,
      mfaRequired: Boolean(credential.mfaRequired),
      forceReset: Boolean(credential.forceReset),
      updatedAt: credential.updatedAt,
      updatedBy: credential.updatedBy,
      lastLoginAt: credential.lastLoginAt,
      lastFailedAt: credential.lastFailedAt
    };
  }

  function credentialForStation(id) {
    const stationRecord = findStationIdentity(id);
    return { station: stationRecord, credential: ensureStationCredential(stationRecord.email, stationPasswords[stationRecord.email]) };
  }

  function setStationPassword(stationRecord, password, actor, event = "StationCredentialRotated") {
    const credential = credentialRecord(stationRecord.email, password);
    credential.updatedBy = actor;
    credential.forceReset = event === "StationCredentialResetForced";
    state.authCredentials[stationRecord.email] = credential;
    stationRecord.credentialStatus = credential.forceReset ? "Reset required" : "Active";
    stationRecord.mfaRequired = credential.mfaRequired;
    record(event, actor, stationRecord.email, "Credential hash updated");
    return { station: stationRecord, credential: publicCredential(credential), temporaryPassword: password };
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

    liveCommsDigest() {
      const sessions = state.liveSessions ?? [];
      return {
        generatedAt: new Date().toISOString(),
        total: sessions.length,
        live: sessions.filter((item) => item.status === "Live").length,
        priority: sessions.filter((item) => item.status === "Priority").length,
        queued: sessions.filter((item) => item.status === "Queued").length,
        archived: sessions.filter((item) => item.archived).length,
        notes: sessions.reduce((sum, item) => sum + (item.notes?.length ?? 0), 0),
        files: sessions.reduce((sum, item) => sum + (item.files?.length ?? 0), 0),
        nextSession: sessions.find((item) => !item.archived)?.title ?? "No live sessions"
      };
    },

    createLiveSession(body) {
      state.liveSessions ??= [];
      const created = liveSession(
        body.title ?? "GCOS live session",
        body.host ?? body.actor ?? "Live Comms",
        body.sessionType ?? "Video Meeting",
        body.status ?? "Live",
        body.linkedRecord ?? "Unlinked record",
        body.route ?? "Current station -> invited offices",
        body.purpose ?? "Live administrative collaboration"
      );
      created.participants = body.participants ?? [body.actor].filter(Boolean);
      state.liveSessions.unshift(created);
      record("LiveSessionCreated", body.actor, created.title, `${created.sessionType} linked to ${created.linkedRecord}`);
      return created;
    },

    updateLiveSessionStatus(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.status = body.status ?? "Live";
      item.lastActionBy = body.actor;
      item.updatedAt = new Date().toISOString();
      record("LiveSessionStatusUpdated", body.actor, item.title, item.status);
      return item;
    },

    attachLiveSessionFile(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.files ??= [];
      item.files.unshift(body.file ?? body.fileName ?? "Shared document");
      item.updatedAt = new Date().toISOString();
      record("LiveSessionFileShared", body.actor, item.title, item.files[0]);
      return item;
    },

    addLiveSessionNote(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.notes ??= [];
      item.notes.unshift(body.note ?? "Decision note recorded");
      item.updatedAt = new Date().toISOString();
      record("LiveSessionNoteAdded", body.actor, item.title, item.notes[0]);
      return item;
    },

    inviteLiveSessionParticipant(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.participants ??= [];
      const participant = body.participant ?? body.email ?? body.actor;
      item.participants = Array.from(new Set([participant, ...item.participants].filter(Boolean)));
      item.updatedAt = new Date().toISOString();
      record("LiveSessionParticipantInvited", body.actor, item.title, participant);
      return item;
    },

    checkInLiveSessionParticipant(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.checkedInParticipants ??= [];
      const participant = body.participant ?? body.email ?? body.actor;
      item.participants = Array.from(new Set([participant, ...(item.participants ?? [])].filter(Boolean)));
      item.checkedInParticipants = Array.from(new Set([participant, ...item.checkedInParticipants].filter(Boolean)));
      item.attendanceCount = item.checkedInParticipants.length;
      item.updatedAt = new Date().toISOString();
      record("LiveSessionParticipantCheckedIn", body.actor, item.title, participant);
      return item;
    },

    addLiveSessionChat(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.transcript ??= [];
      const chat = {
        id: `chat-${Date.now()}`,
        author: body.actor,
        body: body.message ?? "Live message recorded",
        createdAt: new Date().toISOString()
      };
      item.transcript.unshift(chat);
      item.updatedAt = chat.createdAt;
      record("LiveSessionChatAdded", body.actor, item.title, chat.body);
      return item;
    },

    recordLiveSessionDecision(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.decisions ??= [];
      const decision = {
        id: `decision-${Date.now()}`,
        text: body.decision ?? "Decision recorded",
        owner: body.owner ?? body.actor,
        due: body.due ?? "Next meeting",
        createdAt: new Date().toISOString()
      };
      item.decisions.unshift(decision);
      item.notes ??= [];
      item.notes.unshift(`Decision: ${decision.text}`);
      item.updatedAt = decision.createdAt;
      record("LiveSessionDecisionRecorded", body.actor, item.title, decision.text);
      return item;
    },

    updateLiveSessionRecording(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.recordingStatus = body.status ?? "Recording";
      item.recordingStartedAt ??= new Date().toISOString();
      if (item.recordingStatus === "Stopped" || item.recordingStatus === "Complete") {
        item.recordingStoppedAt = new Date().toISOString();
      }
      item.updatedAt = new Date().toISOString();
      record("LiveSessionRecordingUpdated", body.actor, item.title, item.recordingStatus);
      return item;
    },

    attachLiveSessionTranscript(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.voiceTranscript = body.transcript ?? "Voice transcript pending";
      item.transcriptStatus = body.status ?? "Transcribed";
      item.updatedAt = new Date().toISOString();
      record("LiveSessionTranscriptAttached", body.actor, item.title, item.transcriptStatus);
      return item;
    },

    sendLiveSessionSummary(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      const summary = message(
        "Notification",
        body.subject ?? `Live summary: ${item.title}`,
        body.actor ?? item.host,
        "Ready",
        item.files?.length ? item.files.join(", ") : item.linkedRecord
      );
      summary.route = body.route ?? item.route;
      summary.priority = item.status === "Priority" ? "High" : "Medium";
      state.messages.unshift(summary);
      item.summaryMessageId = summary.id;
      item.summarySentAt = new Date().toISOString();
      item.updatedAt = item.summarySentAt;
      record("LiveSessionSummarySent", body.actor, item.title, summary.subject);
      return { session: item, message: summary };
    },

    createLiveSessionFollowUpTask(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      const created = task(
        body.title ?? `Follow up: ${item.title}`,
        item.host ?? "Live Comms",
        body.assignee ?? body.actor ?? "Assigned office",
        body.priority ?? (item.status === "Priority" ? "High" : "Medium"),
        body.due ?? "Tomorrow",
        "Queued"
      );
      created.linkedReport = item.linkedRecord;
      created.comments = [`Created from live session ${item.title}`];
      state.tasks.unshift(created);
      item.followUpTaskId = created.id;
      item.updatedAt = new Date().toISOString();
      record("LiveSessionFollowUpTaskCreated", body.actor, item.title, created.title);
      return { session: item, task: created };
    },

    scheduleLiveSession(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      const created = calendarEvent(
        body.title ?? `Scheduled: ${item.title}`,
        "Meeting",
        item.host ?? body.actor ?? "Live Comms",
        body.date ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        body.priority ?? (item.status === "Priority" ? "High" : "Medium"),
        "Scheduled"
      );
      created.linkedReport = item.linkedRecord;
      created.agenda = body.agenda ?? item.purpose;
      state.calendarEvents.unshift(created);
      item.calendarEventId = created.id;
      item.updatedAt = new Date().toISOString();
      record("LiveSessionScheduled", body.actor, item.title, created.date);
      return { session: item, calendarEvent: created };
    },

    buildLiveSessionPacket(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      const packet = documentRecord(
        body.name ?? `${item.title} meeting packet.pdf`,
        "Live communication packet",
        "Live Comms",
        item.host ?? body.actor ?? "Live Comms",
        "PDF",
        "Archived"
      );
      packet.linkedReport = item.linkedRecord;
      packet.extractedText = [
        `Session: ${item.title}`,
        `Type: ${item.sessionType}`,
        `Route: ${item.route}`,
        `Purpose: ${item.purpose}`,
        `Notes: ${(item.notes ?? []).join("; ") || "No notes recorded"}`,
        `Decisions: ${(item.decisions ?? []).map((decision) => decision.text ?? decision).join("; ") || "No decisions recorded"}`,
        `Transcript: ${(item.transcript ?? []).map((entry) => `${entry.author}: ${entry.body}`).join("; ") || "No transcript messages"}`,
        `Voice transcript: ${item.voiceTranscript ?? "No voice transcript attached"}`,
        `Recording: ${item.recordingStatus ?? "Not recorded"}`,
        `Files: ${(item.files ?? []).join(", ") || "No files attached"}`
      ].join("\n");
      packet.custodian = body.actor;
      packet.chainHash = `live-${item.id}-${Date.now()}`;
      state.documents.unshift(packet);
      item.packetDocumentId = packet.id;
      item.packetBuiltAt = new Date().toISOString();
      item.updatedAt = item.packetBuiltAt;
      record("LiveSessionPacketBuilt", body.actor, item.title, packet.name);
      return { session: item, document: packet };
    },

    archiveLiveSession(id, body) {
      const item = findById(state.liveSessions ?? [], id);
      item.archived = true;
      item.archiveReason = body.reason ?? "Session closed and archived";
      item.status = "Archived";
      item.updatedAt = new Date().toISOString();
      record("LiveSessionArchived", body.actor, item.title, item.archiveReason);
      return item;
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

    updateMessageRoute(id, body) {
      const item = findById(state.messages, id);
      item.route = body.route ?? "Current station -> Supervising authority";
      record("EmailRouteUpdated", body.actor, item.subject, item.route);
      return item;
    },

    updateMessagePriority(id, body) {
      const item = findById(state.messages, id);
      item.priority = body.priority ?? "High";
      record("EmailPriorityUpdated", body.actor, item.subject, item.priority);
      return item;
    },

    escalateMessage(id, body) {
      const item = findById(state.messages, id);
      item.status = "Escalated";
      item.priority = "Critical";
      record("EmailEscalated", body.actor, item.subject, body.reason ?? "Escalated from ChurchMail");
      return item;
    },

    approveMessage(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.messages, id);
      item.status = "Approved";
      record("EmailApproved", body.actor, item.subject, "Governance communication approved");
      return item;
    },

    archiveMessage(id, body) {
      const item = findById(state.messages, id);
      item.archived = true;
      record("EmailArchived", body.actor, item.subject, body.reason ?? "Message archived");
      return item;
    },

    watchMessage(id, body) {
      const item = findById(state.messages, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      record("EmailWatcherAdded", body.actor, item.subject, watcher);
      return item;
    },

    duplicateMessage(id, body) {
      const item = findById(state.messages, id);
      const created = message(item.kind, body.subject ?? `${item.subject} follow-up`, body.from ?? item.from, "Queued", item.files);
      created.route = item.route;
      created.priority = item.priority;
      state.messages.unshift(created);
      record("EmailDuplicated", body.actor, item.subject, created.subject);
      return created;
    },

    bulkApproveMessages(body) {
      requirePermission(body.actor, "canApprove");
      const ids = body.ids?.length ? body.ids : state.messages.filter((item) => item.status !== "Approved").slice(0, 3).map((item) => item.id);
      const updated = state.messages.filter((item) => ids.includes(item.id)).map((item) => {
        item.status = "Approved";
        return item;
      });
      record("EmailsBulkApproved", body.actor, "ChurchMail", `${updated.length} messages approved`);
      return { count: updated.length, updated };
    },

    messageDigest() {
      const ready = state.messages.filter((item) => item.status === "Ready");
      const review = state.messages.filter((item) => item.status === "In Review");
      const escalated = state.messages.filter((item) => item.status === "Escalated");
      const approved = state.messages.filter((item) => item.status === "Approved");
      const archived = state.messages.filter((item) => item.archived);
      const watched = state.messages.filter((item) => item.watchers?.length);
      return {
        generatedAt: new Date().toISOString(),
        total: state.messages.length,
        ready: ready.length,
        review: review.length,
        escalated: escalated.length,
        approved: approved.length,
        archived: archived.length,
        watched: watched.length,
        nextMessage: escalated[0]?.subject ?? review[0]?.subject ?? ready[0]?.subject ?? state.messages[0]?.subject ?? "No messages"
      };
    },

    createReport(body) {
      const created = report(body.name, body.owner ?? body.actor, body.path, body.due ?? "Draft", body.state ?? "Ready", body.score ?? 15, {
        type: body.type,
        period: body.period,
        routingStage: body.routingStage ?? "Drafting",
        evidenceStatus: body.evidenceStatus,
        templateId: body.templateId,
        preparedBy: body.preparedBy,
        attestation: body.attestation,
        approvalLimit: body.approvalLimit,
        reportFields: body.reportFields,
        templateChecklist: body.templateChecklist
      });
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

    updateTaskDue(id, body) {
      const item = findById(state.tasks, id);
      item.due = body.due ?? item.due;
      record("TaskDueUpdated", body.actor, item.title, item.due);
      return item;
    },

    updateTaskOwner(id, body) {
      const item = findById(state.tasks, id);
      item.owner = body.owner ?? body.actor ?? item.owner;
      record("TaskOwnerUpdated", body.actor, item.title, item.owner);
      return item;
    },

    blockTask(id, body) {
      const item = findById(state.tasks, id);
      item.status = "Blocked";
      item.blocker = body.reason ?? "Blocked from task center";
      record("TaskBlocked", body.actor, item.title, item.blocker);
      return item;
    },

    unblockTask(id, body) {
      const item = findById(state.tasks, id);
      item.status = "In Progress";
      item.blocker = undefined;
      item.unblockReason = body.reason ?? "Blocker cleared";
      record("TaskUnblocked", body.actor, item.title, item.unblockReason);
      return item;
    },

    watchTask(id, body) {
      const item = findById(state.tasks, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      record("TaskWatcherAdded", body.actor, item.title, watcher);
      return item;
    },

    addTaskDependency(id, body) {
      const item = findById(state.tasks, id);
      const dependency = body.dependency ?? "Supervisory input required";
      item.dependencies = Array.from(new Set([...(item.dependencies ?? []), dependency]));
      record("TaskDependencyAdded", body.actor, item.title, dependency);
      return item;
    },

    requestTaskApproval(id, body) {
      const item = findById(state.tasks, id);
      item.approvalRequired = true;
      item.approvalRoute = body.route ?? `${item.owner} -> Delegated Authority`;
      item.status = item.status === "Complete" ? item.status : "In Progress";
      record("TaskApprovalRequested", body.actor, item.title, item.approvalRoute);
      return item;
    },

    updateTaskSla(id, body) {
      const item = findById(state.tasks, id);
      item.sla = body.sla ?? "24h";
      item.slaStatus = body.status ?? (item.due === "Overdue" ? "Breached" : "On Track");
      record("TaskSlaUpdated", body.actor, item.title, `${item.sla} ${item.slaStatus}`);
      return item;
    },

    attachTaskEvidence(id, body) {
      const item = findById(state.tasks, id);
      item.evidence = body.evidence ?? "Evidence packet attached";
      item.evidenceAt = new Date().toISOString();
      record("TaskEvidenceAttached", body.actor, item.title, item.evidence);
      return item;
    },

    handoffTask(id, body) {
      const item = findById(state.tasks, id);
      item.handoffTo = body.to ?? item.assignee;
      item.assignee = item.handoffTo;
      item.handoffNote = body.note ?? "Task handed off";
      record("TaskHandedOff", body.actor, item.title, item.handoffTo);
      return item;
    },

    escalateTask(id, body) {
      const item = findById(state.tasks, id);
      item.escalated = true;
      item.escalationReason = body.reason ?? "Task escalated";
      item.priority = body.priority ?? (item.priority === "Critical" ? "Critical" : "High");
      record("TaskEscalated", body.actor, item.title, item.escalationReason);
      return item;
    },

    commentTask(id, body) {
      const item = findById(state.tasks, id);
      const comment = body.comment ?? "Task note added";
      item.comments = [...(item.comments ?? []), `${body.actor}: ${comment}`];
      record("TaskCommentAdded", body.actor, item.title, comment);
      return item;
    },

    addTaskCheckpoint(id, body) {
      const item = findById(state.tasks, id);
      const checkpoint = body.checkpoint ?? "Checkpoint recorded";
      item.checkpoints = [...(item.checkpoints ?? []), checkpoint];
      record("TaskCheckpointAdded", body.actor, item.title, checkpoint);
      return item;
    },

    scheduleTask(id, body) {
      const item = findById(state.tasks, id);
      item.scheduledFor = body.scheduledFor ?? "Tomorrow";
      item.due = body.due ?? item.due;
      record("TaskScheduled", body.actor, item.title, item.scheduledFor);
      return item;
    },

    dispatchTask(id, body) {
      const item = findById(state.tasks, id);
      item.dispatchTeam = body.team ?? "Field operations";
      item.dispatchLocation = body.location ?? "Assigned station";
      item.status = item.status === "Complete" ? item.status : "In Progress";
      record("TaskDispatched", body.actor, item.title, `${item.dispatchTeam} -> ${item.dispatchLocation}`);
      return item;
    },

    logTaskTime(id, body) {
      const item = findById(state.tasks, id);
      const hours = body.hours ?? 1;
      item.timeHours = (item.timeHours ?? 0) + hours;
      record("TaskTimeLogged", body.actor, item.title, `${hours} hours`);
      return item;
    },

    qaReviewTask(id, body) {
      const item = findById(state.tasks, id);
      item.qaStatus = body.status ?? "Passed";
      item.qaReviewer = body.reviewer ?? body.actor;
      record("TaskQaReviewed", body.actor, item.title, item.qaStatus);
      return item;
    },

    acceptTaskRisk(id, body) {
      const item = findById(state.tasks, id);
      item.riskAccepted = true;
      item.riskReason = body.reason ?? "Risk accepted by station authority";
      record("TaskRiskAccepted", body.actor, item.title, item.riskReason);
      return item;
    },

    saveTaskTemplate(id, body) {
      const item = findById(state.tasks, id);
      item.templateName = body.templateName ?? `${item.title} template`;
      item.templateSaved = true;
      record("TaskTemplateSaved", body.actor, item.title, item.templateName);
      return item;
    },

    linkTaskReport(id, body) {
      const item = findById(state.tasks, id);
      item.linkedReport = body.reportId ?? "report-follow-up";
      record("TaskReportLinked", body.actor, item.title, item.linkedReport);
      return item;
    },

    linkTaskApproval(id, body) {
      const item = findById(state.tasks, id);
      item.linkedApproval = body.approvalId ?? "approval-follow-up";
      record("TaskApprovalLinked", body.actor, item.title, item.linkedApproval);
      return item;
    },

    archiveTask(id, body) {
      const item = findById(state.tasks, id);
      item.archived = true;
      item.archiveReason = body.reason ?? "Task archived";
      record("TaskArchived", body.actor, item.title, item.archiveReason);
      return item;
    },

    duplicateTask(id, body) {
      const item = findById(state.tasks, id);
      const created = task(body.title ?? `${item.title} follow-up`, item.owner, body.assignee ?? item.assignee, item.priority, body.due ?? item.due, "Queued");
      state.tasks.unshift(created);
      record("TaskDuplicated", body.actor, item.title, created.title);
      return created;
    },

    bulkCompleteTasks(body) {
      const ids = body.ids?.length ? body.ids : state.tasks.filter((item) => item.status !== "Complete").slice(0, 3).map((item) => item.id);
      const updated = state.tasks.filter((item) => ids.includes(item.id)).map((item) => {
        item.status = "Complete";
        return item;
      });
      record("TasksBulkCompleted", body.actor, "Task center", `${updated.length} tasks completed`);
      return { count: updated.length, updated };
    },

    bulkEscalateTasks(body) {
      const ids = body.ids?.length ? body.ids : state.tasks.filter((item) => item.status !== "Complete").slice(0, 3).map((item) => item.id);
      const updated = state.tasks.filter((item) => ids.includes(item.id)).map((item) => {
        item.escalated = true;
        item.escalationReason = body.reason ?? "Bulk escalated from task center";
        item.priority = item.priority === "Critical" ? "Critical" : "High";
        return item;
      });
      record("TasksBulkEscalated", body.actor, "Task center", `${updated.length} tasks escalated`);
      return { count: updated.length, updated };
    },

    bulkScheduleTasks(body) {
      const ids = body.ids?.length ? body.ids : state.tasks.filter((item) => item.status !== "Complete").slice(0, 3).map((item) => item.id);
      const updated = state.tasks.filter((item) => ids.includes(item.id)).map((item) => {
        item.scheduledFor = body.scheduledFor ?? "Tomorrow";
        return item;
      });
      record("TasksBulkScheduled", body.actor, "Task center", `${updated.length} tasks scheduled`);
      return { count: updated.length, updated };
    },

    taskDigest() {
      const activeTasks = state.tasks.filter((item) => !item.archived);
      const open = activeTasks.filter((item) => item.status !== "Complete");
      const blocked = open.filter((item) => item.status === "Blocked");
      const critical = open.filter((item) => item.priority === "Critical");
      const watched = activeTasks.filter((item) => item.watchers?.length);
      const escalated = open.filter((item) => item.escalated);
      const dependencies = activeTasks.filter((item) => item.dependencies?.length);
      const approvals = activeTasks.filter((item) => item.approvalRequired);
      const evidence = activeTasks.filter((item) => item.evidence);
      const slaBreaches = open.filter((item) => item.slaStatus === "Breached" || item.due === "Overdue");
      const scheduled = activeTasks.filter((item) => item.scheduledFor);
      const dispatched = activeTasks.filter((item) => item.dispatchTeam);
      const qaPassed = activeTasks.filter((item) => item.qaStatus === "Passed");
      const riskAccepted = activeTasks.filter((item) => item.riskAccepted);
      const templates = activeTasks.filter((item) => item.templateSaved);
      const linked = activeTasks.filter((item) => item.linkedReport || item.linkedApproval);
      const archived = state.tasks.filter((item) => item.archived);
      return {
        generatedAt: new Date().toISOString(),
        total: activeTasks.length,
        open: open.length,
        blocked: blocked.length,
        critical: critical.length,
        watched: watched.length,
        escalated: escalated.length,
        dependencies: dependencies.length,
        approvals: approvals.length,
        evidence: evidence.length,
        slaBreaches: slaBreaches.length,
        scheduled: scheduled.length,
        dispatched: dispatched.length,
        qaPassed: qaPassed.length,
        riskAccepted: riskAccepted.length,
        templates: templates.length,
        linked: linked.length,
        archived: archived.length,
        nextTask: critical[0]?.title ?? blocked[0]?.title ?? open[0]?.title ?? "No open tasks",
        owner: critical[0]?.owner ?? blocked[0]?.owner ?? open[0]?.owner ?? "None"
      };
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

    updatePolicyOwner(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.owner = body.owner ?? body.actor ?? item.owner;
      record("PolicyOwnerUpdated", body.actor, item.title, item.owner);
      return item;
    },

    updatePolicyCategory(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.category = body.category ?? item.category;
      record("PolicyCategoryUpdated", body.actor, item.title, item.category);
      return item;
    },

    updatePolicySummary(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.summary = body.summary ?? item.summary;
      record("PolicySummaryUpdated", body.actor, item.title, "Summary updated");
      return item;
    },

    bumpPolicyVersion(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      const current = Number.parseInt(String(item.version ?? "1").replace(/\D/g, ""), 10) || 1;
      item.version = body.version ?? `v${current + 1}`;
      item.status = body.status ?? "Review";
      record("PolicyVersionBumped", body.actor, item.title, item.version);
      return item;
    },

    schedulePolicyReview(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.status = "Review";
      item.reviewBy = body.reviewBy ?? "Next governance review";
      record("PolicyReviewScheduled", body.actor, item.title, item.reviewBy);
      return item;
    },

    watchPolicy(id, body) {
      const item = findById(state.policies, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      record("PolicyWatcherAdded", body.actor, item.title, watcher);
      return item;
    },

    checkPolicyCompliance(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.complianceStatus = body.status ?? "Compliant";
      item.complianceScore = body.score ?? 100;
      record("PolicyComplianceChecked", body.actor, item.title, `${item.complianceStatus} ${item.complianceScore}`);
      return item;
    },

    bindPolicyEvidence(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.evidence = body.evidence ?? "Policy evidence packet";
      record("PolicyEvidenceBound", body.actor, item.title, item.evidence);
      return item;
    },

    distributePolicy(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.distributedTo = body.audience ?? "All stations";
      item.distributedAt = new Date().toISOString();
      record("PolicyDistributed", body.actor, item.title, item.distributedTo);
      return item;
    },

    grantPolicyException(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.exceptionNote = body.reason ?? "Exception approved by governance authority";
      item.exceptionExpires = body.expires ?? "Next review";
      record("PolicyExceptionGranted", body.actor, item.title, item.exceptionNote);
      return item;
    },

    assignPolicyTraining(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.trainingAssigned = true;
      item.trainingAudience = body.audience ?? "Station administrators";
      record("PolicyTrainingAssigned", body.actor, item.title, item.trainingAudience);
      return item;
    },

    holdPolicy(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.hold = true;
      item.holdReason = body.reason ?? "Legal hold applied";
      record("PolicyHoldApplied", body.actor, item.title, item.holdReason);
      return item;
    },

    linkPolicyTask(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.linkedTask = body.taskId ?? "task-follow-up";
      record("PolicyTaskLinked", body.actor, item.title, item.linkedTask);
      return item;
    },

    linkPolicyApproval(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.linkedApproval = body.approvalId ?? "approval-follow-up";
      record("PolicyApprovalLinked", body.actor, item.title, item.linkedApproval);
      return item;
    },

    archivePolicy(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      item.archived = true;
      item.archiveReason = body.reason ?? "Policy archived";
      record("PolicyArchived", body.actor, item.title, item.archiveReason);
      return item;
    },

    duplicatePolicy(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.policies, id);
      const created = policy(body.title ?? `${item.title} revision`, body.category, item.owner, "Draft", item.summary, 0);
      created.version = "v1";
      state.policies.unshift(created);
      record("PolicyDuplicated", body.actor, item.title, created.title);
      return created;
    },

    bulkActivatePolicies(body) {
      requirePermission(body.actor, "canApprove");
      const ids = body.ids?.length ? body.ids : state.policies.filter((item) => item.status !== "Active").slice(0, 3).map((item) => item.id);
      const updated = state.policies.filter((item) => ids.includes(item.id)).map((item) => {
        item.status = "Active";
        return item;
      });
      record("PoliciesBulkActivated", body.actor, "Policy registry", `${updated.length} policies activated`);
      return { count: updated.length, updated };
    },

    bulkReviewPolicies(body) {
      requirePermission(body.actor, "canApprove");
      const ids = body.ids?.length ? body.ids : state.policies.filter((item) => item.status !== "Review").slice(0, 3).map((item) => item.id);
      const updated = state.policies.filter((item) => ids.includes(item.id)).map((item) => {
        item.status = "Review";
        item.reviewBy = body.reviewBy ?? "Next governance review";
        return item;
      });
      record("PoliciesBulkReviewed", body.actor, "Policy registry", `${updated.length} policies marked for review`);
      return { count: updated.length, updated };
    },

    policyDigest() {
      const visible = state.policies.filter((item) => !item.archived);
      const active = visible.filter((item) => item.status === "Active");
      const review = visible.filter((item) => item.status === "Review");
      const draft = visible.filter((item) => item.status === "Draft");
      const retired = visible.filter((item) => item.status === "Retired");
      const watched = visible.filter((item) => item.watchers?.length);
      const compliant = visible.filter((item) => item.complianceStatus === "Compliant");
      const evidence = visible.filter((item) => item.evidence);
      const distributed = visible.filter((item) => item.distributedTo);
      const exceptions = visible.filter((item) => item.exceptionNote);
      const training = visible.filter((item) => item.trainingAssigned);
      const holds = visible.filter((item) => item.hold);
      const linked = visible.filter((item) => item.linkedTask || item.linkedApproval);
      const archived = state.policies.filter((item) => item.archived);
      return {
        generatedAt: new Date().toISOString(),
        total: visible.length,
        active: active.length,
        review: review.length,
        draft: draft.length,
        retired: retired.length,
        watched: watched.length,
        compliant: compliant.length,
        evidence: evidence.length,
        distributed: distributed.length,
        exceptions: exceptions.length,
        training: training.length,
        holds: holds.length,
        linked: linked.length,
        archived: archived.length,
        acknowledgements: visible.reduce((total, item) => total + item.acknowledgements, 0),
        nextPolicy: review[0]?.title ?? draft[0]?.title ?? active[0]?.title ?? "No policies"
      };
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

    updateCalendarEventOwner(id, body) {
      const item = findById(state.calendarEvents, id);
      item.owner = body.owner ?? body.actor ?? item.owner;
      record("CalendarOwnerUpdated", body.actor, item.title, item.owner);
      return item;
    },

    updateCalendarEventCategory(id, body) {
      const item = findById(state.calendarEvents, id);
      item.category = body.category ?? item.category;
      record("CalendarCategoryUpdated", body.actor, item.title, item.category);
      return item;
    },

    rescheduleCalendarEvent(id, body) {
      const item = findById(state.calendarEvents, id);
      item.date = body.date ?? item.date;
      item.status = "Scheduled";
      record("CalendarEventRescheduled", body.actor, item.title, item.date);
      return item;
    },

    watchCalendarEvent(id, body) {
      const item = findById(state.calendarEvents, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      record("CalendarWatcherAdded", body.actor, item.title, watcher);
      return item;
    },

    checkInCalendarEvent(id, body) {
      const item = findById(state.calendarEvents, id);
      item.checkInStatus = body.status ?? "Checked in";
      item.checkInBy = body.by ?? body.actor;
      record("CalendarEventCheckedIn", body.actor, item.title, item.checkInStatus);
      return item;
    },

    updateCalendarVenue(id, body) {
      const item = findById(state.calendarEvents, id);
      item.venue = body.venue ?? "Main governance hall";
      record("CalendarVenueUpdated", body.actor, item.title, item.venue);
      return item;
    },

    attachCalendarAgenda(id, body) {
      const item = findById(state.calendarEvents, id);
      item.agenda = body.agenda ?? "Governance agenda attached";
      record("CalendarAgendaAttached", body.actor, item.title, item.agenda);
      return item;
    },

    logCalendarAttendance(id, body) {
      const item = findById(state.calendarEvents, id);
      item.attendance = body.count ?? 0;
      record("CalendarAttendanceLogged", body.actor, item.title, `${item.attendance} attendees`);
      return item;
    },

    sendCalendarReminder(id, body) {
      const item = findById(state.calendarEvents, id);
      item.reminderSent = true;
      item.reminderAudience = body.audience ?? "All participants";
      record("CalendarReminderSent", body.actor, item.title, item.reminderAudience);
      return item;
    },

    markCalendarReadiness(id, body) {
      const item = findById(state.calendarEvents, id);
      item.readiness = body.status ?? "Ready";
      record("CalendarReadinessMarked", body.actor, item.title, item.readiness);
      return item;
    },

    linkCalendarTask(id, body) {
      const item = findById(state.calendarEvents, id);
      item.linkedTask = body.taskId ?? "task-follow-up";
      record("CalendarTaskLinked", body.actor, item.title, item.linkedTask);
      return item;
    },

    linkCalendarReport(id, body) {
      const item = findById(state.calendarEvents, id);
      item.linkedReport = body.reportId ?? "report-follow-up";
      record("CalendarReportLinked", body.actor, item.title, item.linkedReport);
      return item;
    },

    archiveCalendarEvent(id, body) {
      const item = findById(state.calendarEvents, id);
      item.archived = true;
      item.archiveReason = body.reason ?? "Calendar item archived";
      record("CalendarEventArchived", body.actor, item.title, item.archiveReason);
      return item;
    },

    duplicateCalendarEvent(id, body) {
      const item = findById(state.calendarEvents, id);
      const created = calendarEvent(body.title ?? `${item.title} follow-up`, item.category, body.owner ?? item.owner, body.date ?? item.date, item.priority, "Scheduled");
      state.calendarEvents.unshift(created);
      record("CalendarEventDuplicated", body.actor, item.title, created.title);
      return created;
    },

    bulkCompleteCalendarEvents(body) {
      const ids = body.ids?.length ? body.ids : state.calendarEvents.filter((item) => item.status !== "Complete").slice(0, 3).map((item) => item.id);
      const updated = state.calendarEvents.filter((item) => ids.includes(item.id)).map((item) => {
        item.status = "Complete";
        return item;
      });
      record("CalendarEventsBulkCompleted", body.actor, "Governance calendar", `${updated.length} events completed`);
      return { count: updated.length, updated };
    },

    bulkRescheduleCalendarEvents(body) {
      const ids = body.ids?.length ? body.ids : state.calendarEvents.filter((item) => !item.archived && item.status !== "Complete").slice(0, 3).map((item) => item.id);
      const updated = state.calendarEvents.filter((item) => ids.includes(item.id)).map((item) => {
        item.date = body.date ?? "2026-06-14";
        item.status = "Scheduled";
        return item;
      });
      record("CalendarEventsBulkRescheduled", body.actor, "Governance calendar", `${updated.length} events rescheduled`);
      return { count: updated.length, updated };
    },

    calendarDigest() {
      const visible = state.calendarEvents.filter((item) => !item.archived);
      const scheduled = visible.filter((item) => item.status === "Scheduled");
      const atRisk = visible.filter((item) => item.status === "At Risk");
      const complete = visible.filter((item) => item.status === "Complete");
      const critical = visible.filter((item) => item.priority === "Critical" && item.status !== "Complete");
      const watched = visible.filter((item) => item.watchers?.length);
      const checkedIn = visible.filter((item) => item.checkInStatus);
      const venues = visible.filter((item) => item.venue);
      const agendas = visible.filter((item) => item.agenda);
      const attendance = visible.filter((item) => item.attendance !== undefined);
      const reminders = visible.filter((item) => item.reminderSent);
      const ready = visible.filter((item) => item.readiness === "Ready");
      const linked = visible.filter((item) => item.linkedTask || item.linkedReport);
      const archived = state.calendarEvents.filter((item) => item.archived);
      return {
        generatedAt: new Date().toISOString(),
        total: visible.length,
        scheduled: scheduled.length,
        atRisk: atRisk.length,
        complete: complete.length,
        critical: critical.length,
        watched: watched.length,
        checkedIn: checkedIn.length,
        venues: venues.length,
        agendas: agendas.length,
        attendance: attendance.length,
        reminders: reminders.length,
        ready: ready.length,
        linked: linked.length,
        archived: archived.length,
        nextEvent: atRisk[0]?.title ?? critical[0]?.title ?? scheduled[0]?.title ?? "No scheduled events",
        owner: atRisk[0]?.owner ?? critical[0]?.owner ?? scheduled[0]?.owner ?? "None"
      };
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

    verifyPersonCredentials(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.credentialStatus = body.status ?? "Verified";
      record("PersonCredentialsVerified", body.actor, item.name, item.credentialStatus);
      return item;
    },

    assignPersonTraining(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.trainingStatus = body.status ?? "Assigned";
      item.trainingTrack = body.track ?? "Governance onboarding";
      record("PersonTrainingAssigned", body.actor, item.name, item.trainingTrack);
      return item;
    },

    grantPersonStationAccess(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.stationAccess = body.station ?? item.assignedStation;
      item.accessStatus = body.status ?? "Granted";
      record("PersonStationAccessGranted", body.actor, item.name, `${item.stationAccess} ${item.accessStatus}`);
      return item;
    },

    flagPersonIncident(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.incidentFlag = body.reason ?? "Personnel review required";
      item.incidentSeverity = body.severity ?? "Medium";
      record("PersonIncidentFlagged", body.actor, item.name, item.incidentFlag);
      return item;
    },

    linkPersonTask(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.linkedTask = body.taskId ?? "task-follow-up";
      record("PersonTaskLinked", body.actor, item.name, item.linkedTask);
      return item;
    },

    reviewPerson(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.reviewStatus = body.status ?? "Reviewed";
      item.reviewNote = body.note ?? "Personnel record reviewed";
      record("PersonReviewed", body.actor, item.name, item.reviewStatus);
      return item;
    },

    archivePerson(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.personnel, id);
      item.archived = true;
      item.archiveReason = body.reason ?? "Personnel record archived";
      record("PersonArchived", body.actor, item.name, item.archiveReason);
      return item;
    },

    bulkCredentialReviewPersonnel(body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const ids = body.ids?.length ? body.ids : state.personnel.filter((item) => !item.archived && item.status !== "Inactive").slice(0, 3).map((item) => item.id);
      const updated = state.personnel.filter((item) => ids.includes(item.id)).map((item) => {
        item.credentialStatus = body.status ?? "Review required";
        return item;
      });
      record("PersonnelBulkCredentialReview", body.actor, "Personnel directory", `${updated.length} records queued for credential review`);
      return { count: updated.length, updated };
    },

    personnelDigest() {
      const visible = state.personnel.filter((item) => !item.archived);
      const active = visible.filter((item) => item.status === "Active" || item.status === "Assigned");
      const transferPending = visible.filter((item) => item.status === "Transfer Pending");
      const onboarding = visible.filter((item) => item.status === "Onboarding");
      const inactive = visible.filter((item) => item.status === "Inactive" || item.status === "On Leave");
      const verified = visible.filter((item) => item.credentialStatus === "Verified");
      const training = visible.filter((item) => item.trainingStatus);
      const accessGranted = visible.filter((item) => item.accessStatus === "Granted");
      const incidents = visible.filter((item) => item.incidentFlag);
      const linked = visible.filter((item) => item.linkedTask);
      const reviewed = visible.filter((item) => item.reviewStatus);
      const archived = state.personnel.filter((item) => item.archived);
      return {
        generatedAt: new Date().toISOString(),
        active: active.length,
        transferPending: transferPending.length,
        onboarding: onboarding.length,
        inactive: inactive.length,
        verified: verified.length,
        training: training.length,
        accessGranted: accessGranted.length,
        incidents: incidents.length,
        linked: linked.length,
        reviewed: reviewed.length,
        archived: archived.length,
        primaryStation: transferPending[0]?.assignedStation ?? active[0]?.assignedStation ?? "No active station",
        nextPerson: transferPending[0]?.name ?? onboarding[0]?.name ?? active[0]?.name ?? "No personnel record"
      };
    },

    submitReport(id, body) {
      const item = findById(state.reports, id);
      item.state = "Approved";
      item.score = 100;
      item.routingStage = "Archived upward";
      item.submittedAt = new Date().toISOString();
      item.approvedBy = body.actor;
      record("ReportSubmitted", body.actor, item.name, "Forwarded upward");
      return item;
    },

    requestReportCorrection(id, body) {
      const item = findById(state.reports, id);
      item.state = "Correction Requested";
      item.score = Math.min(item.score, 45);
      item.routingStage = "Correction cycle";
      item.correctionReason = body.reason ?? "Correction requested";
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
      if (item.score >= 80 && item.state !== "Approved") item.routingStage = "Ready for supervisory review";
      record("ReportScoreUpdated", body.actor, item.name, `${item.score}% complete`);
      return item;
    },

    updateReportOwner(id, body) {
      const item = findById(state.reports, id);
      item.owner = body.owner ?? body.actor ?? item.owner;
      record("ReportOwnerUpdated", body.actor, item.name, item.owner);
      return item;
    },

    updateReportPath(id, body) {
      const item = findById(state.reports, id);
      item.path = body.path ?? item.path;
      item.routingStage = "Route recalculated";
      record("ReportPathUpdated", body.actor, item.name, item.path);
      return item;
    },

    updateReportDetails(id, body) {
      const item = findById(state.reports, id);
      if (body.preparedBy !== undefined) item.preparedBy = body.preparedBy;
      if (body.attestation !== undefined) item.attestation = body.attestation;
      if (body.approvalLimit !== undefined) item.approvalLimit = body.approvalLimit;
      if (body.reportFields !== undefined) item.reportFields = body.reportFields;
      if (body.templateChecklist !== undefined) item.templateChecklist = body.templateChecklist;
      const total = Object.keys(item.reportFields ?? {}).length;
      const completed = Object.values(item.reportFields ?? {}).filter((value) => String(value ?? "").trim().length > 0).length;
      item.score = Math.max(item.score ?? 0, total ? Math.min(92, Math.round((completed / total) * 100)) : item.score ?? 0);
      item.routingStage = body.routingStage ?? "Report details updated";
      item.reviewNote = body.note ?? `${completed}/${total} report sections completed`;
      record("ReportDetailsUpdated", body.actor, item.name, item.reviewNote);
      return item;
    },

    markReportEvidence(id, body) {
      const item = findById(state.reports, id);
      item.evidenceStatus = body.evidenceStatus ?? "Evidence attached";
      item.score = Math.max(item.score, 70);
      item.routingStage = "Evidence review";
      record("ReportEvidenceUpdated", body.actor, item.name, item.evidenceStatus);
      return item;
    },

    reviewReport(id, body) {
      const item = findById(state.reports, id);
      item.state = "In Review";
      item.reviewNote = body.note ?? "Supervisory review opened";
      item.routingStage = "Supervisory review";
      record("ReportReviewStarted", body.actor, item.name, item.reviewNote);
      return item;
    },

    verifyReport(id, body) {
      const item = findById(state.reports, id);
      item.verified = true;
      item.state = body.state ?? "Approved";
      item.score = Math.max(item.score, 95);
      item.routingStage = "Verified archive";
      item.evidenceStatus = "Evidence verified";
      item.approvedBy = body.actor;
      record("ReportVerified", body.actor, item.name, "Report verified");
      return item;
    },

    buildReportGovernancePacket(id, body) {
      const item = findById(state.reports, id);
      item.evidenceStatus = "Evidence packet bundled";
      item.routingStage = "Governance packet assembled";
      item.reviewNote = body.note ?? "Report packet assembled for approval, archive, and audit follow-through";
      item.score = Math.max(item.score, 88);
      if (item.state !== "Approved") item.state = "In Review";

      const packetApproval = approval(
        body.approvalRequest ?? `${item.name} approval packet`,
        body.route ?? item.path,
        body.limit ?? "Delegated authority review",
        "Validation",
        "0/3"
      );
      packetApproval.linkedReport = item.id;
      packetApproval.delegate = body.delegate ?? item.owner;
      state.approvals.unshift(packetApproval);

      const packetDocument = documentRecord(
        `${item.name} governance packet.pdf`,
        "Report governance packet",
        "Report",
        item.owner,
        "PDF",
        "Archived"
      );
      packetDocument.linkedReport = item.id;
      packetDocument.linkedApproval = packetApproval.id;
      packetDocument.verified = false;
      state.documents.unshift(packetDocument);

      const shouldEscalate = item.due === "Overdue" || item.state === "Escalated" || body.escalate;
      const packetEscalation = shouldEscalate
        ? escalation("Report", item.name, body.reason ?? "Governance packet requires supervisory attention", item.due === "Overdue" ? "Critical" : "High", item.owner)
        : null;
      if (packetEscalation) {
        packetEscalation.linkedReport = item.id;
        packetEscalation.linkedApproval = packetApproval.id;
        state.escalations.unshift(packetEscalation);
      }

      record("ReportGovernancePacketBuilt", body.actor, item.name, `${packetApproval.request} / ${packetDocument.name}`);
      return { report: item, approval: packetApproval, document: packetDocument, escalation: packetEscalation };
    },

    watchReport(id, body) {
      const item = findById(state.reports, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      record("ReportWatcherAdded", body.actor, item.name, watcher);
      return item;
    },

    duplicateReport(id, body) {
      const item = findById(state.reports, id);
      const created = report(body.name ?? `${item.name} follow-up`, item.owner, body.path ?? item.path, body.due ?? item.due, "Ready", Math.min(item.score, 35), {
        type: item.type,
        period: item.period,
        routingStage: "Drafting",
        evidenceStatus: item.evidenceStatus
      });
      state.reports.unshift(created);
      record("ReportDuplicated", body.actor, item.name, created.name);
      return created;
    },

    archiveReport(id, body) {
      const item = findById(state.reports, id);
      item.archived = true;
      record("ReportArchived", body.actor, item.name, body.reason ?? "Report archived");
      return item;
    },

    reportDigest() {
      const open = state.reports.filter((item) => item.state !== "Approved");
      const overdue = state.reports.filter((item) => item.due === "Overdue");
      const correction = state.reports.filter((item) => item.state === "Correction Requested");
      const verified = state.reports.filter((item) => item.verified);
      const watched = state.reports.filter((item) => item.watchers?.length);
      const archived = state.reports.filter((item) => item.archived);
      const evidenceReady = state.reports.filter((item) => /attached|verified/i.test(item.evidenceStatus ?? ""));
      const submitted = state.reports.filter((item) => item.submittedAt || item.state === "Approved");
      const approvalReady = state.reports.filter((item) => item.score >= 80 && item.state !== "Approved");
      const types = state.reports.reduce((acc, item) => {
        const key = item.type ?? "Administrative";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      return {
        generatedAt: new Date().toISOString(),
        total: state.reports.length,
        open: open.length,
        overdue: overdue.length,
        correction: correction.length,
        verified: verified.length,
        watched: watched.length,
        archived: archived.length,
        evidenceReady: evidenceReady.length,
        submitted: submitted.length,
        approvalReady: approvalReady.length,
        types,
        averageScore: state.reports.length ? Math.round(state.reports.reduce((sum, item) => sum + item.score, 0) / state.reports.length) : 100,
        nextReport: overdue[0]?.name ?? correction[0]?.name ?? open[0]?.name ?? state.reports[0]?.name ?? "No reports"
      };
    },

    bulkSubmitReports(body) {
      const ids = Array.isArray(body.ids) && body.ids.length ? body.ids : state.reports.filter((item) => item.state !== "Approved").map((item) => item.id);
      const updated = ids.map((id) => {
        const item = findById(state.reports, id);
        item.state = "Approved";
        item.score = 100;
        item.routingStage = "Archived upward";
        item.submittedAt = new Date().toISOString();
        item.approvedBy = body.actor;
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
        item.routingStage = "Correction cycle";
        item.correctionReason = body.reason ?? "Bulk correction from reporting center";
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

    updateApprovalLimit(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.limit = body.limit ?? item.limit;
      record("ApprovalLimitUpdated", body.actor, item.request, item.limit);
      return item;
    },

    delegateApproval(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.delegate = body.delegate ?? body.actor;
      item.state = "Delegated";
      record("ApprovalDelegated", body.actor, item.request, item.delegate);
      return item;
    },

    holdApproval(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.state = "On Hold";
      item.holdReason = body.reason ?? "Approval placed on hold";
      record("ApprovalHeld", body.actor, item.request, item.holdReason);
      return item;
    },

    releaseApprovalHold(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.state = body.state ?? "Validation";
      item.holdReason = "";
      record("ApprovalHoldReleased", body.actor, item.request, item.state);
      return item;
    },

    executeApproval(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.state = "Approved";
      item.signatures = "complete";
      item.executionStatus = body.status ?? "Executed";
      item.executedAt = new Date().toISOString();
      item.executedBy = body.actor;
      item.auditTrail = [
        ...(item.auditTrail ?? []),
        `${item.executedAt}: ${item.executionStatus} by ${body.actor}`
      ];

      const authorization = documentRecord(
        `${item.request} authorization record.pdf`,
        "Approval authorization",
        "Approval",
        body.actor,
        "PDF",
        "Archived"
      );
      authorization.linkedApproval = item.id;
      if (item.linkedReport) authorization.linkedReport = item.linkedReport;
      authorization.verified = true;
      authorization.verificationNote = "Approval execution archived";
      state.documents.unshift(authorization);

      record("ApprovalExecuted", body.actor, item.request, authorization.name);
      return { approval: item, document: authorization };
    },

    watchApproval(id, body) {
      const item = findById(state.approvals, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      record("ApprovalWatcherAdded", body.actor, item.request, watcher);
      return item;
    },

    duplicateApproval(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      const created = approval(body.request ?? `${item.request} follow-up`, body.route ?? item.route, body.limit ?? item.limit, "Validation", "0/2");
      state.approvals.unshift(created);
      record("ApprovalDuplicated", body.actor, item.request, created.request);
      return created;
    },

    archiveApproval(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.approvals, id);
      item.archived = true;
      record("ApprovalArchived", body.actor, item.request, body.reason ?? "Approval archived");
      return item;
    },

    bulkSignApprovals(body) {
      requirePermission(body.actor, "canApprove");
      const ids = Array.isArray(body.ids) && body.ids.length ? body.ids : state.approvals.filter((item) => item.state !== "Approved" && item.state !== "Rejected").slice(0, 3).map((item) => item.id);
      const updated = ids.map((id) => {
        const item = findById(state.approvals, id);
        item.signatures = body.signatures ?? "1/2";
        item.state = "Signature";
        return item;
      });
      record("ApprovalsBulkSigned", body.actor, "Approval engine", `${updated.length} approvals signed`);
      return { updated, count: updated.length };
    },

    approvalDigest() {
      const open = state.approvals.filter((item) => item.state !== "Approved" && item.state !== "Rejected");
      const delegated = state.approvals.filter((item) => item.state === "Delegated");
      const held = state.approvals.filter((item) => item.state === "On Hold");
      const signed = state.approvals.filter((item) => /signature|complete|\d+\/\d+/i.test(item.signatures));
      const watched = state.approvals.filter((item) => item.watchers?.length);
      const archived = state.approvals.filter((item) => item.archived);
      const executed = state.approvals.filter((item) => item.executionStatus === "Executed");
      const linked = state.approvals.filter((item) => item.linkedReport || item.linkedTask);
      return {
        generatedAt: new Date().toISOString(),
        total: state.approvals.length,
        open: open.length,
        delegated: delegated.length,
        held: held.length,
        signed: signed.length,
        watched: watched.length,
        archived: archived.length,
        executed: executed.length,
        linked: linked.length,
        nextApproval: held[0]?.request ?? delegated[0]?.request ?? open[0]?.request ?? state.approvals[0]?.request ?? "No approvals"
      };
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

    attachEscalationEvidence(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.evidence = body.evidence ?? "Escalation evidence packet";
      record("EscalationEvidenceAttached", body.actor, item.item, item.evidence);
      return item;
    },

    commentEscalation(id, body) {
      const item = findById(state.escalations, id);
      const comment = body.comment ?? "Escalation reviewed";
      item.comments = [...(item.comments ?? []), `${body.actor ?? "System"}: ${comment}`];
      record("EscalationCommentAdded", body.actor, item.item, comment);
      return item;
    },

    noteEscalationResolution(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.resolutionNote = body.note ?? "Resolution note recorded";
      record("EscalationResolutionNoted", body.actor, item.item, item.resolutionNote);
      return item;
    },

    updateEscalationDue(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.due = body.due ?? "Today";
      record("EscalationDueUpdated", body.actor, item.item, item.due);
      return item;
    },

    linkEscalationTask(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.linkedTask = body.taskId ?? "task-follow-up";
      record("EscalationTaskLinked", body.actor, item.item, item.linkedTask);
      return item;
    },

    linkEscalationReport(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.linkedReport = body.reportId ?? "report-follow-up";
      record("EscalationReportLinked", body.actor, item.item, item.linkedReport);
      return item;
    },

    linkEscalationApproval(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.linkedApproval = body.approvalId ?? "approval-follow-up";
      record("EscalationApprovalLinked", body.actor, item.item, item.linkedApproval);
      return item;
    },

    scoreEscalationImpact(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.impactScore = body.score ?? 90;
      item.impactSummary = body.summary ?? "High governance impact";
      record("EscalationImpactScored", body.actor, item.item, `${item.impactScore}`);
      return item;
    },

    archiveEscalation(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.escalations, id);
      item.archived = true;
      item.archiveReason = body.reason ?? "Escalation archived";
      record("EscalationArchived", body.actor, item.item, item.archiveReason);
      return item;
    },

    bulkResolveEscalations(body) {
      requirePermission(body.actor, "canApprove");
      const ids = body.ids?.length ? body.ids : state.escalations.filter((item) => !item.archived && item.status !== "Resolved").slice(0, 3).map((item) => item.id);
      const updated = state.escalations.filter((item) => ids.includes(item.id)).map((item) => {
        item.status = "Resolved";
        item.resolutionNote = body.note ?? "Bulk resolved";
        return item;
      });
      record("EscalationsBulkResolved", body.actor, "Escalation engine", `${updated.length} escalations resolved`);
      return { count: updated.length, updated };
    },

    escalationDigest() {
      const visible = state.escalations.filter((item) => !item.archived);
      const open = visible.filter((item) => item.status !== "Resolved" && item.status !== "Merged");
      const critical = open.filter((item) => item.severity === "Critical");
      const watched = open.filter((item) => item.watchers?.length);
      const evidence = visible.filter((item) => item.evidence);
      const comments = visible.filter((item) => item.comments?.length);
      const resolutionNotes = visible.filter((item) => item.resolutionNote);
      const due = visible.filter((item) => item.due);
      const linked = visible.filter((item) => item.linkedTask || item.linkedReport || item.linkedApproval);
      const impact = visible.filter((item) => item.impactScore !== undefined);
      const archived = state.escalations.filter((item) => item.archived);
      return {
        generatedAt: new Date().toISOString(),
        open: open.length,
        critical: critical.length,
        watched: watched.length,
        resolved: visible.filter((item) => item.status === "Resolved").length,
        evidence: evidence.length,
        comments: comments.length,
        resolutionNotes: resolutionNotes.length,
        due: due.length,
        linked: linked.length,
        impact: impact.length,
        archived: archived.length,
        primary: critical[0]?.item ?? open[0]?.item ?? "No open escalations",
        owner: critical[0]?.owner ?? open[0]?.owner ?? "None"
      };
    },

    createOffice(body) {
      requirePermission(body.actor, "canCreateOffices");
      if (state.stations.some((entry) => entry.email === body.email) || state.offices.some((entry) => entry.email === body.email)) {
        return { conflict: true, error: "Station email already exists" };
      }
      const created = office(body.name, body.email, body.level, body.department, body.supervisor, body);
      state.offices.unshift(created);
      const createdStation = station(created.email, `${created.name} Workstation`, created.level, `${created.department}, supervised by ${created.supervisor}`);
      Object.assign(createdStation, {
        nodeKind: created.nodeKind,
        parentId: created.parentId,
        parentName: created.parentName,
        permissionPreset: created.permissionPreset,
        reportingRoute: created.reportingRoute,
        workflowAccess: created.workflowAccess
      });
      state.stations.push(createdStation);
      ensureStationCredential(created.email, created.password);
      record("OfficeCreated", body.actor, created.name, `${created.level} workstation provisioned`);
      return created;
    },

    updateOfficeSupervisor(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.supervisor = body.supervisor ?? item.supervisor;
      item.parentName = body.parentName ?? body.supervisor ?? item.parentName;
      item.reportingRoute = body.reportingRoute ?? item.reportingRoute;
      const stationRecord = state.stations.find((entry) => entry.email === item.email);
      if (stationRecord) {
        stationRecord.authority = `${item.department}, supervised by ${item.supervisor}`;
        stationRecord.parentName = item.parentName;
        stationRecord.reportingRoute = item.reportingRoute;
      }
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
      const stationRecord = state.stations.find((entry) => entry.email === item.email);
      if (stationRecord) setStationPassword(stationRecord, item.password, body.actor);
      record("OfficePasswordRotated", body.actor, item.name, "Station credential rotated");
      return item;
    },

    activateOfficeStation(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      if (!state.stations.some((entry) => entry.email === item.email)) {
        const createdStation = station(item.email, `${item.name} Workstation`, item.level, `${item.department}, supervised by ${item.supervisor}`);
        Object.assign(createdStation, {
          nodeKind: item.nodeKind,
          parentId: item.parentId,
          parentName: item.parentName,
          permissionPreset: item.permissionPreset,
          reportingRoute: item.reportingRoute,
          workflowAccess: item.workflowAccess
        });
        state.stations.push(createdStation);
      }
      ensureStationCredential(item.email, item.password);
      item.status = "Active";
      record("OfficeStationActivated", body.actor, item.name, `${item.email} ready`);
      return item;
    },

    updateOfficeDepartment(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.department = body.department ?? item.department;
      const stationRecord = state.stations.find((entry) => entry.email === item.email);
      if (stationRecord) {
        stationRecord.authority = `${item.department}, supervised by ${item.supervisor}`;
        stationRecord.nodeKind = item.nodeKind;
        stationRecord.permissionPreset = item.permissionPreset;
        stationRecord.workflowAccess = item.workflowAccess;
      }
      record("OfficeDepartmentUpdated", body.actor, item.name, item.department);
      return item;
    },

    updateOfficeLevel(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.level = body.level ?? item.level;
      item.reportingRoute = body.reportingRoute ?? item.reportingRoute;
      const stationRecord = state.stations.find((entry) => entry.email === item.email);
      if (stationRecord) {
        stationRecord.level = item.level;
        stationRecord.reportingRoute = item.reportingRoute;
      }
      record("OfficeLevelUpdated", body.actor, item.name, item.level);
      return item;
    },

    verifyOfficeEmail(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.emailVerified = true;
      record("OfficeEmailVerified", body.actor, item.name, item.email);
      return item;
    },

    watchOffice(id, body) {
      const item = findById(state.offices, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      record("OfficeWatcherAdded", body.actor, item.name, watcher);
      return item;
    },

    noteOffice(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      const note = body.note ?? "Office reviewed";
      item.notes = [...(item.notes ?? []), `${body.actor ?? "System"}: ${note}`];
      record("OfficeNoteAdded", body.actor, item.name, note);
      return item;
    },

    updateOfficeCapacity(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.capacity = body.capacity ?? 12;
      record("OfficeCapacityUpdated", body.actor, item.name, `${item.capacity}`);
      return item;
    },

    reviewOfficeCompliance(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.complianceStatus = body.status ?? "Reviewed";
      record("OfficeComplianceReviewed", body.actor, item.name, item.complianceStatus);
      return item;
    },

    archiveOffice(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findById(state.offices, id);
      item.archived = true;
      item.archiveReason = body.reason ?? "Office archived";
      record("OfficeArchived", body.actor, item.name, item.archiveReason);
      return item;
    },

    bulkActivateOffices(body) {
      requirePermission(body.actor, "canCreateOffices");
      const ids = body.ids?.length ? body.ids : state.offices.filter((item) => !item.archived && item.status !== "Active").slice(0, 3).map((item) => item.id);
      const updated = state.offices.filter((item) => ids.includes(item.id)).map((item) => {
        item.status = "Active";
        return item;
      });
      record("OfficesBulkActivated", body.actor, "Office registry", `${updated.length} offices activated`);
      return { count: updated.length, updated };
    },

    officeDigest() {
      const visible = state.offices.filter((item) => !item.archived);
      return {
        generatedAt: new Date().toISOString(),
        total: visible.length,
        active: visible.filter((item) => item.status === "Active").length,
        provisioned: visible.filter((item) => item.status === "Provisioned").length,
        suspended: visible.filter((item) => item.status === "Suspended").length,
        stationIdentities: state.stations.length,
        verified: visible.filter((item) => item.emailVerified).length,
        watched: visible.filter((item) => item.watchers?.length).length,
        noted: visible.filter((item) => item.notes?.length).length,
        capacity: visible.filter((item) => item.capacity !== undefined).length,
        compliant: visible.filter((item) => item.complianceStatus).length,
        archived: state.offices.filter((item) => item.archived).length,
        nextOffice: visible.find((item) => item.status !== "Active")?.name ?? visible[0]?.name ?? "No offices"
      };
    },

    updateStationLevel(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findStationIdentity(id);
      item.level = body.level ?? item.level;
      item.status = item.status ?? "Active";
      record("StationLevelUpdated", body.actor, item.email, item.level);
      return item;
    },

    updateStationAuthority(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findStationIdentity(id);
      item.authority = body.authority ?? item.authority;
      item.status = item.status ?? "Active";
      record("StationAuthorityUpdated", body.actor, item.email, item.authority);
      return item;
    },

    verifyStation(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findStationIdentity(id);
      item.verified = true;
      item.status = "Verified";
      record("StationVerified", body.actor, item.email, body.result ?? "Station identity verified");
      return item;
    },

    watchStation(id, body) {
      const item = findStationIdentity(id);
      item.watchers = Array.from(new Set([...(item.watchers ?? []), body.watcher ?? body.actor ?? "System"]));
      record("StationWatcherAdded", body.actor, item.email, item.watchers.join(", "));
      return item;
    },

    suspendStation(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findStationIdentity(id);
      item.status = "Suspended";
      item.suspensionReason = body.reason ?? "Station suspended from hierarchy graph";
      record("StationSuspended", body.actor, item.email, item.suspensionReason);
      return item;
    },

    activateStation(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findStationIdentity(id);
      item.status = "Active";
      item.suspensionReason = undefined;
      record("StationActivated", body.actor, item.email, body.reason ?? "Station reactivated");
      return item;
    },

    mirrorStation(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findStationIdentity(id);
      const emailPrefix = item.email.split("@")[0].replace(/[^a-z0-9_]+/gi, "_");
      const emailDomain = item.email.split("@")[1] ?? "rmvi.org";
      const mirrorEmail = normalizeStationEmail(body.email ?? `${emailPrefix}.mirror.${Date.now().toString(36)}@${emailDomain}`);
      const created = station(mirrorEmail, body.title ?? `${item.title} Mirror`, item.level, body.authority ?? `${item.authority} | Mirror station`);
      created.status = "Provisioned";
      created.mirrorOf = item.id;
      state.stations.push(created);
      ensureStationCredential(created.email, body.password ?? `gcos-${emailPrefix}-mirror`);
      record("StationMirrorCreated", body.actor, created.email, `Mirror of ${item.email}`);
      return created;
    },

    rotateStationCredential(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findStationIdentity(id);
      const temporaryPassword = body.password ?? `gcos-${item.email.split("@")[0].replace(/[^a-z0-9]+/gi, "-")}-${Date.now().toString(36)}`;
      return setStationPassword(item, temporaryPassword, body.actor);
    },

    forceStationPasswordReset(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const item = findStationIdentity(id);
      const temporaryPassword = body.password ?? `reset-${Date.now().toString(36)}`;
      return setStationPassword(item, temporaryPassword, body.actor, "StationCredentialResetForced");
    },

    requireStationMfa(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const { station: item, credential } = credentialForStation(id);
      credential.mfaRequired = true;
      credential.updatedAt = new Date().toISOString();
      credential.updatedBy = body.actor;
      item.mfaRequired = true;
      record("StationMfaRequired", body.actor, item.email, body.reason ?? "Station MFA required");
      return { station: item, credential: publicCredential(credential) };
    },

    lockStationCredential(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const { station: item, credential } = credentialForStation(id);
      credential.status = "Locked";
      credential.lockedUntil = body.lockedUntil ?? new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString();
      credential.lockReason = body.reason ?? "Station locked by administrator";
      credential.updatedAt = new Date().toISOString();
      credential.updatedBy = body.actor;
      item.credentialStatus = "Locked";
      record("StationCredentialLocked", body.actor, item.email, credential.lockReason);
      return { station: item, credential: publicCredential(credential) };
    },

    unlockStationCredential(id, body) {
      requirePermission(body.actor, "canCreateOffices");
      const { station: item, credential } = credentialForStation(id);
      credential.status = "Active";
      credential.lockedUntil = undefined;
      credential.failedAttempts = 0;
      credential.updatedAt = new Date().toISOString();
      credential.updatedBy = body.actor;
      item.credentialStatus = credential.forceReset ? "Reset required" : "Active";
      record("StationCredentialUnlocked", body.actor, item.email, body.reason ?? "Station credential unlocked");
      return { station: item, credential: publicCredential(credential) };
    },

    stationAuthRegistry() {
      ensureAuthCredentials();
      return Object.values(state.authCredentials).map(publicCredential).sort((a, b) => a.email.localeCompare(b.email));
    },

    stationAuthDigest() {
      const registry = this.stationAuthRegistry();
      return {
        generatedAt: new Date().toISOString(),
        total: registry.length,
        locked: registry.filter((item) => item.status === "Locked" || (item.lockedUntil && Date.parse(item.lockedUntil) > Date.now())).length,
        mfaRequired: registry.filter((item) => item.mfaRequired).length,
        resetRequired: registry.filter((item) => item.forceReset).length,
        failedAttempts: registry.reduce((sum, item) => sum + (item.failedAttempts ?? 0), 0),
        nextCredential: registry.find((item) => item.status === "Locked")?.email ?? registry.find((item) => item.forceReset)?.email ?? registry[0]?.email ?? "No credentials"
      };
    },

    bulkVerifyStations(body) {
      requirePermission(body.actor, "canCreateOffices");
      const ids = body.ids?.length ? body.ids : state.stations.slice(0, 3).map((item) => item.id);
      const decoded = ids.map((id) => decodeURIComponent(id));
      const updated = state.stations.filter((item) => decoded.includes(item.id) || decoded.includes(item.email)).map((item) => {
        item.verified = true;
        item.status = "Verified";
        return item;
      });
      record("StationsBulkVerified", body.actor, "Hierarchy graph", `${updated.length} stations verified`);
      return { count: updated.length, updated };
    },

    hierarchyDigest() {
      const byLevel = state.stations.reduce((counts, item) => {
        counts[item.level] = (counts[item.level] ?? 0) + 1;
        return counts;
      }, {});
      const topLevel = Object.entries(byLevel).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No levels";
      return {
        generatedAt: new Date().toISOString(),
        stations: state.stations.length,
        levels: Object.keys(byLevel).length,
        verified: state.stations.filter((item) => item.verified || item.status === "Verified").length,
        suspended: state.stations.filter((item) => item.status === "Suspended").length,
        watched: state.stations.filter((item) => item.watchers?.length).length,
        mirrors: state.stations.filter((item) => item.mirrorOf).length,
        topLevel,
        nextStation: state.stations.find((item) => !item.verified)?.email ?? state.stations[0]?.email ?? "No stations"
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

    recordTransferLetter(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.letterStatus = body.status ?? "Received";
      item.letterRef = body.reference ?? "Mission letter received";
      record("TransferLetterRecorded", body.actor, item.person, item.letterRef);
      return item;
    },

    scheduleTransfer(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.scheduledFor = body.scheduledFor ?? "Tomorrow";
      record("TransferScheduled", body.actor, item.person, item.scheduledFor);
      return item;
    },

    noteTransfer(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      const note = body.note ?? "Transfer reviewed";
      item.notes = [...(item.notes ?? []), `${body.actor ?? "System"}: ${note}`];
      record("TransferNoteAdded", body.actor, item.person, note);
      return item;
    },

    watchTransfer(id, body) {
      const item = findById(state.transfers, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      item.watchers = Array.from(new Set([...(item.watchers ?? []), watcher]));
      record("TransferWatcherAdded", body.actor, item.person, watcher);
      return item;
    },

    linkTransferPersonnel(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.personnelRecord = body.personnelId ?? state.personnel.find((person) => person.name === item.person)?.id ?? "personnel-follow-up";
      record("TransferPersonnelLinked", body.actor, item.person, item.personnelRecord);
      return item;
    },

    linkTransferTask(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.linkedTask = body.taskId ?? "task-follow-up";
      record("TransferTaskLinked", body.actor, item.person, item.linkedTask);
      return item;
    },

    linkTransferReport(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.linkedReport = body.reportId ?? "report-follow-up";
      record("TransferReportLinked", body.actor, item.person, item.linkedReport);
      return item;
    },

    archiveTransfer(id, body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const item = findById(state.transfers, id);
      item.archived = true;
      item.archiveReason = body.reason ?? "Transfer archived";
      record("TransferArchived", body.actor, item.person, item.archiveReason);
      return item;
    },

    bulkVerifyTransfers(body) {
      requirePermission(body.actor, "canExecuteTransfers");
      const ids = body.ids?.length ? body.ids : state.transfers.filter((item) => !item.archived && item.step !== "Verified").slice(0, 3).map((item) => item.id);
      const updated = state.transfers.filter((item) => ids.includes(item.id)).map((item) => {
        item.step = "Verified";
        item.risk = body.result ?? "Bulk identity verification complete";
        return item;
      });
      record("TransfersBulkVerified", body.actor, "Transfer console", `${updated.length} transfers verified`);
      return { count: updated.length, updated };
    },

    transferDigest() {
      const visible = state.transfers.filter((item) => !item.archived);
      const ready = visible.filter((item) => item.step === "New station login ready" || item.step === "Verified");
      const risky = visible.filter((item) => /risk|pending|required|review/i.test(item.risk));
      const pending = visible.filter((item) => !ready.includes(item));
      return {
        generatedAt: new Date().toISOString(),
        total: visible.length,
        ready: ready.length,
        pending: pending.length,
        risk: risky.length,
        letters: visible.filter((item) => item.letterStatus).length,
        scheduled: visible.filter((item) => item.scheduledFor).length,
        noted: visible.filter((item) => item.notes?.length).length,
        watched: visible.filter((item) => item.watchers?.length).length,
        linked: visible.filter((item) => item.personnelRecord || item.linkedTask || item.linkedReport).length,
        archived: state.transfers.filter((item) => item.archived).length,
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
      created.custodian = item.custodian;
      created.chainHash = item.chainHash;
      created.linkedReport = item.linkedReport;
      created.linkedApproval = item.linkedApproval;
      state.documents.unshift(created);
      record("DocumentDuplicated", body.actor, created.name, item.name);
      return created;
    },

    verifyDocument(id, body) {
      const item = findById(state.documents, id);
      item.verified = true;
      item.verificationNote = body.note ?? "Document integrity verified";
      record("DocumentVerified", body.actor, item.name, item.verificationNote);
      return item;
    },

    assignDocumentCustody(id, body) {
      const item = findById(state.documents, id);
      item.custodian = body.custodian ?? body.actor ?? item.owner;
      item.custodyAt = new Date().toISOString();
      record("DocumentCustodyAssigned", body.actor, item.name, item.custodian);
      return item;
    },

    updateDocumentChain(id, body) {
      const item = findById(state.documents, id);
      item.chainHash = body.chainHash ?? `sha256:${Buffer.from(`${item.id}:${item.storageKey}:${item.status}:${Date.now()}`).toString("base64url").slice(0, 32)}`;
      record("DocumentChainUpdated", body.actor, item.name, item.chainHash);
      return item;
    },

    extractDocumentText(id, body) {
      const item = findById(state.documents, id);
      item.extractedText = body.text ?? `${item.name} indexed from ${item.source} as ${item.classification}.`;
      item.extractedAt = new Date().toISOString();
      record("DocumentTextExtracted", body.actor, item.name, `${item.extractedText.length} characters indexed`);
      return item;
    },

    linkDocumentReport(id, body) {
      const item = findById(state.documents, id);
      item.linkedReport = body.reportId ?? state.reports[0]?.id ?? "report-unassigned";
      record("DocumentReportLinked", body.actor, item.name, item.linkedReport);
      return item;
    },

    linkDocumentApproval(id, body) {
      const item = findById(state.documents, id);
      item.linkedApproval = body.approvalId ?? state.approvals[0]?.id ?? "approval-unassigned";
      record("DocumentApprovalLinked", body.actor, item.name, item.linkedApproval);
      return item;
    },

    watchDocument(id, body) {
      const item = findById(state.documents, id);
      item.watchers ??= [];
      const watcher = body.watcher ?? body.actor;
      if (watcher && !item.watchers.includes(watcher)) item.watchers.push(watcher);
      record("DocumentWatcherAdded", body.actor, item.name, watcher ?? "Watcher");
      return item;
    },

    exportDocument(id, body) {
      const item = findById(state.documents, id);
      item.exportedAt = new Date().toISOString();
      item.exportReason = body.reason ?? "Governance evidence export";
      record("DocumentExported", body.actor, item.name, item.exportReason);
      return item;
    },

    bulkSealDocuments(body) {
      requirePermission(body.actor, "canApprove");
      const ids = Array.isArray(body.ids) && body.ids.length ? body.ids : state.documents.slice(0, 3).map((item) => item.id);
      const updated = state.documents.filter((item) => ids.includes(item.id)).map((item) => {
        item.status = "Sealed";
        item.chainHash ??= `sha256:${Buffer.from(`${item.id}:${item.storageKey}:${item.status}`).toString("base64url").slice(0, 32)}`;
        return item;
      });
      record("DocumentsBulkSealed", body.actor, "Archive vault", `${updated.length} documents sealed`);
      return { count: updated.length, updated };
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
        permanent: state.documents.filter((item) => item.retainedUntil === "Permanent").length,
        verified: state.documents.filter((item) => item.verified).length,
        custodyAssigned: state.documents.filter((item) => item.custodian).length,
        chainUpdated: state.documents.filter((item) => item.chainHash).length,
        extracted: state.documents.filter((item) => item.extractedText).length,
        linked: state.documents.filter((item) => item.linkedReport || item.linkedApproval).length,
        watched: state.documents.filter((item) => item.watchers?.length).length,
        exported: state.documents.filter((item) => item.exportedAt).length
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

    sealAuditRow(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.audit, id);
      item.sealed = true;
      item.chainHash = item.chainHash ?? `sha256:${Buffer.from(`${item.id}:${item.event}:${item.actor}:${item.object}:${item.time}`).toString("base64url").slice(0, 32)}`;
      item.result = item.result.startsWith("Sealed:") ? item.result : `Sealed: ${item.result}`;
      record("AuditRowSealed", body.actor, item.object, item.chainHash);
      return item;
    },

    verifyAuditRow(id, body) {
      const item = findById(state.audit, id);
      item.verified = true;
      item.verification = body.result ?? "Integrity verified";
      record("AuditRowVerified", body.actor, item.object, item.verification);
      return item;
    },

    updateAuditSeverity(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.audit, id);
      item.severity = body.severity ?? "High";
      record("AuditSeverityUpdated", body.actor, item.object, item.severity);
      return item;
    },

    updateAuditCategory(id, body) {
      const item = findById(state.audit, id);
      item.category = body.category ?? "Governance";
      record("AuditCategoryUpdated", body.actor, item.object, item.category);
      return item;
    },

    assignAuditReviewer(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.audit, id);
      item.reviewer = body.reviewer ?? body.actor;
      record("AuditReviewerAssigned", body.actor, item.object, item.reviewer);
      return item;
    },

    appendAuditComment(id, body) {
      const item = findById(state.audit, id);
      item.comments = [...(item.comments ?? []), `${body.actor}: ${body.comment ?? "Review comment added"}`];
      record("AuditCommentAdded", body.actor, item.object, body.comment ?? "Review comment added");
      return item;
    },

    openAuditInvestigation(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.audit, id);
      item.investigation = "Open";
      item.investigationReason = body.reason ?? "Investigation opened";
      item.severity = item.severity ?? "High";
      record("AuditInvestigationOpened", body.actor, item.object, item.investigationReason);
      return item;
    },

    closeAuditInvestigation(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.audit, id);
      item.investigation = "Closed";
      item.investigationResult = body.result ?? "Investigation closed";
      record("AuditInvestigationClosed", body.actor, item.object, item.investigationResult);
      return item;
    },

    placeAuditHold(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.audit, id);
      item.holdReason = body.reason ?? "Audit hold placed";
      item.hold = true;
      record("AuditHoldPlaced", body.actor, item.object, item.holdReason);
      return item;
    },

    releaseAuditHold(id, body) {
      requirePermission(body.actor, "canApprove");
      const item = findById(state.audit, id);
      item.hold = false;
      item.holdReleaseReason = body.reason ?? "Audit hold released";
      record("AuditHoldReleased", body.actor, item.object, item.holdReleaseReason);
      return item;
    },

    bulkFlagAuditRows(body) {
      const ids = body.ids?.length ? body.ids : state.audit.slice(0, 3).map((item) => item.id);
      const updated = state.audit.filter((item) => ids.includes(item.id)).map((item) => {
        item.result = item.result.startsWith("Flagged:") ? item.result : `Flagged: ${body.reason ?? item.result}`;
        return item;
      });
      record("AuditRowsBulkFlagged", body.actor, "Audit ledger", `${updated.length} rows flagged`);
      return { count: updated.length, updated };
    },

    bulkSealAuditRows(body) {
      requirePermission(body.actor, "canApprove");
      const ids = body.ids?.length ? body.ids : state.audit.slice(0, 3).map((item) => item.id);
      const updated = state.audit.filter((item) => ids.includes(item.id)).map((item) => {
        item.sealed = true;
        item.chainHash = item.chainHash ?? `sha256:${Buffer.from(`${item.id}:${item.event}:${item.actor}:${item.object}:${item.time}`).toString("base64url").slice(0, 32)}`;
        item.result = item.result.startsWith("Sealed:") ? item.result : `Sealed: ${item.result}`;
        return item;
      });
      record("AuditRowsBulkSealed", body.actor, "Audit ledger", `${updated.length} rows sealed`);
      return { count: updated.length, updated };
    },

    bulkVerifyAuditRows(body) {
      const ids = body.ids?.length ? body.ids : state.audit.slice(0, 3).map((item) => item.id);
      const updated = state.audit.filter((item) => ids.includes(item.id)).map((item) => {
        item.verified = true;
        item.verification = body.result ?? "Integrity verified";
        return item;
      });
      record("AuditRowsBulkVerified", body.actor, "Audit ledger", `${updated.length} rows verified`);
      return { count: updated.length, updated };
    },

    auditDigest() {
      const flagged = state.audit.filter((item) => /^Flagged:/i.test(item.result));
      const sealed = state.audit.filter((item) => item.sealed || /^Sealed:/i.test(item.result));
      const verified = state.audit.filter((item) => item.verified);
      const investigations = state.audit.filter((item) => item.investigation === "Open");
      const holds = state.audit.filter((item) => item.hold);
      const critical = state.audit.filter((item) => item.severity === "Critical");
      const reviewers = new Set(state.audit.map((item) => item.reviewer).filter(Boolean));
      const eventCounts = state.audit.reduce((counts, item) => {
        counts[item.event] = (counts[item.event] ?? 0) + 1;
        return counts;
      }, {});
      const topEvent = Object.entries(eventCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No events";
      return {
        generatedAt: new Date().toISOString(),
        total: state.audit.length,
        flagged: flagged.length,
        sealed: sealed.length,
        verified: verified.length,
        investigations: investigations.length,
        holds: holds.length,
        critical: critical.length,
        reviewers: reviewers.size,
        topEvent,
        latestObject: state.audit[0]?.object ?? "No audit rows"
      };
    },

    recordManualEvent(body) {
      record("ManualEventRecorded", body.actor, body.object ?? "Event bus", body.result ?? "Manual event recorded");
      return { event: state.events[0], audit: state.audit[0] };
    },

    acknowledgeEvent(id, body) {
      const index = findEventIndex(id);
      const updated = `Acknowledged: ${state.events[index]}`;
      state.events[index] = updated;
      record("EventAcknowledged", body.actor, updated, body.reason ?? "Event acknowledged");
      return { event: updated, events: state.events };
    },

    pinEvent(id, body) {
      const index = findEventIndex(id);
      const [event] = state.events.splice(index, 1);
      const pinned = event.startsWith("Pinned:") ? event : `Pinned: ${event}`;
      state.events.unshift(pinned);
      record("EventPinned", body.actor, pinned, body.reason ?? "Event pinned");
      return { event: pinned, events: state.events };
    },

    updateEventSeverity(id, body) {
      const index = findEventIndex(id);
      const severity = body.severity ?? "High";
      const updated = `${severity}: ${state.events[index].replace(/^(Info|Low|Medium|High|Critical): /, "")}`;
      state.events[index] = updated;
      record("EventSeverityUpdated", body.actor, updated, severity);
      return { event: updated, events: state.events };
    },

    routeEvent(id, body) {
      const index = findEventIndex(id);
      const updated = `Routed to ${body.route ?? "Audit desk"}: ${state.events[index]}`;
      state.events[index] = updated;
      record("EventRouted", body.actor, updated, body.route ?? "Audit desk");
      return { event: updated, events: state.events };
    },

    replayEvent(id, body) {
      const index = findEventIndex(id);
      const replayed = `Replayed: ${state.events[index]}`;
      state.events.unshift(replayed);
      record("EventReplayed", body.actor, replayed, body.reason ?? "Event replayed");
      return { event: replayed, events: state.events };
    },

    muteEvent(id, body) {
      const index = findEventIndex(id);
      const updated = `Muted: ${state.events[index]}`;
      state.events[index] = updated;
      record("EventMuted", body.actor, updated, body.reason ?? "Event muted");
      return { event: updated, events: state.events };
    },

    assignEventOwner(id, body) {
      const index = findEventIndex(id);
      const updated = `Owner ${body.owner ?? body.actor}: ${state.events[index]}`;
      state.events[index] = updated;
      record("EventOwnerAssigned", body.actor, updated, body.owner ?? body.actor);
      return { event: updated, events: state.events };
    },

    archiveEvent(id, body) {
      const index = findEventIndex(id);
      const [event] = state.events.splice(index, 1);
      record("EventArchived", body.actor, event, body.reason ?? "Event archived");
      return { event, events: state.events };
    },

    bulkArchiveEvents(body) {
      const ids = body.ids?.length ? body.ids : state.events.slice(0, 3);
      const decoded = ids.map((id) => decodeURIComponent(id));
      const archived = [];
      state.events = state.events.filter((event, index) => {
        const shouldArchive = decoded.includes(event) || decoded.includes(String(index));
        if (shouldArchive) archived.push(event);
        return !shouldArchive;
      });
      record("EventsBulkArchived", body.actor, "Event bus", `${archived.length} events archived`);
      return { count: archived.length, archived, events: state.events };
    },

    eventDigest() {
      return {
        generatedAt: new Date().toISOString(),
        total: state.events.length,
        pinned: state.events.filter((event) => event.startsWith("Pinned:")).length,
        acknowledged: state.events.filter((event) => event.startsWith("Acknowledged:")).length,
        critical: state.events.filter((event) => event.startsWith("Critical:")).length,
        muted: state.events.filter((event) => event.startsWith("Muted:")).length,
        routed: state.events.filter((event) => event.startsWith("Routed to")).length,
        latest: state.events[0] ?? "No events"
      };
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

    updateAiDraftStatus(id, body) {
      const draft = findById(state.aiDrafts, id);
      draft.status = body.status ?? "Review";
      record("AIDraftStatusUpdated", body.actor, draft.title, draft.status);
      return draft;
    },

    publishAiDraft(id, body) {
      requirePermission(body.actor, "canApprove");
      const draft = findById(state.aiDrafts, id);
      draft.status = "Published";
      draft.publishedBy = body.actor;
      record("AIDraftPublished", body.actor, draft.title, "AI draft published");
      return draft;
    },

    bindAiDraftSources(id, body) {
      const draft = findById(state.aiDrafts, id);
      draft.sourceNote = body.sourceNote ?? "Bound to current governance source map";
      draft.sourceCount = Math.max(draft.sourceCount, body.sourceCount ?? draft.sourceCount);
      record("AIDraftSourcesBound", body.actor, draft.title, draft.sourceNote);
      return draft;
    },

    scoreAiDraft(id, body) {
      const draft = findById(state.aiDrafts, id);
      draft.confidence = Math.max(0, Math.min(100, body.confidence ?? 90));
      record("AIDraftConfidenceScored", body.actor, draft.title, `${draft.confidence}% confidence`);
      return draft;
    },

    sealAiDraft(id, body) {
      requirePermission(body.actor, "canApprove");
      const draft = findById(state.aiDrafts, id);
      draft.sealed = true;
      draft.chainHash = draft.chainHash ?? `sha256:${Buffer.from(`${draft.id}:${draft.title}:${draft.createdAt}`).toString("base64url").slice(0, 32)}`;
      record("AIDraftSealed", body.actor, draft.title, draft.chainHash);
      return draft;
    },

    watchAiDraft(id, body) {
      const draft = findById(state.aiDrafts, id);
      const watcher = body.watcher ?? body.actor ?? "Watcher";
      draft.watchers = Array.from(new Set([...(draft.watchers ?? []), watcher]));
      record("AIDraftWatcherAdded", body.actor, draft.title, watcher);
      return draft;
    },

    duplicateAiDraft(id, body) {
      const draft = findById(state.aiDrafts, id);
      const created = aiDraft(draft.kind, body.title ?? `${draft.title} follow-up`, draft.body, draft.sourceCount);
      created.status = "Draft";
      state.aiDrafts.unshift(created);
      record("AIDraftDuplicated", body.actor, draft.title, created.title);
      return created;
    },

    bulkRefreshAiDrafts(body) {
      const ids = body.ids?.length ? body.ids : state.aiDrafts.slice(0, 3).map((item) => item.id);
      const updated = ids.map((id) => {
        const draft = findById(state.aiDrafts, id);
        const focus = body.focus ?? draft.title.replace(`${draft.kind}: `, "");
        const refreshed = generateDraft(draft.kind, focus, body.actor);
        draft.title = refreshed.title;
        draft.body = refreshed.body;
        draft.sourceCount = refreshed.sourceCount;
        draft.createdAt = refreshed.createdAt;
        draft.status = "Refreshed";
        return draft;
      });
      record("AIDraftsBulkRefreshed", body.actor, "AI Desk", `${updated.length} drafts refreshed`);
      return { updated, count: updated.length };
    },

    aiDraftDigest() {
      const published = state.aiDrafts.filter((item) => item.status === "Published");
      const review = state.aiDrafts.filter((item) => item.status === "Review" || item.status === "Refreshed");
      const sealed = state.aiDrafts.filter((item) => item.sealed);
      const watched = state.aiDrafts.filter((item) => item.watchers?.length);
      return {
        generatedAt: new Date().toISOString(),
        total: state.aiDrafts.length,
        published: published.length,
        review: review.length,
        sealed: sealed.length,
        watched: watched.length,
        averageConfidence: state.aiDrafts.length ? Math.round(state.aiDrafts.reduce((sum, item) => sum + (item.confidence ?? 0), 0) / state.aiDrafts.length) : 0,
        nextDraft: review[0]?.title ?? state.aiDrafts[0]?.title ?? "No AI drafts"
      };
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
      ensureAuthCredentials();
      const normalizedEmail = normalizeStationEmail(body.email);
      const foundOffice = state.offices.find((item) => item.email === normalizedEmail);
      const credential = ensureStationCredential(normalizedEmail, stationPasswords[normalizedEmail] ?? foundOffice?.password);
      if (credential.status === "Locked" && (!credential.lockedUntil || Date.parse(credential.lockedUntil) > Date.now())) {
        record("LoginBlocked", normalizedEmail, normalizedEmail, "Station credential locked");
        return { unauthorized: true, error: "Station credential locked" };
      }
      if (!passwordMatches(body.password, credential)) {
        credential.failedAttempts = (credential.failedAttempts ?? 0) + 1;
        credential.lastFailedAt = new Date().toISOString();
        if (credential.failedAttempts >= LOCKOUT_ATTEMPTS) {
          credential.status = "Locked";
          credential.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString();
          record("StationCredentialLocked", normalizedEmail, normalizedEmail, "Login lockout threshold reached");
        }
        record("LoginDenied", normalizedEmail, normalizedEmail, "Invalid station credentials");
        return { unauthorized: true, error: "Invalid station credentials" };
      }

      let foundStation = state.stations.find((item) => item.email === normalizedEmail);
      if (!foundStation && foundOffice) {
        foundStation = station(foundOffice.email, `${foundOffice.name} Workstation`, foundOffice.level, `${foundOffice.department}, supervised by ${foundOffice.supervisor}`);
        state.stations.push(foundStation);
      }
      if (!foundStation) return { unauthorized: true, error: "Invalid station credentials" };
      if (foundStation.status === "Suspended") return { unauthorized: true, error: "Station suspended" };
      credential.status = "Active";
      credential.failedAttempts = 0;
      credential.lockedUntil = undefined;
      credential.lastLoginAt = new Date().toISOString();
      foundStation.credentialStatus = credential.forceReset ? "Reset required" : "Active";
      foundStation.mfaRequired = credential.mfaRequired;
      record("Login", body.email, foundStation.title, "Allowed");
      return { station: foundStation, credential: publicCredential(credential), token: `demo.${Buffer.from(body.email).toString("base64url")}` };
    }
  };
}
