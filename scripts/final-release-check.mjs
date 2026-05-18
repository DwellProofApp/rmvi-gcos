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

const templateCount = (main.match(/id: "tpl-/g) ?? []).length;
const officialStations = [
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
check("Release scripts", ["test", "build", "production:check", "healthcheck", "domain:check", "release:check"].every((script) => packageJson.scripts?.[script]), "release scripts registered");
check("Deployment docs", readme.includes("Final release handoff") && readme.includes("docs/FINAL_RELEASE_HANDOFF.md"), "README points to final handoff");

for (const item of checks) {
  console.log(`${item.ok ? "✓" : "✕"} ${item.name}: ${item.detail}`);
}

const score = Math.round((checks.filter((item) => item.ok).length / checks.length) * 100);
console.log(`Final release check: ${score}%`);
if (score < 100) process.exitCode = 1;
