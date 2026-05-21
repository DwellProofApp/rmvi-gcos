import { readFile } from "node:fs/promises";

const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail });
}

const css = await readFile("src/styles.css", "utf8");
const server = await readFile("server/index.mjs", "utf8");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const readme = await readFile("README.md", "utf8");
const productionDocs = await readFile("docs/PRODUCTION_INFRASTRUCTURE.md", "utf8");

check(
  "Design system tokens",
  ["--rmvi-blue-950", "--rmvi-gold-500", "--rmvi-shadow", "Pre-AWS internal design hardening"].every((item) => css.includes(item)),
  "RMVI blue/gold/white token layer is present"
);
check(
  "Page shell coverage",
  [".section-banner", ".module-grid", ".station-home-hero", ".reports-layout", ".admin-portal-shell", ".admin-board-shell"].every((item) => css.includes(item)),
  "Shared page shells cover welcome, workstation, reports, admin, and modules"
);
check(
  "Mobile layout guardrails",
  ["@media (max-width: 980px)", "@media (max-width: 760px)", "@media (max-width: 430px)", "grid-template-columns: 1fr"].every((item) => css.includes(item)),
  "Tablet and phone breakpoints collapse dense grids safely"
);
check(
  "Readable controls",
  [".report-command-grid button", ".report-selected-actions button", ".action-row button", ".login-form input:focus"].every((item) => css.includes(item)),
  "Buttons, forms, reports, and actions share consistent focus and hover states"
);
check(
  "Security headers",
  [
    "cross-origin-opener-policy",
    "cross-origin-resource-policy",
    "origin-agent-cluster",
    "x-dns-prefetch-control",
    "x-download-options",
    "content-security-policy",
    "strict-transport-security"
  ].every((item) => server.includes(item)),
  "API and web responses include hardened browser security headers"
);
check(
  "Protected production data",
  server.includes("GCOS_REQUIRE_API_AUTH") && server.includes("/api/bootstrap/public") && server.includes("frame-ancestors 'none'"),
  "Production auth mode protects data while retaining a public bootstrap path"
);
check(
  "Verification scripts",
  ["production:check", "database:smoke", "object:smoke", "runtime:smoke", "preaws:check", "internal:audit", "launch:verify:live"].every((script) => packageJson.scripts?.[script]),
  "Pre-AWS, production, storage, runtime, and live launch scripts are registered"
);
check(
  "Infrastructure docs",
  readme.includes("runtime:smoke") && productionDocs.includes("authenticated runtime smoke") && productionDocs.includes("Cloudflare R2"),
  "Docs explain internal verification and durable storage before AWS"
);

for (const item of checks) {
  console.log(`${item.ok ? "✓" : "✕"} ${item.name}: ${item.detail}`);
}

const score = Math.round((checks.filter((item) => item.ok).length / checks.length) * 100);
console.log(`Pre-AWS hardening check: ${score}%`);
if (score < 100) process.exitCode = 1;
