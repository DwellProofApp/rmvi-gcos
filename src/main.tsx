import React from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Building2,
  CalendarDays,
  ClipboardCheck,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  CloudOff,
  Download,
  FileCheck2,
  FileClock,
  Files,
  GitBranch,
  Globe2,
  Inbox,
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
type StationCard = { email: string; title: string; level: StationLevel | string; authority: string; icon: React.ElementType };
type Message = { id: string; kind: MessageKind; subject: string; from: string; age: string; status: Status; files: string };
type Report = { id: string; name: string; owner: string; path: string; due: string; state: string; score: number };
type Approval = { id: string; request: string; route: string; limit: string; state: string; signatures: string };
type GovernanceTask = { id: string; title: string; owner: string; assignee: string; priority: "Low" | "Medium" | "High" | "Critical"; due: string; status: "Queued" | "In Progress" | "Blocked" | "Complete" };
type Policy = { id: string; title: string; category: string; owner: string; status: "Draft" | "Active" | "Review" | "Retired"; summary: string; acknowledgements: number };
type CalendarEvent = { id: string; title: string; category: string; owner: string; date: string; priority: "Low" | "Medium" | "High" | "Critical"; status: "Scheduled" | "At Risk" | "Complete" };
type PersonRecord = { id: string; name: string; role: string; currentStation: string; assignedStation: string; status: "Active" | "Transfer Pending" | "Assigned" | "Inactive" };
type Transfer = { id: string; person: string; from: string; to: string; step: string; risk: string };
type AuditRow = { id: string; event: string; actor: string; object: string; result: string; time: string };
type OfflineAction = AuditRow & { queuedAt: string };
type Session = { email: string; startedAt: string; token?: string; expiresAt?: string };
type Office = { id: string; name: string; email: string; level: StationLevel; department: string; supervisor: string; password: string; status: string };
type Escalation = { id: string; source: string; item: string; reason: string; severity: "Medium" | "High" | "Critical"; status: "Open" | "Upward" | "Resolved"; owner: string };
type AiDraft = { id: string; kind: "Executive Summary" | "Memo" | "Report Brief"; title: string; body: string; sourceCount: number; createdAt: string };
type DocumentRecord = { id: string; name: string; classification: string; source: string; owner: string; fileType: string; status: string; storageKey: string; retainedUntil: string; createdAt: string };
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
  limits: {
    maxBodyBytes: number;
    devResetEnabled: boolean;
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
    email: "np@rmi.org",
    title: "National Presidency Workstation",
    level: "National HQ",
    authority: "National directives, county oversight, executive summaries",
    icon: Landmark
  },
  {
    email: "district_admin@rmi.org",
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

const stationPasswords: Record<string, string> = {
  "international@gcos.org": "gcos-global",
  "np@rmi.org": "gcos-national",
  "district_admin@rmi.org": "gcos-district",
  "local_branch_017@gcos.org": "gcos-local"
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
    password: "gcos-riverbend",
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
  { id: "aud-001", event: "Login", actor: "np@rmi.org", object: "National Presidency Workstation", result: "Allowed", time: "08:11" },
  { id: "aud-002", event: "ApprovalGranted", actor: "district_admin@rmi.org", object: "Area vehicle repair release", result: "Logged", time: "08:14" },
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
      return JSON.parse(stored) as T;
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
  const [escalations, setEscalations] = usePersistentState("gcos.escalations", initialEscalations);
  const [aiDrafts, setAiDrafts] = usePersistentState("gcos.aiDrafts", initialAiDrafts);
  const [documents, setDocuments] = usePersistentState("gcos.documents", initialDocuments);
  const [auditRows, setAuditRows] = usePersistentState("gcos.auditRows", initialAuditRows);
  const [events, setEvents] = usePersistentState("gcos.events", initialEvents);
  const [offlineQueue, setOfflineQueue] = usePersistentState("gcos.offlineQueue", initialOfflineQueue);
  const [apiStatus, setApiStatus] = React.useState<ApiStatus | null>(null);
  const [apiStatusError, setApiStatusError] = React.useState("");
  const stationDirectory = React.useMemo<StationCard[]>(() => [
    ...stations,
    ...offices.map((office) => ({
      email: office.email,
      title: `${office.name} Workstation`,
      level: office.level,
      authority: `${office.department}, supervised by ${office.supervisor}`,
      icon: Building2
    }))
  ], [offices]);
  const StationIcon = activeStation.icon;
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
      const serverStation = data.stations.find((station) => station.email === activeStation.email);
      if (serverStation) {
        setActiveStation((current) => ({ ...current, title: serverStation.title, level: serverStation.level, authority: serverStation.authority }));
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
    const station = stations.find((item) => item.email === session.email);
    if (station) setActiveStation(station);
  }, [session]);

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
    const station = stations.find((item) => item.email === email);
    if (!station || stationPasswords[email] !== password) {
      return false;
    }

    const startedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSession({ email, startedAt });
    setActiveStation(station);
    setActiveSection("Control Center");
    setAuditRows((rows) => [
      {
        id: `aud-${Date.now()}`,
        event: "Login",
        actor: email,
        object: station.title,
        result: "Allowed",
        time: startedAt
      },
      ...rows
    ]);
    setEvents((items) => [`Login: ${email}`, ...items].slice(0, 8));
    void apiRequest<{ station: StationCard; token: string; expiresAt: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }).then((result) => {
      setSession({ email, startedAt, token: result.token, expiresAt: result.expiresAt });
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
    return <LoginScreen onLogin={handleLogin} />;
  }

  function acknowledgeMessage(id: string) {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    setMessages((items) => items.map((item) => item.id === id ? { ...item, status: "Approved" } : item));
    recordAudit("EmailAcknowledged", message.subject, "Communication logged");
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

  function executeTransfer(id: string) {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    setTransfers((items) => items.map((item) => item.id === id ? {
      ...item,
      step: "New station login ready",
      risk: "Previous permissions revoked"
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
            const Icon = station.icon;
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
            onSync={syncOfflineQueue}
          />
        )}
        {activeSection === "ChurchMail" && (
          <ChurchMail
            messages={messages}
            events={events}
            station={activeStation}
            offlineMode={offlineMode}
            onAcknowledge={acknowledgeMessage}
            onCreateReport={createReportFromMessage}
            onRequestApproval={requestApprovalFromMessage}
            onArchiveAttachments={archiveMessageAttachments}
            onSendMessage={sendChurchMail}
          />
        )}
        {activeSection === "Reports" && (
          <Reports
            reports={reports}
            station={activeStation}
            onCreateReport={createReportDraft}
            onSubmitReport={submitReport}
            onEscalateReport={triggerEscalation}
            onArchiveEvidence={archiveReportEvidence}
          />
        )}
        {activeSection === "Approvals" && (
          <Approvals
            approvals={approvals}
            station={activeStation}
            permissions={permissions}
            onCreateApproval={createApprovalRequest}
            onApprove={approveRequest}
            onEscalateApproval={triggerEscalation}
          />
        )}
        {activeSection === "Tasks" && (
          <Tasks
            tasks={tasks}
            station={activeStation}
            offlineMode={offlineMode}
            onCreateTask={createTask}
            onAdvanceTask={advanceTask}
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
          />
        )}
        {activeSection === "Calendar" && (
          <GovernanceCalendar
            calendarEvents={calendarEvents}
            station={activeStation}
            offlineMode={offlineMode}
            onCreateCalendarEvent={createCalendarEvent}
            onCompleteCalendarEvent={completeCalendarEvent}
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
            onCreateTransfer={createTransferRequest}
          />
        )}
        {activeSection === "Escalations" && (
          <Escalations
            escalations={escalations}
            permissions={permissions}
            events={events}
            onCreateEscalation={triggerEscalation}
            onEscalateUpward={escalateUpward}
            onResolveEscalation={resolveEscalation}
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
          />
        )}
        {activeSection === "Hierarchy" && <Hierarchy stationDirectory={stationDirectory} offices={offices} />}
        {activeSection === "Offices" && <Offices offices={offices} permissions={permissions} onCreateOffice={createOffice} />}
        {activeSection === "Transfers" && (
          <Transfers
            transfers={transfers}
            permissions={permissions}
            offlineQueue={offlineQueue}
            onSync={syncOfflineQueue}
            onCreateTransfer={createTransferRequest}
            onExecuteTransfer={executeTransfer}
          />
        )}
        {activeSection === "Archive" && <Archive documents={documents} station={activeStation} offlineMode={offlineMode} onArchiveDocument={archiveDocument} />}
        {activeSection === "Audit" && <Audit auditRows={auditRows} />}
      </section>
    </main>
  );
}

function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => boolean }) {
  const [email, setEmail] = React.useState(stations[1].email);
  const [password, setPassword] = React.useState(stationPasswords[stations[1].email]);
  const [error, setError] = React.useState("");
  const selectedStation = stations.find((station) => station.email === email) ?? stations[1];
  const StationIcon = selectedStation.icon;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = onLogin(email, password);
    setError(ok ? "" : "Station credentials were not accepted.");
  }

  function chooseStation(nextEmail: string) {
    setEmail(nextEmail);
    setPassword(stationPasswords[nextEmail]);
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
              {stations.map((station) => (
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
          {stations.map((station) => (
            <button key={station.email} onClick={() => chooseStation(station.email)}>
              <strong>{station.email}</strong>
              <span>{stationPasswords[station.email]}</span>
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
  onSync
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
  onSync: () => void;
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
  onCreateReport,
  onRequestApproval,
  onArchiveAttachments,
  onSendMessage
}: {
  messages: Message[];
  events: string[];
  station: StationCard;
  offlineMode: boolean;
  onAcknowledge: (id: string) => void;
  onCreateReport: (id: string) => void;
  onRequestApproval: (id: string) => void;
  onArchiveAttachments: (id: string) => void;
  onSendMessage: (message: Pick<Message, "kind" | "subject" | "files"> & { to: string }) => void;
}) {
  const [selectedId, setSelectedId] = React.useState(messages[0]?.id ?? "");
  const [composeKind, setComposeKind] = React.useState<MessageKind>("Directive");
  const [composeTo, setComposeTo] = React.useState("District Offices");
  const [composeSubject, setComposeSubject] = React.useState("Administrative follow-up memo");
  const [composeFiles, setComposeFiles] = React.useState("Memo PDF");
  const [composeFeedback, setComposeFeedback] = React.useState("");
  const selected = messages.find((message) => message.id === selectedId) ?? messages[0];

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
        <div className="mail-layout">
          <div className="message-list">
            {messages.map((message) => (
              <button
                className={message.id === selected?.id ? "message-button selected" : "message-button"}
                key={message.id}
                aria-label={message.subject}
                onClick={() => setSelectedId(message.id)}
              >
                <MessageCard message={message} />
              </button>
            ))}
          </div>
          {selected && (
            <div className="mail-preview">
              <div className={`kind ${selected.kind.toLowerCase()}`}>{selected.kind}</div>
              <h2>{selected.subject}</h2>
              <p>{selected.from} sent an official {selected.kind.toLowerCase()} with attached governance records: {selected.files}.</p>
              <div className="route-box">
                <strong>Routing chain</strong>
                <span>{"Origin station -> Current station -> Supervising authority -> Archive vault"}</span>
              </div>
              <div className="action-row">
                <button onClick={() => onAcknowledge(selected.id)}><Send size={15} /> Acknowledge</button>
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
  onEscalateReport,
  onArchiveEvidence
}: {
  reports: Report[];
  station: StationCard;
  onCreateReport: (report: Omit<Report, "id" | "state" | "score">) => void;
  onSubmitReport: (id: string) => void;
  onEscalateReport: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
  onArchiveEvidence: (id: string) => void;
}) {
  const [name, setName] = React.useState("Monthly branch administration report");
  const [owner, setOwner] = React.useState(String(station.level));
  const [path, setPath] = React.useState(`${station.level} -> Supervising Office`);
  const [due, setDue] = React.useState("Draft");
  const [feedback, setFeedback] = React.useState("");

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
        <PanelHeader icon={FileCheck2} title="Hierarchical Reporting Center" action="Upward flow" />
        <div className="data-table">
          <div className="table-row table-head">
            <span>Report</span><span>Owner</span><span>Route</span><span>Due</span><span>Status</span>
          </div>
          {reports.map((report) => (
            <div className="table-row" key={report.name}>
              <strong>{report.name}</strong>
              <span>{report.owner}</span>
              <span>{report.path}</span>
              <span>{report.due}</span>
              <div className="table-actions">
                <StatusPill status={report.state} />
                <button aria-label={`Submit ${report.name}`} onClick={() => onSubmitReport(report.id)}><Send size={14} /> Submit</button>
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
  onEscalateApproval
}: {
  approvals: Approval[];
  station: StationCard;
  permissions: Permissions;
  onCreateApproval: (draft: Omit<Approval, "id" | "state" | "signatures">) => void;
  onApprove: (id: string) => void;
  onEscalateApproval: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
}) {
  const [request, setRequest] = React.useState("Mission outreach budget release");
  const [route, setRoute] = React.useState(`${station.level} -> Delegated Authority`);
  const [limit, setLimit] = React.useState("$5,000");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setRoute(`${station.level} -> Delegated Authority`);
  }, [station.level]);

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
        <div className="approval-board">
          {approvals.map((approval) => (
            <article className="approval-lane" key={approval.request}>
              <StatusPill status={approval.state} />
              <h2>{approval.request}</h2>
              <span>{approval.route}</span>
              <div className="approval-meta">
                <small>{approval.limit}</small>
                <small>{approval.signatures} signatures</small>
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
  onEscalateTask
}: {
  tasks: GovernanceTask[];
  station: StationCard;
  offlineMode: boolean;
  onCreateTask: (task: Omit<GovernanceTask, "id" | "status">) => void;
  onAdvanceTask: (id: string, status: GovernanceTask["status"]) => void;
  onEscalateTask: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
}) {
  const [title, setTitle] = React.useState("Follow up on branch reporting corrections");
  const [owner, setOwner] = React.useState(String(station.level));
  const [assignee, setAssignee] = React.useState(station.email);
  const [priority, setPriority] = React.useState<GovernanceTask["priority"]>("High");
  const [due, setDue] = React.useState("Today");
  const [statusFilter, setStatusFilter] = React.useState<GovernanceTask["status"] | "All statuses">("All statuses");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setOwner(String(station.level));
    setAssignee(station.email);
  }, [station.email, station.level]);

  const visibleTasks = React.useMemo(() => (
    statusFilter === "All statuses" ? tasks : tasks.filter((task) => task.status === statusFilter)
  ), [statusFilter, tasks]);
  const blockedCount = tasks.filter((task) => task.status === "Blocked").length;
  const completeCount = tasks.filter((task) => task.status === "Complete").length;
  const completionRate = tasks.length ? Math.round((completeCount / tasks.length) * 100) : 100;

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
          <Insight label="Blocked" value={String(blockedCount)} />
          <Insight label="Offline queued" value={offlineMode ? "Active" : "Ready"} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as GovernanceTask["status"] | "All statuses")}>
              {["All statuses", "Queued", "In Progress", "Blocked", "Complete"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
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
              <div className="action-row">
                <button onClick={() => onAdvanceTask(task.id, "In Progress")}><TimerReset size={15} /> Start</button>
                <button onClick={() => onAdvanceTask(task.id, "Complete")}><CheckCircle2 size={15} /> Complete</button>
                <button onClick={() => onEscalateTask("Task", task.title, `${task.due} task is ${task.status.toLowerCase()}`, task.owner, task.priority === "Critical" ? "Critical" : "High")}>
                  <AlertTriangle size={15} /> Escalate
                </button>
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
  onAcknowledgePolicy
}: {
  policies: Policy[];
  station: StationCard;
  permissions: Permissions;
  offlineMode: boolean;
  onCreatePolicy: (policy: Omit<Policy, "id" | "acknowledgements">) => void;
  onAcknowledgePolicy: (id: string) => void;
}) {
  const [title, setTitle] = React.useState("Branch reporting compliance policy");
  const [category, setCategory] = React.useState("Reports");
  const [owner, setOwner] = React.useState(String(station.level));
  const [status, setStatus] = React.useState<Policy["status"]>("Draft");
  const [summary, setSummary] = React.useState("Local branch reports must include evidence packets before upward submission.");
  const [categoryFilter, setCategoryFilter] = React.useState("All categories");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setOwner(String(station.level));
  }, [station.level]);

  const categoryOptions = React.useMemo(() => ["All categories", ...Array.from(new Set(policies.map((policy) => policy.category))).sort()], [policies]);
  const visiblePolicies = React.useMemo(() => (
    categoryFilter === "All categories" ? policies : policies.filter((policy) => policy.category === categoryFilter)
  ), [categoryFilter, policies]);
  const activeCount = policies.filter((policy) => policy.status === "Active").length;
  const acknowledgementTotal = policies.reduce((total, policy) => total + policy.acknowledgements, 0);

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
          <Insight label="Active policies" value={String(activeCount)} />
          <Insight label="Acknowledgements" value={String(acknowledgementTotal)} />
          <Insight label="Authority" value={permissions.canApprove ? "Publisher" : "Reader"} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
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
              </div>
              <div className="action-row">
                <button onClick={() => onAcknowledgePolicy(policy.id)}><CheckCircle2 size={15} /> Acknowledge</button>
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
  onEscalateCalendarEvent
}: {
  calendarEvents: CalendarEvent[];
  station: StationCard;
  offlineMode: boolean;
  onCreateCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  onCompleteCalendarEvent: (id: string) => void;
  onEscalateCalendarEvent: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
}) {
  const [title, setTitle] = React.useState("Monthly compliance review");
  const [category, setCategory] = React.useState("Review");
  const [owner, setOwner] = React.useState(String(station.level));
  const [date, setDate] = React.useState("2026-05-24");
  const [priority, setPriority] = React.useState<CalendarEvent["priority"]>("High");
  const [status, setStatus] = React.useState<CalendarEvent["status"]>("Scheduled");
  const [categoryFilter, setCategoryFilter] = React.useState("All categories");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setOwner(String(station.level));
  }, [station.level]);

  const categoryOptions = React.useMemo(() => ["All categories", ...Array.from(new Set(calendarEvents.map((event) => event.category))).sort()], [calendarEvents]);
  const visibleEvents = React.useMemo(() => (
    categoryFilter === "All categories" ? calendarEvents : calendarEvents.filter((event) => event.category === categoryFilter)
  ), [categoryFilter, calendarEvents]);
  const atRiskCount = calendarEvents.filter((event) => event.status === "At Risk").length;
  const scheduledCount = calendarEvents.filter((event) => event.status === "Scheduled").length;
  const completeCount = calendarEvents.filter((event) => event.status === "Complete").length;

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
          <Insight label="Scheduled" value={String(scheduledCount)} />
          <Insight label="At risk" value={String(atRiskCount)} />
          <Insight label="Complete" value={String(completeCount)} />
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
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
              <div className="action-row">
                <button onClick={() => onCompleteCalendarEvent(event.id)}><CheckCircle2 size={15} /> Complete</button>
                <button onClick={() => onEscalateCalendarEvent("Calendar", event.title, `${event.date} calendar item is ${event.status.toLowerCase()}`, event.owner, event.priority === "Critical" ? "Critical" : "High")}>
                  <AlertTriangle size={15} /> Escalate
                </button>
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
  onCreateTransfer
}: {
  personnel: PersonRecord[];
  station: StationCard;
  permissions: Permissions;
  offlineMode: boolean;
  onCreatePerson: (person: Omit<PersonRecord, "id">) => void;
  onUpdatePersonStatus: (id: string, status: PersonRecord["status"]) => void;
  onCreateTransfer: (transfer: Omit<Transfer, "id" | "step" | "risk">) => void;
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
    statusFilter === "All statuses" ? personnel : personnel.filter((person) => person.status === statusFilter)
  ), [personnel, statusFilter]);
  const activeCount = personnel.filter((person) => person.status === "Active").length;
  const transferPendingCount = personnel.filter((person) => person.status === "Transfer Pending").length;
  const assignedCount = personnel.filter((person) => person.status === "Assigned").length;

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
        </div>
        <div className="archive-toolbar">
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PersonRecord["status"] | "All statuses")}>
              {["All statuses", "Active", "Transfer Pending", "Assigned", "Inactive"].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
        <div className="personnel-list">
          {visiblePersonnel.map((person) => (
            <article className="personnel-card" key={person.id}>
              <div className="task-head">
                <StatusPill status={person.status} />
                <span>{person.role}</span>
              </div>
              <h2>{person.name}</h2>
              <p>{person.currentStation} to {person.assignedStation}</p>
              <div className="action-row">
                <button onClick={() => onUpdatePersonStatus(person.id, "Assigned")}><CheckCircle2 size={15} /> Mark assigned</button>
                <button disabled={!permissions.canExecuteTransfers} onClick={() => createTransfer(person)}><Signature size={15} /> Create transfer</button>
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
              {["Active", "Transfer Pending", "Assigned", "Inactive"].map((option) => <option key={option} value={option}>{option}</option>)}
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
  permissions,
  events,
  onCreateEscalation,
  onEscalateUpward,
  onResolveEscalation
}: {
  escalations: Escalation[];
  permissions: Permissions;
  events: string[];
  onCreateEscalation: (source: Escalation["source"], item: string, reason: string, owner: string, severity?: Escalation["severity"]) => void;
  onEscalateUpward: (id: string) => void;
  onResolveEscalation: (id: string) => void;
}) {
  const openCount = escalations.filter((item) => item.status !== "Resolved").length;
  const [source, setSource] = React.useState<Escalation["source"]>("Report");
  const [item, setItem] = React.useState("Urgent governance review");
  const [reason, setReason] = React.useState("Deadline risk requires supervisory attention");
  const [owner, setOwner] = React.useState("Workflow Engine");
  const [severity, setSeverity] = React.useState<Escalation["severity"]>("High");
  const [feedback, setFeedback] = React.useState("");

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
        <div className="escalation-list">
          {escalations.map((escalation) => (
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
                <span>{escalation.owner}</span>
              </div>
              <div className="action-row">
                <button
                  aria-label={`Route ${escalation.item}: ${escalation.reason} upward`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved"}
                  onClick={() => onEscalateUpward(escalation.id)}
                >
                  <ArrowUpFromLine size={15} /> Route upward
                </button>
                <button
                  aria-label={`Resolve ${escalation.item}: ${escalation.reason}`}
                  disabled={!permissions.canApprove || escalation.status === "Resolved"}
                  onClick={() => onResolveEscalation(escalation.id)}
                >
                  <CheckCircle2 size={15} /> Resolve
                </button>
              </div>
            </article>
          ))}
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
  escalations,
  messages,
  onGenerateDraft
}: {
  drafts: AiDraft[];
  reports: Report[];
  approvals: Approval[];
  tasks: GovernanceTask[];
  policies: Policy[];
  calendarEvents: CalendarEvent[];
  escalations: Escalation[];
  messages: Message[];
  onGenerateDraft: (kind: AiDraft["kind"], focus: string) => void;
}) {
  const [kind, setKind] = React.useState<AiDraft["kind"]>("Executive Summary");
  const [focus, setFocus] = React.useState("National operations and escalation review");
  const openEscalations = escalations.filter((item) => item.status !== "Resolved").length;
  const pendingApprovals = approvals.filter((item) => item.state !== "Approved").length;
  const activeReports = reports.filter((item) => item.state !== "Approved").length;
  const activeTasks = tasks.filter((item) => item.status !== "Complete").length;
  const upcomingEvents = calendarEvents.filter((item) => item.status !== "Complete").length;
  const activePersonnel = personnel.filter((item) => item.status !== "Inactive").length;
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
              <pre>{draft.body}</pre>
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
  offices
}: {
  stationDirectory: StationCard[];
  offices: Office[];
}) {
  const levelCounts = React.useMemo(() => hierarchy.reduce<Record<string, number>>((counts, node) => {
    counts[node.level] = stationDirectory.filter((station) => station.level === node.level).length;
    return counts;
  }, {}), [stationDirectory]);
  const supervisorCount = new Set(offices.map((office) => office.supervisor)).size;
  const dynamicLevels = hierarchy.filter((node) => (levelCounts[node.level] ?? 0) > 0).length;

  return (
    <section className="module-grid">
      <div className="panel module-primary">
        <PanelHeader icon={GitBranch} title="Organizational Hierarchy Graph" action={`${stationDirectory.length} stations`} />
        <div className="office-summary-grid">
          <Insight label="Active stations" value={String(stationDirectory.length)} />
          <Insight label="Active levels" value={`${dynamicLevels}/7`} />
          <Insight label="Supervisors" value={String(supervisorCount)} />
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
      </div>
    </section>
  );
}

function Offices({
  offices,
  permissions,
  onCreateOffice
}: {
  offices: Office[];
  permissions: Permissions;
  onCreateOffice: (office: Omit<Office, "id" | "password" | "status">) => boolean;
}) {
  const [name, setName] = React.useState("New Hope District Office");
  const [email, setEmail] = React.useState("newhope_district@gcos.org");
  const [level, setLevel] = React.useState<StationLevel>("District HQ");
  const [department, setDepartment] = React.useState("District Command");
  const [supervisor, setSupervisor] = React.useState("County/State Headquarters");
  const [levelFilter, setLevelFilter] = React.useState<StationLevel | "All levels">("All levels");
  const [feedback, setFeedback] = React.useState("");
  const filteredOffices = React.useMemo(() => (
    levelFilter === "All levels" ? offices : offices.filter((office) => office.level === levelFilter)
  ), [levelFilter, offices]);
  const provisionedCount = offices.filter((office) => office.status === "Provisioned").length;
  const supervisorCount = new Set(offices.map((office) => office.supervisor)).size;

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
          <Insight label="Supervisors" value={String(supervisorCount)} />
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
        </div>
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
              <StatusPill status={office.status} />
            </div>
          ))}
          {filteredOffices.length === 0 && <div className="empty-state">No offices match the current hierarchy filter.</div>}
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
  onExecuteTransfer
}: {
  transfers: Transfer[];
  permissions: Permissions;
  offlineQueue: OfflineAction[];
  onSync: () => void;
  onCreateTransfer: (draft: Omit<Transfer, "id" | "step" | "risk">) => void;
  onExecuteTransfer: (id: string) => void;
}) {
  const [person, setPerson] = React.useState("Rev. Grace Walker");
  const [from, setFrom] = React.useState("County Mission Office");
  const [to, setTo] = React.useState("Riverbend Area Office");
  const [feedback, setFeedback] = React.useState("");

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
        <PanelHeader icon={Signature} title="Transfer Identity Migration" action="Mission office" />
        {!permissions.canExecuteTransfers && (
          <div className="permission-warning">
            <LockKeyhole size={16} />
            <span>This station can view transfers, but cannot execute identity migration.</span>
          </div>
        )}
        <div className="transfer-list">
          {transfers.map((transfer) => (
            <article className="transfer-card" key={transfer.person}>
              <h2>{transfer.person}</h2>
              <div className="route-box">
                <strong>{transfer.from}</strong>
                <ChevronRight size={16} />
                <strong>{transfer.to}</strong>
              </div>
              <span>{transfer.step}</span>
              <p>{transfer.risk}</p>
              <div className="action-row">
                <button
                  aria-label={`Execute transfer for ${transfer.person}`}
                  disabled={!permissions.canExecuteTransfers}
                  onClick={() => onExecuteTransfer(transfer.id)}
                >
                  <RefreshCw size={15} /> Execute switch
                </button>
              </div>
            </article>
          ))}
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
  onArchiveDocument
}: {
  documents: DocumentRecord[];
  station: StationCard;
  offlineMode: boolean;
  onArchiveDocument: (record: Omit<DocumentRecord, "id" | "storageKey" | "retainedUntil" | "createdAt">) => void;
}) {
  const [name, setName] = React.useState("Signed mission authorization.pdf");
  const [classification, setClassification] = React.useState("Signed document");
  const [source, setSource] = React.useState("ChurchMail");
  const [fileType, setFileType] = React.useState("PDF");
  const [sourceFilter, setSourceFilter] = React.useState("All sources");
  const [statusFilter, setStatusFilter] = React.useState("All statuses");
  const [feedback, setFeedback] = React.useState("");
  const sourceOptions = React.useMemo(() => ["All sources", ...Array.from(new Set(documents.map((document) => document.source))).sort()], [documents]);
  const statusOptions = React.useMemo(() => ["All statuses", ...Array.from(new Set(documents.map((document) => document.status))).sort()], [documents]);
  const visibleDocuments = React.useMemo(() => documents.filter((document) => {
    const sourceMatches = sourceFilter === "All sources" || document.source === sourceFilter;
    const statusMatches = statusFilter === "All statuses" || document.status === statusFilter;
    return sourceMatches && statusMatches;
  }), [documents, sourceFilter, statusFilter]);
  const archivedCount = documents.filter((document) => document.status === "Archived").length;
  const inReviewCount = documents.filter((document) => document.status === "In Review").length;
  const fileTypeCount = new Set(documents.map((document) => document.fileType)).size;

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
        </div>
        <div className="data-table document-table">
          <div className="table-row table-head">
            <span>Document</span><span>Class</span><span>Source</span><span>Owner</span><span>Status</span>
          </div>
          {visibleDocuments.map((document) => (
            <div className="table-row" key={document.id}>
              <strong>{document.name}</strong>
              <span>{document.classification}</span>
              <span>{document.source}</span>
              <span>{document.owner}</span>
              <StatusPill status={document.status} />
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

function Audit({ auditRows }: { auditRows: AuditRow[] }) {
  const [query, setQuery] = React.useState("");
  const [eventFilter, setEventFilter] = React.useState("All events");
  const eventTypes = React.useMemo(() => ["All events", ...Array.from(new Set(auditRows.map((row) => row.event))).sort()], [auditRows]);
  const visibleRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return auditRows.filter((row) => {
      const eventMatches = eventFilter === "All events" || row.event === eventFilter;
      const queryMatches = !normalizedQuery || [row.event, row.actor, row.object, row.result, row.time].join(" ").toLowerCase().includes(normalizedQuery);
      return eventMatches && queryMatches;
    });
  }, [auditRows, eventFilter, query]);

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
          <button onClick={exportAuditPacket}><Download size={15} /> Export CSV</button>
        </div>
        <div className="data-table audit-table">
          <div className="table-row table-head">
            <span>Event</span><span>Actor</span><span>Object</span><span>Result</span><span>Time</span>
          </div>
          {visibleRows.map((row) => (
            <div className="table-row" key={row.id}>
              <strong>{row.event}</strong>
              <span>{row.actor}</span>
              <span>{row.object}</span>
              <span>{row.result}</span>
              <span>{row.time}</span>
            </div>
          ))}
          {visibleRows.length === 0 && <div className="empty-state">No audit records match the current filters.</div>}
        </div>
      </div>
      <div className="panel module-side">
        <PanelHeader icon={LockKeyhole} title="Security Controls" action="Active" />
        {["RBAC", "ABAC", "Station permissions", "Session invalidation", "End-to-end encryption", "Immutable logging"].map((control) => (
          <div className="control-row" key={control}>
            <CheckCircle2 size={16} />
            <span>{control}</span>
          </div>
        ))}
      </div>
    </section>
  );
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
