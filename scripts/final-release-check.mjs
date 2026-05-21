import { readFile } from "node:fs/promises";

const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail });
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const main = await readFile("src/main.tsx", "utf8");
const server = await readFile("server/index.mjs", "utf8");
const domain = await readFile("server/domain.mjs", "utf8");
const readme = await readFile("README.md", "utf8");
const replitConfig = await readFile(".replit", "utf8");
const replitNix = await readFile("replit.nix", "utf8");
const productionEnv = await readFile(".env.production.example", "utf8");
const finalHandoff = await readFile("docs/FINAL_RELEASE_HANDOFF.md", "utf8");
const productionInfrastructure = await readFile("docs/PRODUCTION_INFRASTRUCTURE.md", "utf8");

const templateCount = (main.match(/id: "tpl-/g) ?? []).length;
const officialStations = [
  "admin@rmvi.org",
  "international@rmvi.org",
  "np@rmvi.org",
  "district_admin@rmvi.org",
  "local_branch_017@rmvi.org",
  "finance@rmvi.org",
  "audit@rmvi.org",
  "mission@rmvi.org"
];

check("Report template library", templateCount >= 48, `${templateCount} templates detected`);
check("Official station accounts", officialStations.every((email) => main.includes(email) && domain.includes(email)), `${officialStations.length} expected accounts`);
check("Report detail editing", server.includes("POST /api/reports/:id/details") && main.includes("saveSelectedReportDetails"), "editable detail workspace and API route");
check("Evidence uploads", server.includes("POST /api/reports/:id/file") && main.includes("onUploadReportEvidence"), "report file upload route and UI action");
check("Launch completion endpoint", server.includes("GET /api/project/completion") && server.includes("projectCompletionReport"), "project completion report API");
check("Enterprise completion tracks", server.includes("GET /api/enterprise/completion") && server.includes("enterpriseCompletionReport") && main.includes("Enterprise Completion 1-12"), "12-track enterprise completion board");
check("Rollout readiness tracks", server.includes("GET /api/rollout/readiness") && server.includes("rolloutReadinessReport") && main.includes("Rollout Readiness"), "deployment/data/users/policies/training/operations rollout board");
check("Production secrets workspace", server.includes("GET /api/production/secrets-plan") && main.includes("Production Secrets") && main.includes("/api/production/secrets-plan"), "production secrets API and Audit panel");
check("Release scripts", ["test", "build", "production:check", "healthcheck", "domain:check", "firebase:domain-check", "release:check", "secrets:plan", "database:smoke", "object:smoke", "runtime:smoke", "preaws:check", "internal:audit", "launch:verify", "launch:verify:live"].every((script) => packageJson.scripts?.[script]), "release scripts registered");
check("Deployment docs", readme.includes("Final release handoff") && readme.includes("docs/FINAL_RELEASE_HANDOFF.md"), "README points to final handoff");
check("Production infrastructure runbook", readme.includes("docs/PRODUCTION_INFRASTRUCTURE.md") && productionInfrastructure.includes("npm run launch:verify:live"), "production launch runbook linked and actionable");
check("Replit launcher", replitConfig.includes("npm run replit:run") && replitNix.includes("nodejs_22"), "Replit run command and Node runtime configured");
check("Production env template", [
  "NODE_ENV=production",
  "GCOS_DOMAIN=rmvi.org",
  "GCOS_DEPLOYMENT_TARGET=replit",
  "GCOS_STORAGE_PROVIDER=database",
  "GCOS_DATABASE_URL=",
  "GCOS_ALLOWED_ORIGIN=https://rmvi.org",
  "GCOS_ENABLE_DEV_RESET=0",
  "GCOS_REQUIRE_API_AUTH=1"
].every((entry) => productionEnv.includes(entry)), "required rmvi.org production variables documented");
check("Final handoff acceptance", [
  "npm run production:check",
  "npm run runtime:smoke",
  "npm run launch:verify:live",
  "https://rmvi.org/health",
  "https://rmvi.org/api/status",
  "Audit workspace records"
].every((entry) => finalHandoff.includes(entry)), "production acceptance criteria documented");

for (const item of checks) {
  console.log(`${item.ok ? "✓" : "✕"} ${item.name}: ${item.detail}`);
}

const score = Math.round((checks.filter((item) => item.ok).length / checks.length) * 100);
console.log(`Final release check: ${score}%`);
if (score < 100) process.exitCode = 1;
