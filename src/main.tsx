import React from "react";
import { createRoot } from "react-dom/client";
import {
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
  ShieldCheck,
  Signature,
  ScrollText,
  SquareCheckBig,
  LogOut,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Upload,
  Users,
  Workflow
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

type Section = "Control Center" | "ChurchMail" | "Reports" | "Approvals" | "Tasks" | "Policies" | "Calendar" | "Personnel" | "Escalations" | "AI Desk" | "Hierarchy" | "Offices" | "Transfers" | "Archive" | "Audit";
type MessageKind = "Directive" | "Report" | "Approval" | "Notification" | "Transfer";
type Status = "Ready" | "In Review" | "Escalated" | "Approved" | "Queued";
type StationCard = { id?: string; email: string; title: string; level: StationLevel | string; authority: string; icon?: React.ElementType; status?: string; verified?: boolean; watchers?: string[]; mirrorOf?: string };
type StationAuth = { email: string; status: string; failedAttempts: number; lockedUntil?: string; mfaRequired?: boolean; forceReset?: boolean; updatedAt?: string; updatedBy?: string; lastLoginAt?: string; lastFailedAt?: string };
type StationAuthDigest = { generatedAt: string; total: number; locked: number; mfaRequired: number; resetRequired: number; failedAttempts: number; nextCredential: string };
type Message = { id: string; kind: MessageKind; subject: string; from: string; age: string; status: Status; files: string; route?: string; priority?: "Low" | "Medium" | "High" | "Critical"; archived?: boolean; watchers?: string[] };
type Report = { id: string; name: string; owner: string; path: string; due: string; state: string; score: number; evidenceStatus?: string; reviewNote?: string; verified?: boolean; archived?: boolean; watchers?: string[] };
type Approval = { id: string; request: string; route: string; limit: string; state: string; signatures: string; delegate?: string; holdReason?: string; archived?: boolean; watchers?: string[] };
type GovernanceTask = { id: string; title: string; owner: string; assignee: string; priority: "Low" | "Medium" | "High" | "Critical"; due: string; status: "Queued" | "In Progress" | "Blocked" | "Complete"; blocker?: string; watchers?: string[]; dependencies?: string[]; approvalRequired?: boolean; approvalRoute?: string; sla?: string; slaStatus?: string; evidence?: string; handoffTo?: string; escalated?: boolean; escalationReason?: string; comments?: string[]; checkpoints?: string[]; scheduledFor?: string; dispatchTeam?: string; dispatchLocation?: string; timeHours?: number; qaStatus?: string; qaReviewer?: string; riskAccepted?: boolean; riskReason?: string; templateSaved?: boolean; templateName?: string; linkedReport?: string; linkedApproval?: string; archived?: boolean; archiveReason?: string };
type Policy = { id: string; title: string; category: string; owner: string; status: "Draft" | "Active" | "Review" | "Retired"; summary: string; acknowledgements: number; version?: string; reviewBy?: string; watchers?: string[]; complianceStatus?: string; complianceScore?: number; evidence?: string; distributedTo?: string; distributedAt?: string; exceptionNote?: string; exceptionExpires?: string; trainingAssigned?: boolean; trainingAudience?: string; hold?: boolean; holdReason?: string; linkedTask?: string; linkedApproval?: string; archived?: boolean; archiveReason?: string };
type CalendarEvent = { id: string; title: string; category: string; owner: string; date: string; priority: "Low" | "Medium" | "High" | "Critical"; status: "Scheduled" | "At Risk" | "Complete"; watchers?: string[]; checkInStatus?: string; checkInBy?: string; venue?: string; agenda?: string; attendance?: number; reminderSent?: boolean; reminderAudience?: string; readiness?: string; linkedTask?: string; linkedReport?: string; archived?: boolean; archiveReason?: string };
type PersonRecord = { id: string; name: string; role: string; currentStation: string; assignedStation: string; status: "Active" | "Transfer Pending" | "Assigned" | "Inactive" | "Onboarding" | "On Leave"; clearance?: string; credentialStatus?: string; trainingStatus?: string; trainingTrack?: string; stationAccess?: string; accessStatus?: string; incidentFlag?: string; incidentSeverity?: string; linkedTask?: string; reviewStatus?: string; reviewNote?: string; archived?: boolean; archiveReason?: string };
type Transfer = { id: string; person: string; from: string; to: string; step: string; risk: string; letterStatus?: string; letterRef?: string; scheduledFor?: string; notes?: string[]; watchers?: string[]; personnelRecord?: string; linkedTask?: string; linkedReport?: string; archived?: boolean; archiveReason?: string };
type AuditRow = { id: string; event: string; actor: string; object: string; result: string; time: string; sealed?: boolean; verified?: boolean; chainHash?: string; verification?: string; severity?: "Info" | "Low" | "Medium" | "High" | "Critical"; category?: string; reviewer?: string; comments?: string[]; investigation?: "Open" | "Closed"; investigationReason?: string; investigationResult?: string; hold?: boolean; holdReason?: string; holdReleaseReason?: string };
type OfflineAction = AuditRow & { queuedAt: string };
type Session = { email: string; startedAt: string; token?: string; expiresAt?: string };
type Office = { id: string; name: string; email: string; level: StationLevel; department: string; supervisor: string; password: string; status: string; emailVerified?: boolean; watchers?: string[]; notes?: string[]; capacity?: number; complianceStatus?: string; archived?: boolean; archiveReason?: string };
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
  averageScore: number;
  nextReport: string;
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
  { icon: Mail, label: "ChurchMail" },
  { icon: FileCheck2, label: "Reports" },
  { icon: Workflow, label: "Approvals" },
  { icon: SquareCheckBig, label: "Tasks" },
  { icon: ScrollText, label: "Policies" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: Users, label: "Personnel" },
  { icon: AlertTriangle, label: "Escalations" },
  { icon: Sparkles, label: "AI Desk" },
  { icon: GitBranch, label: "Hierarchy" },
  { icon: Building2, label: "Offices" },
  { icon: Signature, label: "Transfers" },
  { icon: Files, label: "Archive" },
  { icon: ShieldCheck, label: "Audit" }
];

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
    email: "international@gcos.org",
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
    email: "local_branch_017@gcos.org",
    title: "Local Branch Workstation",
    level: "Local Branch",
    authority: "Local reports, member registry, directive acknowledgement",
    icon: Inbox
  }
];

const demoStationPassword = (label: string) => ["gcos", label].join("-");

const stationPasswords: Record<string, string> = {
  "international@gcos.org": demoStationPassword("global"),
  "np@rmvi.org": demoStationPassword("national"),
  "district_admin@rmvi.org": demoStationPassword("district"),
  "local_branch_017@gcos.org": demoStationPassword("local")
};

const API_BASE = (import.meta.env.VITE_GCOS_API_BASE ?? (import.meta.env.DEV ? "http://127.0.0.1:8787" : "")).replace(/\/$/, "");
const CHURCH_LOGO_SRC = "/brand/lion-of-judah-logo.jpg";

const initialMessages: Message[] = [
  { id: "msg-001", kind: "Directive", subject: "Q2 governance reporting directive", from: "Regional HQ - West Africa", age: "12 min", status: "Ready", files: "Policy memo" },
  { id: "msg-002", kind: "Report", subject: "District construction progress packet", from: "Buchanan District Office", age: "37 min", status: "In Review", files: "PDF, photos" },
  { id: "msg-003", kind: "Approval", subject: "Finance release request: mission transport", from: "County Finance", age: "1 hr", status: "Escalated", files: "Form, signatures" },
  { id: "msg-004", kind: "Transfer", subject: "Official reassignment letter", from: "Mission Office", age: "2 hrs", status: "Queued", files: "Signed letter" },
  { id: "msg-005", kind: "Notification", subject: "Audit packet deadline reminder", from: "Compliance Engine", age: "3 hrs", status: "Ready", files: "Checklist" }
];

const initialReports: Report[] = [
  { id: "rep-001", name: "National mission activity report", owner: "National Programs", path: "Local -> Area -> District -> County -> National", due: "Today", state: "In Review", score: 86 },
  { id: "rep-002", name: "County finance summary", owner: "County Finance", path: "County -> National", due: "Tomorrow", state: "Ready", score: 94 },
  { id: "rep-003", name: "Construction milestone report", owner: "District Works", path: "District -> County", due: "Overdue", state: "Escalated", score: 58 },
  { id: "rep-004", name: "Education directorate update", owner: "Directorate Office", path: "National -> Regional", due: "May 20", state: "Approved", score: 100 }
];

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
    email: "riverbend_area@gcos.org",
    level: "Area HQ",
    department: "Area Coordination",
    supervisor: "Buchanan District",
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
  { id: "aud-005", event: "OfficeCreated", actor: "international@gcos.org", object: "Riverbend Area Office", result: "Graph updated", time: "08:31" }
];

const initialOfflineQueue: OfflineAction[] = [];

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

function getInitialSection(): Section {
  const section = new URLSearchParams(window.location.search).get("section");
  return isSection(section) ? section : "Control Center";
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
      const parsed = JSON.parse(stored) as T;
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

function normalizeStationEmail(email: string) {
  return email.toLowerCase().replace("@rmi.org", "@rmvi.org");
}

function getPermissions(station: StationCard): Permissions {
  const level = station.level;
  return {
    canCreateOffices: ["International HQ", "Regional HQ", "National HQ"].includes(level),
    canApprove: ["International HQ", "Regional HQ", "National HQ", "County/State HQ", "District HQ"].includes(level),
    canExecuteTransfers: ["International HQ", "Regional HQ", "National HQ", "District HQ"].includes(level),
    canOverride: ["International HQ", "Regional HQ"].includes(level)
  };
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
  const [messages, setMessages] = usePersistentState("gcos.messages", initialMessages);
  const [reports, setReports] = usePersistentState("gcos.reports", initialReports);
  const [approvals, setApprovals] = usePersistentState("gcos.approvals", initialApprovals);
  const [tasks, setTasks] = usePersistentState("gcos.tasks", initialTasks);
  const [policies, setPolicies] = usePersistentState("gcos.policies", initialPolicies);
  const [calendarEvents, setCalendarEvents] = usePersistentState("gcos.calendarEvents", initialCalendarEvents);
  const [personnel, setPersonnel] = usePersistentState("gcos.personnel", initialPersonnel);
  const [transfers, setTransfers] = usePersistentState("gcos.transfers", initialTransfers);
  const [offices, setOffices] = usePersistentState("gcos.offices", initialOffices);
  const [apiStations, setApiStations] = usePersistentState<StationCard[]>("gcos.stations", stations);
  const [escalations, setEscalations] = usePersistentState("gcos.escalations", initialEscalations);
  const [aiDrafts, setAiDrafts] = usePersistentState("gcos.aiDrafts", initialAiDrafts);
  const [documents, setDocuments] = usePersistentState("gcos.documents", initialDocuments);
  const [auditRows, setAuditRows] = usePersistentState("gcos.auditRows", initialAuditRows);
  const [events, setEvents] = usePersistentState("gcos.events", initialEvents);
  const [offlineQueue, setOfflineQueue] = usePersistentState("gcos.offlineQueue", initialOfflineQueue);
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
    const baseStations = apiStations.length ? apiStations : stations;
    baseStations.forEach((station) => {
      directory.set(station.email, { ...station, icon: station.icon ?? iconForLevel(station.level) });
    });
    offices.forEach((office) => {
      directory.set(office.email, {
      email: office.email,
      title: `${office.name} Workstation`,
      level: office.level,
      authority: `${office.department}, supervised by ${office.supervisor}`,
      icon: Building2,
      status: office.status
      });
    });
    return Array.from(directory.values());
  }, [apiStations, offices]);
  const StationIcon = activeStation.icon ?? iconForLevel(activeStation.level);
  const permissions = getPermissions(activeStation);
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
  ].slice(0, 10), [approvals, auditRows, calendarEvents, escalations, offlineQueue, personnel, policies, tasks, transfers]);
  const criticalNotificationCount = notifications.filter((item) => ["Critical", "High"].includes(item.severity)).length;
  const searchResults = React.useMemo(() => {
    const records: SearchResult[] = [
      ...messages.map((item) => ({ id: item.id, section: "ChurchMail" as Section, title: item.subject, meta: `${item.kind} - ${item.from} - ${item.files}`, status: item.status })),
      ...reports.map((item) => ({ id: item.id, section: "Reports" as Section, title: item.name, meta: `${item.owner} - ${item.path} - ${item.due}`, status: item.state })),
      ...approvals.map((item) => ({ id: item.id, section: "Approvals" as Section, title: item.request, meta: `${item.route} - ${item.limit}`, status: item.state })),
      ...tasks.map((item) => ({ id: item.id, section: "Tasks" as Section, title: item.title, meta: `${item.owner} - ${item.assignee} - ${item.priority} - ${item.due}`, status: item.status })),
      ...policies.map((item) => ({ id: item.id, section: "Policies" as Section, title: item.title, meta: `${item.category} - ${item.owner} - ${item.summary}`, status: item.status })),
      ...calendarEvents.map((item) => ({ id: item.id, section: "Calendar" as Section, title: item.title, meta: `${item.category} - ${item.owner} - ${item.date} - ${item.priority}`, status: item.status })),
      ...personnel.map((item) => ({ id: item.id, section: "Personnel" as Section, title: item.name, meta: `${item.role} - ${item.currentStation} -> ${item.assignedStation}`, status: item.status })),
      ...escalations.map((item) => ({ id: item.id, section: "Escalations" as Section, title: item.item, meta: `${item.owner} - ${item.reason}`, status: item.status })),
      ...offices.map((item) => ({ id: item.id, section: "Offices" as Section, title: item.name, meta: `${item.email} - ${item.level} - ${item.supervisor}`, status: item.status })),
      ...transfers.map((item) => ({ id: item.id, section: "Transfers" as Section, title: item.person, meta: `${item.from} -> ${item.to} - ${item.risk}`, status: item.step })),
      ...documents.map((item) => ({ id: item.id, section: "Archive" as Section, title: item.name, meta: `${item.classification} - ${item.source} - ${item.owner}`, status: item.status })),
      ...auditRows.map((item) => ({ id: item.id, section: "Audit" as Section, title: item.object, meta: `${item.event} - ${item.actor} - ${item.result}`, status: item.time }))
    ];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return records.filter((record) => [record.title, record.meta, record.status, record.section].join(" ").toLowerCase().includes(query)).slice(0, 8);
  }, [approvals, auditRows, calendarEvents, documents, escalations, messages, offices, personnel, policies, reports, searchQuery, tasks, transfers]);

  function openSearchResult(result: SearchResult) {
    setActiveSection(result.section);
    setSearchQuery("");
  }

  function openNotification(item: NotificationItem) {
    setActiveSection(item.section);
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
        personnel: PersonRecord[];
        escalations: Escalation[];
        transfers: Transfer[];
        offices: Office[];
        documents: DocumentRecord[];
        aiDrafts: AiDraft[];
        audit: AuditRow[];
        events: string[];
      }>("/api/bootstrap");
      setApiStations(data.stations.length ? data.stations : stations);
      setMessages(data.messages);
      setReports(data.reports);
      setApprovals(data.approvals);
      setTasks(data.tasks ?? initialTasks);
      setPolicies(data.policies ?? initialPolicies);
      setCalendarEvents(data.calendarEvents ?? initialCalendarEvents);
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
        setActiveStation((current) => ({ ...current, title: serverStation.title, level: serverStation.level, authority: serverStation.authority, icon: current.icon ?? iconForLevel(serverStation.level) }));
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
      setPersonnel(data.personnel ?? initialPersonnel);
      setEscalations(data.escalations);
      setTransfers(data.transfers);
      setOffices(data.offices);
    setDocuments(data.documents ?? initialDocuments);
    setAiDrafts(data.aiDrafts.length ? data.aiDrafts : initialAiDrafts);
    setAuditRows(data.audit);
    setEvents(data.events);
    setOfflineQueue([]);
      setOfflineMode(false);
      setActiveSection("Control Center");
    } catch {
      setEvents((items) => ["ApiResetUnavailable: local workstation cache preserved", ...items].slice(0, 8));
    }
  }

  React.useEffect(() => {
    if (!session) return;
    if (!session.token) {
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
    void refreshFromApi();
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      void apiRequest<ApiStatus>("/api/status")
        .then((status) => {
          setApiStatus(status);
          setApiStatusError("");
        })
        .catch(() => setApiStatusError("API unavailable"));
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const nextUrl = new URL(window.location.href);
    if (activeSection === "Control Center") {
      nextUrl.searchParams.delete("section");
    } else {
      nextUrl.searchParams.set("section", activeSection);
    }
    window.history.replaceState({}, "", nextUrl);
  }, [activeSection]);

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
    if (offlineMode) {
      setOfflineQueue((items) => [{ ...row, queuedAt: time }, ...items]);
      return;
    }
    setAuditRows((rows) => [row, ...rows]);
    setEvents((items) => [`${event}: ${object}`, ...items].slice(0, 8));
  }

  async function syncOfflineQueue() {
    if (offlineQueue.length === 0) return;
    const syncedRows = offlineQueue.map((item) => ({
      id: item.id,
      event: item.event,
      actor: item.actor,
      object: item.object,
      result: `${item.result} (synced)`,
      time: item.time
    }));
    setAuditRows((rows) => [...syncedRows, ...rows]);
    setEvents((items) => [
      `SyncCompleted: ${offlineQueue.length} queued actions`,
      ...offlineQueue.map((item) => `${item.event}: ${item.object}`),
      ...items
    ].slice(0, 8));
    setOfflineQueue([]);
    setOfflineMode(false);
    try {
      await apiRequest("/api/offline-sync", {
        method: "POST",
        body: JSON.stringify({ actions: offlineQueue })
      });
      await refreshFromApi();
    } catch {
      setEvents((items) => ["ApiSyncDeferred: offline queue kept locally", ...items].slice(0, 8));
    }
  }

  function handleLogin(email: string, password: string) {
    const normalizedEmail = normalizeStationEmail(email);
    const station = stationDirectory.find((item) => item.email === normalizedEmail);
    const officePassword = offices.find((office) => office.email === normalizedEmail)?.password;
    const expectedPassword = stationPasswords[normalizedEmail] ?? officePassword;
    if (!station || expectedPassword !== password) {
      return false;
    }

    const startedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSession({ email: normalizedEmail, startedAt });
    setActiveStation(station);
    setActiveSection("Control Center");
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
      setSession({ email: normalizedEmail, startedAt, token: result.token, expiresAt: result.expiresAt });
      return refreshFromApi();
    }).catch(() => undefined);
    return true;
  }

  function handleLogout() {
    recordAudit("Logout", activeStation.title, "Session closed");
    setSession(null);
    setActiveSection("Control Center");
  }

  if (!session) {
    return <LoginScreen offices={offices} stationDirectory={stationDirectory} onLogin={handleLogin} />;
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
      score: 32
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
      score: 18
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
    setReports((items) => items.map((item) => item.id === id ? { ...item, state: "Approved", score: 100 } : item));
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
    setReports((items) => items.map((item) => item.id === id ? { ...item, state: "Correction Requested", score: Math.min(item.score, 45) } : item));
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
    setReports((items) => items.map((item) => item.id === id ? { ...item, score: nextScore, state } : item));
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
    setReports((items) => items.map((item) => item.id === id ? { ...item, path } : item));
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
    setReports((items) => items.map((item) => item.id === id ? { ...item, evidenceStatus: "Evidence attached", score: Math.max(item.score, 70) } : item));
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
    setReports((items) => items.map((item) => item.id === id ? { ...item, state: "In Review", reviewNote: "Supervisory review opened" } : item));
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
    setReports((items) => items.map((item) => item.id === id ? { ...item, verified: true, state: "Approved", score: Math.max(item.score, 95) } : item));
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
    const duplicate: Report = { ...report, id: `rep-${Date.now()}`, name: `${report.name} follow-up`, state: "Ready", score: Math.min(report.score, 35) };
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
    setReports((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, state: "Approved", score: 100 } : item));
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
    setReports((items) => items.map((item) => targetIds.includes(item.id) ? { ...item, state: "Correction Requested", score: Math.min(item.score, 45) } : item));
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

    const createdOffice: Office = {
      ...office,
      email: normalizedEmail,
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
    setApiStations((items) => items.map((item) => stationKey(item) === id || item.email === id ? { ...item, ...updates } : item));
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
    const ids = stationDirectory.slice(0, 3).map(stationKey);
    setApiStations((items) => items.map((item) => ids.includes(stationKey(item)) ? { ...item, verified: true, status: "Verified" } : item));
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
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <img src={CHURCH_LOGO_SRC} alt="The Lion of the Tribe of Judah church logo" />
          </div>
          <div>
            <strong>GCOS</strong>
            <span>Church Governance OS</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map(({ icon: Icon, label }) => (
            <button
              className={label === activeSection ? "nav-item active" : "nav-item"}
              key={label}
              aria-label={label}
              onClick={() => setActiveSection(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="station-switcher" aria-label="Station switcher">
          <p>Station Identity</p>
          {stationDirectory.map((station) => {
            const Icon = station.icon ?? iconForLevel(station.level);
            return (
              <button
                key={station.email}
                className={station.email === activeStation.email ? "station-option selected" : "station-option"}
                aria-label={station.email}
                onClick={() => setActiveStation(station)}
              >
                <Icon size={16} />
                <span>{station.email}</span>
              </button>
            );
          })}
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="station-title">
            <button className="icon-button" aria-label="Toggle sidebar">
              <PanelLeft size={18} />
            </button>
            <div className="station-avatar">
              <StationIcon size={22} />
            </div>
            <div>
              <h1>{activeSection === "Control Center" ? activeStation.title : activeSection}</h1>
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
            <button className={offlineMode ? "sync-toggle offline" : "sync-toggle"} onClick={() => setOfflineMode(!offlineMode)}>
              {offlineMode ? <CloudOff size={17} /> : <RefreshCw size={17} />}
              <span>{offlineMode ? "Offline queue" : "Live sync"}</span>
            </button>
            <div className={apiStatusError ? "api-status down" : "api-status"}>
              <Server size={15} />
              <span>{apiStatusError || (apiStatus?.serveWeb ? "API + web" : "API live")}</span>
            </div>
            <button className="icon-button" aria-label="Refresh from API" onClick={refreshFromApi}>
              <RefreshCw size={18} />
            </button>
            <button className="icon-button" aria-label="Reset demo data" onClick={resetWorkstationData}>
              <TimerReset size={18} />
            </button>
            <button className={pwa.installed ? "install-toggle installed" : "install-toggle"} onClick={pwa.install} disabled={!pwa.canInstall || pwa.installed}>
              <Download size={17} />
              <span>{pwa.installed ? "Installed" : pwa.canInstall ? "Install web app" : "Web ready"}</span>
            </button>
            <div className="session-pill">
              <LockKeyhole size={15} />
              <span>{session.startedAt}</span>
            </div>
            <div className="permission-strip" aria-label="Station permissions">
              {permissions.canCreateOffices && <span>Office admin</span>}
              {permissions.canApprove && <span>Approver</span>}
              {permissions.canExecuteTransfers && <span>Transfers</span>}
              {permissions.canOverride && <span>Override</span>}
              {!permissions.canApprove && <span>Reporter</span>}
            </div>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)}>
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
            <button className="icon-button" aria-label="Logout" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <Metrics metrics={operatingMetrics} />
        {activeSection === "Control Center" && (
          <ControlCenter
            offlineMode={offlineMode}
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
          />
        )}
        {activeSection === "ChurchMail" && (
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
        {activeSection === "Reports" && (
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
            onBulkSubmit={bulkSubmitReports}
            onBulkCorrection={bulkRequestReportCorrections}
            onRefreshDigest={refreshReportDigest}
            digest={reportDigest}
          />
        )}
        {activeSection === "Approvals" && (
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
        {activeSection === "Tasks" && (
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
        {activeSection === "Policies" && (
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
        {activeSection === "Calendar" && (
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
        {activeSection === "Personnel" && (
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
        {activeSection === "Escalations" && (
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
        {activeSection === "AI Desk" && (
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
        {activeSection === "Hierarchy" && (
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
        {activeSection === "Offices" && <Offices offices={offices} stationDirectory={stationDirectory} permissions={permissions} onCreateOffice={createOffice} onUpdateOfficeSupervisor={updateOfficeSupervisor} onUpdateOfficeStatus={updateOfficeStatus} onActivateOffice={activateOffice} onSuspendOffice={suspendOffice} onRotatePassword={rotateOfficePassword} onActivateStation={activateOfficeStation} onUpdateDepartment={updateOfficeDepartment} onUpdateLevel={updateOfficeLevel} onVerifyEmail={verifyOfficeEmail} onWatchOffice={watchOffice} onNoteOffice={noteOffice} onUpdateCapacity={updateOfficeCapacity} onReviewCompliance={reviewOfficeCompliance} onArchiveOffice={archiveOffice} onBulkActivate={bulkActivateOffices} onRefreshDigest={refreshOfficeDigest} digest={officeDigest} />}
        {activeSection === "Transfers" && (
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
        {activeSection === "Archive" && <Archive documents={documents} station={activeStation} offlineMode={offlineMode} manifest={archiveManifest} onArchiveDocument={archiveDocument} onUpdateClassification={updateDocumentClassification} onUpdateOwner={updateDocumentOwner} onMarkReview={markDocumentReview} onMarkArchived={markDocumentArchived} onSealDocument={sealDocument} onPlaceHold={placeDocumentHold} onUpdateRetention={updateDocumentRetention} onDuplicateDocument={duplicateDocument} onVerifyDocument={verifyDocument} onAssignCustody={assignDocumentCustody} onUpdateChain={updateDocumentChain} onExtractText={extractDocumentText} onLinkReport={linkDocumentReport} onLinkApproval={linkDocumentApproval} onWatchDocument={watchDocument} onExportDocument={exportDocumentRecord} onUploadFile={uploadDocumentFile} onBulkSeal={bulkSealDocuments} onRefreshManifest={refreshArchiveManifest} />}
        {activeSection === "Audit" && (
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
  offices,
  stationDirectory,
  onLogin
}: {
  offices: Office[];
  stationDirectory: StationCard[];
  onLogin: (email: string, password: string) => boolean;
}) {
  const credentialMap = React.useMemo(() => ({
    ...stationPasswords,
    ...Object.fromEntries(offices.map((office) => [office.email, office.password]))
  }), [offices]);
  const [email, setEmail] = React.useState(stations[1].email);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const selectedStation = stationDirectory.find((station) => station.email === email) ?? stations[1];
  const StationIcon = selectedStation.icon ?? iconForLevel(selectedStation.level);
  const visibleCredentials = stationDirectory.filter((station, index, items) => (
    items.findIndex((item) => item.email === station.email) === index && credentialMap[station.email]
  ));

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = onLogin(email, password);
    setError(ok ? "" : "Station credentials were not accepted.");
  }

  function chooseStation(nextEmail: string) {
    setEmail(nextEmail);
    setPassword("");
    setError("");
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand login-brand">
          <div className="brand-mark">
            <img src={CHURCH_LOGO_SRC} alt="The Lion of the Tribe of Judah church logo" />
          </div>
          <div>
            <strong>GCOS</strong>
            <span>Station Access Gateway</span>
          </div>
        </div>

        <div className="login-heading">
          <div className="station-avatar">
            <StationIcon size={24} />
          </div>
          <div>
            <h1>{selectedStation.title}</h1>
            <p>{selectedStation.level} - {selectedStation.authority}</p>
          </div>
        </div>

        <form className="login-form" onSubmit={submit}>
          <label>
            <span>Organizational email</span>
            <select value={email} onChange={(event) => chooseStation(event.target.value)} aria-label="Organizational email">
              {visibleCredentials.map((station) => (
                <option key={station.email} value={station.email}>{station.email}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Password</span>
            <input
              aria-label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit">
            <LockKeyhole size={16} />
            Enter workstation
          </button>
        </form>

        <div className="credential-grid" aria-label="Demo credentials">
          {visibleCredentials.map((station) => (
            <button key={station.email} onClick={() => chooseStation(station.email)}>
              <strong>{station.email}</strong>
              <span>{credentialMap[station.email]}</span>
            </button>
          ))}
        </div>
      </section>
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
      <OfflinePanel offlineMode={offlineMode} offlineQueue={offlineQueue} onSync={onSync} />
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
  onBulkSubmit,
  onBulkCorrection,
  onRefreshDigest,
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
  onBulkSubmit: (ids: string[]) => void;
  onBulkCorrection: (ids: string[]) => void;
  onRefreshDigest: () => void;
  digest: ReportDigest | null;
}) {
  const [name, setName] = React.useState("Monthly branch administration report");
  const [owner, setOwner] = React.useState(String(station.level));
  const [path, setPath] = React.useState(`${station.level} -> Supervising Office`);
  const [due, setDue] = React.useState("Draft");
  const [stateFilter, setStateFilter] = React.useState("All states");
  const [feedback, setFeedback] = React.useState("");
  const visibleReports = React.useMemo(() => (
    stateFilter === "All states" ? reports : reports.filter((report) => report.state === stateFilter)
  ), [reports, stateFilter]);
  const stateOptions = React.useMemo(() => ["All states", ...Array.from(new Set(reports.map((report) => report.state))).sort()], [reports]);
  const openCount = reports.filter((report) => report.state !== "Approved").length;
  const overdueCount = reports.filter((report) => report.due === "Overdue").length;
  const correctionCount = reports.filter((report) => report.state === "Correction Requested").length;
  const watchedCount = reports.filter((report) => report.watchers?.length).length;

  React.useEffect(() => {
    setOwner(String(station.level));
    setPath(`${station.level} -> Supervising Office`);
  }, [station.level]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateReport({ name, owner, path, due });
    setFeedback(`${name} has been drafted.`);
    setName("New administrative report");
  }

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={FileCheck2} title="Hierarchical Reporting Center" action={`${visibleReports.length} visible`} />
        <div className="office-summary-grid">
          <Insight label="Open" value={String(digest?.open ?? openCount)} />
          <Insight label="Overdue" value={String(digest?.overdue ?? overdueCount)} />
          <Insight label="Corrections" value={String(digest?.correction ?? correctionCount)} />
          <Insight label="Verified" value={String(digest?.verified ?? reports.filter((report) => report.verified).length)} />
          <Insight label="Watched" value={String(digest?.watched ?? watchedCount)} />
          <Insight label="Average score" value={`${digest?.averageScore ?? 0}%`} />
          <Insight label="Next report" value={digest?.nextReport ?? visibleReports[0]?.name ?? "None"} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>State</span>
            <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              {stateOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => onBulkSubmit(visibleReports.map((report) => report.id))}><Send size={14} /> Submit visible</button>
          <button type="button" onClick={() => onBulkCorrection(visibleReports.map((report) => report.id))}><FileClock size={14} /> Correct visible</button>
          <button type="button" onClick={onRefreshDigest}><RefreshCw size={14} /> Digest</button>
        </div>
        <div className="data-table">
          <div className="table-row table-head">
            <span>Report</span><span>Owner</span><span>Route</span><span>Due</span><span>Status</span>
          </div>
          {visibleReports.map((report) => (
            <div className="table-row" key={report.name}>
              <strong>{report.name}</strong>
              <span>{report.owner}</span>
              <span>{report.path}</span>
              <span>{report.due}</span>
              <div className="table-actions">
                <StatusPill status={report.state} />
                <button aria-label={`Submit ${report.name}`} onClick={() => onSubmitReport(report.id)}><Send size={14} /> Submit</button>
                <button aria-label={`Request correction for ${report.name}`} onClick={() => onRequestCorrection(report.id)}><FileClock size={14} /> Correct</button>
                <button aria-label={`Review ${report.name}`} onClick={() => onReviewReport(report.id)}><FileCheck2 size={14} /> Review</button>
                <button aria-label={`Verify ${report.name}`} onClick={() => onVerifyReport(report.id)}><CheckCircle2 size={14} /> Verify</button>
                <button aria-label={`Update due status for ${report.name}`} onClick={() => onUpdateDue(report.id, report.due === "Overdue" ? "This week" : "Overdue")}><TimerReset size={14} /> Due</button>
                <button aria-label={`Raise score for ${report.name}`} onClick={() => onUpdateScore(report.id, report.score + 15)}><CheckCircle2 size={14} /> Score</button>
                <button aria-label={`Update owner for ${report.name}`} onClick={() => onUpdateOwner(report.id)}><Users size={14} /> Owner</button>
                <button aria-label={`Update path for ${report.name}`} onClick={() => onUpdatePath(report.id)}><Workflow size={14} /> Path</button>
                <button aria-label={`Mark evidence for ${report.name}`} onClick={() => onMarkEvidence(report.id)}><Files size={14} /> Evidence</button>
                <button aria-label={`Watch ${report.name}`} onClick={() => onWatchReport(report.id)}><Bell size={14} /> Watch</button>
                <button aria-label={`Duplicate ${report.name}`} onClick={() => onDuplicateReport(report.id)}><Files size={14} /> Duplicate</button>
                <button aria-label={`Archive ${report.name}`} onClick={() => onArchiveReport(report.id)}><LockKeyhole size={14} /> Archive</button>
                <button aria-label={`Vault evidence for ${report.name}`} onClick={() => onArchiveEvidence(report.id)}><Files size={14} /> Vault</button>
                <button
                  aria-label={`Escalate ${report.name}`}
                  onClick={() => onEscalateReport("Report", report.name, `${report.due} report requires supervisory attention`, report.owner, report.due === "Overdue" ? "Critical" : "Medium")}
                >
                  <AlertTriangle size={14} /> Escalate
                </button>
              </div>
            </div>
          ))}
          {visibleReports.length === 0 && <div className="empty-state">No reports match the current state filter.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Plus} title="Draft Report" action="Create" />
        <form className="office-form" onSubmit={submit}>
          <label>
            <span>Report name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Owner</span>
            <input value={owner} onChange={(event) => setOwner(event.target.value)} />
          </label>
          <label>
            <span>Routing path</span>
            <input value={path} onChange={(event) => setPath(event.target.value)} />
          </label>
          <label>
            <span>Due status</span>
            <select value={due} onChange={(event) => setDue(event.target.value)}>
              <option>Draft</option>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This week</option>
              <option>Overdue</option>
            </select>
          </label>
          {feedback && <div className="compose-feedback">{feedback}</div>}
          <button type="submit"><Plus size={15} /> Create report</button>
        </form>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={Sparkles} title="Report Intelligence" action="Status" />
        {reports.map((report) => (
          <div className="score-row" key={report.name}>
            <span>{report.name}</span>
            <FlowMeter label={`${report.score}% complete`} value={report.score} />
          </div>
        ))}
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
                {["Request", "Validation", "Delegation", "Approval", "Audit"].map((step) => (
                  <div className="pipeline-step" key={step}>{step}</div>
                ))}
              </div>
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
  const [role, setRole] = React.useState("Area Coordinator");
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
            <input value={role} onChange={(event) => setRole(event.target.value)} />
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
            const StationRowIcon = station.icon ?? iconForLevel(station.level);
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
  const [email, setEmail] = React.useState("newhope_district@gcos.org");
  const [level, setLevel] = React.useState<StationLevel>("District HQ");
  const [department, setDepartment] = React.useState("District Command");
  const [supervisor, setSupervisor] = React.useState("County/State Headquarters");
  const [levelFilter, setLevelFilter] = React.useState<StationLevel | "All levels">("All levels");
  const [feedback, setFeedback] = React.useState("");
  const filteredOffices = React.useMemo(() => (
    offices.filter((office) => !office.archived && (levelFilter === "All levels" || office.level === levelFilter))
  ), [levelFilter, offices]);
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
    const ok = onCreateOffice({ name, email, level, department, supervisor });
    if (!ok) {
      setFeedback("That station email already exists.");
      return;
    }

    setFeedback(`${name} has been provisioned.`);
    const nextName = `Mission Office ${offices.length + 2}`;
    setName(nextName);
    setEmail(`${nextName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "")}@gcos.org`);
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
              <strong>{office.name}</strong>
              <span>{office.email}</span>
              <span>{office.level}</span>
              <span>{office.supervisor}</span>
              <div className="table-actions">
                <StatusPill status={office.status} />
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
              <strong>{station.title}</strong>
              <span>{station.email}</span>
              <span>{station.level}</span>
              <span>{station.origin}</span>
              <span>{station.permissions}</span>
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
            <span>Supervisor</span>
            <input value={supervisor} onChange={(event) => setSupervisor(event.target.value)} />
          </label>
          {feedback && <div className="login-error">{feedback}</div>}
          <button disabled={!permissions.canCreateOffices} type="submit"><Plus size={15} /> Provision workstation</button>
        </form>

        <div className="provision-summary">
          <strong>Generated assets</strong>
          <span>Dashboard, inbox, reporting structure, approval permissions, analytics panel, audit ledger registration.</span>
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
      <OfflinePanel offlineMode offlineQueue={offlineQueue} onSync={onSync} />
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
  const [migrationPlan, setMigrationPlan] = React.useState<PersistenceMigrationPlan | null>(null);
  const [schemaPlan, setSchemaPlan] = React.useState<PersistenceSchemaPlan | null>(null);
  const [importDryRun, setImportDryRun] = React.useState<PersistenceImportDryRun | null>(null);
  const [cutoverChecklist, setCutoverChecklist] = React.useState<PersistenceCutoverChecklist | null>(null);
  const [launchReadiness, setLaunchReadiness] = React.useState<LaunchReadiness | null>(null);
  const [deploymentPlan, setDeploymentPlan] = React.useState<DeploymentPlan | null>(null);
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
    void apiRequest<PersistenceMigrationPlan>("/api/persistence/migration-plan").then(setMigrationPlan).catch(() => undefined);
    void apiRequest<PersistenceSchemaPlan>("/api/persistence/schema-plan").then(setSchemaPlan).catch(() => undefined);
    void apiRequest<PersistenceImportDryRun>("/api/persistence/import-dry-run").then(setImportDryRun).catch(() => undefined);
    void apiRequest<PersistenceCutoverChecklist>("/api/persistence/cutover-checklist").then(setCutoverChecklist).catch(() => undefined);
    void apiRequest<LaunchReadiness>("/api/launch/readiness").then(setLaunchReadiness).catch(() => undefined);
    void apiRequest<DeploymentPlan>("/api/launch/deployment-plan").then(setDeploymentPlan).catch(() => undefined);
  }, []);

  function refreshPersistenceStatus() {
    void apiRequest<PersistenceStatus>("/api/persistence/status").then(setPersistenceStatus).catch(() => undefined);
  }

  function createPersistenceBackup() {
    void apiRequest<{ status: PersistenceStatus }>("/api/persistence/backup", {
      method: "POST",
      body: JSON.stringify({ label: "audit-desk" })
    }).then((result) => {
      setPersistenceStatus(result.status);
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
            {persistenceStatus?.note && <small>{persistenceStatus.note}</small>}
          </article>
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
  offlineQueue,
  onSync
}: {
  offlineMode: boolean;
  offlineQueue: OfflineAction[];
  onSync: () => void;
}) {
  return (
    <div className="panel span-6 module-side">
      <PanelHeader icon={Files} title="Offline Sync Queue" action={offlineMode ? "Offline active" : "Ready"} />
      <div className="sync-layout">
        <div className="sync-stage queued">
          <strong>Local Queue</strong>
          <span>{offlineQueue.length} actions cached</span>
        </div>
        <ChevronRight size={18} />
        <div className="sync-stage">
          <strong>Conflict Resolver</strong>
          <span>{offlineQueue.length > 0 ? "Priority order ready" : "No conflicts detected"}</span>
        </div>
        <ChevronRight size={18} />
        <div className="sync-stage synced">
          <strong>Cloud Event Bus</strong>
          <span>Redis + RabbitMQ</span>
        </div>
      </div>
      <div className="security-strip">
        <ShieldCheck size={18} />
        <span>RBAC, ABAC, zero-trust sessions, immutable audit ledger, transfer-triggered session invalidation.</span>
      </div>
      {offlineQueue.length > 0 && (
        <div className="queued-actions">
          {offlineQueue.slice(0, 4).map((item) => (
            <div className="event-line" key={item.id}>
              <span />
              <code>{item.event}: {item.object}</code>
            </div>
          ))}
        </div>
      )}
      <div className="action-row sync-actions">
        <button disabled={offlineQueue.length === 0} onClick={onSync}>
          <RefreshCw size={15} />
          Sync queued actions
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
      <button>
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
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
