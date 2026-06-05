import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const baseUrl = (process.env.GCOS_ROLE_ACCEPTANCE_URL ?? process.env.GCOS_HEALTHCHECK_URL ?? "https://rmvi.org").replace(/\/$/, "");
const requestTimeoutMs = Number(process.env.GCOS_ROLE_ACCEPTANCE_TIMEOUT_MS ?? 15000);
const roles = [
  { email: "admin@rmvi.org", password: optionalEnv("GCOS_ADMIN_SMOKE_PASSWORD") ?? requiredEnv("GCOS_SMOKE_PASSWORD"), requiresOverride: true },
  { email: "finance@rmvi.org", password: requiredEnv("GCOS_FINANCE_SMOKE_PASSWORD"), focus: "Finance" },
  { email: "mission@rmvi.org", password: requiredEnv("GCOS_MISSION_SMOKE_PASSWORD"), focus: "Mission" },
  { email: "local_branch_017@rmvi.org", password: requiredEnv("GCOS_LOCAL_SMOKE_PASSWORD"), shouldDenyOfficeCreate: true },
  { email: "audit@rmvi.org", password: requiredEnv("GCOS_AUDIT_SMOKE_PASSWORD"), focus: "Audit" }
];

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  roles: [],
  checks: []
};

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} before running role acceptance.`);
  return value;
}

function optionalEnv(name) {
  return process.env[name] || undefined;
}

for (const role of roles) {
  console.log(`\n=== ${role.email} ===`);
  const result = await auditRole(role);
  report.roles.push(result);
}

const failedRoles = report.roles.filter((role) => role.checks.some((check) => !check.ok));
report.status = failedRoles.length ? "failed" : "passed";
report.nextActions = failedRoles.length
  ? failedRoles.map((role) => `Fix role acceptance for ${role.email}: ${role.checks.find((check) => !check.ok)?.summary}`)
  : ["Role-by-role acceptance passed for admin, finance, mission, local branch, and audit."];

await mkdir(REPORT_DIR, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-");
const jsonPath = join(REPORT_DIR, `role-acceptance-${stamp}.json`);
const mdPath = join(REPORT_DIR, `role-acceptance-${stamp}.md`);
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, renderMarkdown(report));

console.log(`\nRole acceptance status: ${report.status}`);
console.log(`Role acceptance report: ${jsonPath}`);
console.log(`Role acceptance summary: ${mdPath}`);
if (failedRoles.length) process.exitCode = 1;

async function auditRole(role) {
  const checks = [];
  let token = "";
  let station = null;

  await check(checks, "sign in", async () => {
    const login = await request("/api/auth/login", {
      method: "POST",
      token: "",
      body: { email: role.email, password: role.password, deviceLabel: "role-acceptance-pass" }
    });
    token = login.token ?? "";
    station = login.station ?? null;
    if (!token || station?.email !== role.email) throw new Error("station token or identity was missing");
    return `${station.title ?? role.email} signed in`;
  });

  await check(checks, "bootstrap workspace", async () => {
    const bootstrap = await request("/api/bootstrap", { token });
    const modules = ["messages", "reports", "approvals", "tasks", "chatRooms"];
    const missing = modules.filter((key) => !Array.isArray(bootstrap[key]));
    if (missing.length) throw new Error(`missing bootstrap arrays: ${missing.join(", ")}`);
    return `${bootstrap.messages.length} messages, ${bootstrap.reports.length} reports, ${bootstrap.approvals.length} approvals, ${bootstrap.chatRooms.length} chat rooms`;
  });

  await check(checks, "ChurchMail readable", async () => {
    const messages = await request("/api/messages", { token });
    if (!Array.isArray(messages)) throw new Error("messages endpoint did not return a list");
    return `${messages.length} message${messages.length === 1 ? "" : "s"} visible`;
  });

  await check(checks, "department chat connected", async () => {
    const digest = await request("/api/chat/digest", { token });
    if (typeof digest.rooms !== "number" || typeof digest.messages !== "number") throw new Error("chat digest missing room/message counts");
    return `${digest.rooms} rooms, ${digest.messages} messages, ${digest.online} online`;
  });

  if (role.shouldDenyOfficeCreate) {
    await check(checks, "local office create restriction", async () => {
      const response = await raw("/api/offices", {
        method: "POST",
        token,
        allowStatus: [401, 403],
        body: {
          name: `Unauthorized Role Acceptance ${Date.now()}`,
          email: `unauthorized-${Date.now()}@rmvi.org`,
          level: "Local Branch",
          department: "Acceptance",
          supervisor: "International HQ"
        }
      });
      if (![401, 403].includes(response.status)) throw new Error(`expected 401/403, received ${response.status}`);
      return "local branch cannot create offices";
    });
  }

  if (role.requiresOverride) {
    await check(checks, "admin override permissions", async () => {
      if (!station?.permissionPreset && !station?.authority) throw new Error("admin station did not include authority metadata");
      return `${station.permissionPreset ?? "override"} / ${station.authority ?? "authority ready"}`;
    });
  }

  return { email: role.email, stationTitle: station?.title ?? role.email, checks };
}

async function check(checks, name, fn) {
  const startedAt = new Date().toISOString();
  try {
    const summary = await fn();
    checks.push({ name, ok: true, status: "passed", startedAt, finishedAt: new Date().toISOString(), summary });
    console.log(`✓ ${name}: ${summary}`);
  } catch (error) {
    checks.push({ name, ok: false, status: "failed", startedAt, finishedAt: new Date().toISOString(), summary: error.message });
    console.log(`✕ ${name}: ${error.message}`);
  }
}

async function request(path, options = {}) {
  const response = await raw(path, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${body.error ?? text}`);
  return body;
}

async function raw(path, options = {}) {
  const headers = {};
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal
    });
    if (!response.ok && !options.allowStatus?.includes(response.status)) {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function renderMarkdown(result) {
  const lines = [
    "# GCOS Role Acceptance Pass",
    "",
    `Generated: ${result.generatedAt}`,
    `Base URL: ${result.baseUrl}`,
    `Status: ${result.status}`,
    "",
    "## Roles",
    ""
  ];
  for (const role of result.roles) {
    lines.push(`### ${role.email}`, "");
    for (const check of role.checks) lines.push(`- ${check.status.toUpperCase()} - ${check.name}: ${check.summary}`);
    lines.push("");
  }
  lines.push("## Next Actions", "");
  for (const action of result.nextActions) lines.push(`- ${action}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}
