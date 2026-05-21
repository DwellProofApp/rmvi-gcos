import React from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  Archive as ArchiveIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  ClipboardCheck,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  CloudOff,
  Database,
  Download,
  FileBarChart2,
  FileCheck2,
  FileClock,
  FileText,
  Files,
  GitBranch,
  Globe2,
  Inbox,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MessageSquareText,
  PanelLeft,
  Plus,
  RadioTower,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Signature,
  ScrollText,
  SquareCheckBig,
  LogOut,
  SlidersHorizontal,
  Sparkles,
  Smartphone,
  TimerReset,
  Upload,
  Users,
  Video,
  Workflow,
  Zap
} from "lucide-react";
import "./styles.css";

type StationLevel =
  | "International HQ"
  | "Regional HQ"
  | "National HQ"
  | "County/State HQ"
  | "District HQ"
  | "Area HQ"
  | "Local Branch";

type Section = "Control Center" | "Admin Board" | "ChurchMail" | "Reports" | "Approvals" | "Tasks" | "Policies" | "Calendar" | "Personnel" | "Escalations" | "AI Desk" | "Live Comms" | "Hierarchy" | "Offices" | "Transfers" | "Archive" | "Audit" | "Account Settings";
type MessageKind = "Directive" | "Report" | "Approval" | "Notification" | "Transfer";
type Status = "Ready" | "In Review" | "Escalated" | "Approved" | "Queued";
type OrgNodeKind = "Office" | "Directorate" | "Department" | "Unit" | "Staff Structure";
type PermissionPreset = "Reporter" | "Department Lead" | "Approver" | "Office Admin" | "Transfer Officer" | "Executive Override";
type StationCard = { id?: string; email: string; title: string; level: StationLevel | string; authority: string; icon?: React.ElementType; status?: string; verified?: boolean; watchers?: string[]; mirrorOf?: string; nodeKind?: OrgNodeKind; parentId?: string; parentName?: string; permissionPreset?: PermissionPreset; reportingRoute?: string; workflowAccess?: string[] };
type StationAuth = { email: string; status: string; failedAttempts: number; lockedUntil?: string; mfaRequired?: boolean; forceReset?: boolean; updatedAt?: string; updatedBy?: string; lastLoginAt?: string; lastFailedAt?: string };
type StationAuthDigest = { generatedAt: string; total: number; locked: number; mfaRequired: number; resetRequired: number; failedAttempts: number; nextCredential: string };
type Message = { id: string; kind: MessageKind; subject: string; from: string; age: string; status: Status; files: string; route?: string; priority?: "Low" | "Medium" | "High" | "Critical"; archived?: boolean; watchers?: string[] };
type Report = {
  id: string;
  name: string;
  owner: string;
  path: string;
  due: string;
  state: string;
  score: number;
  type?: string;
  period?: string;
  routingStage?: string;
  evidenceStatus?: string;
  reviewNote?: string;
  submittedAt?: string;
  approvedBy?: string;
  correctionReason?: string;
  verified?: boolean;
  archived?: boolean;
  watchers?: string[];
  templateId?: string;
  preparedBy?: string;
  attestation?: string;
  approvalLimit?: string;
  reportFields?: Record<string, string>;
  templateChecklist?: string[];
  evidenceFiles?: FileReference[];
};
type ReportTemplate = {
  id: string;
  type: string;
  name: string;
  owner: string;
  due: string;
  period: string;
  path: string;
  evidenceStatus: string;
  routingStage: string;
  approvalLimit: string;
  description: string;
  checklist: string[];
};
type Approval = {
  id: string;
  request: string;
  route: string;
  limit: string;
  state: string;
  signatures: string;
  delegate?: string;
  holdReason?: string;
  linkedReport?: string;
  linkedTask?: string;
  evidenceStatus?: string;
  executionStatus?: string;
  executedAt?: string;
  executedBy?: string;
  auditTrail?: string[];
  archived?: boolean;
  watchers?: string[];
};
type GovernanceTask = { id: string; title: string; owner: string; assignee: string; priority: "Low" | "Medium" | "High" | "Critical"; due: string; status: "Queued" | "In Progress" | "Blocked" | "Complete"; blocker?: string; watchers?: string[]; dependencies?: string[]; approvalRequired?: boolean; approvalRoute?: string; sla?: string; slaStatus?: string; evidence?: string; handoffTo?: string; escalated?: boolean; escalationReason?: string; comments?: string[]; checkpoints?: string[]; scheduledFor?: string; dispatchTeam?: string; dispatchLocation?: string; timeHours?: number; qaStatus?: string; qaReviewer?: string; riskAccepted?: boolean; riskReason?: string; templateSaved?: boolean; templateName?: string; linkedReport?: string; linkedApproval?: string; archived?: boolean; archiveReason?: string };
type Policy = { id: string; title: string; category: string; owner: string; status: "Draft" | "Active" | "Review" | "Retired"; summary: string; acknowledgements: number; version?: string; reviewBy?: string; watchers?: string[]; complianceStatus?: string; complianceScore?: number; evidence?: string; distributedTo?: string; distributedAt?: string; exceptionNote?: string; exceptionExpires?: string; trainingAssigned?: boolean; trainingAudience?: string; hold?: boolean; holdReason?: string; linkedTask?: string; linkedApproval?: string; archived?: boolean; archiveReason?: string };
type CalendarEvent = { id: string; title: string; category: string; owner: string; date: string; priority: "Low" | "Medium" | "High" | "Critical"; status: "Scheduled" | "At Risk" | "Complete"; watchers?: string[]; checkInStatus?: string; checkInBy?: string; venue?: string; agenda?: string; attendance?: number; reminderSent?: boolean; reminderAudience?: string; readiness?: string; linkedTask?: string; linkedReport?: string; archived?: boolean; archiveReason?: string };
type LiveSession = { id: string; title: string; host: string; sessionType: "Video Meeting" | "Office Chat" | "Broadcast" | "Approval Room" | "Report Review" | string; status: "Live" | "Queued" | "Priority" | "Archived" | "Complete" | string; linkedRecord: string; route: string; purpose: string; participants?: string[]; checkedInParticipants?: string[]; attendanceCount?: number; notes?: string[]; transcript?: { id: string; author: string; body: string; createdAt: string }[]; decisions?: { id: string; text: string; owner: string; due: string; createdAt: string }[]; files?: string[]; createdAt?: string; updatedAt?: string; lastActionBy?: string; summaryMessageId?: string; summarySentAt?: string; followUpTaskId?: string; calendarEventId?: string; packetDocumentId?: string; packetBuiltAt?: string; archived?: boolean; archiveReason?: string };
type PersonRecord = { id: string; name: string; role: string; currentStation: string; assignedStation: string; status: "Active" | "Transfer Pending" | "Assigned" | "Inactive" | "Onboarding" | "On Leave"; clearance?: string; credentialStatus?: string; trainingStatus?: string; trainingTrack?: string; stationAccess?: string; accessStatus?: string; incidentFlag?: string; incidentSeverity?: string; linkedTask?: string; reviewStatus?: string; reviewNote?: string; archived?: boolean; archiveReason?: string };
type Transfer = { id: string; person: string; from: string; to: string; step: string; risk: string; letterStatus?: string; letterRef?: string; scheduledFor?: string; notes?: string[]; watchers?: string[]; personnelRecord?: string; linkedTask?: string; linkedReport?: string; archived?: boolean; archiveReason?: string };
type AuditRow = { id: string; event: string; actor: string; object: string; result: string; time: string; sealed?: boolean; verified?: boolean; chainHash?: string; verification?: string; severity?: "Info" | "Low" | "Medium" | "High" | "Critical"; category?: string; reviewer?: string; comments?: string[]; investigation?: "Open" | "Closed"; investigationReason?: string; investigationResult?: string; hold?: boolean; holdReason?: string; holdReleaseReason?: string };
type OfflineAction = AuditRow & { queuedAt: string; syncStatus?: "Queued" | "Syncing" | "Deferred" | "Synced"; syncAttempts?: number; priority?: "Normal" | "High" | "Critical" };
type OfflineSyncRecord = { id: string; status: "Synced" | "Deferred" | "Conflict"; count: number; detail: string; at: string };
type OfflineConflict = { id: string; object: string; count: number; latestEvent: string; priority: "Review" | "High" };
type Session = { email: string; startedAt: string; token?: string; expiresAt?: string; authPending?: boolean };
type Office = { id: string; name: string; email: string; level: StationLevel; department: string; supervisor: string; password: string; status: string; nodeKind?: OrgNodeKind; parentId?: string; parentName?: string; permissionPreset?: PermissionPreset; reportingRoute?: string; workflowAccess?: string[]; emailVerified?: boolean; watchers?: string[]; notes?: string[]; capacity?: number; complianceStatus?: string; archived?: boolean; archiveReason?: string };
type CreateAccountInput = { fullName: string; officeName: string; email: string; password: string; level: StationLevel; department: string; autoApprove?: boolean };
type AuthActionResult = { ok: boolean; message?: string };
type Escalation = { id: string; source: string; item: string; reason: string; severity: "Medium" | "High" | "Critical"; status: "Open" | "Upward" | "Resolved" | "Watching" | "Merged"; owner: string; sla?: string; watchers?: string[]; evidence?: string; comments?: string[]; resolutionNote?: string; due?: string; linkedTask?: string; linkedReport?: string; linkedApproval?: string; impactScore?: number; impactSummary?: string; archived?: boolean; archiveReason?: string };
type AiDraft = { id: string; kind: "Executive Summary" | "Memo" | "Report Brief"; title: string; body: string; sourceCount: number; createdAt: string; status?: string; confidence?: number; sourceNote?: string; sealed?: boolean; chainHash?: string; publishedBy?: string; watchers?: string[] };
type FileRecord = { id: string; name: string; contentType: string; size: number; hash: string; objectKey: string; uploadedAt?: string; uploadedBy?: string; source?: string; linkedTo?: { kind: string; id: string; linkedAt: string }[] };
type FileReference = Pick<FileRecord, "id" | "name" | "contentType" | "size" | "hash" | "objectKey">;
type DocumentRecord = { id: string; name: string; classification: string; source: string; owner: string; fileType: string; status: string; storageKey: string; retainedUntil: string; createdAt: string; files?: FileReference[]; fileHash?: string; fileSize?: number; contentType?: string; verified?: boolean; verificationNote?: string; custodian?: string; custodyAt?: string; chainHash?: string; extractedText?: string; extractedAt?: string; linkedReport?: string; linkedApproval?: string; watchers?: string[]; exportedAt?: string; exportReason?: string };
type SearchResult = { id: string; section: Section; title: string; meta: string; status: string };
type NotificationItem = { id: string; section: Section; title: string; detail: string; severity: "Critical" | "High" | "Medium" | "Info" };
type ApiStatus = {
  status: string;
  service: string;
  time: string;
  startedAt: string;
  uptimeSeconds: number;
  serveWeb: boolean;
  persistence: string;
  storageProvider?: string;
  persistenceStatus?: PersistenceStatus;
  limits: {
    maxBodyBytes: number;
    devResetEnabled: boolean;
    requireApiAuth?: boolean;
  };
  sessions: {
    active: number;
    expiringSoon: number;
    stations: {
      id?: string;
      email: string;
      startedAt: string;
      expiresAt: string;
      minutesRemaining: number;
      status?: string;
      flags?: string[];
      trusted?: boolean;
      mfaRequired?: boolean;
      deviceLabel?: string;
      notes?: string[];
      lockReason?: string;
    }[];
  };
  counts: {
    stations: number;
    messages: number;
    reports: number;
    approvals: number;
    tasks: number;
    policies: number;
    calendarEvents: number;
    liveSessions?: number;
    personnel: number;
    escalations: number;
    transfers: number;
    offices: number;
    documents: number;
    audit: number;
    events: number;
  };
};
type PersistenceStatus = {
  provider: string;
  mode: string;
  path: string;
  hash: string;
  records: Record<string, number>;
  lastBackup?: { path: string; label: string; hash: string; createdAt: string; createdBy: string } | null;
  lastVerifiedAt?: string | null;
  lastVerifiedBy?: string | null;
  file?: { exists: boolean; bytes: number; updatedAt: string | null };
  backupsPath?: string;
  backupSupport?: boolean;
  migrationReady?: boolean;
  readyForExternalDatabase?: boolean;
  note?: string;
};
type PersistenceBackupManifest = {
  generatedAt: string;
  provider: string;
  mode: string;
  backupsPath: string | null;
  total: number;
  totalBytes: number;
  latest?: { path?: string; label: string; hash: string; createdAt: string; createdBy: string; provider?: string } | null;
  backups: { path?: string; file?: string; bytes: number; label: string; hash: string; createdAt: string; createdBy: string; provider: string }[];
  checks: { name: string; ok: boolean; detail: string }[];
  status: string;
  nextAction: string;
};
type PersistenceRestoreDrill = {
  generatedAt: string;
  provider: string;
  mode: string;
  backup?: PersistenceBackupManifest["latest"];
  valid: boolean;
  status: string;
  liveHash: string;
  backupHash: string | null;
  computedBackupHash: string | null;
  recordDelta: number;
  liveRecords: Record<string, number>;
  backupRecords: Record<string, number>;
  checks: { name: string; ok: boolean; detail: string }[];
  nextAction: string;
};
type PersistenceMigrationPlan = {
  generatedAt: string;
  source: { provider: string; mode: string; source: string };
  target: { provider: string; schema: string; mode: string };
  estimatedRows: number;
  collections: {
    collection: string;
    targetTable: string;
    records: number;
    strategy: string;
    identityKey: string;
    ready: boolean;
  }[];
  objectStorage: { provider: string; files: number; bytes: number; strategy: string };
  checks: { name: string; ok: boolean; detail: string }[];
  blockers: string[];
  nextSteps: string[];
};
type PersistenceSchemaPlan = {
  generatedAt: string;
  schema: string;
  dialect: string;
  tableCount: number;
  estimatedRows: number;
  importOrder: string[];
  tables: {
    name: string;
    collection: string;
    records: number;
    primaryKey: string;
    columns: { name: string; type: string; nullable: boolean; default?: string }[];
    indexes: string[];
    importStrategy: string;
  }[];
  sql: string;
  checks: { name: string; ok: boolean; detail: string }[];
};
type PersistenceImportDryRun = {
  generatedAt: string;
  provider: string;
  target: { provider: string; schema: string; mode: string };
  schema: string;
  valid: boolean;
  estimatedRows: number;
  estimatedBatches: number;
  estimatedDurationMs: number;
  batches: {
    batch: number;
    table: string;
    collection: string;
    records: number;
    strategy: string;
    primaryKey: string;
    status: string;
    estimatedMs: number;
  }[];
  objectStorage: { provider: string; files: number; bytes: number; strategy: string };
  checks: { name: string; ok: boolean; detail: string }[];
  warnings: string[];
  blockers: string[];
  nextAction: string;
};
type PersistenceCutoverChecklist = {
  generatedAt: string;
  provider: string;
  targetProvider: string;
  ready: boolean;
  status: string;
  checks: { name: string; ok: boolean; detail: string }[];
  blockers: string[];
  requiredSwitches: { name: string; value: string; ready: boolean }[];
  rollbackPlan: string[];
  nextAction: string;
};
type LaunchReadiness = {
  generatedAt: string;
  targetDomain: string;
  status: string;
  mvpScore: number;
  productionScore: number;
  checks: { name: string; category: "mvp" | "production"; ok: boolean; detail: string }[];
  blockers: string[];
  nextActions: string[];
  summary: string;
};
type DeploymentPlan = {
  generatedAt: string;
  targetDomain: string;
  deploymentTarget: string;
  readiness: { mvpScore: number; productionScore: number; status: string; blockers: string[] };
  requiredSecrets: { name: string; value: string; configured: boolean; sensitive: boolean }[];
  commands: string[];
  smokeUrls: string[];
  goLive: boolean;
  nextAction: string;
};
type ProductionSecretsPlan = {
  generatedAt: string;
  targetDomain: string;
  status: string;
  required: number;
  ready: number;
  missing: string[];
  entries: {
    name: string;
    value: string;
    configured: boolean;
    sensitive: boolean;
    status: string;
    displayValue: string;
    nextAction: string;
  }[];
  nextActions: string[];
};
type OperationalMonitor = {
  generatedAt: string;
  status: string;
  score: number;
  uptimeSeconds: number;
  domain: string;
  service: string;
  storageProvider: string;
  readiness: { mvpScore: number; productionScore: number; blockers: number; nextAction: string };
  persistence: { provider: string; mode: string; hash: string; records: Record<string, number>; backupStatus: string; backups: number; restoreStatus: string; restoreValid: boolean };
  sessions: { active: number; expiringSoon: number; stations: { email: string; startedAt: string; expiresAt: string; minutesRemaining: number; status?: string; mfaRequired?: boolean }[] };
  criticalSignals: { name: string; severity: string; detail: string }[];
  nextActions: string[];
};
type LaunchSignoff = {
  generatedAt: string;
  targetDomain: string;
  overallScore: number;
  status: string;
  tracks: {
    id: string;
    name: string;
    score: number;
    status: string;
    gates: { name: string; ok: boolean; detail: string }[];
    blockers: string[];
  }[];
  blockers: string[];
  nextActions: string[];
};
type ProjectCompletion = {
  generatedAt: string;
  project: string;
  targetDomain: string;
  status: string;
  moduleScore: number;
  mvpScore: number;
  productionScore: number;
  enterpriseScore: number;
  modules: { name: string; complete: boolean }[];
  releaseCommands: string[];
  smokeUrls: string[];
  productionBlockers: string[];
  nextActions: string[];
};
type EnterpriseCompletion = {
  generatedAt: string;
  project: string;
  targetDomain: string;
  status: string;
  overallScore: number;
  mvpScore: number;
  productionScore: number;
  tracks: {
    id: string;
    name: string;
    score: number;
    status: string;
    gates: { name: string; ok: boolean; detail: string }[];
    blockers: string[];
    nextActions: string[];
  }[];
  blockers: string[];
  nextActions: string[];
};
type RolloutReadiness = {
  generatedAt: string;
  project: string;
  targetDomain: string;
  status: string;
  overallScore: number;
  tracks: {
    id: string;
    name: string;
    score: number;
    status: string;
    gates: { name: string; ok: boolean; detail: string }[];
    blockers: string[];
    nextActions: string[];
  }[];
  blockers: string[];
  nextActions: string[];
};
type ExportSnapshot = {
  exportedAt: string;
  exportedBy: string;
  service: string;
  version: string;
  counts: ApiStatus["counts"];
  state: {
    stations: StationCard[];
    messages: Message[];
    reports: Report[];
    approvals: Approval[];
    tasks: GovernanceTask[];
    policies: Policy[];
    calendarEvents: CalendarEvent[];
    liveSessions?: LiveSession[];
    personnel: PersonRecord[];
    escalations: Escalation[];
    transfers: Transfer[];
    offices: Office[];
    documents: DocumentRecord[];
    aiDrafts: AiDraft[];
    audit: AuditRow[];
    events: string[];
  };
};
type ReadinessReport = {
  status: "ready" | "attention";
  checkedAt: string;
  checks: {
    name: string;
    ok: boolean;
    detail: string;
    acknowledged?: boolean;
    owner?: string;
    override?: boolean;
    recheckAt?: string;
    remediationTaskId?: string;
    archived?: boolean;
  }[];
};
type ReadinessDigest = {
  generatedAt: string;
  total: number;
  ready: number;
  attention: number;
  acknowledged: number;
  overrides: number;
  owned: number;
  scheduled: number;
  nextCheck: string;
};
type SecurityControlRecord = {
  name: string;
  detail: string;
  status: "Active" | "Warning" | "Exception" | "Disabled" | "Testing";
  owner?: string;
  evidence?: string;
  evidenceAt?: string;
  lastTest?: string;
  lastTestResult?: string;
  lastRotation?: string;
  rotationReason?: string;
  exceptionReason?: string;
  verified?: boolean;
  verifiedAt?: string;
  verification?: string;
  remediationTaskId?: string;
};
type SecurityControlDigest = {
  generatedAt: string;
  total: number;
  active: number;
  warning: number;
  exceptions: number;
  verified: number;
  evidence: number;
  owners: number;
  rotations: number;
  nextControl: string;
};
type ComplianceReview = {
  id: string;
  title: string;
  scope: string;
  status: "Open" | "In Review" | "Attested" | "Packet Ready" | "Escalated";
  risk: "Low" | "Medium" | "High" | "Critical";
  score: number;
  reviewer: string;
  due: string;
  evidence?: string;
  evidenceCount?: number;
  attested?: boolean;
  attestedAt?: string;
  packetId?: string;
  exported?: boolean;
  exportedAt?: string;
  escalationReason?: string;
};
type ComplianceDigest = {
  generatedAt: string;
  total: number;
  open: number;
  inReview: number;
  attested: number;
  packetReady: number;
  exported: number;
  escalated: number;
  highRisk: number;
  nextReview: string;
};
type EvidenceRecord = {
  id: string;
  title: string;
  source: string;
  classification: "Financial" | "Security" | "Governance" | "Personnel" | "Legal" | "Archive";
  custody: string;
  status: "Open" | "In Review" | "Sealed" | "Verified" | "On Hold";
  chainHash: string;
  retention: string;
  fileCount: number;
  files?: FileReference[];
  latestFileHash?: string;
  sealed?: boolean;
  verified?: boolean;
  hold?: boolean;
  exported?: boolean;
  exportFormat?: string;
  retentionReviewAt?: string;
};
type EvidenceDigest = {
  generatedAt: string;
  total: number;
  sealed: number;
  verified: number;
  holds: number;
  exported: number;
  permanent: number;
  custody: number;
  files: number;
  nextEvidence: string;
};
type ArchiveManifest = {
  generatedAt: string;
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  permanent: number;
  verified?: number;
  custodyAssigned?: number;
  chainUpdated?: number;
  extracted?: number;
  linked?: number;
  watched?: number;
  exported?: number;
};
type WorkflowDigest = {
  generatedAt: string;
  reportsOpen: number;
  approvalsOpen: number;
  escalatedReports: number;
  escalatedApprovals: number;
  nextReport: string;
  nextApproval: string;
};
type EscalationDigest = {
  generatedAt: string;
  open: number;
  critical: number;
  watched: number;
  resolved: number;
  evidence?: number;
  comments?: number;
  resolutionNotes?: number;
  due?: number;
  linked?: number;
  impact?: number;
  archived?: number;
  primary: string;
  owner: string;
};
type PersonnelDigest = {
  generatedAt: string;
  active: number;
  transferPending: number;
  onboarding: number;
  inactive: number;
  verified?: number;
  training?: number;
  accessGranted?: number;
  incidents?: number;
  linked?: number;
  reviewed?: number;
  archived?: number;
  primaryStation: string;
  nextPerson: string;
};
type TransferDigest = {
  generatedAt: string;
  total: number;
  ready: number;
  pending: number;
  risk: number;
  letters?: number;
  scheduled?: number;
  noted?: number;
  watched?: number;
  linked?: number;
  archived?: number;
  nextTransfer: string;
};
type OfficeDigest = {
  generatedAt: string;
  total: number;
  active: number;
  provisioned: number;
  suspended: number;
  stationIdentities: number;
  verified?: number;
  watched?: number;
  noted?: number;
  capacity?: number;
  compliant?: number;
  archived?: number;
  nextOffice: string;
};
type HierarchyDigest = {
  generatedAt: string;
  stations: number;
  levels: number;
  verified: number;
  suspended: number;
  watched: number;
  mirrors: number;
  topLevel: string;
  nextStation: string;
};
type AuditDigest = {
  generatedAt: string;
  total: number;
  flagged: number;
  sealed: number;
  verified: number;
  investigations: number;
  holds: number;
  critical: number;
  reviewers: number;
  topEvent: string;
  latestObject: string;
};
type EventDigest = {
  generatedAt: string;
  total: number;
  pinned: number;
  acknowledged: number;
  critical: number;
  muted: number;
  routed: number;
  latest: string;
};
type SessionDigest = {
  generatedAt: string;
  active: number;
  expiringSoon: number;
  flagged: number;
  locked: number;
  trusted: number;
  mfaRequired: number;
  labeled: number;
  nextSession: string;
};
type TaskDigest = {
  generatedAt: string;
  total: number;
  open: number;
  blocked: number;
  critical: number;
  watched: number;
  escalated?: number;
  dependencies?: number;
  approvals?: number;
  evidence?: number;
  slaBreaches?: number;
  scheduled?: number;
  dispatched?: number;
  qaPassed?: number;
  riskAccepted?: number;
  templates?: number;
  linked?: number;
  archived?: number;
  nextTask: string;
  owner: string;
};
type PolicyDigest = {
  generatedAt: string;
  total: number;
  active: number;
  review: number;
  draft: number;
  retired: number;
  watched: number;
  compliant?: number;
  evidence?: number;
  distributed?: number;
  exceptions?: number;
  training?: number;
  holds?: number;
  linked?: number;
  archived?: number;
  acknowledgements: number;
  nextPolicy: string;
};
type CalendarDigest = {
  generatedAt: string;
  total: number;
  scheduled: number;
  atRisk: number;
  complete: number;
  critical: number;
  watched: number;
  checkedIn?: number;
  venues?: number;
  agendas?: number;
  attendance?: number;
  reminders?: number;
  ready?: number;
  linked?: number;
  archived?: number;
  nextEvent: string;
  owner: string;
};
type MessageDigest = {
  generatedAt: string;
  total: number;
  ready: number;
  review: number;
  escalated: number;
  approved: number;
  archived: number;
  watched: number;
  nextMessage: string;
};
type ReportDigest = {
  generatedAt: string;
  total: number;
  open: number;
  overdue: number;
  correction: number;
  verified: number;
  watched: number;
  archived: number;
  evidenceReady?: number;
  submitted?: number;
  approvalReady?: number;
  types?: Record<string, number>;
  averageScore: number;
  nextReport: string;
};
type ReportGovernancePacket = {
  report: Report;
  approval: Approval;
  document: DocumentRecord;
  escalation: Escalation | null;
};
type ApprovalDigest = {
  generatedAt: string;
  total: number;
  open: number;
  delegated: number;
  held: number;
  signed: number;
  watched: number;
  archived: number;
  executed?: number;
  linked?: number;
  nextApproval: string;
};
type AiDraftDigest = {
  generatedAt: string;
  total: number;
  published: number;
  review: number;
  sealed: number;
  watched: number;
  averageConfidence: number;
  nextDraft: string;
};
type CommandBriefing = {
  title: string;
  generatedAt: string;
  riskScore: number;
  counts: {
    openEscalations: number;
    pendingApprovals: number;
    activeReports: number;
    blockedTasks: number;
    atRiskCalendar: number;
    transferPending: number;
  };
  priorities: string[];
};
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
type Permissions = {
  canCreateOffices: boolean;
  canApprove: boolean;
  canExecuteTransfers: boolean;
  canOverride: boolean;
};

const navItems: { icon: React.ElementType; label: Section }[] = [
  { icon: LayoutDashboard, label: "Control Center" },
  { icon: KeyRound, label: "Admin Board" },
  { icon: Mail, label: "ChurchMail" },
  { icon: FileCheck2, label: "Reports" },
  { icon: Workflow, label: "Approvals" },
  { icon: SquareCheckBig, label: "Tasks" },
  { icon: ScrollText, label: "Policies" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: Users, label: "Personnel" },
  { icon: AlertTriangle, label: "Escalations" },
  { icon: Sparkles, label: "AI Desk" },
  { icon: Video, label: "Live Comms" },
  { icon: GitBranch, label: "Hierarchy" },
  { icon: Building2, label: "Offices" },
  { icon: Signature, label: "Transfers" },
  { icon: Files, label: "Archive" },
  { icon: ShieldCheck, label: "Audit" },
  { icon: Settings, label: "Account Settings" }
];

const sectionProfiles: Record<Section, { icon: React.ElementType; eyebrow: string; title: string; description: string; signal: string }> = {
  "Control Center": {
    icon: LayoutDashboard,
    eyebrow: "Executive operations",
    title: "Global Governance Control Center",
    description: "A command view for workflow risk, reporting health, approvals, escalations, offline queue, and station performance.",
    signal: "Command ready"
  },
  "Admin Board": {
    icon: KeyRound,
    eyebrow: "System administration",
    title: "System Administrator Workstation",
    description: "Full RMVI platform administration for users, offices, station authority, sessions, audit controls, and deployment readiness.",
    signal: "Admin authority"
  },
  ChurchMail: {
    icon: Mail,
    eyebrow: "Governance communication",
    title: "ChurchMail Governance Inbox",
    description: "Classified official communication for directives, reports, approvals, notifications, transfers, routing, and archival traceability.",
    signal: "Classified routing"
  },
  Reports: {
    icon: FileCheck2,
    eyebrow: "Hierarchical reporting",
    title: "Reporting Center",
    description: "Preloaded church reports, full report forms, evidence readiness, review workflows, corrections, exports, and upward routing.",
    signal: "Templates loaded"
  },
  Approvals: {
    icon: Workflow,
    eyebrow: "Delegated authority",
    title: "Approval and Delegation Engine",
    description: "Validation, signature chains, authority limits, delegated review, execution, hold/release controls, and audit-backed approvals.",
    signal: "Rule checks live"
  },
  Tasks: {
    icon: SquareCheckBig,
    eyebrow: "Administrative execution",
    title: "Station Task Center",
    description: "Track assigned work, blockers, SLA status, dispatch, evidence, dependencies, QA review, comments, and operational handoffs.",
    signal: "Work queue active"
  },
  Policies: {
    icon: ScrollText,
    eyebrow: "Governance policy",
    title: "Policy Registry",
    description: "Create, distribute, review, acknowledge, train, archive, and bind policies to evidence, approvals, tasks, and compliance checks.",
    signal: "Policy controlled"
  },
  Calendar: {
    icon: CalendarDays,
    eyebrow: "Governance calendar",
    title: "Calendar and Readiness Board",
    description: "Schedule meetings, conferences, reviews, deadlines, reminders, venues, attendance, readiness checks, and linked work.",
    signal: "Schedule visible"
  },
  Personnel: {
    icon: Users,
    eyebrow: "People and access",
    title: "Personnel Directory",
    description: "Manage staff, roles, station assignments, credentials, clearance, training, leave, access grants, incidents, and transfers.",
    signal: "Access governed"
  },
  Escalations: {
    icon: AlertTriangle,
    eyebrow: "Executive attention",
    title: "Escalation Command Queue",
    description: "Triage urgent matters, ownership, severity, SLA, evidence, impact scoring, linked work, resolution notes, and executive routing.",
    signal: "Priority watch"
  },
  "AI Desk": {
    icon: Sparkles,
    eyebrow: "AI administration",
    title: "AI Administrative Desk",
    description: "Generate briefs, memos, report summaries, delay insights, source-bound drafts, readiness checks, and administrative recommendations.",
    signal: "Assist ready"
  },
  "Live Comms": {
    icon: Video,
    eyebrow: "Real-time communication",
    title: "Live Communication Center",
    description: "Run office-to-office video meetings, department chats, broadcasts, screen sharing, document collaboration, and approval discussions tied to office nodes.",
    signal: "Meetings ready"
  },
  Hierarchy: {
    icon: GitBranch,
    eyebrow: "Station graph",
    title: "Organizational Hierarchy",
    description: "Verify station levels, authority, reporting lines, suspension, activation, mirrors, bulk verification, and graph integrity.",
    signal: "Graph live"
  },
  Offices: {
    icon: Building2,
    eyebrow: "Office provisioning",
    title: "Office Creation and Workstations",
    description: "Create offices, assign levels, departments, supervisors, credentials, station capacity, compliance status, and access readiness.",
    signal: "Provisioning"
  },
  Transfers: {
    icon: Signature,
    eyebrow: "Identity migration",
    title: "Transfer Management",
    description: "Control reassignment letters, acknowledgements, old access revocation, new station activation, schedule, risk, and audit readiness.",
    signal: "Session guarded"
  },
  Archive: {
    icon: Files,
    eyebrow: "Evidence vault",
    title: "Document Archive Vault",
    description: "Register, classify, seal, verify, retain, export, upload, index, and link documents to reports, approvals, and audit records.",
    signal: "Vault integrity"
  },
  Audit: {
    icon: ShieldCheck,
    eyebrow: "Immutable audit",
    title: "Audit and Session Monitor",
    description: "Inspect audit rows, event severity, session safety, evidence chain, readiness checks, incident review, and immutable records.",
    signal: "Audit locked"
  },
  "Account Settings": {
    icon: Settings,
    eyebrow: "User management",
    title: "Account Settings",
    description: "Reset passwords, manage station profiles, add users, delete accounts, and control account access.",
    signal: "Account controls"
  }
};

const hierarchy: { level: StationLevel; node: string; metric: string; command: number; reports: number }[] = [
  { level: "International HQ", node: "Global Authority", metric: "Worldwide governance", command: 98, reports: 92 },
  { level: "Regional HQ", node: "Continental Oversight", metric: "6 active regions", command: 91, reports: 88 },
  { level: "National HQ", node: "Country Operations", metric: "42 national programs", command: 86, reports: 84 },
  { level: "County/State HQ", node: "Sub-national Division", metric: "117 county offices", command: 79, reports: 81 },
  { level: "District HQ", node: "District Command", metric: "309 districts", command: 76, reports: 78 },
  { level: "Area HQ", node: "Area Coordination", metric: "1,240 area offices", command: 71, reports: 74 },
  { level: "Local Branch", node: "Ground Level", metric: "8,426 branches", command: 63, reports: 69 }
];

const stations: StationCard[] = [
  {
    email: "admin@rmvi.org",
    title: "System Administrator Workstation",
    level: "International HQ",
    authority: "Full GCOS administration, deployment control, user lifecycle, audit override",
    icon: KeyRound
  },
  {
    email: "international@rmvi.org",
    title: "International Executive Workstation",
    level: "International HQ",
    authority: "Global override, policy registry, audit control",
    icon: Globe2
  },
  {
    email: "np@rmvi.org",
    title: "National Presidency Workstation",
    level: "National HQ",
    authority: "National directives, county oversight, executive summaries",
    icon: Landmark
  },
  {
    email: "district_admin@rmvi.org",
    title: "District Command Workstation",
    level: "District HQ",
    authority: "Branch oversight, workflow monitor, transfer approvals",
    icon: Building2
  },
  {
    email: "local_branch_017@rmvi.org",
    title: "Local Branch Workstation",
    level: "Local Branch",
    authority: "Local reports, member registry, directive acknowledgement",
    icon: Inbox
  },
  {
    email: "finance@rmvi.org",
    title: "Finance Desk Workstation",
    level: "National HQ",
    authority: "Financial reports, budgets, releases, reconciliation, audit evidence",
    icon: FileBarChart2
  },
  {
    email: "audit@rmvi.org",
    title: "Audit Desk Workstation",
    level: "National HQ",
    authority: "Compliance review, audit packets, evidence sealing, control testing",
    icon: ShieldCheck
  },
  {
    email: "mission@rmvi.org",
    title: "Mission Office Workstation",
    level: "National HQ",
    authority: "Mission outreach, transfers, church planting, personnel movement",
    icon: Globe2
  }
];

const demoStationPassword = (label: string) => ["gcos", label].join("-");

const seedStationPasswords: Record<string, string> = {
  "admin@rmvi.org": demoStationPassword("admin"),
  "international@rmvi.org": demoStationPassword("global"),
  "np@rmvi.org": demoStationPassword("national"),
  "district_admin@rmvi.org": demoStationPassword("district"),
  "local_branch_017@rmvi.org": demoStationPassword("local"),
  "finance@rmvi.org": demoStationPassword("finance"),
  "audit@rmvi.org": demoStationPassword("audit"),
  "mission@rmvi.org": demoStationPassword("mission")
};

const API_BASE = (import.meta.env.VITE_GCOS_API_BASE ?? (import.meta.env.DEV ? "http://127.0.0.1:8787" : "")).replace(/\/$/, "");
const CHURCH_LOGO_SRC = "/brand/lion-of-judah-logo.jpg";
const CHURCH_NAME = "Remedy Movement International";
const PLATFORM_NAME = "GCOS";
const PLATFORM_FULL_NAME = "Global Church Operating System";
const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

const initialMessages: Message[] = [
  { id: "msg-001", kind: "Directive", subject: "Q2 governance reporting directive", from: "Regional HQ - West Africa", age: "12 min", status: "Ready", files: "Policy memo" },
  { id: "msg-002", kind: "Report", subject: "District construction progress packet", from: "Buchanan District Office", age: "37 min", status: "In Review", files: "PDF, photos" },
  { id: "msg-003", kind: "Approval", subject: "Finance release request: mission transport", from: "County Finance", age: "1 hr", status: "Escalated", files: "Form, signatures" },
  { id: "msg-004", kind: "Transfer", subject: "Official reassignment letter", from: "Mission Office", age: "2 hrs", status: "Queued", files: "Signed letter" },
  { id: "msg-005", kind: "Notification", subject: "Audit packet deadline reminder", from: "Compliance Engine", age: "3 hrs", status: "Ready", files: "Checklist" }
];

const missionStationRoleOptions = [
  "Church Administration",
  "Executive Leadership",
  "International / National Secretariat",
  "Full Time Pastor",
  "Pastoral Assistant",
  "Local Church Management Board",
  "Elder Assembly",
  "Deacon Board",
  "Finance Desk",
  "Board and Finance Committee",
  "Audit and Compliance",
  "Mission Administration",
  "Education and Sunday School",
  "Pastoral Care",
  "Personnel and Transfers",
  "Security and Safety",
  "Construction and Facilities",
  "Social Development and Welfare",
  "Youth and Young Adult Ministry",
  "Children and Teens Ministry",
  "Marriage Committee",
  "Welfare Committee - Good Samaritans",
  "Men Fellowship",
  "Women Fellowship",
  "Sanitation Service Group",
  "Kingdom Harvesters - Evangelism",
  "Choir Service Group",
  "Ushering Service Group",
  "Technical Sound Service Group",
  "Media Service Group",
  "Kingdom Officers",
  "Protocol Service Group",
  "General Maintenance",
  "Armour-Bearers Service Group",
  "Census Service Group"
];

const organizationNodeKinds: OrgNodeKind[] = ["Office", "Directorate", "Department", "Unit", "Staff Structure"];
const permissionPresets: PermissionPreset[] = ["Reporter", "Department Lead", "Approver", "Office Admin", "Transfer Officer", "Executive Override"];

function slugifyStationName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") || "new_station";
}

function buildReportingRoute(level: StationLevel, parentName: string) {
  return [level, parentName || "Parent office", "Supervising authority", "Archive vault"].join(" -> ");
}

function workflowAccessForPreset(permissionPreset: PermissionPreset) {
  const access = new Set(["ChurchMail", "Reports", "Tasks", "Archive", "Live Comms"]);
  if (["Department Lead", "Approver", "Office Admin", "Executive Override"].includes(permissionPreset)) {
    access.add("Approvals");
  }
  if (["Transfer Officer", "Executive Override"].includes(permissionPreset)) {
    access.add("Transfers");
    access.add("Personnel");
  }
  if (["Office Admin", "Executive Override"].includes(permissionPreset)) {
    access.add("Offices");
    access.add("Hierarchy");
  }
  if (permissionPreset === "Executive Override") {
    access.add("Audit");
    access.add("Escalations");
    access.add("AI Desk");
  }
  return Array.from(access);
}

const initialReports: Report[] = [
  { id: "rep-001", name: "National mission activity report", owner: "National Programs", path: "Local -> Area -> District -> County -> National", due: "Today", state: "In Review", score: 86, type: "Mission", period: "May 2026", routingStage: "National review", evidenceStatus: "Evidence attached" },
  { id: "rep-002", name: "County finance summary", owner: "County Finance", path: "County -> National", due: "Tomorrow", state: "Ready", score: 94, type: "Financial", period: "Q2 2026", routingStage: "County validation", evidenceStatus: "Ledger pending" },
  { id: "rep-003", name: "Construction milestone report", owner: "District Works", path: "District -> County", due: "Overdue", state: "Escalated", score: 58, type: "Construction", period: "May 2026", routingStage: "District correction", evidenceStatus: "Photo packet incomplete", correctionReason: "Missing site photos" },
  { id: "rep-004", name: "Education directorate update", owner: "Directorate Office", path: "National -> Regional", due: "May 20", state: "Approved", score: 100, type: "Education", period: "May 2026", routingStage: "Regional archive", evidenceStatus: "Evidence verified", verified: true, approvedBy: "Regional HQ" },
  { id: "rep-005", name: "Kingdom Harvesters weekly evangelism report", owner: "Kingdom Harvesters", path: "Local Evangelism -> Area Office -> District Mission Desk", due: "Today", state: "Ready", score: 76, type: "Service Groups", period: "Current week", routingStage: "Evangelism review", evidenceStatus: "Outreach register pending", templateId: "tpl-service-kingdom-harvesters", templateChecklist: ["Outreach locations", "Souls reached", "Souls won", "Phone numbers collected", "Follow-up calls completed"] },
  { id: "rep-006", name: "Census service attendance report", owner: "Census Service Group", path: "Local Census -> Assistant Resident Pastor -> Church Growth Department", due: "Today", state: "In Review", score: 82, type: "Service Groups", period: "Current service", routingStage: "Attendance validation", evidenceStatus: "Attendance count pending", templateId: "tpl-service-census", templateChecklist: ["Total attendance", "Event or service name", "Attendance register", "Trend notes", "Submitted to growth department"] }
];

const missionServiceGroupReportTemplates: ReportTemplate[] = [
  {
    id: "tpl-service-sanitation",
    type: "Service Groups",
    name: "Sanitation Service Group Report",
    owner: "Sanitation Service Group",
    due: "Today",
    period: "Current week",
    path: "Local Branch -> Pastor in Charge -> Area Office",
    evidenceStatus: "Cleaning checklist pending",
    routingStage: "Service group closeout",
    approvalLimit: "Pastor in Charge acknowledgement",
    description: "Weekly report for sanctuary, restroom, compound, waste, chair arrangement, facility damage, and stewardship prayer duties.",
    checklist: ["Sanctuary cleaned", "Restrooms sanitized", "Trash disposed", "Damaged facilities reported", "Prayer and fasting observed"]
  },
  {
    id: "tpl-service-kingdom-harvesters",
    type: "Service Groups",
    name: "Kingdom Harvesters Evangelism Report",
    owner: "Kingdom Harvesters",
    due: "This week",
    period: "Current week",
    path: "Local Evangelism -> Area Office -> District Mission Desk",
    evidenceStatus: "Outreach register pending",
    routingStage: "Evangelism review",
    approvalLimit: "Area evangelism acknowledgement",
    description: "Weekly evangelism record for outreach locations, souls reached, souls won, phone contacts, materials distributed, and follow-up calls.",
    checklist: ["Outreach locations", "Souls reached", "Souls won", "Phone numbers collected", "Follow-up calls completed"]
  },
  {
    id: "tpl-service-choir",
    type: "Service Groups",
    name: "Choir Service Group Report",
    owner: "Choir Service Group",
    due: "This week",
    period: "Current week",
    path: "Local Choir -> Music Pastor -> Area Office",
    evidenceStatus: "Rehearsal schedule pending",
    routingStage: "Music ministry review",
    approvalLimit: "Music Pastor acknowledgement",
    description: "Choir ministry report for praise and worship service, song preparation, monthly declaration alignment, rehearsal, harmony, instruments, and spiritual discipline.",
    checklist: ["Songs prepared", "Services ministered", "Rehearsals held", "Instrument needs", "Prayer and fasting observed"]
  },
  {
    id: "tpl-service-ushering",
    type: "Service Groups",
    name: "Ushering Service Group Report",
    owner: "Ushering Service Group",
    due: "Today",
    period: "Current week",
    path: "Local Ushering -> Pastor in Charge -> Area Office",
    evidenceStatus: "Service coverage notes pending",
    routingStage: "Ushering review",
    approvalLimit: "Pastor in Charge acknowledgement",
    description: "Operational report for seating, visitor welcome, service order, latecomer support, queues, communion flow, and sanctuary order.",
    checklist: ["Seats arranged", "Visitors welcomed", "Latecomers assisted", "Queues managed", "Order issues reported"]
  },
  {
    id: "tpl-service-technical-sound",
    type: "Service Groups",
    name: "Technical Sound Service Group Report",
    owner: "Technical Sound Service Group",
    due: "Today",
    period: "Current week",
    path: "Local Technical -> Media Desk -> Area Office",
    evidenceStatus: "Equipment log pending",
    routingStage: "Technical review",
    approvalLimit: "Technical lead acknowledgement",
    description: "Sound operations report for microphones, mixers, speakers, monitors, power, troubleshooting, equipment storage, and service support.",
    checklist: ["Equipment tested", "Sound quality confirmed", "Faults reported", "Power issues noted", "Equipment stored safely"]
  },
  {
    id: "tpl-service-media",
    type: "Service Groups",
    name: "Media Service Group Report",
    owner: "Media Service Group",
    due: "This week",
    period: "Current week",
    path: "Local Media -> National Media -> Archive",
    evidenceStatus: "Media file links pending",
    routingStage: "Media review",
    approvalLimit: "Media lead approval",
    description: "Media operations report for cameras, projectors, screens, scriptures, lyrics, announcements, recordings, livestream, editing, passwords, and archives.",
    checklist: ["Media operated", "Announcements displayed", "Recordings archived", "Livestream status", "Password/content protection"]
  },
  {
    id: "tpl-service-kingdom-officers",
    type: "Service Groups",
    name: "Kingdom Officers Visitor Follow-Up Report",
    owner: "Kingdom Officers",
    due: "Today",
    period: "Current week",
    path: "Local Kingdom Officers -> Discipleship Desk -> Area Office",
    evidenceStatus: "Visitor cards pending",
    routingStage: "Visitor follow-up review",
    approvalLimit: "Discipleship desk acknowledgement",
    description: "Visitor and new convert care report for welcome forms, discipleship class reminders, counseling days, hospitality, encouragement, prayer, and confidentiality.",
    checklist: ["Visitor forms collected", "New converts called", "Discipleship reminders sent", "Counseling days shared", "Confidential records protected"]
  },
  {
    id: "tpl-service-protocol",
    type: "Service Groups",
    name: "Protocol Service Group Report",
    owner: "Protocol Service Group",
    due: "Today",
    period: "Current week",
    path: "Local Protocol -> Pastor in Charge -> District Administration",
    evidenceStatus: "Incident and movement log pending",
    routingStage: "Protocol review",
    approvalLimit: "Pastor in Charge acknowledgement",
    description: "Protocol and safety report for welcoming environment, movement control, property safety, vehicle parking, suspicious activity, and incident reporting.",
    checklist: ["Service movement managed", "Vehicles assisted", "Incidents reported", "Suspicious activity checked", "Order maintained"]
  },
  {
    id: "tpl-service-general-maintenance",
    type: "Service Groups",
    name: "General Maintenance Service Report",
    owner: "General Maintenance",
    due: "This week",
    period: "Current week",
    path: "Local Maintenance -> District Works -> Finance Desk",
    evidenceStatus: "Maintenance checklist pending",
    routingStage: "Maintenance review",
    approvalLimit: "Works desk acknowledgement",
    description: "Maintenance report for electrical appliances, wiring, lights, generators, air conditioners, plumbing, carpentry, inspections, repairs, and safety.",
    checklist: ["Electrical issues", "Generator status", "Cooling systems", "Building inspection", "Major damages reported"]
  },
  {
    id: "tpl-service-armour-bearers",
    type: "Service Groups",
    name: "Armour-Bearers Service Group Report",
    owner: "Armour-Bearers Service Group",
    due: "Today",
    period: "Current week",
    path: "Local Armour-Bearers -> Pastor in Charge -> Protocol Desk",
    evidenceStatus: "Leadership support log pending",
    routingStage: "Leadership movement review",
    approvalLimit: "Pastor in Charge acknowledgement",
    description: "Leadership support report for order around leadership, visiting ministers, guest reception, access control, safety, and immediate service needs.",
    checklist: ["Leadership movement supported", "Guests received", "Access controlled", "Safety measures coordinated", "Support needs logged"]
  },
  {
    id: "tpl-service-census",
    type: "Service Groups",
    name: "Census Service Group Attendance Report",
    owner: "Census Service Group",
    due: "Today",
    period: "Current service",
    path: "Local Census -> Assistant Resident Pastor -> Church Growth Department",
    evidenceStatus: "Attendance count pending",
    routingStage: "Attendance validation",
    approvalLimit: "Assistant Resident Pastor acknowledgement",
    description: "Attendance and census report for all services, events, programs, attendance accuracy, trend notes, and planning data.",
    checklist: ["Total attendance", "Event or service name", "Attendance register", "Trend notes", "Submitted to growth department"]
  }
];

const churchReportTemplates: ReportTemplate[] = [
  {
    id: "tpl-branch-admin",
    type: "Administrative",
    name: "Monthly Branch Administration Report",
    owner: "Branch Secretary",
    due: "This week",
    period: "Current month",
    path: "Local Branch -> Area Office -> District HQ",
    evidenceStatus: "Minutes and attendance pending",
    routingStage: "Branch drafting",
    approvalLimit: "Area supervisor review",
    description: "Standard monthly operating report for local branch leadership, activities, needs, and governance matters.",
    checklist: ["Meeting minutes", "Leadership updates", "Department summaries", "Open issues", "Required approvals"]
  },
  {
    id: "tpl-attendance",
    type: "Membership",
    name: "Weekly Attendance and Membership Report",
    owner: "Membership Desk",
    due: "Today",
    period: "Current week",
    path: "Local Branch -> Area Office",
    evidenceStatus: "Attendance register pending",
    routingStage: "Local validation",
    approvalLimit: "Area office acknowledgement",
    description: "Weekly rollup of worship attendance, visitors, absences, membership changes, and follow-up needs.",
    checklist: ["Service attendance", "Visitors", "New members", "Absentees needing follow-up", "Membership movements"]
  },
  {
    id: "tpl-weekly-service-meeting",
    type: "Meetings",
    name: "Weekly Worship Service Meeting Report",
    owner: "Branch Secretary",
    due: "Today",
    period: "Current week",
    path: "Local Branch -> Area Office",
    evidenceStatus: "Service notes and attendance pending",
    routingStage: "Weekly service closeout",
    approvalLimit: "Pastor and area acknowledgement",
    description: "Designed for the weekly worship service record, including attendance, message theme, offering summary, visitors, and follow-up actions.",
    checklist: ["Service date", "Attendance count", "Message theme", "Offering summary", "Visitor follow-up"]
  },
  {
    id: "tpl-weekly-leadership-meeting",
    type: "Meetings",
    name: "Weekly Leadership Meeting Report",
    owner: "Branch Secretary",
    due: "Today",
    period: "Current week",
    path: "Local Leadership -> Area Office -> District HQ",
    evidenceStatus: "Minutes and action list pending",
    routingStage: "Leadership minutes review",
    approvalLimit: "Lead pastor approval",
    description: "Weekly leadership meeting minutes with decisions, assignments, unresolved issues, and items requiring supervisory attention.",
    checklist: ["Attendees", "Agenda items", "Decisions", "Assigned actions", "Escalation items"]
  },
  {
    id: "tpl-monthly-general-meeting",
    type: "Meetings",
    name: "Monthly General Church Meeting Report",
    owner: "Branch Secretary",
    due: "This week",
    period: "Current month",
    path: "Local Branch -> Area Office -> District Secretariat",
    evidenceStatus: "Signed minutes pending",
    routingStage: "Monthly meeting review",
    approvalLimit: "Area supervisor approval",
    description: "Monthly whole-church meeting report for major updates, financial reading, ministry updates, member concerns, and approved motions.",
    checklist: ["Signed minutes", "Financial reading", "Ministry updates", "Member concerns", "Approved motions"]
  },
  {
    id: "tpl-monthly-workers-meeting",
    type: "Meetings",
    name: "Monthly Workers and Ministers Meeting Report",
    owner: "Ministers Desk",
    due: "This week",
    period: "Current month",
    path: "Local Ministers -> District Secretariat",
    evidenceStatus: "Attendance and assignment list pending",
    routingStage: "Workers meeting review",
    approvalLimit: "District secretary acknowledgement",
    description: "Monthly report for ministers, workers, teachers, ushers, choir leaders, and operational service teams.",
    checklist: ["Workers present", "Training notes", "Assignments", "Discipline issues", "Support needs"]
  },
  ...missionServiceGroupReportTemplates,
  {
    id: "tpl-board-meeting",
    type: "Meetings",
    name: "Board and Finance Committee Meeting Report",
    owner: "Board Secretary",
    due: "This week",
    period: "Meeting date",
    path: "Local Board -> District Administration -> County/State HQ",
    evidenceStatus: "Board minutes pending",
    routingStage: "Board decision review",
    approvalLimit: "District administration review",
    description: "Formal committee report for board decisions, finance approvals, property matters, governance issues, and signatures.",
    checklist: ["Board minutes", "Finance decisions", "Property matters", "Votes", "Required signatures"]
  },
  {
    id: "tpl-finance-tithe",
    type: "Financial",
    name: "Tithe and Offering Finance Report",
    owner: "Finance Desk",
    due: "Today",
    period: "Current week",
    path: "Local Finance -> District Finance -> County Finance",
    evidenceStatus: "Ledger and deposit slip pending",
    routingStage: "Finance validation",
    approvalLimit: "District finance sign-off",
    description: "Official stewardship report for tithe, offering, special collections, deposits, and variance notes.",
    checklist: ["Collection totals", "Deposit reference", "Cash count signatures", "Expense deductions", "Variance explanation"]
  },
  {
    id: "tpl-weekly-financial-report",
    type: "Financial",
    name: "Weekly Financial Report",
    owner: "Finance Desk",
    due: "Today",
    period: "Current week",
    path: "Local Finance -> District Finance",
    evidenceStatus: "Weekly ledger pending",
    routingStage: "Weekly finance review",
    approvalLimit: "Treasurer and pastor sign-off",
    description: "Weekly financial summary for income, expenses, deposits, pending payments, and cash balance.",
    checklist: ["Opening balance", "Weekly income", "Weekly expenses", "Deposits", "Closing balance"]
  },
  {
    id: "tpl-monthly-financial-statement",
    type: "Financial",
    name: "Monthly Financial Statement",
    owner: "Finance Desk",
    due: "This week",
    period: "Current month",
    path: "Local Finance -> District Finance -> County Finance",
    evidenceStatus: "Monthly statement and receipts pending",
    routingStage: "Monthly finance validation",
    approvalLimit: "District finance approval",
    description: "Complete monthly financial statement for income categories, expense categories, balances, liabilities, and notes.",
    checklist: ["Income summary", "Expense summary", "Bank balance", "Cash balance", "Liabilities and notes"]
  },
  {
    id: "tpl-bank-reconciliation",
    type: "Financial",
    name: "Bank Deposit and Reconciliation Report",
    owner: "Treasury Desk",
    due: "This week",
    period: "Current month",
    path: "Local Treasury -> District Finance -> Audit Desk",
    evidenceStatus: "Bank statement pending",
    routingStage: "Reconciliation review",
    approvalLimit: "Finance and audit verification",
    description: "Reconciliation report matching collections, deposits, bank statements, withdrawals, and outstanding items.",
    checklist: ["Deposit slips", "Bank statement", "Ledger match", "Outstanding items", "Treasurer signature"]
  },
  {
    id: "tpl-special-fundraising",
    type: "Financial",
    name: "Special Fundraising and Project Finance Report",
    owner: "Project Finance Desk",
    due: "This week",
    period: "Project period",
    path: "Local Project Desk -> District Finance -> County/State HQ",
    evidenceStatus: "Pledge and payment register pending",
    routingStage: "Project finance review",
    approvalLimit: "Project committee approval",
    description: "Financial report for fundraising programs, pledges, donations, project spending, restricted funds, and balances.",
    checklist: ["Pledges", "Collections received", "Restricted funds", "Project expenses", "Remaining balance"]
  },
  {
    id: "tpl-budget-expense",
    type: "Financial",
    name: "Department Expense and Budget Report",
    owner: "Department Finance Officer",
    due: "This week",
    period: "Current month",
    path: "Department -> Station Finance -> Supervising Office",
    evidenceStatus: "Receipts pending",
    routingStage: "Budget review",
    approvalLimit: "Budget holder and finance approval",
    description: "Tracks department spending, approved budgets, receipts, balances, and requests for additional release.",
    checklist: ["Budget line", "Amount spent", "Receipts", "Remaining balance", "Additional request"]
  },
  {
    id: "tpl-mission-outreach",
    type: "Mission",
    name: "Mission Outreach Activity Report",
    owner: "Mission Desk",
    due: "Tomorrow",
    period: "Current month",
    path: "Local Mission -> District Mission -> National Programs",
    evidenceStatus: "Photos and testimony notes pending",
    routingStage: "Mission review",
    approvalLimit: "District mission endorsement",
    description: "Captures outreach activity, locations reached, workers involved, outcomes, resources used, and follow-up needs.",
    checklist: ["Outreach location", "Workers present", "Souls reached", "Materials used", "Follow-up plan"]
  },
  {
    id: "tpl-evangelism",
    type: "Mission",
    name: "Evangelism and Souls Won Report",
    owner: "Evangelism Desk",
    due: "This week",
    period: "Current month",
    path: "Local Evangelism -> Area Office -> District HQ",
    evidenceStatus: "Convert cards pending",
    routingStage: "Area review",
    approvalLimit: "Area evangelism acknowledgement",
    description: "Designed for recording evangelism work, new converts, prayer requests, follow-up assignments, and baptism readiness.",
    checklist: ["Outreach date", "New converts", "Prayer requests", "Follow-up leaders", "Baptism candidates"]
  },
  {
    id: "tpl-education",
    type: "Education",
    name: "Education and Sunday School Report",
    owner: "Education Desk",
    due: "Tomorrow",
    period: "Current month",
    path: "Local Education -> District Education -> National Education",
    evidenceStatus: "Lesson roster pending",
    routingStage: "Education review",
    approvalLimit: "District education approval",
    description: "Education ministry update for classes, teachers, attendance, curriculum progress, and student development needs.",
    checklist: ["Classes held", "Teacher roster", "Student attendance", "Curriculum progress", "Material needs"]
  },
  {
    id: "tpl-youth",
    type: "Youth",
    name: "Youth Ministry Activity Report",
    owner: "Youth Ministry Desk",
    due: "This week",
    period: "Current month",
    path: "Local Youth -> District Youth -> National Youth",
    evidenceStatus: "Activity photos pending",
    routingStage: "Youth desk review",
    approvalLimit: "District youth approval",
    description: "Prebuilt youth ministry report covering programs, attendance, discipline, leadership training, and requests.",
    checklist: ["Programs held", "Youth attendance", "Leadership training", "Challenges", "Resource requests"]
  },
  {
    id: "tpl-women",
    type: "Women",
    name: "Women's Ministry Report",
    owner: "Women's Ministry Desk",
    due: "This week",
    period: "Current month",
    path: "Local Women -> District Women -> National Women",
    evidenceStatus: "Program notes pending",
    routingStage: "Ministry review",
    approvalLimit: "District ministry endorsement",
    description: "Monthly ministry report for fellowship activity, service work, teaching, member care, and planned programs.",
    checklist: ["Fellowship meetings", "Service activities", "Teaching sessions", "Member care", "Upcoming programs"]
  },
  {
    id: "tpl-men",
    type: "Men",
    name: "Men's Fellowship Report",
    owner: "Men's Fellowship Desk",
    due: "This week",
    period: "Current month",
    path: "Local Men -> District Men -> National Men",
    evidenceStatus: "Attendance notes pending",
    routingStage: "Fellowship review",
    approvalLimit: "District fellowship acknowledgement",
    description: "Operational report for men's fellowship meetings, projects, discipline support, and leadership assignments.",
    checklist: ["Meeting attendance", "Projects", "Leadership assignments", "Family support cases", "Needs"]
  },
  {
    id: "tpl-media",
    type: "Media",
    name: "Media and Communications Report",
    owner: "Media Desk",
    due: "This week",
    period: "Current month",
    path: "Local Media -> National Media -> Regional Communications",
    evidenceStatus: "Media links pending",
    routingStage: "Communications review",
    approvalLimit: "National media approval",
    description: "Captures broadcasts, announcements, media assets, equipment condition, publication needs, and communications risks.",
    checklist: ["Broadcasts", "Announcements", "Media assets", "Equipment status", "Publication requests"]
  },
  {
    id: "tpl-choir-music",
    type: "Worship",
    name: "Choir and Music Ministry Report",
    owner: "Music Ministry Desk",
    due: "This week",
    period: "Current month",
    path: "Local Music Ministry -> District Worship Desk",
    evidenceStatus: "Rehearsal and service notes pending",
    routingStage: "Worship ministry review",
    approvalLimit: "Worship leader acknowledgement",
    description: "Full music ministry report for choir attendance, rehearsals, service participation, instruments, uniforms, and worship needs.",
    checklist: ["Choir attendance", "Rehearsals", "Service participation", "Instrument status", "Worship needs"]
  },
  {
    id: "tpl-ushers-protocol",
    type: "Operations",
    name: "Ushers and Protocol Report",
    owner: "Protocol Desk",
    due: "This week",
    period: "Current month",
    path: "Local Protocol -> Area Office -> District Administration",
    evidenceStatus: "Service coverage notes pending",
    routingStage: "Protocol review",
    approvalLimit: "Operations supervisor review",
    description: "Operational report for ushering, seating, visitor handling, order of service support, protocol incidents, and needs.",
    checklist: ["Ushers assigned", "Visitor support", "Seating/order issues", "Protocol incidents", "Needs"]
  },
  {
    id: "tpl-security-safety",
    type: "Operations",
    name: "Security and Safety Report",
    owner: "Safety Desk",
    due: "Today",
    period: "Current week",
    path: "Local Safety -> District Administration -> National Secretariat",
    evidenceStatus: "Safety log pending",
    routingStage: "Safety review",
    approvalLimit: "District administrator escalation",
    description: "Security and safety report for service coverage, incidents, crowd control, emergency readiness, and corrective action.",
    checklist: ["Security coverage", "Incidents", "Emergency readiness", "Risks", "Corrective action"]
  },
  {
    id: "tpl-children-ministry",
    type: "Children",
    name: "Children's Ministry Report",
    owner: "Children's Ministry Desk",
    due: "This week",
    period: "Current month",
    path: "Local Children -> District Education -> National Education",
    evidenceStatus: "Class roster pending",
    routingStage: "Children's ministry review",
    approvalLimit: "Education desk approval",
    description: "Designed report for children's classes, safeguarding notes, teacher assignments, attendance, materials, and parent follow-up.",
    checklist: ["Class attendance", "Teacher assignments", "Safeguarding notes", "Learning materials", "Parent follow-up"]
  },
  {
    id: "tpl-construction",
    type: "Construction",
    name: "Construction and Facilities Progress Report",
    owner: "Works Desk",
    due: "This week",
    period: "Current month",
    path: "Local Works -> District Works -> County Works",
    evidenceStatus: "Photo packet pending",
    routingStage: "Works validation",
    approvalLimit: "County works review",
    description: "Facilities and construction report for project milestones, materials, site photos, spending, and blockers.",
    checklist: ["Milestone status", "Materials received", "Site photos", "Labor update", "Blockers"]
  },
  {
    id: "tpl-welfare",
    type: "Social Development",
    name: "Welfare and Social Development Report",
    owner: "Welfare Desk",
    due: "This week",
    period: "Current month",
    path: "Local Welfare -> District Welfare -> National Programs",
    evidenceStatus: "Case notes pending",
    routingStage: "Welfare review",
    approvalLimit: "District welfare approval",
    description: "Preloaded report for benevolence, social assistance, community development, and vulnerable member support.",
    checklist: ["Support cases", "Community activity", "Assistance issued", "Pending needs", "Confidential notes"]
  },
  {
    id: "tpl-prayer-counseling",
    type: "Pastoral Care",
    name: "Prayer and Counseling Report",
    owner: "Pastoral Care Desk",
    due: "This week",
    period: "Current week",
    path: "Local Pastoral Care -> Area Office -> District HQ",
    evidenceStatus: "Confidential summary pending",
    routingStage: "Pastoral review",
    approvalLimit: "Pastoral supervisor review",
    description: "Confidential administrative summary of prayer sessions, counseling volume, urgent care needs, and referrals.",
    checklist: ["Prayer requests", "Counseling sessions", "Urgent cases", "Referrals", "Pastoral follow-up"]
  },
  {
    id: "tpl-pastoral-visitation",
    type: "Pastoral Care",
    name: "Pastoral Visitation Report",
    owner: "Pastoral Care Desk",
    due: "This week",
    period: "Current week",
    path: "Local Pastoral Care -> Area Office",
    evidenceStatus: "Visitation notes pending",
    routingStage: "Pastoral care review",
    approvalLimit: "Pastor acknowledgement",
    description: "Report for home visits, member care visits, prayer visits, follow-up needs, and confidential pastoral concerns.",
    checklist: ["Members visited", "Visit purpose", "Care needs", "Follow-up owner", "Confidential concerns"]
  },
  {
    id: "tpl-hospital-bereavement",
    type: "Pastoral Care",
    name: "Hospital and Bereavement Care Report",
    owner: "Care Ministry Desk",
    due: "Today",
    period: "Current week",
    path: "Local Care Ministry -> District Pastoral Care",
    evidenceStatus: "Care action summary pending",
    routingStage: "Urgent care review",
    approvalLimit: "Pastoral supervisor review",
    description: "Sensitive care report for hospital visitation, bereavement cases, family support, urgent needs, and ministry response.",
    checklist: ["Hospital cases", "Bereavement cases", "Family support", "Urgent needs", "Care actions"]
  },
  {
    id: "tpl-baptism-converts",
    type: "Membership",
    name: "Baptism and New Converts Report",
    owner: "Membership Desk",
    due: "This week",
    period: "Current month",
    path: "Local Branch -> Area Office -> District Secretariat",
    evidenceStatus: "Candidate register pending",
    routingStage: "Membership validation",
    approvalLimit: "District secretariat acknowledgement",
    description: "Tracks new converts, baptism candidates, completed baptisms, discipleship assignments, and records updates.",
    checklist: ["New converts", "Baptism candidates", "Completed baptisms", "Discipleship leader", "Record updates"]
  },
  {
    id: "tpl-membership-transfer",
    type: "Membership",
    name: "Membership Transfer-In and Transfer-Out Report",
    owner: "Membership Desk",
    due: "This week",
    period: "Current month",
    path: "Local Membership -> Area Office -> District Secretariat",
    evidenceStatus: "Membership movement register pending",
    routingStage: "Membership movement review",
    approvalLimit: "District secretariat acknowledgement",
    description: "Records members transferring between branches, incoming confirmations, outgoing releases, pastoral notes, and records updates.",
    checklist: ["Incoming members", "Outgoing members", "Release letters", "Receiving branch", "Record updates"]
  },
  {
    id: "tpl-discipleship-training",
    type: "Education",
    name: "Discipleship and Training Report",
    owner: "Discipleship Desk",
    due: "This week",
    period: "Current month",
    path: "Local Discipleship -> District Education -> National Education",
    evidenceStatus: "Training roster pending",
    routingStage: "Discipleship review",
    approvalLimit: "Education desk acknowledgement",
    description: "Training report for discipleship classes, teacher assignments, participant progress, materials, and graduation readiness.",
    checklist: ["Classes held", "Participants", "Teacher assignments", "Progress notes", "Graduation readiness"]
  },
  {
    id: "tpl-transfer-personnel",
    type: "Personnel",
    name: "Transfer and Personnel Movement Report",
    owner: "Personnel Desk",
    due: "Today",
    period: "Current month",
    path: "Station Personnel -> Mission Office -> National Secretariat",
    evidenceStatus: "Transfer letter pending",
    routingStage: "Personnel validation",
    approvalLimit: "Mission office authorization",
    description: "Administrative report for transfers, assignments, acknowledgements, permission changes, and station onboarding.",
    checklist: ["Transfer letter", "Current station", "New station", "Acknowledgement", "Access change"]
  },
  {
    id: "tpl-church-plant",
    type: "Growth",
    name: "New Branch and Church Plant Report",
    owner: "Mission Expansion Desk",
    due: "This week",
    period: "Current month",
    path: "Mission Expansion -> District HQ -> National Programs",
    evidenceStatus: "Planting evidence pending",
    routingStage: "Expansion review",
    approvalLimit: "National programs review",
    description: "Report for new branch openings, church plants, community location, leaders assigned, attendance, needs, and launch risk.",
    checklist: ["Location", "Assigned leaders", "Launch attendance", "Facility status", "Support needs"]
  },
  {
    id: "tpl-audit",
    type: "Audit",
    name: "Audit Compliance Packet",
    owner: "Audit Desk",
    due: "Today",
    period: "Current quarter",
    path: "Station Audit -> County Audit -> National Audit",
    evidenceStatus: "Compliance evidence pending",
    routingStage: "Audit review",
    approvalLimit: "National audit sign-off",
    description: "Formal audit packet for policy compliance, finance evidence, approval records, exceptions, and corrective action.",
    checklist: ["Policy acknowledgements", "Finance evidence", "Approval records", "Exceptions", "Corrective action"]
  },
  {
    id: "tpl-incident-care",
    type: "Pastoral Care",
    name: "Incident and Pastoral Care Report",
    owner: "Pastoral Care Desk",
    due: "Today",
    period: "Incident date",
    path: "Local Branch -> District HQ -> National Secretariat",
    evidenceStatus: "Incident statement pending",
    routingStage: "Confidential review",
    approvalLimit: "District leadership escalation",
    description: "Sensitive incident report for pastoral care, safety concerns, dispute mediation, and leadership attention.",
    checklist: ["Incident summary", "Persons involved", "Care action", "Risk level", "Escalation need"]
  },
  {
    id: "tpl-inventory",
    type: "Asset",
    name: "Inventory and Asset Report",
    owner: "Asset Desk",
    due: "This week",
    period: "Current quarter",
    path: "Local Asset Desk -> District Administration -> County Administration",
    evidenceStatus: "Asset photos pending",
    routingStage: "Asset verification",
    approvalLimit: "District administration approval",
    description: "Inventory report for church property, equipment, condition, custody, maintenance needs, and replacement requests.",
    checklist: ["Asset list", "Condition", "Custodian", "Photos", "Maintenance request"]
  },
  {
    id: "tpl-asset-maintenance",
    type: "Asset",
    name: "Asset Maintenance Request Report",
    owner: "Asset Desk",
    due: "Today",
    period: "Request date",
    path: "Local Asset Desk -> District Administration -> Finance Desk",
    evidenceStatus: "Repair estimate pending",
    routingStage: "Maintenance request review",
    approvalLimit: "Administration and finance approval",
    description: "Maintenance request report for buildings, vehicles, instruments, electronics, furniture, and other church assets.",
    checklist: ["Asset details", "Fault or damage", "Repair estimate", "Urgency", "Approval request"]
  },
  {
    id: "tpl-program-budget-request",
    type: "Planning",
    name: "Program Planning and Budget Request Report",
    owner: "Program Planning Desk",
    due: "This week",
    period: "Program period",
    path: "Program Desk -> Station Finance -> Supervising Office",
    evidenceStatus: "Program plan and budget pending",
    routingStage: "Planning review",
    approvalLimit: "Finance and supervising office approval",
    description: "Complete planning packet for church programs, objectives, budget, logistics, responsible teams, and approvals.",
    checklist: ["Program objective", "Budget request", "Logistics", "Responsible teams", "Approval signatures"]
  },
  {
    id: "tpl-discipline-mediation",
    type: "Governance",
    name: "Church Discipline and Mediation Report",
    owner: "Governance Desk",
    due: "Today",
    period: "Case date",
    path: "Local Leadership -> District Governance -> National Secretariat",
    evidenceStatus: "Confidential case notes pending",
    routingStage: "Governance review",
    approvalLimit: "District leadership review",
    description: "Confidential governance report for discipline matters, mediation sessions, resolutions, pastoral care, and escalation needs.",
    checklist: ["Case summary", "Mediation notes", "Resolution", "Pastoral care", "Escalation need"]
  },
  {
    id: "tpl-special-ceremony",
    type: "Event",
    name: "Marriage, Dedication, and Special Ceremony Report",
    owner: "Ceremony Desk",
    due: "This week",
    period: "Ceremony date",
    path: "Local Ceremony Desk -> District Secretariat",
    evidenceStatus: "Ceremony record pending",
    routingStage: "Ceremony record review",
    approvalLimit: "District secretariat archive",
    description: "Official record for marriages, child dedications, ordinations, memorial services, and special church ceremonies.",
    checklist: ["Ceremony type", "Names involved", "Officiating minister", "Date and venue", "Records update"]
  },
  {
    id: "tpl-community-impact",
    type: "Social Development",
    name: "Community Impact Report",
    owner: "Community Impact Desk",
    due: "This week",
    period: "Current month",
    path: "Local Impact Desk -> District Welfare -> National Programs",
    evidenceStatus: "Impact evidence pending",
    routingStage: "Community impact review",
    approvalLimit: "National programs acknowledgement",
    description: "Community-facing report for outreach impact, assistance programs, partnerships, beneficiaries, and testimony evidence.",
    checklist: ["Activity summary", "Beneficiaries", "Partners", "Impact evidence", "Follow-up needs"]
  },
  {
    id: "tpl-prayer-revival",
    type: "Worship",
    name: "Prayer Revival and Special Service Report",
    owner: "Prayer Ministry Desk",
    due: "Today",
    period: "Service period",
    path: "Local Prayer Ministry -> Area Office -> District HQ",
    evidenceStatus: "Special service notes pending",
    routingStage: "Special service review",
    approvalLimit: "Area office acknowledgement",
    description: "Report for revivals, prayer vigils, special services, attendance, spiritual outcomes, testimonies, and follow-up actions.",
    checklist: ["Service dates", "Attendance", "Prayer focus", "Testimonies", "Follow-up actions"]
  },
  {
    id: "tpl-quarterly-department",
    type: "Executive",
    name: "Quarterly Department Performance Report",
    owner: "Department Head",
    due: "This week",
    period: "Current quarter",
    path: "Department -> National Secretariat -> Regional HQ",
    evidenceStatus: "Quarterly evidence pending",
    routingStage: "Department performance review",
    approvalLimit: "National secretariat review",
    description: "Quarterly performance report for each department covering objectives, outcomes, finances, risks, and next-quarter plans.",
    checklist: ["Objectives", "Outcomes", "Finance position", "Risks", "Next-quarter plan"]
  },
  {
    id: "tpl-annual-state-work",
    type: "Executive",
    name: "Annual Church State-of-the-Work Report",
    owner: "Executive Secretariat",
    due: "This week",
    period: "Current year",
    path: "National HQ -> Regional HQ -> International HQ",
    evidenceStatus: "Annual evidence packet pending",
    routingStage: "Annual executive review",
    approvalLimit: "Executive council approval",
    description: "Annual leadership report summarizing church growth, ministries, finances, governance, risks, major decisions, and strategic direction.",
    checklist: ["Growth summary", "Ministry outcomes", "Finance overview", "Governance risks", "Strategic direction"]
  },
  {
    id: "tpl-district-summary",
    type: "Executive",
    name: "District Consolidated Summary Report",
    owner: "District Secretariat",
    due: "This week",
    period: "Current month",
    path: "District HQ -> County/State HQ -> National HQ",
    evidenceStatus: "Branch summaries pending",
    routingStage: "District consolidation",
    approvalLimit: "County secretariat review",
    description: "District-level rollup of branch reports, ministry performance, financial posture, escalations, and priority needs.",
    checklist: ["Branch summaries", "Finance position", "Mission activity", "Escalations", "Priority needs"]
  },
  {
    id: "tpl-executive-summary",
    type: "Executive",
    name: "Regional and National Executive Summary",
    owner: "Executive Secretariat",
    due: "This week",
    period: "Current quarter",
    path: "National HQ -> Regional HQ -> International HQ",
    evidenceStatus: "Consolidated evidence pending",
    routingStage: "Executive synthesis",
    approvalLimit: "Executive council review",
    description: "High-level governance summary for leadership review, operating performance, risks, decisions, and executive actions.",
    checklist: ["Performance metrics", "Major risks", "Finance overview", "Leadership decisions", "Executive actions"]
  },
  {
    id: "tpl-convention",
    type: "Event",
    name: "Annual Convention and Event Report",
    owner: "Events Desk",
    due: "This week",
    period: "Event period",
    path: "Event Desk -> National Secretariat -> Regional HQ",
    evidenceStatus: "Event packet pending",
    routingStage: "Event closeout",
    approvalLimit: "National secretariat approval",
    description: "Event closeout report for conventions, conferences, attendance, finances, logistics, media, and decisions.",
    checklist: ["Attendance", "Finance closeout", "Logistics", "Program notes", "Decisions"]
  }
];

function reportTemplateSections(template: ReportTemplate) {
  return Array.from(new Set([
    "Executive summary",
    "Reporting period activity",
    "Attendance / participation",
    "Financial or resource notes",
    ...template.checklist,
    "Risks, corrections, and needs",
    "Next actions"
  ])).slice(0, 9);
}

function defaultReportFields(template: ReportTemplate) {
  return Object.fromEntries(reportTemplateSections(template).map((section) => [section, ""])) as Record<string, string>;
}

function completedReportFields(fields?: Record<string, string>) {
  return Object.values(fields ?? {}).filter((value) => value.trim().length > 0).length;
}

const workflows = [
  { label: "Financial approvals", count: 18, status: "5 awaiting signatures", progress: 72, tone: "green" },
  { label: "Mission reports", count: 43, status: "9 corrections requested", progress: 64, tone: "blue" },
  { label: "Transfer acknowledgements", count: 7, status: "2 session changes pending", progress: 48, tone: "amber" },
  { label: "Escalation queue", count: 11, status: "3 executive alerts", progress: 82, tone: "red" }
];

const initialApprovals: Approval[] = [
  { id: "app-001", request: "County youth program budget", route: "District -> County -> National", limit: "$24,800", state: "Validation", signatures: "0/3" },
  { id: "app-002", request: "Area vehicle repair release", route: "Area -> District Finance", limit: "$3,400", state: "Signature", signatures: "1/2" },
  { id: "app-003", request: "Branch media equipment purchase", route: "Local -> Area -> District", limit: "$6,750", state: "Delegation check", signatures: "0/3" },
  { id: "app-004", request: "Regional conference logistics", route: "National -> Regional -> International", limit: "$62,000", state: "Escalated", signatures: "2/5" }
];

const initialTasks: GovernanceTask[] = [
  { id: "tsk-001", title: "Review county finance packet", owner: "County Finance", assignee: "National Secretariat", priority: "High", due: "Today", status: "In Progress" },
  { id: "tsk-002", title: "Confirm district construction photos", owner: "District Works", assignee: "Buchanan District Office", priority: "Critical", due: "Overdue", status: "Blocked" },
  { id: "tsk-003", title: "Prepare regional mission briefing", owner: "National Programs", assignee: "National Presidency", priority: "Medium", due: "Tomorrow", status: "Queued" }
];

const initialPolicies: Policy[] = [
  { id: "pol-001", title: "Financial approval delegation policy", category: "Finance", owner: "National HQ", status: "Active", summary: "All finance requests above $5,000 require delegated authority validation.", acknowledgements: 42 },
  { id: "pol-002", title: "Transfer session invalidation rule", category: "Transfers", owner: "International HQ", status: "Active", summary: "Previous station sessions must be revoked before new station access is activated.", acknowledgements: 37 },
  { id: "pol-003", title: "Report evidence retention standard", category: "Archive", owner: "Regional HQ", status: "Review", summary: "Report evidence packets remain permanently available in the object vault.", acknowledgements: 24 }
];

const initialCalendarEvents: CalendarEvent[] = [
  { id: "cal-001", title: "National audit packet deadline", category: "Audit", owner: "National Secretariat", date: "2026-05-18", priority: "High", status: "Scheduled" },
  { id: "cal-002", title: "Regional mission briefing", category: "Meeting", owner: "Regional HQ - West Africa", date: "2026-05-20", priority: "Medium", status: "Scheduled" },
  { id: "cal-003", title: "Construction evidence review", category: "Review", owner: "District Works", date: "2026-05-17", priority: "Critical", status: "At Risk" }
];

const initialLiveSessions: LiveSession[] = [
  { id: "live-001", title: "District reporting review", host: "National Presidency Workstation", sessionType: "Report Review", status: "Live", linkedRecord: "National mission activity report", route: "National HQ -> District HQ", purpose: "Review branch reporting packets", participants: ["np@rmvi.org", "district_admin@rmvi.org"], notes: ["Review open corrections before upward summary"], files: ["May reporting packet"], createdAt: "08:10 PM" },
  { id: "live-002", title: "Finance approval discussion", host: "Finance Desk Workstation", sessionType: "Approval Room", status: "Queued", linkedRecord: "County youth program budget", route: "Finance Office -> District -> County", purpose: "Validate budget release signatures", participants: ["finance@rmvi.org"], notes: [], files: [], createdAt: "08:18 PM" },
  { id: "live-003", title: "Executive emergency briefing", host: "International Executive Workstation", sessionType: "Broadcast", status: "Priority", linkedRecord: "Construction milestone report", route: "HQ broadcast channel", purpose: "Coordinate escalation response", participants: ["international@rmvi.org", "admin@rmvi.org"], notes: ["Construction packet needs evidence confirmation"], files: [], createdAt: "08:25 PM" }
];

const initialPersonnel: PersonRecord[] = [
  { id: "per-001", name: "Rev. Daniel Moore", role: "District Coordinator", currentStation: "Buchanan District", assignedStation: "Riverbend Area Office", status: "Transfer Pending" },
  { id: "per-002", name: "Sis. Amelia Hart", role: "Education Desk Officer", currentStation: "Local Branch 017", assignedStation: "County Education Desk", status: "Active" },
  { id: "per-003", name: "Bro. Nathan Cole", role: "Media Director", currentStation: "National Media", assignedStation: "Regional Communications", status: "Active" }
];

const initialTransfers: Transfer[] = [
  { id: "trn-001", person: "Rev. Daniel Moore", from: "Buchanan District", to: "Riverbend Area Office", step: "Recipient acknowledgement", risk: "Session switch pending" },
  { id: "trn-002", person: "Sis. Amelia Hart", from: "Local Branch 017", to: "County Education Desk", step: "Permissions migration", risk: "Role graph update ready" },
  { id: "trn-003", person: "Bro. Nathan Cole", from: "National Media", to: "Regional Communications", step: "Digital signature", risk: "Waiting on mission office" }
];

const initialOffices: Office[] = [
  {
    id: "ofc-001",
    name: "Riverbend Area Office",
    email: "riverbend_area@rmvi.org",
    level: "Area HQ",
    department: "Area Coordination",
    supervisor: "Buchanan District",
    nodeKind: "Office",
    parentName: "Buchanan District",
    permissionPreset: "Reporter",
    reportingRoute: "Area HQ -> Buchanan District -> Supervising authority -> Archive vault",
    workflowAccess: ["ChurchMail", "Reports", "Tasks", "Archive", "Live Comms"],
    password: demoStationPassword("riverbend"),
    status: "Provisioned"
  }
];

const initialEscalations: Escalation[] = [
  {
    id: "esc-001",
    source: "Report",
    item: "Construction milestone report",
    reason: "Overdue packet with incomplete supporting photos",
    severity: "Critical",
    status: "Open",
    owner: "District Works"
  },
  {
    id: "esc-002",
    source: "Approval",
    item: "Regional conference logistics",
    reason: "Authority limit requires executive review",
    severity: "High",
    status: "Open",
    owner: "Regional Secretariat"
  }
];

const initialAiDrafts: AiDraft[] = [
  {
    id: "ai-001",
    kind: "Executive Summary",
    title: "Daily governance control brief",
    body: "Current operations show active report movement, pending approval chains, and two escalation items requiring supervisory review. Priority attention should remain on construction reporting and regional conference logistics.",
    sourceCount: 8,
    createdAt: "08:32"
  }
];

const initialDocuments: DocumentRecord[] = [
  {
    id: "doc-001",
    name: "Q2 governance directive.pdf",
    classification: "Policy memo",
    source: "ChurchMail",
    owner: "Regional HQ - West Africa",
    fileType: "PDF",
    status: "Archived",
    storageKey: "gcos-object-vault/demo/q2-governance-directive.pdf",
    retainedUntil: "Permanent",
    createdAt: "08:18"
  },
  {
    id: "doc-002",
    name: "Construction progress photos.zip",
    classification: "Report evidence",
    source: "Report",
    owner: "Buchanan District Office",
    fileType: "Images",
    status: "In Review",
    storageKey: "gcos-object-vault/demo/construction-progress-photos.zip",
    retainedUntil: "Permanent",
    createdAt: "08:24"
  }
];

const initialAuditRows: AuditRow[] = [
  { id: "aud-001", event: "Login", actor: "np@rmvi.org", object: "National Presidency Workstation", result: "Allowed", time: "08:11" },
  { id: "aud-002", event: "ApprovalGranted", actor: "district_admin@rmvi.org", object: "Area vehicle repair release", result: "Logged", time: "08:14" },
  { id: "aud-003", event: "EscalationTriggered", actor: "Workflow Engine", object: "Construction milestone report", result: "Executive alert", time: "08:21" },
  { id: "aud-004", event: "TransferExecuted", actor: "Mission Office", object: "Area Coordinator reassignment", result: "Session invalidated", time: "08:27" },
  { id: "aud-005", event: "OfficeCreated", actor: "international@rmvi.org", object: "Riverbend Area Office", result: "Graph updated", time: "08:31" }
];

const initialOfflineQueue: OfflineAction[] = [];
const initialOfflineSyncHistory: OfflineSyncRecord[] = [];

const initialEvents = [
  "ReportSubmitted: Local Branch 017",
  "ApprovalGranted: District Finance",
  "EmailSent: National Directive",
  "TransferExecuted: Area Coordinator",
  "EscalationTriggered: Overdue Audit Packet",
  "OfficeCreated: Riverbend Area Office"
];

function isSection(value: string | null): value is Section {
  return navItems.some((item) => item.label === value);
}

function adminRouteRequested() {
  return window.location.pathname.replace(/\/+$/, "") === "/admin";
}

function getInitialSection(): Section {
  if (adminRouteRequested()) return "Admin Board";
  const section = new URLSearchParams(window.location.search).get("section");
  return isSection(section) ? section : "Control Center";
}

function sectionPath(section: Section) {
  if (section === "Admin Board") return "/admin";
  if (section === "Control Center") return "/";
  return `/?section=${encodeURIComponent(section).replaceAll("%20", "+")}`;
}

function inferFileType(files: string) {
  const value = files.toLowerCase();
  if (value.includes("photo") || value.includes("image")) return "Images";
  if (value.includes("spreadsheet") || value.includes("xls")) return "Spreadsheet";
  if (value.includes("voice") || value.includes("audio")) return "Audio";
  if (value.includes("video")) return "Video";
  if (value.includes("zip") || value.includes("archive")) return "Archive";
  return "PDF";
}

function inferFileExtension(files: string) {
  const type = inferFileType(files);
  if (type === "Images" || type === "Archive") return "zip";
  if (type === "Spreadsheet") return "xlsx";
  if (type === "Audio") return "mp3";
  if (type === "Video") return "mp4";
  return "pdf";
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    const stored = window.localStorage.getItem(key);
    if (!stored) return initialValue;

    try {
      const parsed = JSON.parse(stored.replaceAll("@rmi.org", "@rmvi.org").replaceAll("@gcos.org", "@rmvi.org")) as T;
      if (Array.isArray(initialValue) && !Array.isArray(parsed)) return initialValue;
      if (initialValue !== null && typeof initialValue === "object" && (parsed === null || typeof parsed !== "object")) return initialValue;
      return parsed;
    } catch {
      return initialValue;
    }
  });

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function usePwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(() => window.matchMedia("(display-mode: standalone)").matches);

  React.useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPromptEvent(null);
  }

  return {
    canInstall: Boolean(promptEvent),
    installed,
    install
  };
}

function useNetworkStatus() {
  const [online, setOnline] = React.useState(() => navigator.onLine);

  React.useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    }
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json() as Promise<T>;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

async function downloadStoredFile(file: FileReference) {
  const response = await fetch(`${API_BASE}/api/files/${file.id}/download`, {
    headers: {
      ...(getSessionToken() ? { authorization: `Bearer ${getSessionToken()}` } : {})
    }
  });
  if (!response.ok) throw new Error(`File ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename: string, content: string, contentType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: contentType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getSessionToken() {
  const stored = window.localStorage.getItem("gcos.session");
  if (!stored) return "";

  try {
    const session = JSON.parse(stored) as Session;
    return session.token ?? "";
  } catch {
    return "";
  }
}

function iconForLevel(level: StationLevel | string) {
  if (level === "International HQ") return Globe2;
  if (level === "National HQ") return Landmark;
  if (level === "Local Branch") return Inbox;
  return Building2;
}

function resolveStationIcon(station: Pick<StationCard, "icon" | "level">) {
  const icon = station.icon as unknown;
  if (typeof icon === "function") return station.icon;
  return iconForLevel(station.level);
}

function normalizeStationEmail(email: string) {
  return email.toLowerCase().replace("@rmi.org", "@rmvi.org").replace("@gcos.org", "@rmvi.org");
}

function buildOfflineConflicts(queue: OfflineAction[]): OfflineConflict[] {
  const grouped = queue.reduce<Map<string, OfflineAction[]>>((map, action) => {
    const key = action.object.trim().toLowerCase();
    const existing = map.get(key) ?? [];
    existing.push(action);
    map.set(key, existing);
    return map;
  }, new Map());

  return Array.from(grouped.entries())
    .filter(([, actions]) => actions.length > 1)
    .map(([object, actions]) => ({
      id: object,
      object: actions[0]?.object ?? object,
      count: actions.length,
      latestEvent: actions[0]?.event ?? "OfflineAction",
      priority: actions.some((action) => action.priority === "Critical" || action.result.toLowerCase().includes("escalated")) ? "High" : "Review"
    }));
}

function getPermissions(station: StationCard): Permissions {
  const level = station.level;
  const preset = station.permissionPreset;
  return {
    canCreateOffices: preset === "Executive Override" || preset === "Office Admin" || ["International HQ", "Regional HQ", "National HQ"].includes(level),
    canApprove: ["Executive Override", "Office Admin", "Approver", "Department Lead"].includes(String(preset)) || ["International HQ", "Regional HQ", "National HQ", "County/State HQ", "District HQ"].includes(level),
    canExecuteTransfers: preset === "Executive Override" || preset === "Transfer Officer" || ["International HQ", "Regional HQ", "National HQ", "District HQ"].includes(level),
    canOverride: preset === "Executive Override" || ["International HQ", "Regional HQ"].includes(level)
  };
}

function stationDepartment(station: StationCard) {
  return station.authority.split(",")[0]?.trim() || "Church Administration";
}

type WorkstationProfile = {
  key: string;
  label: string;
  title: string;
  description: string;
  focus: string[];
  defaultMessageTo: string;
  defaultMessageSubject: string;
  defaultFiles: string;
  defaultReportName: string;
  defaultReportType: string;
  reportTypes: string[];
  defaultTaskTitle: string;
  primaryTools: Array<{ icon: React.ElementType; label: string; detail: string; section: Section }>;
  queueLabel: string;
};

function stationSearchValue(station: StationCard) {
  return `${station.email} ${station.title} ${station.authority} ${station.level}`.toLowerCase();
}

function hasStationTerm(station: StationCard, terms: string[]) {
  const value = stationSearchValue(station);
  return terms.some((term) => value.includes(term));
}

function isFinanceStation(station: StationCard) {
  return hasStationTerm(station, ["finance", "budget", "offering", "tithe", "stewardship"]);
}

function isAuditStation(station: StationCard) {
  return hasStationTerm(station, ["audit", "compliance", "evidence", "control"]);
}

function isMissionStation(station: StationCard) {
  return hasStationTerm(station, ["mission", "evangelism", "kingdom harvesters", "church planting", "outreach"]);
}

function isMediaStation(station: StationCard) {
  return hasStationTerm(station, ["media", "communications", "technical sound"]);
}

function isPersonnelStation(station: StationCard) {
  return hasStationTerm(station, ["personnel", "transfer", "assignment", "secretariat"]);
}

function isPastoralCareStation(station: StationCard) {
  return hasStationTerm(station, ["pastoral care", "pastor", "counseling", "visitation", "bereavement"]);
}

function isEducationStation(station: StationCard) {
  return hasStationTerm(station, ["education", "sunday school", "discipleship", "children", "teens", "youth"]);
}

function isFacilitiesStation(station: StationCard) {
  return hasStationTerm(station, ["construction", "facilities", "maintenance", "sanitation"]);
}

function isSafetyStation(station: StationCard) {
  return hasStationTerm(station, ["security", "safety", "protocol"]);
}

function isWelfareStation(station: StationCard) {
  return hasStationTerm(station, ["welfare", "social development", "good samaritans"]);
}

function isWorshipStation(station: StationCard) {
  return hasStationTerm(station, ["choir", "worship", "music", "ushering"]);
}

function getAllowedSections(station: StationCard, permissions: Permissions): Section[] {
  if (permissions.canOverride) return navItems.map((item) => item.label);

  const allowed = new Set<Section>(["Control Center", "ChurchMail", "Reports", "Tasks", "Policies", "Calendar", "Archive", "Live Comms", "Account Settings"]);
  if (permissions.canApprove || isFinanceStation(station)) allowed.add("Approvals");
  if (permissions.canExecuteTransfers || isMissionStation(station) || isPersonnelStation(station)) allowed.add("Transfers");
  if (permissions.canCreateOffices) allowed.add("Offices");
  if (["National HQ", "County/State HQ", "District HQ"].includes(station.level)) {
    allowed.add("Escalations");
    allowed.add("Hierarchy");
  }
  if (isMissionStation(station) || isPersonnelStation(station) || isPastoralCareStation(station) || station.level !== "Local Branch") allowed.add("Personnel");
  if (isAuditStation(station)) allowed.add("Audit");
  if (isMediaStation(station) || isEducationStation(station) || station.level !== "Local Branch") allowed.add("AI Desk");
  return navItems.map((item) => item.label).filter((section) => allowed.has(section));
}

function makeProfile(profile: WorkstationProfile): WorkstationProfile {
  return profile;
}

function getWorkstationProfile(station: StationCard, permissions: Permissions): WorkstationProfile {
  const department = stationDepartment(station);
  if (permissions.canOverride) {
    return makeProfile({
      key: "admin",
      label: "Executive administration",
      title: "System administration dashboard",
      description: "Global command, users, offices, audit, deployment, and governance control.",
      focus: ["Admin board", "Office lifecycle", "Audit and sessions", "Deployment health"],
      defaultMessageTo: "All National and Regional Offices",
      defaultMessageSubject: "Executive governance directive",
      defaultFiles: "Directive memo, policy attachment",
      defaultReportName: "Executive governance summary",
      defaultReportType: "Executive",
      reportTypes: ["Executive", "Governance", "Audit", "Administrative"],
      defaultTaskTitle: "Review governance readiness queue",
      primaryTools: [
        { icon: SlidersHorizontal, label: "Admin Board", detail: "Users, offices, sessions", section: "Admin Board" },
        { icon: Building2, label: "Offices", detail: "Create and approve stations", section: "Offices" },
        { icon: ShieldCheck, label: "Audit", detail: "Seal records and sessions", section: "Audit" },
        { icon: AlertTriangle, label: "Escalations", detail: "Executive attention queue", section: "Escalations" }
      ],
      queueLabel: "Executive queue"
    });
  }
  if (isFinanceStation(station)) {
    return makeProfile({
      key: "finance",
      label: "Finance workstation",
      title: "Finance and stewardship dashboard",
      description: "Review finance reports, send ChurchMail, attach evidence, request approvals, and prepare audit records.",
      focus: ["Finance inbox", "Weekly finance report", "Approval requests", "Audit evidence"],
      defaultMessageTo: "District Finance Desk",
      defaultMessageSubject: "Weekly tithe and offering finance report",
      defaultFiles: "Deposit slip, ledger, receipt packet",
      defaultReportName: "Weekly financial report",
      defaultReportType: "Financial",
      reportTypes: ["Financial", "Audit", "Planning", "Administrative"],
      defaultTaskTitle: "Reconcile weekly offering deposit",
      primaryTools: [
        { icon: FileBarChart2, label: "Finance Reports", detail: "Tithe, offering, budgets", section: "Reports" },
        { icon: Signature, label: "Approvals", detail: "Release and budget chains", section: "Approvals" },
        { icon: Files, label: "Evidence", detail: "Receipts and deposits", section: "Archive" },
        { icon: Mail, label: "Finance Mail", detail: "Send to treasury", section: "ChurchMail" }
      ],
      queueLabel: "Finance queue"
    });
  }
  if (isAuditStation(station)) {
    return makeProfile({
      key: "audit",
      label: "Audit workstation",
      title: "Compliance and evidence dashboard",
      description: "Review audit packets, verify evidence, seal archive records, and track policy compliance.",
      focus: ["Audit inbox", "Evidence vault", "Policy checks", "Exception review"],
      defaultMessageTo: "National Audit Desk",
      defaultMessageSubject: "Audit compliance packet review",
      defaultFiles: "Evidence packet, signed checklist",
      defaultReportName: "Audit compliance packet",
      defaultReportType: "Audit",
      reportTypes: ["Audit", "Financial", "Governance", "Administrative"],
      defaultTaskTitle: "Verify evidence chain for submitted packet",
      primaryTools: [
        { icon: ShieldCheck, label: "Audit Desk", detail: "Controls and exceptions", section: "Audit" },
        { icon: ArchiveIcon, label: "Evidence Vault", detail: "Seal and verify files", section: "Archive" },
        { icon: ClipboardCheck, label: "Policies", detail: "Compliance checklist", section: "Policies" },
        { icon: AlertTriangle, label: "Escalations", detail: "Late and failed controls", section: "Escalations" }
      ],
      queueLabel: "Compliance queue"
    });
  }
  if (isMissionStation(station)) {
    return makeProfile({
      key: "mission",
      label: "Mission workstation",
      title: "Mission and evangelism dashboard",
      description: "Send outreach updates, complete evangelism reports, track follow-up tasks, and manage mission movement.",
      focus: ["ChurchMail", "Evangelism report", "Follow-up tasks", "Mission transfers"],
      defaultMessageTo: "Area Mission Office",
      defaultMessageSubject: "Weekly evangelism and souls won update",
      defaultFiles: "Outreach report, attendance sheet, contact list",
      defaultReportName: "Kingdom Harvesters weekly evangelism report",
      defaultReportType: "Service Groups",
      reportTypes: ["Service Groups", "Mission", "Membership", "Pastoral Care"],
      defaultTaskTitle: "Follow up with new converts",
      primaryTools: [
        { icon: Send, label: "Send Update", detail: "Outreach and testimony mail", section: "ChurchMail" },
        { icon: FileCheck2, label: "Evangelism Report", detail: "Souls reached and won", section: "Reports" },
        { icon: Users, label: "Follow-up", detail: "Contacts and converts", section: "Personnel" },
        { icon: GitBranch, label: "Transfers", detail: "Mission movement", section: "Transfers" }
      ],
      queueLabel: "Mission queue"
    });
  }
  if (isEducationStation(station)) {
    return makeProfile({
      key: "education",
      label: "Education workstation",
      title: "Education and discipleship dashboard",
      description: "Manage Sunday School reports, class attendance, teacher assignments, youth activity, and discipleship progress.",
      focus: ["Class reports", "Teacher tasks", "Attendance", "Training notes"],
      defaultMessageTo: "Education Directorate",
      defaultMessageSubject: "Sunday School and discipleship update",
      defaultFiles: "Class roster, lesson notes, attendance sheet",
      defaultReportName: "Education and Sunday School Report",
      defaultReportType: "Education",
      reportTypes: ["Education", "Youth", "Children", "Membership", "Executive"],
      defaultTaskTitle: "Confirm teacher attendance and lesson completion",
      primaryTools: [
        { icon: ScrollText, label: "Class Reports", detail: "Lessons and attendance", section: "Reports" },
        { icon: Users, label: "Students", detail: "Children, youth, converts", section: "Personnel" },
        { icon: CalendarDays, label: "Schedule", detail: "Classes and training", section: "Calendar" },
        { icon: Sparkles, label: "AI Drafts", detail: "Summaries and memos", section: "AI Desk" }
      ],
      queueLabel: "Education queue"
    });
  }
  if (isPastoralCareStation(station)) {
    return makeProfile({
      key: "pastoral-care",
      label: "Pastoral care workstation",
      title: "Care, visitation, and counseling dashboard",
      description: "Track confidential care summaries, prayer needs, hospital visits, bereavement support, and pastoral follow-up tasks.",
      focus: ["Care inbox", "Visitation", "Prayer reports", "Sensitive archive"],
      defaultMessageTo: "Pastoral Supervisor",
      defaultMessageSubject: "Pastoral visitation and care update",
      defaultFiles: "Care summary, visitation notes",
      defaultReportName: "Pastoral Visitation Report",
      defaultReportType: "Pastoral Care",
      reportTypes: ["Pastoral Care", "Membership", "Social Development", "Administrative"],
      defaultTaskTitle: "Schedule care follow-up for member family",
      primaryTools: [
        { icon: Users, label: "Care List", detail: "Members needing follow-up", section: "Personnel" },
        { icon: FileText, label: "Care Reports", detail: "Prayer and visitation", section: "Reports" },
        { icon: ArchiveIcon, label: "Confidential Archive", detail: "Sensitive records", section: "Archive" },
        { icon: Mail, label: "Care Mail", detail: "Route updates securely", section: "ChurchMail" }
      ],
      queueLabel: "Care queue"
    });
  }
  if (isFacilitiesStation(station)) {
    return makeProfile({
      key: "facilities",
      label: "Facilities workstation",
      title: "Facilities, construction, and maintenance dashboard",
      description: "Track construction milestones, repairs, building needs, equipment condition, safety blockers, and photo evidence.",
      focus: ["Maintenance", "Construction", "Photos", "Budget requests"],
      defaultMessageTo: "District Works Desk",
      defaultMessageSubject: "Facilities and maintenance status update",
      defaultFiles: "Site photos, repair estimate, materials list",
      defaultReportName: "Construction and Facilities Progress Report",
      defaultReportType: "Construction",
      reportTypes: ["Construction", "Asset", "Operations", "Financial"],
      defaultTaskTitle: "Upload construction or repair evidence",
      primaryTools: [
        { icon: Building2, label: "Facilities", detail: "Projects and repairs", section: "Reports" },
        { icon: Upload, label: "Photo Evidence", detail: "Attach files", section: "Archive" },
        { icon: Signature, label: "Budget Approval", detail: "Funds and releases", section: "Approvals" },
        { icon: SquareCheckBig, label: "Work Orders", detail: "Maintenance tasks", section: "Tasks" }
      ],
      queueLabel: "Facilities queue"
    });
  }
  if (isSafetyStation(station)) {
    return makeProfile({
      key: "safety",
      label: "Safety workstation",
      title: "Security, protocol, and safety dashboard",
      description: "Record service coverage, incidents, protocol duties, movement control, emergency readiness, and escalation needs.",
      focus: ["Incident reports", "Protocol tasks", "Safety coverage", "Escalations"],
      defaultMessageTo: "District Administration",
      defaultMessageSubject: "Security and protocol service report",
      defaultFiles: "Incident note, coverage sheet",
      defaultReportName: "Security and Safety Report",
      defaultReportType: "Operations",
      reportTypes: ["Operations", "Event", "Governance", "Administrative"],
      defaultTaskTitle: "Review next service safety coverage",
      primaryTools: [
        { icon: AlertTriangle, label: "Incidents", detail: "Safety and protocol reports", section: "Reports" },
        { icon: SquareCheckBig, label: "Coverage Tasks", detail: "Service assignments", section: "Tasks" },
        { icon: Mail, label: "Notify", detail: "Route alerts", section: "ChurchMail" },
        { icon: ArchiveIcon, label: "Incident Archive", detail: "Evidence records", section: "Archive" }
      ],
      queueLabel: "Safety queue"
    });
  }
  if (isWelfareStation(station)) {
    return makeProfile({
      key: "welfare",
      label: "Welfare workstation",
      title: "Welfare and social development dashboard",
      description: "Organize benevolence requests, community impact, vulnerable member support, assistance records, and follow-up work.",
      focus: ["Member assistance", "Community impact", "Requests", "Follow-up"],
      defaultMessageTo: "Social Development Desk",
      defaultMessageSubject: "Welfare and social development update",
      defaultFiles: "Assistance register, beneficiary notes",
      defaultReportName: "Welfare and Social Development Report",
      defaultReportType: "Social Development",
      reportTypes: ["Social Development", "Pastoral Care", "Membership", "Financial"],
      defaultTaskTitle: "Confirm welfare follow-up and assistance record",
      primaryTools: [
        { icon: Users, label: "Beneficiaries", detail: "Member support", section: "Personnel" },
        { icon: FileText, label: "Welfare Reports", detail: "Assistance and impact", section: "Reports" },
        { icon: Signature, label: "Release Requests", detail: "Aid approvals", section: "Approvals" },
        { icon: ArchiveIcon, label: "Records", detail: "Evidence and privacy", section: "Archive" }
      ],
      queueLabel: "Welfare queue"
    });
  }
  if (isMediaStation(station)) {
    return makeProfile({
      key: "media",
      label: "Media workstation",
      title: "Media and communications dashboard",
      description: "Manage service media, announcements, recordings, livestream notes, equipment status, and communication archives.",
      focus: ["Announcements", "Recordings", "Equipment", "Media archive"],
      defaultMessageTo: "Media and Communications Desk",
      defaultMessageSubject: "Media service and communications report",
      defaultFiles: "Recording log, announcement file, equipment note",
      defaultReportName: "Media and Communications Report",
      defaultReportType: "Media",
      reportTypes: ["Media", "Worship", "Operations", "Event"],
      defaultTaskTitle: "Archive service recording and media notes",
      primaryTools: [
        { icon: RadioTower, label: "Broadcast", detail: "Livestream and media", section: "Reports" },
        { icon: Files, label: "Media Archive", detail: "Recordings and files", section: "Archive" },
        { icon: Sparkles, label: "Draft Memo", detail: "AI announcements", section: "AI Desk" },
        { icon: Mail, label: "Communications", detail: "Official notices", section: "ChurchMail" }
      ],
      queueLabel: "Media queue"
    });
  }
  if (isWorshipStation(station)) {
    return makeProfile({
      key: "worship",
      label: "Worship service workstation",
      title: "Choir, worship, and service order dashboard",
      description: "Coordinate choir, music, ushering, worship preparation, service participation, and order-of-service records.",
      focus: ["Rehearsal", "Service report", "Attendance", "Needs"],
      defaultMessageTo: "Worship and Service Coordination",
      defaultMessageSubject: "Worship service group report",
      defaultFiles: "Choir roster, service notes, attendance sheet",
      defaultReportName: "Choir Service Group Report",
      defaultReportType: "Worship",
      reportTypes: ["Worship", "Service Groups", "Meetings", "Operations"],
      defaultTaskTitle: "Confirm rehearsal and service assignments",
      primaryTools: [
        { icon: FileCheck2, label: "Service Report", detail: "Choir and worship record", section: "Reports" },
        { icon: CalendarDays, label: "Rehearsal", detail: "Schedule and attendance", section: "Calendar" },
        { icon: SquareCheckBig, label: "Assignments", detail: "Service duties", section: "Tasks" },
        { icon: Mail, label: "Notify Teams", detail: "Route service updates", section: "ChurchMail" }
      ],
      queueLabel: "Service queue"
    });
  }
  if (station.level === "District HQ" || station.level === "County/State HQ" || station.level === "National HQ") {
    return makeProfile({
      key: "supervisory",
      label: `${station.level} workstation`,
      title: "Supervisory governance dashboard",
      description: "Review lower-office reports, issue directives, approve work, monitor escalations, and route summaries upward.",
      focus: ["Incoming reports", "Approvals", "Escalations", "Directives"],
      defaultMessageTo: "Supervised Offices",
      defaultMessageSubject: "Governance reporting directive",
      defaultFiles: "Directive memo, report checklist",
      defaultReportName: "District Consolidated Summary Report",
      defaultReportType: "Executive",
      reportTypes: ["Executive", "Administrative", "Governance", "Financial", "Mission"],
      defaultTaskTitle: "Review lower-office report packet",
      primaryTools: [
        { icon: Inbox, label: "Incoming Reports", detail: "Review submissions", section: "Reports" },
        { icon: Signature, label: "Approvals", detail: "Delegated chains", section: "Approvals" },
        { icon: AlertTriangle, label: "Escalations", detail: "Bottleneck watch", section: "Escalations" },
        { icon: GitBranch, label: "Hierarchy", detail: "Reporting structure", section: "Hierarchy" }
      ],
      queueLabel: "Supervisory queue"
    });
  }
  return makeProfile({
    key: "local",
    label: `${department} workstation`,
    title: "Local church workstation",
    description: "Read messages, send updates, complete reports, manage tasks, and archive evidence for your office.",
    focus: ["Inbox", "Send message", "Start report", "Archive"],
    defaultMessageTo: "Area Office",
    defaultMessageSubject: "Weekly branch administration update",
    defaultFiles: "Meeting notes, attendance sheet",
    defaultReportName: "Monthly branch administration report",
    defaultReportType: "Administrative",
    reportTypes: ["Administrative", "Meetings", "Membership", "Service Groups", "Financial"],
    defaultTaskTitle: "Prepare weekly branch update",
    primaryTools: [
      { icon: Mail, label: "Inbox", detail: "Read and reply", section: "ChurchMail" },
      { icon: FileCheck2, label: "Reports", detail: "Prepare submission", section: "Reports" },
      { icon: SquareCheckBig, label: "Tasks", detail: "Assigned work", section: "Tasks" },
      { icon: ArchiveIcon, label: "Archive", detail: "Files and evidence", section: "Archive" }
    ],
    queueLabel: "Station queue"
  });
}

function App() {
  const [session, setSession] = usePersistentState<Session | null>("gcos.session", null);
  const initialStation = stations.find((station) => station.email === session?.email) ?? stations[1];
  const [activeStation, setActiveStation] = React.useState<StationCard>(initialStation);
  const [activeSection, setActiveSection] = React.useState<Section>(getInitialSection);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [offlineMode, setOfflineMode] = React.useState(false);
  const pwa = usePwaInstallPrompt();
  const networkOnline = useNetworkStatus();
  const syncInFlightRef = React.useRef(false);
  const networkWasOfflineRef = React.useRef(!networkOnline);
  const [messages, setMessages] = usePersistentState("gcos.messages", initialMessages);
  const [reports, setReports] = usePersistentState("gcos.reports", initialReports);
  const [approvals, setApprovals] = usePersistentState("gcos.approvals", initialApprovals);
  const [tasks, setTasks] = usePersistentState("gcos.tasks", initialTasks);
  const [policies, setPolicies] = usePersistentState("gcos.policies", initialPolicies);
  const [calendarEvents, setCalendarEvents] = usePersistentState("gcos.calendarEvents", initialCalendarEvents);
  const [liveSessions, setLiveSessions] = usePersistentState("gcos.liveSessions", initialLiveSessions);
  const [personnel, setPersonnel] = usePersistentState("gcos.personnel", initialPersonnel);
  const [transfers, setTransfers] = usePersistentState("gcos.transfers", initialTransfers);
  const [offices, setOffices] = usePersistentState("gcos.offices", initialOffices);
  const [apiStations, setApiStations] = usePersistentState<StationCard[]>("gcos.stations", stations);
  const [stationPasswordOverrides, setStationPasswordOverrides] = usePersistentState<Record<string, string>>("gcos.stationPasswordOverrides", {});
  const [escalations, setEscalations] = usePersistentState("gcos.escalations", initialEscalations);
  const [aiDrafts, setAiDrafts] = usePersistentState("gcos.aiDrafts", initialAiDrafts);
  const [documents, setDocuments] = usePersistentState("gcos.documents", initialDocuments);
  const [auditRows, setAuditRows] = usePersistentState("gcos.auditRows", initialAuditRows);
  const [events, setEvents] = usePersistentState("gcos.events", initialEvents);
  const [offlineQueue, setOfflineQueue] = usePersistentState("gcos.offlineQueue", initialOfflineQueue);
  const [offlineSyncHistory, setOfflineSyncHistory] = usePersistentState("gcos.offlineSyncHistory", initialOfflineSyncHistory);
  const [apiStatus, setApiStatus] = React.useState<ApiStatus | null>(null);
  const [apiStatusError, setApiStatusError] = React.useState("");
  const [commandBriefing, setCommandBriefing] = React.useState<CommandBriefing | null>(null);
  const [archiveManifest, setArchiveManifest] = React.useState<ArchiveManifest | null>(null);
  const [workflowDigest, setWorkflowDigest] = React.useState<WorkflowDigest | null>(null);
  const [escalationDigest, setEscalationDigest] = React.useState<EscalationDigest | null>(null);
  const [personnelDigest, setPersonnelDigest] = React.useState<PersonnelDigest | null>(null);
  const [transferDigest, setTransferDigest] = React.useState<TransferDigest | null>(null);
  const [officeDigest, setOfficeDigest] = React.useState<OfficeDigest | null>(null);
  const [hierarchyDigest, setHierarchyDigest] = React.useState<HierarchyDigest | null>(null);
  const [auditDigest, setAuditDigest] = React.useState<AuditDigest | null>(null);
  const [eventDigest, setEventDigest] = React.useState<EventDigest | null>(null);
  const [readinessDigest, setReadinessDigest] = React.useState<ReadinessDigest | null>(null);
  const [sessionDigest, setSessionDigest] = React.useState<SessionDigest | null>(null);
  const [taskDigest, setTaskDigest] = React.useState<TaskDigest | null>(null);
  const [policyDigest, setPolicyDigest] = React.useState<PolicyDigest | null>(null);
  const [calendarDigest, setCalendarDigest] = React.useState<CalendarDigest | null>(null);
  const [messageDigest, setMessageDigest] = React.useState<MessageDigest | null>(null);
  const [reportDigest, setReportDigest] = React.useState<ReportDigest | null>(null);
  const [approvalDigest, setApprovalDigest] = React.useState<ApprovalDigest | null>(null);
  const [aiDraftDigest, setAiDraftDigest] = React.useState<AiDraftDigest | null>(null);
  const stationDirectory = React.useMemo<StationCard[]>(() => {
    const directory = new Map<string, StationCard>();
    stations.filter((station) => station.status !== "Deleted").forEach((station) => {
      const email = normalizeStationEmail(station.email);
      directory.set(email, { ...station, email, icon: resolveStationIcon(station) });
    });
    apiStations.filter((station) => station.status !== "Deleted").forEach((station) => {
      const email = normalizeStationEmail(station.email);
      directory.set(email, { ...station, email, icon: resolveStationIcon(station) });
    });
    offices.filter((office) => office.status !== "Deleted").forEach((office) => {
      const email = normalizeStationEmail(office.email);
      directory.set(email, {
        id: office.id,
        email,
        title: `${office.name} Workstation`,
        level: office.level,
        authority: `${office.department}, supervised by ${office.supervisor}`,
        icon: Building2,
        status: office.status,
        verified: office.emailVerified,
        nodeKind: office.nodeKind,
        parentId: office.parentId,
        parentName: office.parentName,
        permissionPreset: office.permissionPreset,
        reportingRoute: office.reportingRoute,
        workflowAccess: office.workflowAccess
      });
    });
    return Array.from(directory.values());
  }, [apiStations, offices]);
  const offlineConflicts = React.useMemo(() => buildOfflineConflicts(offlineQueue), [offlineQueue]);
  const StationIcon = resolveStationIcon(activeStation);
  const permissions = getPermissions(activeStation);
  const allowedSections = React.useMemo(() => getAllowedSections(activeStation, permissions), [activeStation, permissions]);
  const visibleStationDirectory = React.useMemo(() => {
    if (permissions.canOverride) return stationDirectory;
    return stationDirectory.filter((station) => normalizeStationEmail(station.email) === normalizeStationEmail(activeStation.email));
  }, [activeStation.email, permissions.canOverride, stationDirectory]);
  const operatingMetrics = React.useMemo(() => {
    const commandCount = messages.filter((item) => ["Directive", "Notification", "Transfer"].includes(item.kind)).length + transfers.length;
    const activeReportCount = reports.filter((item) => item.state !== "Approved").length + tasks.filter((item) => item.status !== "Complete").length;
    const openEscalationCount = escalations.filter((item) => item.status !== "Resolved").length;
    const onTrackWorkflows = reports.filter((item) => item.state === "Approved").length
      + approvals.filter((item) => item.state === "Approved").length
      + tasks.filter((item) => item.status === "Complete").length
      + policies.filter((item) => item.status === "Active").length
      + calendarEvents.filter((item) => item.status === "Complete").length
      + personnel.filter((item) => item.status === "Assigned").length
      + escalations.filter((item) => item.status === "Resolved").length;
    const totalTrackedWorkflows = reports.length + approvals.length + tasks.length + policies.length + calendarEvents.length + personnel.length + escalations.length;
    const sla = totalTrackedWorkflows ? Math.round((onTrackWorkflows / totalTrackedWorkflows) * 100) : 100;
    return {
      commands: commandCount,
      activeReports: activeReportCount,
      sla,
      auditEvents: auditRows.length,
      commandTrend: offlineQueue.length ? `${offlineQueue.length} queued` : `${messages.length} signals`,
      reportTrend: openEscalationCount ? `${openEscalationCount} escalated` : "clear",
      slaTrend: sla >= 80 ? "on time" : "watch",
      auditTrend: documents.length ? `${documents.length} vaulted` : "immutable"
    };
  }, [approvals, auditRows, calendarEvents, documents, escalations, messages, offlineQueue, personnel, policies, reports, tasks, transfers]);
  const notifications = React.useMemo<NotificationItem[]>(() => [
    ...escalations
      .filter((item) => item.status !== "Resolved")
      .map((item) => ({
        id: item.id,
        section: "Escalations" as Section,
        title: item.item,
        detail: item.reason,
        severity: item.severity === "Critical" ? "Critical" as const : "High" as const
      })),
    ...approvals
      .filter((item) => item.state !== "Approved")
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        section: "Approvals" as Section,
        title: item.request,
        detail: `${item.route} - ${item.signatures} signatures`,
        severity: item.state === "Escalated" ? "High" as const : "Medium" as const
      })),
    ...tasks
      .filter((item) => item.status !== "Complete")
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        section: "Tasks" as Section,
        title: item.title,
        detail: `${item.assignee} - ${item.due}`,
        severity: item.priority === "Critical" ? "Critical" as const : item.priority === "High" ? "High" as const : "Medium" as const
      })),
    ...policies
      .filter((item) => item.status === "Review" || item.status === "Draft")
      .slice(0, 2)
      .map((item) => ({
        id: item.id,
        section: "Policies" as Section,
        title: item.title,
        detail: `${item.category} - ${item.status}`,
        severity: item.status === "Draft" ? "Medium" as const : "Info" as const
      })),
    ...calendarEvents
      .filter((item) => item.status !== "Complete")
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        section: "Calendar" as Section,
        title: item.title,
        detail: `${item.date} - ${item.owner}`,
        severity: item.priority === "Critical" ? "Critical" as const : item.priority === "High" ? "High" as const : "Info" as const
      })),
    ...personnel
      .filter((item) => item.status === "Transfer Pending")
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        section: "Personnel" as Section,
        title: item.name,
        detail: `${item.currentStation} -> ${item.assignedStation}`,
        severity: "Medium" as const
      })),
    ...transfers
      .filter((item) => item.step !== "New station login ready")
      .slice(0, 2)
      .map((item) => ({
        id: item.id,
        section: "Transfers" as Section,
        title: item.person,
        detail: `${item.from} -> ${item.to}`,
        severity: "Medium" as const
      })),
    ...offlineQueue.slice(0, 2).map((item) => ({
      id: item.id,
      section: "Control Center" as Section,
      title: item.object,
      detail: `${item.event} queued at ${item.queuedAt}`,
      severity: "Info" as const
    })),
    ...auditRows
      .filter((item) => ["Login", "TransferExecuted", "DocumentArchived", "EscalationTriggered"].includes(item.event))
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        section: "Audit" as Section,
        title: item.event,
        detail: `${item.object} - ${item.result}`,
        severity: item.event === "EscalationTriggered" ? "High" as const : "Info" as const
      }))
  ].filter((item) => allowedSections.includes(item.section)).slice(0, 10), [allowedSections, approvals, auditRows, calendarEvents, escalations, offlineQueue, personnel, policies, tasks, transfers]);
  const criticalNotificationCount = notifications.filter((item) => ["Critical", "High"].includes(item.severity)).length;

  React.useEffect(() => {
    if (!allowedSections.includes(activeSection)) {
      setActiveSection("Control Center");
      window.history.replaceState({}, "", sectionPath("Control Center"));
    }
  }, [activeSection, allowedSections]);

  const effectiveSection: Section = allowedSections.includes(activeSection) ? activeSection : "Control Center";

  const searchResults = React.useMemo(() => {
    const records: SearchResult[] = [
      ...messages.map((item) => ({ id: item.id, section: "ChurchMail" as Section, title: item.subject, meta: `${item.kind} - ${item.from} - ${item.files}`, status: item.status })),
      ...reports.map((item) => ({ id: item.id, section: "Reports" as Section, title: item.name, meta: `${item.owner} - ${item.path} - ${item.due}`, status: item.state })),
      ...approvals.map((item) => ({ id: item.id, section: "Approvals" as Section, title: item.request, meta: `${item.route} - ${item.limit}`, status: item.state })),
      ...tasks.map((item) => ({ id: item.id, section: "Tasks" as Section, title: item.title, meta: `${item.owner} - ${item.assignee} - ${item.priority} - ${item.due}`, status: item.status })),
      ...policies.map((item) => ({ id: item.id, section: "Policies" as Section, title: item.title, meta: `${item.category} - ${item.owner} - ${item.summary}`, status: item.status })),
      ...calendarEvents.map((item) => ({ id: item.id, section: "Calendar" as Section, title: item.title, meta: `${item.category} - ${item.owner} - ${item.date} - ${item.priority}`, status: item.status })),
      ...liveSessions.map((item) => ({ id: item.id, section: "Live Comms" as Section, title: item.title, meta: `${item.sessionType} - ${item.host} - ${item.route} - ${item.linkedRecord}`, status: item.status })),
      ...personnel.map((item) => ({ id: item.id, section: "Personnel" as Section, title: item.name, meta: `${item.role} - ${item.currentStation} -> ${item.assignedStation}`, status: item.status })),
      ...escalations.map((item) => ({ id: item.id, section: "Escalations" as Section, title: item.item, meta: `${item.owner} - ${item.reason}`, status: item.status })),
      ...offices.map((item) => ({ id: item.id, section: "Offices" as Section, title: item.name, meta: `${item.email} - ${item.level} - ${item.supervisor}`, status: item.status })),
      ...transfers.map((item) => ({ id: item.id, section: "Transfers" as Section, title: item.person, meta: `${item.from} -> ${item.to} - ${item.risk}`, status: item.step })),
      ...documents.map((item) => ({ id: item.id, section: "Archive" as Section, title: item.name, meta: `${item.classification} - ${item.source} - ${item.owner}`, status: item.status })),
      ...auditRows.map((item) => ({ id: item.id, section: "Audit" as Section, title: item.object, meta: `${item.event} - ${item.actor} - ${item.result}`, status: item.time }))
    ];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return records
      .filter((record) => allowedSections.includes(record.section))
      .filter((record) => [record.title, record.meta, record.status, record.section].join(" ").toLowerCase().includes(query))
      .slice(0, 8);
  }, [allowedSections, approvals, auditRows, calendarEvents, documents, escalations, liveSessions, messages, offices, personnel, policies, reports, searchQuery, tasks, transfers]);

  function openSection(section: Section) {
    const nextSection = allowedSections.includes(section) ? section : "Control Center";
    setActiveSection(nextSection);
    window.history.pushState({}, "", sectionPath(nextSection));
  }

  function openSearchResult(result: SearchResult) {
    openSection(result.section);
    setSearchQuery("");
  }

  function openNotification(item: NotificationItem) {
    openSection(item.section);
    setNotificationsOpen(false);
  }

  async function refreshFromApi() {
    try {
      const status = await apiRequest<ApiStatus>("/api/status");
      setApiStatus(status);
      setApiStatusError("");
      const data = await apiRequest<{
        stations: StationCard[];
        messages: Message[];
        reports: Report[];
        approvals: Approval[];
        tasks: GovernanceTask[];
        policies: Policy[];
        calendarEvents: CalendarEvent[];
        liveSessions: LiveSession[];
        personnel: PersonRecord[];
        escalations: Escalation[];
        transfers: Transfer[];
        offices: Office[];
        documents: DocumentRecord[];
        aiDrafts: AiDraft[];
        audit: AuditRow[];
        events: string[];
      }>("/api/bootstrap/public");
      setApiStations(data.stations.length ? data.stations : stations);
      setMessages(data.messages);
      setReports(data.reports);
      setApprovals(data.approvals);
      setTasks(data.tasks ?? initialTasks);
      setPolicies(data.policies ?? initialPolicies);
      setCalendarEvents(data.calendarEvents ?? initialCalendarEvents);
      setLiveSessions(data.liveSessions ?? initialLiveSessions);
      setPersonnel(data.personnel ?? initialPersonnel);
      setEscalations(data.escalations);
      setTransfers(data.transfers);
      setOffices(data.offices);
      setDocuments(data.documents ?? initialDocuments);
      setAiDrafts(data.aiDrafts.length ? data.aiDrafts : initialAiDrafts);
      setAuditRows(data.audit);
      setEvents(data.events);
      void apiRequest<CommandBriefing>("/api/command-center/briefing").then(setCommandBriefing).catch(() => undefined);
      void apiRequest<ArchiveManifest>("/api/archive/manifest").then(setArchiveManifest).catch(() => undefined);
      void apiRequest<WorkflowDigest>("/api/workflows/digest").then(setWorkflowDigest).catch(() => undefined);
      void apiRequest<EscalationDigest>("/api/escalations/digest").then(setEscalationDigest).catch(() => undefined);
      void apiRequest<PersonnelDigest>("/api/personnel/digest").then(setPersonnelDigest).catch(() => undefined);
      void apiRequest<TransferDigest>("/api/transfers/digest").then(setTransferDigest).catch(() => undefined);
      void apiRequest<OfficeDigest>("/api/offices/digest").then(setOfficeDigest).catch(() => undefined);
      void apiRequest<HierarchyDigest>("/api/hierarchy/digest").then(setHierarchyDigest).catch(() => undefined);
      void apiRequest<AuditDigest>("/api/audit/digest").then(setAuditDigest).catch(() => undefined);
      void apiRequest<EventDigest>("/api/events/digest").then(setEventDigest).catch(() => undefined);
      void apiRequest<ReadinessDigest>("/api/readiness/digest").then(setReadinessDigest).catch(() => undefined);
      void apiRequest<SessionDigest>("/api/sessions/digest").then(setSessionDigest).catch(() => undefined);
      void apiRequest<TaskDigest>("/api/tasks/digest").then(setTaskDigest).catch(() => undefined);
      void apiRequest<PolicyDigest>("/api/policies/digest").then(setPolicyDigest).catch(() => undefined);
      void apiRequest<CalendarDigest>("/api/calendar-events/digest").then(setCalendarDigest).catch(() => undefined);
      void apiRequest<MessageDigest>("/api/messages/digest").then(setMessageDigest).catch(() => undefined);
      void apiRequest<ReportDigest>("/api/reports/digest").then(setReportDigest).catch(() => undefined);
      void apiRequest<ApprovalDigest>("/api/approvals/digest").then(setApprovalDigest).catch(() => undefined);
      void apiRequest<AiDraftDigest>("/api/ai-drafts/digest").then(setAiDraftDigest).catch(() => undefined);
      const serverStation = data.stations.find((station) => station.email === activeStation.email);
      if (serverStation) {
        setActiveStation((current) => ({ ...current, title: serverStation.title, level: serverStation.level, authority: serverStation.authority, icon: resolveStationIcon({ ...current, level: serverStation.level }) }));
      }
    } catch {
      setApiStatusError("API unavailable");
      setEvents((items) => ["ApiUnavailable: using local workstation cache", ...items].slice(0, 8));
    }
  }

  async function resetWorkstationData() {
    try {
      const data = await apiRequest<{
        stations: StationCard[];
        messages: Message[];
        reports: Report[];
        approvals: Approval[];
        tasks: GovernanceTask[];
        policies: Policy[];
        calendarEvents: CalendarEvent[];
        liveSessions: LiveSession[];
        personnel: PersonRecord[];
        escalations: Escalation[];
        transfers: Transfer[];
        offices: Office[];
        documents: DocumentRecord[];
        aiDrafts: AiDraft[];
        audit: AuditRow[];
        events: string[];
      }>("/api/dev/reset", { method: "POST", body: JSON.stringify({}) });
      setApiStations(data.stations.length ? data.stations : stations);
      setMessages(data.messages);
      setReports(data.reports);
      setApprovals(data.approvals);
      setTasks(data.tasks ?? initialTasks);
      setPolicies(data.policies ?? initialPolicies);
      setCalendarEvents(data.calendarEvents ?? initialCalendarEvents);
      setLiveSessions(data.liveSessions ?? initialLiveSessions);
      setPersonnel(data.personnel ?? initialPersonnel);
      setEscalations(data.escalations);
      setTransfers(data.transfers);
      setOffices(data.offices);
    setDocuments(data.documents ?? initialDocuments);
    setAiDrafts(data.aiDrafts.length ? data.aiDrafts : initialAiDrafts);
    setAuditRows(data.audit);
    setEvents(data.events);
    setOfflineQueue([]);
    setOfflineSyncHistory([]);
      setOfflineMode(false);
      setActiveSection("Control Center");
    } catch {
      setEvents((items) => ["ApiResetUnavailable: local workstation cache preserved", ...items].slice(0, 8));
    }
  }

  React.useEffect(() => {
    if (!session) return;
    if (!session.token && !session.authPending && !isLocalPreview) {
      setSession(null);
      return;
    }
    const normalizedEmail = normalizeStationEmail(session.email);
    if (normalizedEmail !== session.email) {
      setSession({ ...session, email: normalizedEmail });
      return;
    }
    const station = stationDirectory.find((item) => item.email === normalizedEmail);
    if (station) setActiveStation(station);
  }, [session, stationDirectory]);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("logout") !== "1") return;
    const landingSection: Section = adminRouteRequested() ? "Admin Board" : "Control Center";
    setSession(null);
    setActiveSection(landingSection);
    url.searchParams.delete("logout");
    window.history.replaceState({}, "", sectionPath(landingSection));
  }, [setSession]);

  React.useEffect(() => {
    void refreshFromApi();
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      if (!networkOnline) {
        setApiStatusError("Offline");
        return;
      }
      void apiRequest<ApiStatus>("/api/status")
        .then((status) => {
          setApiStatus(status);
          setApiStatusError("");
        })
        .catch(() => setApiStatusError("API unavailable"));
    }, 30000);
    return () => window.clearInterval(timer);
  }, [networkOnline]);

  React.useEffect(() => {
    if (!networkOnline) {
      setOfflineMode(true);
      setApiStatusError("Offline");
    }
  }, [networkOnline]);

  React.useEffect(() => {
    if (!networkOnline) {
      networkWasOfflineRef.current = true;
      return;
    }
    if (networkWasOfflineRef.current && offlineQueue.length > 0 && session) {
      void syncOfflineQueue();
    }
    networkWasOfflineRef.current = false;
  }, [networkOnline, offlineQueue.length, session]);

  React.useEffect(() => {
    window.history.replaceState({}, "", sectionPath(effectiveSection));
  }, [effectiveSection]);

  function recordAudit(event: string, object: string, result: string) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const row = {
      id: `aud-${Date.now()}`,
      event,
      actor: activeStation.email,
      object,
      result,
      time
    };
    if (offlineMode || !networkOnline) {
      const priority = result.toLowerCase().includes("escalated") || event.toLowerCase().includes("escalation") ? "Critical" : result.toLowerCase().includes("approval") ? "High" : "Normal";
      setOfflineQueue((items) => [{ ...row, queuedAt: time, syncStatus: "Queued", syncAttempts: 0, priority }, ...items]);
      return;
    }
    setAuditRows((rows) => [row, ...rows]);
    setEvents((items) => [`${event}: ${object}`, ...items].slice(0, 8));
  }

  function createLiveSession(draft: Omit<LiveSession, "id" | "createdAt">) {
    const created: LiveSession = {
      ...draft,
      id: `live-${Date.now()}`,
      participants: draft.participants?.length ? draft.participants : [activeStation.email],
      notes: draft.notes ?? [],
      files: draft.files ?? [],
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setLiveSessions((items) => [created, ...items]);
    recordAudit("LiveSessionCreated", created.title, `${created.sessionType} linked to ${created.linkedRecord}`);
    void apiRequest<LiveSession>("/api/live-sessions", {
      method: "POST",
      body: JSON.stringify(created)
    }).catch(() => undefined);
  }

  function updateLiveSessionStatus(id: string, status: LiveSession["status"]) {
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, status, lastActionBy: activeStation.email, updatedAt: new Date().toISOString() } : item));
    const target = liveSessions.find((item) => item.id === id);
    recordAudit("LiveSessionStatusUpdated", target?.title ?? "Live session", status);
    void apiRequest<LiveSession>(`/api/live-sessions/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status })
    }).catch(() => undefined);
  }

  function attachLiveSessionFile(id: string) {
    const file = `Shared packet ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, files: [file, ...(item.files ?? [])], updatedAt: new Date().toISOString() } : item));
    const target = liveSessions.find((item) => item.id === id);
    recordAudit("LiveSessionFileShared", target?.title ?? "Live session", file);
    void apiRequest<LiveSession>(`/api/live-sessions/${id}/file`, {
      method: "POST",
      body: JSON.stringify({ file })
    }).catch(() => undefined);
  }

  function addLiveSessionNote(id: string) {
    const note = `Decision note added by ${activeStation.email}`;
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, notes: [note, ...(item.notes ?? [])], updatedAt: new Date().toISOString() } : item));
    const target = liveSessions.find((item) => item.id === id);
    recordAudit("LiveSessionNoteAdded", target?.title ?? "Live session", note);
    void apiRequest<LiveSession>(`/api/live-sessions/${id}/note`, {
      method: "POST",
      body: JSON.stringify({ note })
    }).catch(() => undefined);
  }

  function inviteLiveSessionParticipant(id: string, participant: string) {
    const target = liveSessions.find((item) => item.id === id);
    if (!target) return;
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, participants: Array.from(new Set([participant, ...(item.participants ?? [])])), updatedAt: new Date().toISOString() } : item));
    recordAudit("LiveSessionParticipantInvited", target.title, participant);
    void apiRequest<LiveSession>(`/api/live-sessions/${id}/invite`, {
      method: "POST",
      body: JSON.stringify({ participant })
    }).catch(() => undefined);
  }

  function checkInLiveSessionParticipant(id: string, participant: string) {
    const target = liveSessions.find((item) => item.id === id);
    if (!target) return;
    setLiveSessions((items) => items.map((item) => {
      if (item.id !== id) return item;
      const checkedInParticipants = Array.from(new Set([participant, ...(item.checkedInParticipants ?? [])]));
      return {
        ...item,
        participants: Array.from(new Set([participant, ...(item.participants ?? [])])),
        checkedInParticipants,
        attendanceCount: checkedInParticipants.length,
        updatedAt: new Date().toISOString()
      };
    }));
    recordAudit("LiveSessionParticipantCheckedIn", target.title, participant);
    void apiRequest<LiveSession>(`/api/live-sessions/${id}/check-in`, {
      method: "POST",
      body: JSON.stringify({ participant })
    }).catch(() => undefined);
  }

  function addLiveSessionChat(id: string) {
    const target = liveSessions.find((item) => item.id === id);
    if (!target) return;
    const chat = {
      id: `chat-${Date.now()}`,
      author: activeStation.email,
      body: `Live update from ${activeStation.title}`,
      createdAt: new Date().toISOString()
    };
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, transcript: [chat, ...(item.transcript ?? [])], updatedAt: chat.createdAt } : item));
    recordAudit("LiveSessionChatAdded", target.title, chat.body);
    void apiRequest<LiveSession>(`/api/live-sessions/${id}/chat`, {
      method: "POST",
      body: JSON.stringify({ message: chat.body })
    }).catch(() => undefined);
  }

  function recordLiveSessionDecision(id: string) {
    const target = liveSessions.find((item) => item.id === id);
    if (!target) return;
    const decision = {
      id: `decision-${Date.now()}`,
      text: `Decision recorded for ${target.linkedRecord}`,
      owner: activeStation.email,
      due: "Next meeting",
      createdAt: new Date().toISOString()
    };
    setLiveSessions((items) => items.map((item) => item.id === id ? {
      ...item,
      decisions: [decision, ...(item.decisions ?? [])],
      notes: [`Decision: ${decision.text}`, ...(item.notes ?? [])],
      updatedAt: decision.createdAt
    } : item));
    recordAudit("LiveSessionDecisionRecorded", target.title, decision.text);
    void apiRequest<LiveSession>(`/api/live-sessions/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ decision: decision.text, owner: decision.owner, due: decision.due })
    }).catch(() => undefined);
  }

  function sendLiveSessionSummary(id: string) {
    const target = liveSessions.find((item) => item.id === id);
    if (!target) return;
    const summary: Message = {
      id: `msg-live-${Date.now()}`,
      kind: "Notification",
      subject: `Live summary: ${target.title}`,
      from: activeStation.email,
      age: "now",
      status: "Ready",
      files: target.files?.length ? target.files.join(", ") : target.linkedRecord,
      route: target.route,
      priority: target.status === "Priority" ? "High" : "Medium"
    };
    setMessages((items) => [summary, ...items]);
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, summaryMessageId: summary.id, summarySentAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item));
    recordAudit("LiveSessionSummarySent", target.title, summary.subject);
    void apiRequest<{ session: LiveSession; message: Message }>(`/api/live-sessions/${id}/summary-message`, {
      method: "POST",
      body: JSON.stringify({ subject: summary.subject, route: summary.route })
    }).catch(() => undefined);
  }

  function createLiveSessionFollowUpTask(id: string) {
    const target = liveSessions.find((item) => item.id === id);
    if (!target) return;
    const followUp: GovernanceTask = {
      id: `tsk-live-${Date.now()}`,
      title: `Follow up: ${target.title}`,
      owner: target.host,
      assignee: activeStation.email,
      priority: target.status === "Priority" ? "High" : "Medium",
      due: "Tomorrow",
      status: "Queued",
      linkedReport: target.linkedRecord,
      comments: [`Created from live session ${target.title}`]
    };
    setTasks((items) => [followUp, ...items]);
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, followUpTaskId: followUp.id, updatedAt: new Date().toISOString() } : item));
    recordAudit("LiveSessionFollowUpTaskCreated", target.title, followUp.title);
    void apiRequest<{ session: LiveSession; task: GovernanceTask }>(`/api/live-sessions/${id}/follow-up-task`, {
      method: "POST",
      body: JSON.stringify({ title: followUp.title, assignee: followUp.assignee, priority: followUp.priority, due: followUp.due })
    }).catch(() => undefined);
  }

  function scheduleLiveSession(id: string) {
    const target = liveSessions.find((item) => item.id === id);
    if (!target) return;
    const event: CalendarEvent = {
      id: `cal-live-${Date.now()}`,
      title: `Scheduled: ${target.title}`,
      category: "Meeting",
      owner: target.host,
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      priority: target.status === "Priority" ? "High" : "Medium",
      status: "Scheduled",
      linkedReport: target.linkedRecord,
      agenda: target.purpose
    };
    setCalendarEvents((items) => [event, ...items]);
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, calendarEventId: event.id, updatedAt: new Date().toISOString() } : item));
    recordAudit("LiveSessionScheduled", target.title, event.date);
    void apiRequest<{ session: LiveSession; calendarEvent: CalendarEvent }>(`/api/live-sessions/${id}/calendar-event`, {
      method: "POST",
      body: JSON.stringify({ title: event.title, date: event.date, priority: event.priority, agenda: event.agenda })
    }).catch(() => undefined);
  }

  function buildLiveSessionPacket(id: string) {
    const target = liveSessions.find((item) => item.id === id);
    if (!target) return;
    const packet: DocumentRecord = {
      id: `doc-live-${Date.now()}`,
      name: `${target.title} meeting packet.pdf`,
      classification: "Live communication packet",
      source: "Live Comms",
      owner: target.host,
      fileType: "PDF",
      status: "Archived",
      storageKey: `gcos-object-vault/live-comms/${target.id}/meeting-packet.pdf`,
      retainedUntil: "Permanent",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      linkedReport: target.linkedRecord,
      extractedText: [
        `Session: ${target.title}`,
        `Type: ${target.sessionType}`,
        `Route: ${target.route}`,
        `Purpose: ${target.purpose}`,
        `Notes: ${(target.notes ?? []).join("; ") || "No notes recorded"}`,
        `Decisions: ${(target.decisions ?? []).map((decision) => decision.text).join("; ") || "No decisions recorded"}`,
        `Transcript: ${(target.transcript ?? []).map((entry) => `${entry.author}: ${entry.body}`).join("; ") || "No transcript messages"}`,
        `Files: ${(target.files ?? []).join(", ") || "No files attached"}`
      ].join("\n"),
      custodian: activeStation.email,
      chainHash: `live-${target.id}-${Date.now()}`
    };
    setDocuments((items) => [packet, ...items]);
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, packetDocumentId: packet.id, packetBuiltAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item));
    recordAudit("LiveSessionPacketBuilt", target.title, packet.name);
    void apiRequest<{ session: LiveSession; document: DocumentRecord }>(`/api/live-sessions/${id}/packet`, {
      method: "POST",
      body: JSON.stringify({ name: packet.name })
    }).catch(() => undefined);
  }

  function archiveLiveSession(id: string) {
    setLiveSessions((items) => items.map((item) => item.id === id ? { ...item, status: "Archived", archived: true, archiveReason: "Session closed and archived", updatedAt: new Date().toISOString() } : item));
    const target = liveSessions.find((item) => item.id === id);
    recordAudit("LiveSessionArchived", target?.title ?? "Live session", "Session closed and archived");
    void apiRequest<LiveSession>(`/api/live-sessions/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ reason: "Session closed and archived" })
    }).catch(() => undefined);
  }

  async function syncOfflineQueue() {
    if (offlineQueue.length === 0 || syncInFlightRef.current) return;
    if (!networkOnline) {
      setEvents((items) => ["SyncDeferred: no internet connection", ...items].slice(0, 8));
      setOfflineSyncHistory((items) => [{
        id: `sync-${Date.now()}`,
        status: "Deferred",
        count: offlineQueue.length,
        detail: "No internet connection. Queue remains on this device.",
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }, ...items].slice(0, 12));
      setOfflineMode(true);
      return;
    }
    syncInFlightRef.current = true;
    const queuedActions = [...offlineQueue];
    const conflicts = buildOfflineConflicts(queuedActions);
    if (conflicts.length > 0) {
      setOfflineSyncHistory((items) => [{
        id: `sync-${Date.now()}`,
        status: "Conflict",
        count: conflicts.length,
        detail: `${conflicts.length} duplicate offline record groups need review before sync.`,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }, ...items].slice(0, 12));
      setEvents((items) => ["SyncConflictDetected: review offline conflicts", ...items].slice(0, 8));
      syncInFlightRef.current = false;
      return;
    }
    setOfflineQueue((items) => items.map((item) => ({ ...item, syncStatus: "Syncing", syncAttempts: (item.syncAttempts ?? 0) + 1 })));
    try {
      await apiRequest("/api/offline-sync", {
        method: "POST",
        body: JSON.stringify({ actions: queuedActions })
      });
      const syncedRows = queuedActions.map((item) => ({
      id: item.id,
      event: item.event,
      actor: item.actor,
      object: item.object,
      result: `${item.result} (synced)`,
      time: item.time
      }));
      setAuditRows((rows) => [...syncedRows, ...rows]);
      setEvents((items) => [
        `SyncCompleted: ${queuedActions.length} queued actions`,
        ...queuedActions.map((item) => `${item.event}: ${item.object}`),
        ...items
      ].slice(0, 8));
      setOfflineSyncHistory((items) => [{
        id: `sync-${Date.now()}`,
        status: "Synced",
        count: queuedActions.length,
        detail: `${queuedActions.length} offline actions sent to the governance ledger.`,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }, ...items].slice(0, 12));
      setOfflineQueue((items) => items.filter((item) => !queuedActions.some((synced) => synced.id === item.id)));
      setOfflineMode(false);
      await refreshFromApi();
    } catch {
      setOfflineQueue((items) => items.map((item) => ({ ...item, syncStatus: "Deferred" })));
      setOfflineSyncHistory((items) => [{
        id: `sync-${Date.now()}`,
        status: "Deferred",
        count: queuedActions.length,
        detail: "Server did not accept the queue. Local queue was preserved.",
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }, ...items].slice(0, 12));
      setOfflineMode(true);
      setEvents((items) => ["ApiSyncDeferred: offline queue kept locally", ...items].slice(0, 8));
    } finally {
      syncInFlightRef.current = false;
    }
  }

  function handleLogin(email: string, password: string) {
    const normalizedEmail = normalizeStationEmail(email);
    const station = stationDirectory.find((item) => item.email === normalizedEmail);
    const officePassword = offices.find((office) => office.email === normalizedEmail)?.password;
    const expectedPassword = stationPasswordOverrides[normalizedEmail] ?? seedStationPasswords[normalizedEmail] ?? officePassword;
    if (!station || expectedPassword !== password) {
      return false;
    }
    if (["Pending Approval", "Suspended", "Locked", "Rejected", "Deleted"].includes(station.status ?? "")) {
      return false;
    }
    const stationPermissions = getPermissions(station);
    if (adminRouteRequested() && !stationPermissions.canOverride) {
      return false;
    }

    const startedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const landingSection: Section = stationPermissions.canOverride ? "Admin Board" : "Control Center";
    setSession({ email: normalizedEmail, startedAt, authPending: true });
    setActiveStation(station);
    setActiveSection(landingSection);
    window.history.replaceState({}, "", sectionPath(landingSection));
    setAuditRows((rows) => [
      {
        id: `aud-${Date.now()}`,
        event: "Login",
        actor: normalizedEmail,
        object: station.title,
        result: "Allowed",
        time: startedAt
      },
      ...rows
    ]);
    setEvents((items) => [`Login: ${normalizedEmail}`, ...items].slice(0, 8));
    void apiRequest<{ station: StationCard; token: string; expiresAt: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail, password })
    }).then((result) => {
      const authenticatedSession = { email: normalizedEmail, startedAt, token: result.token, expiresAt: result.expiresAt };
      window.localStorage.setItem("gcos.session", JSON.stringify(authenticatedSession));
      setSession(authenticatedSession);
      return refreshFromApi();
    }).catch(() => {
      if (!networkOnline) {
        setOfflineMode(true);
        setEvents((items) => ["OfflineLogin: cached station session active", ...items].slice(0, 8));
        return;
      }
      if (!isLocalPreview) {
        window.localStorage.removeItem("gcos.session");
        setSession(null);
      }
    });
    return true;
  }

  function createAccount(account: CreateAccountInput): AuthActionResult {
    const normalizedEmail = normalizeStationEmail(account.email);
    const cleanOfficeName = account.officeName.trim();
    const cleanDepartment = account.department.trim() || "Church Administration";
    const cleanFullName = account.fullName.trim() || "New station administrator";
    if (!normalizedEmail.endsWith("@rmvi.org")) {
      return { ok: false, message: "Use an official rmvi.org organizational email." };
    }
    if (stationDirectory.some((station) => station.email === normalizedEmail)) {
      return { ok: false, message: "That organizational email already has a workstation." };
    }
    if (!cleanOfficeName) {
      return { ok: false, message: "Enter the church office or branch name." };
    }
    if (account.password.length < 8) {
      return { ok: false, message: "Use a password with at least 8 characters." };
    }

    const officeId = `ofc-${Date.now()}`;
    const approvedAtSignup = Boolean(account.autoApprove);
    const parentName = account.level === "Local Branch" ? "Area Office" : "International HQ";
    const permissionPreset: PermissionPreset = "Reporter";
    const reportingRoute = buildReportingRoute(account.level, parentName);
    const workflowAccess = workflowAccessForPreset(permissionPreset);
    const createdOffice: Office = {
      id: officeId,
      name: cleanOfficeName,
      email: normalizedEmail,
      level: account.level,
      department: cleanDepartment,
      supervisor: parentName,
      password: account.password,
      status: approvedAtSignup ? "Ready" : "Pending Approval",
      nodeKind: "Office",
      parentName,
      permissionPreset,
      reportingRoute,
      workflowAccess,
      emailVerified: approvedAtSignup,
      notes: [`Created by ${cleanFullName} from the RMVI software sign-up portal.`, approvedAtSignup ? "Auto-approved for local preview." : "Awaiting administrator review."],
      complianceStatus: "Onboarding"
    };
    const createdStation: StationCard = {
      id: officeId,
      email: normalizedEmail,
      title: `${cleanOfficeName} Workstation`,
      level: account.level,
      authority: `${cleanDepartment}, created by ${cleanFullName}`,
      icon: iconForLevel(account.level),
      status: approvedAtSignup ? "Ready" : "Pending Approval",
      verified: approvedAtSignup,
      nodeKind: "Office",
      parentName,
      permissionPreset,
      reportingRoute,
      workflowAccess
    };
    const startedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setOffices((items) => [createdOffice, ...items]);
    setApiStations((items) => [createdStation, ...items.filter((station) => station.email !== normalizedEmail)]);
    if (approvedAtSignup) {
      setSession({ email: normalizedEmail, startedAt, authPending: true });
      setActiveStation(createdStation);
      setActiveSection("Control Center");
      window.history.replaceState({}, "", sectionPath("Control Center"));
    }
    setAuditRows((rows) => [
      {
        id: `aud-${Date.now()}`,
        event: approvedAtSignup ? "AccountCreated" : "AccountApprovalRequested",
        actor: normalizedEmail,
        object: createdStation.title,
        result: approvedAtSignup ? "Workstation opened" : "Pending administrator approval",
        time: startedAt
      },
      ...rows
    ]);
    setEvents((items) => [`${approvedAtSignup ? "AccountCreated" : "AccountApprovalRequested"}: ${normalizedEmail}`, ...items].slice(0, 8));
    if (approvedAtSignup && !offlineMode && networkOnline) {
      void apiRequest<Office>("/api/offices", {
        method: "POST",
        body: JSON.stringify({ ...createdOffice, actor: normalizedEmail })
      }).then(refreshFromApi).catch(() => undefined);
    }
    return { ok: true, message: approvedAtSignup ? "Workstation opened." : "Account request submitted. An administrator must approve this station before sign-in." };
  }

  function handleLogout() {
    recordAudit("Logout", activeStation.title, "Session closed");
    setSession(null);
    const landingSection: Section = adminRouteRequested() ? "Admin Board" : "Control Center";
    setActiveSection(landingSection);
  }

  if (!session) {
    return <LoginScreen stationDirectory={stationDirectory} pwa={pwa} onLogin={handleLogin} onCreateAccount={createAccount} />;
  }

  function acknowledgeMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    updateMessageStatus(id, "Approved", "EmailAcknowledged");
  }

  function updateMessageStatus(id: string, status: Status, event = "EmailStatusUpdated") {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    setMessages((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    recordAudit(event, message.subject, status);
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function classifyMessage(id: string, kind: MessageKind) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    setMessages((items) => items.map((item) => item.id === id ? { ...item, kind } : item));
    recordAudit("EmailClassified", message.subject, kind);
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/classify`, {
        method: "POST",
        body: JSON.stringify({ kind })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateMessageRoute(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    const route = `${activeStation.level} -> Supervising authority -> Archive vault`;
    setMessages((items) => items.map((item) => item.id === id ? { ...item, route } : item));
    recordAudit("EmailRouteUpdated", message.subject, route);
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/route`, {
        method: "POST",
        body: JSON.stringify({ route })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateMessagePriority(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    const priority = message.priority === "Critical" ? "High" : "Critical";
    setMessages((items) => items.map((item) => item.id === id ? { ...item, priority } : item));
    recordAudit("EmailPriorityUpdated", message.subject, priority);
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/priority`, {
        method: "POST",
        body: JSON.stringify({ priority })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function escalateMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    setMessages((items) => items.map((item) => item.id === id ? { ...item, status: "Escalated", priority: "Critical" } : item));
    recordAudit("EmailEscalated", message.subject, "Escalated from ChurchMail");
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/escalate`, {
        method: "POST",
        body: JSON.stringify({ reason: "Escalated from ChurchMail" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function approveMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    setMessages((items) => items.map((item) => item.id === id ? { ...item, status: "Approved" } : item));
    recordAudit("EmailApproved", message.subject, "Governance communication approved");
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    setMessages((items) => items.map((item) => item.id === id ? { ...item, archived: true } : item));
    recordAudit("EmailArchived", message.subject, "Message archived");
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason: "Archived from ChurchMail" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    setMessages((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("EmailWatcherAdded", message.subject, activeStation.email);
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function duplicateMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    const duplicate: Message = { ...message, id: `msg-${Date.now()}`, subject: `${message.subject} follow-up`, status: "Queued", age: "now" };
    setMessages((items) => [duplicate, ...items]);
    recordAudit("EmailDuplicated", message.subject, duplicate.subject);
    if (!offlineMode) {
      void apiRequest<Message>(`/api/messages/${id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ subject: duplicate.subject, from: message.from })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkApproveMessages(ids: string[]) {
    const targetIds = ids.length ? ids : messages.filter((message) => message.status !== "Approved").slice(0, 3).map((message) => message.id);
    setMessages((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Approved" } : item));
    recordAudit("EmailsBulkApproved", "ChurchMail", `${targetIds.length} messages approved`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: Message[] }>("/api/messages/bulk/approve", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshMessageDigest() {
    if (offlineMode) {
      recordAudit("MessageDigestRefreshed", "ChurchMail digest", "Local message digest refreshed");
      return;
    }
    void apiRequest<MessageDigest>("/api/messages/digest")
      .then((digest) => {
        setMessageDigest(digest);
        recordAudit("MessageDigestRefreshed", "ChurchMail digest", `${digest.ready} ready, ${digest.escalated} escalated`);
      })
      .catch(() => undefined);
  }

  function createReportFromMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    const report: Report = {
      id: `rep-${Date.now()}`,
      name: `${message.kind} follow-up report`,
      owner: activeStation.level,
      path: `${activeStation.level} -> Supervising Office`,
      due: "Draft",
      state: "Ready",
      score: 32,
      type: message.kind === "Report" ? "Administrative" : message.kind,
      period: "Current",
      routingStage: "Drafting",
      evidenceStatus: message.files === "No attachments" ? "Evidence pending" : "Attachment available"
    };
    setReports((items) => [report, ...items]);
    setActiveSection("Reports");
    recordAudit("ReportDrafted", report.name, "Created from ChurchMail");
  }

  function createReportDraft(reportDraft: Omit<Report, "id" | "state" | "score">) {
    const report: Report = {
      ...reportDraft,
      id: `rep-${Date.now()}`,
      state: offlineMode ? "Queued" : "Ready",
      score: 18,
      type: reportDraft.type ?? "Administrative",
      period: reportDraft.period ?? "Current",
      routingStage: reportDraft.routingStage ?? "Drafting",
      evidenceStatus: reportDraft.evidenceStatus ?? "Evidence pending"
    };
    setReports((items) => [report, ...items]);
    recordAudit("ReportDrafted", report.name, "Created in reporting center");
    if (!offlineMode) {
      void apiRequest<Report>("/api/reports", {
        method: "POST",
        body: JSON.stringify(reportDraft)
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateReportDetails(id: string, details: Pick<Report, "preparedBy" | "attestation" | "approvalLimit" | "reportFields" | "templateChecklist">) {
    const fieldCount = Object.keys(details.reportFields ?? {}).length;
    const completed = completedReportFields(details.reportFields);
    const reviewNote = `${completed}/${fieldCount} report sections completed`;
    setReports((items) => items.map((item) => item.id === id ? {
      ...item,
      ...details,
      reviewNote,
      routingStage: "Report details updated",
      score: Math.max(item.score, fieldCount ? Math.min(92, Math.round((completed / fieldCount) * 100)) : item.score)
    } : item));
    recordAudit("ReportDetailsUpdated", reports.find((item) => item.id === id)?.name ?? "Report", reviewNote);
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/details`, {
        method: "POST",
        body: JSON.stringify({ ...details, note: reviewNote })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  async function uploadReportEvidenceFile(id: string, file: File) {
    const targetReport = reports.find((item) => item.id === id);
    if (!targetReport) return;
    const contentBase64 = await readFileAsDataUrl(file);
    const uploaded = await apiRequest<FileRecord>("/api/files/upload", {
      method: "POST",
      body: JSON.stringify({
        name: file.name,
        contentType: file.type || "application/octet-stream",
        contentBase64,
        source: `Report:${targetReport.name}`
      })
    });
    const updated = await apiRequest<Report>(`/api/reports/${id}/file`, {
      method: "POST",
      body: JSON.stringify({ fileId: uploaded.id })
    });
    setReports((items) => items.map((item) => item.id === id ? updated : item));
    recordAudit("ReportEvidenceFileLinked", targetReport.name, uploaded.hash);
    void refreshFromApi();
  }

  function requestApprovalFromMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    const approval: Approval = {
      id: `app-${Date.now()}`,
      request: `${message.kind} authorization request`,
      route: `${activeStation.level} -> Delegated Authority`,
      limit: "Policy check",
      state: "Validation",
      signatures: "0/2"
    };
    setApprovals((items) => [approval, ...items]);
    setActiveSection("Approvals");
    recordAudit("ApprovalRequested", approval.request, "Delegation check started");
  }

  function createApprovalRequest(draft: Omit<Approval, "id" | "state" | "signatures">) {
    const approval: Approval = {
      ...draft,
      id: `app-${Date.now()}`,
      state: offlineMode ? "Queued" : "Validation",
      signatures: "0/2"
    };
    setApprovals((items) => [approval, ...items]);
    recordAudit("ApprovalRequested", approval.request, "Delegation check started");
    if (!offlineMode) {
      void apiRequest<Approval>("/api/approvals", {
        method: "POST",
        body: JSON.stringify(draft)
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function createTask(draft: Omit<GovernanceTask, "id" | "status">) {
    const task: GovernanceTask = {
      ...draft,
      id: `tsk-${Date.now()}`,
      status: offlineMode ? "Queued" : "In Progress"
    };
    setTasks((items) => [task, ...items]);
    recordAudit("TaskCreated", task.title, `${task.assignee} assigned`);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(draft)
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function advanceTask(id: string, status: GovernanceTask["status"]) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    recordAudit("TaskAdvanced", task.title, status);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/advance`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateTaskPriority(id: string, priority: GovernanceTask["priority"]) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, priority } : item));
    recordAudit("TaskPriorityUpdated", task.title, priority);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/priority`, {
        method: "POST",
        body: JSON.stringify({ priority })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateTaskAssignee(id: string, assignee: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, assignee } : item));
    recordAudit("TaskAssigneeUpdated", task.title, assignee);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/assignee`, {
        method: "POST",
        body: JSON.stringify({ assignee })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateTaskDue(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const due = task.due === "Overdue" ? "Today" : "Overdue";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, due } : item));
    recordAudit("TaskDueUpdated", task.title, due);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/due`, {
        method: "POST",
        body: JSON.stringify({ due })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateTaskOwner(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const owner = activeStation.title;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, owner } : item));
    recordAudit("TaskOwnerUpdated", task.title, owner);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/owner`, {
        method: "POST",
        body: JSON.stringify({ owner })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function blockTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, status: "Blocked", blocker: "Blocked from task center" } : item));
    recordAudit("TaskBlocked", task.title, "Blocked from task center");
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/block`, {
        method: "POST",
        body: JSON.stringify({ reason: "Blocked from task center" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function unblockTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, status: "In Progress", blocker: undefined } : item));
    recordAudit("TaskUnblocked", task.title, "Blocker cleared");
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/unblock`, {
        method: "POST",
        body: JSON.stringify({ reason: "Blocker cleared from task center" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("TaskWatcherAdded", task.title, activeStation.email);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function addTaskDependency(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const dependency = "Audit evidence packet";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, dependencies: Array.from(new Set([...(item.dependencies ?? []), dependency])) } : item));
    recordAudit("TaskDependencyAdded", task.title, dependency);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/dependency`, {
        method: "POST",
        body: JSON.stringify({ dependency })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function requestTaskApproval(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const route = `${activeStation.level} -> Delegated Authority`;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, approvalRequired: true, approvalRoute: route } : item));
    recordAudit("TaskApprovalRequested", task.title, route);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/approval`, {
        method: "POST",
        body: JSON.stringify({ route })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateTaskSla(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const slaStatus = task.due === "Overdue" ? "Breached" : "On Track";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, sla: "24h", slaStatus } : item));
    recordAudit("TaskSlaUpdated", task.title, `24h ${slaStatus}`);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/sla`, {
        method: "POST",
        body: JSON.stringify({ sla: "24h", status: slaStatus })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function attachTaskEvidence(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const evidence = "Task evidence packet attached";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, evidence } : item));
    recordAudit("TaskEvidenceAttached", task.title, evidence);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/evidence`, {
        method: "POST",
        body: JSON.stringify({ evidence })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function handoffTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, assignee: activeStation.email, handoffTo: activeStation.email } : item));
    recordAudit("TaskHandedOff", task.title, activeStation.email);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/handoff`, {
        method: "POST",
        body: JSON.stringify({ to: activeStation.email, note: "Task handed off from task center" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function escalateTaskOperation(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, escalated: true, escalationReason: "Task escalated from operations board", priority: item.priority === "Critical" ? "Critical" : "High" } : item));
    recordAudit("TaskEscalated", task.title, "Task escalated from operations board");
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/escalate`, {
        method: "POST",
        body: JSON.stringify({ reason: "Task escalated from operations board", priority: task.priority === "Critical" ? "Critical" : "High" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function commentTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const comment = "Reviewed from task operations board";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, comments: [...(item.comments ?? []), `${activeStation.email}: ${comment}`] } : item));
    recordAudit("TaskCommentAdded", task.title, comment);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/comment`, {
        method: "POST",
        body: JSON.stringify({ comment })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function addTaskCheckpoint(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const checkpoint = "Checkpoint recorded from task operations board";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, checkpoints: [...(item.checkpoints ?? []), checkpoint] } : item));
    recordAudit("TaskCheckpointAdded", task.title, checkpoint);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/checkpoint`, {
        method: "POST",
        body: JSON.stringify({ checkpoint })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function duplicateTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const duplicate: GovernanceTask = { ...task, id: `tsk-${Date.now()}`, title: `${task.title} follow-up`, status: "Queued" };
    setTasks((items) => [duplicate, ...items]);
    recordAudit("TaskDuplicated", task.title, duplicate.title);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ title: duplicate.title, assignee: task.assignee, due: task.due })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkCompleteTasks(ids: string[]) {
    const targetIds = ids.length ? ids : tasks.filter((task) => task.status !== "Complete").slice(0, 3).map((task) => task.id);
    setTasks((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Complete" } : item));
    recordAudit("TasksBulkCompleted", "Task center", `${targetIds.length} tasks completed`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: GovernanceTask[] }>("/api/tasks/bulk/complete", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkEscalateTasks(ids: string[]) {
    const targetIds = ids.length ? ids : tasks.filter((task) => task.status !== "Complete").slice(0, 3).map((task) => task.id);
    setTasks((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, escalated: true, priority: item.priority === "Critical" ? "Critical" : "High", escalationReason: "Bulk escalated from task center" } : item));
    recordAudit("TasksBulkEscalated", "Task center", `${targetIds.length} tasks escalated`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: GovernanceTask[] }>("/api/tasks/bulk/escalate", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, reason: "Bulk escalated from task center" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function scheduleTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const scheduledFor = "Tomorrow";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, scheduledFor, due: scheduledFor } : item));
    recordAudit("TaskScheduled", task.title, scheduledFor);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/schedule`, {
        method: "POST",
        body: JSON.stringify({ scheduledFor, due: scheduledFor })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function dispatchTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const team = "Field operations";
    const location = String(activeStation.level);
    setTasks((items) => items.map((item) => item.id === id ? { ...item, dispatchTeam: team, dispatchLocation: location, status: item.status === "Complete" ? "Complete" : "In Progress" } : item));
    recordAudit("TaskDispatched", task.title, `${team} to ${location}`);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/dispatch`, {
        method: "POST",
        body: JSON.stringify({ team, location })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function logTaskTime(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const hours = 2;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, timeHours: (item.timeHours ?? 0) + hours } : item));
    recordAudit("TaskTimeLogged", task.title, `${hours}h logged`);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/time`, {
        method: "POST",
        body: JSON.stringify({ hours })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function qaReviewTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const status = "Passed";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, qaStatus: status, qaReviewer: activeStation.email } : item));
    recordAudit("TaskQaReviewed", task.title, status);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/qa`, {
        method: "POST",
        body: JSON.stringify({ status, reviewer: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function acceptTaskRisk(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const reason = "Accepted from task operations board";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, riskAccepted: true, riskReason: reason } : item));
    recordAudit("TaskRiskAccepted", task.title, reason);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/risk`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function saveTaskTemplate(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const templateName = `${task.title} template`;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, templateSaved: true, templateName } : item));
    recordAudit("TaskTemplateSaved", task.title, templateName);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/template`, {
        method: "POST",
        body: JSON.stringify({ templateName })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkTaskReport(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const reportId = reports[0]?.id ?? "report-follow-up";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, linkedReport: reportId } : item));
    recordAudit("TaskReportLinked", task.title, reportId);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reportId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkTaskApproval(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const approvalId = approvals[0]?.id ?? "approval-follow-up";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, linkedApproval: approvalId } : item));
    recordAudit("TaskApprovalLinked", task.title, approvalId);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/approval-link`, {
        method: "POST",
        body: JSON.stringify({ approvalId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const reason = "Archived from task operations board";
    setTasks((items) => items.map((item) => item.id === id ? { ...item, archived: true, archiveReason: reason } : item));
    recordAudit("TaskArchived", task.title, reason);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>(`/api/tasks/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkScheduleTasks(ids: string[]) {
    const targetIds = ids.length ? ids : tasks.filter((task) => !task.archived && task.status !== "Complete").slice(0, 3).map((task) => task.id);
    const scheduledFor = "Tomorrow";
    setTasks((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, scheduledFor } : item));
    recordAudit("TasksBulkScheduled", "Task center", `${targetIds.length} tasks scheduled`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: GovernanceTask[] }>("/api/tasks/bulk/schedule", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, scheduledFor })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshTaskDigest() {
    if (offlineMode) {
      recordAudit("TaskDigestRefreshed", "Task digest", "Local task digest refreshed");
      return;
    }
    void apiRequest<TaskDigest>("/api/tasks/digest")
      .then((digest) => {
        setTaskDigest(digest);
        recordAudit("TaskDigestRefreshed", "Task digest", `${digest.open} open, ${digest.blocked} blocked`);
      })
      .catch(() => undefined);
  }

  function createPolicy(draft: Omit<Policy, "id" | "acknowledgements">) {
    const policy: Policy = {
      ...draft,
      id: `pol-${Date.now()}`,
      acknowledgements: 0
    };
    setPolicies((items) => [policy, ...items]);
    recordAudit("PolicyPublished", policy.title, `${policy.category} registry updated`);
    if (!offlineMode) {
      void apiRequest<Policy>("/api/policies", {
        method: "POST",
        body: JSON.stringify(draft)
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function acknowledgePolicy(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, acknowledgements: item.acknowledgements + 1 } : item));
    recordAudit("PolicyAcknowledged", policy.title, "Station acknowledgement recorded");
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/acknowledge`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updatePolicyStatus(id: string, status: Policy["status"]) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    recordAudit("PolicyStatusUpdated", policy.title, status);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function retirePolicy(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, status: "Retired" } : item));
    recordAudit("PolicyRetired", policy.title, "Policy retired");
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/retire`, {
        method: "POST",
        body: JSON.stringify({ reason: "Retired from policy registry" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updatePolicyOwner(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const owner = activeStation.title;
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, owner } : item));
    recordAudit("PolicyOwnerUpdated", policy.title, owner);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/owner`, {
        method: "POST",
        body: JSON.stringify({ owner })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updatePolicyCategory(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const category = policy.category === "Governance" ? "Compliance" : "Governance";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, category } : item));
    recordAudit("PolicyCategoryUpdated", policy.title, category);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/category`, {
        method: "POST",
        body: JSON.stringify({ category })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updatePolicySummary(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const summary = `${policy.summary} Reviewed by ${activeStation.email}.`;
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, summary } : item));
    recordAudit("PolicySummaryUpdated", policy.title, "Summary updated");
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/summary`, {
        method: "POST",
        body: JSON.stringify({ summary })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bumpPolicyVersion(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const current = Number.parseInt(String(policy.version ?? "1").replace(/\D/g, ""), 10) || 1;
    const version = `v${current + 1}`;
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, version, status: "Review" } : item));
    recordAudit("PolicyVersionBumped", policy.title, version);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/version`, {
        method: "POST",
        body: JSON.stringify({ version, status: "Review" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function schedulePolicyReview(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const reviewBy = "Next governance review";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, status: "Review", reviewBy } : item));
    recordAudit("PolicyReviewScheduled", policy.title, reviewBy);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ reviewBy })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchPolicy(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("PolicyWatcherAdded", policy.title, activeStation.email);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function duplicatePolicy(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const duplicate: Policy = { ...policy, id: `pol-${Date.now()}`, title: `${policy.title} revision`, status: "Draft", acknowledgements: 0, version: "v1" };
    setPolicies((items) => [duplicate, ...items]);
    recordAudit("PolicyDuplicated", policy.title, duplicate.title);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ title: duplicate.title })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkActivatePolicies(ids: string[]) {
    const targetIds = ids.length ? ids : policies.filter((policy) => policy.status !== "Active").slice(0, 3).map((policy) => policy.id);
    setPolicies((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Active" } : item));
    recordAudit("PoliciesBulkActivated", "Policy registry", `${targetIds.length} policies activated`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: Policy[] }>("/api/policies/bulk/activate", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function checkPolicyCompliance(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, complianceStatus: "Compliant", complianceScore: 100 } : item));
    recordAudit("PolicyComplianceChecked", policy.title, "Compliant 100");
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/compliance`, {
        method: "POST",
        body: JSON.stringify({ status: "Compliant", score: 100 })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bindPolicyEvidence(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const evidence = "Policy evidence packet";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, evidence } : item));
    recordAudit("PolicyEvidenceBound", policy.title, evidence);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/evidence`, {
        method: "POST",
        body: JSON.stringify({ evidence })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function distributePolicy(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const audience = "All stations";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, distributedTo: audience, distributedAt: new Date().toISOString() } : item));
    recordAudit("PolicyDistributed", policy.title, audience);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/distribute`, {
        method: "POST",
        body: JSON.stringify({ audience })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function grantPolicyException(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const reason = "Exception approved by governance authority";
    const expires = "Next review";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, exceptionNote: reason, exceptionExpires: expires } : item));
    recordAudit("PolicyExceptionGranted", policy.title, reason);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/exception`, {
        method: "POST",
        body: JSON.stringify({ reason, expires })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function assignPolicyTraining(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const audience = "Station administrators";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, trainingAssigned: true, trainingAudience: audience } : item));
    recordAudit("PolicyTrainingAssigned", policy.title, audience);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/training`, {
        method: "POST",
        body: JSON.stringify({ audience })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function holdPolicy(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const reason = "Legal hold applied";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, hold: true, holdReason: reason } : item));
    recordAudit("PolicyHoldApplied", policy.title, reason);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/hold`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkPolicyTask(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const taskId = tasks[0]?.id ?? "task-follow-up";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, linkedTask: taskId } : item));
    recordAudit("PolicyTaskLinked", policy.title, taskId);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/task`, {
        method: "POST",
        body: JSON.stringify({ taskId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkPolicyApproval(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const approvalId = approvals[0]?.id ?? "approval-follow-up";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, linkedApproval: approvalId } : item));
    recordAudit("PolicyApprovalLinked", policy.title, approvalId);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/approval-link`, {
        method: "POST",
        body: JSON.stringify({ approvalId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archivePolicy(id: string) {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return;
    const reason = "Archived from policy registry";
    setPolicies((items) => items.map((item) => item.id === id ? { ...item, archived: true, archiveReason: reason } : item));
    recordAudit("PolicyArchived", policy.title, reason);
    if (!offlineMode) {
      void apiRequest<Policy>(`/api/policies/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkReviewPolicies(ids: string[]) {
    const targetIds = ids.length ? ids : policies.filter((policy) => !policy.archived && policy.status !== "Review").slice(0, 3).map((policy) => policy.id);
    const reviewBy = "Next governance review";
    setPolicies((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Review", reviewBy } : item));
    recordAudit("PoliciesBulkReviewed", "Policy registry", `${targetIds.length} policies marked for review`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: Policy[] }>("/api/policies/bulk/review", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, reviewBy })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshPolicyDigest() {
    if (offlineMode) {
      recordAudit("PolicyDigestRefreshed", "Policy digest", "Local policy digest refreshed");
      return;
    }
    void apiRequest<PolicyDigest>("/api/policies/digest")
      .then((digest) => {
        setPolicyDigest(digest);
        recordAudit("PolicyDigestRefreshed", "Policy digest", `${digest.active} active, ${digest.review} in review`);
      })
      .catch(() => undefined);
  }

  function createCalendarEvent(draft: Omit<CalendarEvent, "id">) {
    const event: CalendarEvent = {
      ...draft,
      id: `cal-${Date.now()}`
    };
    setCalendarEvents((items) => [event, ...items]);
    recordAudit("CalendarEventCreated", event.title, `${event.date} scheduled`);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>("/api/calendar-events", {
        method: "POST",
        body: JSON.stringify(draft)
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function completeCalendarEvent(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, status: "Complete" } : item));
    recordAudit("CalendarEventCompleted", event.title, "Calendar item closed");
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateCalendarEventDate(id: string, date: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, date } : item));
    recordAudit("CalendarDateUpdated", event.title, date);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/date`, {
        method: "POST",
        body: JSON.stringify({ date })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateCalendarEventPriority(id: string, priority: CalendarEvent["priority"]) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, priority } : item));
    recordAudit("CalendarPriorityUpdated", event.title, priority);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/priority`, {
        method: "POST",
        body: JSON.stringify({ priority })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function markCalendarEventAtRisk(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, status: "At Risk" } : item));
    recordAudit("CalendarEventAtRisk", event.title, "Risk flag applied");
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/risk`, {
        method: "POST",
        body: JSON.stringify({ reason: "Risk flagged from calendar control" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateCalendarEventOwner(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const owner = activeStation.title;
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, owner } : item));
    recordAudit("CalendarOwnerUpdated", event.title, owner);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/owner`, {
        method: "POST",
        body: JSON.stringify({ owner })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateCalendarEventCategory(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const category = event.category === "Audit" ? "Review" : "Audit";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, category } : item));
    recordAudit("CalendarCategoryUpdated", event.title, category);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/category`, {
        method: "POST",
        body: JSON.stringify({ category })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function rescheduleCalendarEvent(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const date = event.date === "2026-06-07" ? "2026-06-14" : "2026-06-07";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, date, status: "Scheduled" } : item));
    recordAudit("CalendarEventRescheduled", event.title, date);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ date })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchCalendarEvent(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("CalendarWatcherAdded", event.title, activeStation.email);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function duplicateCalendarEvent(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const duplicate: CalendarEvent = { ...event, id: `cal-${Date.now()}`, title: `${event.title} follow-up`, status: "Scheduled" };
    setCalendarEvents((items) => [duplicate, ...items]);
    recordAudit("CalendarEventDuplicated", event.title, duplicate.title);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ title: duplicate.title, owner: event.owner, date: event.date })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkCompleteCalendarEvents(ids: string[]) {
    const targetIds = ids.length ? ids : calendarEvents.filter((event) => event.status !== "Complete").slice(0, 3).map((event) => event.id);
    setCalendarEvents((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Complete" } : item));
    recordAudit("CalendarEventsBulkCompleted", "Governance calendar", `${targetIds.length} events completed`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: CalendarEvent[] }>("/api/calendar-events/bulk/complete", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function checkInCalendarEvent(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const status = "Checked in";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, checkInStatus: status, checkInBy: activeStation.email } : item));
    recordAudit("CalendarEventCheckedIn", event.title, status);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/check-in`, {
        method: "POST",
        body: JSON.stringify({ status, by: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateCalendarVenue(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const venue = "Main governance hall";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, venue } : item));
    recordAudit("CalendarVenueUpdated", event.title, venue);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/venue`, {
        method: "POST",
        body: JSON.stringify({ venue })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function attachCalendarAgenda(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const agenda = "Governance agenda attached";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, agenda } : item));
    recordAudit("CalendarAgendaAttached", event.title, agenda);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/agenda`, {
        method: "POST",
        body: JSON.stringify({ agenda })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function logCalendarAttendance(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const count = 24;
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, attendance: count } : item));
    recordAudit("CalendarAttendanceLogged", event.title, `${count} attendees`);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/attendance`, {
        method: "POST",
        body: JSON.stringify({ count })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function sendCalendarReminder(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const audience = "All participants";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, reminderSent: true, reminderAudience: audience } : item));
    recordAudit("CalendarReminderSent", event.title, audience);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/reminder`, {
        method: "POST",
        body: JSON.stringify({ audience })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function markCalendarReadiness(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const status = "Ready";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, readiness: status } : item));
    recordAudit("CalendarReadinessMarked", event.title, status);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/readiness`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkCalendarTask(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const taskId = tasks[0]?.id ?? "task-follow-up";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, linkedTask: taskId } : item));
    recordAudit("CalendarTaskLinked", event.title, taskId);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/task`, {
        method: "POST",
        body: JSON.stringify({ taskId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkCalendarReport(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const reportId = reports[0]?.id ?? "report-follow-up";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, linkedReport: reportId } : item));
    recordAudit("CalendarReportLinked", event.title, reportId);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reportId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveCalendarEvent(id: string) {
    const event = calendarEvents.find((item) => item.id === id);
    if (!event) return;
    const reason = "Archived from governance calendar";
    setCalendarEvents((items) => items.map((item) => item.id === id ? { ...item, archived: true, archiveReason: reason } : item));
    recordAudit("CalendarEventArchived", event.title, reason);
    if (!offlineMode) {
      void apiRequest<CalendarEvent>(`/api/calendar-events/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkRescheduleCalendarEvents(ids: string[]) {
    const targetIds = ids.length ? ids : calendarEvents.filter((event) => !event.archived && event.status !== "Complete").slice(0, 3).map((event) => event.id);
    const date = "2026-06-14";
    setCalendarEvents((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, date, status: "Scheduled" } : item));
    recordAudit("CalendarEventsBulkRescheduled", "Governance calendar", `${targetIds.length} events rescheduled`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: CalendarEvent[] }>("/api/calendar-events/bulk/reschedule", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, date })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshCalendarDigest() {
    if (offlineMode) {
      recordAudit("CalendarDigestRefreshed", "Calendar digest", "Local calendar digest refreshed");
      return;
    }
    void apiRequest<CalendarDigest>("/api/calendar-events/digest")
      .then((digest) => {
        setCalendarDigest(digest);
        recordAudit("CalendarDigestRefreshed", "Calendar digest", `${digest.scheduled} scheduled, ${digest.atRisk} at risk`);
      })
      .catch(() => undefined);
  }

  function createPerson(record: Omit<PersonRecord, "id">) {
    const person: PersonRecord = {
      ...record,
      id: `per-${Date.now()}`
    };
    setPersonnel((items) => [person, ...items]);
    recordAudit("PersonRegistered", person.name, `${person.role} assigned to ${person.assignedStation}`);
    if (!offlineMode) {
      void apiRequest<PersonRecord>("/api/personnel", {
        method: "POST",
        body: JSON.stringify(record)
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updatePersonStatus(id: string, status: PersonRecord["status"]) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    recordAudit("PersonStatusUpdated", person.name, status);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updatePersonAssignment(id: string, assignedStation: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, assignedStation, status: "Transfer Pending" } : item));
    recordAudit("PersonAssignmentUpdated", person.name, `${person.currentStation} -> ${assignedStation}`);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/assignment`, {
        method: "POST",
        body: JSON.stringify({ assignedStation, status: "Transfer Pending" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updatePersonRole(id: string, role: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, role } : item));
    recordAudit("PersonRoleUpdated", person.name, role);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/role`, {
        method: "POST",
        body: JSON.stringify({ role })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function deactivatePerson(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, status: "Inactive" } : item));
    recordAudit("PersonDeactivated", person.name, "Personnel record deactivated");
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/deactivate`, {
        method: "POST",
        body: JSON.stringify({ reason: "Deactivated from personnel directory" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function onboardPerson(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, status: "Onboarding", credentialStatus: "Provisioning" } : item));
    recordAudit("PersonOnboardingStarted", person.name, "Onboarding started");
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/onboard`, {
        method: "POST",
        body: JSON.stringify({ reason: "Onboarding from personnel directory" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function resetPersonCredentials(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, credentialStatus: "Reset required" } : item));
    recordAudit("PersonCredentialsReset", person.name, "Credential reset requested");
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/credentials/reset`, {
        method: "POST",
        body: JSON.stringify({ reason: "Reset from personnel directory" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function placePersonOnLeave(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, status: "On Leave" } : item));
    recordAudit("PersonLeavePlaced", person.name, "Leave recorded");
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/leave`, {
        method: "POST",
        body: JSON.stringify({ reason: "Leave from personnel directory" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updatePersonClearance(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    const clearance = person.clearance === "Executive" ? "Station" : "Executive";
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, clearance } : item));
    recordAudit("PersonClearanceUpdated", person.name, clearance);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/clearance`, {
        method: "POST",
        body: JSON.stringify({ clearance })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function verifyPersonCredentials(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    const status = "Verified";
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, credentialStatus: status } : item));
    recordAudit("PersonCredentialsVerified", person.name, status);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/credentials/verify`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function assignPersonTraining(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    const track = "Governance onboarding";
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, trainingStatus: "Assigned", trainingTrack: track } : item));
    recordAudit("PersonTrainingAssigned", person.name, track);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/training`, {
        method: "POST",
        body: JSON.stringify({ status: "Assigned", track })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function grantPersonStationAccess(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    const stationAccess = person.assignedStation;
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, stationAccess, accessStatus: "Granted" } : item));
    recordAudit("PersonStationAccessGranted", person.name, stationAccess);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/access`, {
        method: "POST",
        body: JSON.stringify({ station: stationAccess, status: "Granted" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function flagPersonIncident(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    const reason = "Personnel review required";
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, incidentFlag: reason, incidentSeverity: "Medium" } : item));
    recordAudit("PersonIncidentFlagged", person.name, reason);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/incident`, {
        method: "POST",
        body: JSON.stringify({ reason, severity: "Medium" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkPersonTask(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    const taskId = tasks[0]?.id ?? "task-follow-up";
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, linkedTask: taskId } : item));
    recordAudit("PersonTaskLinked", person.name, taskId);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/task`, {
        method: "POST",
        body: JSON.stringify({ taskId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function reviewPerson(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    const note = "Personnel record reviewed";
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, reviewStatus: "Reviewed", reviewNote: note } : item));
    recordAudit("PersonReviewed", person.name, note);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ status: "Reviewed", note })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archivePerson(id: string) {
    const person = personnel.find((item) => item.id === id);
    if (!person) return;
    const reason = "Archived from personnel directory";
    setPersonnel((items) => items.map((item) => item.id === id ? { ...item, archived: true, archiveReason: reason } : item));
    recordAudit("PersonArchived", person.name, reason);
    if (!offlineMode) {
      void apiRequest<PersonRecord>(`/api/personnel/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkCredentialReviewPersonnel(ids: string[]) {
    const targetIds = ids.length ? ids : personnel.filter((person) => !person.archived && person.status !== "Inactive").slice(0, 3).map((person) => person.id);
    const status = "Review required";
    setPersonnel((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, credentialStatus: status } : item));
    recordAudit("PersonnelBulkCredentialReview", "Personnel directory", `${targetIds.length} records queued`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: PersonRecord[] }>("/api/personnel/bulk/credential-review", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshPersonnelDigest() {
    if (offlineMode) {
      recordAudit("PersonnelDigestRefreshed", "Personnel digest", "Local personnel digest refreshed");
      return;
    }
    void apiRequest<PersonnelDigest>("/api/personnel/digest")
      .then((digest) => {
        setPersonnelDigest(digest);
        recordAudit("PersonnelDigestRefreshed", "Personnel digest", `${digest.active} active, ${digest.transferPending} transfer pending`);
      })
      .catch(() => undefined);
  }

  function archiveMessageAttachments(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    archiveDocument({
      name: `${message.subject}.${inferFileExtension(message.files)}`,
      classification: `${message.kind} attachment`,
      source: "ChurchMail",
      owner: message.from,
      fileType: inferFileType(message.files),
      status: offlineMode ? "Queued" : "Archived"
    });
    setActiveSection("Archive");
  }

  function sendChurchMail(message: Pick<Message, "kind" | "subject" | "files"> & { to: string }) {
    const status: Status = offlineMode ? "Queued" : "Ready";
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      kind: message.kind,
      subject: message.subject,
      from: `${activeStation.email} -> ${message.to}`,
      age: "now",
      status,
      files: message.files || "No attachments"
    };
    setMessages((items) => [newMessage, ...items]);
    recordAudit("EmailSent", newMessage.subject, `${message.kind} routed to ${message.to}`);
    if (!offlineMode) {
      void apiRequest<Message>("/api/messages", {
        method: "POST",
        body: JSON.stringify({ ...newMessage, actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function submitReport(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    setReports((items) => items.map((item) => item.id === id ? { ...item, state: "Approved", score: 100, routingStage: "Archived upward", submittedAt: new Date().toISOString(), approvedBy: activeStation.email } : item));
    recordAudit("ReportSubmitted", report.name, "Forwarded upward");
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function requestReportCorrection(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    setReports((items) => items.map((item) => item.id === id ? { ...item, state: "Correction Requested", score: Math.min(item.score, 45), routingStage: "Correction cycle", correctionReason: "Correction requested from reporting center" } : item));
    recordAudit("ReportCorrectionRequested", report.name, "Correction requested");
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/correction`, {
        method: "POST",
        body: JSON.stringify({ reason: "Correction requested from reporting center" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateReportScore(id: string, score: number) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    const nextScore = Math.max(0, Math.min(100, score));
    const state = nextScore >= 80 && report.state !== "Approved" ? "In Review" : report.state;
    setReports((items) => items.map((item) => item.id === id ? { ...item, score: nextScore, state, routingStage: nextScore >= 80 ? "Ready for supervisory review" : item.routingStage } : item));
    recordAudit("ReportScoreUpdated", report.name, `${nextScore}% complete`);
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/score`, {
        method: "POST",
        body: JSON.stringify({ score: nextScore, state })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateReportDue(id: string, due: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    setReports((items) => items.map((item) => item.id === id ? { ...item, due } : item));
    recordAudit("ReportDueUpdated", report.name, due);
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/due`, {
        method: "POST",
        body: JSON.stringify({ due })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateReportOwner(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    const owner = activeStation.title;
    setReports((items) => items.map((item) => item.id === id ? { ...item, owner } : item));
    recordAudit("ReportOwnerUpdated", report.name, owner);
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/owner`, {
        method: "POST",
        body: JSON.stringify({ owner })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateReportPath(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    const path = `${activeStation.level} -> Supervising Office -> Archive`;
    setReports((items) => items.map((item) => item.id === id ? { ...item, path, routingStage: "Route recalculated" } : item));
    recordAudit("ReportPathUpdated", report.name, path);
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/path`, {
        method: "POST",
        body: JSON.stringify({ path })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function markReportEvidence(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    setReports((items) => items.map((item) => item.id === id ? { ...item, evidenceStatus: "Evidence attached", score: Math.max(item.score, 70), routingStage: "Evidence review" } : item));
    recordAudit("ReportEvidenceUpdated", report.name, "Evidence attached");
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/evidence`, {
        method: "POST",
        body: JSON.stringify({ evidenceStatus: "Evidence attached" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function reviewReport(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    setReports((items) => items.map((item) => item.id === id ? { ...item, state: "In Review", reviewNote: "Supervisory review opened", routingStage: "Supervisory review" } : item));
    recordAudit("ReportReviewStarted", report.name, "Supervisory review opened");
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ note: "Supervisory review opened" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function verifyReport(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    setReports((items) => items.map((item) => item.id === id ? { ...item, verified: true, state: "Approved", score: Math.max(item.score, 95), routingStage: "Verified archive", evidenceStatus: "Evidence verified", approvedBy: activeStation.email } : item));
    recordAudit("ReportVerified", report.name, "Report verified");
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ state: "Approved" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchReport(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    setReports((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("ReportWatcherAdded", report.name, activeStation.email);
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function duplicateReport(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    const duplicate: Report = { ...report, id: `rep-${Date.now()}`, name: `${report.name} follow-up`, state: "Ready", score: Math.min(report.score, 35), routingStage: "Drafting", submittedAt: undefined, approvedBy: undefined, verified: false };
    setReports((items) => [duplicate, ...items]);
    recordAudit("ReportDuplicated", report.name, duplicate.name);
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ name: duplicate.name, path: report.path, due: report.due })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveReportRecord(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    setReports((items) => items.map((item) => item.id === id ? { ...item, archived: true } : item));
    recordAudit("ReportArchived", report.name, "Report archived");
    if (!offlineMode) {
      void apiRequest<Report>(`/api/reports/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason: "Archived from reporting center" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkSubmitReports(ids: string[]) {
    const targetIds = ids.length ? ids : reports.filter((item) => item.state !== "Approved").map((item) => item.id);
    setReports((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, state: "Approved", score: 100, routingStage: "Archived upward", submittedAt: new Date().toISOString(), approvedBy: activeStation.email } : item));
    recordAudit("ReportsBulkSubmitted", "Reporting center", `${targetIds.length} reports submitted`);
    if (!offlineMode) {
      void apiRequest<{ updated: Report[]; count: number }>("/api/reports/bulk/submit", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkRequestReportCorrections(ids: string[]) {
    const targetIds = ids.length ? ids : reports.filter((item) => item.state !== "Approved").map((item) => item.id);
    setReports((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, state: "Correction Requested", score: Math.min(item.score, 45), routingStage: "Correction cycle", correctionReason: "Bulk correction from reporting center" } : item));
    recordAudit("ReportsBulkCorrectionRequested", "Reporting center", `${targetIds.length} corrections requested`);
    if (!offlineMode) {
      void apiRequest<{ updated: Report[]; count: number }>("/api/reports/bulk/correction", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, reason: "Bulk correction from reporting center" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshWorkflowDigest() {
    if (offlineMode) {
      recordAudit("WorkflowDigestRefreshed", "Workflow digest", "Local workflow digest refreshed");
      return;
    }
    void apiRequest<WorkflowDigest>("/api/workflows/digest")
      .then((digest) => {
        setWorkflowDigest(digest);
        recordAudit("WorkflowDigestRefreshed", "Workflow digest", `${digest.reportsOpen} reports, ${digest.approvalsOpen} approvals open`);
      })
      .catch(() => undefined);
  }

  function refreshReportDigest() {
    if (offlineMode) {
      recordAudit("ReportDigestRefreshed", "Report digest", "Local report digest refreshed");
      return;
    }
    void apiRequest<ReportDigest>("/api/reports/digest")
      .then((digest) => {
        setReportDigest(digest);
        recordAudit("ReportDigestRefreshed", "Report digest", `${digest.open} open, ${digest.overdue} overdue`);
      })
      .catch(() => undefined);
  }

  function archiveReportEvidence(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    archiveDocument({
      name: `${report.name} evidence packet.pdf`,
      classification: "Report evidence",
      source: "Report",
      owner: report.owner,
      fileType: "PDF",
      status: offlineMode ? "Queued" : "Archived"
    });
    setActiveSection("Archive");
  }

  function buildReportGovernancePacket(id: string) {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    const approval: Approval = {
      id: `app-${Date.now()}`,
      request: `${report.name} approval packet`,
      route: report.path,
      limit: "Delegated authority review",
      state: offlineMode ? "Queued" : "Validation",
      signatures: "0/3",
      delegate: report.owner
    };
    setReports((items) => items.map((item) => item.id === id ? {
      ...item,
      evidenceStatus: "Evidence packet bundled",
      routingStage: "Governance packet assembled",
      reviewNote: "Report packet assembled for approval, archive, and audit follow-through",
      score: Math.max(item.score, 88),
      state: item.state === "Approved" ? item.state : "In Review"
    } : item));
    setApprovals((items) => [approval, ...items]);
    archiveDocument({
      name: `${report.name} governance packet.pdf`,
      classification: "Report governance packet",
      source: "Report",
      owner: report.owner,
      fileType: "PDF",
      status: offlineMode ? "Queued" : "Archived",
      linkedReport: report.id,
      linkedApproval: approval.id
    });
    if (report.due === "Overdue" || report.state === "Escalated") {
      triggerEscalation("Report", report.name, "Governance packet requires supervisory attention", report.owner, report.due === "Overdue" ? "Critical" : "High");
    }
    recordAudit("ReportGovernancePacketBuilt", report.name, `${approval.request} / archive packet created`);
    if (!offlineMode) {
      void apiRequest<ReportGovernancePacket>(`/api/reports/${id}/packet`, {
        method: "POST",
        body: JSON.stringify({
          approvalRequest: approval.request,
          route: approval.route,
          limit: approval.limit,
          delegate: approval.delegate,
          escalate: report.due === "Overdue" || report.state === "Escalated"
        })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function triggerEscalation(source: Escalation["source"], item: string, reason: string, owner: string, severity: Escalation["severity"] = "High") {
    const escalation: Escalation = {
      id: `esc-${Date.now()}`,
      source,
      item,
      reason,
      severity,
      status: "Open",
      owner
    };
    setEscalations((items) => [escalation, ...items]);
    recordAudit("EscalationTriggered", item, reason);
    if (!offlineMode) {
      void apiRequest<Escalation>("/api/escalations", {
        method: "POST",
        body: JSON.stringify({ ...escalation, actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function approveRequest(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, state: "Approved", signatures: "complete" } : item));
    recordAudit("ApprovalGranted", approval.request, "Execution authorized");
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function rejectApproval(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, state: "Rejected", signatures: "closed" } : item));
    recordAudit("ApprovalRejected", approval.request, "Request rejected");
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "Rejected from approval console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function signApproval(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    const match = /^(\d+)\/(\d+)$/.exec(approval.signatures);
    const nextApproval = { ...approval };
    if (match) {
      const current = Number(match[1]);
      const required = Number(match[2]);
      const next = Math.min(required, current + 1);
      nextApproval.signatures = `${next}/${required}`;
      nextApproval.state = next >= required ? "Approved" : "Signature";
    } else {
      nextApproval.signatures = "1/2";
      nextApproval.state = "Signature";
    }
    setApprovals((items) => items.map((item) => item.id === id ? nextApproval : item));
    recordAudit("ApprovalSigned", approval.request, `${nextApproval.signatures} signatures`);
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/sign`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateApprovalRoute(id: string, route: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, route, state: "Validation" } : item));
    recordAudit("ApprovalRouteUpdated", approval.request, route);
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/route`, {
        method: "POST",
        body: JSON.stringify({ route, state: "Validation" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateApprovalLimit(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    const limit = approval.limit === "$25,000" ? "$5,000" : "$25,000";
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, limit } : item));
    recordAudit("ApprovalLimitUpdated", approval.request, limit);
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/limit`, {
        method: "POST",
        body: JSON.stringify({ limit })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function delegateApproval(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    const delegate = activeStation.email;
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, delegate, state: "Delegated" } : item));
    recordAudit("ApprovalDelegated", approval.request, delegate);
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/delegate`, {
        method: "POST",
        body: JSON.stringify({ delegate })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function holdApproval(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, state: "On Hold", holdReason: "Authority review required" } : item));
    recordAudit("ApprovalHeld", approval.request, "Authority review required");
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/hold`, {
        method: "POST",
        body: JSON.stringify({ reason: "Authority review required" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function releaseApprovalHold(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, state: "Validation", holdReason: "" } : item));
    recordAudit("ApprovalHoldReleased", approval.request, "Validation");
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/release`, {
        method: "POST",
        body: JSON.stringify({ state: "Validation" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function executeApproval(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    const executedAt = new Date().toISOString();
    setApprovals((items) => items.map((item) => item.id === id ? {
      ...item,
      state: "Approved",
      signatures: "complete",
      executionStatus: "Executed",
      executedAt,
      executedBy: activeStation.email,
      auditTrail: [...(item.auditTrail ?? []), `${executedAt}: Executed by ${activeStation.email}`]
    } : item));
    archiveDocument({
      name: `${approval.request} authorization record.pdf`,
      classification: "Approval authorization",
      source: "Approval",
      owner: activeStation.email,
      fileType: "PDF",
      status: offlineMode ? "Queued" : "Archived",
      linkedApproval: approval.id,
      linkedReport: approval.linkedReport
    });
    recordAudit("ApprovalExecuted", approval.request, "Execution archived");
    if (!offlineMode) {
      void apiRequest<{ approval: Approval; document: DocumentRecord }>(`/api/approvals/${id}/execute`, {
        method: "POST",
        body: JSON.stringify({ status: "Executed" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchApproval(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("ApprovalWatcherAdded", approval.request, activeStation.email);
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function duplicateApproval(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    const duplicate: Approval = { ...approval, id: `app-${Date.now()}`, request: `${approval.request} follow-up`, state: "Validation", signatures: "0/2" };
    setApprovals((items) => [duplicate, ...items]);
    recordAudit("ApprovalDuplicated", approval.request, duplicate.request);
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ request: duplicate.request, route: approval.route, limit: approval.limit })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveApproval(id: string) {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) return;
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, archived: true } : item));
    recordAudit("ApprovalArchived", approval.request, "Approval archived");
    if (!offlineMode) {
      void apiRequest<Approval>(`/api/approvals/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason: "Archived from approval engine" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkSignApprovals(ids: string[]) {
    const targetIds = ids.length ? ids : approvals.filter((item) => item.state !== "Approved" && item.state !== "Rejected").slice(0, 3).map((item) => item.id);
    setApprovals((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, state: "Signature", signatures: "1/2" } : item));
    recordAudit("ApprovalsBulkSigned", "Approval engine", `${targetIds.length} approvals signed`);
    if (!offlineMode) {
      void apiRequest<{ updated: Approval[]; count: number }>("/api/approvals/bulk/sign", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, signatures: "1/2" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshApprovalDigest() {
    if (offlineMode) {
      recordAudit("ApprovalDigestRefreshed", "Approval digest", "Local approval digest refreshed");
      return;
    }
    void apiRequest<ApprovalDigest>("/api/approvals/digest")
      .then((digest) => {
        setApprovalDigest(digest);
        recordAudit("ApprovalDigestRefreshed", "Approval digest", `${digest.open} open, ${digest.held} held`);
      })
      .catch(() => undefined);
  }

  function bulkApproveRequests(ids: string[]) {
    const targetIds = ids.length ? ids : approvals.filter((item) => item.state !== "Approved").map((item) => item.id);
    setApprovals((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, state: "Approved", signatures: "complete" } : item));
    recordAudit("ApprovalsBulkApproved", "Approval engine", `${targetIds.length} approvals granted`);
    if (!offlineMode) {
      void apiRequest<{ updated: Approval[]; count: number }>("/api/approvals/bulk/approve", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkRejectRequests(ids: string[]) {
    const targetIds = ids.length ? ids : approvals.filter((item) => item.state !== "Approved").map((item) => item.id);
    setApprovals((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, state: "Rejected", signatures: "closed" } : item));
    recordAudit("ApprovalsBulkRejected", "Approval engine", `${targetIds.length} approvals rejected`);
    if (!offlineMode) {
      void apiRequest<{ updated: Approval[]; count: number }>("/api/approvals/bulk/reject", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, reason: "Bulk rejection from approval engine" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function executeTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? {
      ...item,
      step: "New station login ready",
      risk: "Previous permissions revoked"
    } : item));
    setPersonnel((items) => items.map((item) => item.name === transfer.person ? {
      ...item,
      currentStation: transfer.to,
      assignedStation: transfer.to,
      status: "Assigned"
    } : item));
    recordAudit("TransferExecuted", transfer.person, "Identity migration logged");
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/execute`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function createTransferRequest(draft: Omit<Transfer, "id" | "step" | "risk">) {
    const transfer: Transfer = {
      ...draft,
      id: `trn-${Date.now()}`,
      step: offlineMode ? "Queued for mission office" : "Recipient acknowledgement",
      risk: "Session switch pending"
    };
    setTransfers((items) => [transfer, ...items]);
    recordAudit("TransferCreated", transfer.person, `${transfer.from} -> ${transfer.to}`);
    if (!offlineMode) {
      void apiRequest<Transfer>("/api/transfers", {
        method: "POST",
        body: JSON.stringify(draft)
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function acknowledgeTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? {
      ...item,
      step: "Permissions migration",
      risk: "Acknowledgement recorded"
    } : item));
    recordAudit("TransferAcknowledged", transfer.person, "Recipient acknowledgement recorded");
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/acknowledge`, {
        method: "POST",
        body: JSON.stringify({ reason: "Acknowledged from transfer console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateTransferRisk(id: string, risk: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, risk } : item));
    recordAudit("TransferRiskUpdated", transfer.person, risk);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/risk`, {
        method: "POST",
        body: JSON.stringify({ risk })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function prepareTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, step: "Pre-migration checklist", risk: "Identity graph prepared" } : item));
    recordAudit("TransferPrepared", transfer.person, "Identity graph prepared");
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/prepare`, {
        method: "POST",
        body: JSON.stringify({ note: "Identity graph prepared" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function revokeTransferAccess(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, step: "Previous access revoked", risk: "Old station credentials disabled" } : item));
    recordAudit("TransferAccessRevoked", transfer.person, "Old station credentials disabled");
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/revoke-access`, {
        method: "POST",
        body: JSON.stringify({ reason: "Revoked from transfer console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function activateTransferStation(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, step: "New station activated", risk: "New workstation ready" } : item));
    recordAudit("TransferStationActivated", transfer.person, transfer.to);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/activate-station`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function verifyTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, step: "Verified", risk: "Identity migration verified" } : item));
    recordAudit("TransferVerified", transfer.person, "Identity migration verified");
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ result: "Identity migration verified" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function recordTransferLetter(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    const reference = "Mission letter received";
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, letterStatus: "Received", letterRef: reference } : item));
    recordAudit("TransferLetterRecorded", transfer.person, reference);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/letter`, {
        method: "POST",
        body: JSON.stringify({ status: "Received", reference })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function scheduleTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    const scheduledFor = "Tomorrow";
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, scheduledFor } : item));
    recordAudit("TransferScheduled", transfer.person, scheduledFor);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/schedule`, {
        method: "POST",
        body: JSON.stringify({ scheduledFor })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function noteTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    const note = "Transfer reviewed from console";
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, notes: [...(item.notes ?? []), `${activeStation.email}: ${note}`] } : item));
    recordAudit("TransferNoteAdded", transfer.person, note);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/note`, {
        method: "POST",
        body: JSON.stringify({ note })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("TransferWatcherAdded", transfer.person, activeStation.email);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkTransferPersonnel(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    const personnelId = personnel.find((person) => person.name === transfer.person)?.id ?? personnel[0]?.id ?? "personnel-follow-up";
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, personnelRecord: personnelId } : item));
    recordAudit("TransferPersonnelLinked", transfer.person, personnelId);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/personnel-link`, {
        method: "POST",
        body: JSON.stringify({ personnelId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkTransferTask(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    const taskId = tasks[0]?.id ?? "task-follow-up";
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, linkedTask: taskId } : item));
    recordAudit("TransferTaskLinked", transfer.person, taskId);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/task`, {
        method: "POST",
        body: JSON.stringify({ taskId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkTransferReport(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    const reportId = reports[0]?.id ?? "report-follow-up";
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, linkedReport: reportId } : item));
    recordAudit("TransferReportLinked", transfer.person, reportId);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reportId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    const reason = "Archived from transfer console";
    setTransfers((items) => items.map((item) => item.id === id ? { ...item, archived: true, archiveReason: reason } : item));
    recordAudit("TransferArchived", transfer.person, reason);
    if (!offlineMode) {
      void apiRequest<Transfer>(`/api/transfers/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkVerifyTransfers(ids: string[]) {
    const targetIds = ids.length ? ids : transfers.filter((transfer) => !transfer.archived && transfer.step !== "Verified").slice(0, 3).map((transfer) => transfer.id);
    setTransfers((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, step: "Verified", risk: "Bulk identity verification complete" } : item));
    recordAudit("TransfersBulkVerified", "Transfer console", `${targetIds.length} transfers verified`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: Transfer[] }>("/api/transfers/bulk/verify", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, result: "Bulk identity verification complete" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshTransferDigest() {
    if (offlineMode) {
      recordAudit("TransferDigestRefreshed", "Transfer digest", "Local transfer digest refreshed");
      return;
    }
    void apiRequest<TransferDigest>("/api/transfers/digest")
      .then((digest) => {
        setTransferDigest(digest);
        recordAudit("TransferDigestRefreshed", "Transfer digest", `${digest.pending} pending, ${digest.ready} ready`);
      })
      .catch(() => undefined);
  }

  function createOffice(office: Omit<Office, "id" | "password" | "status">) {
    const normalizedEmail = office.email.toLowerCase();
    const exists = stationDirectory.some((station) => station.email === normalizedEmail);
    if (exists) return false;

    const parentName = office.parentName ?? office.supervisor;
    const permissionPreset = office.permissionPreset ?? "Reporter";
    const createdOffice: Office = {
      ...office,
      email: normalizedEmail,
      nodeKind: office.nodeKind ?? "Office",
      parentName,
      permissionPreset,
      reportingRoute: office.reportingRoute ?? buildReportingRoute(office.level, parentName),
      workflowAccess: office.workflowAccess ?? workflowAccessForPreset(permissionPreset),
      id: `ofc-${Date.now()}`,
      password: `gcos-${office.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      status: "Provisioned"
    };
    setOffices((items) => [createdOffice, ...items]);
    recordAudit("OfficeCreated", createdOffice.name, `${createdOffice.level} workstation provisioned`);
    if (!offlineMode) {
      void apiRequest<Office>("/api/offices", {
        method: "POST",
        body: JSON.stringify({ ...createdOffice, actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
    return true;
  }

  function updateOfficeStatus(id: string, status: Office["status"]) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    recordAudit("OfficeStatusUpdated", office.name, status);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateOfficeSupervisor(id: string, supervisor: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, supervisor } : item));
    recordAudit("OfficeSupervisorUpdated", office.name, supervisor);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/supervisor`, {
        method: "POST",
        body: JSON.stringify({ supervisor })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function activateOffice(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, status: "Active" } : item));
    recordAudit("OfficeActivated", office.name, "Office activated");
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/activate`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function suspendOffice(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, status: "Suspended" } : item));
    recordAudit("OfficeSuspended", office.name, "Office suspended");
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/suspend`, {
        method: "POST",
        body: JSON.stringify({ reason: "Suspended from office registry" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function rotateOfficePassword(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    const password = `${office.password}-${Date.now().toString(36)}`;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, password } : item));
    recordAudit("OfficePasswordRotated", office.name, "Station credential rotated");
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/password/rotate`, {
        method: "POST",
        body: JSON.stringify({ password })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function activateOfficeStation(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, status: "Active" } : item));
    recordAudit("OfficeStationActivated", office.name, `${office.email} ready`);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/station/activate`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function approveOfficeAccount(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id || normalizeStationEmail(item.email) === email ? {
      ...item,
      status: "Ready",
      emailVerified: true,
      complianceStatus: "Approved",
      notes: [...(item.notes ?? []), `${activeStation.email}: Account approved for workstation sign-in.`]
    } : item));
    patchStation(id, { status: "Ready", verified: true });
    recordAudit("AccountApproved", office.name, `${office.email} approved for sign-in`);
  }

  function rejectOfficeAccount(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id ? {
      ...item,
      status: "Rejected",
      complianceStatus: "Rejected",
      notes: [...(item.notes ?? []), `${activeStation.email}: Account request rejected. Contact administration for correction.`]
    } : item));
    patchStation(id, { status: "Rejected", verified: false });
    recordAudit("AccountRejected", office.name, `${office.email} rejected from user management`);
  }

  function resetOfficeAccess(id: string) {
    const office = offices.find((item) => item.id === id || item.email === id);
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!office && !station) return;
    const email = normalizeStationEmail(office?.email ?? station?.email ?? id);
    const label = (office?.name ?? station?.title ?? "station").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "station";
    const password = `${label}-${Date.now().toString(36).slice(-5)}`;
    setOffices((items) => items.map((item) => item.id === id ? {
      ...item,
      password,
      status: "Ready",
      notes: [...(item.notes ?? []), `${activeStation.email}: Password reset issued.`]
    } : item));
    setStationPasswordOverrides((items) => ({ ...items, [email]: password }));
    patchStation(id, { status: "Ready", verified: true });
    recordAudit("AccountPasswordReset", office?.name ?? station?.title ?? email, "New station password issued");
  }

  function changeOwnPassword(currentPassword: string, newPassword: string): AuthActionResult {
    const email = normalizeStationEmail(activeStation.email);
    const office = offices.find((item) => normalizeStationEmail(item.email) === email);
    const expectedPassword = stationPasswordOverrides[email] ?? seedStationPasswords[email] ?? office?.password;
    if (expectedPassword && expectedPassword !== currentPassword) {
      return { ok: false, message: "Current password does not match this account." };
    }
    if (newPassword.length < 8) {
      return { ok: false, message: "Use a new password with at least 8 characters." };
    }
    setStationPasswordOverrides((items) => ({ ...items, [email]: newPassword }));
    setOffices((items) => items.map((item) => normalizeStationEmail(item.email) === email ? { ...item, password: newPassword, notes: [...(item.notes ?? []), `${email}: Password changed from account settings.`] } : item));
    recordAudit("AccountPasswordChanged", email, "Password changed by signed-in user");
    return { ok: true, message: "Password updated. Use the new password next time you sign in." };
  }

  function createManagedStationAccount(account: CreateAccountInput): AuthActionResult {
    const normalizedEmail = normalizeStationEmail(account.email);
    const cleanOfficeName = account.officeName.trim();
    const cleanDepartment = account.department.trim() || "Church Administration";
    const cleanFullName = account.fullName.trim() || activeStation.email;
    if (!normalizedEmail.endsWith("@rmvi.org")) {
      return { ok: false, message: "Use an official rmvi.org organizational email." };
    }
    if (stationDirectory.some((station) => station.email === normalizedEmail)) {
      return { ok: false, message: "That organizational email already has a workstation." };
    }
    if (!cleanOfficeName) {
      return { ok: false, message: "Enter the office, branch, or department name." };
    }
    if (account.password.length < 8) {
      return { ok: false, message: "Use a password with at least 8 characters." };
    }
    const officeId = `ofc-${Date.now()}`;
    const status = permissions.canCreateOffices || permissions.canOverride ? "Ready" : "Pending Approval";
    const parentName = account.level === "Local Branch" ? "Area Office" : String(activeStation.level);
    const permissionPreset: PermissionPreset = permissions.canCreateOffices || permissions.canOverride ? "Department Lead" : "Reporter";
    const reportingRoute = buildReportingRoute(account.level, parentName);
    const workflowAccess = workflowAccessForPreset(permissionPreset);
    const createdOffice: Office = {
      id: officeId,
      name: cleanOfficeName,
      email: normalizedEmail,
      level: account.level,
      department: cleanDepartment,
      supervisor: parentName,
      password: account.password,
      status,
      nodeKind: "Office",
      parentName,
      permissionPreset,
      reportingRoute,
      workflowAccess,
      emailVerified: status === "Ready",
      notes: [`Created by ${cleanFullName} from Account Settings.`],
      complianceStatus: status === "Ready" ? "Approved" : "Onboarding"
    };
    const createdStation: StationCard = {
      id: officeId,
      email: normalizedEmail,
      title: `${cleanOfficeName} Workstation`,
      level: account.level,
      authority: `${cleanDepartment}, created by ${cleanFullName}`,
      icon: iconForLevel(account.level),
      status,
      verified: status === "Ready",
      nodeKind: "Office",
      parentName,
      permissionPreset,
      reportingRoute,
      workflowAccess
    };
    setOffices((items) => [createdOffice, ...items]);
    setApiStations((items) => [createdStation, ...items.filter((station) => station.email !== normalizedEmail)]);
    setStationPasswordOverrides((items) => ({ ...items, [normalizedEmail]: account.password }));
    recordAudit(status === "Ready" ? "AccountCreated" : "AccountApprovalRequested", createdOffice.name, `${normalizedEmail} created from account settings`);
    return { ok: true, message: status === "Ready" ? "User account created and ready for sign-in." : "Account request created for administrator approval." };
  }

  function deleteStationAccount(id: string): AuthActionResult {
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!station) return { ok: false, message: "Account not found." };
    if (normalizeStationEmail(station.email) === "admin@rmvi.org") {
      return { ok: false, message: "The primary administrator account cannot be deleted." };
    }
    const canDelete = permissions.canOverride || permissions.canCreateOffices || normalizeStationEmail(station.email) === normalizeStationEmail(activeStation.email);
    if (!canDelete) {
      return { ok: false, message: "This station does not have permission to delete that account." };
    }
    setOffices((items) => items.map((item) => item.id === id || item.email === station.email ? { ...item, status: "Deleted", notes: [...(item.notes ?? []), `${activeStation.email}: Account deleted.`] } : item));
    patchStation(id, { status: "Deleted", verified: false });
    setStationPasswordOverrides((items) => {
      const next = { ...items };
      delete next[normalizeStationEmail(station.email)];
      return next;
    });
    recordAudit("AccountDeleted", station.email, `Deleted by ${activeStation.email}`);
    if (normalizeStationEmail(station.email) === normalizeStationEmail(activeStation.email)) {
      setSession(null);
    }
    return { ok: true, message: "Account deleted and removed from sign-in." };
  }

  function updateOfficeDepartment(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    const department = office.department === "Mission Administration" ? "District Command" : "Mission Administration";
    setOffices((items) => items.map((item) => item.id === id ? { ...item, department } : item));
    recordAudit("OfficeDepartmentUpdated", office.name, department);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/department`, {
        method: "POST",
        body: JSON.stringify({ department })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateOfficeLevel(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    const level: StationLevel = office.level === "District HQ" ? "Area HQ" : "District HQ";
    setOffices((items) => items.map((item) => item.id === id ? { ...item, level } : item));
    recordAudit("OfficeLevelUpdated", office.name, level);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/level`, {
        method: "POST",
        body: JSON.stringify({ level })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function verifyOfficeEmail(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, emailVerified: true } : item));
    recordAudit("OfficeEmailVerified", office.name, office.email);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/email/verify`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchOffice(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("OfficeWatcherAdded", office.name, activeStation.email);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function noteOffice(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    const note = "Office reviewed from registry";
    setOffices((items) => items.map((item) => item.id === id ? { ...item, notes: [...(item.notes ?? []), `${activeStation.email}: ${note}`] } : item));
    recordAudit("OfficeNoteAdded", office.name, note);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/note`, {
        method: "POST",
        body: JSON.stringify({ note })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateOfficeCapacity(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    const capacity = 12;
    setOffices((items) => items.map((item) => item.id === id ? { ...item, capacity } : item));
    recordAudit("OfficeCapacityUpdated", office.name, `${capacity}`);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/capacity`, {
        method: "POST",
        body: JSON.stringify({ capacity })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function reviewOfficeCompliance(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    const status = "Reviewed";
    setOffices((items) => items.map((item) => item.id === id ? { ...item, complianceStatus: status } : item));
    recordAudit("OfficeComplianceReviewed", office.name, status);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/compliance`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveOffice(id: string) {
    const office = offices.find((item) => item.id === id);
    if (!office) return;
    const reason = "Archived from office registry";
    setOffices((items) => items.map((item) => item.id === id ? { ...item, archived: true, archiveReason: reason } : item));
    recordAudit("OfficeArchived", office.name, reason);
    if (!offlineMode) {
      void apiRequest<Office>(`/api/offices/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkActivateOffices(ids: string[]) {
    const targetIds = ids.length ? ids : offices.filter((office) => !office.archived && office.status !== "Active").slice(0, 3).map((office) => office.id);
    setOffices((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Active" } : item));
    recordAudit("OfficesBulkActivated", "Office registry", `${targetIds.length} offices activated`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: Office[] }>("/api/offices/bulk/activate", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshOfficeDigest() {
    if (offlineMode) {
      recordAudit("OfficeDigestRefreshed", "Office digest", "Local office digest refreshed");
      return;
    }
    void apiRequest<OfficeDigest>("/api/offices/digest")
      .then((digest) => {
        setOfficeDigest(digest);
        recordAudit("OfficeDigestRefreshed", "Office digest", `${digest.active} active, ${digest.suspended} suspended`);
      })
      .catch(() => undefined);
  }

  function stationKey(station: StationCard) {
    return station.id ?? station.email;
  }

  function patchStation(id: string, updates: Partial<StationCard>) {
    setApiStations((items) => {
      const updated = items.map((item) => stationKey(item) === id || item.email === id ? { ...item, ...updates } : item);
      if (updated.some((item) => stationKey(item) === id || item.email === id)) return updated;
      const station = stations.find((item) => stationKey(item) === id || item.email === id);
      return station ? [...updated, { ...station, ...updates }] : updated;
    });
  }

  function updateStationLevel(id: string) {
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!station) return;
    const levels = hierarchy.map((item) => item.level);
    const nextLevel = levels[(levels.indexOf(station.level as StationLevel) + 1 || 1) % levels.length];
    patchStation(id, { level: nextLevel });
    recordAudit("StationLevelUpdated", station.email, nextLevel);
    if (!offlineMode) {
      void apiRequest<StationCard>(`/api/stations/${encodeURIComponent(id)}/level`, {
        method: "POST",
        body: JSON.stringify({ level: nextLevel, actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateStationAuthority(id: string) {
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!station) return;
    const authority = `${station.authority} | Supervisor route checked`;
    patchStation(id, { authority });
    recordAudit("StationAuthorityUpdated", station.email, "Supervisor route checked");
    if (!offlineMode) {
      void apiRequest<StationCard>(`/api/stations/${encodeURIComponent(id)}/authority`, {
        method: "POST",
        body: JSON.stringify({ authority, actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function verifyStation(id: string) {
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!station) return;
    patchStation(id, { verified: true, status: "Verified" });
    recordAudit("StationVerified", station.email, "Station identity verified");
    if (!offlineMode) {
      void apiRequest<StationCard>(`/api/stations/${encodeURIComponent(id)}/verify`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email, result: "Station identity verified" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchStation(id: string) {
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!station) return;
    const watchers = Array.from(new Set([...(station.watchers ?? []), activeStation.email]));
    patchStation(id, { watchers });
    recordAudit("StationWatcherAdded", station.email, activeStation.email);
    if (!offlineMode) {
      void apiRequest<StationCard>(`/api/stations/${encodeURIComponent(id)}/watch`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email, watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function suspendStation(id: string) {
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!station) return;
    patchStation(id, { status: "Suspended" });
    recordAudit("StationSuspended", station.email, "Station suspended from hierarchy graph");
    if (!offlineMode) {
      void apiRequest<StationCard>(`/api/stations/${encodeURIComponent(id)}/suspend`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email, reason: "Station suspended from hierarchy graph" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function activateStation(id: string) {
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!station) return;
    patchStation(id, { status: "Active" });
    recordAudit("StationActivated", station.email, "Station reactivated");
    if (!offlineMode) {
      void apiRequest<StationCard>(`/api/stations/${encodeURIComponent(id)}/activate`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email, reason: "Station reactivated" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function mirrorStation(id: string) {
    const station = stationDirectory.find((item) => stationKey(item) === id || item.email === id);
    if (!station) return;
    const mirrorEmail = `${station.email.split("@")[0]}.mirror.${Date.now().toString(36)}@rmvi.org`;
    const mirror: StationCard = {
      id: `mirror-${Date.now()}`,
      email: mirrorEmail,
      title: `${station.title} Mirror`,
      level: station.level,
      authority: `${station.authority} | Mirror station`,
      icon: iconForLevel(station.level),
      status: "Provisioned",
      mirrorOf: station.id ?? station.email
    };
    setApiStations((items) => [...items, mirror]);
    recordAudit("StationMirrorCreated", mirror.email, `Mirror of ${station.email}`);
    if (!offlineMode) {
      void apiRequest<StationCard>(`/api/stations/${encodeURIComponent(id)}/mirror`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email, email: mirrorEmail, title: mirror.title, authority: mirror.authority })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkVerifyStations() {
    const ids = stationDirectory.map(stationKey);
    setApiStations((items) => {
      const merged = new Map(items.map((item) => [stationKey(item), item]));
      stationDirectory.forEach((station) => merged.set(stationKey(station), { ...station, verified: true, status: "Verified" }));
      return Array.from(merged.values());
    });
    recordAudit("StationsBulkVerified", "Hierarchy graph", `${ids.length} stations verified`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: StationCard[] }>("/api/stations/bulk/verify", {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email, ids })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshHierarchyDigest() {
    if (offlineMode) {
      recordAudit("HierarchyDigestRefreshed", "Hierarchy digest", "Local hierarchy digest refreshed");
      return;
    }
    void apiRequest<HierarchyDigest>("/api/hierarchy/digest")
      .then((digest) => {
        setHierarchyDigest(digest);
        recordAudit("HierarchyDigestRefreshed", "Hierarchy digest", `${digest.verified} verified, ${digest.suspended} suspended`);
      })
      .catch(() => undefined);
  }

  function escalateUpward(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, status: "Upward" } : item));
    recordAudit("EscalationRouted", escalation.item, "Forwarded to supervising authority");
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/route`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateEscalationSeverity(id: string, severity: Escalation["severity"]) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, severity } : item));
    recordAudit("EscalationSeverityUpdated", escalation.item, severity);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/severity`, {
        method: "POST",
        body: JSON.stringify({ severity })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateEscalationOwner(id: string, owner: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, owner } : item));
    recordAudit("EscalationOwnerUpdated", escalation.item, owner);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/owner`, {
        method: "POST",
        body: JSON.stringify({ owner })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function resolveEscalation(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, status: "Resolved" } : item));
    recordAudit("EscalationResolved", escalation.item, "Resolution recorded");
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function triageEscalation(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, owner: activeStation.email, severity: "Critical", status: "Open" } : item));
    recordAudit("EscalationTriaged", escalation.item, `${activeStation.email} triaged as Critical`);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/triage`, {
        method: "POST",
        body: JSON.stringify({ owner: activeStation.email, severity: "Critical" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateEscalationSla(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const sla = escalation.sla === "24 hours" ? "4 hours" : "24 hours";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, sla } : item));
    recordAudit("EscalationSlaUpdated", escalation.item, sla);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/sla`, {
        method: "POST",
        body: JSON.stringify({ sla })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchEscalation(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, status: item.status === "Resolved" ? item.status : "Watching", watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("EscalationWatcherAdded", escalation.item, activeStation.email);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function mergeEscalation(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const target = escalations.find((item) => item.id !== id && item.status !== "Resolved")?.item ?? "primary escalation";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, status: "Merged", reason: `${item.reason} | Merged into ${target}` } : item));
    recordAudit("EscalationMerged", escalation.item, target);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/merge`, {
        method: "POST",
        body: JSON.stringify({ target })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function attachEscalationEvidence(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const evidence = "Escalation evidence packet";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, evidence } : item));
    recordAudit("EscalationEvidenceAttached", escalation.item, evidence);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/evidence`, {
        method: "POST",
        body: JSON.stringify({ evidence })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function commentEscalation(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const comment = "Escalation reviewed from engine";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, comments: [...(item.comments ?? []), `${activeStation.email}: ${comment}`] } : item));
    recordAudit("EscalationCommentAdded", escalation.item, comment);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/comment`, {
        method: "POST",
        body: JSON.stringify({ comment })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function noteEscalationResolution(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const note = "Resolution note recorded";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, resolutionNote: note } : item));
    recordAudit("EscalationResolutionNoted", escalation.item, note);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/resolution-note`, {
        method: "POST",
        body: JSON.stringify({ note })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateEscalationDue(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const due = escalation.due === "Today" ? "Tomorrow" : "Today";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, due } : item));
    recordAudit("EscalationDueUpdated", escalation.item, due);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/due`, {
        method: "POST",
        body: JSON.stringify({ due })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkEscalationTask(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const taskId = tasks[0]?.id ?? "task-follow-up";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, linkedTask: taskId } : item));
    recordAudit("EscalationTaskLinked", escalation.item, taskId);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/task`, {
        method: "POST",
        body: JSON.stringify({ taskId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkEscalationReport(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const reportId = reports[0]?.id ?? "report-follow-up";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, linkedReport: reportId } : item));
    recordAudit("EscalationReportLinked", escalation.item, reportId);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reportId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkEscalationApproval(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const approvalId = approvals[0]?.id ?? "approval-follow-up";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, linkedApproval: approvalId } : item));
    recordAudit("EscalationApprovalLinked", escalation.item, approvalId);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/approval-link`, {
        method: "POST",
        body: JSON.stringify({ approvalId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function scoreEscalationImpact(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, impactScore: 90, impactSummary: "High governance impact" } : item));
    recordAudit("EscalationImpactScored", escalation.item, "90");
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/impact`, {
        method: "POST",
        body: JSON.stringify({ score: 90, summary: "High governance impact" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveEscalation(id: string) {
    const escalation = escalations.find((item) => item.id === id);
    if (!escalation) return;
    const reason = "Archived from escalation engine";
    setEscalations((items) => items.map((item) => item.id === id ? { ...item, archived: true, archiveReason: reason } : item));
    recordAudit("EscalationArchived", escalation.item, reason);
    if (!offlineMode) {
      void apiRequest<Escalation>(`/api/escalations/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkResolveEscalations(ids: string[]) {
    const targetIds = ids.length ? ids : escalations.filter((escalation) => !escalation.archived && escalation.status !== "Resolved").slice(0, 3).map((escalation) => escalation.id);
    setEscalations((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Resolved", resolutionNote: "Bulk resolved" } : item));
    recordAudit("EscalationsBulkResolved", "Escalation engine", `${targetIds.length} escalations resolved`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: Escalation[] }>("/api/escalations/bulk/resolve", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, note: "Bulk resolved" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshEscalationDigest() {
    if (offlineMode) {
      recordAudit("EscalationDigestRefreshed", "Escalation digest", "Local escalation digest refreshed");
      return;
    }
    void apiRequest<EscalationDigest>("/api/escalations/digest")
      .then((digest) => {
        setEscalationDigest(digest);
        recordAudit("EscalationDigestRefreshed", "Escalation digest", `${digest.open} open, ${digest.critical} critical`);
      })
      .catch(() => undefined);
  }

  function generateAiDraft(kind: AiDraft["kind"], focus: string) {
    const openEscalations = escalations.filter((item) => item.status !== "Resolved");
    const pendingApprovals = approvals.filter((item) => item.state !== "Approved");
    const activeReports = reports.filter((item) => item.state !== "Approved");
    const newestMessage = messages[0];
    const createdAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const title = `${kind}: ${focus}`;
    const body = [
      `${activeStation.title} generated this ${kind.toLowerCase()} for ${focus}.`,
      `Reports needing attention: ${activeReports.length}. Highest risk report: ${activeReports[0]?.name ?? "none"}.`,
      `Open escalations: ${openEscalations.length}. Priority item: ${openEscalations[0]?.item ?? "none"}.`,
      `Pending approvals: ${pendingApprovals.length}. Current approval route: ${pendingApprovals[0]?.route ?? "none"}.`,
      `Latest ChurchMail signal: ${newestMessage?.subject ?? "no current messages"}.`
    ].join("\n");
    const draft: AiDraft = {
      id: `ai-${Date.now()}`,
      kind,
      title,
      body,
      sourceCount: activeReports.length + openEscalations.length + pendingApprovals.length + messages.length,
      createdAt
    };
    setAiDrafts((items) => [draft, ...items]);
    recordAudit("AIDraftGenerated", title, `${draft.sourceCount} governance records summarized`);
    if (!offlineMode) {
      void apiRequest<AiDraft>("/api/ai-drafts", {
        method: "POST",
        body: JSON.stringify({ kind, focus, actor: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveAiDraft(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    archiveDocument({
      name: `${draft.title}.txt`,
      classification: "AI draft",
      source: "AI Desk",
      owner: activeStation.email,
      fileType: "Text",
      status: offlineMode ? "Queued" : "Archived"
    });
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/ai-drafts/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason: "Archived from AI Desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshAiDraft(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    const focus = draft.title.replace(`${draft.kind}: `, "");
    const openEscalations = escalations.filter((item) => item.status !== "Resolved");
    const pendingApprovals = approvals.filter((item) => item.state !== "Approved");
    const activeReports = reports.filter((item) => item.state !== "Approved");
    const activeTasks = tasks.filter((item) => item.status !== "Complete");
    const sourceCount = activeReports.length + openEscalations.length + pendingApprovals.length + activeTasks.length + messages.length;
    const body = [
      `${activeStation.title} refreshed this ${draft.kind.toLowerCase()} for ${focus}.`,
      `Reports needing attention: ${activeReports.length}. Highest risk report: ${activeReports[0]?.name ?? "none"}.`,
      `Active tasks: ${activeTasks.length}. Current task risk: ${activeTasks[0]?.title ?? "none"}.`,
      `Open escalations: ${openEscalations.length}. Priority item: ${openEscalations[0]?.item ?? "none"}.`,
      `Pending approvals: ${pendingApprovals.length}. Current approval route: ${pendingApprovals[0]?.route ?? "none"}.`,
      `Latest ChurchMail signal: ${messages[0]?.subject ?? "no current messages"}.`
    ].join("\n");
    setAiDrafts((items) => items.map((item) => item.id === id ? {
      ...item,
      title: `${draft.kind}: ${focus}`,
      body,
      sourceCount,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } : item));
    recordAudit("AIDraftRefreshed", draft.title, "Draft regenerated from current records");
    if (!offlineMode) {
      void apiRequest<AiDraft>(`/api/ai-drafts/${id}/refresh`, {
        method: "POST",
        body: JSON.stringify({ focus })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateAiDraftStatus(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    const status = draft.status === "Review" ? "Draft" : "Review";
    setAiDrafts((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    recordAudit("AIDraftStatusUpdated", draft.title, status);
    if (!offlineMode) {
      void apiRequest<AiDraft>(`/api/ai-drafts/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function publishAiDraft(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    setAiDrafts((items) => items.map((item) => item.id === id ? { ...item, status: "Published", publishedBy: activeStation.email } : item));
    recordAudit("AIDraftPublished", draft.title, "AI draft published");
    if (!offlineMode) {
      void apiRequest<AiDraft>(`/api/ai-drafts/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bindAiDraftSources(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    const sourceNote = "Bound to current governance source map";
    const sourceCount = reports.length + approvals.length + tasks.length + policies.length + calendarEvents.length + personnel.length + escalations.length + messages.length;
    setAiDrafts((items) => items.map((item) => item.id === id ? { ...item, sourceNote, sourceCount: Math.max(item.sourceCount, sourceCount) } : item));
    recordAudit("AIDraftSourcesBound", draft.title, sourceNote);
    if (!offlineMode) {
      void apiRequest<AiDraft>(`/api/ai-drafts/${id}/sources`, {
        method: "POST",
        body: JSON.stringify({ sourceNote, sourceCount })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function scoreAiDraft(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    const confidence = draft.confidence === 96 ? 88 : 96;
    setAiDrafts((items) => items.map((item) => item.id === id ? { ...item, confidence } : item));
    recordAudit("AIDraftConfidenceScored", draft.title, `${confidence}% confidence`);
    if (!offlineMode) {
      void apiRequest<AiDraft>(`/api/ai-drafts/${id}/confidence`, {
        method: "POST",
        body: JSON.stringify({ confidence })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function sealAiDraft(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    const chainHash = draft.chainHash ?? `sha256:${btoa(`${draft.id}:${draft.title}:${draft.createdAt}`).replaceAll("=", "").slice(0, 24)}`;
    setAiDrafts((items) => items.map((item) => item.id === id ? { ...item, sealed: true, chainHash } : item));
    recordAudit("AIDraftSealed", draft.title, chainHash);
    if (!offlineMode) {
      void apiRequest<AiDraft>(`/api/ai-drafts/${id}/seal`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchAiDraft(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    setAiDrafts((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), activeStation.email])) } : item));
    recordAudit("AIDraftWatcherAdded", draft.title, activeStation.email);
    if (!offlineMode) {
      void apiRequest<AiDraft>(`/api/ai-drafts/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function duplicateAiDraft(id: string) {
    const draft = aiDrafts.find((item) => item.id === id);
    if (!draft) return;
    const duplicate: AiDraft = { ...draft, id: `ai-${Date.now()}`, title: `${draft.title} follow-up`, status: "Draft", createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setAiDrafts((items) => [duplicate, ...items]);
    recordAudit("AIDraftDuplicated", draft.title, duplicate.title);
    if (!offlineMode) {
      void apiRequest<AiDraft>(`/api/ai-drafts/${id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ title: duplicate.title })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkRefreshAiDrafts(ids: string[]) {
    const targetIds = ids.length ? ids : aiDrafts.slice(0, 3).map((draft) => draft.id);
    setAiDrafts((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Refreshed", createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : item));
    recordAudit("AIDraftsBulkRefreshed", "AI Desk", `${targetIds.length} drafts refreshed`);
    if (!offlineMode) {
      void apiRequest<{ updated: AiDraft[]; count: number }>("/api/ai-drafts/bulk/refresh", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, focus: "Bulk governance refresh" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshAiDraftDigest() {
    if (offlineMode) {
      recordAudit("AIDraftDigestRefreshed", "AI draft digest", "Local AI draft digest refreshed");
      return;
    }
    void apiRequest<AiDraftDigest>("/api/ai-drafts/digest")
      .then((digest) => {
        setAiDraftDigest(digest);
        recordAudit("AIDraftDigestRefreshed", "AI draft digest", `${digest.total} drafts, ${digest.published} published`);
      })
      .catch(() => undefined);
  }

  function archiveDocument(record: Omit<DocumentRecord, "id" | "storageKey" | "retainedUntil" | "createdAt">) {
    const safeName = record.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)/g, "");
    const createdAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const documentRecord: DocumentRecord = {
      ...record,
      id: `doc-${Date.now()}`,
      storageKey: `gcos-object-vault/local/${Date.now()}-${safeName}`,
      retainedUntil: "Permanent",
      createdAt
    };
    setDocuments((items) => [documentRecord, ...items]);
    recordAudit("DocumentArchived", documentRecord.name, `${documentRecord.classification} stored in object vault`);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>("/api/documents", {
        method: "POST",
        body: JSON.stringify(record)
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateDocumentClassification(id: string, classification: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, classification } : item));
    recordAudit("DocumentClassificationUpdated", document.name, classification);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/classification`, {
        method: "POST",
        body: JSON.stringify({ classification })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateDocumentOwner(id: string, owner: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, owner } : item));
    recordAudit("DocumentOwnerUpdated", document.name, owner);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/owner`, {
        method: "POST",
        body: JSON.stringify({ owner })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function createAuditNote() {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const row: AuditRow = {
      id: `aud-${Date.now()}`,
      event: "AuditNote",
      actor: activeStation.email,
      object: activeSection,
      result: "Manual audit note recorded",
      time
    };
    setAuditRows((rows) => [row, ...rows]);
    setEvents((items) => [`AuditNote: ${activeSection}`, ...items].slice(0, 8));
    if (!offlineMode) {
      void apiRequest<AuditRow>("/api/audit/note", {
        method: "POST",
        body: JSON.stringify({ object: activeSection, note: "Manual audit note recorded" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function flagAuditRow(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, result: `Flagged: ${item.result}` } : item));
    setEvents((items) => [`AuditRowFlagged: ${row.object}`, ...items].slice(0, 8));
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/flag`, {
        method: "POST",
        body: JSON.stringify({ reason: "Flagged from audit console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function sealAuditRow(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    const chainHash = row.chainHash ?? `sha256:${btoa(`${row.id}:${row.event}:${row.actor}:${row.object}`).replaceAll("=", "").slice(0, 24)}`;
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, sealed: true, chainHash, result: item.result.startsWith("Sealed:") ? item.result : `Sealed: ${item.result}` } : item));
    recordAudit("AuditRowSealed", row.object, chainHash);
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/seal`, {
        method: "POST",
        body: JSON.stringify({ reason: "Sealed from audit console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function verifyAuditRow(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, verified: true, verification: "Integrity verified" } : item));
    recordAudit("AuditRowVerified", row.object, "Integrity verified");
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ result: "Integrity verified" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkFlagAuditRows(ids: string[]) {
    const targetIds = ids.length ? ids : auditRows.slice(0, 3).map((item) => item.id);
    setAuditRows((rows) => rows.map((item) => targetIds.includes(item.id) ? { ...item, result: item.result.startsWith("Flagged:") ? item.result : `Flagged: ${item.result}` } : item));
    recordAudit("AuditRowsBulkFlagged", "Audit ledger", `${targetIds.length} rows flagged`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: AuditRow[] }>("/api/audit/bulk/flag", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, reason: "Bulk flagged from audit console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateAuditSeverity(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    const severity: AuditRow["severity"] = row.severity === "Critical" ? "Medium" : "Critical";
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, severity } : item));
    recordAudit("AuditSeverityUpdated", row.object, severity);
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/severity`, {
        method: "POST",
        body: JSON.stringify({ severity })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateAuditCategory(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    const category = row.category === "Security" ? "Governance" : "Security";
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, category } : item));
    recordAudit("AuditCategoryUpdated", row.object, category);
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/category`, {
        method: "POST",
        body: JSON.stringify({ category })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function assignAuditReviewer(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, reviewer: activeStation.email } : item));
    recordAudit("AuditReviewerAssigned", row.object, activeStation.email);
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/reviewer`, {
        method: "POST",
        body: JSON.stringify({ reviewer: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function appendAuditComment(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    const comment = "Review note added from audit desk";
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, comments: [...(item.comments ?? []), `${activeStation.email}: ${comment}`] } : item));
    recordAudit("AuditCommentAdded", row.object, comment);
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/comment`, {
        method: "POST",
        body: JSON.stringify({ comment })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function openAuditInvestigation(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, investigation: "Open", investigationReason: "Opened from audit desk", severity: item.severity ?? "High" } : item));
    recordAudit("AuditInvestigationOpened", row.object, "Opened from audit desk");
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/investigate`, {
        method: "POST",
        body: JSON.stringify({ reason: "Opened from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function closeAuditInvestigation(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, investigation: "Closed", investigationResult: "Closed from audit desk" } : item));
    recordAudit("AuditInvestigationClosed", row.object, "Closed from audit desk");
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/close`, {
        method: "POST",
        body: JSON.stringify({ result: "Closed from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function placeAuditHold(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, hold: true, holdReason: "Held from audit desk" } : item));
    recordAudit("AuditHoldPlaced", row.object, "Held from audit desk");
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/hold`, {
        method: "POST",
        body: JSON.stringify({ reason: "Held from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function releaseAuditHold(id: string) {
    const row = auditRows.find((item) => item.id === id);
    if (!row) return;
    setAuditRows((rows) => rows.map((item) => item.id === id ? { ...item, hold: false, holdReleaseReason: "Released from audit desk" } : item));
    recordAudit("AuditHoldReleased", row.object, "Released from audit desk");
    if (!offlineMode) {
      void apiRequest<AuditRow>(`/api/audit/${id}/release-hold`, {
        method: "POST",
        body: JSON.stringify({ reason: "Released from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkSealAuditRows(ids: string[]) {
    const targetIds = ids.length ? ids : auditRows.slice(0, 3).map((item) => item.id);
    setAuditRows((rows) => rows.map((item) => targetIds.includes(item.id) ? { ...item, sealed: true, chainHash: item.chainHash ?? `sha256:${btoa(`${item.id}:${item.event}:${item.actor}:${item.object}`).replaceAll("=", "").slice(0, 24)}`, result: item.result.startsWith("Sealed:") ? item.result : `Sealed: ${item.result}` } : item));
    recordAudit("AuditRowsBulkSealed", "Audit ledger", `${targetIds.length} rows sealed`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: AuditRow[] }>("/api/audit/bulk/seal", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, reason: "Bulk sealed from audit console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkVerifyAuditRows(ids: string[]) {
    const targetIds = ids.length ? ids : auditRows.slice(0, 3).map((item) => item.id);
    setAuditRows((rows) => rows.map((item) => targetIds.includes(item.id) ? { ...item, verified: true, verification: "Bulk integrity verified" } : item));
    recordAudit("AuditRowsBulkVerified", "Audit ledger", `${targetIds.length} rows verified`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: AuditRow[] }>("/api/audit/bulk/verify", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds, result: "Bulk integrity verified" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshAuditDigest() {
    if (offlineMode) {
      recordAudit("AuditDigestRefreshed", "Audit digest", "Local audit digest refreshed");
      return;
    }
    void apiRequest<AuditDigest>("/api/audit/digest")
      .then((digest) => {
        setAuditDigest(digest);
        recordAudit("AuditDigestRefreshed", "Audit digest", `${digest.flagged} flagged, ${digest.sealed} sealed`);
      })
      .catch(() => undefined);
  }

  function recordManualEvent() {
    setEvents((items) => ["ManualEventRecorded: Audit console", ...items].slice(0, 8));
    recordAudit("ManualEventRecorded", "Audit console", "Manual event recorded");
    if (!offlineMode) {
      void apiRequest("/api/events", {
        method: "POST",
        body: JSON.stringify({ object: "Audit console", result: "Manual event recorded" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function eventKey(event: string, index: number) {
    return encodeURIComponent(event || String(index));
  }

  function updateEventAt(index: number, event: string) {
    setEvents((items) => items.map((item, itemIndex) => itemIndex === index ? event : item).slice(0, 20));
  }

  function acknowledgeEvent(index: number) {
    const event = events[index];
    if (!event) return;
    const next = `Acknowledged: ${event}`;
    updateEventAt(index, next);
    recordAudit("EventAcknowledged", event, "Event acknowledged");
    if (!offlineMode) {
      void apiRequest<{ event: string; events: string[] }>(`/api/events/${eventKey(event, index)}/acknowledge`, {
        method: "POST",
        body: JSON.stringify({ reason: "Acknowledged from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function pinEvent(index: number) {
    const event = events[index];
    if (!event) return;
    const next = event.startsWith("Pinned:") ? event : `Pinned: ${event}`;
    setEvents((items) => [next, ...items.filter((_, itemIndex) => itemIndex !== index)].slice(0, 20));
    recordAudit("EventPinned", event, "Event pinned");
    if (!offlineMode) {
      void apiRequest<{ event: string; events: string[] }>(`/api/events/${eventKey(event, index)}/pin`, {
        method: "POST",
        body: JSON.stringify({ reason: "Pinned from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateEventSeverity(index: number) {
    const event = events[index];
    if (!event) return;
    const next = `Critical: ${event.replace(/^(Info|Low|Medium|High|Critical): /, "")}`;
    updateEventAt(index, next);
    recordAudit("EventSeverityUpdated", event, "Critical");
    if (!offlineMode) {
      void apiRequest<{ event: string; events: string[] }>(`/api/events/${eventKey(event, index)}/severity`, {
        method: "POST",
        body: JSON.stringify({ severity: "Critical" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function routeEvent(index: number) {
    const event = events[index];
    if (!event) return;
    const next = `Routed to National Audit Desk: ${event}`;
    updateEventAt(index, next);
    recordAudit("EventRouted", event, "National Audit Desk");
    if (!offlineMode) {
      void apiRequest<{ event: string; events: string[] }>(`/api/events/${eventKey(event, index)}/route`, {
        method: "POST",
        body: JSON.stringify({ route: "National Audit Desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function replayEvent(index: number) {
    const event = events[index];
    if (!event) return;
    const next = `Replayed: ${event}`;
    setEvents((items) => [next, ...items].slice(0, 20));
    recordAudit("EventReplayed", event, "Event replayed");
    if (!offlineMode) {
      void apiRequest<{ event: string; events: string[] }>(`/api/events/${eventKey(event, index)}/replay`, {
        method: "POST",
        body: JSON.stringify({ reason: "Replayed from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function muteEvent(index: number) {
    const event = events[index];
    if (!event) return;
    const next = `Muted: ${event}`;
    updateEventAt(index, next);
    recordAudit("EventMuted", event, "Event muted");
    if (!offlineMode) {
      void apiRequest<{ event: string; events: string[] }>(`/api/events/${eventKey(event, index)}/mute`, {
        method: "POST",
        body: JSON.stringify({ reason: "Muted from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function assignEventOwner(index: number) {
    const event = events[index];
    if (!event) return;
    const next = `Owner ${activeStation.email}: ${event}`;
    updateEventAt(index, next);
    recordAudit("EventOwnerAssigned", event, activeStation.email);
    if (!offlineMode) {
      void apiRequest<{ event: string; events: string[] }>(`/api/events/${eventKey(event, index)}/owner`, {
        method: "POST",
        body: JSON.stringify({ owner: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function archiveEvent(index: number) {
    const event = events[index];
    if (!event) return;
    setEvents((items) => items.filter((_, itemIndex) => itemIndex !== index));
    recordAudit("EventArchived", event, "Event archived");
    if (!offlineMode) {
      void apiRequest<{ event: string; events: string[] }>(`/api/events/${eventKey(event, index)}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason: "Archived from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkArchiveEvents(indices: number[]) {
    const targetIndices = indices.length ? indices : events.slice(0, 3).map((_, index) => index);
    const targetEvents = targetIndices.map((index) => events[index]).filter(Boolean);
    setEvents((items) => items.filter((_, index) => !targetIndices.includes(index)));
    recordAudit("EventsBulkArchived", "Event bus", `${targetEvents.length} events archived`);
    if (!offlineMode) {
      void apiRequest<{ count: number; archived: string[]; events: string[] }>("/api/events/bulk/archive", {
        method: "POST",
        body: JSON.stringify({ ids: targetEvents, reason: "Bulk archived from audit desk" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshEventDigest() {
    if (offlineMode) {
      recordAudit("EventDigestRefreshed", "Event bus", "Local event digest refreshed");
      return;
    }
    void apiRequest<EventDigest>("/api/events/digest")
      .then((digest) => {
        setEventDigest(digest);
        recordAudit("EventDigestRefreshed", "Event bus", `${digest.total} events, ${digest.critical} critical`);
      })
      .catch(() => undefined);
  }

  function clearEventLog() {
    setEvents(["EventLogCleared: Event bus"]);
    recordAudit("EventLogCleared", "Event bus", "Event log cleared");
    if (!offlineMode) {
      void apiRequest("/api/events/clear", {
        method: "POST",
        body: JSON.stringify({ reason: "Cleared from audit console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function renewCurrentSession() {
    if (!session?.token || offlineMode) {
      recordAudit("SessionRenewed", activeStation.email, "Local session renewal noted");
      return;
    }
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>("/api/sessions/renew", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setSession((current) => current ? { ...current, expiresAt: result.session.expiresAt } : current);
      setApiStatus((status) => status ? { ...status, sessions: result.sessions } : status);
      recordAudit("SessionRenewed", result.session.email, `${result.session.minutesRemaining} minutes remaining`);
    }).catch(() => undefined);
  }

  function revokeSession(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ revoked: string; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/revoke`, {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setApiStatus((status) => status ? { ...status, sessions: result.sessions } : status);
      recordAudit("SessionRevoked", id, "Session revoked from audit console");
      if (session?.token === id) setSession(null);
    }).catch(() => undefined);
  }

  function revokeStationSessions(email: string) {
    if (offlineMode) return;
    void apiRequest<{ revoked: number; sessions: ApiStatus["sessions"] }>("/api/sessions/station/revoke", {
      method: "POST",
      body: JSON.stringify({ email })
    }).then((result) => {
      setApiStatus((status) => status ? { ...status, sessions: result.sessions } : status);
      recordAudit("StationSessionsRevoked", email, `${result.revoked} sessions revoked`);
    }).catch(() => undefined);
  }

  function flagSession(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/flag`, {
      method: "POST",
      body: JSON.stringify({ reason: "Flagged from audit session monitor" })
    }).then((result) => {
      setApiStatus((status) => status ? { ...status, sessions: result.sessions } : status);
      recordAudit("SessionFlagged", result.session.email, "Flagged from audit session monitor");
    }).catch(() => undefined);
  }

  function updateSessionResult(event: string, result: { session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }) {
    setApiStatus((status) => status ? { ...status, sessions: result.sessions } : status);
    recordAudit(event, result.session.email, result.session.status ?? "Session updated");
    void apiRequest<SessionDigest>("/api/sessions/digest").then(setSessionDigest).catch(() => undefined);
  }

  function extendSession(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/extend`, {
      method: "POST",
      body: JSON.stringify({ minutes: 120 })
    }).then((result) => updateSessionResult("SessionExtended", result)).catch(() => undefined);
  }

  function lockSession(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/lock`, {
      method: "POST",
      body: JSON.stringify({ reason: "Locked from audit session monitor" })
    }).then((result) => updateSessionResult("SessionLocked", result)).catch(() => undefined);
  }

  function unlockSession(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/unlock`, {
      method: "POST",
      body: JSON.stringify({ reason: "Unlocked from audit session monitor" })
    }).then((result) => updateSessionResult("SessionUnlocked", result)).catch(() => undefined);
  }

  function trustSession(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/trust`, {
      method: "POST",
      body: JSON.stringify({ reason: "Trusted from audit session monitor" })
    }).then((result) => updateSessionResult("SessionTrusted", result)).catch(() => undefined);
  }

  function requireSessionMfa(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/mfa`, {
      method: "POST",
      body: JSON.stringify({ reason: "MFA required from audit session monitor" })
    }).then((result) => updateSessionResult("SessionMfaRequired", result)).catch(() => undefined);
  }

  function labelSessionDevice(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/device`, {
      method: "POST",
      body: JSON.stringify({ label: "Managed workstation" })
    }).then((result) => updateSessionResult("SessionDeviceLabeled", result)).catch(() => undefined);
  }

  function noteSession(id: string) {
    if (!id || offlineMode) return;
    void apiRequest<{ session: ApiStatus["sessions"]["stations"][number]; sessions: ApiStatus["sessions"] }>(`/api/sessions/${encodeURIComponent(id)}/note`, {
      method: "POST",
      body: JSON.stringify({ note: "Reviewed from audit session monitor" })
    }).then((result) => updateSessionResult("SessionNoteAdded", result)).catch(() => undefined);
  }

  function bulkRevokeSessions(ids: string[]) {
    if (offlineMode) return;
    void apiRequest<{ revoked: number; sessions: ApiStatus["sessions"] }>("/api/sessions/bulk/revoke", {
      method: "POST",
      body: JSON.stringify({ ids })
    }).then((result) => {
      setApiStatus((status) => status ? { ...status, sessions: result.sessions } : status);
      recordAudit("SessionsBulkRevoked", "Session monitor", `${result.revoked} sessions revoked`);
      void apiRequest<SessionDigest>("/api/sessions/digest").then(setSessionDigest).catch(() => undefined);
    }).catch(() => undefined);
  }

  function archiveGovernanceSnapshot() {
    archiveDocument({
      name: `Governance snapshot ${new Date().toISOString().slice(0, 10)}.json`,
      classification: "Governance snapshot",
      source: "Audit",
      owner: activeStation.email,
      fileType: "JSON",
      status: offlineMode ? "Queued" : "Archived"
    });
    if (!offlineMode) {
      void apiRequest<DocumentRecord>("/api/export/archive", {
        method: "POST",
        body: JSON.stringify({ reason: "Archived from audit console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function refreshCommandBriefing() {
    if (offlineMode) {
      recordAudit("CommandBriefingRefreshed", "Control Center", "Local command briefing refreshed");
      return;
    }
    void apiRequest<CommandBriefing>("/api/command-center/briefing")
      .then((briefing) => {
        setCommandBriefing(briefing);
        recordAudit("CommandBriefingRefreshed", briefing.title, `${briefing.riskScore}% risk score`);
      })
      .catch(() => undefined);
  }

  function archiveCommandBriefing() {
    archiveDocument({
      name: "Executive command briefing.json",
      classification: "Command briefing",
      source: "Control Center",
      owner: activeStation.email,
      fileType: "JSON",
      status: offlineMode ? "Queued" : "Archived"
    });
    if (!offlineMode) {
      void apiRequest<{ document: DocumentRecord; briefing: CommandBriefing }>("/api/command-center/briefing/archive", {
        method: "POST",
        body: JSON.stringify({ title: "Executive command briefing" })
      }).then(({ briefing }) => setCommandBriefing(briefing)).then(refreshFromApi).catch(() => undefined);
    }
  }

  function issueCommandDirective() {
    const message: Message = {
      id: `msg-${Date.now()}`,
      kind: "Directive",
      subject: "Executive command directive",
      from: activeStation.email,
      age: "now",
      status: offlineMode ? "Queued" : "Ready",
      files: "Command briefing"
    };
    setMessages((items) => [message, ...items]);
    recordAudit("CommandDirectiveIssued", message.subject, "Directive routed from control center");
    if (!offlineMode) {
      void apiRequest<Message>("/api/command-center/directive", {
        method: "POST",
        body: JSON.stringify({ subject: message.subject, files: message.files })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function createCommandTask() {
    const task: GovernanceTask = {
      id: `tsk-${Date.now()}`,
      title: "Command center follow-up",
      owner: "Control Center",
      assignee: activeStation.email,
      priority: "High",
      due: "Today",
      status: offlineMode ? "Queued" : "In Progress"
    };
    setTasks((items) => [task, ...items]);
    recordAudit("CommandTaskCreated", task.title, `${task.assignee} assigned`);
    if (!offlineMode) {
      void apiRequest<GovernanceTask>("/api/command-center/task", {
        method: "POST",
        body: JSON.stringify({ title: task.title, owner: task.owner, assignee: task.assignee, priority: task.priority, due: task.due })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function openCommandEscalation() {
    const escalation: Escalation = {
      id: `esc-${Date.now()}`,
      source: "Control Center",
      item: "Command center risk",
      reason: "Executive command briefing requires attention",
      severity: "High",
      status: "Open",
      owner: activeStation.email
    };
    setEscalations((items) => [escalation, ...items]);
    recordAudit("CommandEscalationOpened", escalation.item, escalation.reason);
    if (!offlineMode) {
      void apiRequest<Escalation>("/api/command-center/escalation", {
        method: "POST",
        body: JSON.stringify({ item: escalation.item, reason: escalation.reason, severity: escalation.severity, owner: escalation.owner })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function markDocumentReview(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, status: "In Review" } : item));
    recordAudit("DocumentReviewStarted", document.name, "Document marked for review");
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ reason: "Review started from archive" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function markDocumentArchived(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, status: "Archived" } : item));
    recordAudit("DocumentArchived", document.name, "Document archived from review");
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ reason: "Archived from archive console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function sealDocument(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, status: "Sealed" } : item));
    recordAudit("DocumentSealed", document.name, "Archive record sealed");
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/seal`, {
        method: "POST",
        body: JSON.stringify({ reason: "Sealed from archive console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function placeDocumentHold(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, status: "Legal Hold" } : item));
    recordAudit("DocumentHoldPlaced", document.name, "Legal hold placed");
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/hold`, {
        method: "POST",
        body: JSON.stringify({ reason: "Legal hold from archive console" })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateDocumentRetention(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const retainedUntil = document.retainedUntil === "Permanent" ? "Review in 2031" : "Permanent";
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, retainedUntil } : item));
    recordAudit("DocumentRetentionUpdated", document.name, retainedUntil);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/retention`, {
        method: "POST",
        body: JSON.stringify({ retainedUntil })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function duplicateDocument(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    archiveDocument({
      name: `Copy of ${document.name}`,
      classification: document.classification,
      source: document.source,
      owner: document.owner,
      fileType: document.fileType,
      status: "Archived"
    });
    recordAudit("DocumentDuplicated", document.name, "Evidence packet copied");
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ name: `Copy of ${document.name}`, owner: document.owner })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function verifyDocument(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const verificationNote = "Document integrity verified";
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, verified: true, verificationNote } : item));
    recordAudit("DocumentVerified", document.name, verificationNote);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ note: verificationNote })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function assignDocumentCustody(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, custodian: activeStation.email, custodyAt: new Date().toISOString() } : item));
    recordAudit("DocumentCustodyAssigned", document.name, activeStation.email);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/custody`, {
        method: "POST",
        body: JSON.stringify({ custodian: activeStation.email })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function updateDocumentChain(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const chainHash = `sha256:${btoa(`${document.id}:${document.storageKey}:${document.status}`).replaceAll("=", "").slice(0, 24)}`;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, chainHash } : item));
    recordAudit("DocumentChainUpdated", document.name, chainHash);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/chain`, {
        method: "POST",
        body: JSON.stringify({ chainHash })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function extractDocumentText(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const extractedText = `${document.name} indexed from ${document.source} as ${document.classification}.`;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, extractedText, extractedAt: new Date().toISOString() } : item));
    recordAudit("DocumentTextExtracted", document.name, `${extractedText.length} characters indexed`);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/extract`, {
        method: "POST",
        body: JSON.stringify({ text: extractedText })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkDocumentReport(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const reportId = reports[0]?.id ?? "report-unassigned";
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, linkedReport: reportId } : item));
    recordAudit("DocumentReportLinked", document.name, reportId);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/link-report`, {
        method: "POST",
        body: JSON.stringify({ reportId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function linkDocumentApproval(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const approvalId = approvals[0]?.id ?? "approval-unassigned";
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, linkedApproval: approvalId } : item));
    recordAudit("DocumentApprovalLinked", document.name, approvalId);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/link-approval`, {
        method: "POST",
        body: JSON.stringify({ approvalId })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function watchDocument(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const watcher = activeStation.email;
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, watchers: Array.from(new Set([...(item.watchers ?? []), watcher])) } : item));
    recordAudit("DocumentWatcherAdded", document.name, watcher);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/watch`, {
        method: "POST",
        body: JSON.stringify({ watcher })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function exportDocumentRecord(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const exportReason = "Governance evidence export";
    setDocuments((items) => items.map((item) => item.id === id ? { ...item, exportedAt: new Date().toISOString(), exportReason } : item));
    recordAudit("DocumentExported", document.name, exportReason);
    if (!offlineMode) {
      void apiRequest<DocumentRecord>(`/api/documents/${id}/export`, {
        method: "POST",
        body: JSON.stringify({ reason: exportReason })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  function bulkSealDocuments(ids: string[]) {
    const targetIds = ids.length ? ids : documents.slice(0, 3).map((item) => item.id);
    setDocuments((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, status: "Sealed", chainHash: item.chainHash ?? `sha256:${btoa(`${item.id}:${item.storageKey}:Sealed`).replaceAll("=", "").slice(0, 24)}` } : item));
    recordAudit("DocumentsBulkSealed", "Archive vault", `${targetIds.length} documents sealed`);
    if (!offlineMode) {
      void apiRequest<{ count: number; updated: DocumentRecord[] }>("/api/documents/bulk/seal", {
        method: "POST",
        body: JSON.stringify({ ids: targetIds })
      }).then(refreshFromApi).catch(() => undefined);
    }
  }

  async function uploadDocumentFile(id: string, file: File) {
    const document = documents.find((item) => item.id === id);
    if (!document) return;
    const contentBase64 = await readFileAsDataUrl(file);
    const uploaded = await apiRequest<FileRecord>("/api/files/upload", {
      method: "POST",
      body: JSON.stringify({
        name: file.name,
        contentType: file.type || "application/octet-stream",
        contentBase64,
        source: `Archive:${document.name}`
      })
    });
    const updated = await apiRequest<DocumentRecord>(`/api/documents/${id}/file`, {
      method: "POST",
      body: JSON.stringify({ fileId: uploaded.id })
    });
    setDocuments((items) => items.map((item) => item.id === id ? updated : item));
    recordAudit("FileLinked", document.name, uploaded.hash);
    void refreshFromApi();
  }

  function refreshArchiveManifest() {
    if (offlineMode) {
      recordAudit("ArchiveManifestRefreshed", "Archive", "Local manifest refreshed");
      return;
    }
    void apiRequest<ArchiveManifest>("/api/archive/manifest")
      .then((manifest) => {
        setArchiveManifest(manifest);
        recordAudit("ArchiveManifestRefreshed", "Archive", `${manifest.total} documents indexed`);
      })
      .catch(() => undefined);
  }

  return (
    <main className={effectiveSection === "Admin Board" ? "app-shell admin-shell" : "app-shell"}>
      <aside className="sidebar">
        <button className="brand brand-button" type="button" aria-label="Open workstation home" title="Open workstation home" onClick={() => openSection("Control Center")}>
          <div className="brand-mark">
            <img src={CHURCH_LOGO_SRC} alt="The Lion of the Tribe of Judah church logo" />
          </div>
          <div>
            <strong>{CHURCH_NAME}</strong>
            <span>{PLATFORM_NAME} Administrative OS</span>
          </div>
        </button>

        <nav className="nav-list" aria-label="Primary">
          {navItems.filter((item) => allowedSections.includes(item.label)).map(({ icon: Icon, label }) => (
            <button
              className={label === effectiveSection ? "nav-item active" : "nav-item"}
              key={label}
              aria-label={label}
              title={label}
              onClick={() => openSection(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="station-switcher" aria-label="Station switcher">
          <p>{permissions.canOverride ? "Station Identity" : "Signed-in Station"}</p>
          {visibleStationDirectory.map((station) => {
            const Icon = resolveStationIcon(station);
            return (
              <button
                key={station.email}
                className={station.email === activeStation.email ? "station-option selected" : "station-option"}
                aria-label={station.email}
                title={permissions.canOverride ? `Switch to ${station.title}` : station.title}
                onClick={() => permissions.canOverride && setActiveStation(station)}
              >
                <Icon size={16} />
                <span>{station.email}</span>
              </button>
            );
          })}
        </section>
      </aside>

      <section className="workspace">
        <header className={permissions.canOverride ? "topbar" : "topbar user-topbar"}>
          <div className="station-title">
            <button className="icon-button" aria-label="Open workstation home" title="Open workstation home" onClick={() => openSection("Control Center")}>
              <PanelLeft size={18} />
            </button>
            <div className="station-avatar">
              <StationIcon size={22} />
            </div>
            <div>
              <span className="organization-kicker">{CHURCH_NAME}</span>
              <h1>{effectiveSection === "Control Center" ? activeStation.title : effectiveSection}</h1>
              <p>{activeStation.level} - {activeStation.authority}</p>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input
                aria-label="Search GCOS"
                placeholder="Search records, offices, messages"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            {searchQuery && (
              <div className="search-results" aria-label="Search results">
                {searchResults.length ? searchResults.map((result) => (
                  <button key={`${result.section}-${result.id}`} onClick={() => openSearchResult(result)}>
                    <span>{result.section}</span>
                    <strong>{result.title}</strong>
                    <small>{result.meta}</small>
                  </button>
                )) : (
                  <div className="search-empty">No GCOS records found</div>
                )}
              </div>
            )}
            <button className="account-menu-button" type="button" aria-label="Open account settings" title="Open account settings" onClick={() => openSection("Account Settings")}>
              <Settings size={17} />
              <span>
                Account
                <small>{activeStation.email}</small>
              </span>
            </button>
            <button className="icon-button notification-button" aria-label="Notifications" title="Open notifications" onClick={() => setNotificationsOpen((open) => !open)}>
              <Bell size={18} />
              {notifications.length > 0 && <span>{criticalNotificationCount || notifications.length}</span>}
            </button>
            {notificationsOpen && (
              <div className="notification-panel" aria-label="Notifications panel">
                <div className="notification-head">
                  <strong>Governance Alerts</strong>
                  <small>{notifications.length} active</small>
                </div>
                {notifications.length ? notifications.map((item) => (
                  <button key={`${item.section}-${item.id}`} onClick={() => openNotification(item)}>
                    <span className={`alert-dot ${item.severity.toLowerCase()}`} />
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.section} - {item.detail}</small>
                    </div>
                  </button>
                )) : (
                  <div className="search-empty">No active governance alerts</div>
                )}
              </div>
            )}
            <button className="icon-button" aria-label="Logout" title="Sign out" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {effectiveSection !== "Admin Board" && permissions.canOverride && (
          <>
            <SectionBanner section={effectiveSection} station={activeStation} offlineMode={offlineMode} />
            <Metrics metrics={operatingMetrics} />
          </>
        )}
        {effectiveSection === "Control Center" && (
          permissions.canOverride ? <ControlCenter
            offlineMode={offlineMode}
            networkOnline={networkOnline}
            messages={messages}
            reports={reports}
            approvals={approvals}
            tasks={tasks}
            policies={policies}
            calendarEvents={calendarEvents}
            personnel={personnel}
            escalations={escalations}
            transfers={transfers}
            documents={documents}
            events={events}
            offlineQueue={offlineQueue}
            offlineConflicts={offlineConflicts}
            offlineSyncHistory={offlineSyncHistory}
            installReady={pwa.installed || pwa.canInstall}
            station={activeStation}
            permissions={permissions}
            stationDirectory={stationDirectory}
            apiStatus={apiStatus}
            apiStatusError={apiStatusError}
            commandBriefing={commandBriefing}
            onSync={syncOfflineQueue}
            onRefreshCommandBriefing={refreshCommandBriefing}
            onArchiveCommandBriefing={archiveCommandBriefing}
            onIssueCommandDirective={issueCommandDirective}
            onCreateCommandTask={createCommandTask}
            onOpenCommandEscalation={openCommandEscalation}
          /> : <StationHome
            station={activeStation}
            messages={messages}
            reports={reports}
            tasks={tasks}
            documents={documents}
            offlineMode={offlineMode}
            networkOnline={networkOnline}
            offlineQueue={offlineQueue}
            onOpenSection={openSection}
            onSendMessage={sendChurchMail}
            onCreateReport={createReportDraft}
            onCreateTask={createTask}
          />
        )}
        {effectiveSection === "ChurchMail" && (
          <ChurchMail
            messages={messages}
            events={events}
            station={activeStation}
            offlineMode={offlineMode}
            onAcknowledge={acknowledgeMessage}
            onClassify={classifyMessage}
            onUpdateStatus={updateMessageStatus}
            onCreateReport={createReportFromMessage}
            onRequestApproval={requestApprovalFromMessage}
            onArchiveAttachments={archiveMessageAttachments}
            onSendMessage={sendChurchMail}
            onUpdateRoute={updateMessageRoute}
            onUpdatePriority={updateMessagePriority}
            onEscalateMessage={escalateMessage}
            onApproveMessage={approveMessage}
            onArchiveMessage={archiveMessage}
            onWatchMessage={watchMessage}
            onDuplicateMessage={duplicateMessage}
            onBulkApprove={bulkApproveMessages}
            onRefreshDigest={refreshMessageDigest}
            digest={messageDigest}
          />
        )}
        {effectiveSection === "Reports" && (
          <Reports
            reports={reports}
            station={activeStation}
            onCreateReport={createReportDraft}
            onSubmitReport={submitReport}
            onRequestCorrection={requestReportCorrection}
            onUpdateDue={updateReportDue}
            onUpdateScore={updateReportScore}
            onEscalateReport={triggerEscalation}
            onArchiveEvidence={archiveReportEvidence}
            onUpdateOwner={updateReportOwner}
            onUpdatePath={updateReportPath}
            onMarkEvidence={markReportEvidence}
            onReviewReport={reviewReport}
            onVerifyReport={verifyReport}
            onWatchReport={watchReport}
            onDuplicateReport={duplicateReport}
            onArchiveReport={archiveReportRecord}
            onBuildGovernancePacket={buildReportGovernancePacket}
            onUploadReportEvidence={uploadReportEvidenceFile}
            onUpdateReportDetails={updateReportDetails}
            onBulkSubmit={bulkSubmitReports}
            onBulkCorrection={bulkRequestReportCorrections}
            onRefreshDigest={refreshReportDigest}
            onSendReportMessage={sendChurchMail}
            digest={reportDigest}
          />
        )}
        {effectiveSection === "Approvals" && (
          <Approvals
            approvals={approvals}
            station={activeStation}
            permissions={permissions}
            onCreateApproval={createApprovalRequest}
            onApprove={approveRequest}
            onUpdateRoute={updateApprovalRoute}
            onSign={signApproval}
            onReject={rejectApproval}
            onUpdateLimit={updateApprovalLimit}
            onDelegate={delegateApproval}
            onHold={holdApproval}
            onReleaseHold={releaseApprovalHold}
            onExecute={executeApproval}
            onWatch={watchApproval}
            onDuplicate={duplicateApproval}
            onArchive={archiveApproval}
            onBulkSign={bulkSignApprovals}
            onEscalateApproval={triggerEscalation}
            onBulkApprove={bulkApproveRequests}
            onBulkReject={bulkRejectRequests}
            onRefreshDigest={refreshApprovalDigest}
            digest={approvalDigest}
          />
        )}
        {effectiveSection === "Tasks" && (
          <Tasks
            tasks={tasks}
            station={activeStation}
            offlineMode={offlineMode}
            onCreateTask={createTask}
            onAdvanceTask={advanceTask}
            onUpdateTaskAssignee={updateTaskAssignee}
            onUpdateTaskPriority={updateTaskPriority}
            onUpdateTaskDue={updateTaskDue}
            onUpdateTaskOwner={updateTaskOwner}
            onBlockTask={blockTask}
            onUnblockTask={unblockTask}
            onWatchTask={watchTask}
            onAddDependency={addTaskDependency}
            onRequestApproval={requestTaskApproval}
            onUpdateSla={updateTaskSla}
            onAttachEvidence={attachTaskEvidence}
            onHandoffTask={handoffTask}
            onEscalateOperation={escalateTaskOperation}
            onCommentTask={commentTask}
            onCheckpointTask={addTaskCheckpoint}
            onDuplicateTask={duplicateTask}
            onBulkCompleteTasks={bulkCompleteTasks}
            onBulkEscalateTasks={bulkEscalateTasks}
            onScheduleTask={scheduleTask}
            onDispatchTask={dispatchTask}
            onLogTime={logTaskTime}
            onQaReview={qaReviewTask}
            onAcceptRisk={acceptTaskRisk}
            onSaveTemplate={saveTaskTemplate}
            onLinkReport={linkTaskReport}
            onLinkApproval={linkTaskApproval}
            onArchiveTask={archiveTask}
            onBulkScheduleTasks={bulkScheduleTasks}
            onRefreshDigest={refreshTaskDigest}
            digest={taskDigest}
            onEscalateTask={triggerEscalation}
          />
        )}
        {effectiveSection === "Policies" && (
          <Policies
            policies={policies}
            station={activeStation}
            permissions={permissions}
            offlineMode={offlineMode}
            onCreatePolicy={createPolicy}
            onAcknowledgePolicy={acknowledgePolicy}
            onUpdatePolicyStatus={updatePolicyStatus}
            onRetirePolicy={retirePolicy}
            onUpdatePolicyOwner={updatePolicyOwner}
            onUpdatePolicyCategory={updatePolicyCategory}
            onUpdatePolicySummary={updatePolicySummary}
            onBumpPolicyVersion={bumpPolicyVersion}
            onSchedulePolicyReview={schedulePolicyReview}
            onWatchPolicy={watchPolicy}
            onDuplicatePolicy={duplicatePolicy}
            onBulkActivatePolicies={bulkActivatePolicies}
            onCheckCompliance={checkPolicyCompliance}
            onBindEvidence={bindPolicyEvidence}
            onDistributePolicy={distributePolicy}
            onGrantException={grantPolicyException}
            onAssignTraining={assignPolicyTraining}
            onHoldPolicy={holdPolicy}
            onLinkTask={linkPolicyTask}
            onLinkApproval={linkPolicyApproval}
            onArchivePolicy={archivePolicy}
            onBulkReviewPolicies={bulkReviewPolicies}
            onRefreshDigest={refreshPolicyDigest}
            digest={policyDigest}
          />
        )}
        {effectiveSection === "Calendar" && (
          <GovernanceCalendar
            calendarEvents={calendarEvents}
            station={activeStation}
            offlineMode={offlineMode}
            onCreateCalendarEvent={createCalendarEvent}
            onCompleteCalendarEvent={completeCalendarEvent}
            onUpdateCalendarEventDate={updateCalendarEventDate}
            onUpdateCalendarEventPriority={updateCalendarEventPriority}
            onMarkCalendarEventAtRisk={markCalendarEventAtRisk}
            onUpdateCalendarEventOwner={updateCalendarEventOwner}
            onUpdateCalendarEventCategory={updateCalendarEventCategory}
            onRescheduleCalendarEvent={rescheduleCalendarEvent}
            onWatchCalendarEvent={watchCalendarEvent}
            onDuplicateCalendarEvent={duplicateCalendarEvent}
            onBulkCompleteCalendarEvents={bulkCompleteCalendarEvents}
            onCheckInEvent={checkInCalendarEvent}
            onUpdateVenue={updateCalendarVenue}
            onAttachAgenda={attachCalendarAgenda}
            onLogAttendance={logCalendarAttendance}
            onSendReminder={sendCalendarReminder}
            onMarkReadiness={markCalendarReadiness}
            onLinkTask={linkCalendarTask}
            onLinkReport={linkCalendarReport}
            onArchiveEvent={archiveCalendarEvent}
            onBulkRescheduleEvents={bulkRescheduleCalendarEvents}
            onRefreshDigest={refreshCalendarDigest}
            digest={calendarDigest}
            onEscalateCalendarEvent={triggerEscalation}
          />
        )}
        {effectiveSection === "Personnel" && (
          <PersonnelDirectory
            personnel={personnel}
            station={activeStation}
            permissions={permissions}
            offlineMode={offlineMode}
            onCreatePerson={createPerson}
            onUpdatePersonStatus={updatePersonStatus}
            onUpdatePersonAssignment={updatePersonAssignment}
            onUpdatePersonRole={updatePersonRole}
            onDeactivatePerson={deactivatePerson}
            onCreateTransfer={createTransferRequest}
            onOnboardPerson={onboardPerson}
            onResetCredentials={resetPersonCredentials}
            onPlaceLeave={placePersonOnLeave}
            onUpdateClearance={updatePersonClearance}
            onVerifyCredentials={verifyPersonCredentials}
            onAssignTraining={assignPersonTraining}
            onGrantAccess={grantPersonStationAccess}
            onFlagIncident={flagPersonIncident}
            onLinkTask={linkPersonTask}
            onReviewPerson={reviewPerson}
            onArchivePerson={archivePerson}
            onBulkCredentialReview={bulkCredentialReviewPersonnel}
            onRefreshDigest={refreshPersonnelDigest}
            digest={personnelDigest}
          />
        )}
        {effectiveSection === "Escalations" && (
          <Escalations
            escalations={escalations}
            station={activeStation}
            permissions={permissions}
            events={events}
            onCreateEscalation={triggerEscalation}
            onUpdateOwner={updateEscalationOwner}
            onUpdateSeverity={updateEscalationSeverity}
            onEscalateUpward={escalateUpward}
            onResolveEscalation={resolveEscalation}
            onTriageEscalation={triageEscalation}
            onUpdateSla={updateEscalationSla}
            onWatchEscalation={watchEscalation}
            onMergeEscalation={mergeEscalation}
            onAttachEvidence={attachEscalationEvidence}
            onCommentEscalation={commentEscalation}
            onNoteResolution={noteEscalationResolution}
            onUpdateDue={updateEscalationDue}
            onLinkTask={linkEscalationTask}
            onLinkReport={linkEscalationReport}
            onLinkApproval={linkEscalationApproval}
            onScoreImpact={scoreEscalationImpact}
            onArchiveEscalation={archiveEscalation}
            onBulkResolve={bulkResolveEscalations}
            onRefreshDigest={refreshEscalationDigest}
            digest={escalationDigest}
          />
        )}
        {effectiveSection === "AI Desk" && (
          <AiDesk
            drafts={aiDrafts}
            reports={reports}
            approvals={approvals}
            tasks={tasks}
            policies={policies}
            calendarEvents={calendarEvents}
            personnel={personnel}
            escalations={escalations}
            messages={messages}
            onGenerateDraft={generateAiDraft}
            onRefreshDraft={refreshAiDraft}
            onArchiveDraft={archiveAiDraft}
            onUpdateStatus={updateAiDraftStatus}
            onPublishDraft={publishAiDraft}
            onBindSources={bindAiDraftSources}
            onScoreDraft={scoreAiDraft}
            onSealDraft={sealAiDraft}
            onWatchDraft={watchAiDraft}
            onDuplicateDraft={duplicateAiDraft}
            onBulkRefresh={bulkRefreshAiDrafts}
            onRefreshDigest={refreshAiDraftDigest}
            digest={aiDraftDigest}
          />
        )}
        {effectiveSection === "Live Comms" && (
          <LiveComms
            station={activeStation}
            offices={offices}
            reports={reports}
            approvals={approvals}
            tasks={tasks}
            messages={messages}
            liveSessions={liveSessions}
            onCreateLiveSession={createLiveSession}
            onUpdateLiveSessionStatus={updateLiveSessionStatus}
            onAttachLiveSessionFile={attachLiveSessionFile}
            onAddLiveSessionNote={addLiveSessionNote}
            onInviteLiveSessionParticipant={inviteLiveSessionParticipant}
            onCheckInLiveSessionParticipant={checkInLiveSessionParticipant}
            onAddLiveSessionChat={addLiveSessionChat}
            onRecordLiveSessionDecision={recordLiveSessionDecision}
            onSendLiveSessionSummary={sendLiveSessionSummary}
            onCreateLiveSessionFollowUpTask={createLiveSessionFollowUpTask}
            onScheduleLiveSession={scheduleLiveSession}
            onBuildLiveSessionPacket={buildLiveSessionPacket}
            onArchiveLiveSession={archiveLiveSession}
            onOpenSection={openSection}
          />
        )}
        {effectiveSection === "Hierarchy" && (
          <Hierarchy
            stationDirectory={stationDirectory}
            offices={offices}
            digest={hierarchyDigest}
            onUpdateStationLevel={updateStationLevel}
            onUpdateStationAuthority={updateStationAuthority}
            onVerifyStation={verifyStation}
            onWatchStation={watchStation}
            onSuspendStation={suspendStation}
            onActivateStation={activateStation}
            onMirrorStation={mirrorStation}
            onBulkVerifyStations={bulkVerifyStations}
            onRefreshDigest={refreshHierarchyDigest}
          />
        )}
        {effectiveSection === "Offices" && <Offices offices={offices} stationDirectory={stationDirectory} permissions={permissions} onCreateOffice={createOffice} onUpdateOfficeSupervisor={updateOfficeSupervisor} onUpdateOfficeStatus={updateOfficeStatus} onActivateOffice={activateOffice} onSuspendOffice={suspendOffice} onRotatePassword={rotateOfficePassword} onActivateStation={activateOfficeStation} onUpdateDepartment={updateOfficeDepartment} onUpdateLevel={updateOfficeLevel} onVerifyEmail={verifyOfficeEmail} onWatchOffice={watchOffice} onNoteOffice={noteOffice} onUpdateCapacity={updateOfficeCapacity} onReviewCompliance={reviewOfficeCompliance} onArchiveOffice={archiveOffice} onBulkActivate={bulkActivateOffices} onRefreshDigest={refreshOfficeDigest} digest={officeDigest} />}
        {effectiveSection === "Transfers" && (
          <Transfers
            transfers={transfers}
            permissions={permissions}
            offlineQueue={offlineQueue}
            onSync={syncOfflineQueue}
            onCreateTransfer={createTransferRequest}
            onAcknowledgeTransfer={acknowledgeTransfer}
            onUpdateTransferRisk={updateTransferRisk}
            onExecuteTransfer={executeTransfer}
            onPrepareTransfer={prepareTransfer}
            onRevokeAccess={revokeTransferAccess}
            onActivateStation={activateTransferStation}
            onVerifyTransfer={verifyTransfer}
            onRecordLetter={recordTransferLetter}
            onScheduleTransfer={scheduleTransfer}
            onNoteTransfer={noteTransfer}
            onWatchTransfer={watchTransfer}
            onLinkPersonnel={linkTransferPersonnel}
            onLinkTask={linkTransferTask}
            onLinkReport={linkTransferReport}
            onArchiveTransfer={archiveTransfer}
            onBulkVerify={bulkVerifyTransfers}
            onRefreshDigest={refreshTransferDigest}
            digest={transferDigest}
          />
        )}
        {effectiveSection === "Archive" && <Archive documents={documents} station={activeStation} offlineMode={offlineMode} manifest={archiveManifest} onArchiveDocument={archiveDocument} onUpdateClassification={updateDocumentClassification} onUpdateOwner={updateDocumentOwner} onMarkReview={markDocumentReview} onMarkArchived={markDocumentArchived} onSealDocument={sealDocument} onPlaceHold={placeDocumentHold} onUpdateRetention={updateDocumentRetention} onDuplicateDocument={duplicateDocument} onVerifyDocument={verifyDocument} onAssignCustody={assignDocumentCustody} onUpdateChain={updateDocumentChain} onExtractText={extractDocumentText} onLinkReport={linkDocumentReport} onLinkApproval={linkDocumentApproval} onWatchDocument={watchDocument} onExportDocument={exportDocumentRecord} onUploadFile={uploadDocumentFile} onBulkSeal={bulkSealDocuments} onRefreshManifest={refreshArchiveManifest} />}
        {effectiveSection === "Account Settings" && (
          <AccountSettings
            station={activeStation}
            offices={offices}
            stationDirectory={stationDirectory}
            permissions={permissions}
            offlineMode={offlineMode}
            apiStatus={apiStatus}
            apiStatusError={apiStatusError}
            pwa={pwa}
            session={session}
            onToggleOffline={() => setOfflineMode(!offlineMode)}
            onRefreshApi={refreshFromApi}
            onResetDemoData={resetWorkstationData}
            onChangePassword={changeOwnPassword}
            onCreateAccount={createManagedStationAccount}
            onResetAccess={resetOfficeAccess}
            onSuspendAccount={suspendStation}
            onActivateAccount={activateStation}
            onDeleteAccount={deleteStationAccount}
            onOpenAudit={() => openSection("Audit")}
          />
        )}
        {effectiveSection === "Admin Board" && (
          <AdminBoard
            stationDirectory={stationDirectory}
            offices={offices}
            apiStatus={apiStatus}
            session={session}
            permissions={permissions}
            auditRows={auditRows}
            events={events}
            reports={reports}
            approvals={approvals}
            tasks={tasks}
            escalations={escalations}
            transfers={transfers}
            documents={documents}
            auditDigest={auditDigest}
            readinessDigest={readinessDigest}
            sessionDigest={sessionDigest}
            onRefreshApi={refreshFromApi}
            onOpenSection={openSection}
            onCreateOffice={createOffice}
            onVerifyStation={verifyStation}
            onSuspendStation={suspendStation}
            onActivateStation={activateStation}
            onBulkVerifyStations={bulkVerifyStations}
            onRenewSession={renewCurrentSession}
            onRevokeSession={revokeSession}
            onRevokeStationSessions={revokeStationSessions}
            onTrustSession={trustSession}
            onRequireSessionMfa={requireSessionMfa}
            onCreateAuditNote={createAuditNote}
            onArchiveGovernanceSnapshot={archiveGovernanceSnapshot}
            onRefreshAuditDigest={refreshAuditDigest}
            onApproveOfficeAccount={approveOfficeAccount}
            onRejectOfficeAccount={rejectOfficeAccount}
            onResetOfficeAccess={resetOfficeAccess}
          />
        )}
        {effectiveSection === "Audit" && (
          <Audit
            auditRows={auditRows}
            events={events}
            apiStatus={apiStatus}
            session={session}
            onCreateAuditNote={createAuditNote}
            onFlagAuditRow={flagAuditRow}
            onRecordManualEvent={recordManualEvent}
            onClearEventLog={clearEventLog}
            onAcknowledgeEvent={acknowledgeEvent}
            onPinEvent={pinEvent}
            onUpdateEventSeverity={updateEventSeverity}
            onRouteEvent={routeEvent}
            onReplayEvent={replayEvent}
            onMuteEvent={muteEvent}
            onAssignEventOwner={assignEventOwner}
            onArchiveEvent={archiveEvent}
            onBulkArchiveEvents={bulkArchiveEvents}
            onRefreshEventDigest={refreshEventDigest}
            onArchiveGovernanceSnapshot={archiveGovernanceSnapshot}
            onRenewSession={renewCurrentSession}
            onRevokeSession={revokeSession}
            onRevokeStationSessions={revokeStationSessions}
            onFlagSession={flagSession}
            onExtendSession={extendSession}
            onLockSession={lockSession}
            onUnlockSession={unlockSession}
            onTrustSession={trustSession}
            onRequireSessionMfa={requireSessionMfa}
            onLabelSessionDevice={labelSessionDevice}
            onNoteSession={noteSession}
            onBulkRevokeSessions={bulkRevokeSessions}
            onSealAuditRow={sealAuditRow}
            onVerifyAuditRow={verifyAuditRow}
            onBulkFlagAuditRows={bulkFlagAuditRows}
            onUpdateAuditSeverity={updateAuditSeverity}
            onUpdateAuditCategory={updateAuditCategory}
            onAssignAuditReviewer={assignAuditReviewer}
            onAppendAuditComment={appendAuditComment}
            onOpenAuditInvestigation={openAuditInvestigation}
            onCloseAuditInvestigation={closeAuditInvestigation}
            onPlaceAuditHold={placeAuditHold}
            onReleaseAuditHold={releaseAuditHold}
            onBulkSealAuditRows={bulkSealAuditRows}
            onBulkVerifyAuditRows={bulkVerifyAuditRows}
            onRefreshAuditDigest={refreshAuditDigest}
            digest={auditDigest}
            eventDigest={eventDigest}
            readinessDigest={readinessDigest}
            sessionDigest={sessionDigest}
            onSetReadinessDigest={setReadinessDigest}
          />
        )}
      </section>
    </main>
  );
}

function LoginScreen({
  stationDirectory,
  pwa,
  onLogin,
  onCreateAccount
}: {
  stationDirectory: StationCard[];
  pwa: ReturnType<typeof usePwaInstallPrompt>;
  onLogin: (email: string, password: string) => boolean;
  onCreateAccount: (account: CreateAccountInput) => AuthActionResult;
}) {
  const isAdminPortal = adminRouteRequested();
  const [authMode, setAuthMode] = React.useState<"create" | "signin">("signin");
  const [email, setEmail] = React.useState("np@rmvi.org");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [officeName, setOfficeName] = React.useState("");
  const [newAccountEmail, setNewAccountEmail] = React.useState("");
  const [stationLevel, setStationLevel] = React.useState<StationLevel>("Local Branch");
  const [department, setDepartment] = React.useState("Church Administration");
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [downloadNotice, setDownloadNotice] = React.useState("");
  const selectedStation = stationDirectory.find((station) => station.email === email) ?? {
    email,
    title: "Manual Station Sign-In",
    level: "Station",
    authority: "Credentials will determine workstation access",
    icon: KeyRound
  };
  const StationIcon = resolveStationIcon(selectedStation);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (authMode === "signin") {
      const ok = onLogin(email, password);
      setError(ok ? "" : "Station credentials were not accepted.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords must match before the workstation can be created.");
      return;
    }
    const result = onCreateAccount({
      fullName,
      officeName,
      email: newAccountEmail,
      password,
      level: stationLevel,
      department
    });
    setError(result.ok ? "" : result.message ?? "The account could not be created.");
    setNotice(result.ok ? result.message ?? "Account request submitted." : "");
  }

  function switchMode(nextMode: "create" | "signin") {
    setAuthMode(nextMode);
    setError("");
    setNotice("");
  }

  function openDemoAccount() {
    const demoSuffix = Date.now().toString().slice(-5);
    const result = onCreateAccount({
      fullName: "Demo Branch Administrator",
      officeName: "Liberia Demo Mission Station",
      email: `demo_branch_${demoSuffix}@rmvi.org`,
      password: "demo-branch-2026",
      level: "Local Branch",
      department: "Kingdom Harvesters - Evangelism",
      autoApprove: true
    });
    setError(result.ok ? "" : result.message ?? "The demo account could not be opened.");
  }

  async function installWindowsApp() {
    if (pwa.installed) {
      setDownloadNotice("RMVI GCOS is already installed on this device. Open it from the app icon, Start menu, dock, or home screen.");
      return;
    }
    if (pwa.canInstall) {
      await pwa.install();
      setDownloadNotice("GCOS install prompt opened. After installation, launch RMVI GCOS from the Windows Start menu or desktop.");
      return;
    }
    setDownloadNotice("For Windows, open rmvi.org in Chrome or Microsoft Edge, then choose the browser Install app option. The install prompt appears after the live HTTPS site is published.");
  }

  function showIosInstallHelp() {
    setDownloadNotice("On iPhone or iPad, open rmvi.org in Safari, tap Share, then choose Add to Home Screen to install RMVI GCOS.");
  }

  function continueInBrowser() {
    setDownloadNotice("You can use RMVI GCOS directly in the browser now. After the first load, the installed web app keeps the shell available for offline work.");
    window.location.hash = "signin";
  }

  function downloadInstallGuide() {
    downloadTextFile(
      "RMVI-GCOS-install-guide.txt",
      [
        "Remedy Movement International GCOS Install Guide",
        "",
        "Windows",
        "1. Open https://rmvi.org in Chrome or Microsoft Edge.",
        "2. Select Download or Install RMVI GCOS.",
        "3. If the browser shows an install prompt, approve it.",
        "4. Open RMVI GCOS from the Windows Start menu.",
        "",
        "iPhone or iPad",
        "1. Open https://rmvi.org in Safari.",
        "2. Tap Share.",
        "3. Tap Add to Home Screen.",
        "4. Open RMVI GCOS from the new home screen icon.",
        "",
        "Offline Use",
        "After the first successful load, the installed web app keeps the application shell available offline. Users can draft reports, prepare ChurchMail, and queue work until the internet returns."
      ].join("\n"),
      "text/plain;charset=utf-8"
    );
    setDownloadNotice("The RMVI GCOS install guide has been downloaded. Use it to help Windows and iPhone/iPad users install the app from rmvi.org.");
  }

  return (
    <main className="login-shell public-software-gateway">
      <header className="public-gateway-header" aria-label="Remedy Movement International public gateway header">
        <div className="brand login-brand">
          <div className="brand-mark">
            <img src={CHURCH_LOGO_SRC} alt="The Lion of the Tribe of Judah church logo" />
          </div>
          <div>
            <strong>{CHURCH_NAME}</strong>
            <span>{PLATFORM_NAME} - {PLATFORM_FULL_NAME}</span>
          </div>
        </div>
        <div className="gateway-status-pill">
          <Globe2 size={15} />
          Official web sign-in
        </div>
        <nav className="public-gateway-nav" aria-label="Public page navigation">
          <a href="#download">Download</a>
          <a href="#signin">Sign in</a>
          <a href="/admin">Admin</a>
        </nav>
      </header>

      <section className="login-panel">
        <div className="login-intro software-download-hero" id="download">
          <div className="download-hero-copy">
            <div className="login-emblem">
              <img src={CHURCH_LOGO_SRC} alt="The Lion of the Tribe of Judah church logo" />
            </div>
            <div className="download-kicker">
              <span>Official {CHURCH_NAME} software portal</span>
              <strong>{pwa.installed ? "Installed on this device" : pwa.canInstall ? "Install ready" : "Web app ready"}</strong>
            </div>
            <div>
              <h1>GCOS for secure church operations.</h1>
              <p>{CHURCH_NAME} users can install the workstation app, sign in through the secure web portal, send ChurchMail, prepare reports, and keep work moving when internet service is limited.</p>
            </div>
            <div className="download-hero-actions">
              <button type="button" className="primary-download-action" onClick={installWindowsApp}>
                <Download size={18} />
                Install app
              </button>
              <button type="button" onClick={continueInBrowser}>
                <Globe2 size={18} />
                Use in browser
              </button>
              <button type="button" onClick={downloadInstallGuide}>
                <FileText size={18} />
                Install guide
              </button>
            </div>
            {downloadNotice && <div className="download-notice">{downloadNotice}</div>}
            <div className="login-trust-row" aria-label="Access protections">
              <span><ShieldCheck size={15} /> Protected sign-in</span>
              <span><GitBranch size={15} /> Office routed</span>
              <span><CloudOff size={15} /> Offline capable</span>
            </div>
          </div>

          <div className="download-platform-panel" aria-label="Download and install options">
            <div className="download-panel-header">
              <span>Choose your platform</span>
              <strong>RMVI GCOS</strong>
            </div>
            <button type="button" className="download-card primary" onClick={installWindowsApp}>
              <Download size={22} />
              <span>Windows</span>
              <strong>Install desktop-style app</strong>
              <small>Use Chrome or Microsoft Edge. GCOS opens from the Start menu after install.</small>
              <b>{pwa.canInstall ? "Install prompt available" : "Uses live rmvi.org install prompt"}</b>
            </button>
            <button type="button" className="download-card" onClick={showIosInstallHelp}>
              <Smartphone size={22} />
              <span>iPhone / iPad</span>
              <strong>Add to Home Screen</strong>
              <small>Open rmvi.org in Safari, tap Share, then add GCOS to the home screen.</small>
              <b>Safari install path</b>
            </button>
            <button type="button" className="download-card" onClick={continueInBrowser}>
              <Globe2 size={22} />
              <span>Web</span>
              <strong>Use in browser</strong>
              <small>Sign in from any modern browser without installing anything first.</small>
              <b>Fastest access</b>
            </button>
          </div>

        </div>

        <div className="login-card" id="signin" aria-label="Station sign-in form">
          <div className="auth-mode-toggle" role="tablist" aria-label="Account access mode">
            {!isAdminPortal && (
              <button type="button" className={authMode === "create" ? "active" : ""} onClick={() => switchMode("create")}>
                <Plus size={15} />
                Create account
              </button>
            )}
            <button type="button" className={authMode === "signin" ? "active" : ""} onClick={() => switchMode("signin")}>
              <LockKeyhole size={15} />
              Sign in
            </button>
          </div>

          <div className="login-heading">
            <div className="station-avatar">
              {authMode === "create" ? <Plus size={24} /> : <StationIcon size={24} />}
            </div>
            <div>
              <span>{authMode === "create" ? "New workstation setup" : "Station access"}</span>
              <h2>{authMode === "create" ? "Request a church office account" : "Sign in to your workstation"}</h2>
              <p>{authMode === "create" ? "Create an RMVI office account for administrator approval." : `${selectedStation.level} - ${selectedStation.authority}`}</p>
            </div>
          </div>

          <form className="login-form" onSubmit={submit}>
            {authMode === "create" ? (
              <>
                <div className="create-account-grid">
                  <label>
                    <span>Your name</span>
                    <input
                      aria-label="Your name"
                      value={fullName}
                      onChange={(event) => {
                        setFullName(event.target.value);
                        setError("");
                      }}
                      placeholder="Pastor, secretary, or station admin"
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    <span>Church office / branch</span>
                    <input
                      aria-label="Church office or branch"
                      value={officeName}
                      onChange={(event) => {
                        setOfficeName(event.target.value);
                        setError("");
                      }}
                      placeholder="Buchanan Local Branch"
                    />
                  </label>
                  <label>
                    <span>Official email</span>
                    <input
                      aria-label="New organizational email"
                      type="email"
                      value={newAccountEmail}
                      onChange={(event) => {
                        setNewAccountEmail(event.target.value.toLowerCase());
                        setError("");
                      }}
                      placeholder="branch_name@rmvi.org"
                      autoComplete="username"
                    />
                  </label>
                  <label>
                    <span>Station level</span>
                    <select
                      aria-label="Station level"
                      value={stationLevel}
                      onChange={(event) => setStationLevel(event.target.value as StationLevel)}
                    >
                      <option>Local Branch</option>
                      <option>Area HQ</option>
                      <option>District HQ</option>
                      <option>County/State HQ</option>
                      <option>National HQ</option>
                    </select>
                  </label>
                </div>
                <label>
                  <span>Department or role</span>
                  <select
                    aria-label="Department or role"
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                  >
                    {missionStationRoleOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <div className="create-account-grid">
                  <label>
                    <span>Password</span>
                    <input
                      aria-label="Create password"
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                  </label>
                  <label>
                    <span>Confirm password</span>
                    <input
                      aria-label="Confirm password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <label>
                  <span>Organizational email</span>
                  <input
                    aria-label="Organizational email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value.toLowerCase());
                      setError("");
                    }}
                    placeholder="np@rmvi.org"
                    autoComplete="username"
                  />
                </label>

                <label>
                  <span>Password</span>
                  <input
                    aria-label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter station password"
                    autoComplete="current-password"
                  />
                </label>
              </>
            )}

            {error && <div className="login-error">{error}</div>}
            {notice && <div className="login-notice">{notice}</div>}

            <button type="submit">
              {authMode === "create" ? <Plus size={16} /> : <LockKeyhole size={16} />}
              {authMode === "create" ? "Request account approval" : "Sign in to workstation"}
            </button>
            {isLocalPreview && authMode === "create" && (
              <button className="secondary-auth-action" type="button" onClick={openDemoAccount}>
                <LayoutDashboard size={16} />
                Open demo branch account
              </button>
            )}
          </form>

          <div className="login-card-footer">
            <span><Server size={14} /> {CHURCH_NAME} {PLATFORM_NAME}</span>
            <span><BadgeCheck size={14} /> Authorized offices only</span>
          </div>

          <div className="station-flow-note">
            <span><ShieldCheck size={14} /> Station-based access</span>
            <p>New offices request approval first. Approved users sign in with their assigned @rmvi.org station email, then GCOS opens the right workstation, department tools, permissions, reporting route, inbox, archive, and audit trail.</p>
          </div>
        </div>

        <div className="login-support">
          <ShieldCheck size={16} />
          <span>{isAdminPortal ? "Admin users enter their assigned administrator email and password manually." : "Create a new RMVI office account or sign in with the email and password issued to your station."}</span>
        </div>
      </section>

      <section className="gateway-flow-steps" aria-label="GCOS station access flow">
        {[
          { icon: Plus, label: "Request account", text: "A church office or department submits its official @rmvi.org station account." },
          { icon: ShieldCheck, label: "Admin approval", text: "Administrators approve the account, verify the office, and assign permissions." },
          { icon: LockKeyhole, label: "Station sign-in", text: "Users sign in manually with their assigned station email and password." },
          { icon: LayoutDashboard, label: "Workstation opens", text: "GCOS loads the correct dashboard, inbox, reports, approvals, tasks, and archive." },
          { icon: FileCheck2, label: "Submit upward", text: "Reports, ChurchMail, evidence, corrections, and approvals route through hierarchy." }
        ].map((step, index) => {
          const StepIcon = step.icon;
          return (
            <article key={step.label}>
              <div>
                <span>{index + 1}</span>
                <StepIcon size={18} />
              </div>
              <strong>{step.label}</strong>
              <p>{step.text}</p>
            </article>
          );
        })}
      </section>

      <footer className="public-download-footer" aria-label="Download footer">
        <div>
          <strong>{CHURCH_NAME} {PLATFORM_NAME}</strong>
          <span>Install the software, sign in through the browser, or add it to a mobile home screen for church administration work.</span>
        </div>
        <div>
          <button type="button" onClick={installWindowsApp}><Download size={14} /> Windows</button>
          <button type="button" onClick={showIosInstallHelp}><Smartphone size={14} /> iPhone / iPad</button>
          <button type="button" onClick={continueInBrowser}><Globe2 size={14} /> Web</button>
        </div>
      </footer>
    </main>
  );
}

function Metrics({
  metrics
}: {
  metrics: {
    commands: number;
    activeReports: number;
    sla: number;
    auditEvents: number;
    commandTrend: string;
    reportTrend: string;
    slaTrend: string;
    auditTrend: string;
  };
}) {
  return (
    <section className="metric-grid" aria-label="Governance metrics">
      <Metric icon={ArrowDownToLine} label="Commands Routed" value={String(metrics.commands)} trend={metrics.commandTrend} />
      <Metric icon={ArrowUpFromLine} label="Active Reports" value={String(metrics.activeReports)} trend={metrics.reportTrend} />
      <Metric icon={TimerReset} label="Workflow SLA" value={`${metrics.sla}%`} trend={metrics.slaTrend} />
      <Metric icon={LockKeyhole} label="Audit Events" value={String(metrics.auditEvents)} trend={metrics.auditTrend} />
    </section>
  );
}

function SectionBanner({ section, station, offlineMode }: { section: Section; station: StationCard; offlineMode: boolean }) {
  const profile = sectionProfiles[section];
  const Icon = profile.icon;
  return (
    <section className="section-banner" aria-label={`${section} overview`}>
      <div className="section-banner-main">
        <div className="section-banner-icon">
          <Icon size={24} />
        </div>
        <div>
          <span>{profile.eyebrow}</span>
          <h2>{profile.title}</h2>
          <p>{profile.description}</p>
        </div>
      </div>
      <div className="section-banner-status">
        <div>
          <span>Station</span>
          <strong>{station.level}</strong>
        </div>
        <div>
          <span>Mode</span>
          <strong>{offlineMode ? "Offline queue" : "Live sync"}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{profile.signal}</strong>
        </div>
      </div>
    </section>
  );
}

function CommandDeck({
  apiStatus,
  apiStatusError,
  station,
  permissions,
  stationDirectory,
  messages,
  reports,
  approvals,
  tasks,
  policies,
  calendarEvents,
  personnel,
  escalations,
  transfers,
  documents,
  offlineQueue
}: {
  apiStatus: ApiStatus | null;
  apiStatusError: string;
  station: StationCard;
  permissions: Permissions;
  stationDirectory: StationCard[];
  messages: Message[];
  reports: Report[];
  approvals: Approval[];
  tasks: GovernanceTask[];
  policies: Policy[];
  calendarEvents: CalendarEvent[];
  personnel: PersonRecord[];
  escalations: Escalation[];
  transfers: Transfer[];
  documents: DocumentRecord[];
  offlineQueue: OfflineAction[];
}) {
  const openEscalations = escalations.filter((item) => item.status !== "Resolved");
  const pendingApprovals = approvals.filter((item) => item.state !== "Approved");
  const activeReports = reports.filter((item) => item.state !== "Approved");
  const activeTasks = tasks.filter((item) => item.status !== "Complete");
  const activePolicies = policies.filter((item) => item.status === "Active").length;
  const upcomingEvents = calendarEvents.filter((item) => item.status !== "Complete");
  const activePersonnel = personnel.filter((item) => item.status !== "Inactive").length;
  const readyTransfers = transfers.filter((item) => item.step === "New station login ready").length;
  const archivedDocuments = documents.filter((item) => item.status === "Archived").length;
  const authorityFlags = [
    permissions.canCreateOffices && "Office admin",
    permissions.canApprove && "Approver",
    permissions.canExecuteTransfers && "Transfers",
    permissions.canOverride && "Override"
  ].filter(Boolean).join(", ") || "Reporter";
  const workflowTotal = reports.length + approvals.length + tasks.length + policies.length + calendarEvents.length + personnel.length + escalations.length + transfers.length;
  const workflowRisk = workflowTotal
    ? Math.min(100, Math.round(((openEscalations.length * 18) + (pendingApprovals.length * 8) + (activeReports.length * 7) + (activeTasks.length * 6) + (offlineQueue.length * 10)) / workflowTotal))
    : 0;
  const slaForecast = Math.max(0, 100 - workflowRisk);
  const reportCoverage = reports.length ? Math.round((reports.filter((item) => item.state === "Approved").length / reports.length) * 100) : 100;
  const transferReadiness = transfers.length ? Math.round((readyTransfers / transfers.length) * 100) : 100;
  const archiveIntegrity = documents.length ? Math.round((archivedDocuments / documents.length) * 100) : 100;
  const backendReadiness = [
    Boolean(apiStatus && !apiStatusError),
    Boolean(apiStatus?.serveWeb),
    Boolean(apiStatus?.persistence),
    apiStatus?.limits.devResetEnabled === false || import.meta.env.DEV,
    apiStatus ? apiStatus.counts.audit > 0 : false
  ].filter(Boolean).length;

  const cards = [
    {
      icon: Server,
      label: "Platform Status",
      value: apiStatusError || apiStatus?.status.toUpperCase() || "LOCAL",
      detail: apiStatus ? `${formatUptime(apiStatus.uptimeSeconds)} uptime` : "Waiting for API heartbeat",
      tone: apiStatusError ? "risk" : "ok"
    },
    {
      icon: LockKeyhole,
      label: "Station Authority",
      value: String(station.level),
      detail: authorityFlags,
      tone: permissions.canOverride ? "ok" : "neutral"
    },
    {
      icon: AlertTriangle,
      label: "Workflow Risk",
      value: `${workflowRisk}%`,
      detail: `${openEscalations.length} open escalations`,
      tone: workflowRisk >= 45 ? "risk" : workflowRisk >= 20 ? "queued" : "ok"
    },
    {
      icon: TimerReset,
      label: "SLA Forecast",
      value: `${slaForecast}%`,
      detail: `${activeReports.length} reports, ${activeTasks.length} tasks`,
      tone: slaForecast < 70 ? "risk" : slaForecast < 85 ? "queued" : "ok"
    },
    {
      icon: Workflow,
      label: "Approval Load",
      value: String(pendingApprovals.length),
      detail: `${approvals.length} total chains`,
      tone: pendingApprovals.length > 3 ? "queued" : "ok"
    },
    {
      icon: SquareCheckBig,
      label: "Task Load",
      value: String(activeTasks.length),
      detail: `${tasks.filter((item) => item.status === "Blocked").length} blocked`,
      tone: tasks.some((item) => item.status === "Blocked") ? "risk" : activeTasks.length ? "queued" : "ok"
    },
    {
      icon: FileCheck2,
      label: "Report Coverage",
      value: `${reportCoverage}%`,
      detail: `${reports.length} report packets`,
      tone: reportCoverage < 70 ? "risk" : "ok"
    },
    {
      icon: ScrollText,
      label: "Policy Registry",
      value: String(activePolicies),
      detail: `${policies.length} policy records`,
      tone: policies.some((item) => item.status === "Draft") ? "queued" : "ok"
    },
    {
      icon: CalendarDays,
      label: "Calendar Load",
      value: String(upcomingEvents.length),
      detail: `${calendarEvents.filter((item) => item.status === "At Risk").length} at risk`,
      tone: calendarEvents.some((item) => item.status === "At Risk") ? "risk" : upcomingEvents.length ? "queued" : "ok"
    },
    {
      icon: Users,
      label: "Personnel",
      value: String(activePersonnel),
      detail: `${personnel.filter((item) => item.status === "Transfer Pending").length} transfer pending`,
      tone: personnel.some((item) => item.status === "Transfer Pending") ? "queued" : "ok"
    },
    {
      icon: Signature,
      label: "Transfer Readiness",
      value: `${transferReadiness}%`,
      detail: `${readyTransfers}/${transfers.length} sessions ready`,
      tone: transferReadiness < 50 ? "queued" : "ok"
    },
    {
      icon: Files,
      label: "Archive Integrity",
      value: `${archiveIntegrity}%`,
      detail: `${documents.length} vault records`,
      tone: archiveIntegrity < 80 ? "queued" : "ok"
    },
    {
      icon: CloudOff,
      label: "Offline Queue",
      value: String(offlineQueue.length),
      detail: offlineQueue.length ? "Sync required" : "No cached actions",
      tone: offlineQueue.length ? "queued" : "ok"
    },
    {
      icon: ClipboardCheck,
      label: "Deployment Readiness",
      value: `${backendReadiness}/5`,
      detail: `${stationDirectory.length} station identities`,
      tone: backendReadiness >= 4 ? "ok" : "queued"
    }
  ];

  return (
    <div className="panel command-deck">
      <PanelHeader icon={LayoutDashboard} title="Command Operations Layer" action="14 systems" />
      <div className="command-grid">
        {cards.map(({ icon: Icon, label, value, detail, tone }) => (
          <article className={`command-card ${tone}`} key={label}>
            <div className="command-icon">
              <Icon size={17} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function formatUptime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function CommandDispatchPanel({
  briefing,
  reports,
  approvals,
  tasks,
  calendarEvents,
  personnel,
  escalations,
  onRefresh,
  onArchive,
  onDirective,
  onTask,
  onEscalation
}: {
  briefing: CommandBriefing | null;
  reports: Report[];
  approvals: Approval[];
  tasks: GovernanceTask[];
  calendarEvents: CalendarEvent[];
  personnel: PersonRecord[];
  escalations: Escalation[];
  onRefresh: () => void;
  onArchive: () => void;
  onDirective: () => void;
  onTask: () => void;
  onEscalation: () => void;
}) {
  const fallbackCounts = {
    openEscalations: escalations.filter((item) => item.status !== "Resolved").length,
    pendingApprovals: approvals.filter((item) => item.state !== "Approved").length,
    activeReports: reports.filter((item) => item.state !== "Approved").length,
    blockedTasks: tasks.filter((item) => item.status === "Blocked").length,
    atRiskCalendar: calendarEvents.filter((item) => item.status === "At Risk").length,
    transferPending: personnel.filter((item) => item.status === "Transfer Pending").length
  };
  const counts = briefing?.counts ?? fallbackCounts;
  const riskScore = briefing?.riskScore ?? Math.min(100, (counts.openEscalations * 16) + (counts.pendingApprovals * 8) + (counts.activeReports * 6) + (counts.blockedTasks * 12) + (counts.atRiskCalendar * 10) + (counts.transferPending * 7));
  const priorities = briefing?.priorities ?? [
    escalations.find((item) => item.status !== "Resolved")?.item ?? "No open escalation",
    approvals.find((item) => item.state !== "Approved")?.request ?? "No pending approval",
    tasks.find((item) => item.status === "Blocked")?.title ?? "No blocked task",
    calendarEvents.find((item) => item.status === "At Risk")?.title ?? "No calendar risk"
  ];

  return (
    <div className="panel command-dispatch">
      <PanelHeader icon={RadioTower} title="Command Dispatch" action={`${riskScore}% risk`} />
      <div className="office-summary-grid command-summary">
        <Insight label="Open escalations" value={String(counts.openEscalations)} />
        <Insight label="Pending approvals" value={String(counts.pendingApprovals)} />
        <Insight label="Active reports" value={String(counts.activeReports)} />
      </div>
      <div className="dispatch-priorities">
        {priorities.map((priority) => (
          <div className="control-row" key={priority}>
            <CircleDot size={15} />
            <span>{priority}</span>
          </div>
        ))}
      </div>
      <div className="action-row">
        <button onClick={onRefresh}><RefreshCw size={15} /> Refresh brief</button>
        <button onClick={onArchive}><Files size={15} /> Archive brief</button>
        <button onClick={onDirective}><Send size={15} /> Issue directive</button>
        <button onClick={onTask}><SquareCheckBig size={15} /> Create task</button>
        <button onClick={onEscalation}><AlertTriangle size={15} /> Open escalation</button>
      </div>
    </div>
  );
}

function ControlCenter({
  offlineMode,
  networkOnline,
  messages,
  reports,
  approvals,
  tasks,
  policies,
  calendarEvents,
  personnel,
  escalations,
  transfers,
  documents,
  events,
  offlineQueue,
  offlineConflicts,
  offlineSyncHistory,
  installReady,
  station,
  permissions,
  stationDirectory,
  apiStatus,
  apiStatusError,
  commandBriefing,
  onSync,
  onRefreshCommandBriefing,
  onArchiveCommandBriefing,
  onIssueCommandDirective,
  onCreateCommandTask,
  onOpenCommandEscalation
}: {
  offlineMode: boolean;
  networkOnline: boolean;
  messages: Message[];
  reports: Report[];
  approvals: Approval[];
  tasks: GovernanceTask[];
  policies: Policy[];
  calendarEvents: CalendarEvent[];
  personnel: PersonRecord[];
  escalations: Escalation[];
  transfers: Transfer[];
  documents: DocumentRecord[];
  events: string[];
  offlineQueue: OfflineAction[];
  offlineConflicts: OfflineConflict[];
  offlineSyncHistory: OfflineSyncRecord[];
  installReady: boolean;
  station: StationCard;
  permissions: Permissions;
  stationDirectory: StationCard[];
  apiStatus: ApiStatus | null;
  apiStatusError: string;
  commandBriefing: CommandBriefing | null;
  onSync: () => void;
  onRefreshCommandBriefing: () => void;
  onArchiveCommandBriefing: () => void;
  onIssueCommandDirective: () => void;
  onCreateCommandTask: () => void;
  onOpenCommandEscalation: () => void;
}) {
  return (
    <section className="dashboard-grid">
      <CommandDeck
        apiStatus={apiStatus}
        apiStatusError={apiStatusError}
        station={station}
        permissions={permissions}
        stationDirectory={stationDirectory}
        messages={messages}
        reports={reports}
        approvals={approvals}
        tasks={tasks}
        policies={policies}
        calendarEvents={calendarEvents}
        personnel={personnel}
        escalations={escalations}
        transfers={transfers}
        documents={documents}
        offlineQueue={offlineQueue}
      />
      <CommandDispatchPanel
        briefing={commandBriefing}
        reports={reports}
        approvals={approvals}
        tasks={tasks}
        calendarEvents={calendarEvents}
        personnel={personnel}
        escalations={escalations}
        onRefresh={onRefreshCommandBriefing}
        onArchive={onArchiveCommandBriefing}
        onDirective={onIssueCommandDirective}
        onTask={onCreateCommandTask}
        onEscalation={onOpenCommandEscalation}
      />
      <HierarchyPanel compact />
      <AiPanel />
      <ChurchMailPanel messages={messages} />
      <WorkflowPanel />
      <ApprovalPanel approvals={approvals} />
      <EventBusPanel events={events} />
      <OfflinePanel offlineMode={offlineMode} networkOnline={networkOnline} offlineQueue={offlineQueue} offlineConflicts={offlineConflicts} syncHistory={offlineSyncHistory} installReady={installReady} onSync={onSync} />
    </section>
  );
}

function StationHome({
  station,
  messages,
  reports,
  tasks,
  documents,
  offlineMode,
  networkOnline,
  offlineQueue,
  onOpenSection,
  onSendMessage,
  onCreateReport,
  onCreateTask
}: {
  station: StationCard;
  messages: Message[];
  reports: Report[];
  tasks: GovernanceTask[];
  documents: DocumentRecord[];
  offlineMode: boolean;
  networkOnline: boolean;
  offlineQueue: OfflineAction[];
  onOpenSection: (section: Section) => void;
  onSendMessage: (message: Pick<Message, "kind" | "subject" | "files"> & { to: string }) => void;
  onCreateReport: (reportDraft: Omit<Report, "id" | "state" | "score">) => void;
  onCreateTask: (draft: Omit<GovernanceTask, "id" | "status">) => void;
}) {
  const stationPermissions = getPermissions(station);
  const workstationProfile = getWorkstationProfile(station, stationPermissions);
  const [messageTo, setMessageTo] = React.useState(workstationProfile.defaultMessageTo);
  const [messageSubject, setMessageSubject] = React.useState(workstationProfile.defaultMessageSubject);
  const [messageFiles, setMessageFiles] = React.useState(workstationProfile.defaultFiles);
  const [reportName, setReportName] = React.useState(workstationProfile.defaultReportName);
  const [reportType, setReportType] = React.useState(workstationProfile.defaultReportType);
  const [taskTitle, setTaskTitle] = React.useState(workstationProfile.defaultTaskTitle);
  const [feedback, setFeedback] = React.useState("");
  const inbox = messages.filter((message) => !message.archived).slice(0, 5);
  const openReports = reports.filter((report) => report.state !== "Approved").slice(0, 5);
  const openTasks = tasks.filter((task) => task.status !== "Complete").slice(0, 5);
  const recentDocuments = documents.slice(0, 4);
  const allowedSections = getAllowedSections(station, stationPermissions);
  React.useEffect(() => {
    setMessageTo(workstationProfile.defaultMessageTo);
    setMessageSubject(workstationProfile.defaultMessageSubject);
    setMessageFiles(workstationProfile.defaultFiles);
    setReportName(workstationProfile.defaultReportName);
    setReportType(workstationProfile.defaultReportType);
    setTaskTitle(workstationProfile.defaultTaskTitle);
    setFeedback("");
  }, [
    workstationProfile.key,
    workstationProfile.defaultFiles,
    workstationProfile.defaultMessageSubject,
    workstationProfile.defaultMessageTo,
    workstationProfile.defaultReportName,
    workstationProfile.defaultReportType,
    workstationProfile.defaultTaskTitle
  ]);
  const statusCards = [
    ...workstationProfile.primaryTools.map((tool, index) => ({
      ...tool,
      value: index === 0 ? String(inbox.length) : index === 1 ? String(openReports.length) : index === 2 ? String(openTasks.length) : String(recentDocuments.length)
    })),
    { icon: ArchiveIcon, label: "Archive", value: String(recentDocuments.length), detail: "Saved files and evidence", section: "Archive" as Section }
  ].filter((card, index, cards) => allowedSections.includes(card.section) && cards.findIndex((item) => item.label === card.label) === index).slice(0, 4);

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSendMessage({
      kind: "Report",
      to: messageTo,
      subject: messageSubject,
      files: messageFiles
    });
    setFeedback(offlineMode ? "Message saved locally and will sync when internet returns." : "Message sent through ChurchMail.");
    setMessageSubject("Follow-up message");
  }

  function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateReport({
      name: reportName,
      owner: station.title,
      path: `${station.level} -> Area Office -> District HQ`,
      due: "Today",
      type: reportType,
      period: "Current week",
      routingStage: "Draft started from station home",
      evidenceStatus: messageFiles || "Evidence pending",
      templateId: workstationProfile.key === "mission" ? "tpl-service-kingdom-harvesters" : undefined,
      templateChecklist: workstationProfile.key === "mission" ? ["Outreach locations", "Souls reached", "Souls won", "Phone numbers collected", "Follow-up calls completed"] : undefined
    });
    setFeedback("Report draft created. Open Reports to complete and submit it.");
    setReportName(workstationProfile.defaultReportName);
  }

  function addTask() {
    onCreateTask({
      title: taskTitle,
      owner: station.title,
      assignee: station.title,
      priority: "Medium",
      due: "This week"
    });
    setFeedback("Task added to your station work list.");
    setTaskTitle("New follow-up task");
  }

  const featuredMessage = inbox[0];

  return (
    <section className="station-home">
      <div className="station-home-hero">
        <div>
          <span>{workstationProfile.label}</span>
          <h2>{workstationProfile.title}</h2>
          <p>{workstationProfile.description}</p>
          <div className="station-focus-row">
            {workstationProfile.focus.map((item) => <small key={item}>{item}</small>)}
          </div>
        </div>
        <div className="station-home-state">
          <span>{station.title}</span>
          <strong>{station.level}</strong>
          <small>{station.authority}</small>
        </div>
        <div className="station-home-state">
          <span>{networkOnline ? "Internet available" : "Working offline"}</span>
          <strong>{offlineMode ? "Offline queue" : "Ready to work"}</strong>
          <small>{offlineQueue.length ? `${offlineQueue.length} action(s) waiting to sync` : "No unsynced work"}</small>
        </div>
      </div>

      <div className="role-system-panel" aria-label={`${workstationProfile.label} system modules`}>
        <div>
          <span>Role system</span>
          <strong>{workstationProfile.label}</strong>
          <p>GCOS loaded the tools, report defaults, inbox route, and work queue for this station.</p>
        </div>
        <div className="role-tool-grid">
          {workstationProfile.primaryTools.filter((tool) => allowedSections.includes(tool.section)).map(({ icon: Icon, label, detail, section }) => (
            <button key={label} type="button" onClick={() => onOpenSection(section)}>
              <Icon size={18} />
              <span>{label}</span>
              <small>{detail}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="station-home-actions" aria-label="Primary station actions">
        {statusCards.map(({ icon: Icon, label, value, detail, section }) => (
          <button key={label} onClick={() => onOpenSection(section)}>
            <Icon size={19} />
            <strong>{value}</strong>
            <span>{label}</span>
            <small>{detail}</small>
          </button>
        ))}
      </div>

      {feedback && <div className="station-feedback">{feedback}</div>}

      <div className="station-workspace-grid">
        <div className="station-panel station-panel-large station-inbox-panel">
          <PanelHeader icon={Inbox} title="ChurchMail Inbox" action={`${inbox.length} messages`} />
          {featuredMessage && (
            <button className="station-featured-mail" type="button" onClick={() => onOpenSection("ChurchMail")}>
              <span className={`kind ${featuredMessage.kind.toLowerCase()}`}>{featuredMessage.kind}</span>
              <div>
                <strong>{featuredMessage.subject}</strong>
                <small>{featuredMessage.from} - {featuredMessage.age}</small>
              </div>
              <StatusPill status={featuredMessage.status} />
            </button>
          )}
          <div className="station-inbox-list">
            {inbox.map((message) => (
              <button key={message.id} className="station-inbox-row" type="button" onClick={() => onOpenSection("ChurchMail")}>
                <div className="mail-kind-marker">
                  <Mail size={15} />
                  <span>{message.kind}</span>
                </div>
                <div className="mail-row-main">
                  <strong>{message.subject}</strong>
                  <span>{message.from} - {message.age}</span>
                  <small>{message.files}</small>
                </div>
                <StatusPill status={message.status} />
              </button>
            ))}
          </div>
          <div className="station-inbox-actions">
            <button type="button" onClick={() => onOpenSection("ChurchMail")}><Mail size={15} /> Open inbox</button>
            <button type="button" onClick={() => onOpenSection("Reports")}><FileCheck2 size={15} /> Attach report</button>
            <button type="button" onClick={() => onOpenSection("Archive")}><ArchiveIcon size={15} /> View archive</button>
          </div>
        </div>

        <div className="station-panel">
          <PanelHeader icon={Send} title="Send Message" action={offlineMode ? "Local queue" : "ChurchMail"} />
          <form className="station-form" onSubmit={submitMessage}>
            <label>
              <span>Send to</span>
              <input value={messageTo} onChange={(event) => setMessageTo(event.target.value)} />
            </label>
            <label>
              <span>Subject</span>
              <input value={messageSubject} onChange={(event) => setMessageSubject(event.target.value)} />
            </label>
            <label>
              <span>Attachments / evidence</span>
              <input value={messageFiles} onChange={(event) => setMessageFiles(event.target.value)} />
            </label>
            <button type="submit"><Send size={15} /> Send message</button>
          </form>
        </div>

        <div className="station-panel">
          <PanelHeader icon={FileCheck2} title="Start Report" action="Attach evidence" />
          <form className="station-form" onSubmit={submitReport}>
            <label>
              <span>Report name</span>
              <input value={reportName} onChange={(event) => setReportName(event.target.value)} />
            </label>
            <label>
              <span>Report type</span>
              <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                {workstationProfile.reportTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <button type="submit"><FileCheck2 size={15} /> Create report draft</button>
          </form>
        </div>

        <div className="station-panel station-panel-large">
          <PanelHeader icon={ScrollText} title="Open Reports" action={`${openReports.length} active`} />
          <div className="station-list">
            {openReports.map((report) => (
              <button key={report.id} onClick={() => onOpenSection("Reports")}>
                <div>
                  <strong>{report.name}</strong>
                  <span>{report.owner} - {report.due} - {report.evidenceStatus}</span>
                </div>
                <StatusPill status={report.state} />
              </button>
            ))}
          </div>
        </div>

        <div className="station-panel">
          <PanelHeader icon={SquareCheckBig} title="My Tasks" action="Today" />
          <div className="station-list compact">
            {openTasks.map((task) => (
              <button key={task.id} onClick={() => onOpenSection("Tasks")}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.assignee} - {task.due}</span>
                </div>
                <StatusPill status={task.status} />
              </button>
            ))}
          </div>
          <div className="station-inline-task">
            <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} aria-label="New task title" />
            <button type="button" onClick={addTask}><Plus size={14} /> Add</button>
          </div>
        </div>

        <div className="station-panel">
          <PanelHeader icon={Files} title="Attached Files" action="Archive" />
          <div className="station-list compact">
            {recentDocuments.map((document) => (
              <button key={document.id} onClick={() => onOpenSection("Archive")}>
                <div>
                  <strong>{document.name}</strong>
                  <span>{document.classification} - {document.status}</span>
                </div>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChurchMail({
  messages,
  events,
  station,
  offlineMode,
  onAcknowledge,
  onClassify,
  onUpdateStatus,
  onCreateReport,
  onRequestApproval,
  onArchiveAttachments,
  onSendMessage,
  onUpdateRoute,
  onUpdatePriority,
  onEscalateMessage,
  onApproveMessage,
  onArchiveMessage,
  onWatchMessage,
  onDuplicateMessage,
  onBulkApprove,
  onRefreshDigest,
  digest
}: {
  messages: Message[];
  events: string[];
  station: StationCard;
  offlineMode: boolean;
  onAcknowledge: (id: string) => void;
  onClassify: (id: string, kind: MessageKind) => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onCreateReport: (id: string) => void;
  onRequestApproval: (id: string) => void;
  onArchiveAttachments: (id: string) => void;
  onSendMessage: (message: Pick<Message, "kind" | "subject" | "files"> & { to: string }) => void;
  onUpdateRoute: (id: string) => void;
  onUpdatePriority: (id: string) => void;
  onEscalateMessage: (id: string) => void;
  onApproveMessage: (id: string) => void;
  onArchiveMessage: (id: string) => void;
  onWatchMessage: (id: string) => void;
  onDuplicateMessage: (id: string) => void;
  onBulkApprove: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: MessageDigest | null;
}) {
  const [selectedId, setSelectedId] = React.useState(messages[0]?.id ?? "");
  const [composeKind, setComposeKind] = React.useState<MessageKind>("Directive");
  const [composeTo, setComposeTo] = React.useState("District Offices");
  const [composeSubject, setComposeSubject] = React.useState("Administrative follow-up memo");
  const [composeFiles, setComposeFiles] = React.useState("Memo PDF");
  const [composeFeedback, setComposeFeedback] = React.useState("");
  const [kindFilter, setKindFilter] = React.useState<MessageKind | "All kinds">("All kinds");
  const [statusFilter, setStatusFilter] = React.useState<Status | "All statuses">("All statuses");
  const visibleMessages = React.useMemo(() => messages.filter((message) => (
    (kindFilter === "All kinds" || message.kind === kindFilter)
    && (statusFilter === "All statuses" || message.status === statusFilter)
  )), [kindFilter, messages, statusFilter]);
  const selected = visibleMessages.find((message) => message.id === selectedId) ?? visibleMessages[0] ?? messages[0];
  const readyCount = messages.filter((message) => message.status === "Ready").length;
  const reviewCount = messages.filter((message) => message.status === "In Review").length;
  const escalatedCount = messages.filter((message) => message.status === "Escalated").length;
  const watchedCount = messages.filter((message) => message.watchers?.length).length;

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSendMessage({
      kind: composeKind,
      to: composeTo,
      subject: composeSubject,
      files: composeFiles
    });
    setComposeFeedback(offlineMode ? "Message saved to offline queue and local inbox." : "Message routed through ChurchMail.");
    setComposeSubject(`${composeKind} follow-up memo`);
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={Mail} title="ChurchMail Governance Inbox" action="Classified routing" />
        <div className="office-summary-grid">
          <Insight label="Ready" value={String(digest?.ready ?? readyCount)} />
          <Insight label="Review" value={String(digest?.review ?? reviewCount)} />
          <Insight label="Escalated" value={String(digest?.escalated ?? escalatedCount)} />
          <Insight label="Archived" value={String(digest?.archived ?? messages.filter((message) => message.archived).length)} />
          <Insight label="Watched" value={String(digest?.watched ?? watchedCount)} />
          <Insight label="Next message" value={digest?.nextMessage ?? selected?.subject ?? "None"} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Classification</span>
            <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as MessageKind | "All kinds")}>
              {["All kinds", "Directive", "Report", "Approval", "Notification", "Transfer"].map((kind) => <option key={kind} value={kind}>{kind}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Status | "All statuses")}>
              {["All statuses", "Ready", "In Review", "Escalated", "Approved", "Queued"].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <button onClick={onRefreshDigest}><RefreshCw size={15} /> Digest</button>
          <button disabled={!visibleMessages.length} onClick={() => onBulkApprove(visibleMessages.slice(0, 3).map((message) => message.id))}><CheckCircle2 size={15} /> Bulk approve</button>
        </div>
        <div className="mail-layout">
          <div className="message-list">
            {visibleMessages.map((message) => (
              <button
                className={message.id === selected?.id ? "message-button selected" : "message-button"}
                key={message.id}
                aria-label={message.subject}
                onClick={() => setSelectedId(message.id)}
              >
                <MessageCard message={message} />
              </button>
            ))}
            {visibleMessages.length === 0 && <div className="empty-state">No ChurchMail messages match the current filters.</div>}
          </div>
          {selected && (
            <div className="mail-preview">
              <div className={`kind ${selected.kind.toLowerCase()}`}>{selected.kind}</div>
              <h2>{selected.subject}</h2>
              <p>{selected.from} sent an official {selected.kind.toLowerCase()} with attached governance records: {selected.files}.</p>
              <div className="route-box">
                <strong>Routing chain</strong>
                <span>{selected.route ?? "Origin station -> Current station -> Supervising authority -> Archive vault"}</span>
              </div>
              <div className="approval-meta">
                <small>{selected.priority ?? "Medium"} priority</small>
                <small>{selected.watchers?.length ?? 0} watchers</small>
                <small>{selected.archived ? "Archived" : "Live record"}</small>
              </div>
              <div className="action-row">
                <button onClick={() => onUpdateStatus(selected.id, "In Review")}><FileClock size={15} /> Review</button>
                <button onClick={() => onClassify(selected.id, selected.kind === "Directive" ? "Notification" : "Directive")}><SlidersHorizontal size={15} /> Classify</button>
                <button onClick={() => onAcknowledge(selected.id)}><Send size={15} /> Acknowledge</button>
                <button onClick={() => onApproveMessage(selected.id)}><CheckCircle2 size={15} /> Approve</button>
                <button onClick={() => onEscalateMessage(selected.id)}><AlertTriangle size={15} /> Escalate</button>
                <button onClick={() => onUpdateRoute(selected.id)}><Workflow size={15} /> Route</button>
                <button onClick={() => onUpdatePriority(selected.id)}><TimerReset size={15} /> Priority</button>
                <button onClick={() => onWatchMessage(selected.id)}><Bell size={15} /> Watch</button>
                <button onClick={() => onDuplicateMessage(selected.id)}><Files size={15} /> Duplicate</button>
                <button onClick={() => onArchiveMessage(selected.id)}><LockKeyhole size={15} /> Archive</button>
                <button onClick={() => onCreateReport(selected.id)}><FileCheck2 size={15} /> Create report</button>
                <button onClick={() => onRequestApproval(selected.id)}><Signature size={15} /> Request approval</button>
                <button onClick={() => onArchiveAttachments(selected.id)}><Files size={15} /> Vault</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="side-stack">
        <div className="panel module-side">
          <PanelHeader icon={Send} title="Compose ChurchMail" action={offlineMode ? "Queue" : "Route"} />
          <form className="churchmail-form" onSubmit={submitMessage}>
            <label>
              <span>Sender station</span>
              <input value={station.email} readOnly />
            </label>
            <label>
              <span>Classification</span>
              <select value={composeKind} onChange={(event) => setComposeKind(event.target.value as MessageKind)}>
                {["Directive", "Report", "Approval", "Notification", "Transfer"].map((kind) => (
                  <option key={kind} value={kind}>{kind}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Recipient / route</span>
              <input value={composeTo} onChange={(event) => setComposeTo(event.target.value)} />
            </label>
            <label>
              <span>Subject</span>
              <input value={composeSubject} onChange={(event) => setComposeSubject(event.target.value)} />
            </label>
            <label>
              <span>Attachments</span>
              <input value={composeFiles} onChange={(event) => setComposeFiles(event.target.value)} />
            </label>
            {composeFeedback && <div className="compose-feedback">{composeFeedback}</div>}
            <button type="submit"><Send size={15} /> Send ChurchMail</button>
          </form>
        </div>
        <EventBusPanel events={events} />
      </div>
    </section>
  );
}

function Reports({
  reports,
  station,
  onCreateReport,
  onSubmitReport,
  onRequestCorrection,
  onUpdateDue,
  onUpdateScore,
  onEscalateReport,
  onArchiveEvidence,
  onUpdateOwner,
  onUpdatePath,
  onMarkEvidence,
  onReviewReport,
  onVerifyReport,
  onWatchReport,
  onDuplicateReport,
  onArchiveReport,
  onBuildGovernancePacket,
  onUploadReportEvidence,
  onUpdateReportDetails,
  onBulkSubmit,
  onBulkCorrection,
  onRefreshDigest,
  onSendReportMessage,
  digest
}: {
  reports: Report[];
  station: StationCard;
  onCreateReport: (report: Omit<Report, "id" | "state" | "score">) => void;
  onSubmitReport: (id: string) => void;
  onRequestCorrection: (id: string) => void;
  onUpdateDue: (id: string, due: string) => void;
  onUpdateScore: (id: string, score: number) => void;
  onEscalateReport: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
  onArchiveEvidence: (id: string) => void;
  onUpdateOwner: (id: string) => void;
  onUpdatePath: (id: string) => void;
  onMarkEvidence: (id: string) => void;
  onReviewReport: (id: string) => void;
  onVerifyReport: (id: string) => void;
  onWatchReport: (id: string) => void;
  onDuplicateReport: (id: string) => void;
  onArchiveReport: (id: string) => void;
  onBuildGovernancePacket: (id: string) => void;
  onUploadReportEvidence: (id: string, file: File) => void;
  onUpdateReportDetails: (id: string, details: Pick<Report, "preparedBy" | "attestation" | "approvalLimit" | "reportFields" | "templateChecklist">) => void;
  onBulkSubmit: (ids: string[]) => void;
  onBulkCorrection: (ids: string[]) => void;
  onRefreshDigest: () => void;
  onSendReportMessage: (message: Pick<Message, "kind" | "subject" | "files"> & { to: string }) => void;
  digest: ReportDigest | null;
}) {
  const [name, setName] = React.useState("Monthly branch administration report");
  const [owner, setOwner] = React.useState(String(station.level));
  const [path, setPath] = React.useState(`${station.level} -> Supervising Office`);
  const [due, setDue] = React.useState("Draft");
  const [type, setType] = React.useState("Administrative");
  const [period, setPeriod] = React.useState("May 2026");
  const [stateFilter, setStateFilter] = React.useState("All states");
  const [feedback, setFeedback] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<ReportTemplate>(churchReportTemplates[0]);
  const [preparedBy, setPreparedBy] = React.useState(station.email);
  const [attestation, setAttestation] = React.useState("I certify this report is accurate and ready for supervisory review.");
  const [reportFields, setReportFields] = React.useState<Record<string, string>>(() => defaultReportFields(churchReportTemplates[0]));
  const [templateSearch, setTemplateSearch] = React.useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = React.useState("All templates");
  const [selectedReportId, setSelectedReportId] = React.useState(reports[0]?.id ?? "");
  const [detailPreparedBy, setDetailPreparedBy] = React.useState("");
  const [detailAttestation, setDetailAttestation] = React.useState("");
  const [detailFields, setDetailFields] = React.useState<Record<string, string>>({});
  const [detailFeedback, setDetailFeedback] = React.useState("");
  const [routeTo, setRouteTo] = React.useState("Area Office");
  const visibleReports = React.useMemo(() => (
    stateFilter === "All states" ? reports : reports.filter((report) => report.state === stateFilter)
  ), [reports, stateFilter]);
  const stateOptions = React.useMemo(() => ["All states", ...Array.from(new Set(reports.map((report) => report.state))).sort()], [reports]);
  const templateTypes = React.useMemo(() => Array.from(new Set(churchReportTemplates.map((template) => template.type))).sort(), []);
  const featuredTemplateTypes = ["All templates", "Service Groups", "Meetings", "Financial", "Membership", "Mission", "Pastoral Care", "Administrative"];
  const filteredTemplates = React.useMemo(() => churchReportTemplates.filter((template) => {
    const haystack = [template.name, template.type, template.owner, template.description, template.path, ...template.checklist].join(" ").toLowerCase();
    return (templateTypeFilter === "All templates" || template.type === templateTypeFilter)
      && haystack.includes(templateSearch.trim().toLowerCase());
  }), [templateSearch, templateTypeFilter]);
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? visibleReports[0] ?? reports[0];
  const selectedReportFieldEntries = Object.entries(Object.keys(detailFields).length ? detailFields : selectedReport?.reportFields ?? {});
  const selectedReportComplete = selectedReportFieldEntries.length
    ? Math.round((completedReportFields(Object.keys(detailFields).length ? detailFields : selectedReport?.reportFields) / selectedReportFieldEntries.length) * 100)
    : selectedReport?.score ?? 0;
  const openCount = reports.filter((report) => report.state !== "Approved").length;
  const overdueCount = reports.filter((report) => report.due === "Overdue").length;
  const correctionCount = reports.filter((report) => report.state === "Correction Requested").length;
  const watchedCount = reports.filter((report) => report.watchers?.length).length;
  const evidenceReadyCount = reports.filter((report) => report.evidenceStatus?.toLowerCase().includes("attached") || report.evidenceStatus?.toLowerCase().includes("verified")).length;
  const approvalReadyCount = reports.filter((report) => report.score >= 80 && report.state !== "Approved").length;
  const selectedSections = React.useMemo(() => reportTemplateSections(selectedTemplate), [selectedTemplate]);
  const reportCompletion = selectedSections.length ? Math.round((completedReportFields(reportFields) / selectedSections.length) * 100) : 0;
  const completionTracks = [
    { label: "Sign-in", detail: "7 official RMVI station accounts seeded", done: true },
    { label: "Template search", detail: `${filteredTemplates.length} matching designed reports`, done: true },
    { label: "Detail view", detail: selectedReport ? `${selectedReport.name} workspace open` : "No report selected", done: Boolean(selectedReport) },
    { label: "Database", detail: "Persistence, migration, backup, restore checks", done: true },
    { label: "Deploy", detail: "rmvi.org launch plan and smoke URLs", done: true },
    { label: "Accounts", detail: "Finance, Audit, Mission desks added", done: true },
    { label: "Security", detail: "Sessions, audit, controls, evidence chain", done: true }
  ];

  React.useEffect(() => {
    setOwner(String(station.level));
    setPath(`${station.level} -> Supervising Office`);
    setPreparedBy(station.email);
  }, [station.email, station.level]);

  React.useEffect(() => {
    if (!selectedReport) return;
    const fallbackTemplate = churchReportTemplates.find((template) => template.id === selectedReport.templateId) ?? selectedTemplate;
    setDetailPreparedBy(selectedReport.preparedBy ?? selectedReport.owner);
    setDetailAttestation(selectedReport.attestation ?? "I certify this report is accurate and ready for supervisory review.");
    setDetailFields(Object.keys(selectedReport.reportFields ?? {}).length ? selectedReport.reportFields! : defaultReportFields(fallbackTemplate));
    setDetailFeedback("");
  }, [selectedReport?.id]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateReport({
      name,
      owner,
      path,
      due,
      type,
      period,
      routingStage: selectedTemplate.routingStage,
      evidenceStatus: selectedTemplate.evidenceStatus,
      reviewNote: `Template checklist: ${selectedTemplate.checklist.join("; ")}. Approval: ${selectedTemplate.approvalLimit}.`,
      templateId: selectedTemplate.id,
      preparedBy,
      attestation,
      approvalLimit: selectedTemplate.approvalLimit,
      reportFields,
      templateChecklist: selectedTemplate.checklist
    });
    setFeedback(`${name} has been drafted from the ${selectedTemplate.type} template.`);
    setName("New administrative report");
  }

  function applyTemplate(template: ReportTemplate) {
    setSelectedTemplate(template);
    setType(template.type);
    setName(template.name);
    setOwner(template.owner);
    setDue(template.due);
    setPeriod(template.period);
    setPath(template.path);
    setReportFields(defaultReportFields(template));
    setFeedback(`${template.name} loaded with ${template.checklist.length} required sections.`);
  }

  function updateReportField(section: string, value: string) {
    setReportFields((fields) => ({ ...fields, [section]: value }));
  }

  function updateDetailField(section: string, value: string) {
    setDetailFields((fields) => ({ ...fields, [section]: value }));
  }

  function saveSelectedReportDetails() {
    if (!selectedReport) return;
    onUpdateReportDetails(selectedReport.id, {
      preparedBy: detailPreparedBy,
      attestation: detailAttestation,
      approvalLimit: selectedReport.approvalLimit ?? "Delegated review",
      reportFields: detailFields,
      templateChecklist: selectedReport.templateChecklist ?? []
    });
    setDetailFeedback("Report detail workspace saved and routed for audit logging.");
  }

  function exportReports() {
    const headers = ["Name", "Type", "Period", "Owner", "Route", "Stage", "Due", "State", "Score", "Evidence", "Verified"];
    const rows = visibleReports.map((report) => [
      report.name,
      report.type ?? "Administrative",
      report.period ?? "Current",
      report.owner,
      report.path,
      report.routingStage ?? report.state,
      report.due,
      report.state,
      `${report.score}%`,
      report.evidenceStatus ?? "Evidence pending",
      report.verified ? "Yes" : "No"
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadTextFile(`gcos-report-register-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");
  }

  function sendSelectedReport() {
    if (!selectedReport) return;
    onSendReportMessage({
      kind: "Report",
      to: routeTo,
      subject: selectedReport.name,
      files: selectedReport.evidenceStatus ?? selectedReport.type ?? "Report attachment"
    });
    setDetailFeedback(`Report sent to ${routeTo} through ChurchMail.`);
  }

  return (
    <section className="reports-app">
      <div className="reports-hero">
        <div>
          <span>Reporting Center</span>
          <h2>Choose a report, complete it, attach evidence, and send it upward.</h2>
          <p>{station.title} can use prebuilt RMVI templates for service groups, meetings, finance, membership, mission, and pastoral care.</p>
        </div>
        <div className="reports-hero-stats">
          <strong>{churchReportTemplates.length}</strong>
          <span>report templates</span>
          <small>{openCount} open, {overdueCount} overdue, {evidenceReadyCount} evidence ready</small>
        </div>
      </div>

      <div className="reports-stepper" aria-label="Report workflow steps">
        <div className="active"><span>1</span><strong>Choose template</strong><small>Select the church report form</small></div>
        <div className="active"><span>2</span><strong>Complete report</strong><small>Fill sections and sign</small></div>
        <div><span>3</span><strong>Send upward</strong><small>Attach, submit, or email</small></div>
      </div>

      <div className="reports-layout">
        <aside className="reports-left-panel">
          <div className="report-card report-library-card">
            <div className="report-card-title">
              <div><span>Step 1</span><h3>Report Template Library</h3></div>
              <small>{filteredTemplates.length}/{churchReportTemplates.length} shown</small>
            </div>
            <div className="report-library-summary">
              <div><strong>{churchReportTemplates.length}</strong><span>Designed reports</span></div>
              <div><strong>{templateTypes.length}</strong><span>Categories</span></div>
              <button type="button" onClick={() => {
                setTemplateTypeFilter("All templates");
                setTemplateSearch("");
              }}>Reset</button>
            </div>
            <div className="report-category-pills" aria-label="Report categories">
              {featuredTemplateTypes.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={templateTypeFilter === category ? "active" : ""}
                  onClick={() => setTemplateTypeFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="template-filter-bar report-filter-compact">
              <label>
                <Search size={14} />
                <input value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} placeholder="Search templates" />
              </label>
              <select value={templateTypeFilter} onChange={(event) => setTemplateTypeFilter(event.target.value)}>
                <option>All templates</option>
                {templateTypes.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="report-template-list" aria-label="Available report templates">
              {filteredTemplates.slice(0, 12).map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={selectedTemplate.id === template.id ? "selected" : ""}
                  onClick={() => applyTemplate(template)}
                >
                  <span>{template.type}</span>
                  <strong>{template.name}</strong>
                  <small>{template.description}</small>
                </button>
              ))}
              {filteredTemplates.length === 0 && <div className="empty-state">No templates match this search. Reset the filter to view all reports.</div>}
            </div>
            <div className="report-template-preview">
              <div className="template-preview-head">
                <div>
                  <span>{selectedTemplate.type}</span>
                  <strong>{selectedTemplate.name}</strong>
                </div>
                <FileCheck2 size={22} />
              </div>
              <p>{selectedTemplate.description}</p>
              <div className="template-route-line">
                <GitBranch size={15} />
                <div>
                  <small>Routing path</small>
                  <span>{selectedTemplate.path}</span>
                </div>
              </div>
              <div className="template-checklist-block">
                <div>
                  <ClipboardCheck size={15} />
                  <strong>Required sections</strong>
                </div>
                <div className="template-checklist-preview">
                  {selectedTemplate.checklist.slice(0, 6).map((item) => (
                    <span key={item}><CheckCircle2 size={13} /> {item}</span>
                  ))}
                </div>
              </div>
              <div className="template-requirement-grid">
                <div>
                  <BadgeCheck size={15} />
                  <span>Approval</span>
                  <strong>{selectedTemplate.approvalLimit}</strong>
                </div>
                <div>
                  <Files size={15} />
                  <span>Evidence</span>
                  <strong>{selectedTemplate.evidenceStatus}</strong>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="reports-main-panel">
          <div className="report-card report-editor-card">
            <div className="report-card-title">
              <div><span>Step 2</span><h3>Complete Report Form</h3></div>
              <small>{reportCompletion}% draft complete</small>
            </div>
            <form className="report-form" onSubmit={submit}>
              <div className="report-document-head">
                <div className="report-document-seal">
                  <img src={CHURCH_LOGO_SRC} alt="Remedy Movement International logo" />
                </div>
                <div>
                  <span>{selectedTemplate.type} report</span>
                  <h3>{name}</h3>
                  <p>{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="report-meta-strip">
                <label>
                  <span>Reporting period</span>
                  <input value={period} onChange={(event) => setPeriod(event.target.value)} />
                </label>
                <label>
                  <span>Prepared by</span>
                  <input value={preparedBy} onChange={(event) => setPreparedBy(event.target.value)} />
                </label>
                <label>
                  <span>Route</span>
                  <input value={path} onChange={(event) => setPath(event.target.value)} />
                </label>
              </div>

              <label className="report-name-field">
                <span>Report title</span>
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>

              <div className="report-section-editor">
                {selectedSections.map((section, index) => (
                  <label className="report-section-card" key={section}>
                    <span><small>{String(index + 1).padStart(2, "0")}</small>{section}</span>
                    <textarea
                      value={reportFields[section] ?? ""}
                      onChange={(event) => updateReportField(section, event.target.value)}
                      placeholder={`Enter ${section.toLowerCase()}`}
                    />
                  </label>
                ))}
              </div>
              <label>
                <span>Attestation / signature line</span>
                <textarea value={attestation} onChange={(event) => setAttestation(event.target.value)} />
              </label>
              {feedback && <div className="compose-feedback">{feedback}</div>}
              <div className="report-actions-row report-sticky-actions">
                <div>
                  <strong>{reportCompletion}% complete</strong>
                  <span>{completedReportFields(reportFields)}/{selectedSections.length} sections filled</span>
                </div>
                <button type="submit"><Plus size={15} /> Save draft</button>
                <button type="button" onClick={() => {
                  setRouteTo("Area Office");
                  setFeedback("Draft is ready to send after saving.");
                }}><Mail size={15} /> Prepare email</button>
              </div>
            </form>
          </div>
        </main>

        <aside className="reports-right-panel">
          {selectedReport && (
            <div className="report-card report-submit-card">
              <div className="report-card-title">
                <div><span>Step 3</span><h3>Send / Submit Report</h3></div>
                <StatusPill status={selectedReport.state} />
              </div>
              <div className="report-submit-steps" aria-label="Report submission readiness">
                <div className={selectedReportComplete >= 60 ? "done" : ""}><CheckCircle2 size={15} /><span>Form</span><strong>{selectedReportComplete}%</strong></div>
                <div className={(selectedReport.evidenceStatus ?? "").toLowerCase().includes("attached") || (selectedReport.evidenceStatus ?? "").toLowerCase().includes("verified") ? "done" : ""}><Files size={15} /><span>Evidence</span><strong>{selectedReport.evidenceStatus ?? "Pending"}</strong></div>
                <div className={selectedReport.state !== "Ready" ? "done" : ""}><Send size={15} /><span>Routing</span><strong>{selectedReport.routingStage ?? selectedReport.state}</strong></div>
              </div>
              <div className="selected-report-summary">
                <div>
                  <span>{selectedReport.type ?? "Administrative"} - {selectedReport.period ?? "Current period"}</span>
                  <h3>{selectedReport.name}</h3>
                  <p>{selectedReport.path}</p>
                </div>
                <FlowMeter label={`${selectedReportComplete}% complete`} value={selectedReportComplete} />
              </div>
              <div className="report-preview-box">
                <strong>Finalize selected report</strong>
                {selectedReportFieldEntries.slice(0, 5).map(([section, value]) => (
                  <label key={section}>
                    <span>{section}</span>
                    <textarea value={detailFields[section] ?? value} onChange={(event) => updateDetailField(section, event.target.value)} placeholder={`Complete ${section.toLowerCase()}`} />
                  </label>
                ))}
                <label>
                  <span>Attestation</span>
                  <textarea value={detailAttestation} onChange={(event) => setDetailAttestation(event.target.value)} />
                </label>
              </div>
              <div className="report-route-box">
                <div className="report-command-head">
                  <div>
                    <span>Submission command</span>
                    <strong>Route this report</strong>
                  </div>
                  <small>{routeTo}</small>
                </div>
                <label className="report-route-input">
                  <span>Send to inbox / office</span>
                  <input value={routeTo} onChange={(event) => setRouteTo(event.target.value)} />
                </label>
                <div className="report-command-grid">
                  <button type="button" className="primary" onClick={saveSelectedReportDetails}><FileCheck2 size={16} /><span>Save details<small>Store the final form fields</small></span></button>
                  <button type="button" className="primary" onClick={sendSelectedReport}><Send size={16} /><span>Send to inbox<small>Route by ChurchMail</small></span></button>
                  <button type="button" className="success" onClick={() => {
                    onSubmitReport(selectedReport.id);
                    setDetailFeedback("Report submitted upward for supervisory review.");
                  }}><CheckCircle2 size={16} /><span>Submit upward<small>Move to next office</small></span></button>
                  <label className="file-action report-file-command">
                    <Upload size={16} />
                    <span>Attach file<small>Add evidence packet</small></span>
                    <input
                      type="file"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (file) {
                          void onUploadReportEvidence(selectedReport.id, file);
                          setDetailFeedback(`${file.name} attached to ${selectedReport.name}.`);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <button type="button" onClick={() => {
                    onBuildGovernancePacket(selectedReport.id);
                    setDetailFeedback("Governance packet built for this report.");
                  }}><Workflow size={16} /><span>Build packet<small>Prepare approval bundle</small></span></button>
                </div>
              </div>
              <div className="report-selected-actions">
                <button type="button" onClick={() => {
                  onReviewReport(selectedReport.id);
                  setDetailFeedback("Report moved into review.");
                }}><FileClock size={14} /> Review</button>
                <button type="button" onClick={() => {
                  onVerifyReport(selectedReport.id);
                  setDetailFeedback("Report verification marked complete.");
                }}><ShieldCheck size={14} /> Verify</button>
                <button type="button" onClick={() => {
                  onRequestCorrection(selectedReport.id);
                  setDetailFeedback("Correction request sent for this report.");
                }}><AlertTriangle size={14} /> Request correction</button>
                <button type="button" onClick={() => {
                  onArchiveEvidence(selectedReport.id);
                  setDetailFeedback("Report evidence moved to the archive vault.");
                }}><ArchiveIcon size={14} /> Vault evidence</button>
                <button type="button" onClick={() => {
                  onDuplicateReport(selectedReport.id);
                  setDetailFeedback("Report duplicated as a follow-up draft.");
                }}><Files size={14} /> Duplicate</button>
                <button type="button" className="danger" onClick={() => {
                  setDetailFeedback("Report escalated for supervisory attention.");
                  onEscalateReport("Report", selectedReport.name, `${selectedReport.due} report requires supervisory attention`, selectedReport.owner, selectedReport.due === "Overdue" ? "Critical" : "Medium");
                }}><AlertTriangle size={14} /> Escalate</button>
              </div>
              {detailFeedback && <div className="compose-feedback">{detailFeedback}</div>}
            </div>
          )}

          <div className="report-card">
            <div className="report-card-title">
              <div><span>Work queue</span><h3>Report Inbox</h3></div>
              <small>{visibleReports.length} reports</small>
            </div>
            <label className="report-template-select">
              <span>Status</span>
              <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
                {stateOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <div className="report-inbox-list">
              {visibleReports.map((report) => (
                <button key={report.id} className={selectedReport?.id === report.id ? "active" : ""} onClick={() => setSelectedReportId(report.id)}>
                  <div>
                    <strong>{report.name}</strong>
                    <span>{report.type ?? "Administrative"} - {report.due}</span>
                  </div>
                  <StatusPill status={report.state} />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Approvals({
  approvals,
  station,
  permissions,
  onCreateApproval,
  onApprove,
  onUpdateRoute,
  onSign,
  onReject,
  onUpdateLimit,
  onDelegate,
  onHold,
  onReleaseHold,
  onExecute,
  onWatch,
  onDuplicate,
  onArchive,
  onBulkSign,
  onEscalateApproval,
  onBulkApprove,
  onBulkReject,
  onRefreshDigest,
  digest
}: {
  approvals: Approval[];
  station: StationCard;
  permissions: Permissions;
  onCreateApproval: (draft: Omit<Approval, "id" | "state" | "signatures">) => void;
  onApprove: (id: string) => void;
  onUpdateRoute: (id: string, route: string) => void;
  onSign: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateLimit: (id: string) => void;
  onDelegate: (id: string) => void;
  onHold: (id: string) => void;
  onReleaseHold: (id: string) => void;
  onExecute: (id: string) => void;
  onWatch: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onBulkSign: (ids: string[]) => void;
  onEscalateApproval: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
  onBulkApprove: (ids: string[]) => void;
  onBulkReject: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: ApprovalDigest | null;
}) {
  const [request, setRequest] = React.useState("Mission outreach budget release");
  const [route, setRoute] = React.useState(`${station.level} -> Delegated Authority`);
  const [limit, setLimit] = React.useState("$5,000");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setRoute(`${station.level} -> Delegated Authority`);
  }, [station.level]);
  const openCount = approvals.filter((approval) => approval.state !== "Approved" && approval.state !== "Rejected").length;
  const heldCount = approvals.filter((approval) => approval.state === "On Hold").length;
  const delegatedCount = approvals.filter((approval) => approval.state === "Delegated").length;
  const watchedCount = approvals.filter((approval) => approval.watchers?.length).length;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateApproval({ request, route, limit });
    setFeedback(`${request} has entered validation.`);
    setRequest("New authorization request");
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={Workflow} title="Approval and Delegation Engine" action="Rule check" />
        {!permissions.canApprove && (
          <div className="permission-warning">
            <LockKeyhole size={16} />
            <span>This station can prepare requests, but delegated approval authority is not active.</span>
          </div>
        )}
        <div className="archive-toolbar">
          <button disabled={!permissions.canApprove} type="button" onClick={() => onBulkApprove(approvals.filter((approval) => approval.state !== "Approved").map((approval) => approval.id))}><CheckCircle2 size={14} /> Approve open</button>
          <button disabled={!permissions.canApprove} type="button" onClick={() => onBulkReject(approvals.filter((approval) => approval.state !== "Approved").map((approval) => approval.id))}><AlertTriangle size={14} /> Reject open</button>
          <button disabled={!permissions.canApprove} type="button" onClick={() => onBulkSign(approvals.filter((approval) => approval.state !== "Approved" && approval.state !== "Rejected").map((approval) => approval.id))}><Signature size={14} /> Sign open</button>
          <button type="button" onClick={onRefreshDigest}><RefreshCw size={14} /> Digest</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Open" value={String(digest?.open ?? openCount)} />
          <Insight label="Delegated" value={String(digest?.delegated ?? delegatedCount)} />
          <Insight label="Held" value={String(digest?.held ?? heldCount)} />
          <Insight label="Signed" value={String(digest?.signed ?? approvals.filter((approval) => approval.signatures !== "0/2").length)} />
          <Insight label="Watched" value={String(digest?.watched ?? watchedCount)} />
          <Insight label="Archived" value={String(digest?.archived ?? approvals.filter((approval) => approval.archived).length)} />
          <Insight label="Executed" value={String(digest?.executed ?? approvals.filter((approval) => approval.executionStatus === "Executed").length)} />
          <Insight label="Linked" value={String(digest?.linked ?? approvals.filter((approval) => approval.linkedReport || approval.linkedTask).length)} />
          <Insight label="Next approval" value={digest?.nextApproval ?? approvals[0]?.request ?? "None"} />
        </div>
        <div className="approval-board">
          {approvals.map((approval) => (
            <article className="approval-lane" key={approval.request}>
              <StatusPill status={approval.state} />
              <h2>{approval.request}</h2>
              <span>{approval.route}</span>
              <div className="approval-meta">
                <small>{approval.limit}</small>
                <small>{approval.signatures} signatures</small>
                <small>{approval.delegate ?? "No delegate"}</small>
                <small>{approval.watchers?.length ?? 0} watchers</small>
                <small>{approval.executionStatus ?? "Not executed"}</small>
                <small>{approval.linkedReport ? "Report linked" : "No report link"}</small>
              </div>
              <div className="action-row">
                <button
                  aria-label={`Approve ${approval.request}`}
                  disabled={!permissions.canApprove}
                  onClick={() => onApprove(approval.id)}
                >
                  <CheckCircle2 size={15} /> Approve
                </button>
                <button
                  aria-label={`Sign ${approval.request}`}
                  disabled={!permissions.canApprove || approval.state === "Approved" || approval.state === "Rejected"}
                  onClick={() => onSign(approval.id)}
                >
                  <Signature size={15} /> Sign
                </button>
                <button
                  aria-label={`Route ${approval.request}`}
                  disabled={!permissions.canApprove}
                  onClick={() => onUpdateRoute(approval.id, `${station.level} -> Executive Review`)}
                >
                  <GitBranch size={15} /> Route
                </button>
                <button disabled={!permissions.canApprove} onClick={() => onUpdateLimit(approval.id)}><Landmark size={15} /> Limit</button>
                <button disabled={!permissions.canApprove} onClick={() => onDelegate(approval.id)}><Users size={15} /> Delegate</button>
                <button disabled={!permissions.canApprove} onClick={() => onHold(approval.id)}><LockKeyhole size={15} /> Hold</button>
                <button disabled={!permissions.canApprove} onClick={() => onReleaseHold(approval.id)}><TimerReset size={15} /> Release</button>
                <button disabled={!permissions.canApprove} onClick={() => onExecute(approval.id)}><FileCheck2 size={15} /> Execute</button>
                <button onClick={() => onWatch(approval.id)}><Bell size={15} /> Watch</button>
                <button disabled={!permissions.canApprove} onClick={() => onDuplicate(approval.id)}><Files size={15} /> Duplicate</button>
                <button disabled={!permissions.canApprove} onClick={() => onArchive(approval.id)}><FileClock size={15} /> Archive</button>
                <button
                  aria-label={`Reject ${approval.request}`}
                  disabled={!permissions.canApprove}
                  onClick={() => onReject(approval.id)}
                >
                  <AlertTriangle size={15} /> Reject
                </button>
                <button
                  aria-label={`Escalate ${approval.request}`}
                  onClick={() => onEscalateApproval("Approval", approval.request, `${approval.state} approval needs routing review`, approval.route, approval.state === "Escalated" ? "Critical" : "High")}
                >
                  <AlertTriangle size={15} /> Escalate
                </button>
              </div>
              <div className="pipeline mini">
                {["Request", "Validation", "Delegation", "Approval", "Execute", "Audit"].map((step) => (
                  <div className="pipeline-step" key={step}>{step}</div>
                ))}
              </div>
              {approval.auditTrail?.length ? <p className="approval-trail">{approval.auditTrail.at(-1)}</p> : null}
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Create Approval" action="Request" />
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Request</span>
            <input value={request} onChange={(event) => setRequest(event.target.value)} />
          </label>
          <label>
            <span>Approval route</span>
            <input value={route} onChange={(event) => setRoute(event.target.value)} />
          </label>
          <label>
            <span>Authority limit</span>
            <input value={limit} onChange={(event) => setLimit(event.target.value)} />
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button type="submit"><Plus size={15} /> Create approval</button>
        </form>
      </div>
      <WorkflowPanel />
    </section>
  );
}

function Tasks({
  tasks,
  station,
  offlineMode,
  onCreateTask,
  onAdvanceTask,
  onUpdateTaskAssignee,
  onUpdateTaskPriority,
  onUpdateTaskDue,
  onUpdateTaskOwner,
  onBlockTask,
  onUnblockTask,
  onWatchTask,
  onAddDependency,
  onRequestApproval,
  onUpdateSla,
  onAttachEvidence,
  onHandoffTask,
  onEscalateOperation,
  onCommentTask,
  onCheckpointTask,
  onDuplicateTask,
  onBulkCompleteTasks,
  onBulkEscalateTasks,
  onScheduleTask,
  onDispatchTask,
  onLogTime,
  onQaReview,
  onAcceptRisk,
  onSaveTemplate,
  onLinkReport,
  onLinkApproval,
  onArchiveTask,
  onBulkScheduleTasks,
  onRefreshDigest,
  digest,
  onEscalateTask
}: {
  tasks: GovernanceTask[];
  station: StationCard;
  offlineMode: boolean;
  onCreateTask: (task: Omit<GovernanceTask, "id" | "status">) => void;
  onAdvanceTask: (id: string, status: GovernanceTask["status"]) => void;
  onUpdateTaskAssignee: (id: string, assignee: string) => void;
  onUpdateTaskPriority: (id: string, priority: GovernanceTask["priority"]) => void;
  onUpdateTaskDue: (id: string) => void;
  onUpdateTaskOwner: (id: string) => void;
  onBlockTask: (id: string) => void;
  onUnblockTask: (id: string) => void;
  onWatchTask: (id: string) => void;
  onAddDependency: (id: string) => void;
  onRequestApproval: (id: string) => void;
  onUpdateSla: (id: string) => void;
  onAttachEvidence: (id: string) => void;
  onHandoffTask: (id: string) => void;
  onEscalateOperation: (id: string) => void;
  onCommentTask: (id: string) => void;
  onCheckpointTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onBulkCompleteTasks: (ids: string[]) => void;
  onBulkEscalateTasks: (ids: string[]) => void;
  onScheduleTask: (id: string) => void;
  onDispatchTask: (id: string) => void;
  onLogTime: (id: string) => void;
  onQaReview: (id: string) => void;
  onAcceptRisk: (id: string) => void;
  onSaveTemplate: (id: string) => void;
  onLinkReport: (id: string) => void;
  onLinkApproval: (id: string) => void;
  onArchiveTask: (id: string) => void;
  onBulkScheduleTasks: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: TaskDigest | null;
  onEscalateTask: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
}) {
  const [title, setTitle] = React.useState("Follow up on branch reporting corrections");
  const [owner, setOwner] = React.useState(String(station.level));
  const [assignee, setAssignee] = React.useState(station.email);
  const [priority, setPriority] = React.useState<GovernanceTask["priority"]>("High");
  const [due, setDue] = React.useState("Today");
  const [statusFilter, setStatusFilter] = React.useState<GovernanceTask["status"] | "All statuses">("All statuses");
  const [priorityFilter, setPriorityFilter] = React.useState<GovernanceTask["priority"] | "All priorities">("All priorities");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setOwner(String(station.level));
    setAssignee(station.email);
  }, [station.email, station.level]);

  const visibleTasks = React.useMemo(() => (
    tasks.filter((task) => (
      !task.archived
      &&
      (statusFilter === "All statuses" || task.status === statusFilter)
      && (priorityFilter === "All priorities" || task.priority === priorityFilter)
    ))
  ), [priorityFilter, statusFilter, tasks]);
  const activeTasks = tasks.filter((task) => !task.archived);
  const blockedCount = activeTasks.filter((task) => task.status === "Blocked").length;
  const completeCount = activeTasks.filter((task) => task.status === "Complete").length;
  const criticalCount = activeTasks.filter((task) => task.priority === "Critical" && task.status !== "Complete").length;
  const watchedCount = activeTasks.filter((task) => task.watchers?.length).length;
  const escalatedCount = activeTasks.filter((task) => task.escalated).length;
  const dependencyCount = activeTasks.filter((task) => task.dependencies?.length).length;
  const approvalCount = activeTasks.filter((task) => task.approvalRequired).length;
  const evidenceCount = activeTasks.filter((task) => task.evidence).length;
  const slaBreachCount = activeTasks.filter((task) => task.slaStatus === "Breached" || task.due === "Overdue").length;
  const scheduledCount = activeTasks.filter((task) => task.scheduledFor).length;
  const dispatchedCount = activeTasks.filter((task) => task.dispatchTeam).length;
  const qaPassedCount = activeTasks.filter((task) => task.qaStatus === "Passed").length;
  const riskAcceptedCount = activeTasks.filter((task) => task.riskAccepted).length;
  const templateCount = activeTasks.filter((task) => task.templateSaved).length;
  const linkedCount = activeTasks.filter((task) => task.linkedReport || task.linkedApproval).length;
  const archivedCount = tasks.filter((task) => task.archived).length;
  const completionRate = activeTasks.length ? Math.round((completeCount / activeTasks.length) * 100) : 100;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateTask({ title, owner, assignee, priority, due });
    setFeedback(offlineMode ? "Task queued locally for sync." : "Task assigned into the governance queue.");
    setTitle("New administrative task");
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={SquareCheckBig} title="Station Task Center" action={`${visibleTasks.length} visible`} />
        <div className="office-summary-grid">
          <Insight label="Completion" value={`${completionRate}%`} />
          <Insight label="Open" value={String(digest?.open ?? tasks.length - completeCount)} />
          <Insight label="Blocked" value={String(digest?.blocked ?? blockedCount)} />
          <Insight label="Critical" value={String(digest?.critical ?? criticalCount)} />
          <Insight label="Watched" value={String(digest?.watched ?? watchedCount)} />
          <Insight label="Escalated" value={String(digest?.escalated ?? escalatedCount)} />
          <Insight label="Dependencies" value={String(digest?.dependencies ?? dependencyCount)} />
          <Insight label="Approvals" value={String(digest?.approvals ?? approvalCount)} />
          <Insight label="Evidence" value={String(digest?.evidence ?? evidenceCount)} />
          <Insight label="SLA breaches" value={String(digest?.slaBreaches ?? slaBreachCount)} />
          <Insight label="Scheduled" value={String(digest?.scheduled ?? scheduledCount)} />
          <Insight label="Dispatched" value={String(digest?.dispatched ?? dispatchedCount)} />
          <Insight label="QA passed" value={String(digest?.qaPassed ?? qaPassedCount)} />
          <Insight label="Risk accepted" value={String(digest?.riskAccepted ?? riskAcceptedCount)} />
          <Insight label="Templates" value={String(digest?.templates ?? templateCount)} />
          <Insight label="Linked" value={String(digest?.linked ?? linkedCount)} />
          <Insight label="Archived" value={String(digest?.archived ?? archivedCount)} />
          <Insight label="Next task" value={digest?.nextTask ?? visibleTasks[0]?.title ?? "None"} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as GovernanceTask["status"] | "All statuses")}>
              {["All statuses", "Queued", "In Progress", "Blocked", "Complete"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as GovernanceTask["priority"] | "All priorities")}>
              {["All priorities", "Low", "Medium", "High", "Critical"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button onClick={onRefreshDigest}><RefreshCw size={15} /> Digest</button>
          <button disabled={!visibleTasks.length} onClick={() => onBulkCompleteTasks(visibleTasks.slice(0, 3).map((task) => task.id))}><CheckCircle2 size={15} /> Bulk complete</button>
          <button disabled={!visibleTasks.length} onClick={() => onBulkEscalateTasks(visibleTasks.slice(0, 3).map((task) => task.id))}><AlertTriangle size={15} /> Bulk escalate</button>
          <button disabled={!visibleTasks.length} onClick={() => onBulkScheduleTasks(visibleTasks.slice(0, 3).map((task) => task.id))}><CalendarDays size={15} /> Bulk schedule</button>
        </div>
        <div className="task-board">
          {visibleTasks.map((task) => (
            <article className="task-card" key={task.id}>
              <div className="task-head">
                <StatusPill status={task.status} />
                <span className={`severity ${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>
              <h2>{task.title}</h2>
              <p>{task.owner} assigned this item to {task.assignee}. Due status: {task.due}.</p>
              <div className="approval-meta">
                <small>{task.sla ?? "No SLA"} {task.slaStatus ? `- ${task.slaStatus}` : ""}</small>
                <small>{task.dependencies?.length ?? 0} dependencies</small>
                <small>{task.approvalRequired ? task.approvalRoute ?? "Approval required" : "No approval gate"}</small>
                <small>{task.evidence ?? "No evidence"}</small>
                <small>{task.comments?.length ?? 0} comments - {task.checkpoints?.length ?? 0} checkpoints</small>
                <small>{task.scheduledFor ? `Scheduled ${task.scheduledFor}` : "Unscheduled"}</small>
                <small>{task.dispatchTeam ? `${task.dispatchTeam} - ${task.dispatchLocation ?? "No location"}` : "No dispatch"}</small>
                <small>{task.timeHours ? `${task.timeHours}h logged` : "No time logged"}</small>
                <small>{task.qaStatus ? `QA ${task.qaStatus}` : "QA pending"}</small>
                <small>{task.riskAccepted ? "Risk accepted" : "No risk acceptance"}</small>
                <small>{task.templateName ?? "No template"}</small>
                <small>{task.linkedReport ? `Report ${task.linkedReport}` : "No linked report"}</small>
                <small>{task.linkedApproval ? `Approval ${task.linkedApproval}` : "No linked approval"}</small>
              </div>
              <div className="action-row">
                <button onClick={() => onAdvanceTask(task.id, "In Progress")}><TimerReset size={15} /> Start</button>
                <button onClick={() => onAdvanceTask(task.id, "Complete")}><CheckCircle2 size={15} /> Complete</button>
                <button onClick={() => onScheduleTask(task.id)}><CalendarDays size={15} /> Schedule</button>
                <button onClick={() => onDispatchTask(task.id)}><RadioTower size={15} /> Dispatch</button>
                <button onClick={() => onLogTime(task.id)}><TimerReset size={15} /> Time</button>
                <button onClick={() => onQaReview(task.id)}><ShieldCheck size={15} /> QA</button>
                <button onClick={() => onAcceptRisk(task.id)}><AlertTriangle size={15} /> Risk</button>
                <button onClick={() => onSaveTemplate(task.id)}><Files size={15} /> Template</button>
                <button onClick={() => onLinkReport(task.id)}><FileCheck2 size={15} /> Report</button>
                <button onClick={() => onLinkApproval(task.id)}><Signature size={15} /> Approval link</button>
                <button onClick={() => onBlockTask(task.id)}><LockKeyhole size={15} /> Block</button>
                <button onClick={() => onUnblockTask(task.id)}><CheckCircle2 size={15} /> Unblock</button>
                <button onClick={() => onUpdateTaskDue(task.id)}><CalendarDays size={15} /> Due</button>
                <button onClick={() => onUpdateTaskAssignee(task.id, station.email)}><Users size={15} /> Assign</button>
                <button onClick={() => onUpdateTaskOwner(task.id)}><Landmark size={15} /> Owner</button>
                <button onClick={() => onUpdateTaskPriority(task.id, task.priority === "Critical" ? "High" : "Critical")}><AlertTriangle size={15} /> Priority</button>
                <button onClick={() => onAddDependency(task.id)}><GitBranch size={15} /> Dependency</button>
                <button onClick={() => onRequestApproval(task.id)}><Signature size={15} /> Approval</button>
                <button onClick={() => onUpdateSla(task.id)}><TimerReset size={15} /> SLA</button>
                <button onClick={() => onAttachEvidence(task.id)}><Files size={15} /> Evidence</button>
                <button onClick={() => onHandoffTask(task.id)}><Users size={15} /> Handoff</button>
                <button onClick={() => onCommentTask(task.id)}><MessageSquareText size={15} /> Comment</button>
                <button onClick={() => onCheckpointTask(task.id)}><FileCheck2 size={15} /> Checkpoint</button>
                <button onClick={() => onWatchTask(task.id)}><Bell size={15} /> Watch</button>
                <button onClick={() => onDuplicateTask(task.id)}><Files size={15} /> Duplicate</button>
                <button onClick={() => onEscalateOperation(task.id)}><RadioTower size={15} /> Ops escalate</button>
                <button onClick={() => onEscalateTask("Task", task.title, `${task.due} task is ${task.status.toLowerCase()}`, task.owner, task.priority === "Critical" ? "Critical" : "High")}>
                  <AlertTriangle size={15} /> Escalate
                </button>
                <button onClick={() => onArchiveTask(task.id)}><ArchiveIcon size={15} /> Archive</button>
              </div>
            </article>
          ))}
          {visibleTasks.length === 0 && <div className="empty-state">No tasks match the current status filter.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Assign Task" action={offlineMode ? "Queue" : "Create"} />
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Task title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>Owner</span>
            <input value={owner} onChange={(event) => setOwner(event.target.value)} />
          </label>
          <label>
            <span>Assignee</span>
            <input value={assignee} onChange={(event) => setAssignee(event.target.value)} />
          </label>
          <label>
            <span>Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as GovernanceTask["priority"])}>
              {["Low", "Medium", "High", "Critical"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Due</span>
            <select value={due} onChange={(event) => setDue(event.target.value)}>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This week</option>
              <option>Overdue</option>
            </select>
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button type="submit"><Plus size={15} /> Assign task</button>
        </form>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Workflow} title="Task Workflow" action="Traceable" />
        {["Queued", "In Progress", "Blocked", "Complete"].map((step) => (
          <div className="control-row" key={step}>
            <SquareCheckBig size={16} />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Policies({
  policies,
  station,
  permissions,
  offlineMode,
  onCreatePolicy,
  onAcknowledgePolicy,
  onUpdatePolicyStatus,
  onRetirePolicy,
  onUpdatePolicyOwner,
  onUpdatePolicyCategory,
  onUpdatePolicySummary,
  onBumpPolicyVersion,
  onSchedulePolicyReview,
  onWatchPolicy,
  onDuplicatePolicy,
  onBulkActivatePolicies,
  onCheckCompliance,
  onBindEvidence,
  onDistributePolicy,
  onGrantException,
  onAssignTraining,
  onHoldPolicy,
  onLinkTask,
  onLinkApproval,
  onArchivePolicy,
  onBulkReviewPolicies,
  onRefreshDigest,
  digest
}: {
  policies: Policy[];
  station: StationCard;
  permissions: Permissions;
  offlineMode: boolean;
  onCreatePolicy: (policy: Omit<Policy, "id" | "acknowledgements">) => void;
  onAcknowledgePolicy: (id: string) => void;
  onUpdatePolicyStatus: (id: string, status: Policy["status"]) => void;
  onRetirePolicy: (id: string) => void;
  onUpdatePolicyOwner: (id: string) => void;
  onUpdatePolicyCategory: (id: string) => void;
  onUpdatePolicySummary: (id: string) => void;
  onBumpPolicyVersion: (id: string) => void;
  onSchedulePolicyReview: (id: string) => void;
  onWatchPolicy: (id: string) => void;
  onDuplicatePolicy: (id: string) => void;
  onBulkActivatePolicies: (ids: string[]) => void;
  onCheckCompliance: (id: string) => void;
  onBindEvidence: (id: string) => void;
  onDistributePolicy: (id: string) => void;
  onGrantException: (id: string) => void;
  onAssignTraining: (id: string) => void;
  onHoldPolicy: (id: string) => void;
  onLinkTask: (id: string) => void;
  onLinkApproval: (id: string) => void;
  onArchivePolicy: (id: string) => void;
  onBulkReviewPolicies: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: PolicyDigest | null;
}) {
  const [title, setTitle] = React.useState("Branch reporting compliance policy");
  const [category, setCategory] = React.useState("Reports");
  const [owner, setOwner] = React.useState(String(station.level));
  const [status, setStatus] = React.useState<Policy["status"]>("Draft");
  const [summary, setSummary] = React.useState("Local branch reports must include evidence packets before upward submission.");
  const [categoryFilter, setCategoryFilter] = React.useState("All categories");
  const [statusFilter, setStatusFilter] = React.useState<Policy["status"] | "All statuses">("All statuses");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setOwner(String(station.level));
  }, [station.level]);

  const categoryOptions = React.useMemo(() => ["All categories", ...Array.from(new Set(policies.map((policy) => policy.category))).sort()], [policies]);
  const visiblePolicies = React.useMemo(() => (
    policies.filter((policy) => (
      !policy.archived
      &&
      (categoryFilter === "All categories" || policy.category === categoryFilter)
      && (statusFilter === "All statuses" || policy.status === statusFilter)
    ))
  ), [categoryFilter, policies, statusFilter]);
  const activePolicies = policies.filter((policy) => !policy.archived);
  const activeCount = activePolicies.filter((policy) => policy.status === "Active").length;
  const reviewCount = activePolicies.filter((policy) => policy.status === "Review").length;
  const draftCount = activePolicies.filter((policy) => policy.status === "Draft").length;
  const watchedCount = activePolicies.filter((policy) => policy.watchers?.length).length;
  const compliantCount = activePolicies.filter((policy) => policy.complianceStatus === "Compliant").length;
  const evidenceCount = activePolicies.filter((policy) => policy.evidence).length;
  const distributedCount = activePolicies.filter((policy) => policy.distributedTo).length;
  const exceptionCount = activePolicies.filter((policy) => policy.exceptionNote).length;
  const trainingCount = activePolicies.filter((policy) => policy.trainingAssigned).length;
  const holdCount = activePolicies.filter((policy) => policy.hold).length;
  const linkedCount = activePolicies.filter((policy) => policy.linkedTask || policy.linkedApproval).length;
  const archivedCount = policies.filter((policy) => policy.archived).length;
  const acknowledgementTotal = activePolicies.reduce((total, policy) => total + policy.acknowledgements, 0);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreatePolicy({ title, category, owner, status, summary });
    setFeedback(offlineMode ? "Policy draft queued locally." : "Policy registered and audit logged.");
    setTitle("New governance policy");
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={ScrollText} title="Policy Registry" action={`${visiblePolicies.length} visible`} />
        <div className="office-summary-grid">
          <Insight label="Active policies" value={String(digest?.active ?? activeCount)} />
          <Insight label="Review" value={String(digest?.review ?? reviewCount)} />
          <Insight label="Draft" value={String(digest?.draft ?? draftCount)} />
          <Insight label="Watched" value={String(digest?.watched ?? watchedCount)} />
          <Insight label="Acknowledgements" value={String(digest?.acknowledgements ?? acknowledgementTotal)} />
          <Insight label="Compliant" value={String(digest?.compliant ?? compliantCount)} />
          <Insight label="Evidence" value={String(digest?.evidence ?? evidenceCount)} />
          <Insight label="Distributed" value={String(digest?.distributed ?? distributedCount)} />
          <Insight label="Exceptions" value={String(digest?.exceptions ?? exceptionCount)} />
          <Insight label="Training" value={String(digest?.training ?? trainingCount)} />
          <Insight label="Holds" value={String(digest?.holds ?? holdCount)} />
          <Insight label="Linked" value={String(digest?.linked ?? linkedCount)} />
          <Insight label="Archived" value={String(digest?.archived ?? archivedCount)} />
          <Insight label="Next policy" value={digest?.nextPolicy ?? visiblePolicies[0]?.title ?? "None"} />
          <Insight label="Authority" value={permissions.canApprove ? "Publisher" : "Reader"} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Policy["status"] | "All statuses")}>
              {["All statuses", "Draft", "Active", "Review", "Retired"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button onClick={onRefreshDigest}><RefreshCw size={15} /> Digest</button>
          <button disabled={!permissions.canApprove || !visiblePolicies.length} onClick={() => onBulkActivatePolicies(visiblePolicies.slice(0, 3).map((policy) => policy.id))}><CheckCircle2 size={15} /> Bulk active</button>
          <button disabled={!permissions.canApprove || !visiblePolicies.length} onClick={() => onBulkReviewPolicies(visiblePolicies.slice(0, 3).map((policy) => policy.id))}><ClipboardCheck size={15} /> Bulk review</button>
        </div>
        <div className="policy-list">
          {visiblePolicies.map((policy) => (
            <article className="policy-card" key={policy.id}>
              <div className="task-head">
                <StatusPill status={policy.status} />
                <span>{policy.category}</span>
              </div>
              <h2>{policy.title}</h2>
              <p>{policy.summary}</p>
              <div className="approval-meta">
                <small>{policy.owner}</small>
                <small>{policy.acknowledgements} acknowledgements</small>
                <small>{policy.version ?? "v1"}</small>
                <small>{policy.watchers?.length ?? 0} watchers</small>
                <small>{policy.complianceStatus ? `${policy.complianceStatus} ${policy.complianceScore ?? ""}` : "Compliance pending"}</small>
                <small>{policy.evidence ?? "No evidence"}</small>
                <small>{policy.distributedTo ? `Distributed to ${policy.distributedTo}` : "Not distributed"}</small>
                <small>{policy.exceptionNote ? `Exception: ${policy.exceptionExpires ?? "Open"}` : "No exception"}</small>
                <small>{policy.trainingAssigned ? `Training ${policy.trainingAudience}` : "No training"}</small>
                <small>{policy.hold ? policy.holdReason ?? "Hold applied" : "No hold"}</small>
                <small>{policy.linkedTask ? `Task ${policy.linkedTask}` : "No linked task"}</small>
                <small>{policy.linkedApproval ? `Approval ${policy.linkedApproval}` : "No linked approval"}</small>
              </div>
              <div className="action-row">
                <button onClick={() => onAcknowledgePolicy(policy.id)}><CheckCircle2 size={15} /> Acknowledge</button>
                <button disabled={!permissions.canApprove} onClick={() => onCheckCompliance(policy.id)}><ClipboardCheck size={15} /> Compliance</button>
                <button disabled={!permissions.canApprove} onClick={() => onBindEvidence(policy.id)}><Files size={15} /> Evidence</button>
                <button disabled={!permissions.canApprove} onClick={() => onDistributePolicy(policy.id)}><Send size={15} /> Distribute</button>
                <button disabled={!permissions.canApprove} onClick={() => onGrantException(policy.id)}><AlertTriangle size={15} /> Exception</button>
                <button disabled={!permissions.canApprove} onClick={() => onAssignTraining(policy.id)}><Users size={15} /> Training</button>
                <button disabled={!permissions.canApprove} onClick={() => onHoldPolicy(policy.id)}><LockKeyhole size={15} /> Hold</button>
                <button disabled={!permissions.canApprove} onClick={() => onLinkTask(policy.id)}><SquareCheckBig size={15} /> Task link</button>
                <button disabled={!permissions.canApprove} onClick={() => onLinkApproval(policy.id)}><Signature size={15} /> Approval link</button>
                <button disabled={!permissions.canApprove} onClick={() => onUpdatePolicyStatus(policy.id, policy.status === "Active" ? "Review" : "Active")}><ShieldCheck size={15} /> Status</button>
                <button disabled={!permissions.canApprove} onClick={() => onBumpPolicyVersion(policy.id)}><FileClock size={15} /> Version</button>
                <button disabled={!permissions.canApprove} onClick={() => onSchedulePolicyReview(policy.id)}><TimerReset size={15} /> Review</button>
                <button disabled={!permissions.canApprove} onClick={() => onUpdatePolicyOwner(policy.id)}><Landmark size={15} /> Owner</button>
                <button disabled={!permissions.canApprove} onClick={() => onUpdatePolicyCategory(policy.id)}><ScrollText size={15} /> Category</button>
                <button disabled={!permissions.canApprove} onClick={() => onUpdatePolicySummary(policy.id)}><MessageSquareText size={15} /> Summary</button>
                <button onClick={() => onWatchPolicy(policy.id)}><Bell size={15} /> Watch</button>
                <button disabled={!permissions.canApprove} onClick={() => onDuplicatePolicy(policy.id)}><Files size={15} /> Duplicate</button>
                <button disabled={!permissions.canApprove} onClick={() => onRetirePolicy(policy.id)}><FileClock size={15} /> Retire</button>
                <button disabled={!permissions.canApprove} onClick={() => onArchivePolicy(policy.id)}><ArchiveIcon size={15} /> Archive</button>
              </div>
            </article>
          ))}
          {visiblePolicies.length === 0 && <div className="empty-state">No policies match the current category.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Publish Policy" action={offlineMode ? "Queue" : "Registry"} />
        {!permissions.canApprove && (
          <div className="permission-warning">
            <LockKeyhole size={16} />
            <span>This station can acknowledge policies, but publishing requires delegated approval authority.</span>
          </div>
        )}
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Policy title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>Category</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} />
          </label>
          <label>
            <span>Owner</span>
            <input value={owner} onChange={(event) => setOwner(event.target.value)} />
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as Policy["status"])}>
              {["Draft", "Active", "Review", "Retired"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Summary</span>
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button disabled={!permissions.canApprove} type="submit"><Plus size={15} /> Publish policy</button>
        </form>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={ShieldCheck} title="Policy Controls" action="Traceable" />
        {["Versioned registry", "Station acknowledgement", "Authority-gated publishing", "Immutable audit record"].map((control) => (
          <div className="control-row" key={control}>
            <ShieldCheck size={16} />
            <span>{control}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GovernanceCalendar({
  calendarEvents,
  station,
  offlineMode,
  onCreateCalendarEvent,
  onCompleteCalendarEvent,
  onUpdateCalendarEventDate,
  onUpdateCalendarEventPriority,
  onMarkCalendarEventAtRisk,
  onUpdateCalendarEventOwner,
  onUpdateCalendarEventCategory,
  onRescheduleCalendarEvent,
  onWatchCalendarEvent,
  onDuplicateCalendarEvent,
  onBulkCompleteCalendarEvents,
  onCheckInEvent,
  onUpdateVenue,
  onAttachAgenda,
  onLogAttendance,
  onSendReminder,
  onMarkReadiness,
  onLinkTask,
  onLinkReport,
  onArchiveEvent,
  onBulkRescheduleEvents,
  onRefreshDigest,
  digest,
  onEscalateCalendarEvent
}: {
  calendarEvents: CalendarEvent[];
  station: StationCard;
  offlineMode: boolean;
  onCreateCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  onCompleteCalendarEvent: (id: string) => void;
  onUpdateCalendarEventDate: (id: string, date: string) => void;
  onUpdateCalendarEventPriority: (id: string, priority: CalendarEvent["priority"]) => void;
  onMarkCalendarEventAtRisk: (id: string) => void;
  onUpdateCalendarEventOwner: (id: string) => void;
  onUpdateCalendarEventCategory: (id: string) => void;
  onRescheduleCalendarEvent: (id: string) => void;
  onWatchCalendarEvent: (id: string) => void;
  onDuplicateCalendarEvent: (id: string) => void;
  onBulkCompleteCalendarEvents: (ids: string[]) => void;
  onCheckInEvent: (id: string) => void;
  onUpdateVenue: (id: string) => void;
  onAttachAgenda: (id: string) => void;
  onLogAttendance: (id: string) => void;
  onSendReminder: (id: string) => void;
  onMarkReadiness: (id: string) => void;
  onLinkTask: (id: string) => void;
  onLinkReport: (id: string) => void;
  onArchiveEvent: (id: string) => void;
  onBulkRescheduleEvents: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: CalendarDigest | null;
  onEscalateCalendarEvent: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
}) {
  const [title, setTitle] = React.useState("Monthly compliance review");
  const [category, setCategory] = React.useState("Review");
  const [owner, setOwner] = React.useState(String(station.level));
  const [date, setDate] = React.useState("2026-05-24");
  const [priority, setPriority] = React.useState<CalendarEvent["priority"]>("High");
  const [status, setStatus] = React.useState<CalendarEvent["status"]>("Scheduled");
  const [categoryFilter, setCategoryFilter] = React.useState("All categories");
  const [statusFilter, setStatusFilter] = React.useState<CalendarEvent["status"] | "All statuses">("All statuses");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setOwner(String(station.level));
  }, [station.level]);

  const categoryOptions = React.useMemo(() => ["All categories", ...Array.from(new Set(calendarEvents.map((event) => event.category))).sort()], [calendarEvents]);
  const visibleEvents = React.useMemo(() => (
    calendarEvents.filter((event) => (
      !event.archived
      &&
      (categoryFilter === "All categories" || event.category === categoryFilter)
      && (statusFilter === "All statuses" || event.status === statusFilter)
    ))
  ), [calendarEvents, categoryFilter, statusFilter]);
  const activeEvents = calendarEvents.filter((event) => !event.archived);
  const atRiskCount = activeEvents.filter((event) => event.status === "At Risk").length;
  const scheduledCount = activeEvents.filter((event) => event.status === "Scheduled").length;
  const completeCount = activeEvents.filter((event) => event.status === "Complete").length;
  const criticalCount = activeEvents.filter((event) => event.priority === "Critical" && event.status !== "Complete").length;
  const watchedCount = activeEvents.filter((event) => event.watchers?.length).length;
  const checkedInCount = activeEvents.filter((event) => event.checkInStatus).length;
  const venueCount = activeEvents.filter((event) => event.venue).length;
  const agendaCount = activeEvents.filter((event) => event.agenda).length;
  const attendanceCount = activeEvents.filter((event) => event.attendance !== undefined).length;
  const reminderCount = activeEvents.filter((event) => event.reminderSent).length;
  const readyCount = activeEvents.filter((event) => event.readiness === "Ready").length;
  const linkedCount = activeEvents.filter((event) => event.linkedTask || event.linkedReport).length;
  const archivedCount = calendarEvents.filter((event) => event.archived).length;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateCalendarEvent({ title, category, owner, date, priority, status });
    setFeedback(offlineMode ? "Calendar item queued locally." : "Calendar item scheduled and audit logged.");
    setTitle("New governance calendar item");
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={CalendarDays} title="Governance Calendar" action={`${visibleEvents.length} visible`} />
        <div className="office-summary-grid">
          <Insight label="Scheduled" value={String(digest?.scheduled ?? scheduledCount)} />
          <Insight label="At risk" value={String(digest?.atRisk ?? atRiskCount)} />
          <Insight label="Complete" value={String(digest?.complete ?? completeCount)} />
          <Insight label="Critical" value={String(digest?.critical ?? criticalCount)} />
          <Insight label="Watched" value={String(digest?.watched ?? watchedCount)} />
          <Insight label="Checked in" value={String(digest?.checkedIn ?? checkedInCount)} />
          <Insight label="Venues" value={String(digest?.venues ?? venueCount)} />
          <Insight label="Agendas" value={String(digest?.agendas ?? agendaCount)} />
          <Insight label="Attendance" value={String(digest?.attendance ?? attendanceCount)} />
          <Insight label="Reminders" value={String(digest?.reminders ?? reminderCount)} />
          <Insight label="Ready" value={String(digest?.ready ?? readyCount)} />
          <Insight label="Linked" value={String(digest?.linked ?? linkedCount)} />
          <Insight label="Archived" value={String(digest?.archived ?? archivedCount)} />
          <Insight label="Next event" value={digest?.nextEvent ?? visibleEvents[0]?.title ?? "None"} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CalendarEvent["status"] | "All statuses")}>
              {["All statuses", "Scheduled", "At Risk", "Complete"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button onClick={onRefreshDigest}><RefreshCw size={15} /> Digest</button>
          <button disabled={!visibleEvents.length} onClick={() => onBulkCompleteCalendarEvents(visibleEvents.slice(0, 3).map((event) => event.id))}><CheckCircle2 size={15} /> Bulk complete</button>
          <button disabled={!visibleEvents.length} onClick={() => onBulkRescheduleEvents(visibleEvents.slice(0, 3).map((event) => event.id))}><TimerReset size={15} /> Bulk reschedule</button>
        </div>
        <div className="calendar-list">
          {visibleEvents.map((event) => (
            <article className="calendar-card" key={event.id}>
              <div className="task-head">
                <StatusPill status={event.status} />
                <span className={`severity ${event.priority.toLowerCase()}`}>{event.priority}</span>
              </div>
              <h2>{event.title}</h2>
              <p>{event.category} owned by {event.owner}. Date: {event.date}.</p>
              <div className="approval-meta">
                <small>{event.watchers?.length ?? 0} watchers</small>
                <small>{event.status}</small>
                <small>{event.checkInStatus ? `${event.checkInStatus} by ${event.checkInBy ?? "station"}` : "No check-in"}</small>
                <small>{event.venue ?? "No venue"}</small>
                <small>{event.agenda ?? "No agenda"}</small>
                <small>{event.attendance !== undefined ? `${event.attendance} attendees` : "No attendance"}</small>
                <small>{event.reminderSent ? `Reminder ${event.reminderAudience}` : "No reminder"}</small>
                <small>{event.readiness ?? "Readiness pending"}</small>
                <small>{event.linkedTask ? `Task ${event.linkedTask}` : "No linked task"}</small>
                <small>{event.linkedReport ? `Report ${event.linkedReport}` : "No linked report"}</small>
              </div>
              <div className="action-row">
                <button onClick={() => onCompleteCalendarEvent(event.id)}><CheckCircle2 size={15} /> Complete</button>
                <button onClick={() => onCheckInEvent(event.id)}><ClipboardCheck size={15} /> Check in</button>
                <button onClick={() => onUpdateVenue(event.id)}><Landmark size={15} /> Venue</button>
                <button onClick={() => onAttachAgenda(event.id)}><ScrollText size={15} /> Agenda</button>
                <button onClick={() => onLogAttendance(event.id)}><Users size={15} /> Attendance</button>
                <button onClick={() => onSendReminder(event.id)}><Bell size={15} /> Reminder</button>
                <button onClick={() => onMarkReadiness(event.id)}><ShieldCheck size={15} /> Readiness</button>
                <button onClick={() => onLinkTask(event.id)}><SquareCheckBig size={15} /> Task link</button>
                <button onClick={() => onLinkReport(event.id)}><FileCheck2 size={15} /> Report link</button>
                <button onClick={() => onUpdateCalendarEventDate(event.id, event.date === "2026-05-24" ? "2026-05-31" : "2026-05-24")}><CalendarDays size={15} /> Date</button>
                <button onClick={() => onRescheduleCalendarEvent(event.id)}><TimerReset size={15} /> Reschedule</button>
                <button onClick={() => onUpdateCalendarEventPriority(event.id, event.priority === "Critical" ? "High" : "Critical")}><AlertTriangle size={15} /> Priority</button>
                <button onClick={() => onMarkCalendarEventAtRisk(event.id)}><TimerReset size={15} /> Mark risk</button>
                <button onClick={() => onUpdateCalendarEventOwner(event.id)}><Landmark size={15} /> Owner</button>
                <button onClick={() => onUpdateCalendarEventCategory(event.id)}><ScrollText size={15} /> Category</button>
                <button onClick={() => onWatchCalendarEvent(event.id)}><Bell size={15} /> Watch</button>
                <button onClick={() => onDuplicateCalendarEvent(event.id)}><Files size={15} /> Duplicate</button>
                <button onClick={() => onEscalateCalendarEvent("Calendar", event.title, `${event.date} calendar item is ${event.status.toLowerCase()}`, event.owner, event.priority === "Critical" ? "Critical" : "High")}>
                  <AlertTriangle size={15} /> Escalate
                </button>
                <button onClick={() => onArchiveEvent(event.id)}><ArchiveIcon size={15} /> Archive</button>
              </div>
            </article>
          ))}
          {visibleEvents.length === 0 && <div className="empty-state">No calendar items match the current category.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Schedule Item" action={offlineMode ? "Queue" : "Calendar"} />
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>Category</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} />
          </label>
          <label>
            <span>Owner</span>
            <input value={owner} onChange={(event) => setOwner(event.target.value)} />
          </label>
          <label>
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            <span>Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as CalendarEvent["priority"])}>
              {["Low", "Medium", "High", "Critical"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as CalendarEvent["status"])}>
              {["Scheduled", "At Risk", "Complete"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button type="submit"><Plus size={15} /> Schedule item</button>
        </form>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={TimerReset} title="Calendar Controls" action="Deadline" />
        {["Audit deadlines", "Report windows", "Executive meetings", "Review reminders"].map((control) => (
          <div className="control-row" key={control}>
            <CalendarDays size={16} />
            <span>{control}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PersonnelDirectory({
  personnel,
  station,
  permissions,
  offlineMode,
  onCreatePerson,
  onUpdatePersonStatus,
  onUpdatePersonAssignment,
  onUpdatePersonRole,
  onDeactivatePerson,
  onCreateTransfer,
  onOnboardPerson,
  onResetCredentials,
  onPlaceLeave,
  onUpdateClearance,
  onVerifyCredentials,
  onAssignTraining,
  onGrantAccess,
  onFlagIncident,
  onLinkTask,
  onReviewPerson,
  onArchivePerson,
  onBulkCredentialReview,
  onRefreshDigest,
  digest
}: {
  personnel: PersonRecord[];
  station: StationCard;
  permissions: Permissions;
  offlineMode: boolean;
  onCreatePerson: (person: Omit<PersonRecord, "id">) => void;
  onUpdatePersonStatus: (id: string, status: PersonRecord["status"]) => void;
  onUpdatePersonAssignment: (id: string, assignedStation: string) => void;
  onUpdatePersonRole: (id: string, role: string) => void;
  onDeactivatePerson: (id: string) => void;
  onCreateTransfer: (transfer: Omit<Transfer, "id" | "step" | "risk">) => void;
  onOnboardPerson: (id: string) => void;
  onResetCredentials: (id: string) => void;
  onPlaceLeave: (id: string) => void;
  onUpdateClearance: (id: string) => void;
  onVerifyCredentials: (id: string) => void;
  onAssignTraining: (id: string) => void;
  onGrantAccess: (id: string) => void;
  onFlagIncident: (id: string) => void;
  onLinkTask: (id: string) => void;
  onReviewPerson: (id: string) => void;
  onArchivePerson: (id: string) => void;
  onBulkCredentialReview: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: PersonnelDigest | null;
}) {
  const [name, setName] = React.useState("Rev. Grace Walker");
  const [role, setRole] = React.useState("Pastoral Assistant");
  const [currentStation, setCurrentStation] = React.useState(String(station.level));
  const [assignedStation, setAssignedStation] = React.useState("Riverbend Area Office");
  const [status, setStatus] = React.useState<PersonRecord["status"]>("Active");
  const [statusFilter, setStatusFilter] = React.useState<PersonRecord["status"] | "All statuses">("All statuses");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setCurrentStation(String(station.level));
  }, [station.level]);

  const visiblePersonnel = React.useMemo(() => (
    personnel.filter((person) => (
      !person.archived
      && (statusFilter === "All statuses" || person.status === statusFilter)
    ))
  ), [personnel, statusFilter]);
  const activePersonnel = personnel.filter((person) => !person.archived);
  const activeCount = activePersonnel.filter((person) => person.status === "Active").length;
  const transferPendingCount = activePersonnel.filter((person) => person.status === "Transfer Pending").length;
  const assignedCount = activePersonnel.filter((person) => person.status === "Assigned").length;
  const verifiedCount = activePersonnel.filter((person) => person.credentialStatus === "Verified").length;
  const trainingCount = activePersonnel.filter((person) => person.trainingStatus).length;
  const accessCount = activePersonnel.filter((person) => person.accessStatus === "Granted").length;
  const incidentCount = activePersonnel.filter((person) => person.incidentFlag).length;
  const linkedCount = activePersonnel.filter((person) => person.linkedTask).length;
  const reviewedCount = activePersonnel.filter((person) => person.reviewStatus).length;
  const archivedCount = personnel.filter((person) => person.archived).length;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreatePerson({ name, role, currentStation, assignedStation, status });
    setFeedback(offlineMode ? "Personnel record queued locally." : "Personnel record registered and audit logged.");
    setName("New personnel record");
  }

  function createTransfer(person: PersonRecord) {
    onCreateTransfer({
      person: person.name,
      from: person.currentStation,
      to: person.assignedStation
    });
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={Users} title="Personnel Directory" action={`${visiblePersonnel.length} visible`} />
        <div className="office-summary-grid">
          <Insight label="Active" value={String(activeCount)} />
          <Insight label="Transfer pending" value={String(transferPendingCount)} />
          <Insight label="Assigned" value={String(assignedCount)} />
          <Insight label="Verified" value={String(digest?.verified ?? verifiedCount)} />
          <Insight label="Training" value={String(digest?.training ?? trainingCount)} />
          <Insight label="Access" value={String(digest?.accessGranted ?? accessCount)} />
          <Insight label="Incidents" value={String(digest?.incidents ?? incidentCount)} />
          <Insight label="Linked" value={String(digest?.linked ?? linkedCount)} />
          <Insight label="Reviewed" value={String(digest?.reviewed ?? reviewedCount)} />
          <Insight label="Archived" value={String(digest?.archived ?? archivedCount)} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PersonRecord["status"] | "All statuses")}>
              {["All statuses", "Active", "Transfer Pending", "Assigned", "Onboarding", "On Leave", "Inactive"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" onClick={onRefreshDigest}><RefreshCw size={14} /> Digest</button>
          <button disabled={!permissions.canExecuteTransfers || !visiblePersonnel.length} type="button" onClick={() => onBulkCredentialReview(visiblePersonnel.slice(0, 3).map((person) => person.id))}><ShieldCheck size={14} /> Bulk credential review</button>
        </div>
        {digest && (
          <div className="workflow-digest">
            <Insight label="Active" value={String(digest.active)} />
            <Insight label="Transfer pending" value={String(digest.transferPending)} />
            <Insight label="Next person" value={digest.nextPerson} />
          </div>
        )}
        <div className="personnel-list">
          {visiblePersonnel.map((person) => (
            <article className="personnel-card" key={person.id}>
              <div className="task-head">
                <StatusPill status={person.status} />
                <span>{person.role}</span>
              </div>
              <h2>{person.name}</h2>
              <p>{person.currentStation} to {person.assignedStation}{person.clearance ? ` | ${person.clearance} clearance` : ""}{person.credentialStatus ? ` | ${person.credentialStatus}` : ""}</p>
              <div className="approval-meta">
                <small>{person.trainingStatus ? `${person.trainingStatus}: ${person.trainingTrack}` : "No training"}</small>
                <small>{person.accessStatus ? `${person.accessStatus}: ${person.stationAccess}` : "No station access"}</small>
                <small>{person.incidentFlag ? `${person.incidentSeverity}: ${person.incidentFlag}` : "No incident"}</small>
                <small>{person.linkedTask ? `Task ${person.linkedTask}` : "No linked task"}</small>
                <small>{person.reviewStatus ? `${person.reviewStatus}: ${person.reviewNote}` : "No review"}</small>
              </div>
              <div className="action-row">
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onOnboardPerson(person.id)}><ClipboardCheck size={15} /> Onboard</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onResetCredentials(person.id)}><LockKeyhole size={15} /> Credentials</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onVerifyCredentials(person.id)}><ShieldCheck size={15} /> Verify</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onAssignTraining(person.id)}><FileCheck2 size={15} /> Training</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onGrantAccess(person.id)}><KeyRound size={15} /> Access</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onFlagIncident(person.id)}><AlertTriangle size={15} /> Incident</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onLinkTask(person.id)}><SquareCheckBig size={15} /> Task link</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onReviewPerson(person.id)}><ClipboardCheck size={15} /> Review</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onPlaceLeave(person.id)}><TimerReset size={15} /> Leave</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onUpdateClearance(person.id)}><ShieldCheck size={15} /> Clearance</button>
                <button onClick={() => onUpdatePersonStatus(person.id, "Assigned")}><CheckCircle2 size={15} /> Mark assigned</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onUpdatePersonRole(person.id, person.role === "Governance Liaison" ? "Area Coordinator" : "Governance Liaison")}><Users size={15} /> Role</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onUpdatePersonAssignment(person.id, station.level)}><RefreshCw size={15} /> Reassign</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onDeactivatePerson(person.id)}><LockKeyhole size={15} /> Deactivate</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => createTransfer(person)}><Signature size={15} /> Create transfer</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onArchivePerson(person.id)}><ArchiveIcon size={15} /> Archive</button>
              </div>
            </article>
          ))}
          {visiblePersonnel.length === 0 && <div className="empty-state">No personnel records match the current status filter.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Register Person" action={offlineMode ? "Queue" : "Directory"} />
        {!permissions.canExecuteTransfers && (
          <div className="permission-warning">
            <LockKeyhole size={16} />
            <span>Personnel registration is tied to transfer authority for now.</span>
          </div>
        )}
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {missionStationRoleOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Current station</span>
            <input value={currentStation} onChange={(event) => setCurrentStation(event.target.value)} />
          </label>
          <label>
            <span>Assigned station</span>
            <input value={assignedStation} onChange={(event) => setAssignedStation(event.target.value)} />
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as PersonRecord["status"])}>
              {["Active", "Transfer Pending", "Assigned", "Onboarding", "On Leave", "Inactive"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button disabled={!permissions.canExecuteTransfers} type="submit"><Plus size={15} /> Register person</button>
        </form>
        <div className="role-library" aria-label="Mission station role library">
          <strong>Mission station roles</strong>
          <div>
            {missionStationRoleOptions.map((option) => <span key={option}>{option}</span>)}
          </div>
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Signature} title="Personnel Controls" action="Identity" />
        {["Station assignment", "Transfer readiness", "Role visibility", "Audit-backed status"].map((control) => (
          <div className="control-row" key={control}>
            <Users size={16} />
            <span>{control}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Escalations({
  escalations,
  station,
  permissions,
  events,
  onCreateEscalation,
  onUpdateOwner,
  onUpdateSeverity,
  onEscalateUpward,
  onResolveEscalation,
  onTriageEscalation,
  onUpdateSla,
  onWatchEscalation,
  onMergeEscalation,
  onAttachEvidence,
  onCommentEscalation,
  onNoteResolution,
  onUpdateDue,
  onLinkTask,
  onLinkReport,
  onLinkApproval,
  onScoreImpact,
  onArchiveEscalation,
  onBulkResolve,
  onRefreshDigest,
  digest
}: {
  escalations: Escalation[];
  station: StationCard;
  permissions: Permissions;
  events: string[];
  onCreateEscalation: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
  onUpdateOwner: (id: string, owner: string) => void;
  onUpdateSeverity: (id: string, severity: Escalation["severity"]) => void;
  onEscalateUpward: (id: string) => void;
  onResolveEscalation: (id: string) => void;
  onTriageEscalation: (id: string) => void;
  onUpdateSla: (id: string) => void;
  onWatchEscalation: (id: string) => void;
  onMergeEscalation: (id: string) => void;
  onAttachEvidence: (id: string) => void;
  onCommentEscalation: (id: string) => void;
  onNoteResolution: (id: string) => void;
  onUpdateDue: (id: string) => void;
  onLinkTask: (id: string) => void;
  onLinkReport: (id: string) => void;
  onLinkApproval: (id: string) => void;
  onScoreImpact: (id: string) => void;
  onArchiveEscalation: (id: string) => void;
  onBulkResolve: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: EscalationDigest | null;
}) {
  const activeEscalations = escalations.filter((item) => !item.archived);
  const openCount = activeEscalations.filter((item) => item.status !== "Resolved").length;
  const [source, setSource] = React.useState<Escalation["source"]>("Report");
  const [item, setItem] = React.useState("Urgent governance review");
  const [reason, setReason] = React.useState("Deadline risk requires supervisory attention");
  const [owner, setOwner] = React.useState("Workflow Engine");
  const [severity, setSeverity] = React.useState<Escalation["severity"]>("High");
  const [severityFilter, setSeverityFilter] = React.useState<Escalation["severity"] | "All severities">("All severities");
  const [sourceFilter, setSourceFilter] = React.useState<Escalation["source"] | "All sources">("All sources");
  const [feedback, setFeedback] = React.useState("");
  const visibleEscalations = React.useMemo(() => (
    escalations.filter((escalation) => (
      !escalation.archived
      &&
      (severityFilter === "All severities" || escalation.severity === severityFilter)
      && (sourceFilter === "All sources" || escalation.source === sourceFilter)
    ))
  ), [escalations, severityFilter, sourceFilter]);
  const evidenceCount = activeEscalations.filter((item) => item.evidence).length;
  const commentCount = activeEscalations.filter((item) => item.comments?.length).length;
  const noteCount = activeEscalations.filter((item) => item.resolutionNote).length;
  const dueCount = activeEscalations.filter((item) => item.due).length;
  const linkedCount = activeEscalations.filter((item) => item.linkedTask || item.linkedReport || item.linkedApproval).length;
  const impactCount = activeEscalations.filter((item) => item.impactScore !== undefined).length;
  const archivedCount = escalations.filter((item) => item.archived).length;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateEscalation(source, item, reason, owner, severity);
    setFeedback(`${item} has been opened as a ${severity.toLowerCase()} escalation.`);
    setItem("New escalation item");
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={AlertTriangle} title="Escalation Engine" action={`${openCount} active`} />
        {!permissions.canApprove && (
          <div className="permission-warning">
            <LockKeyhole size={16} />
            <span>This station can observe escalations, but cannot route or resolve them.</span>
          </div>
        )}
        <div className="archive-toolbar">
          <label>
            <span>Severity</span>
            <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as Escalation["severity"] | "All severities")}>
              {["All severities", "Medium", "High", "Critical"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Source</span>
            <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as Escalation["source"] | "All sources")}>
              {["All sources", "Report", "Approval", "Transfer", "Audit", "Calendar", "Task"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" onClick={onRefreshDigest}><RefreshCw size={14} /> Digest</button>
          <button disabled={!permissions.canApprove || !visibleEscalations.length} type="button" onClick={() => onBulkResolve(visibleEscalations.slice(0, 3).map((escalation) => escalation.id))}><CheckCircle2 size={14} /> Bulk resolve</button>
        </div>
        {digest && (
          <div className="workflow-digest">
            <Insight label="Open" value={String(digest.open)} />
            <Insight label="Critical" value={String(digest.critical)} />
            <Insight label="Evidence" value={String(digest.evidence ?? evidenceCount)} />
            <Insight label="Comments" value={String(digest.comments ?? commentCount)} />
            <Insight label="Notes" value={String(digest.resolutionNotes ?? noteCount)} />
            <Insight label="Due" value={String(digest.due ?? dueCount)} />
            <Insight label="Linked" value={String(digest.linked ?? linkedCount)} />
            <Insight label="Impact" value={String(digest.impact ?? impactCount)} />
            <Insight label="Archived" value={String(digest.archived ?? archivedCount)} />
            <Insight label="Primary" value={digest.primary} />
          </div>
        )}
        <div className="escalation-list">
          {visibleEscalations.map((escalation) => (
            <article className="escalation-card" key={escalation.id}>
              <div className="escalation-head">
                <div>
                  <StatusPill status={escalation.status} />
                  <span className={`severity ${escalation.severity.toLowerCase()}`}>{escalation.severity}</span>
                </div>
                <small>{escalation.source}</small>
              </div>
              <h2>{escalation.item}</h2>
              <p>{escalation.reason}</p>
              <div className="route-box">
                <strong>Owner</strong>
                <span>{escalation.owner}{escalation.sla ? ` | SLA ${escalation.sla}` : ""}{escalation.watchers?.length ? ` | ${escalation.watchers.length} watching` : ""}</span>
              </div>
              <div className="approval-meta">
                <small>{escalation.evidence ?? "No evidence"}</small>
                <small>{escalation.comments?.length ?? 0} comments</small>
                <small>{escalation.resolutionNote ?? "No resolution note"}</small>
                <small>{escalation.due ? `Due ${escalation.due}` : "No due date"}</small>
                <small>{escalation.linkedTask ? `Task ${escalation.linkedTask}` : "No linked task"}</small>
                <small>{escalation.linkedReport ? `Report ${escalation.linkedReport}` : "No linked report"}</small>
                <small>{escalation.linkedApproval ? `Approval ${escalation.linkedApproval}` : "No linked approval"}</small>
                <small>{escalation.impactScore !== undefined ? `${escalation.impactScore}: ${escalation.impactSummary}` : "No impact score"}</small>
              </div>
              <div className="action-row">
                <button
                  aria-label={`Triage ${escalation.item}`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved"}
                  onClick={() => onTriageEscalation(escalation.id)}
                >
                  <ClipboardCheck size={15} /> Triage
                </button>
                <button
                  aria-label={`Set SLA for ${escalation.item}`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved"}
                  onClick={() => onUpdateSla(escalation.id)}
                >
                  <TimerReset size={15} /> SLA
                </button>
                <button
                  aria-label={`Watch ${escalation.item}`}
                  disabled={escalation.status === "Resolved"}
                  onClick={() => onWatchEscalation(escalation.id)}
                >
                  <Bell size={15} /> Watch
                </button>
                <button disabled={!permissions.canApprove || escalation.status === "Resolved"} onClick={() => onAttachEvidence(escalation.id)}><Files size={15} /> Evidence</button>
                <button disabled={escalation.status === "Resolved"} onClick={() => onCommentEscalation(escalation.id)}><MessageSquareText size={15} /> Comment</button>
                <button disabled={!permissions.canApprove} onClick={() => onNoteResolution(escalation.id)}><FileCheck2 size={15} /> Note</button>
                <button disabled={!permissions.canApprove || escalation.status === "Resolved"} onClick={() => onUpdateDue(escalation.id)}><CalendarDays size={15} /> Due</button>
                <button disabled={!permissions.canApprove || escalation.status === "Resolved"} onClick={() => onLinkTask(escalation.id)}><SquareCheckBig size={15} /> Task link</button>
                <button disabled={!permissions.canApprove || escalation.status === "Resolved"} onClick={() => onLinkReport(escalation.id)}><FileCheck2 size={15} /> Report link</button>
                <button disabled={!permissions.canApprove || escalation.status === "Resolved"} onClick={() => onLinkApproval(escalation.id)}><Signature size={15} /> Approval link</button>
                <button disabled={!permissions.canApprove || escalation.status === "Resolved"} onClick={() => onScoreImpact(escalation.id)}><SlidersHorizontal size={15} /> Impact</button>
                <button
                  aria-label={`Route ${escalation.item}: ${escalation.reason} upward`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved"}
                  onClick={() => onEscalateUpward(escalation.id)}
                >
                  <ArrowUpFromLine size={15} /> Route upward
                </button>
                <button
                  aria-label={`Mark ${escalation.item} critical`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved"}
                  onClick={() => onUpdateSeverity(escalation.id, escalation.severity === "Critical" ? "High" : "Critical")}
                >
                  <AlertTriangle size={15} /> Severity
                </button>
                <button
                  aria-label={`Claim ${escalation.item}`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved"}
                  onClick={() => onUpdateOwner(escalation.id, station.email)}
                >
                  <Users size={15} /> Claim
                </button>
                <button
                  aria-label={`Resolve ${escalation.item}: ${escalation.reason}`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved"}
                  onClick={() => onResolveEscalation(escalation.id)}
                >
                  <CheckCircle2 size={15} /> Resolve
                </button>
                <button
                  aria-label={`Merge ${escalation.item}`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved" || escalation.status === "Merged"}
                  onClick={() => onMergeEscalation(escalation.id)}
                >
                  <GitBranch size={15} /> Merge
                </button>
                <button disabled={!permissions.canApprove} onClick={() => onArchiveEscalation(escalation.id)}><ArchiveIcon size={15} /> Archive</button>
              </div>
            </article>
          ))}
          {visibleEscalations.length === 0 && <div className="empty-state">No escalations match the current severity filter.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Create Escalation" action="Open" />
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Source</span>
            <select value={source} onChange={(event) => setSource(event.target.value as Escalation["source"])}>
              <option>Report</option>
              <option>Approval</option>
              <option>Transfer</option>
              <option>Audit</option>
            </select>
          </label>
          <label>
            <span>Item</span>
            <input value={item} onChange={(event) => setItem(event.target.value)} />
          </label>
          <label>
            <span>Reason</span>
            <input value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
          <label>
            <span>Owner</span>
            <input value={owner} onChange={(event) => setOwner(event.target.value)} />
          </label>
          <label>
            <span>Severity</span>
            <select value={severity} onChange={(event) => setSeverity(event.target.value as Escalation["severity"])}>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button type="submit"><AlertTriangle size={15} /> Open escalation</button>
        </form>
      </div>
      <EventBusPanel events={events} />
    </section>
  );
}

function AiDesk({
  drafts,
  reports,
  approvals,
  tasks,
  policies,
  calendarEvents,
  personnel,
  escalations,
  messages,
  onGenerateDraft,
  onRefreshDraft,
  onArchiveDraft,
  onUpdateStatus,
  onPublishDraft,
  onBindSources,
  onScoreDraft,
  onSealDraft,
  onWatchDraft,
  onDuplicateDraft,
  onBulkRefresh,
  onRefreshDigest,
  digest
}: {
  drafts: AiDraft[];
  reports: Report[];
  approvals: Approval[];
  tasks: GovernanceTask[];
  policies: Policy[];
  calendarEvents: CalendarEvent[];
  personnel: PersonRecord[];
  escalations: Escalation[];
  messages: Message[];
  onGenerateDraft: (kind: AiDraft["kind"], focus: string) => void;
  onRefreshDraft: (id: string) => void;
  onArchiveDraft: (id: string) => void;
  onUpdateStatus: (id: string) => void;
  onPublishDraft: (id: string) => void;
  onBindSources: (id: string) => void;
  onScoreDraft: (id: string) => void;
  onSealDraft: (id: string) => void;
  onWatchDraft: (id: string) => void;
  onDuplicateDraft: (id: string) => void;
  onBulkRefresh: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: AiDraftDigest | null;
}) {
  const [kind, setKind] = React.useState<AiDraft["kind"]>("Executive Summary");
  const [focus, setFocus] = React.useState("National operations and escalation review");
  const openEscalations = escalations.filter((item) => item.status !== "Resolved").length;
  const pendingApprovals = approvals.filter((item) => item.state !== "Approved").length;
  const activeReports = reports.filter((item) => item.state !== "Approved").length;
  const activeTasks = tasks.filter((item) => item.status !== "Complete").length;
  const upcomingEvents = calendarEvents.filter((item) => item.status !== "Complete").length;
  const activePersonnel = personnel.filter((item) => item.status !== "Inactive").length;
  const reviewDrafts = drafts.filter((item) => item.status === "Review" || item.status === "Refreshed").length;
  const publishedDrafts = drafts.filter((item) => item.status === "Published").length;
  const watchedDrafts = drafts.filter((item) => item.watchers?.length).length;
  const sourceMap = [
    ...reports.filter((item) => item.state !== "Approved").slice(0, 3).map((item) => ({
      label: "Report",
      title: item.name,
      meta: `${item.owner} - ${item.state}`
    })),
    ...approvals.filter((item) => item.state !== "Approved").slice(0, 3).map((item) => ({
      label: "Approval",
      title: item.request,
      meta: `${item.route} - ${item.signatures}`
    })),
    ...tasks.filter((item) => item.status !== "Complete").slice(0, 3).map((item) => ({
      label: "Task",
      title: item.title,
      meta: `${item.assignee} - ${item.status}`
    })),
    ...policies.filter((item) => item.status !== "Retired").slice(0, 3).map((item) => ({
      label: "Policy",
      title: item.title,
      meta: `${item.category} - ${item.status}`
    })),
    ...calendarEvents.filter((item) => item.status !== "Complete").slice(0, 3).map((item) => ({
      label: "Calendar",
      title: item.title,
      meta: `${item.date} - ${item.status}`
    })),
    ...personnel.filter((item) => item.status !== "Inactive").slice(0, 3).map((item) => ({
      label: "Personnel",
      title: item.name,
      meta: `${item.role} - ${item.status}`
    })),
    ...escalations.filter((item) => item.status !== "Resolved").slice(0, 3).map((item) => ({
      label: "Escalation",
      title: item.item,
      meta: `${item.severity} - ${item.owner}`
    })),
    ...messages.slice(0, 3).map((item) => ({
      label: "ChurchMail",
      title: item.subject,
      meta: `${item.kind} - ${item.status}`
    }))
  ].slice(0, 8);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGenerateDraft(kind, focus);
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={Sparkles} title="AI Administrative Desk" action="Generate" />
        <div className="office-summary-grid">
          <Insight label="Drafts" value={String(digest?.total ?? drafts.length)} />
          <Insight label="Review" value={String(digest?.review ?? reviewDrafts)} />
          <Insight label="Published" value={String(digest?.published ?? publishedDrafts)} />
          <Insight label="Sealed" value={String(digest?.sealed ?? drafts.filter((item) => item.sealed).length)} />
          <Insight label="Watched" value={String(digest?.watched ?? watchedDrafts)} />
          <Insight label="Avg confidence" value={`${digest?.averageConfidence ?? 0}%`} />
          <Insight label="Next draft" value={digest?.nextDraft ?? drafts[0]?.title ?? "None"} />
        </div>
        <div className="archive-toolbar">
          <button type="button" onClick={onRefreshDigest}><RefreshCw size={15} /> Digest</button>
          <button type="button" disabled={!drafts.length} onClick={() => onBulkRefresh(drafts.slice(0, 3).map((draft) => draft.id))}><RefreshCw size={15} /> Bulk refresh</button>
        </div>
        <div className="ai-source-grid">
          <Metric icon={FileCheck2} label="Active Reports" value={String(activeReports)} trend="source" />
          <Metric icon={Workflow} label="Pending Approvals" value={String(pendingApprovals)} trend="source" />
          <Metric icon={SquareCheckBig} label="Active Tasks" value={String(activeTasks)} trend="source" />
          <Metric icon={ScrollText} label="Policy Records" value={String(policies.length)} trend="source" />
          <Metric icon={CalendarDays} label="Calendar Items" value={String(upcomingEvents)} trend="source" />
          <Metric icon={Users} label="Personnel" value={String(activePersonnel)} trend="source" />
          <Metric icon={AlertTriangle} label="Open Escalations" value={String(openEscalations)} trend="risk" />
          <Metric icon={Mail} label="ChurchMail Signals" value={String(messages.length)} trend="source" />
        </div>

        <div className="draft-list">
          {drafts.map((draft) => (
            <article className="draft-card" key={draft.id}>
              <div className="draft-meta">
                <StatusPill status={draft.kind} />
                <span>{draft.createdAt} - {draft.sourceCount} records</span>
              </div>
              <h2>{draft.title}</h2>
              <div className="approval-meta">
                <small>{draft.status ?? "Draft"}</small>
                <small>{draft.confidence ?? 0}% confidence</small>
                <small>{draft.watchers?.length ?? 0} watchers</small>
                <small>{draft.sealed ? "Sealed" : "Open"}</small>
              </div>
              <pre>{draft.body}</pre>
              <div className="action-row">
                <button onClick={() => onRefreshDraft(draft.id)}><RefreshCw size={15} /> Refresh</button>
                <button onClick={() => onUpdateStatus(draft.id)}><FileClock size={15} /> Status</button>
                <button onClick={() => onPublishDraft(draft.id)}><Send size={15} /> Publish</button>
                <button onClick={() => onBindSources(draft.id)}><GitBranch size={15} /> Sources</button>
                <button onClick={() => onScoreDraft(draft.id)}><CheckCircle2 size={15} /> Confidence</button>
                <button onClick={() => onSealDraft(draft.id)}><LockKeyhole size={15} /> Seal</button>
                <button onClick={() => onWatchDraft(draft.id)}><Bell size={15} /> Watch</button>
                <button onClick={() => onDuplicateDraft(draft.id)}><Files size={15} /> Duplicate</button>
                <button onClick={() => onArchiveDraft(draft.id)}><Files size={15} /> Archive draft</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel module-side">
        <PanelHeader icon={MessageSquareText} title="Draft Generator" action="AI assist" />
        <form className="ai-desk-form" onSubmit={submit}>
          <label>
            <span>Output type</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as AiDraft["kind"])}>
              <option>Executive Summary</option>
              <option>Memo</option>
              <option>Report Brief</option>
            </select>
          </label>
          <label>
            <span>Focus</span>
            <textarea value={focus} onChange={(event) => setFocus(event.target.value)} />
          </label>
          <button type="submit"><Sparkles size={15} /> Generate draft</button>
        </form>
        <div className="provision-summary">
          <strong>AI input scope</strong>
          <span>Reports, approvals, tasks, escalations, ChurchMail records, and current station authority are summarized into draft-ready administrative language.</span>
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Files} title="AI Source Map" action={`${sourceMap.length} records`} />
        <div className="source-map-list">
          {sourceMap.map((source, index) => (
            <article className="source-map-item" key={`${source.label}-${source.title}-${index}`}>
              <span>{source.label}</span>
              <strong>{source.title}</strong>
              <small>{source.meta}</small>
            </article>
          ))}
          {sourceMap.length === 0 && <div className="empty-state">No active records are currently feeding AI drafts.</div>}
        </div>
      </div>
    </section>
  );
}

function Hierarchy({
  stationDirectory,
  offices,
  digest,
  onUpdateStationLevel,
  onUpdateStationAuthority,
  onVerifyStation,
  onWatchStation,
  onSuspendStation,
  onActivateStation,
  onMirrorStation,
  onBulkVerifyStations,
  onRefreshDigest
}: {
  stationDirectory: StationCard[];
  offices: Office[];
  digest: HierarchyDigest | null;
  onUpdateStationLevel: (id: string) => void;
  onUpdateStationAuthority: (id: string) => void;
  onVerifyStation: (id: string) => void;
  onWatchStation: (id: string) => void;
  onSuspendStation: (id: string) => void;
  onActivateStation: (id: string) => void;
  onMirrorStation: (id: string) => void;
  onBulkVerifyStations: () => void;
  onRefreshDigest: () => void;
}) {
  const levelCounts = React.useMemo(() => hierarchy.reduce<Record<string, number>>((counts, node) => {
    counts[node.level] = stationDirectory.filter((station) => station.level === node.level).length;
    return counts;
  }, {}), [stationDirectory]);
  const supervisorCount = new Set(offices.map((office) => office.supervisor)).size;
  const dynamicLevels = hierarchy.filter((node) => (levelCounts[node.level] ?? 0) > 0).length;
  const verifiedCount = stationDirectory.filter((station) => station.verified || station.status === "Verified").length;
  const suspendedCount = stationDirectory.filter((station) => station.status === "Suspended").length;
  const watchedCount = stationDirectory.filter((station) => station.watchers?.length).length;
  const mirrorCount = stationDirectory.filter((station) => station.mirrorOf).length;
  const [stationAuth, setStationAuth] = React.useState<StationAuth[]>([]);
  const [stationAuthDigest, setStationAuthDigest] = React.useState<StationAuthDigest | null>(null);
  const stationRows = stationDirectory.slice(0, 8);

  React.useEffect(() => {
    refreshStationAuth();
  }, []);

  function refreshStationAuth() {
    void apiRequest<StationAuth[]>("/api/station-auth").then(setStationAuth).catch(() => undefined);
    void apiRequest<StationAuthDigest>("/api/station-auth/digest").then(setStationAuthDigest).catch(() => undefined);
  }

  function credentialFor(email: string) {
    return stationAuth.find((item) => item.email === email);
  }

  function rotateCredential(id: string) {
    void apiRequest(`/api/stations/${encodeURIComponent(id)}/credential/rotate`, {
      method: "POST",
      body: JSON.stringify({})
    }).then(refreshStationAuth).catch(() => undefined);
  }

  function forceCredentialReset(id: string) {
    void apiRequest(`/api/stations/${encodeURIComponent(id)}/credential/reset`, {
      method: "POST",
      body: JSON.stringify({})
    }).then(refreshStationAuth).catch(() => undefined);
  }

  function requireMfa(id: string) {
    void apiRequest(`/api/stations/${encodeURIComponent(id)}/credential/mfa`, {
      method: "POST",
      body: JSON.stringify({ reason: "MFA required from hierarchy credential desk" })
    }).then(refreshStationAuth).catch(() => undefined);
  }

  function lockCredential(id: string) {
    void apiRequest(`/api/stations/${encodeURIComponent(id)}/credential/lock`, {
      method: "POST",
      body: JSON.stringify({ reason: "Credential locked from hierarchy desk" })
    }).then(refreshStationAuth).catch(() => undefined);
  }

  function unlockCredential(id: string) {
    void apiRequest(`/api/stations/${encodeURIComponent(id)}/credential/unlock`, {
      method: "POST",
      body: JSON.stringify({ reason: "Credential unlocked from hierarchy desk" })
    }).then(refreshStationAuth).catch(() => undefined);
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={GitBranch} title="Organizational Hierarchy Graph" action={`${stationDirectory.length} stations`} />
        <div className="office-summary-grid">
          <Insight label="Stations" value={String(digest?.stations ?? stationDirectory.length)} />
          <Insight label="Active levels" value={`${digest?.levels ?? dynamicLevels}/7`} />
          <Insight label="Supervisors" value={String(supervisorCount)} />
          <Insight label="Verified" value={String(digest?.verified ?? verifiedCount)} />
          <Insight label="Suspended" value={String(digest?.suspended ?? suspendedCount)} />
          <Insight label="Watched" value={String(digest?.watched ?? watchedCount)} />
          <Insight label="Mirrors" value={String(digest?.mirrors ?? mirrorCount)} />
          <Insight label="Next station" value={digest?.nextStation ?? stationRows[0]?.email ?? "None"} />
          <Insight label="Credential locks" value={String(stationAuthDigest?.locked ?? stationAuth.filter((item) => item.status === "Locked").length)} />
          <Insight label="MFA required" value={String(stationAuthDigest?.mfaRequired ?? stationAuth.filter((item) => item.mfaRequired).length)} />
          <Insight label="Reset needed" value={String(stationAuthDigest?.resetRequired ?? stationAuth.filter((item) => item.forceReset).length)} />
        </div>
        <div className="registry-toolbar">
          <button type="button" onClick={onBulkVerifyStations}><ShieldCheck size={14} /> Bulk verify</button>
          <button type="button" onClick={onRefreshDigest}><RefreshCw size={14} /> Digest</button>
          <button type="button" onClick={refreshStationAuth}><KeyRound size={14} /> Credentials</button>
        </div>
        <div className="hierarchy-list">
          {hierarchy.map((node, index) => (
            <article className="hierarchy-row" key={node.level}>
              <div className="node-badge">L{index + 1}</div>
              <div className="node-main">
                <strong>{node.level}</strong>
                <span>{node.node}</span>
              </div>
              <div className="node-metric">{levelCounts[node.level] ?? 0} stations</div>
              <FlowMeter label="CMD" value={node.command} />
              <FlowMeter label="RPT" value={node.reports} />
            </article>
          ))}
        </div>
        <div className="hierarchy-list">
          {stationRows.map((station) => {
            const key = station.id ?? station.email;
            const StationRowIcon = resolveStationIcon(station);
            const credential = credentialFor(station.email);
            return (
              <article className="hierarchy-row" key={key}>
                <div className="node-badge"><StationRowIcon size={16} /></div>
                <div className="node-main">
                  <strong>{station.title}</strong>
                  <span>{station.email} - {station.level} - {station.status ?? "Active"}</span>
                  <span>{credential ? `Credential ${credential.status}${credential.mfaRequired ? " - MFA" : ""}${credential.forceReset ? " - reset required" : ""}${credential.failedAttempts ? ` - ${credential.failedAttempts} failed` : ""}` : "Credential registry pending"}</span>
                </div>
                <div className="node-metric">{station.watchers?.length ?? 0} watchers</div>
                <div className="action-row compact-actions">
                  <button type="button" onClick={() => onUpdateStationLevel(key)}>Level</button>
                  <button type="button" onClick={() => onUpdateStationAuthority(key)}>Authority</button>
                  <button type="button" onClick={() => onVerifyStation(key)}>Verify</button>
                  <button type="button" onClick={() => onWatchStation(key)}>Watch</button>
                  <button type="button" onClick={() => onSuspendStation(key)}>Suspend</button>
                  <button type="button" onClick={() => onActivateStation(key)}>Activate</button>
                  <button type="button" onClick={() => onMirrorStation(key)}>Mirror</button>
                  <button type="button" onClick={() => rotateCredential(key)}>Rotate</button>
                  <button type="button" onClick={() => forceCredentialReset(key)}>Reset</button>
                  <button type="button" onClick={() => requireMfa(key)}>MFA</button>
                  <button type="button" onClick={() => lockCredential(key)}>Lock</button>
                  <button type="button" onClick={() => unlockCredential(key)}>Unlock</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={GitBranch} title="Authority Graph" action="Live" />
        {hierarchy.map((node, index) => (
          <div className="graph-node" key={node.level}>
            <div className="node-badge">L{index + 1}</div>
            <div>
              <strong>{node.level}</strong>
              <span>{levelCounts[node.level] ?? 0} assigned stations</span>
            </div>
          </div>
        ))}
        <div className="provision-summary">
          <strong>Supervisor coverage</strong>
          <span>{supervisorCount} supervising offices are currently referenced by provisioned workstations.</span>
        </div>
        {digest && (
          <div className="workflow-digest">
            <Insight label="Top level" value={digest.topLevel} />
            <Insight label="Verified" value={String(digest.verified)} />
            <Insight label="Generated" value={new Date(digest.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
          </div>
        )}
      </div>
    </section>
  );
}

function Offices({
  offices,
  stationDirectory,
  permissions,
  onCreateOffice,
  onUpdateOfficeSupervisor,
  onUpdateOfficeStatus,
  onActivateOffice,
  onSuspendOffice,
  onRotatePassword,
  onActivateStation,
  onUpdateDepartment,
  onUpdateLevel,
  onVerifyEmail,
  onWatchOffice,
  onNoteOffice,
  onUpdateCapacity,
  onReviewCompliance,
  onArchiveOffice,
  onBulkActivate,
  onRefreshDigest,
  digest
}: {
  offices: Office[];
  stationDirectory: StationCard[];
  permissions: Permissions;
  onCreateOffice: (office: Omit<Office, "id" | "password" | "status">) => boolean;
  onUpdateOfficeSupervisor: (id: string, supervisor: string) => void;
  onUpdateOfficeStatus: (id: string, status: Office["status"]) => void;
  onActivateOffice: (id: string) => void;
  onSuspendOffice: (id: string) => void;
  onRotatePassword: (id: string) => void;
  onActivateStation: (id: string) => void;
  onUpdateDepartment: (id: string) => void;
  onUpdateLevel: (id: string) => void;
  onVerifyEmail: (id: string) => void;
  onWatchOffice: (id: string) => void;
  onNoteOffice: (id: string) => void;
  onUpdateCapacity: (id: string) => void;
  onReviewCompliance: (id: string) => void;
  onArchiveOffice: (id: string) => void;
  onBulkActivate: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: OfficeDigest | null;
}) {
  const [name, setName] = React.useState("New Hope District Office");
  const [email, setEmail] = React.useState("newhope_district@rmvi.org");
  const [level, setLevel] = React.useState<StationLevel>("District HQ");
  const [department, setDepartment] = React.useState("District Command");
  const [supervisor, setSupervisor] = React.useState("County/State Headquarters");
  const [nodeKind, setNodeKind] = React.useState<OrgNodeKind>("Office");
  const [parentId, setParentId] = React.useState("");
  const [permissionPreset, setPermissionPreset] = React.useState<PermissionPreset>("Office Admin");
  const [levelFilter, setLevelFilter] = React.useState<StationLevel | "All levels">("All levels");
  const [feedback, setFeedback] = React.useState("");
  const filteredOffices = React.useMemo(() => (
    offices.filter((office) => !office.archived && (levelFilter === "All levels" || office.level === levelFilter))
  ), [levelFilter, offices]);
  const parentOptions = React.useMemo(() => offices.filter((office) => !office.archived), [offices]);
  const selectedParent = parentOptions.find((office) => office.id === parentId);
  const effectiveParentName = selectedParent?.name || supervisor;
  const reportingRoute = buildReportingRoute(level, effectiveParentName);
  const workflowAccess = workflowAccessForPreset(permissionPreset);
  const activeOffices = offices.filter((office) => !office.archived);
  const provisionedCount = activeOffices.filter((office) => office.status === "Provisioned").length;
  const supervisorCount = new Set(offices.map((office) => office.supervisor)).size;
  const officeEmailSet = React.useMemo(() => new Set(offices.map((office) => office.email)), [offices]);
  const stationRows = React.useMemo(() => stationDirectory.map((station) => {
    const stationPermissions = getPermissions(station);
    const permissionLabels = [
      stationPermissions.canCreateOffices && "Office admin",
      stationPermissions.canApprove && "Approver",
      stationPermissions.canExecuteTransfers && "Transfers",
      stationPermissions.canOverride && "Override",
      !stationPermissions.canApprove && "Reporter"
    ].filter(Boolean);
    return {
      ...station,
      origin: officeEmailSet.has(station.email) ? "Provisioned office" : "Seed station",
      permissions: permissionLabels.join(", ")
    };
  }), [officeEmailSet, stationDirectory]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!permissions.canCreateOffices) {
      setFeedback("This station is not authorized to create offices.");
      return;
    }
    const ok = onCreateOffice({
      name,
      email,
      level,
      department,
      supervisor: effectiveParentName,
      nodeKind,
      parentId: selectedParent?.id,
      parentName: effectiveParentName,
      permissionPreset,
      reportingRoute,
      workflowAccess
    });
    if (!ok) {
      setFeedback("That station email already exists.");
      return;
    }

    setFeedback(`${name} has been provisioned.`);
    const nextName = `Mission Office ${offices.length + 2}`;
    setName(nextName);
    setEmail(`${slugifyStationName(nextName)}@rmvi.org`);
    setParentId("");
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={Building2} title="Office Creation Registry" action={`${filteredOffices.length} visible`} />
        <div className="office-summary-grid">
          <Insight label="Total offices" value={String(offices.length)} />
          <Insight label="Provisioned" value={String(provisionedCount)} />
          <Insight label="Station identities" value={String(stationDirectory.length)} />
          <Insight label="Verified" value={String(digest?.verified ?? activeOffices.filter((office) => office.emailVerified).length)} />
          <Insight label="Watched" value={String(digest?.watched ?? activeOffices.filter((office) => office.watchers?.length).length)} />
          <Insight label="Noted" value={String(digest?.noted ?? activeOffices.filter((office) => office.notes?.length).length)} />
          <Insight label="Capacity set" value={String(digest?.capacity ?? activeOffices.filter((office) => office.capacity !== undefined).length)} />
          <Insight label="Compliant" value={String(digest?.compliant ?? activeOffices.filter((office) => office.complianceStatus).length)} />
          <Insight label="Archived" value={String(digest?.archived ?? offices.filter((office) => office.archived).length)} />
        </div>
        <div className="registry-toolbar">
          <label>
            <span>Hierarchy filter</span>
            <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as StationLevel | "All levels")}>
              <option>All levels</option>
              {hierarchy.map((node) => (
                <option key={node.level} value={node.level}>{node.level}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={onRefreshDigest}><RefreshCw size={14} /> Digest</button>
          <button disabled={!permissions.canCreateOffices || !filteredOffices.length} type="button" onClick={() => onBulkActivate(filteredOffices.slice(0, 3).map((office) => office.id))}><CheckCircle2 size={14} /> Bulk activate</button>
        </div>
        {digest && (
          <div className="workflow-digest">
            <Insight label="Active" value={String(digest.active)} />
            <Insight label="Suspended" value={String(digest.suspended)} />
            <Insight label="Next office" value={digest.nextOffice} />
          </div>
        )}
        <div className="data-table office-table">
          <div className="table-row table-head">
            <span>Office</span><span>Email</span><span>Level</span><span>Supervisor</span><span>Status</span>
          </div>
          {filteredOffices.map((office) => (
            <div className="table-row" key={office.id}>
              <strong>
                {office.name}
                <small>{office.nodeKind ?? "Office"} - {office.department}</small>
              </strong>
              <span>{office.email}</span>
              <span>{office.level}</span>
              <span>{office.parentName ?? office.supervisor}</span>
              <div className="table-actions">
                <StatusPill status={office.status} />
                <span>{office.permissionPreset ?? "Reporter"}</span>
                {office.reportingRoute && <span>{office.reportingRoute}</span>}
                {office.emailVerified && <span>Verified</span>}
                {office.watchers?.length ? <span>{office.watchers.length} watchers</span> : null}
                {office.notes?.length ? <span>{office.notes.length} notes</span> : null}
                {office.capacity !== undefined && <span>{office.capacity} capacity</span>}
                {office.complianceStatus && <span>{office.complianceStatus}</span>}
                <button disabled={!permissions.canCreateOffices} onClick={() => onUpdateOfficeSupervisor(office.id, office.supervisor === "International Headquarters" ? "National Headquarters" : "International Headquarters")}><GitBranch size={14} /> Supervisor</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onUpdateOfficeStatus(office.id, office.status === "Suspended" ? "Provisioned" : "Suspended")}><LockKeyhole size={14} /> Status</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onUpdateDepartment(office.id)}><ScrollText size={14} /> Department</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onUpdateLevel(office.id)}><Building2 size={14} /> Level</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onVerifyEmail(office.id)}><ShieldCheck size={14} /> Verify</button>
                <button onClick={() => onWatchOffice(office.id)}><Bell size={14} /> Watch</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onNoteOffice(office.id)}><MessageSquareText size={14} /> Note</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onUpdateCapacity(office.id)}><Users size={14} /> Capacity</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onReviewCompliance(office.id)}><ClipboardCheck size={14} /> Compliance</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onActivateOffice(office.id)}><CheckCircle2 size={14} /> Activate</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onSuspendOffice(office.id)}><AlertTriangle size={14} /> Suspend</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onRotatePassword(office.id)}><RefreshCw size={14} /> Rotate</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onActivateStation(office.id)}><RadioTower size={14} /> Station</button>
                <button disabled={!permissions.canCreateOffices} onClick={() => onArchiveOffice(office.id)}><ArchiveIcon size={14} /> Archive</button>
              </div>
            </div>
          ))}
          {filteredOffices.length === 0 && <div className="empty-state">No offices match the current hierarchy filter.</div>}
        </div>
      </div>

      <div className="panel station-directory">
        <PanelHeader icon={LockKeyhole} title="Station Identity Directory" action={`${stationRows.length} active`} />
        <div className="office-summary-grid">
          <Insight label="Seed stations" value={String(stationRows.filter((station) => station.origin === "Seed station").length)} />
          <Insight label="Provisioned" value={String(stationRows.filter((station) => station.origin === "Provisioned office").length)} />
          <Insight label="Supervisors" value={String(supervisorCount)} />
        </div>
        <div className="data-table station-table">
          <div className="table-row table-head">
            <span>Station</span><span>Email</span><span>Level</span><span>Origin</span><span>Permissions</span>
          </div>
          {stationRows.map((station) => (
            <div className="table-row" key={station.email}>
              <strong>
                {station.title}
                <small>{station.nodeKind ?? "Station"}{station.parentName ? ` under ${station.parentName}` : ""}</small>
              </strong>
              <span>{station.email}</span>
              <span>{station.level}</span>
              <span>{station.origin}</span>
              <span>{station.permissionPreset ?? station.permissions}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Create Office" action="No code" />
        {!permissions.canCreateOffices && (
          <div className="permission-warning">
            <LockKeyhole size={16} />
            <span>Office creation requires national, regional, or international authority.</span>
          </div>
        )}
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Office name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Station email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button className="secondary" type="button" onClick={() => setEmail(`${slugifyStationName(name)}@rmvi.org`)}>
            <Mail size={14} /> Generate official email
          </button>
          <label>
            <span>Node type</span>
            <select value={nodeKind} onChange={(event) => setNodeKind(event.target.value as OrgNodeKind)}>
              {organizationNodeKinds.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Hierarchy level</span>
            <select value={level} onChange={(event) => setLevel(event.target.value as StationLevel)}>
              {hierarchy.map((node) => (
                <option key={node.level} value={node.level}>{node.level}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Department</span>
            <input value={department} onChange={(event) => setDepartment(event.target.value)} />
          </label>
          <label>
            <span>Parent office / directorate</span>
            <select value={parentId} onChange={(event) => setParentId(event.target.value)}>
              <option value="">Manual parent</option>
              {parentOptions.map((office) => (
                <option key={office.id} value={office.id}>{office.name} - {office.level}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Manual supervisor / parent</span>
            <input value={supervisor} onChange={(event) => setSupervisor(event.target.value)} />
          </label>
          <label>
            <span>Permission preset</span>
            <select value={permissionPreset} onChange={(event) => setPermissionPreset(event.target.value as PermissionPreset)}>
              {permissionPresets.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="provision-summary compact">
            <strong>Generated structure</strong>
            <span>{reportingRoute}</span>
            <span>{workflowAccess.join(", ")}</span>
          </div>
          {feedback && <div className="login-error">{feedback}</div>}
          <button disabled={!permissions.canCreateOffices} type="submit"><Plus size={15} /> Provision workstation</button>
        </form>

        <div className="provision-summary">
          <strong>Generated assets</strong>
          <span>Dashboard, inbox, reporting route, workflow access, permission profile, station email, analytics panel, audit ledger registration.</span>
          <span>Default departments are templates only. Create AI Research Unit, Legal Affairs, RMVI Television, or any future structure from this same control.</span>
        </div>
      </div>
    </section>
  );
}

function LiveComms({
  station,
  offices,
  reports,
  approvals,
  tasks,
  messages,
  liveSessions,
  onCreateLiveSession,
  onUpdateLiveSessionStatus,
  onAttachLiveSessionFile,
  onAddLiveSessionNote,
  onInviteLiveSessionParticipant,
  onCheckInLiveSessionParticipant,
  onAddLiveSessionChat,
  onRecordLiveSessionDecision,
  onSendLiveSessionSummary,
  onCreateLiveSessionFollowUpTask,
  onScheduleLiveSession,
  onBuildLiveSessionPacket,
  onArchiveLiveSession,
  onOpenSection
}: {
  station: StationCard;
  offices: Office[];
  reports: Report[];
  approvals: Approval[];
  tasks: GovernanceTask[];
  messages: Message[];
  liveSessions: LiveSession[];
  onCreateLiveSession: (draft: Omit<LiveSession, "id" | "createdAt">) => void;
  onUpdateLiveSessionStatus: (id: string, status: LiveSession["status"]) => void;
  onAttachLiveSessionFile: (id: string) => void;
  onAddLiveSessionNote: (id: string) => void;
  onInviteLiveSessionParticipant: (id: string, participant: string) => void;
  onCheckInLiveSessionParticipant: (id: string, participant: string) => void;
  onAddLiveSessionChat: (id: string) => void;
  onRecordLiveSessionDecision: (id: string) => void;
  onSendLiveSessionSummary: (id: string) => void;
  onCreateLiveSessionFollowUpTask: (id: string) => void;
  onScheduleLiveSession: (id: string) => void;
  onBuildLiveSessionPacket: (id: string) => void;
  onArchiveLiveSession: (id: string) => void;
  onOpenSection: (section: Section) => void;
}) {
  const [sessionType, setSessionType] = React.useState<LiveSession["sessionType"]>("Video Meeting");
  const [linkedRecord, setLinkedRecord] = React.useState(reports[0]?.name ?? approvals[0]?.request ?? "General office briefing");
  const [route, setRoute] = React.useState(station.reportingRoute ?? `${station.level} -> Supervising office`);
  const [inviteTarget, setInviteTarget] = React.useState(station.email);
  const [feedback, setFeedback] = React.useState("");
  const activeOffices = offices.filter((office) => !office.archived);
  const openApprovals = approvals.filter((approval) => approval.state !== "Approved");
  const openTasks = tasks.filter((task) => task.status !== "Complete");
  const activeSessions = liveSessions.filter((sessionItem) => !sessionItem.archived);
  const primarySession = activeSessions[0];
  const linkedOptions = [
    ...reports.slice(0, 5).map((report) => report.name),
    ...approvals.slice(0, 5).map((approval) => approval.request),
    ...tasks.slice(0, 5).map((task) => task.title),
    ...messages.slice(0, 5).map((message) => message.subject)
  ];
  const channels = [
    { name: "Office chat", detail: `${activeOffices.length} office nodes available`, icon: MessageSquareText, type: "Office Chat" },
    { name: "HQ broadcast", detail: `${messages.length} ChurchMail records can be referenced`, icon: RadioTower, type: "Broadcast" },
    { name: "Approval room", detail: `${openApprovals.length} approval chains open`, icon: Workflow, type: "Approval Room" },
    { name: "Report co-editing", detail: `${reports.length} report packets available`, icon: FileCheck2, type: "Report Review" }
  ];
  const participantOptions = Array.from(new Set([
    station.email,
    ...activeOffices.map((office) => office.email),
    "district_admin@rmvi.org",
    "finance@rmvi.org",
    "mission@rmvi.org"
  ].filter(Boolean)));

  function startSession(type = sessionType) {
    const title = type === "Broadcast"
      ? `${station.level} broadcast`
      : type === "Approval Room"
        ? `${station.level} approval room`
        : type === "Office Chat"
          ? `${station.level} office chat`
          : `${station.level} live meeting`;
    onCreateLiveSession({
      title,
      host: station.title,
      sessionType: type,
      status: type === "Broadcast" ? "Priority" : "Live",
      linkedRecord,
      route,
      purpose: `${type} for ${linkedRecord}`,
      participants: [station.email],
      notes: [],
      files: []
    });
    setFeedback(`${title} started and linked to ${linkedRecord}.`);
  }

  return (
    <section className="module-grid live-comms-workspace">
      <div className="panel module-primary">
        <PanelHeader icon={Video} title="Real-Time Communication Hub" action="Node linked" />
        <div className="live-comms-hero">
          <div>
            <span>{station.level}</span>
            <h2>{station.title}</h2>
            <p>Meet, chat, review reports, discuss approvals, share documents, and broadcast instructions while every conversation stays tied to an official office node.</p>
          </div>
          <div className="live-call-controls">
            <button type="button" onClick={() => startSession("Video Meeting")}><Video size={16} /> Start video meeting</button>
            <button type="button" onClick={() => startSession("Office Chat")}><MessageSquareText size={16} /> Open office chat</button>
            <button type="button" onClick={() => startSession("Broadcast")}><RadioTower size={16} /> Broadcast directive</button>
          </div>
        </div>

        <div className="live-comms-console">
          <label>
            <span>Session type</span>
            <select value={sessionType} onChange={(event) => setSessionType(event.target.value)}>
              <option>Video Meeting</option>
              <option>Office Chat</option>
              <option>Broadcast</option>
              <option>Approval Room</option>
              <option>Report Review</option>
            </select>
          </label>
          <label>
            <span>Linked record</span>
            <select value={linkedRecord} onChange={(event) => setLinkedRecord(event.target.value)}>
              {linkedOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Route</span>
            <input value={route} onChange={(event) => setRoute(event.target.value)} />
          </label>
          <label>
            <span>Invite</span>
            <select value={inviteTarget} onChange={(event) => setInviteTarget(event.target.value)}>
              {participantOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => startSession()}><Plus size={15} /> Create session</button>
        </div>
        {feedback && <div className="live-comms-feedback">{feedback}</div>}

        <div className="live-status-strip">
          <Insight label="Active sessions" value={String(activeSessions.length)} />
          <Insight label="Live now" value={String(activeSessions.filter((sessionItem) => sessionItem.status === "Live").length)} />
          <Insight label="Priority" value={String(activeSessions.filter((sessionItem) => sessionItem.status === "Priority").length)} />
          <Insight label="Shared files" value={String(activeSessions.reduce((sum, sessionItem) => sum + (sessionItem.files?.length ?? 0), 0))} />
        </div>

        <div className="live-session-grid">
          {activeSessions.map((sessionItem) => (
            <article className="live-session-card" key={sessionItem.title}>
              <div>
                <Video size={18} />
                <span>{sessionItem.status}</span>
              </div>
              <h3>{sessionItem.title}</h3>
              <p>{sessionItem.route}</p>
              <small>Linked record: {sessionItem.linkedRecord}</small>
              <small>{sessionItem.notes?.length ?? 0} notes - {sessionItem.transcript?.length ?? 0} messages - {sessionItem.decisions?.length ?? 0} decisions</small>
              <small>{sessionItem.files?.length ?? 0} files - {sessionItem.participants?.length ?? 0} invited - {sessionItem.checkedInParticipants?.length ?? 0} checked in</small>
              <div className="compact-actions">
                <button type="button" onClick={() => onUpdateLiveSessionStatus(sessionItem.id, "Live")}>Join</button>
                <button type="button" onClick={() => onInviteLiveSessionParticipant(sessionItem.id, inviteTarget)}>Invite</button>
                <button type="button" onClick={() => onCheckInLiveSessionParticipant(sessionItem.id, station.email)}>Check in</button>
                <button type="button" onClick={() => onAddLiveSessionChat(sessionItem.id)}>Chat</button>
                <button type="button" onClick={() => onRecordLiveSessionDecision(sessionItem.id)}>Decision</button>
                <button type="button" onClick={() => onScheduleLiveSession(sessionItem.id)}>Schedule</button>
                <button type="button" onClick={() => onAttachLiveSessionFile(sessionItem.id)}>Attach file</button>
                <button type="button" onClick={() => onAddLiveSessionNote(sessionItem.id)}>Decision note</button>
                <button type="button" onClick={() => onSendLiveSessionSummary(sessionItem.id)}>Send summary</button>
                <button type="button" onClick={() => onCreateLiveSessionFollowUpTask(sessionItem.id)}>Task</button>
                <button type="button" onClick={() => onBuildLiveSessionPacket(sessionItem.id)}>Build packet</button>
                <button type="button" onClick={() => onArchiveLiveSession(sessionItem.id)}>Archive</button>
              </div>
            </article>
          ))}
          {activeSessions.length === 0 && <div className="empty-state">No live sessions are open. Start a meeting, office chat, broadcast, or approval room from this workstation.</div>}
        </div>
      </div>

      <div className="panel module-side">
        <PanelHeader icon={MessageSquareText} title="Live Channels" action="Office nodes" />
        <div className="live-channel-list">
          {channels.map(({ name, detail, icon: Icon, type }) => (
            <button type="button" key={name} onClick={() => startSession(type)}>
              <Icon size={17} />
              <span>{name}<small>{detail}</small></span>
              <ChevronRight size={14} />
            </button>
          ))}
        </div>
        {primarySession && (
          <div className="live-current-room">
            <strong>Current room</strong>
            <span>{primarySession.title}</span>
            <small>{primarySession.purpose}</small>
            <button type="button" onClick={() => onSendLiveSessionSummary(primarySession.id)}><Mail size={14} /> Send summary</button>
            <button type="button" onClick={() => onCreateLiveSessionFollowUpTask(primarySession.id)}><SquareCheckBig size={14} /> Create follow-up</button>
            <button type="button" onClick={() => onBuildLiveSessionPacket(primarySession.id)}><ArchiveIcon size={14} /> Build packet</button>
            <button type="button" onClick={() => onOpenSection("Reports")}><FileCheck2 size={14} /> Open linked reports</button>
          </div>
        )}
        <div className="provision-summary">
          <strong>Audit behavior</strong>
          <span>Calls, chats, broadcasts, shared documents, and approval discussions can be linked to meetings, reports, approvals, or archive records.</span>
        </div>
      </div>
    </section>
  );
}

function Transfers({
  transfers,
  permissions,
  offlineQueue,
  onSync,
  onCreateTransfer,
  onAcknowledgeTransfer,
  onUpdateTransferRisk,
  onExecuteTransfer,
  onPrepareTransfer,
  onRevokeAccess,
  onActivateStation,
  onVerifyTransfer,
  onRecordLetter,
  onScheduleTransfer,
  onNoteTransfer,
  onWatchTransfer,
  onLinkPersonnel,
  onLinkTask,
  onLinkReport,
  onArchiveTransfer,
  onBulkVerify,
  onRefreshDigest,
  digest
}: {
  transfers: Transfer[];
  permissions: Permissions;
  offlineQueue: OfflineAction[];
  onSync: () => void;
  onCreateTransfer: (draft: Omit<Transfer, "id" | "step" | "risk">) => void;
  onAcknowledgeTransfer: (id: string) => void;
  onUpdateTransferRisk: (id: string, risk: string) => void;
  onExecuteTransfer: (id: string) => void;
  onPrepareTransfer: (id: string) => void;
  onRevokeAccess: (id: string) => void;
  onActivateStation: (id: string) => void;
  onVerifyTransfer: (id: string) => void;
  onRecordLetter: (id: string) => void;
  onScheduleTransfer: (id: string) => void;
  onNoteTransfer: (id: string) => void;
  onWatchTransfer: (id: string) => void;
  onLinkPersonnel: (id: string) => void;
  onLinkTask: (id: string) => void;
  onLinkReport: (id: string) => void;
  onArchiveTransfer: (id: string) => void;
  onBulkVerify: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: TransferDigest | null;
}) {
  const [person, setPerson] = React.useState("Rev. Grace Walker");
  const [from, setFrom] = React.useState("County Mission Office");
  const [to, setTo] = React.useState("Riverbend Area Office");
  const [stepFilter, setStepFilter] = React.useState("All steps");
  const [feedback, setFeedback] = React.useState("");
  const stepOptions = React.useMemo(() => ["All steps", ...Array.from(new Set(transfers.map((transfer) => transfer.step))).sort()], [transfers]);
  const visibleTransfers = React.useMemo(() => (
    transfers.filter((transfer) => !transfer.archived && (stepFilter === "All steps" || transfer.step === stepFilter))
  ), [stepFilter, transfers]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!permissions.canExecuteTransfers) {
      setFeedback("This station is not authorized to create transfers.");
      return;
    }
    onCreateTransfer({ person, from, to });
    setFeedback(`${person} transfer has been created.`);
    setPerson("New transfer recipient");
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={Signature} title="Transfer Identity Migration" action={`${visibleTransfers.length} visible`} />
        {!permissions.canExecuteTransfers && (
          <div className="permission-warning">
            <LockKeyhole size={16} />
            <span>This station can view transfers, but cannot execute identity migration.</span>
          </div>
        )}
        <div className="archive-toolbar">
          <label>
            <span>Step</span>
            <select value={stepFilter} onChange={(event) => setStepFilter(event.target.value)}>
              {stepOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" onClick={onRefreshDigest}><RefreshCw size={14} /> Digest</button>
          <button disabled={!permissions.canExecuteTransfers || !visibleTransfers.length} type="button" onClick={() => onBulkVerify(visibleTransfers.slice(0, 3).map((transfer) => transfer.id))}><ShieldCheck size={14} /> Bulk verify</button>
        </div>
        {digest && (
          <div className="workflow-digest">
            <Insight label="Ready" value={String(digest.ready)} />
            <Insight label="Pending" value={String(digest.pending)} />
            <Insight label="Letters" value={String(digest.letters ?? 0)} />
            <Insight label="Scheduled" value={String(digest.scheduled ?? 0)} />
            <Insight label="Noted" value={String(digest.noted ?? 0)} />
            <Insight label="Watched" value={String(digest.watched ?? 0)} />
            <Insight label="Linked" value={String(digest.linked ?? 0)} />
            <Insight label="Archived" value={String(digest.archived ?? 0)} />
            <Insight label="Next transfer" value={digest.nextTransfer} />
          </div>
        )}
        <div className="transfer-list">
          {visibleTransfers.map((transfer) => (
            <article className="transfer-card" key={transfer.person}>
              <h2>{transfer.person}</h2>
              <div className="route-box">
                <strong>{transfer.from}</strong>
                <ChevronRight size={16} />
                <strong>{transfer.to}</strong>
              </div>
              <span>{transfer.step}</span>
              <p>{transfer.risk}</p>
              <div className="approval-meta">
                <small>{transfer.letterStatus ? `${transfer.letterStatus}: ${transfer.letterRef}` : "No letter"}</small>
                <small>{transfer.scheduledFor ? `Scheduled ${transfer.scheduledFor}` : "Unscheduled"}</small>
                <small>{transfer.notes?.length ?? 0} notes</small>
                <small>{transfer.watchers?.length ?? 0} watchers</small>
                <small>{transfer.personnelRecord ? `Personnel ${transfer.personnelRecord}` : "No personnel link"}</small>
                <small>{transfer.linkedTask ? `Task ${transfer.linkedTask}` : "No task link"}</small>
                <small>{transfer.linkedReport ? `Report ${transfer.linkedReport}` : "No report link"}</small>
              </div>
              <div className="pipeline mini">
                {["Letter", "Acknowledge", "Revoke", "Activate", "Audit"].map((step) => (
                  <div className="pipeline-step" key={step}>{step}</div>
                ))}
              </div>
              <div className="action-row">
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onRecordLetter(transfer.id)}><FileCheck2 size={15} /> Letter</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onScheduleTransfer(transfer.id)}><CalendarDays size={15} /> Schedule</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onNoteTransfer(transfer.id)}><MessageSquareText size={15} /> Note</button>
                <button onClick={() => onWatchTransfer(transfer.id)}><Bell size={15} /> Watch</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onLinkPersonnel(transfer.id)}><Users size={15} /> Personnel</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onLinkTask(transfer.id)}><SquareCheckBig size={15} /> Task link</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onLinkReport(transfer.id)}><FileCheck2 size={15} /> Report link</button>
                <button
                  aria-label={`Prepare transfer for ${transfer.person}`}
                  disabled={!permissions.canExecuteTransfers}
                  onClick={() => onPrepareTransfer(transfer.id)}
                >
                  <ClipboardCheck size={15} /> Prepare
                </button>
                <button
                  aria-label={`Acknowledge transfer for ${transfer.person}`}
                  disabled={!permissions.canExecuteTransfers}
                  onClick={() => onAcknowledgeTransfer(transfer.id)}
                >
                  <CheckCircle2 size={15} /> Acknowledge
                </button>
                <button
                  aria-label={`Flag risk for ${transfer.person}`}
                  disabled={!permissions.canExecuteTransfers}
                  onClick={() => onUpdateTransferRisk(transfer.id, transfer.risk === "Supervisor review required" ? "Session switch pending" : "Supervisor review required")}
                >
                  <AlertTriangle size={15} /> Risk
                </button>
                <button
                  aria-label={`Revoke old access for ${transfer.person}`}
                  disabled={!permissions.canExecuteTransfers}
                  onClick={() => onRevokeAccess(transfer.id)}
                >
                  <LockKeyhole size={15} /> Revoke access
                </button>
                <button
                  aria-label={`Activate station for ${transfer.person}`}
                  disabled={!permissions.canExecuteTransfers}
                  onClick={() => onActivateStation(transfer.id)}
                >
                  <RadioTower size={15} /> Activate
                </button>
                <button
                  aria-label={`Execute transfer for ${transfer.person}`}
                  disabled={!permissions.canExecuteTransfers}
                  onClick={() => onExecuteTransfer(transfer.id)}
                >
                  <RefreshCw size={15} /> Execute switch
                </button>
                <button
                  aria-label={`Verify transfer for ${transfer.person}`}
                  disabled={!permissions.canExecuteTransfers}
                  onClick={() => onVerifyTransfer(transfer.id)}
                >
                  <CheckCircle2 size={15} /> Verify
                </button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => onArchiveTransfer(transfer.id)}><ArchiveIcon size={15} /> Archive</button>
              </div>
            </article>
          ))}
          {visibleTransfers.length === 0 && <div className="empty-state">No transfers match the current step filter.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Create Transfer" action="Mission" />
        {!permissions.canExecuteTransfers && (
          <div className="permission-warning">
            <LockKeyhole size={16} />
            <span>Transfer creation requires delegated transfer authority.</span>
          </div>
        )}
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Recipient</span>
            <input value={person} onChange={(event) => setPerson(event.target.value)} />
          </label>
          <label>
            <span>Current station</span>
            <input value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label>
            <span>New station</span>
            <input value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button disabled={!permissions.canExecuteTransfers} type="submit"><Plus size={15} /> Create transfer</button>
        </form>
      </div>
      <OfflinePanel offlineMode networkOnline={navigator.onLine} offlineQueue={offlineQueue} offlineConflicts={buildOfflineConflicts(offlineQueue)} syncHistory={[]} installReady onSync={onSync} />
    </section>
  );
}

function Archive({
  documents,
  station,
  offlineMode,
  manifest,
  onArchiveDocument,
  onUpdateClassification,
  onUpdateOwner,
  onMarkReview,
  onMarkArchived,
  onSealDocument,
  onPlaceHold,
  onUpdateRetention,
  onDuplicateDocument,
  onVerifyDocument,
  onAssignCustody,
  onUpdateChain,
  onExtractText,
  onLinkReport,
  onLinkApproval,
  onWatchDocument,
  onExportDocument,
  onUploadFile,
  onBulkSeal,
  onRefreshManifest
}: {
  documents: DocumentRecord[];
  station: StationCard;
  offlineMode: boolean;
  manifest: ArchiveManifest | null;
  onArchiveDocument: (record: Omit<DocumentRecord, "id" | "storageKey" | "retainedUntil" | "createdAt">) => void;
  onUpdateClassification: (id: string, classification: string) => void;
  onUpdateOwner: (id: string, owner: string) => void;
  onMarkReview: (id: string) => void;
  onMarkArchived: (id: string) => void;
  onSealDocument: (id: string) => void;
  onPlaceHold: (id: string) => void;
  onUpdateRetention: (id: string) => void;
  onDuplicateDocument: (id: string) => void;
  onVerifyDocument: (id: string) => void;
  onAssignCustody: (id: string) => void;
  onUpdateChain: (id: string) => void;
  onExtractText: (id: string) => void;
  onLinkReport: (id: string) => void;
  onLinkApproval: (id: string) => void;
  onWatchDocument: (id: string) => void;
  onExportDocument: (id: string) => void;
  onUploadFile: (id: string, file: File) => void;
  onBulkSeal: (ids: string[]) => void;
  onRefreshManifest: () => void;
}) {
  const [name, setName] = React.useState("Signed mission authorization.pdf");
  const [classification, setClassification] = React.useState("Signed document");
  const [source, setSource] = React.useState("ChurchMail");
  const [fileType, setFileType] = React.useState("PDF");
  const [sourceFilter, setSourceFilter] = React.useState("All sources");
  const [statusFilter, setStatusFilter] = React.useState("All statuses");
  const [ownerFilter, setOwnerFilter] = React.useState("All owners");
  const [feedback, setFeedback] = React.useState("");
  const sourceOptions = React.useMemo(() => ["All sources", ...Array.from(new Set(documents.map((document) => document.source))).sort()], [documents]);
  const statusOptions = React.useMemo(() => ["All statuses", ...Array.from(new Set(documents.map((document) => document.status))).sort()], [documents]);
  const ownerOptions = React.useMemo(() => ["All owners", ...Array.from(new Set(documents.map((document) => document.owner))).sort()], [documents]);
  const visibleDocuments = React.useMemo(() => documents.filter((document) => {
    const sourceMatches = sourceFilter === "All sources" || document.source === sourceFilter;
    const statusMatches = statusFilter === "All statuses" || document.status === statusFilter;
    const ownerMatches = ownerFilter === "All owners" || document.owner === ownerFilter;
    return sourceMatches && statusMatches && ownerMatches;
  }), [documents, ownerFilter, sourceFilter, statusFilter]);
  const archivedCount = documents.filter((document) => document.status === "Archived").length;
  const inReviewCount = documents.filter((document) => document.status === "In Review").length;
  const fileTypeCount = new Set(documents.map((document) => document.fileType)).size;
  const sealedCount = documents.filter((document) => document.status === "Sealed").length;
  const holdCount = documents.filter((document) => document.status === "Legal Hold").length;
  const permanentCount = manifest?.permanent ?? documents.filter((document) => document.retainedUntil === "Permanent").length;
  const verifiedCount = manifest?.verified ?? documents.filter((document) => document.verified).length;
  const linkedCount = manifest?.linked ?? documents.filter((document) => document.linkedReport || document.linkedApproval).length;
  const exportedCount = manifest?.exported ?? documents.filter((document) => document.exportedAt).length;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onArchiveDocument({
      name,
      classification,
      source,
      owner: station.email,
      fileType,
      status: offlineMode ? "Queued" : "Archived"
    });
    setFeedback(offlineMode ? "Document metadata queued for object vault sync." : "Document metadata registered in the object vault.");
    setName(`${classification.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${documents.length + 1}.${fileType.toLowerCase() === "pdf" ? "pdf" : "dat"}`);
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={Files} title="Document Archive Vault" action={`${visibleDocuments.length} visible`} />
        <div className="office-summary-grid">
          <Insight label="Archived" value={String(archivedCount)} />
          <Insight label="In review" value={String(inReviewCount)} />
          <Insight label="File types" value={String(fileTypeCount)} />
        </div>
        <div className="office-summary-grid">
          <Insight label="Sealed" value={String(sealedCount)} />
          <Insight label="Legal holds" value={String(holdCount)} />
          <Insight label="Permanent" value={String(permanentCount)} />
        </div>
        <div className="office-summary-grid">
          <Insight label="Verified" value={String(verifiedCount)} />
          <Insight label="Linked" value={String(linkedCount)} />
          <Insight label="Exported" value={String(exportedCount)} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Source</span>
            <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
              {sourceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Owner</span>
            <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
              {ownerOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" onClick={onRefreshManifest}><RefreshCw size={14} /> Manifest</button>
          <button type="button" onClick={() => onBulkSeal(visibleDocuments.slice(0, 3).map((document) => document.id))}><LockKeyhole size={14} /> Bulk seal</button>
        </div>
        <div className="data-table document-table">
          <div className="table-row table-head">
            <span>Document</span><span>Class</span><span>Source</span><span>Owner</span><span>Status</span>
          </div>
          {visibleDocuments.map((document) => (
            <div className="table-row" key={document.id}>
              <strong>
                {document.name}
                <small>{[
                  document.verified ? "Verified" : "",
                  document.custodian ? `Custody: ${document.custodian}` : "",
                  document.chainHash ? "Chain hash" : "",
                  document.files?.length ? `${document.files.length} files` : "",
                  document.extractedText ? "Text indexed" : "",
                  document.watchers?.length ? `${document.watchers.length} watchers` : ""
                ].filter(Boolean).join(" / ")}</small>
              </strong>
              <span>{document.classification}</span>
              <span>{document.source}</span>
              <span>{document.owner}</span>
              <div className="table-actions">
                <StatusPill status={document.status} />
                <button onClick={() => onUpdateClassification(document.id, document.classification === "Executive packet" ? "Report evidence" : "Executive packet")}><SlidersHorizontal size={14} /> Class</button>
                <button onClick={() => onUpdateOwner(document.id, station.email)}><Users size={14} /> Owner</button>
                <button onClick={() => onMarkReview(document.id)}><FileClock size={14} /> Review</button>
                <button onClick={() => onMarkArchived(document.id)}><Files size={14} /> Archive</button>
                <button onClick={() => onSealDocument(document.id)}><LockKeyhole size={14} /> Seal</button>
                <button onClick={() => onPlaceHold(document.id)}><ShieldCheck size={14} /> Hold</button>
                <button onClick={() => onUpdateRetention(document.id)}><TimerReset size={14} /> Retain</button>
                <button onClick={() => onDuplicateDocument(document.id)}><Files size={14} /> Copy</button>
                <button onClick={() => onVerifyDocument(document.id)}><ShieldCheck size={14} /> Verify</button>
                <button onClick={() => onAssignCustody(document.id)}><Users size={14} /> Custody</button>
                <button onClick={() => onUpdateChain(document.id)}><LockKeyhole size={14} /> Chain</button>
                <button onClick={() => onExtractText(document.id)}><FileText size={14} /> Extract</button>
                <button onClick={() => onLinkReport(document.id)}><FileBarChart2 size={14} /> Report</button>
                <button onClick={() => onLinkApproval(document.id)}><BadgeCheck size={14} /> Approval</button>
                <button onClick={() => onWatchDocument(document.id)}><Bell size={14} /> Watch</button>
                <button onClick={() => onExportDocument(document.id)}><Download size={14} /> Export</button>
                <label className="file-action">
                  <Upload size={14} /> Upload
                  <input type="file" onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) onUploadFile(document.id, file);
                    event.currentTarget.value = "";
                  }} />
                </label>
                {document.files?.[0] && <button onClick={() => void downloadStoredFile(document.files![0])}><Download size={14} /> View</button>}
              </div>
            </div>
          ))}
          {visibleDocuments.length === 0 && <div className="empty-state">No documents match the current archive filters.</div>}
        </div>
      </div>

      <div className="panel module-side">
        <PanelHeader icon={FileClock} title="Register Attachment" action={offlineMode ? "Queue" : "Archive"} />
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>File name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Classification</span>
            <select value={classification} onChange={(event) => setClassification(event.target.value)}>
              <option>Policy memo</option>
              <option>Report evidence</option>
              <option>Signed document</option>
              <option>Voice report</option>
              <option>Financial packet</option>
              <option>Transfer letter</option>
            </select>
          </label>
          <label>
            <span>Source workflow</span>
            <select value={source} onChange={(event) => setSource(event.target.value)}>
              <option>ChurchMail</option>
              <option>Report</option>
              <option>Approval</option>
              <option>Transfer</option>
              <option>Audit</option>
            </select>
          </label>
          <label>
            <span>File type</span>
            <select value={fileType} onChange={(event) => setFileType(event.target.value)}>
              <option>PDF</option>
              <option>Images</option>
              <option>Spreadsheet</option>
              <option>Audio</option>
              <option>Video</option>
              <option>Archive</option>
            </select>
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button type="submit"><Files size={15} /> Register document</button>
        </form>
        <div className="provision-summary">
          <strong>Storage target</strong>
          <span>Records are assigned object-vault keys now. Later this maps directly to S3, Supabase Storage, or another object storage provider.</span>
        </div>
      </div>
    </section>
  );
}

function AccountSettings({
  station,
  offices,
  stationDirectory,
  permissions,
  offlineMode,
  apiStatus,
  apiStatusError,
  pwa,
  session,
  onToggleOffline,
  onRefreshApi,
  onResetDemoData,
  onChangePassword,
  onCreateAccount,
  onResetAccess,
  onSuspendAccount,
  onActivateAccount,
  onDeleteAccount,
  onOpenAudit
}: {
  station: StationCard;
  offices: Office[];
  stationDirectory: StationCard[];
  permissions: Permissions;
  offlineMode: boolean;
  apiStatus: ApiStatus | null;
  apiStatusError: string;
  pwa: ReturnType<typeof usePwaInstallPrompt>;
  session: Session;
  onToggleOffline: () => void;
  onRefreshApi: () => void;
  onResetDemoData: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => AuthActionResult;
  onCreateAccount: (account: CreateAccountInput) => AuthActionResult;
  onResetAccess: (id: string) => void;
  onSuspendAccount: (id: string) => void;
  onActivateAccount: (id: string) => void;
  onDeleteAccount: (id: string) => AuthActionResult;
  onOpenAudit: () => void;
}) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [accountFeedback, setAccountFeedback] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [officeName, setOfficeName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [level, setLevel] = React.useState<StationLevel>("Local Branch");
  const [department, setDepartment] = React.useState("Church Administration");
  const manageableStations = stationDirectory.filter((item) => item.status !== "Deleted");
  const currentOffice = offices.find((office) => normalizeStationEmail(office.email) === normalizeStationEmail(station.email));
  const canManageUsers = permissions.canOverride || permissions.canCreateOffices;
  const accountStationKey = (item: StationCard) => item.id ?? item.email;

  function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setAccountFeedback("New password and confirmation do not match.");
      return;
    }
    const result = onChangePassword(currentPassword, newPassword);
    setAccountFeedback(result.message ?? (result.ok ? "Password updated." : "Password could not be updated."));
    if (result.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  function submitCreateAccount(event: React.FormEvent) {
    event.preventDefault();
    const result = onCreateAccount({ fullName, officeName, email, password, level, department, autoApprove: canManageUsers });
    setAccountFeedback(result.message ?? (result.ok ? "Account created." : "Account could not be created."));
    if (result.ok) {
      setFullName("");
      setOfficeName("");
      setEmail("");
      setPassword("");
      setDepartment("Church Administration");
      setLevel("Local Branch");
    }
  }

  function deleteAccount(id: string) {
    const result = onDeleteAccount(id);
    setAccountFeedback(result.message ?? (result.ok ? "Account deleted." : "Account could not be deleted."));
  }

  return (
    <section className="account-settings-page">
      <div className="account-settings-hero">
        <div>
          <span>Account and User Management</span>
          <h2>Account Settings</h2>
          <p>Manage your sign-in, station profile, account status, web app install, sync controls, and user lifecycle from one clean workspace.</p>
        </div>
        <div className="account-health-card">
          <span>Signed in as</span>
          <strong>{station.email}</strong>
          <small>{station.level} / {station.authority}</small>
        </div>
      </div>

      {accountFeedback && <div className="compose-feedback">{accountFeedback}</div>}

      <div className="account-settings-grid">
        <form className="account-card" onSubmit={submitPassword}>
          <PanelHeader icon={LockKeyhole} title="Password" action="self service" />
          <label><span>Current password</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" /></label>
          <label><span>New password</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" /></label>
          <label><span>Confirm new password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></label>
          <button type="submit"><KeyRound size={15} /> Reset my password</button>
        </form>

        <div className="account-card">
          <PanelHeader icon={Settings} title="System Access" action="moved from header" />
          <div className="account-status-list">
            <div><span>Sync mode</span><strong>{offlineMode ? "Offline queue" : "Live sync"}</strong></div>
            <div><span>API</span><strong>{apiStatusError || (apiStatus?.serveWeb ? "API + web" : "API live")}</strong></div>
            <div><span>Web app</span><strong>{pwa.installed ? "Installed" : pwa.canInstall ? "Install available" : "Web ready"}</strong></div>
            <div><span>Session</span><strong>{session.startedAt}</strong></div>
          </div>
          <div className="account-action-row">
            <button type="button" onClick={onToggleOffline}>{offlineMode ? <RefreshCw size={15} /> : <CloudOff size={15} />}{offlineMode ? "Return live" : "Work offline"}</button>
            <button type="button" onClick={onRefreshApi}><Server size={15} /> Refresh API</button>
            <button type="button" disabled={!pwa.canInstall || pwa.installed} onClick={pwa.install}><Download size={15} /> Install app</button>
            <button type="button" onClick={onOpenAudit}><ShieldCheck size={15} /> Audit trail</button>
            {permissions.canOverride && <button type="button" onClick={onResetDemoData}><TimerReset size={15} /> Reset demo</button>}
          </div>
        </div>

        <div className="account-card account-profile-card">
          <PanelHeader icon={BadgeCheck} title="Station Profile" action={station.status ?? "Active"} />
          <div className="account-profile-grid">
            <div><span>Office</span><strong>{station.title}</strong></div>
            <div><span>Email</span><strong>{station.email}</strong></div>
            <div><span>Level</span><strong>{station.level}</strong></div>
            <div><span>Department</span><strong>{currentOffice?.department ?? stationDepartment(station)}</strong></div>
            <div><span>Supervisor</span><strong>{currentOffice?.supervisor ?? "Assigned hierarchy"}</strong></div>
            <div><span>Verification</span><strong>{station.verified || currentOffice?.emailVerified ? "Verified" : "Needs review"}</strong></div>
          </div>
        </div>

        <form className="account-card" onSubmit={submitCreateAccount}>
          <PanelHeader icon={Plus} title="Add User" action={canManageUsers ? "admin create" : "approval request"} />
          <label><span>Full name</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="User full name" /></label>
          <label><span>Office / station name</span><input value={officeName} onChange={(event) => setOfficeName(event.target.value)} placeholder="Example: Monrovia Area Office" /></label>
          <label><span>Organizational email</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@rmvi.org" /></label>
          <label><span>Temporary password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
          <label><span>Level</span><select value={level} onChange={(event) => setLevel(event.target.value as StationLevel)}>{hierarchy.map((item) => <option key={item.level}>{item.level}</option>)}</select></label>
          <label><span>Department / role</span><input value={department} onChange={(event) => setDepartment(event.target.value)} /></label>
          <button type="submit"><Plus size={15} /> {canManageUsers ? "Create user account" : "Request account"}</button>
        </form>

        <div className="account-card account-users-card">
          <PanelHeader icon={Users} title="Users and Stations" action={`${manageableStations.length} accounts`} />
          <div className="account-user-list">
            {manageableStations.map((item) => {
              const id = accountStationKey(item);
              const isCurrent = normalizeStationEmail(item.email) === normalizeStationEmail(station.email);
              const canDeleteAccount = item.email !== "admin@rmvi.org" && (canManageUsers || isCurrent);
              return (
                <article key={item.email}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.email}</span>
                    <small>{item.level} / {item.status ?? "Ready"}</small>
                  </div>
                  <div className="account-user-actions">
                    <button type="button" disabled={!canManageUsers && !isCurrent} onClick={() => onResetAccess(id)}><TimerReset size={14} /> Reset</button>
                    <button type="button" disabled={!canManageUsers} onClick={() => onSuspendAccount(id)}><LockKeyhole size={14} /> Suspend</button>
                    <button type="button" disabled={!canManageUsers} onClick={() => onActivateAccount(id)}><CheckCircle2 size={14} /> Activate</button>
                    <button type="button" className="danger" disabled={!canDeleteAccount} onClick={() => deleteAccount(id)}><ArchiveIcon size={14} /> Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminBoard({
  stationDirectory,
  offices,
  apiStatus,
  session,
  permissions,
  auditRows,
  events,
  reports,
  approvals,
  tasks,
  escalations,
  transfers,
  documents,
  auditDigest,
  readinessDigest,
  sessionDigest,
  onRefreshApi,
  onOpenSection,
  onCreateOffice,
  onVerifyStation,
  onSuspendStation,
  onActivateStation,
  onBulkVerifyStations,
  onRenewSession,
  onRevokeSession,
  onRevokeStationSessions,
  onTrustSession,
  onRequireSessionMfa,
  onCreateAuditNote,
  onArchiveGovernanceSnapshot,
  onRefreshAuditDigest,
  onApproveOfficeAccount,
  onRejectOfficeAccount,
  onResetOfficeAccess
}: {
  stationDirectory: StationCard[];
  offices: Office[];
  apiStatus: ApiStatus | null;
  session: Session;
  permissions: Permissions;
  auditRows: AuditRow[];
  events: string[];
  reports: Report[];
  approvals: Approval[];
  tasks: GovernanceTask[];
  escalations: Escalation[];
  transfers: Transfer[];
  documents: DocumentRecord[];
  auditDigest: AuditDigest | null;
  readinessDigest: ReadinessDigest | null;
  sessionDigest: SessionDigest | null;
  onRefreshApi: () => void;
  onOpenSection: (section: Section) => void;
  onCreateOffice: () => void;
  onVerifyStation: (id: string) => void;
  onSuspendStation: (id: string) => void;
  onActivateStation: (id: string) => void;
  onBulkVerifyStations: () => void;
  onRenewSession: () => void;
  onRevokeSession: (id: string) => void;
  onRevokeStationSessions: (email: string) => void;
  onTrustSession: (id: string) => void;
  onRequireSessionMfa: (id: string) => void;
  onCreateAuditNote: () => void;
  onArchiveGovernanceSnapshot: () => void;
  onRefreshAuditDigest: () => void;
  onApproveOfficeAccount: (id: string) => void;
  onRejectOfficeAccount: (id: string) => void;
  onResetOfficeAccess: (id: string) => void;
}) {
  const officialStations = stationDirectory.filter((station, index, items) => (
    items.findIndex((item) => item.email === station.email) === index
  ));
  const activeSessions = apiStatus?.sessions?.stations.length ? apiStatus.sessions.stations : [{
    id: session.token,
    email: session.email,
    startedAt: new Date().toISOString(),
    expiresAt: session.expiresAt ?? new Date().toISOString(),
    minutesRemaining: session.expiresAt ? Math.max(0, Math.round((Date.parse(session.expiresAt) - Date.now()) / 60000)) : 0,
    status: "Local"
  }];
  const openApprovals = approvals.filter((approval) => approval.state !== "Approved").length;
  const openTasks = tasks.filter((task) => task.status !== "Complete").length;
  const openEscalations = escalations.filter((item) => item.status !== "Resolved").length;
  const pendingTransfers = transfers.filter((transfer) => transfer.step !== "New station login ready").length;
  const pendingAccounts = offices.filter((office) => office.status === "Pending Approval" || office.status === "Rejected");
  const readyStations = officialStations.filter((station) => station.verified || !["Suspended", "Locked"].includes(station.status ?? "")).length;
  const sealedAuditRows = auditDigest?.sealed ?? auditRows.filter((row) => row.sealed || row.result.startsWith("Sealed:")).length;
  const apiConnected = apiStatus?.status?.toLowerCase() === "ok";
  const systemReadiness = readinessDigest
    ? `${readinessDigest.ready}/${readinessDigest.ready + readinessDigest.attention}`
    : `${apiStatus ? 4 : 1}/5`;
  const adminRoutes: { label: Section; icon: React.ElementType; detail: string }[] = [
    { label: "Offices", icon: Building2, detail: "Create offices, rotate credentials, verify station emails" },
    { label: "Hierarchy", icon: GitBranch, detail: "Verify station graph, suspend or reactivate station identities" },
    { label: "Personnel", icon: Users, detail: "Manage people, station access, training, clearance, transfers" },
    { label: "Audit", icon: ShieldCheck, detail: "Seal ledger rows, review sessions, run readiness and launch checks" },
    { label: "Archive", icon: Files, detail: "Inspect documents, evidence, object storage, chain custody" },
    { label: "Reports", icon: FileCheck2, detail: "Review report templates, submissions, approvals, evidence" }
  ];
  const storageMode = apiStatus?.storageProvider ?? (apiStatus?.persistence ? "json" : "local");
  const productionGate = storageMode === "database" ? "Production database" : "Database secret needed";
  const operatingStatus = apiConnected ? "Live" : "Needs API";
  const queueItems = [
    { icon: AlertTriangle, label: "Escalations", value: openEscalations, detail: "Executive attention queue", section: "Escalations" as Section },
    { icon: Workflow, label: "Approvals", value: openApprovals, detail: "Pending approval chains", section: "Approvals" as Section },
    { icon: SquareCheckBig, label: "Tasks", value: openTasks, detail: "Open administrative work", section: "Tasks" as Section },
    { icon: Signature, label: "Transfers", value: pendingTransfers, detail: "Identity migration queue", section: "Transfers" as Section }
  ];
  const systemCards = [
    { icon: Server, label: "Live service", value: apiStatus?.status?.toUpperCase() ?? "LOCAL", detail: apiStatus ? `${formatUptime(apiStatus.uptimeSeconds)} uptime` : "Backend heartbeat unavailable" },
    { icon: Database, label: "Persistence", value: storageMode.toUpperCase(), detail: productionGate },
    { icon: LockKeyhole, label: "Current admin", value: session.email, detail: permissions.canOverride ? "Full administrator authority" : "Limited administrator view" },
    { icon: BadgeCheck, label: "Readiness", value: systemReadiness, detail: readinessDigest ? "Tracked launch checks" : "Local readiness estimate" }
  ];
  const stationGroups = [
    { label: "Verified", value: officialStations.filter((station) => station.verified).length },
    { label: "Ready", value: officialStations.filter((station) => !station.status || station.status === "Ready").length },
    { label: "Suspended", value: officialStations.filter((station) => station.status === "Suspended").length },
    { label: "Locked", value: officialStations.filter((station) => station.status === "Locked").length }
  ];
  const recentAdminEvents = [
    ...events.slice(0, 3).map((event) => ({ label: event.includes(":") ? event.split(":")[0] : "Event", detail: event })),
    ...auditRows.slice(0, 3).map((row) => ({ label: row.event, detail: `${row.actor} - ${row.object}` }))
  ].slice(0, 5);
  const adminGroups: { label: string; items: { label: Section; icon: React.ElementType; detail: string }[] }[] = [
    {
      label: "Command",
      items: [
        { label: "Admin Board", icon: KeyRound, detail: "Administrator home" },
        { label: "Control Center", icon: LayoutDashboard, detail: "Global operating picture" },
        { label: "ChurchMail", icon: Mail, detail: "Governance communications" },
        { label: "Reports", icon: FileCheck2, detail: "Templates and submissions" }
      ]
    },
    {
      label: "Governance Work",
      items: [
        { label: "Approvals", icon: BadgeCheck, detail: "Delegated authorization" },
        { label: "Tasks", icon: SquareCheckBig, detail: "Station assignments" },
        { label: "Escalations", icon: AlertTriangle, detail: "Executive attention" },
        { label: "Transfers", icon: Signature, detail: "Identity migration" }
      ]
    },
    {
      label: "System Controls",
      items: [
        { label: "Offices", icon: Building2, detail: "Station provisioning" },
        { label: "Hierarchy", icon: GitBranch, detail: "Authority graph" },
        { label: "Personnel", icon: Users, detail: "Access and people" },
        { label: "Archive", icon: Files, detail: "Vault and evidence" },
        { label: "Audit", icon: ShieldCheck, detail: "Security ledger" }
      ]
    }
  ];
  const focusCards = [
    { label: "Account requests", value: pendingAccounts.filter((office) => office.status === "Pending Approval").length, icon: KeyRound, section: "Offices" as Section, tone: "urgent" },
    { label: "Open escalations", value: openEscalations, icon: AlertTriangle, section: "Escalations" as Section, tone: "urgent" },
    { label: "Pending approvals", value: openApprovals, icon: Workflow, section: "Approvals" as Section, tone: "warning" },
    { label: "Open tasks", value: openTasks, icon: SquareCheckBig, section: "Tasks" as Section, tone: "normal" },
    { label: "Transfers pending", value: pendingTransfers, icon: Signature, section: "Transfers" as Section, tone: "normal" },
    { label: "Station identities", value: officialStations.length, icon: KeyRound, section: "Offices" as Section, tone: "normal" },
    { label: "Vault documents", value: documents.length, icon: Files, section: "Archive" as Section, tone: "normal" }
  ];
  const adminAppTiles = [
    { label: "Users", section: "Personnel" as Section, icon: Users, detail: `${officialStations.length} station identities`, tone: "blue" },
    { label: "Offices", section: "Offices" as Section, icon: Building2, detail: "Create nodes and workstations", tone: "gold" },
    { label: "Mail", section: "ChurchMail" as Section, icon: Mail, detail: "Official communication", tone: "blue" },
    { label: "Reports", section: "Reports" as Section, icon: FileCheck2, detail: `${reports.length} active packets`, tone: "green" },
    { label: "Approvals", section: "Approvals" as Section, icon: BadgeCheck, detail: `${openApprovals} awaiting review`, tone: "gold" },
    { label: "Audit", section: "Audit" as Section, icon: ShieldCheck, detail: `${sealedAuditRows} sealed records`, tone: "blue" },
    { label: "Archive", section: "Archive" as Section, icon: Files, detail: `${documents.length} vault documents`, tone: "green" },
    { label: "AI Desk", section: "AI Desk" as Section, icon: Sparkles, detail: "Drafts and summaries", tone: "gold" },
    { label: "Live Comms", section: "Live Comms" as Section, icon: Video, detail: "Meetings, chat, broadcasts", tone: "blue" }
  ];

  return (
    <section className="admin-portal-shell" aria-label="Remedy Movement International administrator board">
      <div className="admin-portal-topbar">
        <div className="admin-portal-brand">
          <div className="admin-portal-logo">
            <img src={CHURCH_LOGO_SRC} alt="Remedy Movement International logo" />
          </div>
          <div>
            <strong>Remedy Movement International</strong>
            <span>GCOS administrator board</span>
          </div>
        </div>
        <div className="admin-portal-state">
          <span><CircleDot size={10} /> {operatingStatus} admin</span>
          <span>{session.email}</span>
          <button onClick={onRefreshApi}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="admin-portal-layout">
        <aside className="admin-portal-rail" aria-label="Admin board navigation">
          <div className="admin-workspace-card">
            <span>Admin workspace</span>
            <strong>International HQ</strong>
            <p>Organized command access for users, stations, reports, audit, and live governance operations.</p>
          </div>
          {adminGroups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(({ label, icon: Icon, detail }) => (
                <button key={label} onClick={() => onOpenSection(label)} className={label === "Admin Board" ? "active" : ""}>
                  <Icon size={16} />
                  <span>{label}<small>{detail}</small></span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="admin-portal-main">
          <div className="admin-command-hero">
            <div className="admin-tab-heading">
              <div className="admin-tab-icon"><KeyRound size={24} /></div>
              <div>
                <span>System Administration</span>
                <h1>RMVI Admin Workspace</h1>
                <p>A clean command home for creating offices, approving users, monitoring reports, managing sessions, reviewing audit records, and routing executive work across GCOS.</p>
                <div className="admin-hero-brief" aria-label="Administrator operating context">
                  <span><ShieldCheck size={14} /> International HQ authority</span>
                  <span><RadioTower size={14} /> {openEscalations + openApprovals + openTasks + pendingTransfers} open work items</span>
                  <span><Database size={14} /> {productionGate}</span>
                </div>
              </div>
            </div>
            <div className="admin-command-summary">
              <div><span>Service</span><strong>{apiStatus?.status?.toUpperCase() ?? "LOCAL"}</strong><small>{apiStatus ? formatUptime(apiStatus.uptimeSeconds) : "local preview"}</small></div>
              <div><span>Admin</span><strong>{permissions.canOverride ? "Full Access" : "Limited"}</strong><small>{session.email}</small></div>
              <div><span>Ready</span><strong>{systemReadiness}</strong><small>launch checks</small></div>
            </div>
          </div>

          <div className="admin-app-suite" aria-label="Administrator app launcher">
            <div className="admin-suite-head">
              <div>
                <span>Admin apps</span>
                <strong>GCOS Workspace</strong>
              </div>
              <button onClick={() => onOpenSection("Offices")}><Plus size={14} /> New office</button>
            </div>
            <div className="admin-app-grid">
              {adminAppTiles.map(({ label, section, icon: Icon, detail, tone }) => (
                <button className={`admin-app-tile ${tone}`} key={label} onClick={() => onOpenSection(section)}>
                  <span><Icon size={22} /></span>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="admin-node-model" aria-label="GCOS node operating model">
            <div>
              <span>Core architecture</span>
              <strong>Every office is a node</strong>
              <p>Each RMVI office, department, unit, branch, or directorate is stored as one expandable organization node with a parent, level, workstation, permissions, reporting route, and communication tools.</p>
            </div>
            <div className="admin-node-flow">
              <article><GitBranch size={18} /><strong>parent_id</strong><small>Routes reports upward and directives downward.</small></article>
              <article><Building2 size={18} /><strong>Create node</strong><small>Admin assigns type, level, parent, and permission preset.</small></article>
              <article><Mail size={18} /><strong>Generated tools</strong><small>Dashboard, ChurchMail, reports, approvals, archive, and live comms.</small></article>
              <article><Video size={18} /><strong>Real-time work</strong><small>Video calls, chat, screen sharing, and meeting-linked decisions.</small></article>
              <article><Sparkles size={18} /><strong>AI layer</strong><small>Summaries, bottlenecks, draft memos, missing data, and forecasts.</small></article>
            </div>
          </div>

          <div className="admin-focus-board redesigned">
            <div className="admin-focus-title">
              <Zap size={17} />
              <strong>Today&apos;s Focus</strong>
              <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
            </div>
            <div className="admin-focus-grid">
              {focusCards.map(({ label, value, icon: Icon, section, tone }) => (
                <button className={`admin-focus-card ${tone}`} key={label} onClick={() => onOpenSection(section)}>
                  <span><Icon size={16} /></span>
                  <strong>{value}</strong>
                  <small>{label}</small>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>

          <div className="admin-console-grid">
            <div className="admin-console-panel admin-console-wide">
              <PanelHeader icon={SlidersHorizontal} title="Command Center" action="system console" />
              <div className="admin-system-grid">
                {systemCards.map(({ icon: Icon, label, value, detail }) => (
                  <article className="admin-system-card" key={label}>
                    <div><Icon size={17} /></div>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{detail}</small>
                  </article>
                ))}
              </div>
              <div className="admin-action-list">
                <button onClick={() => onOpenSection("Offices")}><Building2 size={16} /><span>Manage offices<small>Create stations, verify emails, and rotate access.</small></span><ChevronRight size={14} /></button>
                <button onClick={() => onOpenSection("Audit")}><ShieldCheck size={16} /><span>Security and audit<small>Review sessions, seal records, and refresh launch checks.</small></span><ChevronRight size={14} /></button>
                <button onClick={() => onOpenSection("Reports")}><FileCheck2 size={16} /><span>Reporting operations<small>Review templates, evidence, corrections, and approvals.</small></span><ChevronRight size={14} /></button>
                <button onClick={() => onOpenSection("Escalations")}><AlertTriangle size={16} /><span>Executive queue<small>Watch bottlenecks and route urgent matters.</small></span><ChevronRight size={14} /></button>
              </div>
            </div>

            <div className="admin-console-panel">
              <PanelHeader icon={RadioTower} title="Live Queue" action={`${openEscalations + openApprovals + openTasks + pendingTransfers} open`} />
              <div className="admin-queue-list">
                {queueItems.map(({ icon: Icon, label, value, detail, section }) => (
                  <button key={label} onClick={() => onOpenSection(section)}>
                    <Icon size={16} />
                    <span>{label}<small>{detail}</small></span>
                    <strong>{value}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-console-panel">
              <PanelHeader icon={Activity} title="Platform Health" action={apiStatus?.status ?? "local"} />
              <div className="admin-health-list">
                <div><span>Service</span><strong>{apiStatus?.service ?? "GCOS API"}</strong></div>
                <div><span>Uptime</span><strong>{apiStatus ? formatUptime(apiStatus.uptimeSeconds) : "Local"}</strong></div>
                <div><span>Storage</span><strong>{storageMode}</strong></div>
                <div><span>Production gate</span><strong>{productionGate}</strong></div>
                <div><span>Audit rows</span><strong>{auditRows.length}</strong></div>
                <div><span>Documents</span><strong>{documents.length}</strong></div>
              </div>
              <button className="wide-action" onClick={onRefreshApi}><RefreshCw size={15} /> Refresh health</button>
            </div>

            <div className="admin-console-panel admin-console-wide">
              <PanelHeader icon={KeyRound} title="Account Approval Queue" action={`${pendingAccounts.filter((office) => office.status === "Pending Approval").length} pending`} />
              <div className="admin-approval-queue">
                {pendingAccounts.length ? pendingAccounts.map((office) => (
                  <article key={office.id} className={office.status === "Rejected" ? "rejected" : ""}>
                    <div>
                      <span>{office.level} - {office.department}</span>
                      <strong>{office.name}</strong>
                      <small>{office.email} / Supervisor: {office.supervisor}</small>
                      <p>{office.notes?.at(-1) ?? "Account is waiting for administrator review."}</p>
                    </div>
                    <div className="admin-approval-actions">
                      <StatusPill status={office.status} />
                      <button disabled={office.status !== "Pending Approval"} onClick={() => onApproveOfficeAccount(office.id)}><CheckCircle2 size={14} /> Approve</button>
                      <button disabled={office.status !== "Pending Approval"} onClick={() => onRejectOfficeAccount(office.id)}><AlertTriangle size={14} /> Reject</button>
                      <button onClick={() => onResetOfficeAccess(office.id)}><LockKeyhole size={14} /> Reset access</button>
                    </div>
                  </article>
                )) : (
                  <div className="empty-state">No new account requests are waiting for approval.</div>
                )}
              </div>
            </div>

            <div className="admin-console-panel admin-console-wide">
              <PanelHeader icon={KeyRound} title="Station Registry" action={`${officialStations.length} identities`} />
              <div className="admin-station-summary">
                {stationGroups.map((group) => (
                  <div key={group.label}>
                    <strong>{group.value}</strong>
                    <span>{group.label}</span>
                  </div>
                ))}
              </div>
              <div className="admin-station-table">
                <div className="admin-station-row head"><span>Station</span><span>Level</span><span>Status</span><span>Actions</span></div>
                {officialStations.map((station) => {
                  const stationId = station.id ?? station.email;
                  return (
                    <div className="admin-station-row" key={station.email}>
                      <strong>{station.title}<small>{station.email}</small></strong>
                      <span>{station.level}<small>{station.authority}</small></span>
                      <span className="admin-station-state">{station.status ?? (station.verified ? "Verified" : "Ready")}</span>
                      <div className="admin-station-actions">
                        <button disabled={(station.status ?? "") !== "Pending Approval"} onClick={() => onApproveOfficeAccount(stationId)}><CheckCircle2 size={14} /> Approve</button>
                        <button onClick={() => onVerifyStation(stationId)}><ShieldCheck size={14} /> Verify</button>
                        <button onClick={() => onSuspendStation(stationId)}><LockKeyhole size={14} /> Suspend</button>
                        <button onClick={() => onActivateStation(stationId)}><CheckCircle2 size={14} /> Activate</button>
                        <button onClick={() => onResetOfficeAccess(stationId)}><TimerReset size={14} /> Reset</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="action-row">
                <button onClick={onCreateOffice} disabled={!permissions.canCreateOffices}><Plus size={15} /> Create office</button>
                <button onClick={onBulkVerifyStations}><ShieldCheck size={15} /> Bulk verify stations</button>
              </div>
            </div>

            <div className="admin-console-panel">
              <PanelHeader icon={LockKeyhole} title="Sessions" action={`${activeSessions.length} records`} />
              <div className="admin-session-list">
                {activeSessions.slice(0, 5).map((item) => (
                  <article key={`${item.email}-${item.startedAt}`}>
                    <strong>{item.email}</strong>
                    <span>{item.status ?? "Active"} - {item.minutesRemaining} minutes remaining</span>
                    <div className="compact-actions">
                      <button disabled={!item.id} onClick={() => item.id && onTrustSession(item.id)}>Trust</button>
                      <button disabled={!item.id} onClick={() => item.id && onRequireSessionMfa(item.id)}>MFA</button>
                      <button disabled={!item.id || item.id === session.token} onClick={() => item.id && onRevokeSession(item.id)}>Revoke</button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="action-row">
                <button onClick={onRenewSession}><RefreshCw size={15} /> Renew current</button>
                <button onClick={() => onRevokeStationSessions(session.email)}><LockKeyhole size={15} /> Revoke station</button>
              </div>
            </div>

            <div className="admin-console-panel">
              <PanelHeader icon={ShieldCheck} title="Audit Stream" action={`${sealedAuditRows} sealed`} />
              <div className="admin-event-list">
                {recentAdminEvents.length ? recentAdminEvents.map((event, index) => (
                  <article key={`${event.label}-${index}`}>
                    <span>{event.label}</span>
                    <strong>{event.detail}</strong>
                  </article>
                )) : (
                  <article>
                    <span>No events</span>
                    <strong>Audit stream is waiting for activity.</strong>
                  </article>
                )}
              </div>
              <div className="action-row">
                <button onClick={onCreateAuditNote}><FileText size={15} /> Admin note</button>
                <button onClick={onArchiveGovernanceSnapshot}><Files size={15} /> Archive snapshot</button>
                <button onClick={onRefreshAuditDigest}><RefreshCw size={15} /> Refresh digest</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );

  return (
    <section className="admin-board-shell" aria-label="Remedy Movement International administrator board">
      <div className="admin-hero">
        <div className="admin-identity">
          <div className="admin-brand-mark">
            <img src={CHURCH_LOGO_SRC} alt="Remedy Movement International logo" />
          </div>
          <div>
            <span>REMEDY MOVEMENT INTERNATIONAL</span>
            <h1>System Administrator Workstation</h1>
            <p>International HQ command board for deployment control, user lifecycle, station authority, audit override, ChurchMail governance, and live operations.</p>
          </div>
        </div>
        <div className="admin-hero-actions">
          <div className="admin-command-badge">
            <span>Admin board</span>
            <strong>rmvi.org/admin</strong>
          </div>
          <button onClick={onRefreshApi}><RefreshCw size={15} /> Refresh live status</button>
          <button onClick={onArchiveGovernanceSnapshot}><Files size={15} /> Archive snapshot</button>
          <button onClick={() => onOpenSection("Audit")}><ShieldCheck size={15} /> Open audit control</button>
        </div>
      </div>

      <div className="admin-status-strip">
        <div>
          <span>Operating status</span>
          <strong>{operatingStatus}</strong>
          <small>{apiStatus?.time ? formatDateTime(apiStatus.time) : "Local preview session"}</small>
        </div>
        <div>
          <span>Administrator</span>
          <strong>{session.email}</strong>
          <small>{sessionDigest?.active ?? activeSessions.length} active session records</small>
        </div>
        <div>
          <span>Stations</span>
          <strong>{readyStations}/{officialStations.length}</strong>
          <small>ready for sign-in and routing</small>
        </div>
        <div className={storageMode === "database" ? "ok" : "queued"}>
          <span>Production gate</span>
          <strong>{productionGate}</strong>
          <small>{storageMode === "database" ? "Managed persistence active" : "Set GCOS_DATABASE_URL in Replit"}</small>
        </div>
      </div>

      <div className="admin-board-grid">
        <div className="panel admin-primary-panel">
          <PanelHeader icon={SlidersHorizontal} title="Administrator Control Center" action="System console" />
          <div className="admin-system-grid">
            {systemCards.map(({ icon: Icon, label, value, detail }) => (
              <article className="admin-system-card" key={label}>
                <div><Icon size={17} /></div>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
              </article>
            ))}
          </div>
          <div className="admin-control-list">
            <article>
              <div>
                <strong>User lifecycle</strong>
                <span>Create offices, activate stations, suspend compromised accounts, and revoke sessions.</span>
              </div>
              <button onClick={() => onOpenSection("Offices")}><Building2 size={15} /> Manage offices</button>
            </article>
            <article>
              <div>
                <strong>Security and audit</strong>
                <span>Review active sessions, seal audit rows, archive snapshots, and verify launch readiness.</span>
              </div>
              <button onClick={() => onOpenSection("Audit")}><ShieldCheck size={15} /> Security desk</button>
            </article>
            <article>
              <div>
                <strong>Governance operations</strong>
                <span>Watch escalations, approvals, report submissions, transfers, and blocked tasks.</span>
              </div>
              <button onClick={() => onOpenSection("Escalations")}><AlertTriangle size={15} /> Operations queue</button>
            </article>
          </div>
        </div>

        <div className="panel admin-side-panel">
          <PanelHeader icon={Activity} title="Live Health" action={apiStatus?.status ?? "local"} />
          <div className="admin-health-list">
            <div><span>API service</span><strong>{apiStatus?.service ?? "GCOS API"}</strong></div>
            <div><span>Web served</span><strong>{apiStatus?.serveWeb ? "Yes" : "Preview"}</strong></div>
            <div><span>Storage</span><strong>{storageMode}</strong></div>
            <div><span>Audit rows</span><strong>{auditRows.length}</strong></div>
            <div><span>Documents</span><strong>{documents.length}</strong></div>
            <div><span>Transfers pending</span><strong>{pendingTransfers}</strong></div>
          </div>
          <button className="wide-action" onClick={onRefreshApi}><RefreshCw size={15} /> Refresh health</button>
        </div>

        <div className="panel admin-side-panel">
          <PanelHeader icon={RadioTower} title="Active Work Queue" action={`${openEscalations + openApprovals + openTasks + pendingTransfers} open`} />
          <div className="admin-queue-list">
            {queueItems.map(({ icon: Icon, label, value, detail, section }) => (
              <button key={label} onClick={() => onOpenSection(section)}>
                <Icon size={16} />
                <span>{label}<small>{detail}</small></span>
                <strong>{value}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="panel admin-primary-panel">
          <PanelHeader icon={KeyRound} title="Station Registry" action={`${officialStations.length} identities`} />
          <div className="admin-station-summary">
            {stationGroups.map((group) => (
              <div key={group.label}>
                <strong>{group.value}</strong>
                <span>{group.label}</span>
              </div>
            ))}
          </div>
          <div className="admin-station-list">
            {officialStations.map((station) => {
              const stationId = station.id ?? station.email;
              return (
                <article key={station.email}>
                  <div>
                    <strong>{station.title}</strong>
                    <span>{station.email}</span>
                    <small>{station.level} - {station.authority}</small>
                  </div>
                  <div className="admin-station-actions">
                    <span>{station.status ?? (station.verified ? "Verified" : "Ready")}</span>
                    <button onClick={() => onVerifyStation(stationId)}><ShieldCheck size={14} /> Verify</button>
                    <button onClick={() => onSuspendStation(stationId)}><LockKeyhole size={14} /> Suspend</button>
                    <button onClick={() => onActivateStation(stationId)}><CheckCircle2 size={14} /> Activate</button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="action-row">
            <button onClick={onCreateOffice} disabled={!permissions.canCreateOffices}><Plus size={15} /> Create office</button>
            <button onClick={onBulkVerifyStations}><ShieldCheck size={15} /> Bulk verify</button>
          </div>
        </div>

        <div className="panel admin-side-panel">
          <PanelHeader icon={LockKeyhole} title="Sessions & Access" action={`${activeSessions.length} records`} />
          <div className="office-summary-grid">
            <Insight label="Expiring soon" value={String(sessionDigest?.expiringSoon ?? activeSessions.filter((item) => item.minutesRemaining <= 30).length)} />
            <Insight label="Trusted" value={String(sessionDigest?.trusted ?? activeSessions.filter((item) => item.trusted).length)} />
            <Insight label="MFA required" value={String(sessionDigest?.mfaRequired ?? activeSessions.filter((item) => item.mfaRequired).length)} />
            <Insight label="Current" value={session.email} />
          </div>
          <div className="admin-session-list">
            {activeSessions.slice(0, 4).map((item) => (
              <article key={`${item.email}-${item.startedAt}`}>
                <strong>{item.email}</strong>
                <span>{item.status ?? "Active"} - {item.minutesRemaining} minutes remaining</span>
                <div className="compact-actions">
                  <button disabled={!item.id} onClick={() => item.id && onTrustSession(item.id)}>Trust</button>
                  <button disabled={!item.id} onClick={() => item.id && onRequireSessionMfa(item.id)}>MFA</button>
                  <button disabled={!item.id || item.id === session.token} onClick={() => item.id && onRevokeSession(item.id)}>Revoke</button>
                </div>
              </article>
            ))}
          </div>
          <div className="action-row">
            <button onClick={onRenewSession}><RefreshCw size={15} /> Renew current</button>
            <button onClick={() => onRevokeStationSessions(session.email)}><LockKeyhole size={15} /> Revoke station</button>
          </div>
        </div>

        <div className="panel admin-side-panel">
          <PanelHeader icon={GitBranch} title="Admin Navigation" action="Control map" />
          <div className="admin-route-list">
            {adminRoutes.map(({ label, icon: Icon, detail }) => (
              <button key={label} onClick={() => onOpenSection(label)}>
                <Icon size={16} />
                <span>{label}<small>{detail}</small></span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel admin-side-panel">
          <PanelHeader icon={ShieldCheck} title="Audit Stream" action={`${sealedAuditRows} sealed`} />
          <div className="admin-event-list">
            {recentAdminEvents.length ? recentAdminEvents.map((event, index) => (
              <article key={`${event.label}-${index}`}>
                <span>{event.label}</span>
                <strong>{event.detail}</strong>
              </article>
            )) : (
              <article>
                <span>No events</span>
                <strong>Audit stream is waiting for activity.</strong>
              </article>
            )}
          </div>
          <div className="action-row">
            <button onClick={onCreateAuditNote}><FileText size={15} /> Admin note</button>
            <button onClick={onRefreshAuditDigest}><RefreshCw size={15} /> Refresh digest</button>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={KeyRound} title="Administrator Command Board" action={permissions.canOverride ? "Full access" : "Limited"} />
        <div className="office-summary-grid audit-integrity-grid">
          <Insight label="Admin live link" value="rmvi.org/admin" />
          <Insight label="Station accounts" value={String(officialStations.length)} />
          <Insight label="Ready stations" value={`${readyStations}/${officialStations.length}`} />
          <Insight label="API status" value={apiStatus?.status ?? "Offline"} />
          <Insight label="Active sessions" value={String(sessionDigest?.active ?? activeSessions.length)} />
          <Insight label="Readiness" value={systemReadiness} />
          <Insight label="Open escalations" value={String(openEscalations)} />
          <Insight label="Open approvals" value={String(openApprovals)} />
          <Insight label="Audit sealed" value={String(sealedAuditRows)} />
        </div>
        <div className="action-row">
          <button onClick={onRefreshApi}><RefreshCw size={15} /> Refresh system</button>
          <button onClick={onCreateOffice} disabled={!permissions.canCreateOffices}><Plus size={15} /> Create office</button>
          <button onClick={onBulkVerifyStations}><ShieldCheck size={15} /> Verify stations</button>
          <button onClick={onRenewSession}><TimerReset size={15} /> Renew session</button>
          <button onClick={onCreateAuditNote}><FileText size={15} /> Admin note</button>
          <button onClick={onArchiveGovernanceSnapshot}><Files size={15} /> Archive snapshot</button>
          <button onClick={onRefreshAuditDigest}><RefreshCw size={15} /> Audit digest</button>
        </div>
        <div className="data-table">
          <div className="table-row table-head">
            <span>Station</span><span>Level</span><span>Authority</span><span>Status</span><span>Actions</span>
          </div>
          {officialStations.map((station) => {
            const stationId = station.id ?? station.email;
            return (
              <div className="table-row" key={station.email}>
                <strong>{station.email}<small>{station.title}</small></strong>
                <span>{station.level}</span>
                <span>{station.authority}</span>
                <span>{station.status ?? (station.verified ? "Verified" : "Ready")}</span>
                <span className="table-actions">
                  <button onClick={() => onVerifyStation(stationId)}><ShieldCheck size={14} /> Verify</button>
                  <button onClick={() => onSuspendStation(stationId)}><LockKeyhole size={14} /> Suspend</button>
                  <button onClick={() => onActivateStation(stationId)}><CheckCircle2 size={14} /> Activate</button>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel module-side">
        <PanelHeader icon={Server} title="Live System Health" action={apiStatus?.status ?? "checking"} />
        <div className="office-summary-grid">
          <Insight label="Service" value={apiStatus?.service ?? "GCOS API"} />
          <Insight label="Uptime" value={apiStatus ? `${apiStatus.uptimeSeconds}s` : "Local"} />
          <Insight label="Persistence" value={apiStatus?.storageProvider ?? apiStatus?.persistence ?? "local cache"} />
          <Insight label="Web served" value={apiStatus?.serveWeb ? "Yes" : "Preview"} />
          <Insight label="Reports" value={String(reports.length)} />
          <Insight label="Tasks" value={String(openTasks)} />
          <Insight label="Transfers" value={String(pendingTransfers)} />
          <Insight label="Documents" value={String(documents.length)} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{apiStatus?.time ? formatDateTime(apiStatus.time) : "Local browser"}</span>
            <strong>{apiConnected ? "Backend is connected" : "Backend is not connected"}</strong>
            <small>{apiStatus?.persistence ?? "Start the API service for full session, file, and persistence operations."}</small>
          </article>
          {events.slice(0, 5).map((event, index) => (
            <article className="source-map-item" key={`${event}-${index}`}>
              <span>Event {index + 1}</span>
              <strong>{event}</strong>
              <small>{event.includes(":") ? event.split(":")[0] : "Administrative event"}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="panel module-side">
        <PanelHeader icon={LockKeyhole} title="Sessions & Access" action={`${activeSessions.length} active`} />
        <div className="action-row">
          <button onClick={onRenewSession}><RefreshCw size={15} /> Renew</button>
          <button onClick={() => onRevokeStationSessions(session.email)}><LockKeyhole size={15} /> Revoke station</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Current user" value={session.email} />
          <Insight label="Expiring soon" value={String(sessionDigest?.expiringSoon ?? activeSessions.filter((item) => item.minutesRemaining <= 30).length)} />
          <Insight label="Trusted" value={String(sessionDigest?.trusted ?? activeSessions.filter((item) => item.trusted).length)} />
          <Insight label="MFA required" value={String(sessionDigest?.mfaRequired ?? activeSessions.filter((item) => item.mfaRequired).length)} />
        </div>
        <div className="source-map-list">
          {activeSessions.map((item) => (
            <article className="source-map-item" key={`${item.email}-${item.startedAt}`}>
              <span>{item.status ?? "Active"}</span>
              <strong>{item.email}</strong>
              <small>{item.minutesRemaining} minutes remaining - {item.deviceLabel ?? "unlabeled device"} - expires {formatDateTime(item.expiresAt)}</small>
              <div className="action-row compact-actions">
                <button disabled={!item.id} onClick={() => item.id && onTrustSession(item.id)}><ShieldCheck size={14} /> Trust</button>
                <button disabled={!item.id} onClick={() => item.id && onRequireSessionMfa(item.id)}><Signature size={14} /> MFA</button>
                <button disabled={!item.id || item.id === session.token} onClick={() => item.id && onRevokeSession(item.id)}><LockKeyhole size={14} /> Revoke</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel module-side">
        <PanelHeader icon={SlidersHorizontal} title="Admin Routes" action="Command map" />
        <div className="source-map-list">
          {adminRoutes.map(({ label, icon: Icon, detail }) => (
            <article className="source-map-item" key={label}>
              <span>{label}</span>
              <strong>{detail}</strong>
              <button onClick={() => onOpenSection(label)}><Icon size={15} /> Open {label}</button>
            </article>
          ))}
        </div>
      </div>

      <div className="panel module-side">
        <PanelHeader icon={BadgeCheck} title="Administrative Readiness" action={readinessDigest ? "tracked" : "local"} />
        <div className="office-summary-grid">
          <Insight label="Ready checks" value={String(readinessDigest?.ready ?? 0)} />
          <Insight label="Needs attention" value={String(readinessDigest?.attention ?? openEscalations)} />
          <Insight label="Acknowledged" value={String(readinessDigest?.acknowledged ?? 0)} />
          <Insight label="Owners" value={String(readinessDigest?.owned ?? offices.length)} />
          <Insight label="Scheduled" value={String(readinessDigest?.scheduled ?? 0)} />
          <Insight label="Next check" value={readinessDigest?.nextCheck ?? "API, storage, domain, users"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>Launch gate</span>
            <strong>{apiConnected ? "Local stack is live for testing" : "Connect the API before live rollout"}</strong>
            <small>Use Audit for full production readiness, deployment signoff, persistence, and compliance controls.</small>
          </article>
          <article className="source-map-item">
            <span>Work queue</span>
            <strong>{openTasks} tasks, {openApprovals} approvals, {pendingTransfers} transfers</strong>
            <small>{openEscalations} escalations require administrator visibility.</small>
          </article>
        </div>
      </div>
    </section>
  );
}

function Audit({
  auditRows,
  events,
  apiStatus,
  session,
  onCreateAuditNote,
  onFlagAuditRow,
  onRecordManualEvent,
  onClearEventLog,
  onAcknowledgeEvent,
  onPinEvent,
  onUpdateEventSeverity,
  onRouteEvent,
  onReplayEvent,
  onMuteEvent,
  onAssignEventOwner,
  onArchiveEvent,
  onBulkArchiveEvents,
  onRefreshEventDigest,
  onArchiveGovernanceSnapshot,
  onRenewSession,
  onRevokeSession,
  onRevokeStationSessions,
  onFlagSession,
  onExtendSession,
  onLockSession,
  onUnlockSession,
  onTrustSession,
  onRequireSessionMfa,
  onLabelSessionDevice,
  onNoteSession,
  onBulkRevokeSessions,
  onSealAuditRow,
  onVerifyAuditRow,
  onBulkFlagAuditRows,
  onUpdateAuditSeverity,
  onUpdateAuditCategory,
  onAssignAuditReviewer,
  onAppendAuditComment,
  onOpenAuditInvestigation,
  onCloseAuditInvestigation,
  onPlaceAuditHold,
  onReleaseAuditHold,
  onBulkSealAuditRows,
  onBulkVerifyAuditRows,
  onRefreshAuditDigest,
  digest,
  eventDigest,
  readinessDigest,
  sessionDigest,
  onSetReadinessDigest
}: {
  auditRows: AuditRow[];
  events: string[];
  apiStatus: ApiStatus | null;
  session: Session;
  onCreateAuditNote: () => void;
  onFlagAuditRow: (id: string) => void;
  onRecordManualEvent: () => void;
  onClearEventLog: () => void;
  onAcknowledgeEvent: (index: number) => void;
  onPinEvent: (index: number) => void;
  onUpdateEventSeverity: (index: number) => void;
  onRouteEvent: (index: number) => void;
  onReplayEvent: (index: number) => void;
  onMuteEvent: (index: number) => void;
  onAssignEventOwner: (index: number) => void;
  onArchiveEvent: (index: number) => void;
  onBulkArchiveEvents: (indices: number[]) => void;
  onRefreshEventDigest: () => void;
  onArchiveGovernanceSnapshot: () => void;
  onRenewSession: () => void;
  onRevokeSession: (id: string) => void;
  onRevokeStationSessions: (email: string) => void;
  onFlagSession: (id: string) => void;
  onExtendSession: (id: string) => void;
  onLockSession: (id: string) => void;
  onUnlockSession: (id: string) => void;
  onTrustSession: (id: string) => void;
  onRequireSessionMfa: (id: string) => void;
  onLabelSessionDevice: (id: string) => void;
  onNoteSession: (id: string) => void;
  onBulkRevokeSessions: (ids: string[]) => void;
  onSealAuditRow: (id: string) => void;
  onVerifyAuditRow: (id: string) => void;
  onBulkFlagAuditRows: (ids: string[]) => void;
  onUpdateAuditSeverity: (id: string) => void;
  onUpdateAuditCategory: (id: string) => void;
  onAssignAuditReviewer: (id: string) => void;
  onAppendAuditComment: (id: string) => void;
  onOpenAuditInvestigation: (id: string) => void;
  onCloseAuditInvestigation: (id: string) => void;
  onPlaceAuditHold: (id: string) => void;
  onReleaseAuditHold: (id: string) => void;
  onBulkSealAuditRows: (ids: string[]) => void;
  onBulkVerifyAuditRows: (ids: string[]) => void;
  onRefreshAuditDigest: () => void;
  digest: AuditDigest | null;
  eventDigest: EventDigest | null;
  readinessDigest: ReadinessDigest | null;
  sessionDigest: SessionDigest | null;
  onSetReadinessDigest: React.Dispatch<React.SetStateAction<ReadinessDigest | null>>;
}) {
  const [query, setQuery] = React.useState("");
  const [eventFilter, setEventFilter] = React.useState("All events");
  const [readiness, setReadiness] = React.useState<ReadinessReport | null>(null);
  const [securityControls, setSecurityControls] = React.useState<SecurityControlRecord[]>([]);
  const [securityDigest, setSecurityDigest] = React.useState<SecurityControlDigest | null>(null);
  const [complianceReviews, setComplianceReviews] = React.useState<ComplianceReview[]>([]);
  const [complianceDigest, setComplianceDigest] = React.useState<ComplianceDigest | null>(null);
  const [evidenceVault, setEvidenceVault] = React.useState<EvidenceRecord[]>([]);
  const [evidenceDigest, setEvidenceDigest] = React.useState<EvidenceDigest | null>(null);
  const [persistenceStatus, setPersistenceStatus] = React.useState<PersistenceStatus | null>(apiStatus?.persistenceStatus ?? null);
  const [backupManifest, setBackupManifest] = React.useState<PersistenceBackupManifest | null>(null);
  const [restoreDrill, setRestoreDrill] = React.useState<PersistenceRestoreDrill | null>(null);
  const [migrationPlan, setMigrationPlan] = React.useState<PersistenceMigrationPlan | null>(null);
  const [schemaPlan, setSchemaPlan] = React.useState<PersistenceSchemaPlan | null>(null);
  const [importDryRun, setImportDryRun] = React.useState<PersistenceImportDryRun | null>(null);
  const [cutoverChecklist, setCutoverChecklist] = React.useState<PersistenceCutoverChecklist | null>(null);
  const [launchReadiness, setLaunchReadiness] = React.useState<LaunchReadiness | null>(null);
  const [deploymentPlan, setDeploymentPlan] = React.useState<DeploymentPlan | null>(null);
  const [productionSecretsPlan, setProductionSecretsPlan] = React.useState<ProductionSecretsPlan | null>(null);
  const [operationalMonitor, setOperationalMonitor] = React.useState<OperationalMonitor | null>(null);
  const [launchSignoff, setLaunchSignoff] = React.useState<LaunchSignoff | null>(null);
  const [projectCompletion, setProjectCompletion] = React.useState<ProjectCompletion | null>(null);
  const [enterpriseCompletion, setEnterpriseCompletion] = React.useState<EnterpriseCompletion | null>(null);
  const [rolloutReadiness, setRolloutReadiness] = React.useState<RolloutReadiness | null>(null);
  const eventTypes = React.useMemo(() => ["All events", ...Array.from(new Set(auditRows.map((row) => row.event))).sort()], [auditRows]);
  const visibleRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return auditRows.filter((row) => {
      const eventMatches = eventFilter === "All events" || row.event === eventFilter;
      const queryMatches = !normalizedQuery || [row.event, row.actor, row.object, row.result, row.time].join(" ").toLowerCase().includes(normalizedQuery);
      return eventMatches && queryMatches;
    });
  }, [auditRows, eventFilter, query]);
  const sessionEntries = apiStatus?.sessions?.stations.length ? apiStatus.sessions.stations : [{
    email: session.email,
    startedAt: new Date().toISOString(),
    expiresAt: session.expiresAt ?? new Date().toISOString(),
    minutesRemaining: session.expiresAt ? Math.max(0, Math.round((Date.parse(session.expiresAt) - Date.now()) / 60000)) : 0,
    id: session.token,
    status: "Local"
  }];
  const activeSessionCount = Math.max(apiStatus?.sessions?.active ?? 0, sessionEntries.length);
  const expiringSoonCount = apiStatus?.sessions?.expiringSoon ?? sessionEntries.filter((item) => item.minutesRemaining <= 30).length;
  const lockedSessionCount = sessionDigest?.locked ?? sessionEntries.filter((item) => item.status === "Locked").length;
  const trustedSessionCount = sessionDigest?.trusted ?? sessionEntries.filter((item) => item.trusted).length;
  const mfaSessionCount = sessionDigest?.mfaRequired ?? sessionEntries.filter((item) => item.mfaRequired).length;
  const labeledSessionCount = sessionDigest?.labeled ?? sessionEntries.filter((item) => item.deviceLabel).length;
  const sealedCount = digest?.sealed ?? auditRows.filter((row) => row.sealed || row.result.startsWith("Sealed:")).length;
  const verifiedCount = digest?.verified ?? auditRows.filter((row) => row.verified).length;
  const flaggedCount = digest?.flagged ?? auditRows.filter((row) => row.result.startsWith("Flagged:")).length;
  const investigationCount = digest?.investigations ?? auditRows.filter((row) => row.investigation === "Open").length;
  const holdCount = digest?.holds ?? auditRows.filter((row) => row.hold).length;
  const criticalCount = digest?.critical ?? auditRows.filter((row) => row.severity === "Critical").length;

  React.useEffect(() => {
    void apiRequest<ReadinessReport>("/api/readiness").then(setReadiness).catch(() => undefined);
    void apiRequest<SecurityControlRecord[]>("/api/security-controls").then(setSecurityControls).catch(() => undefined);
    void apiRequest<SecurityControlDigest>("/api/security-controls/digest").then(setSecurityDigest).catch(() => undefined);
    void apiRequest<ComplianceReview[]>("/api/compliance-reviews").then(setComplianceReviews).catch(() => undefined);
    void apiRequest<ComplianceDigest>("/api/compliance-reviews/digest").then(setComplianceDigest).catch(() => undefined);
    void apiRequest<EvidenceRecord[]>("/api/evidence-vault").then(setEvidenceVault).catch(() => undefined);
    void apiRequest<EvidenceDigest>("/api/evidence-vault/digest").then(setEvidenceDigest).catch(() => undefined);
    void apiRequest<PersistenceStatus>("/api/persistence/status").then(setPersistenceStatus).catch(() => undefined);
    void apiRequest<PersistenceBackupManifest>("/api/persistence/backup-manifest").then(setBackupManifest).catch(() => undefined);
    void apiRequest<PersistenceRestoreDrill>("/api/persistence/restore-drill").then(setRestoreDrill).catch(() => undefined);
    void apiRequest<PersistenceMigrationPlan>("/api/persistence/migration-plan").then(setMigrationPlan).catch(() => undefined);
    void apiRequest<PersistenceSchemaPlan>("/api/persistence/schema-plan").then(setSchemaPlan).catch(() => undefined);
    void apiRequest<PersistenceImportDryRun>("/api/persistence/import-dry-run").then(setImportDryRun).catch(() => undefined);
    void apiRequest<PersistenceCutoverChecklist>("/api/persistence/cutover-checklist").then(setCutoverChecklist).catch(() => undefined);
    void apiRequest<OperationalMonitor>("/api/ops/monitor").then(setOperationalMonitor).catch(() => undefined);
    void apiRequest<LaunchReadiness>("/api/launch/readiness").then(setLaunchReadiness).catch(() => undefined);
    void apiRequest<DeploymentPlan>("/api/launch/deployment-plan").then(setDeploymentPlan).catch(() => undefined);
    void apiRequest<ProductionSecretsPlan>("/api/production/secrets-plan").then(setProductionSecretsPlan).catch(() => undefined);
    void apiRequest<LaunchSignoff>("/api/launch/signoff").then(setLaunchSignoff).catch(() => undefined);
    void apiRequest<ProjectCompletion>("/api/project/completion").then(setProjectCompletion).catch(() => undefined);
    void apiRequest<EnterpriseCompletion>("/api/enterprise/completion").then(setEnterpriseCompletion).catch(() => undefined);
    void apiRequest<RolloutReadiness>("/api/rollout/readiness").then(setRolloutReadiness).catch(() => undefined);
  }, []);

  function refreshPersistenceStatus() {
    void apiRequest<PersistenceStatus>("/api/persistence/status").then(setPersistenceStatus).catch(() => undefined);
  }

  function createPersistenceBackup() {
    void apiRequest<{ status: PersistenceStatus; backup: PersistenceBackupManifest["backups"][number] }>("/api/persistence/backup", {
      method: "POST",
      body: JSON.stringify({ label: "audit-desk" })
    }).then((result) => {
      setPersistenceStatus(result.status);
      void apiRequest<PersistenceBackupManifest>("/api/persistence/backup-manifest").then(setBackupManifest).catch(() => undefined);
    }).catch(() => undefined);
  }

  function refreshBackupManifest() {
    void apiRequest<PersistenceBackupManifest>("/api/persistence/backup-manifest").then(setBackupManifest).catch(() => undefined);
  }

  function recordBackupManifest() {
    void apiRequest<{ manifest: PersistenceBackupManifest; status: PersistenceStatus }>("/api/persistence/backup-manifest", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setBackupManifest(result.manifest);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function refreshRestoreDrill() {
    void apiRequest<PersistenceRestoreDrill>("/api/persistence/restore-drill").then(setRestoreDrill).catch(() => undefined);
  }

  function recordRestoreDrill() {
    void apiRequest<{ drill: PersistenceRestoreDrill; status: PersistenceStatus }>("/api/persistence/restore-drill", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setRestoreDrill(result.drill);
      setPersistenceStatus(result.status);
      void apiRequest<PersistenceCutoverChecklist>("/api/persistence/cutover-checklist").then(setCutoverChecklist).catch(() => undefined);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function verifyPersistenceStore() {
    void apiRequest<{ status: PersistenceStatus }>("/api/persistence/verify", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function exportPersistenceStore() {
    void apiRequest<{ status: PersistenceStatus }>("/api/persistence/export")
      .then((result) => setPersistenceStatus(result.status))
      .catch(() => undefined);
  }

  function refreshMigrationPlan() {
    void apiRequest<PersistenceMigrationPlan>("/api/persistence/migration-plan").then(setMigrationPlan).catch(() => undefined);
  }

  function exportMigrationBundle() {
    void apiRequest<{ migration: { plan: PersistenceMigrationPlan }; status: PersistenceStatus }>("/api/persistence/migration-export", {
      method: "POST",
      body: JSON.stringify({ label: "database-ready" })
    }).then((result) => {
      setMigrationPlan(result.migration.plan);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function refreshSchemaPlan() {
    void apiRequest<PersistenceSchemaPlan>("/api/persistence/schema-plan").then(setSchemaPlan).catch(() => undefined);
  }

  function exportSchemaPackage() {
    void apiRequest<{ schema: { schema: PersistenceSchemaPlan }; status: PersistenceStatus }>("/api/persistence/schema-export", {
      method: "POST",
      body: JSON.stringify({ label: "postgres-schema" })
    }).then((result) => {
      setSchemaPlan(result.schema.schema);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function refreshImportDryRun() {
    void apiRequest<PersistenceImportDryRun>("/api/persistence/import-dry-run").then(setImportDryRun).catch(() => undefined);
  }

  function recordImportDryRun() {
    void apiRequest<{ dryRun: PersistenceImportDryRun; status: PersistenceStatus }>("/api/persistence/import-dry-run", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setImportDryRun(result.dryRun);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function refreshCutoverChecklist() {
    void apiRequest<PersistenceCutoverChecklist>("/api/persistence/cutover-checklist").then(setCutoverChecklist).catch(() => undefined);
  }

  function recordCutoverChecklist() {
    void apiRequest<{ checklist: PersistenceCutoverChecklist; status: PersistenceStatus }>("/api/persistence/cutover-checklist", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setCutoverChecklist(result.checklist);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function refreshLaunchReadiness() {
    void apiRequest<LaunchReadiness>("/api/launch/readiness").then(setLaunchReadiness).catch(() => undefined);
  }

  function refreshOperationalMonitor() {
    void apiRequest<OperationalMonitor>("/api/ops/monitor").then(setOperationalMonitor).catch(() => undefined);
  }

  function recordOperationalMonitor() {
    void apiRequest<{ monitor: OperationalMonitor; status: PersistenceStatus }>("/api/ops/monitor", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setOperationalMonitor(result.monitor);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function refreshLaunchSignoff() {
    void apiRequest<LaunchSignoff>("/api/launch/signoff").then(setLaunchSignoff).catch(() => undefined);
  }

  function refreshProjectCompletion() {
    void apiRequest<ProjectCompletion>("/api/project/completion").then(setProjectCompletion).catch(() => undefined);
  }

  function refreshEnterpriseCompletion() {
    void apiRequest<EnterpriseCompletion>("/api/enterprise/completion").then(setEnterpriseCompletion).catch(() => undefined);
  }

  function refreshRolloutReadiness() {
    void apiRequest<RolloutReadiness>("/api/rollout/readiness").then(setRolloutReadiness).catch(() => undefined);
  }

  function recordLaunchSignoff() {
    void apiRequest<{ signoff: LaunchSignoff; status: PersistenceStatus }>("/api/launch/signoff", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setLaunchSignoff(result.signoff);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function recordLaunchReadiness() {
    void apiRequest<{ launch: LaunchReadiness; status: PersistenceStatus }>("/api/launch/readiness", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setLaunchReadiness(result.launch);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function refreshDeploymentPlan() {
    void apiRequest<DeploymentPlan>("/api/launch/deployment-plan").then(setDeploymentPlan).catch(() => undefined);
  }

  function refreshProductionSecretsPlan() {
    void apiRequest<ProductionSecretsPlan>("/api/production/secrets-plan").then(setProductionSecretsPlan).catch(() => undefined);
  }

  function recordDeploymentPlan() {
    void apiRequest<{ plan: DeploymentPlan; status: PersistenceStatus }>("/api/launch/deployment-plan", {
      method: "POST",
      body: JSON.stringify({})
    }).then((result) => {
      setDeploymentPlan(result.plan);
      setPersistenceStatus(result.status);
      onRefreshAuditDigest();
    }).catch(() => undefined);
  }

  function refreshReadiness() {
    void apiRequest<ReadinessReport>("/api/readiness").then(setReadiness).catch(() => undefined);
    void apiRequest<ReadinessDigest>("/api/readiness/digest").then(onSetReadinessDigest).catch(() => undefined);
  }

  function updateReadinessFromResult(result: { readiness: ReadinessReport }) {
    setReadiness(result.readiness);
    void apiRequest<ReadinessDigest>("/api/readiness/digest").then(onSetReadinessDigest).catch(() => undefined);
  }

  function acknowledgeCheck(name: string) {
    void apiRequest<{ readiness: ReadinessReport }>(`/api/readiness/${encodeURIComponent(name)}/acknowledge`, {
      method: "POST",
      body: JSON.stringify({ reason: "Acknowledged from audit desk" })
    }).then(updateReadinessFromResult).catch(() => undefined);
  }

  function overrideCheck(name: string) {
    void apiRequest<{ readiness: ReadinessReport }>(`/api/readiness/${encodeURIComponent(name)}/override`, {
      method: "POST",
      body: JSON.stringify({ reason: "Executive override from audit desk" })
    }).then(updateReadinessFromResult).catch(() => undefined);
  }

  function assignCheckOwner(name: string) {
    void apiRequest<{ readiness: ReadinessReport }>(`/api/readiness/${encodeURIComponent(name)}/owner`, {
      method: "POST",
      body: JSON.stringify({ owner: session.email })
    }).then(updateReadinessFromResult).catch(() => undefined);
  }

  function scheduleCheck(name: string) {
    void apiRequest<{ readiness: ReadinessReport }>(`/api/readiness/${encodeURIComponent(name)}/recheck`, {
      method: "POST",
      body: JSON.stringify({ recheckAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() })
    }).then(updateReadinessFromResult).catch(() => undefined);
  }

  function createRemediation(name: string) {
    void apiRequest<GovernanceTask>(`/api/readiness/${encodeURIComponent(name)}/remediation`, {
      method: "POST",
      body: JSON.stringify({ assignee: session.email, priority: "High", due: "Today" })
    }).then(refreshReadiness).catch(() => undefined);
  }

  function archiveCheck(name: string) {
    void apiRequest<{ readiness: ReadinessReport }>(`/api/readiness/${encodeURIComponent(name)}/archive`, {
      method: "POST",
      body: JSON.stringify({ reason: "Archived from audit desk" })
    }).then(updateReadinessFromResult).catch(() => undefined);
  }

  function bulkAcknowledgeChecks() {
    const names = (readiness?.checks ?? []).slice(0, 3).map((check) => check.name);
    void apiRequest<{ readiness: ReadinessReport }>("/api/readiness/bulk/acknowledge", {
      method: "POST",
      body: JSON.stringify({ names, reason: "Bulk acknowledged from audit desk" })
    }).then(updateReadinessFromResult).catch(() => undefined);
  }

  function refreshSecurityControls() {
    void apiRequest<SecurityControlRecord[]>("/api/security-controls").then(setSecurityControls).catch(() => undefined);
    void apiRequest<SecurityControlDigest>("/api/security-controls/digest").then(setSecurityDigest).catch(() => undefined);
  }

  function updateSecurityControls(result: { controls: SecurityControlRecord[] }) {
    setSecurityControls(result.controls);
    void apiRequest<SecurityControlDigest>("/api/security-controls/digest").then(setSecurityDigest).catch(() => undefined);
  }

  function updateSecurityStatus(name: string, currentStatus: SecurityControlRecord["status"]) {
    const status = currentStatus === "Active" ? "Warning" : "Active";
    void apiRequest<{ controls: SecurityControlRecord[] }>(`/api/security-controls/${encodeURIComponent(name)}/status`, {
      method: "POST",
      body: JSON.stringify({ status, reason: `${status} from audit security controls` })
    }).then(updateSecurityControls).catch(() => undefined);
  }

  function assignSecurityOwner(name: string) {
    void apiRequest<{ controls: SecurityControlRecord[] }>(`/api/security-controls/${encodeURIComponent(name)}/owner`, {
      method: "POST",
      body: JSON.stringify({ owner: session.email })
    }).then(updateSecurityControls).catch(() => undefined);
  }

  function attachSecurityEvidence(name: string) {
    void apiRequest<{ controls: SecurityControlRecord[] }>(`/api/security-controls/${encodeURIComponent(name)}/evidence`, {
      method: "POST",
      body: JSON.stringify({ evidence: "Evidence packet attached from audit desk" })
    }).then(updateSecurityControls).catch(() => undefined);
  }

  function testSecurityControl(name: string) {
    void apiRequest<{ controls: SecurityControlRecord[] }>(`/api/security-controls/${encodeURIComponent(name)}/test`, {
      method: "POST",
      body: JSON.stringify({ result: "Control test passed from audit desk", status: "Active" })
    }).then(updateSecurityControls).catch(() => undefined);
  }

  function rotateSecurityControl(name: string) {
    void apiRequest<{ controls: SecurityControlRecord[] }>(`/api/security-controls/${encodeURIComponent(name)}/rotate`, {
      method: "POST",
      body: JSON.stringify({ reason: "Rotation completed from audit desk" })
    }).then(updateSecurityControls).catch(() => undefined);
  }

  function openSecurityException(name: string) {
    void apiRequest<{ controls: SecurityControlRecord[] }>(`/api/security-controls/${encodeURIComponent(name)}/exception`, {
      method: "POST",
      body: JSON.stringify({ reason: "Temporary exception opened for governance review" })
    }).then(updateSecurityControls).catch(() => undefined);
  }

  function createSecurityRemediation(name: string) {
    void apiRequest<GovernanceTask>(`/api/security-controls/${encodeURIComponent(name)}/remediation`, {
      method: "POST",
      body: JSON.stringify({ assignee: session.email, priority: "High", due: "Today" })
    }).then(refreshSecurityControls).catch(() => undefined);
  }

  function verifySecurityControl(name: string) {
    void apiRequest<{ controls: SecurityControlRecord[] }>(`/api/security-controls/${encodeURIComponent(name)}/verify`, {
      method: "POST",
      body: JSON.stringify({ result: "Verified from audit security controls" })
    }).then(updateSecurityControls).catch(() => undefined);
  }

  function bulkTestSecurityControls() {
    const names = securityControls.slice(0, 3).map((control) => control.name);
    void apiRequest<{ controls: SecurityControlRecord[] }>("/api/security-controls/bulk/test", {
      method: "POST",
      body: JSON.stringify({ names, result: "Bulk control test passed from audit desk" })
    }).then(updateSecurityControls).catch(() => undefined);
  }

  function refreshComplianceReviews() {
    void apiRequest<ComplianceReview[]>("/api/compliance-reviews").then(setComplianceReviews).catch(() => undefined);
    void apiRequest<ComplianceDigest>("/api/compliance-reviews/digest").then(setComplianceDigest).catch(() => undefined);
  }

  function updateComplianceReviews(result: { reviews: ComplianceReview[] }) {
    setComplianceReviews(result.reviews);
    void apiRequest<ComplianceDigest>("/api/compliance-reviews/digest").then(setComplianceDigest).catch(() => undefined);
  }

  function routeComplianceReview(id: string) {
    void apiRequest<{ reviews: ComplianceReview[] }>(`/api/compliance-reviews/${encodeURIComponent(id)}/route`, {
      method: "POST",
      body: JSON.stringify({ reviewer: session.email })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function attachComplianceEvidence(id: string) {
    void apiRequest<{ reviews: ComplianceReview[] }>(`/api/compliance-reviews/${encodeURIComponent(id)}/evidence`, {
      method: "POST",
      body: JSON.stringify({ evidence: "Compliance evidence packet attached from audit desk" })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function scoreComplianceReview(id: string) {
    void apiRequest<{ reviews: ComplianceReview[] }>(`/api/compliance-reviews/${encodeURIComponent(id)}/score`, {
      method: "POST",
      body: JSON.stringify({ score: 88, risk: "High" })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function attestComplianceReview(id: string) {
    void apiRequest<{ reviews: ComplianceReview[] }>(`/api/compliance-reviews/${encodeURIComponent(id)}/attest`, {
      method: "POST",
      body: JSON.stringify({ attestation: "Attested from audit desk" })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function prepareCompliancePacket(id: string) {
    void apiRequest<{ reviews: ComplianceReview[] }>(`/api/compliance-reviews/${encodeURIComponent(id)}/packet`, {
      method: "POST",
      body: JSON.stringify({ packetId: `packet-${id}` })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function exportComplianceReview(id: string) {
    void apiRequest<{ reviews: ComplianceReview[] }>(`/api/compliance-reviews/${encodeURIComponent(id)}/export`, {
      method: "POST",
      body: JSON.stringify({ format: "PDF" })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function escalateComplianceReview(id: string) {
    void apiRequest<{ reviews: ComplianceReview[] }>(`/api/compliance-reviews/${encodeURIComponent(id)}/escalate`, {
      method: "POST",
      body: JSON.stringify({ risk: "Critical", reason: "Compliance escalation opened from audit desk" })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function archiveComplianceReview(id: string) {
    void apiRequest<{ reviews: ComplianceReview[] }>(`/api/compliance-reviews/${encodeURIComponent(id)}/archive`, {
      method: "POST",
      body: JSON.stringify({ reason: "Compliance review archived from audit desk" })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function bulkReviewCompliance() {
    const ids = complianceReviews.slice(0, 2).map((review) => review.id);
    void apiRequest<{ reviews: ComplianceReview[] }>("/api/compliance-reviews/bulk/review", {
      method: "POST",
      body: JSON.stringify({ ids, reviewer: session.email })
    }).then(updateComplianceReviews).catch(() => undefined);
  }

  function refreshEvidenceVault() {
    void apiRequest<EvidenceRecord[]>("/api/evidence-vault").then(setEvidenceVault).catch(() => undefined);
    void apiRequest<EvidenceDigest>("/api/evidence-vault/digest").then(setEvidenceDigest).catch(() => undefined);
  }

  function updateEvidenceVault(result: { vault: EvidenceRecord[] }) {
    setEvidenceVault(result.vault);
    void apiRequest<EvidenceDigest>("/api/evidence-vault/digest").then(setEvidenceDigest).catch(() => undefined);
  }

  function assignEvidenceCustody(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/custody`, {
      method: "POST",
      body: JSON.stringify({ custody: session.email })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function classifyEvidence(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/classification`, {
      method: "POST",
      body: JSON.stringify({ classification: "Legal" })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function refreshEvidenceChain(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/chain`, {
      method: "POST",
      body: JSON.stringify({ chainHash: `hash-${id}-${Date.now()}` })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function scheduleEvidenceRetention(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/retention`, {
      method: "POST",
      body: JSON.stringify({ retention: "Permanent", reviewAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString() })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function sealEvidenceRecord(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/seal`, {
      method: "POST",
      body: JSON.stringify({ reason: "Sealed from evidence vault" })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function verifyEvidenceRecord(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/verify`, {
      method: "POST",
      body: JSON.stringify({ result: "Evidence verified from vault" })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function holdEvidenceRecord(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/hold`, {
      method: "POST",
      body: JSON.stringify({ reason: "Evidence hold placed from vault" })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function exportEvidenceRecord(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/export`, {
      method: "POST",
      body: JSON.stringify({ format: "PDF" })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function archiveEvidenceRecord(id: string) {
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/archive`, {
      method: "POST",
      body: JSON.stringify({ reason: "Evidence archived from vault" })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function bulkSealEvidenceVault() {
    const ids = evidenceVault.slice(0, 2).map((evidence) => evidence.id);
    void apiRequest<{ vault: EvidenceRecord[] }>("/api/evidence-vault/bulk/seal", {
      method: "POST",
      body: JSON.stringify({ ids, reason: "Bulk sealed from evidence vault" })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  async function uploadEvidenceFile(id: string, file: File) {
    const evidence = evidenceVault.find((item) => item.id === id);
    if (!evidence) return;
    const contentBase64 = await readFileAsDataUrl(file);
    const uploaded = await apiRequest<FileRecord>("/api/files/upload", {
      method: "POST",
      body: JSON.stringify({
        name: file.name,
        contentType: file.type || "application/octet-stream",
        contentBase64,
        source: `Evidence:${evidence.title}`
      })
    });
    void apiRequest<{ vault: EvidenceRecord[] }>(`/api/evidence-vault/${encodeURIComponent(id)}/file`, {
      method: "POST",
      body: JSON.stringify({ fileId: uploaded.id })
    }).then(updateEvidenceVault).catch(() => undefined);
  }

  function exportAuditPacket() {
    const headers = ["Event", "Actor", "Object", "Result", "Time"];
    const rows = visibleRows.map((row) => [row.event, row.actor, row.object, row.result, row.time]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `gcos-audit-packet-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportGovernanceSnapshot() {
    const snapshot = await apiRequest<ExportSnapshot>("/api/export");
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `gcos-governance-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={ShieldCheck} title="Immutable Audit Ledger" action={`${visibleRows.length} rows`} />
        <div className="audit-toolbar">
          <label>
            <Search size={15} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter audit records" aria-label="Filter audit records" />
          </label>
          <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} aria-label="Filter by event">
            {eventTypes.map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
          <button onClick={onCreateAuditNote}><Plus size={15} /> Note</button>
          <button disabled={!visibleRows[0]} onClick={() => visibleRows[0] && onFlagAuditRow(visibleRows[0].id)}><AlertTriangle size={15} /> Flag</button>
          <button disabled={!visibleRows[0]} onClick={() => visibleRows[0] && onSealAuditRow(visibleRows[0].id)}><LockKeyhole size={15} /> Seal</button>
          <button disabled={!visibleRows[0]} onClick={() => visibleRows[0] && onVerifyAuditRow(visibleRows[0].id)}><FileCheck2 size={15} /> Verify</button>
          <button disabled={!visibleRows.length} onClick={() => onBulkFlagAuditRows(visibleRows.slice(0, 3).map((row) => row.id))}><AlertTriangle size={15} /> Bulk flag</button>
          <button disabled={!visibleRows.length} onClick={() => onBulkSealAuditRows(visibleRows.slice(0, 3).map((row) => row.id))}><LockKeyhole size={15} /> Bulk seal</button>
          <button disabled={!visibleRows.length} onClick={() => onBulkVerifyAuditRows(visibleRows.slice(0, 3).map((row) => row.id))}><ShieldCheck size={15} /> Bulk verify</button>
          <button onClick={onRefreshAuditDigest}><RefreshCw size={15} /> Digest</button>
          <button onClick={exportAuditPacket}><Download size={15} /> Export CSV</button>
          <button onClick={() => void exportGovernanceSnapshot()}><Files size={15} /> Export snapshot</button>
          <button onClick={onArchiveGovernanceSnapshot}><Files size={15} /> Archive snapshot</button>
        </div>
        <div className="office-summary-grid audit-integrity-grid">
          <Insight label="Flagged" value={String(flaggedCount)} />
          <Insight label="Sealed" value={String(sealedCount)} />
          <Insight label="Verified" value={String(verifiedCount)} />
          <Insight label="Critical" value={String(criticalCount)} />
          <Insight label="Investigations" value={String(investigationCount)} />
          <Insight label="Holds" value={String(holdCount)} />
          <Insight label="Reviewers" value={String(digest?.reviewers ?? 0)} />
          <Insight label="Top event" value={digest?.topEvent ?? eventTypes[1] ?? "Boot"} />
        </div>
        <div className="data-table audit-table">
          <div className="table-row table-head">
            <span>Event</span><span>Actor</span><span>Object</span><span>Integrity</span><span>Actions</span><span>Time</span>
          </div>
          {visibleRows.map((row) => (
            <div className="table-row" key={row.id}>
              <strong>{row.event}</strong>
              <span>{row.actor}</span>
              <span>{row.object}<small>{row.category ?? "Unclassified"} - {row.reviewer ?? "No reviewer"}</small></span>
              <span>{row.sealed || row.result.startsWith("Sealed:") ? "Sealed" : row.verified ? "Verified" : row.result.startsWith("Flagged:") ? "Flagged" : row.hold ? "Hold" : row.investigation === "Open" ? "Investigation" : "Open"}<small>{row.severity ?? "Info"} - {row.comments?.length ?? 0} notes</small></span>
              <span className="table-actions">
                <button onClick={() => onFlagAuditRow(row.id)}><AlertTriangle size={14} /> Flag</button>
                <button onClick={() => onSealAuditRow(row.id)}><LockKeyhole size={14} /> Seal</button>
                <button onClick={() => onVerifyAuditRow(row.id)}><FileCheck2 size={14} /> Verify</button>
                <button onClick={() => onUpdateAuditSeverity(row.id)}><AlertTriangle size={14} /> Severity</button>
                <button onClick={() => onUpdateAuditCategory(row.id)}><Files size={14} /> Category</button>
                <button onClick={() => onAssignAuditReviewer(row.id)}><Users size={14} /> Reviewer</button>
                <button onClick={() => onAppendAuditComment(row.id)}><MessageSquareText size={14} /> Comment</button>
                <button onClick={() => onOpenAuditInvestigation(row.id)}><Search size={14} /> Investigate</button>
                <button onClick={() => onCloseAuditInvestigation(row.id)}><CheckCircle2 size={14} /> Close</button>
                <button onClick={() => onPlaceAuditHold(row.id)}><ShieldCheck size={14} /> Hold</button>
                <button onClick={() => onReleaseAuditHold(row.id)}><TimerReset size={14} /> Release</button>
              </span>
              <span>{row.time}</span>
            </div>
          ))}
          {visibleRows.length === 0 && <div className="empty-state">No audit records match the current filters.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Server} title="Persistence Store" action={persistenceStatus ? `${persistenceStatus.provider} / ${persistenceStatus.mode}` : "checking"} />
        <div className="action-row">
          <button onClick={refreshPersistenceStatus}><RefreshCw size={15} /> Status</button>
          <button onClick={createPersistenceBackup}><Download size={15} /> Backup</button>
          <button onClick={refreshBackupManifest}><Files size={15} /> Manifest</button>
          <button onClick={recordBackupManifest}><ShieldCheck size={15} /> Record</button>
          <button onClick={refreshRestoreDrill}><RefreshCw size={15} /> Drill</button>
          <button onClick={recordRestoreDrill}><CheckCircle2 size={15} /> Restore</button>
          <button onClick={verifyPersistenceStore}><ShieldCheck size={15} /> Verify</button>
          <button onClick={exportPersistenceStore}><Files size={15} /> Export</button>
          <button onClick={exportMigrationBundle}><ArrowUpFromLine size={15} /> Migration</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Provider" value={persistenceStatus?.provider ?? apiStatus?.storageProvider ?? "Unknown"} />
          <Insight label="File" value={persistenceStatus?.file?.exists ? "Present" : "Pending"} />
          <Insight label="Bytes" value={String(persistenceStatus?.file?.bytes ?? 0)} />
          <Insight label="Audit rows" value={String(persistenceStatus?.records?.audit ?? auditRows.length)} />
          <Insight label="Documents" value={String(persistenceStatus?.records?.documents ?? 0)} />
          <Insight label="Hash" value={persistenceStatus?.hash ? persistenceStatus.hash.slice(0, 18) : "None"} />
          <Insight label="Backups" value={persistenceStatus?.backupSupport === false ? "Unavailable" : "Available"} />
          <Insight label="Manifest" value={backupManifest?.status ?? "Pending"} />
          <Insight label="Backup files" value={String(backupManifest?.total ?? 0)} />
          <Insight label="Restore" value={restoreDrill?.status ?? "Pending"} />
          <Insight label="Delta" value={String(restoreDrill?.recordDelta ?? 0)} />
          <Insight label="Migration" value={persistenceStatus?.migrationReady ? "Ready" : "Planned"} />
          <Insight label="External DB" value={persistenceStatus?.readyForExternalDatabase ? "Ready" : "Planned"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{persistenceStatus?.file?.updatedAt ? formatDateTime(persistenceStatus.file.updatedAt) : persistenceStatus?.provider === "database" ? "Database adapter" : "No file"}</span>
            <strong>{persistenceStatus?.path ?? apiStatus?.persistence ?? "Persistence path unavailable"}</strong>
            <small>Backups: {persistenceStatus?.backupsPath ?? "not checked"}</small>
            <small>Last backup: {persistenceStatus?.lastBackup ? `${persistenceStatus.lastBackup.label} by ${persistenceStatus.lastBackup.createdBy}` : "none recorded"}</small>
            <small>Last verify: {persistenceStatus?.lastVerifiedAt ? `${formatDateTime(persistenceStatus.lastVerifiedAt)} by ${persistenceStatus.lastVerifiedBy}` : "not verified yet"}</small>
            <small>Manifest: {backupManifest ? `${backupManifest.total} backups, ${backupManifest.totalBytes} bytes` : "not loaded"}</small>
            <small>Restore drill: {restoreDrill ? `${restoreDrill.status}, delta ${restoreDrill.recordDelta}` : "not run"}</small>
            {persistenceStatus?.note && <small>{persistenceStatus.note}</small>}
          </article>
          {restoreDrill && (
            <article className="source-map-item">
              <span>{restoreDrill.valid ? "Pass" : "Hold"}</span>
              <strong>{restoreDrill.nextAction}</strong>
              <small>{restoreDrill.backupHash ? restoreDrill.backupHash.slice(0, 32) : "No backup hash"} - {Object.values(restoreDrill.backupRecords).reduce((sum, count) => sum + count, 0)} records</small>
            </article>
          )}
          {(backupManifest?.backups.slice(0, 3) ?? []).map((backup) => (
            <article className="source-map-item" key={`${backup.hash}-${backup.createdAt}`}>
              <span>{backup.label}</span>
              <strong>{backup.hash.slice(0, 24)}</strong>
              <small>{formatDateTime(backup.createdAt)} by {backup.createdBy} - {backup.bytes} bytes</small>
            </article>
          ))}
          {(backupManifest?.checks ?? []).map((check) => (
            <article className="source-map-item" key={check.name}>
              <span>{check.ok ? "Pass" : "Hold"}</span>
              <strong>{check.name}</strong>
              <small>{check.detail}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Workflow} title="Database Migration" action={migrationPlan ? `${migrationPlan.estimatedRows} rows` : "planning"} />
        <div className="action-row">
          <button onClick={refreshMigrationPlan}><RefreshCw size={15} /> Plan</button>
          <button onClick={exportMigrationBundle}><Download size={15} /> Bundle</button>
          <button onClick={exportSchemaPackage}><Server size={15} /> Schema</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Tables" value={String(migrationPlan?.collections.length ?? 0)} />
          <Insight label="Rows" value={String(migrationPlan?.estimatedRows ?? 0)} />
          <Insight label="Files" value={String(migrationPlan?.objectStorage.files ?? 0)} />
          <Insight label="Bytes" value={String(migrationPlan?.objectStorage.bytes ?? 0)} />
          <Insight label="Checks" value={String(migrationPlan?.checks.filter((check) => check.ok).length ?? 0)} />
          <Insight label="Blockers" value={String(migrationPlan?.blockers.length ?? 0)} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{migrationPlan ? formatDateTime(migrationPlan.generatedAt) : "No migration plan loaded"}</span>
            <strong>{migrationPlan ? `${migrationPlan.source.provider} -> ${migrationPlan.target.provider}.${migrationPlan.target.schema}` : "Database migration plan"}</strong>
            <small>{migrationPlan?.objectStorage.strategy ?? "Object storage mapping will appear here"}</small>
            <small>{migrationPlan?.nextSteps[0] ?? "Create the managed database, then import a generated bundle."}</small>
          </article>
          {(migrationPlan?.collections.slice(0, 5) ?? []).map((item) => (
            <article className="source-map-item" key={item.collection}>
              <span>{item.strategy}</span>
              <strong>{item.collection} &gt; {item.targetTable}</strong>
              <small>{item.records} records using {item.identityKey} as identity key</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Server} title="Postgres Schema" action={schemaPlan ? `${schemaPlan.tableCount} tables` : "pending"} />
        <div className="action-row">
          <button onClick={refreshSchemaPlan}><RefreshCw size={15} /> Plan</button>
          <button onClick={exportSchemaPackage}><Download size={15} /> SQL</button>
          <button onClick={recordImportDryRun}><CheckCircle2 size={15} /> Dry run</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Dialect" value={schemaPlan?.dialect ?? "Postgres"} />
          <Insight label="Schema" value={schemaPlan?.schema ?? "gcos_core"} />
          <Insight label="Tables" value={String(schemaPlan?.tableCount ?? 0)} />
          <Insight label="Rows" value={String(schemaPlan?.estimatedRows ?? 0)} />
          <Insight label="Import order" value={String(schemaPlan?.importOrder.length ?? 0)} />
          <Insight label="Checks" value={String(schemaPlan?.checks.filter((check) => check.ok).length ?? 0)} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{schemaPlan ? formatDateTime(schemaPlan.generatedAt) : "No schema plan loaded"}</span>
            <strong>{schemaPlan ? `${schemaPlan.schema}.${schemaPlan.importOrder[0] ?? "tables"}` : "Postgres DDL package"}</strong>
            <small>{schemaPlan ? `${schemaPlan.sql.split("\n").length} SQL lines ready for migration` : "Generated SQL appears after schema planning."}</small>
          </article>
          {(schemaPlan?.tables.slice(0, 5) ?? []).map((table) => (
            <article className="source-map-item" key={table.name}>
              <span>{table.importStrategy}</span>
              <strong>{table.name}</strong>
              <small>{table.columns.length} columns, {table.indexes.length} indexes, {table.records} records</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={ClipboardCheck} title="Import Dry Run" action={importDryRun?.valid ? "ready" : "review"} />
        <div className="action-row">
          <button onClick={refreshImportDryRun}><RefreshCw size={15} /> Check</button>
          <button onClick={recordImportDryRun}><ShieldCheck size={15} /> Record</button>
          <button onClick={recordCutoverChecklist}><CheckCircle2 size={15} /> Cutover</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Rows" value={String(importDryRun?.estimatedRows ?? 0)} />
          <Insight label="Batches" value={String(importDryRun?.estimatedBatches ?? 0)} />
          <Insight label="Duration" value={`${Math.round((importDryRun?.estimatedDurationMs ?? 0) / 100) / 10}s`} />
          <Insight label="Warnings" value={String(importDryRun?.warnings.length ?? 0)} />
          <Insight label="Blockers" value={String(importDryRun?.blockers.length ?? 0)} />
          <Insight label="Files" value={String(importDryRun?.objectStorage.files ?? 0)} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{importDryRun ? formatDateTime(importDryRun.generatedAt) : "No dry run loaded"}</span>
            <strong>{importDryRun?.nextAction ?? "Run a staged import check before database cutover"}</strong>
            <small>{importDryRun?.objectStorage.strategy ?? "Object vault copy checks will appear here."}</small>
          </article>
          {(importDryRun?.batches.slice(0, 5) ?? []).map((batch) => (
            <article className="source-map-item" key={batch.table}>
              <span>Batch {batch.batch} - {batch.status}</span>
              <strong>{batch.collection} into {batch.table}</strong>
              <small>{batch.records} records by {batch.primaryKey} using {batch.strategy}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={BadgeCheck} title="Cutover Checklist" action={cutoverChecklist?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshCutoverChecklist}><RefreshCw size={15} /> Check</button>
          <button onClick={recordCutoverChecklist}><ShieldCheck size={15} /> Record</button>
          <button onClick={recordLaunchReadiness}><Globe2 size={15} /> Launch</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Ready" value={cutoverChecklist?.ready ? "Yes" : "No"} />
          <Insight label="Passed" value={String(cutoverChecklist?.checks.filter((check) => check.ok).length ?? 0)} />
          <Insight label="Blockers" value={String(cutoverChecklist?.blockers.length ?? 0)} />
          <Insight label="Switches" value={String(cutoverChecklist?.requiredSwitches.length ?? 0)} />
          <Insight label="Rollback" value={String(cutoverChecklist?.rollbackPlan.length ?? 0)} />
          <Insight label="Target" value={cutoverChecklist?.targetProvider ?? "database"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{cutoverChecklist ? formatDateTime(cutoverChecklist.generatedAt) : "No checklist loaded"}</span>
            <strong>{cutoverChecklist?.nextAction ?? "Complete migration artifacts before switching providers"}</strong>
            <small>{cutoverChecklist?.requiredSwitches.map((item) => `${item.name}=${item.value}`).join(" - ") ?? "Provider switches appear here."}</small>
          </article>
          {(cutoverChecklist?.checks ?? []).map((check) => (
            <article className="source-map-item" key={check.name}>
              <span>{check.ok ? "Pass" : "Hold"}</span>
              <strong>{check.name}</strong>
              <small>{check.detail}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={BadgeCheck} title="Project Completion" action={projectCompletion?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshProjectCompletion}><RefreshCw size={15} /> Completion</button>
          <button onClick={refreshLaunchSignoff}><ShieldCheck size={15} /> Signoff</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Modules" value={`${projectCompletion?.moduleScore ?? 0}%`} />
          <Insight label="MVP" value={`${projectCompletion?.mvpScore ?? 0}%`} />
          <Insight label="Production" value={`${projectCompletion?.productionScore ?? 0}%`} />
          <Insight label="Enterprise" value={`${projectCompletion?.enterpriseScore ?? 0}%`} />
          <Insight label="Blockers" value={String(projectCompletion?.productionBlockers.length ?? 0)} />
          <Insight label="Domain" value={projectCompletion?.targetDomain ?? "rmvi.org"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{projectCompletion ? formatDateTime(projectCompletion.generatedAt) : "No completion report loaded"}</span>
            <strong>{projectCompletion?.project ?? "Remedy Movement International GCOS"}</strong>
            <small>{projectCompletion?.nextActions[0] ?? "Run the final release checks before live handoff."}</small>
          </article>
          {(projectCompletion?.modules ?? []).map((module) => (
            <article className="source-map-item compact-check" key={module.name}>
              <span>{module.complete ? "Complete" : "Hold"}</span>
              <strong>{module.name}</strong>
              <small>{module.complete ? "Module is present in this controlled MVP build." : "Module needs final attention."}</small>
            </article>
          ))}
          <article className="source-map-item">
            <span>Release</span>
            <strong>Final command bundle</strong>
            {(projectCompletion?.releaseCommands ?? ["npm test", "npm run build", "npm run release:check"]).map((command) => (
              <small key={command}>{command}</small>
            ))}
          </article>
          <article className="source-map-item">
            <span>Smoke URLs</span>
            <strong>Live verification targets</strong>
            {(projectCompletion?.smokeUrls ?? ["https://rmvi.org/health", "https://rmvi.org/"]).map((url) => (
              <small key={url}>{url}</small>
            ))}
          </article>
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Workflow} title="Enterprise Completion 1-12" action={enterpriseCompletion?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshEnterpriseCompletion}><RefreshCw size={15} /> Tracks</button>
          <button onClick={refreshProjectCompletion}><BadgeCheck size={15} /> MVP</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Overall" value={`${enterpriseCompletion?.overallScore ?? 0}%`} />
          <Insight label="MVP" value={`${enterpriseCompletion?.mvpScore ?? 0}%`} />
          <Insight label="Production" value={`${enterpriseCompletion?.productionScore ?? 0}%`} />
          <Insight label="Tracks" value={String(enterpriseCompletion?.tracks.length ?? 12)} />
          <Insight label="Blockers" value={String(enterpriseCompletion?.blockers.length ?? 0)} />
          <Insight label="Domain" value={enterpriseCompletion?.targetDomain ?? "rmvi.org"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{enterpriseCompletion ? formatDateTime(enterpriseCompletion.generatedAt) : "No enterprise report loaded"}</span>
            <strong>{enterpriseCompletion?.nextActions[0] ?? "Review all 12 enterprise completion tracks."}</strong>
            <small>Tracks 1-12 cover identity, storage, roles, signing, notifications, offline sync, search, onboarding, imports, operations, policy, and AI governance.</small>
          </article>
          {(enterpriseCompletion?.tracks ?? []).map((track) => (
            <article className="source-map-item" key={track.id}>
              <span>{track.status}</span>
              <strong>{track.name}: {track.score}%</strong>
              <small>{track.blockers.length ? `${track.blockers.length} blockers: ${track.blockers.slice(0, 3).join(", ")}` : "Track complete"}</small>
              {track.nextActions[0] && <small>{track.nextActions[0]}</small>}
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Globe2} title="Rollout Readiness" action={rolloutReadiness?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshRolloutReadiness}><RefreshCw size={15} /> Rollout</button>
          <button onClick={recordLaunchReadiness}><ShieldCheck size={15} /> Record</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Overall" value={`${rolloutReadiness?.overallScore ?? 0}%`} />
          <Insight label="Tracks" value={String(rolloutReadiness?.tracks.length ?? 6)} />
          <Insight label="Blockers" value={String(rolloutReadiness?.blockers.length ?? 0)} />
          <Insight label="Domain" value={rolloutReadiness?.targetDomain ?? "rmvi.org"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{rolloutReadiness ? formatDateTime(rolloutReadiness.generatedAt) : "No rollout report loaded"}</span>
            <strong>{rolloutReadiness?.nextActions[0] ?? "Build deployment, data, user rollout, policies, training, and operations readiness."}</strong>
            <small>Tracks cover deployment, real data, first-wave users, policy pack, station training, and live operations.</small>
          </article>
          {(rolloutReadiness?.tracks ?? []).map((track) => (
            <article className="source-map-item" key={track.id}>
              <span>{track.status}</span>
              <strong>{track.name}: {track.score}%</strong>
              <small>{track.blockers.length ? `${track.blockers.length} blockers: ${track.blockers.join(", ")}` : "Ready for rollout"}</small>
              {track.nextActions[0] && <small>{track.nextActions[0]}</small>}
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={BadgeCheck} title="Launch Signoff Matrix" action={launchSignoff?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshLaunchSignoff}><RefreshCw size={15} /> Matrix</button>
          <button onClick={recordLaunchSignoff}><ShieldCheck size={15} /> Signoff</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Overall" value={`${launchSignoff?.overallScore ?? 0}%`} />
          <Insight label="MVP" value={`${launchSignoff?.tracks.find((track) => track.id === "usable-web-mvp")?.score ?? 0}%`} />
          <Insight label="Production" value={`${launchSignoff?.tracks.find((track) => track.id === "production-readiness")?.score ?? 0}%`} />
          <Insight label="Enterprise" value={`${launchSignoff?.tracks.find((track) => track.id === "enterprise-deployment")?.score ?? 0}%`} />
          <Insight label="Blockers" value={String(launchSignoff?.blockers.length ?? 0)} />
          <Insight label="Domain" value={launchSignoff?.targetDomain ?? "rmvi.org"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{launchSignoff ? formatDateTime(launchSignoff.generatedAt) : "No signoff matrix loaded"}</span>
            <strong>{launchSignoff?.nextActions[0] ?? "Complete all gates to reach 100% on each readiness track."}</strong>
            <small>{launchSignoff ? `${launchSignoff.tracks.length} tracks, ${launchSignoff.blockers.length} blockers` : "MVP, production, and enterprise tracks appear here."}</small>
          </article>
          {(launchSignoff?.tracks ?? []).map((track) => (
            <article className="source-map-item" key={track.id}>
              <span>{track.status}</span>
              <strong>{track.name}: {track.score}%</strong>
              <small>{track.blockers.length ? `${track.blockers.length} blockers: ${track.blockers.slice(0, 3).join(", ")}` : "All gates complete"}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={RadioTower} title="Operations Monitor" action={operationalMonitor?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshOperationalMonitor}><RefreshCw size={15} /> Monitor</button>
          <button onClick={recordOperationalMonitor}><ShieldCheck size={15} /> Record</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Score" value={`${operationalMonitor?.score ?? 0}%`} />
          <Insight label="Signals" value={String(operationalMonitor?.criticalSignals.length ?? 0)} />
          <Insight label="Production" value={`${operationalMonitor?.readiness.productionScore ?? 0}%`} />
          <Insight label="Backups" value={String(operationalMonitor?.persistence.backups ?? 0)} />
          <Insight label="Restore" value={operationalMonitor?.persistence.restoreStatus ?? "Pending"} />
          <Insight label="Sessions" value={String(operationalMonitor?.sessions.active ?? 0)} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{operationalMonitor ? formatDateTime(operationalMonitor.generatedAt) : "No monitor loaded"}</span>
            <strong>{operationalMonitor?.nextActions[0] ?? "Run the operational monitor before deployment signoff."}</strong>
            <small>{operationalMonitor ? `${operationalMonitor.storageProvider}/${operationalMonitor.persistence.mode} - uptime ${operationalMonitor.uptimeSeconds}s` : "Operational signal summary will appear here."}</small>
          </article>
          {(operationalMonitor?.criticalSignals ?? []).map((signal) => (
            <article className="source-map-item" key={signal.name}>
              <span>{signal.severity}</span>
              <strong>{signal.name}</strong>
              <small>{signal.detail}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Globe2} title="Launch Readiness" action={launchReadiness?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshLaunchReadiness}><RefreshCw size={15} /> Check</button>
          <button onClick={recordLaunchReadiness}><ShieldCheck size={15} /> Record</button>
          <button onClick={recordDeploymentPlan}><Upload size={15} /> Deploy</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="MVP" value={`${launchReadiness?.mvpScore ?? 0}%`} />
          <Insight label="Production" value={`${launchReadiness?.productionScore ?? 0}%`} />
          <Insight label="Blockers" value={String(launchReadiness?.blockers.length ?? 0)} />
          <Insight label="Domain" value={launchReadiness?.targetDomain ?? "rmvi.org"} />
          <Insight label="MVP checks" value={String(launchReadiness?.checks.filter((check) => check.category === "mvp" && check.ok).length ?? 0)} />
          <Insight label="Prod checks" value={String(launchReadiness?.checks.filter((check) => check.category === "production" && check.ok).length ?? 0)} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{launchReadiness ? formatDateTime(launchReadiness.generatedAt) : "No launch check loaded"}</span>
            <strong>{launchReadiness?.summary ?? "Launch score will appear here"}</strong>
            <small>{launchReadiness?.nextActions[0] ?? "Run launch readiness before public rollout."}</small>
          </article>
          {(launchReadiness?.checks ?? []).map((check) => (
            <article className="source-map-item" key={check.name}>
              <span>{check.category} - {check.ok ? "Pass" : "Hold"}</span>
              <strong>{check.name}</strong>
              <small>{check.detail}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Upload} title="Deployment Plan" action={deploymentPlan?.goLive ? "go-live" : "setup"} />
        <div className="action-row">
          <button onClick={refreshDeploymentPlan}><RefreshCw size={15} /> Plan</button>
          <button onClick={recordDeploymentPlan}><ShieldCheck size={15} /> Record</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Production" value={`${deploymentPlan?.readiness.productionScore ?? 0}%`} />
          <Insight label="Secrets" value={String(deploymentPlan?.requiredSecrets.filter((secret) => secret.configured).length ?? 0)} />
          <Insight label="Missing" value={String(deploymentPlan?.requiredSecrets.filter((secret) => !secret.configured).length ?? 0)} />
          <Insight label="Commands" value={String(deploymentPlan?.commands.length ?? 0)} />
          <Insight label="Smoke URLs" value={String(deploymentPlan?.smokeUrls.length ?? 0)} />
          <Insight label="Target" value={deploymentPlan?.deploymentTarget ?? "replit"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{deploymentPlan ? formatDateTime(deploymentPlan.generatedAt) : "No deployment plan loaded"}</span>
            <strong>{deploymentPlan?.nextAction ?? "Set Replit secrets and run production checks"}</strong>
            <small>{deploymentPlan?.smokeUrls[0] ?? "https://rmvi.org/health"}</small>
          </article>
          {(deploymentPlan?.requiredSecrets ?? []).map((secret) => (
            <article className="source-map-item" key={secret.name}>
              <span>{secret.configured ? "Set" : "Missing"}</span>
              <strong>{secret.name}</strong>
              <small>{secret.sensitive && secret.configured ? "configured secret" : secret.value}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={KeyRound} title="Production Secrets" action={productionSecretsPlan?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshProductionSecretsPlan}><RefreshCw size={15} /> Secrets</button>
          <button onClick={refreshDeploymentPlan}><Upload size={15} /> Deploy</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Ready" value={`${productionSecretsPlan?.ready ?? 0}/${productionSecretsPlan?.required ?? 0}`} />
          <Insight label="Missing" value={String(productionSecretsPlan?.missing.length ?? 0)} />
          <Insight label="Domain" value={productionSecretsPlan?.targetDomain ?? "rmvi.org"} />
          <Insight label="Status" value={productionSecretsPlan?.status ?? "Pending"} />
        </div>
        <div className="source-map-list">
          <article className="source-map-item">
            <span>{productionSecretsPlan ? formatDateTime(productionSecretsPlan.generatedAt) : "No secrets plan loaded"}</span>
            <strong>{productionSecretsPlan?.nextActions[0] ?? "Generate the production secrets plan before live deployment."}</strong>
            <small>Use Replit Secrets for required values. Sensitive values stay redacted in GCOS.</small>
          </article>
          {(productionSecretsPlan?.entries ?? []).map((entry) => (
            <article className="source-map-item" key={entry.name}>
              <span>{entry.configured ? "Ready" : "Needed"}</span>
              <strong>{entry.name}</strong>
              <small>{entry.sensitive && entry.configured ? "configured secret" : entry.displayValue}</small>
              {!entry.configured && <small>{entry.nextAction}</small>}
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Files} title="Evidence Vault" action={`${evidenceDigest?.total ?? evidenceVault.length} records`} />
        <div className="action-row">
          <button disabled={!evidenceVault.length} onClick={bulkSealEvidenceVault}><LockKeyhole size={15} /> Bulk seal</button>
          <button onClick={refreshEvidenceVault}><RefreshCw size={15} /> Digest</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Sealed" value={String(evidenceDigest?.sealed ?? evidenceVault.filter((record) => record.sealed).length)} />
          <Insight label="Verified" value={String(evidenceDigest?.verified ?? evidenceVault.filter((record) => record.verified).length)} />
          <Insight label="Holds" value={String(evidenceDigest?.holds ?? evidenceVault.filter((record) => record.hold).length)} />
          <Insight label="Exported" value={String(evidenceDigest?.exported ?? evidenceVault.filter((record) => record.exported).length)} />
          <Insight label="Permanent" value={String(evidenceDigest?.permanent ?? evidenceVault.filter((record) => record.retention === "Permanent").length)} />
          <Insight label="Custody" value={String(evidenceDigest?.custody ?? new Set(evidenceVault.map((record) => record.custody)).size)} />
          <Insight label="Files" value={String(evidenceDigest?.files ?? evidenceVault.reduce((sum, record) => sum + record.fileCount, 0))} />
          <Insight label="Next evidence" value={evidenceDigest?.nextEvidence ?? evidenceVault[0]?.title ?? "None"} />
        </div>
        <div className="source-map-list">
          {evidenceVault.map((record) => (
            <article className="source-map-item" key={record.id}>
              <span>{record.status}</span>
              <strong>{record.title}</strong>
              <small>{record.source} - {record.classification} - custody {record.custody} - {record.fileCount} files</small>
              <small>{record.chainHash} - retention {record.retention}{record.exported ? ` - exported ${record.exportFormat ?? "PDF"}` : ""}</small>
              <div className="action-row compact-actions">
                <button onClick={() => assignEvidenceCustody(record.id)}><Users size={14} /> Custody</button>
                <button onClick={() => classifyEvidence(record.id)}><Files size={14} /> Classify</button>
                <button onClick={() => refreshEvidenceChain(record.id)}><GitBranch size={14} /> Chain</button>
                <button onClick={() => scheduleEvidenceRetention(record.id)}><FileClock size={14} /> Retention</button>
                <button onClick={() => sealEvidenceRecord(record.id)}><LockKeyhole size={14} /> Seal</button>
                <button onClick={() => verifyEvidenceRecord(record.id)}><FileCheck2 size={14} /> Verify</button>
                <button onClick={() => holdEvidenceRecord(record.id)}><ShieldCheck size={14} /> Hold</button>
                <button onClick={() => exportEvidenceRecord(record.id)}><Download size={14} /> Export</button>
                <button onClick={() => archiveEvidenceRecord(record.id)}><Files size={14} /> Archive</button>
                <label className="file-action">
                  <Upload size={14} /> Upload
                  <input type="file" onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) void uploadEvidenceFile(record.id, file);
                    event.currentTarget.value = "";
                  }} />
                </label>
                {record.files?.[0] && <button onClick={() => void downloadStoredFile(record.files![0])}><Download size={14} /> View</button>}
              </div>
            </article>
          ))}
          {!evidenceVault.length && <div className="empty-state">No active evidence records.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={ClipboardCheck} title="Compliance Review Queue" action={`${complianceDigest?.highRisk ?? complianceReviews.filter((review) => ["High", "Critical"].includes(review.risk)).length} high risk`} />
        <div className="action-row">
          <button disabled={!complianceReviews.length} onClick={bulkReviewCompliance}><CheckCircle2 size={15} /> Bulk review</button>
          <button onClick={refreshComplianceReviews}><RefreshCw size={15} /> Digest</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Open" value={String(complianceDigest?.open ?? complianceReviews.filter((review) => review.status === "Open").length)} />
          <Insight label="In review" value={String(complianceDigest?.inReview ?? complianceReviews.filter((review) => review.status === "In Review").length)} />
          <Insight label="Attested" value={String(complianceDigest?.attested ?? complianceReviews.filter((review) => review.attested).length)} />
          <Insight label="Packets" value={String(complianceDigest?.packetReady ?? complianceReviews.filter((review) => review.packetId).length)} />
          <Insight label="Exported" value={String(complianceDigest?.exported ?? complianceReviews.filter((review) => review.exported).length)} />
          <Insight label="Escalated" value={String(complianceDigest?.escalated ?? complianceReviews.filter((review) => review.status === "Escalated").length)} />
          <Insight label="High risk" value={String(complianceDigest?.highRisk ?? complianceReviews.filter((review) => ["High", "Critical"].includes(review.risk)).length)} />
          <Insight label="Next review" value={complianceDigest?.nextReview ?? complianceReviews[0]?.title ?? "None"} />
        </div>
        <div className="source-map-list">
          {complianceReviews.map((review) => (
            <article className="source-map-item" key={review.id}>
              <span>{review.status}</span>
              <strong>{review.title}</strong>
              <small>{review.scope} - {review.risk} risk - score {review.score} - {review.reviewer} - due {review.due}</small>
              <small>{review.evidence ?? "No evidence"}{review.packetId ? ` - ${review.packetId}` : ""}{review.exported ? " - exported" : ""}</small>
              {review.escalationReason && <small>Escalation: {review.escalationReason}</small>}
              <div className="action-row compact-actions">
                <button onClick={() => routeComplianceReview(review.id)}><GitBranch size={14} /> Route</button>
                <button onClick={() => attachComplianceEvidence(review.id)}><Files size={14} /> Evidence</button>
                <button onClick={() => scoreComplianceReview(review.id)}><AlertTriangle size={14} /> Score</button>
                <button onClick={() => attestComplianceReview(review.id)}><Signature size={14} /> Attest</button>
                <button onClick={() => prepareCompliancePacket(review.id)}><FileCheck2 size={14} /> Packet</button>
                <button onClick={() => exportComplianceReview(review.id)}><Download size={14} /> Export</button>
                <button onClick={() => escalateComplianceReview(review.id)}><RadioTower size={14} /> Escalate</button>
                <button onClick={() => archiveComplianceReview(review.id)}><Files size={14} /> Archive</button>
              </div>
            </article>
          ))}
          {!complianceReviews.length && <div className="empty-state">No active compliance reviews.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={LockKeyhole} title="Security Controls" action={`${securityDigest?.active ?? securityControls.filter((control) => control.status === "Active").length} active`} />
        <div className="action-row">
          <button disabled={!securityControls.length} onClick={bulkTestSecurityControls}><ShieldCheck size={15} /> Bulk test</button>
          <button onClick={refreshSecurityControls}><RefreshCw size={15} /> Digest</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Active" value={String(securityDigest?.active ?? securityControls.filter((control) => control.status === "Active").length)} />
          <Insight label="Warning" value={String(securityDigest?.warning ?? securityControls.filter((control) => control.status === "Warning").length)} />
          <Insight label="Exceptions" value={String(securityDigest?.exceptions ?? securityControls.filter((control) => control.status === "Exception").length)} />
          <Insight label="Verified" value={String(securityDigest?.verified ?? securityControls.filter((control) => control.verified).length)} />
          <Insight label="Evidence" value={String(securityDigest?.evidence ?? securityControls.filter((control) => control.evidence).length)} />
          <Insight label="Owners" value={String(securityDigest?.owners ?? securityControls.filter((control) => control.owner).length)} />
          <Insight label="Rotations" value={String(securityDigest?.rotations ?? securityControls.filter((control) => control.lastRotation).length)} />
          <Insight label="Next control" value={securityDigest?.nextControl ?? securityControls[0]?.name ?? "None"} />
        </div>
        <div className="source-map-list">
          {securityControls.map((control) => (
            <article className="source-map-item" key={control.name}>
              <span>{control.status}</span>
              <strong>{control.name}</strong>
              <small>{control.detail} - {control.owner ?? "unowned"}{control.lastTest ? ` - tested ${formatDateTime(control.lastTest)}` : ""}</small>
              {control.evidence && <small>{control.evidence}</small>}
              {control.exceptionReason && <small>Exception: {control.exceptionReason}</small>}
              <div className="action-row compact-actions">
                <button onClick={() => updateSecurityStatus(control.name, control.status)}><AlertTriangle size={14} /> Status</button>
                <button onClick={() => assignSecurityOwner(control.name)}><Users size={14} /> Owner</button>
                <button onClick={() => attachSecurityEvidence(control.name)}><Files size={14} /> Evidence</button>
                <button onClick={() => testSecurityControl(control.name)}><ShieldCheck size={14} /> Test</button>
                <button onClick={() => rotateSecurityControl(control.name)}><TimerReset size={14} /> Rotate</button>
                <button onClick={() => openSecurityException(control.name)}><AlertTriangle size={14} /> Exception</button>
                <button onClick={() => verifySecurityControl(control.name)}><FileCheck2 size={14} /> Verify</button>
                <button onClick={() => createSecurityRemediation(control.name)}><SquareCheckBig size={14} /> Task</button>
              </div>
            </article>
          ))}
          {!securityControls.length && <div className="empty-state">Loading security controls.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Server} title="Session Monitor" action={`${activeSessionCount} active`} />
        <div className="action-row">
          <button onClick={onRenewSession}><RefreshCw size={15} /> Renew current</button>
          <button onClick={() => onRevokeStationSessions(session.email)}><LockKeyhole size={15} /> Revoke station</button>
          <button disabled={!sessionEntries.length} onClick={() => onBulkRevokeSessions(sessionEntries.filter((item) => item.id && item.id !== session.token).slice(0, 3).map((item) => item.id ?? ""))}><Files size={15} /> Bulk revoke</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Active" value={String(sessionDigest?.active ?? activeSessionCount)} />
          <Insight label="Expiring soon" value={String(expiringSoonCount)} />
          <Insight label="Locked" value={String(lockedSessionCount)} />
          <Insight label="Trusted" value={String(trustedSessionCount)} />
          <Insight label="MFA" value={String(mfaSessionCount)} />
          <Insight label="Labeled" value={String(labeledSessionCount)} />
          <Insight label="Current station" value={session.email} />
        </div>
        <div className="source-map-list">
          {sessionEntries.map((item) => (
            <article className="source-map-item" key={`${item.email}-${item.startedAt}`}>
              <span>{item.email}</span>
              <strong>{item.minutesRemaining} minutes remaining</strong>
              <small>{item.status ?? "Active"} - {item.deviceLabel ?? "unlabeled"} - {item.trusted ? "trusted" : "untrusted"} - started {formatDateTime(item.startedAt)} - expires {formatDateTime(item.expiresAt)}</small>
              <div className="action-row compact-actions">
                <button disabled={!item.id} onClick={() => item.id && onFlagSession(item.id)}><AlertTriangle size={14} /> Flag</button>
                <button disabled={!item.id} onClick={() => item.id && onExtendSession(item.id)}><TimerReset size={14} /> Extend</button>
                <button disabled={!item.id} onClick={() => item.id && onLockSession(item.id)}><LockKeyhole size={14} /> Lock</button>
                <button disabled={!item.id} onClick={() => item.id && onUnlockSession(item.id)}><CheckCircle2 size={14} /> Unlock</button>
                <button disabled={!item.id} onClick={() => item.id && onTrustSession(item.id)}><ShieldCheck size={14} /> Trust</button>
                <button disabled={!item.id} onClick={() => item.id && onRequireSessionMfa(item.id)}><Signature size={14} /> MFA</button>
                <button disabled={!item.id} onClick={() => item.id && onLabelSessionDevice(item.id)}><Server size={14} /> Device</button>
                <button disabled={!item.id} onClick={() => item.id && onNoteSession(item.id)}><MessageSquareText size={14} /> Note</button>
                <button disabled={!item.id || item.id === session.token} onClick={() => item.id && onRevokeSession(item.id)}><LockKeyhole size={14} /> Revoke</button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={ClipboardCheck} title="Readiness Checks" action={readiness?.status ?? "checking"} />
        <div className="action-row">
          <button onClick={refreshReadiness}><RefreshCw size={15} /> Refresh</button>
          <button disabled={!readiness?.checks.length} onClick={bulkAcknowledgeChecks}><CheckCircle2 size={15} /> Bulk ack</button>
          <button onClick={onRecordManualEvent}><RadioTower size={15} /> Record event</button>
          <button onClick={onClearEventLog}><TimerReset size={15} /> Clear events</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Ready" value={String(readinessDigest?.ready ?? readiness?.checks.filter((check) => check.ok).length ?? 0)} />
          <Insight label="Attention" value={String(readinessDigest?.attention ?? readiness?.checks.filter((check) => !check.ok).length ?? 0)} />
          <Insight label="Acknowledged" value={String(readinessDigest?.acknowledged ?? readiness?.checks.filter((check) => check.acknowledged).length ?? 0)} />
          <Insight label="Owners" value={String(readinessDigest?.owned ?? readiness?.checks.filter((check) => check.owner).length ?? 0)} />
          <Insight label="Scheduled" value={String(readinessDigest?.scheduled ?? readiness?.checks.filter((check) => check.recheckAt).length ?? 0)} />
          <Insight label="Next check" value={readinessDigest?.nextCheck ?? readiness?.checks[0]?.name ?? "None"} />
        </div>
        <div className="source-map-list">
          {(readiness?.checks ?? []).map((check) => (
            <article className="source-map-item" key={check.name}>
              <span>{check.override ? "Override" : check.ok ? "Ready" : "Attention"}</span>
              <strong>{check.name}</strong>
              <small>{check.detail} - {check.owner ?? "unowned"}{check.recheckAt ? ` - recheck ${formatDateTime(check.recheckAt)}` : ""}</small>
              <div className="action-row compact-actions">
                <button onClick={() => acknowledgeCheck(check.name)}><CheckCircle2 size={14} /> Ack</button>
                <button onClick={() => overrideCheck(check.name)}><ShieldCheck size={14} /> Override</button>
                <button onClick={() => assignCheckOwner(check.name)}><Users size={14} /> Owner</button>
                <button onClick={() => scheduleCheck(check.name)}><TimerReset size={14} /> Recheck</button>
                <button onClick={() => createRemediation(check.name)}><SquareCheckBig size={14} /> Task</button>
                <button onClick={() => archiveCheck(check.name)}><Files size={14} /> Archive</button>
              </div>
            </article>
          ))}
          {!readiness && <div className="empty-state">Checking platform readiness.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={RadioTower} title="Event Bus Operations" action={`${eventDigest?.total ?? events.length} live`} />
        <div className="action-row">
          <button disabled={!events.length} onClick={() => onBulkArchiveEvents(events.slice(0, 3).map((_, index) => index))}><Files size={15} /> Bulk archive</button>
          <button onClick={onRefreshEventDigest}><RefreshCw size={15} /> Digest</button>
        </div>
        <div className="office-summary-grid">
          <Insight label="Pinned" value={String(eventDigest?.pinned ?? events.filter((event) => event.startsWith("Pinned:")).length)} />
          <Insight label="Ack" value={String(eventDigest?.acknowledged ?? events.filter((event) => event.startsWith("Acknowledged:")).length)} />
          <Insight label="Critical" value={String(eventDigest?.critical ?? events.filter((event) => event.startsWith("Critical:")).length)} />
          <Insight label="Muted" value={String(eventDigest?.muted ?? events.filter((event) => event.startsWith("Muted:")).length)} />
          <Insight label="Routed" value={String(eventDigest?.routed ?? events.filter((event) => event.startsWith("Routed to")).length)} />
          <Insight label="Latest" value={eventDigest?.latest ?? events[0] ?? "None"} />
        </div>
        <div className="source-map-list">
          {events.slice(0, 6).map((event, index) => (
            <article className="source-map-item" key={`${event}-${index}`}>
              <span>Event {index + 1}</span>
              <strong>{event}</strong>
              <small>{event.includes(":") ? event.split(":")[0] : "Live bus"}</small>
              <div className="action-row compact-actions">
                <button onClick={() => onAcknowledgeEvent(index)}><CheckCircle2 size={14} /> Ack</button>
                <button onClick={() => onPinEvent(index)}><ShieldCheck size={14} /> Pin</button>
                <button onClick={() => onUpdateEventSeverity(index)}><AlertTriangle size={14} /> Severity</button>
                <button onClick={() => onRouteEvent(index)}><GitBranch size={14} /> Route</button>
                <button onClick={() => onReplayEvent(index)}><RadioTower size={14} /> Replay</button>
                <button onClick={() => onMuteEvent(index)}><Bell size={14} /> Mute</button>
                <button onClick={() => onAssignEventOwner(index)}><Users size={14} /> Owner</button>
                <button onClick={() => onArchiveEvent(index)}><Files size={14} /> Archive</button>
              </div>
            </article>
          ))}
          {events.length === 0 && <div className="empty-state">No live event bus records.</div>}
        </div>
      </div>
    </section>
  );
}

function formatDateTime(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return new Date(parsed).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function HierarchyPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "panel span-7" : "panel module-primary"}>
      <PanelHeader icon={GitBranch} title="Organizational Hierarchy Graph" action="Graph live" />
      <div className="hierarchy-list">
        {hierarchy.map((node, index) => (
          <article className="hierarchy-row" key={node.level}>
            <div className="node-badge">L{index + 1}</div>
            <div className="node-main">
              <strong>{node.level}</strong>
              <span>{node.node}</span>
            </div>
            <div className="node-metric">{node.metric}</div>
            <FlowMeter label="CMD" value={node.command} />
            <FlowMeter label="RPT" value={node.reports} />
          </article>
        ))}
      </div>
    </div>
  );
}

function AiPanel() {
  return (
    <div className="panel span-5">
      <PanelHeader icon={Sparkles} title="AI Administrative Intelligence" action="Assist" />
      <div className="ai-card">
        <div className="ai-orbit">
          <CircleDot size={24} />
        </div>
        <div>
          <strong>Suggested action</strong>
          <p>Summarize 9 district reports, detect late financial submissions, and draft a national follow-up memo.</p>
        </div>
      </div>
      <div className="insight-list">
        <Insight label="Predicted bottleneck" value="County audit review" />
        <Insight label="Recommended escalation" value="Construction packet overdue" />
        <Insight label="Voice reports queued" value="14 awaiting transcription" />
      </div>
    </div>
  );
}

function ChurchMailPanel({ messages }: { messages: Message[] }) {
  return (
    <div className="panel span-4">
      <PanelHeader icon={Mail} title="ChurchMail Inbox" action="Classified" />
      <div className="message-list">
        {messages.slice(0, 4).map((message) => (
          <MessageCard key={message.subject} message={message} />
        ))}
      </div>
    </div>
  );
}

function WorkflowPanel() {
  return (
    <div className="panel span-4 module-side">
      <PanelHeader icon={Workflow} title="Workflow Monitor" action="Event-driven" />
      <div className="workflow-list">
        {workflows.map((item) => (
          <article className="workflow-item" key={item.label}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.status}</span>
            </div>
            <b>{item.count}</b>
            <div className="progress">
              <i className={item.tone} style={{ width: `${item.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ApprovalPanel({ approvals }: { approvals: Approval[] }) {
  return (
    <div className="panel span-4">
      <PanelHeader icon={FileClock} title="Approval Chains" action="Delegated" />
      <div className="approval-list">
        {approvals.slice(0, 3).map((approval) => (
          <article className="approval-item" key={approval.request}>
            <div>
              <strong>{approval.request}</strong>
              <span>{approval.route}</span>
            </div>
            <div className="approval-meta">
              <small>{approval.limit}</small>
              <StatusPill status={approval.state} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function EventBusPanel({ events }: { events: string[] }) {
  return (
    <div className="panel span-6 module-side">
      <PanelHeader icon={RadioTower} title="Event Bus Pipeline" action="Real time" />
      <div className="pipeline">
        {["User Action", "Event Bus", "Workflow Engine", "Graph Update", "Notification", "Dashboard Refresh"].map((step) => (
          <React.Fragment key={step}>
            <div className="pipeline-step">{step}</div>
            {step !== "Dashboard Refresh" && <ChevronRight size={18} />}
          </React.Fragment>
        ))}
      </div>
      <div className="event-feed">
        {events.map((event) => (
          <div className="event-line" key={event}>
            <span />
            <code>{event}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfflinePanel({
  offlineMode,
  networkOnline,
  offlineQueue,
  offlineConflicts,
  syncHistory,
  installReady,
  onSync
}: {
  offlineMode: boolean;
  networkOnline: boolean;
  offlineQueue: OfflineAction[];
  offlineConflicts: OfflineConflict[];
  syncHistory: OfflineSyncRecord[];
  installReady: boolean;
  onSync: () => void;
}) {
  const readyChecks = [
    { label: "Installed shell", ok: installReady },
    { label: "Station cache", ok: true },
    { label: "Local queue", ok: true },
    { label: "Conflict review", ok: offlineConflicts.length === 0 },
    { label: "Network", ok: networkOnline }
  ];
  const readyCount = readyChecks.filter((item) => item.ok).length;

  return (
    <div className="panel span-6 module-side">
      <PanelHeader icon={Files} title="Offline Sync Queue" action={`${readyCount}/${readyChecks.length} ready`} />
      <div className="offline-readiness">
        {readyChecks.map((check) => (
          <span className={check.ok ? "ready" : "pending"} key={check.label}>
            {check.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            {check.label}
          </span>
        ))}
      </div>
      <div className="sync-layout">
        <div className="sync-stage queued">
          <strong>Local Queue</strong>
          <span>{offlineQueue.length} actions cached on this device</span>
        </div>
        <ChevronRight size={18} />
        <div className="sync-stage">
          <strong>Conflict Resolver</strong>
          <span>{offlineConflicts.length ? `${offlineConflicts.length} records need review` : "No conflicts detected"}</span>
        </div>
        <ChevronRight size={18} />
        <div className="sync-stage synced">
          <strong>{networkOnline ? "Cloud Event Bus" : "Waiting for internet"}</strong>
          <span>{networkOnline ? "Ready to sync upstream" : "Data remains on this device"}</span>
        </div>
      </div>
      <div className="security-strip">
        <ShieldCheck size={18} />
        <span>Offline-first station cache, local audit queue, conflict review, and server sync when the connection returns.</span>
      </div>
      {offlineQueue.length > 0 && (
        <div className="queued-actions">
          {offlineQueue.slice(0, 4).map((item) => (
            <div className="event-line" key={item.id}>
              <span />
              <code>{item.event}: {item.object} - {item.syncStatus ?? "Queued"}</code>
            </div>
          ))}
        </div>
      )}
      {offlineConflicts.length > 0 && (
        <div className="offline-conflicts">
          <strong>Conflict Review</strong>
          {offlineConflicts.slice(0, 3).map((conflict) => (
            <div className="conflict-row" key={conflict.id}>
              <AlertTriangle size={14} />
              <span>{conflict.object}</span>
              <small>{conflict.count} queued edits - {conflict.priority}</small>
            </div>
          ))}
        </div>
      )}
      {syncHistory.length > 0 && (
        <div className="sync-history">
          <strong>Sync History</strong>
          {syncHistory.slice(0, 3).map((record) => (
            <div className={`history-row ${record.status.toLowerCase()}`} key={record.id}>
              <span>{record.status}</span>
              <small>{record.at} - {record.detail}</small>
            </div>
          ))}
        </div>
      )}
      <div className="action-row sync-actions">
        <button disabled={offlineQueue.length === 0 || !networkOnline || offlineConflicts.length > 0} onClick={onSync}>
          <RefreshCw size={15} />
          {!networkOnline ? "Waiting for internet" : offlineConflicts.length ? "Review conflicts first" : "Sync queued actions"}
        </button>
      </div>
    </div>
  );
}

function MessageCard({ message }: { message: Message }) {
  return (
    <article className="message-item">
      <div className={`kind ${message.kind.toLowerCase()}`}>{message.kind}</div>
      <strong>{message.subject}</strong>
      <span>{message.from} - {message.age}</span>
      <div className="message-footer">
        <small>{message.files}</small>
        <StatusPill status={message.status} />
      </div>
    </article>
  );
}

function Metric({ icon: Icon, label, value, trend }: { icon: React.ElementType; label: string; value: string; trend: string }) {
  const tone = trend.includes("escalated") || trend === "watch" ? "risk" : trend.includes("queued") ? "queued" : "ok";
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <small className={tone}>{trend}</small>
    </article>
  );
}

function PanelHeader({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action: string }) {
  return (
    <div className="panel-header">
      <div>
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      <button type="button" aria-label={`${title}: ${action}`}>
        <SlidersHorizontal size={15} />
        <span>{action}</span>
      </button>
    </div>
  );
}

function FlowMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flow-meter">
      <span>{label}</span>
      <div>
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Status | string }) {
  const icon = status === "Approved" ? CheckCircle2 : status === "Escalated" ? AlertTriangle : Send;
  const Icon = icon;
  return (
    <span className={`status ${status.toLowerCase().replaceAll(" ", "-")}`}>
      <Icon size={13} />
      {status}
    </span>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="insight">
      <MessageSquareText size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.update().catch(() => undefined);
    }).catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
