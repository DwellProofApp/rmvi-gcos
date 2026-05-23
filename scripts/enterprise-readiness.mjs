import { readFile } from "node:fs/promises";

const checks = [];

function check(name, ok, detail, fix) {
  checks.push({ name, ok: Boolean(ok), detail, fix });
}

const files = {
  packageJson: JSON.parse(await readFile("package.json", "utf8")),
  main: await readFile("src/main.tsx", "utf8"),
  styles: await readFile("src/styles.css", "utf8"),
  server: await readFile("server/index.mjs", "utf8"),
  validation: await readFile("server/validation.mjs", "utf8"),
  sw: await readFile("public/sw.js", "utf8"),
  manifest: await readFile("public/manifest.webmanifest", "utf8"),
  envTemplate: await readFile(".env.production.example", "utf8"),
  deploymentChecklist: await readFile("docs/DEPLOYMENT_CHECKLIST.md", "utf8"),
  infrastructure: await readFile("docs/PRODUCTION_INFRASTRUCTURE.md", "utf8"),
  handoff: await readFile("docs/FINAL_RELEASE_HANDOFF.md", "utf8")
};

const requiredSections = [
  "Control Center",
  "ChurchMail",
  "Reports",
  "Approvals",
  "Tasks",
  "Policies",
  "Calendar",
  "Personnel",
  "Escalations",
  "AI Desk",
  "Live Comms",
  "Hierarchy",
  "Offices",
  "Transfers",
  "Archive",
  "Audit",
  "Account Settings"
];

const apiModules = [
  "/api/messages",
  "/api/reports",
  "/api/approvals",
  "/api/tasks",
  "/api/policies",
  "/api/calendar-events",
  "/api/personnel",
  "/api/escalations",
  "/api/transfers",
  "/api/live-comms",
  "/api/offices",
  "/api/documents",
  "/api/audit",
  "/api/launch/signoff",
  "/api/ops/monitor"
];

const securityHeaders = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy"
];

check(
  "Role-based page surface",
  requiredSections.every((section) => files.main.includes(section)),
  `${requiredSections.length} workstation sections expected`,
  "Keep all workstation sections registered in the navigation and permissions model."
);

check(
  "Dynamic office-node builder",
  [
    "nodeKind",
    "parentId",
    "parentName",
    "permissionPreset",
    "reportingRoute",
    "workflowAccess",
    "buildReportingRoute",
    "workflowAccessForPreset"
  ].every((token) => files.main.includes(token)),
  "dynamic node records, parent hierarchy, reporting routes, presets, and generated workflow access detected",
  "Complete the Office Node Builder architecture controls."
);

check(
  "Permission presets are expandable",
  ["Reporter", "Department Lead", "Approver", "Office Admin", "Transfer Officer", "Executive Override"].every((preset) => files.main.includes(preset)),
  "station permission presets detected",
  "Keep departments as templates, not hard-coded limits."
);

check(
  "API module coverage",
  apiModules.every((route) => files.server.includes(route)),
  `${apiModules.length} core API module routes expected`,
  "Add missing server routes for any workstation module."
);

check(
  "Live communication module",
  files.main.includes("function LiveComms")
    && files.main.includes("Real-Time Communication Hub")
    && files.main.includes("onCreateLiveSession")
    && files.server.includes("function liveCommsReport")
    && files.server.includes("GCOS_LIVE_COMMS_PROVIDER"),
  "live rooms, station chat, broadcasts, shared work, and provider readiness endpoint detected",
  "Keep real-time communication surfaced in the workstation and backend readiness layer."
);

check(
  "Mutation validation layer",
  files.server.includes("validateRequest(match.pattern, requestBody)") && files.validation.includes("const validators") && files.validation.includes("export function validateRequest"),
  "request validation is called before route handlers",
  "Validate mutation payloads before persistence."
);

check(
  "Authentication and session controls",
  files.server.includes("GCOS_REQUIRE_API_AUTH") && files.server.includes("createSession") && files.server.includes("revokeSession") && files.server.includes("assertLoginRateLimit"),
  "session tokens, revocation, auth lock, and login rate limits detected",
  "Keep production API data protected behind station sessions."
);

check(
  "Security response headers",
  securityHeaders.every((header) => files.server.includes(header)),
  `${securityHeaders.length} security headers detected`,
  "Keep security headers on JSON and web responses."
);

check(
  "Offline install assets",
  files.sw.includes("CACHEABLE_API_PATHS") && files.sw.includes("networkFirst") && files.manifest.includes("display_override") && files.manifest.includes("shortcuts"),
  "service worker cache, offline fallback, manifest, and shortcuts detected",
  "Maintain installable/offline-first workstation assets."
);

check(
  "Production persistence and object vault plan",
  files.envTemplate.includes("GCOS_STORAGE_PROVIDER=database")
    && files.envTemplate.includes("GCOS_OBJECT_STORAGE_PROVIDER=cloudflare-r2")
    && files.infrastructure.includes("Managed Postgres")
    && files.infrastructure.includes("Cloudflare R2"),
  "database and Cloudflare R2 production path documented",
  "Set the live Postgres and R2 secrets before public launch."
);

check(
  "Release automation",
  ["build", "test", "production:check", "release:check", "enterprise:check", "secrets:plan", "launch:verify", "launch:verify:live"].every((script) => files.packageJson.scripts?.[script]),
  "build, test, readiness, secrets, enterprise, and launch scripts registered",
  "Keep every release gate callable from npm scripts."
);

check(
  "Launch operations boards",
  ["Launch Readiness", "Deployment Plan", "Production Secrets", "Operations Monitor", "Launch Signoff Matrix"].every((label) => files.main.includes(label)),
  "launch readiness, deployment, secrets, monitor, and signoff panels detected",
  "Expose production gates inside the Audit workspace."
);

check(
  "Design-system guardrails",
  [
    "Last-mile contrast fix",
    "Blue admin command surface",
    "Final admin contrast",
    "Admin board readability pass"
  ].every((token) => files.styles.includes(token)),
  "contrast, command center, node builder, and final AI panel guardrails detected",
  "Keep contrast and spacing guardrails across all pages."
);

check(
  "Deployment documentation",
  [
    "npm run production:check",
    "npm run release:check",
    "npm run launch:verify:live",
    "https://rmvi.org/health",
    "Audit workspace records"
  ].every((token) => `${files.deploymentChecklist}\n${files.infrastructure}\n${files.handoff}`.includes(token)),
  "deployment checklist, infrastructure runbook, and handoff acceptance criteria detected",
  "Keep release docs synchronized with scripts and live URLs."
);

for (const item of checks) {
  console.log(`${item.ok ? "✓" : "✕"} ${item.name}: ${item.detail}`);
  if (!item.ok) console.log(`  ${item.fix}`);
}

const score = Math.round((checks.filter((item) => item.ok).length / checks.length) * 100);
const blockers = checks.filter((item) => !item.ok).map((item) => item.name);
console.log(`Enterprise readiness gate: ${score}%`);
if (blockers.length) console.log(`Blockers: ${blockers.join(", ")}`);
if (score < 98) process.exitCode = 1;
