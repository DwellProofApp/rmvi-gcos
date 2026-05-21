import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const main = await readFile(join(ROOT, "src", "main.tsx"), "utf8");
const css = await readFile(join(ROOT, "src", "styles.css"), "utf8");
const server = await readFile(join(ROOT, "server", "index.mjs"), "utf8");
const packageJson = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const productionDocs = await readFile(join(ROOT, "docs", "PRODUCTION_INFRASTRUCTURE.md"), "utf8");

const pages = [
  ["Control Center", "CommandDeck", ["station-home", "section-banner", "metric-grid"]],
  ["Admin Board", "AdminBoard", ["admin-portal-shell", "admin-console-panel", "admin-station-list"]],
  ["ChurchMail", "ChurchMail", ["mail-layout", "message-button", "mail-preview"]],
  ["Reports", "Reports", ["reports-app", "reports-layout", "report-command-grid"]],
  ["Approvals", "Approvals", ["module-grid", "approval-list", "action-row"]],
  ["Tasks", "Tasks", ["module-grid", "workflow-list", "action-row"]],
  ["Policies", "Policies", ["module-grid", "policy", "action-row"]],
  ["Calendar", "GovernanceCalendar", ["module-grid", "calendar", "action-row"]],
  ["Personnel", "PersonnelDirectory", ["module-grid", "personnel", "action-row"]],
  ["Escalations", "Escalations", ["module-grid", "escalation", "action-row"]],
  ["AI Desk", "AiDesk", ["module-grid", "ai-desk", "action-row"]],
  ["Live Comms", "LiveComms", ["live-comms-workspace", "module-grid", "action-row"]],
  ["Hierarchy", "Hierarchy", ["module-grid", "hierarchy", "action-row"]],
  ["Offices", "Offices", ["module-grid", "office", "action-row"]],
  ["Transfers", "Transfers", ["module-grid", "transfer", "action-row"]],
  ["Archive", "Archive", ["module-grid", "archive", "action-row"]],
  ["Audit", "Audit", ["module-grid", "audit", "action-row"]],
  ["Account Settings", "AccountSettings", ["account-settings-page", "account-card", "account-user-list"]]
];

const pageResults = pages.map(([section, component, styleMarkers]) => {
  const checks = [
    { name: "nav-item", ok: main.includes(`label: "${section}"`) },
    { name: "section-profile", ok: main.includes(section.includes(" ") ? `"${section}":` : `${section}:`) },
    { name: "render-branch", ok: main.includes(`effectiveSection === "${section}"`) },
    { name: "component", ok: main.includes(`function ${component}`) || component === "CommandDeck" && main.includes("function CommandDeck") },
    { name: "style-markers", ok: styleMarkers.some((marker) => css.includes(marker)), detail: styleMarkers.join(", ") }
  ];
  return {
    section,
    component,
    score: score(checks),
    status: checks.every((check) => check.ok) ? "ready" : "needs-review",
    checks
  };
});

const infrastructureChecks = [
  { name: "dynamic-office-node-model", ok: main.includes("OrgNodeKind") && main.includes("parentId") && main.includes("permissionPreset") },
  { name: "offline-web-shell", ok: main.includes("serviceWorker") || css.includes("offline") },
  { name: "database-cutover", ok: server.includes("/api/persistence/migration-plan") && packageJson.scripts?.["database:smoke"] },
  { name: "object-storage", ok: server.includes("/api/files/object-smoke") && packageJson.scripts?.["object:smoke"] },
  { name: "runtime-smoke", ok: packageJson.scripts?.["runtime:smoke"] && productionDocs.includes("authenticated runtime smoke") }
];

const securityChecks = [
  { name: "session-auth", ok: server.includes("authenticateRequest") && server.includes("readBearerToken") },
  { name: "rate-limits", ok: server.includes("LOGIN_RATE_LIMIT") && server.includes("MUTATION_RATE_LIMIT") },
  { name: "security-headers", ok: ["content-security-policy", "strict-transport-security", "cross-origin-opener-policy", "cross-origin-resource-policy"].every((item) => server.includes(item)) },
  { name: "production-reset-lock", ok: server.includes("DEV_RESET_ENABLED") && server.includes("Development reset is disabled") },
  { name: "protected-bootstrap", ok: server.includes("/api/bootstrap/public") && server.includes('pathname === "/api/bootstrap/public"') }
];

const deploymentChecks = [
  { name: "production-check", ok: Boolean(packageJson.scripts?.["production:check"]) },
  { name: "preaws-check", ok: Boolean(packageJson.scripts?.["preaws:check"]) },
  { name: "release-check", ok: Boolean(packageJson.scripts?.["release:check"]) },
  { name: "launch-verify", ok: Boolean(packageJson.scripts?.["launch:verify"]) && Boolean(packageJson.scripts?.["launch:verify:live"]) },
  { name: "runbook", ok: productionDocs.includes("Verification Commands") && productionDocs.includes("Launch Hold Conditions") }
];

const report = {
  generatedAt: new Date().toISOString(),
  project: "Remedy Movement International GCOS",
  status: pageResults.every((page) => page.status === "ready")
    && infrastructureChecks.every((check) => check.ok)
    && securityChecks.every((check) => check.ok)
    && deploymentChecks.every((check) => check.ok)
    ? "pre-aws-ready"
    : "pre-aws-review",
  pageScore: score(pageResults.map((page) => ({ ok: page.status === "ready" }))),
  infrastructureScore: score(infrastructureChecks),
  securityScore: score(securityChecks),
  deploymentScore: score(deploymentChecks),
  pages: pageResults,
  infrastructureChecks,
  securityChecks,
  deploymentChecks,
  nextActions: [
    ...pageResults.filter((page) => page.status !== "ready").map((page) => `Review ${page.section} UI coverage.`),
    ...infrastructureChecks.filter((check) => !check.ok).map((check) => `Complete infrastructure gate: ${check.name}.`),
    ...securityChecks.filter((check) => !check.ok).map((check) => `Complete security gate: ${check.name}.`),
    ...deploymentChecks.filter((check) => !check.ok).map((check) => `Complete deployment gate: ${check.name}.`)
  ].slice(0, 10)
};

await mkdir(REPORT_DIR, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-");
const jsonPath = join(REPORT_DIR, `internal-page-audit-${stamp}.json`);
const mdPath = join(REPORT_DIR, `internal-page-audit-${stamp}.md`);
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, markdownReport(report));

console.log(`Internal page audit: ${report.status}`);
console.log(`Pages: ${report.pageScore}%`);
console.log(`Infrastructure: ${report.infrastructureScore}%`);
console.log(`Security: ${report.securityScore}%`);
console.log(`Deployment: ${report.deploymentScore}%`);
console.log(`Audit report: ${jsonPath}`);
console.log(`Audit summary: ${mdPath}`);

if (report.status !== "pre-aws-ready") process.exitCode = 1;

function score(items) {
  return Math.round((items.filter((item) => item.ok).length / items.length) * 100);
}

function markdownReport(audit) {
  return `# RMVI GCOS Pre-AWS Internal Page Audit

Generated: ${audit.generatedAt}

Status: **${audit.status}**

| Area | Score |
| --- | ---: |
| Pages | ${audit.pageScore}% |
| Infrastructure | ${audit.infrastructureScore}% |
| Security | ${audit.securityScore}% |
| Deployment | ${audit.deploymentScore}% |

## Page Coverage

${audit.pages.map((page) => `- ${page.status === "ready" ? "[x]" : "[ ]"} ${page.section}: ${page.score}% (${page.component})`).join("\n")}

## Infrastructure

${audit.infrastructureChecks.map((check) => `- ${check.ok ? "[x]" : "[ ]"} ${check.name}`).join("\n")}

## Security

${audit.securityChecks.map((check) => `- ${check.ok ? "[x]" : "[ ]"} ${check.name}`).join("\n")}

## Deployment Verification

${audit.deploymentChecks.map((check) => `- ${check.ok ? "[x]" : "[ ]"} ${check.name}`).join("\n")}

## Next Actions

${audit.nextActions.length ? audit.nextActions.map((action) => `- ${action}`).join("\n") : "- Ready for AWS planning after live infrastructure secrets are available."}
`;
}
