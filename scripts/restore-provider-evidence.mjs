import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const baseUrl = (process.env.GCOS_RESTORE_EVIDENCE_URL ?? process.env.GCOS_HEALTHCHECK_URL ?? "https://rmvi.org").replace(/\/$/, "");
const email = process.env.GCOS_SMOKE_EMAIL ?? "admin@rmvi.org";
const password = process.env.GCOS_SMOKE_PASSWORD ?? "gcos-admin";
const projectId = process.env.GCOS_FIREBASE_PROJECT_ID ?? "rmvi-gcos";
const namespace = process.env.GCOS_FIREBASE_NAMESPACE ?? "production";
const bucket = process.env.GCOS_FIRESTORE_EXPORT_BUCKET ?? `gs://${projectId}-firestore-restore-drills`;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const exportPrefix = `${bucket}/gcos-${namespace}-restore-drill-${stamp}`;

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  projectId,
  namespace,
  exportPrefix,
  actor: email,
  gcloudAvailable: commandAvailable("gcloud"),
  checks: []
};

let token = "";

await check("admin login", async () => {
  const login = await request("/api/auth/login", {
    method: "POST",
    token: "",
    body: { email, password, deviceLabel: "restore-provider-evidence" }
  });
  token = login.token ?? "";
  if (!token) throw new Error("No admin token returned.");
  return `${login.station?.email ?? email} signed in`;
});

await check("prepare GCOS restore evidence", async () => {
  const evidence = await request("/api/persistence/restore-command/prepare", {
    method: "POST",
    body: { label: `restore-provider-evidence-${stamp}` }
  });
  return `${evidence.document?.name ?? "restore evidence"} prepared; ${evidence.restoreStatus ?? "status tracked"}`;
});

await check("read restore command center", async () => {
  const command = await request("/api/persistence/restore-command");
  report.restoreCommand = command;
  return `${command.ready ?? 0}/${command.total ?? 0} gates ready; ${command.status ?? "tracked"}`;
});

await check("read restore rehearsal packet", async () => {
  const packet = await request("/api/persistence/restore-rehearsal-packet");
  report.rehearsalPacket = packet;
  return `${packet.ready ?? 0}/${packet.total ?? 0} rehearsal gates ready`;
});

await check("archive restore evidence packet", async () => {
  const archived = await request("/api/persistence/restore-command/archive", {
    method: "POST",
    body: { reason: "Provider restore evidence packet prepared for Firebase/Firestore managed export drill" }
  });
  return `${archived.document?.name ?? "restore packet"} archived; score ${archived.packet?.score ?? 0}%`;
});

const failures = report.checks.filter((item) => item.status === "failed");
report.status = failures.length ? "failed" : "provider-action-ready";
report.providerAction = {
  summary: "Run a managed Firestore export or restore rehearsal in Google Cloud/Firebase, then attest the provider reference in GCOS.",
  consoleSteps: [
    "Open Google Cloud Console for project rmvi-gcos.",
    "Go to Firestore > Import/Export.",
    "Create a new export for the production Firestore database.",
    "Export to a protected Google Cloud Storage bucket.",
    "Review exported collection count, timestamp, and operation/reference ID.",
    "Optionally import the export into a temporary Firestore database/project for restore rehearsal.",
    "Record the provider reference in GCOS with npm run restore:managed:attest."
  ],
  gcloudCommands: [
    `gcloud config set project ${projectId}`,
    `gcloud firestore export ${exportPrefix} --database='(default)'`,
    "gcloud firestore operations list --filter='metadata.operationType:EXPORT_DOCUMENTS' --limit=5",
    `GCOS_HEALTHCHECK_URL=${baseUrl} GCOS_SMOKE_PASSWORD='<admin-password>' GCOS_RESTORE_DRILL_ATTESTATION=MANAGED_RESTORE_CONFIRMED GCOS_RESTORE_DRILL_REFERENCE='<gcloud-operation-or-export-reference>' GCOS_RESTORE_DRILL_EVIDENCE='Firestore export completed, record counts reviewed, and restore evidence approved.' npm run restore:managed:attest`
  ]
};

await mkdir(REPORT_DIR, { recursive: true });
const jsonPath = join(REPORT_DIR, `restore-provider-evidence-${stamp}.json`);
const mdPath = join(REPORT_DIR, `restore-provider-evidence-${stamp}.md`);
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, renderMarkdown(report));

for (const item of report.checks) {
  console.log(`${item.status === "passed" ? "✓" : "✕"} ${item.name}: ${item.summary}`);
}
console.log(`Provider evidence report: ${jsonPath}`);
console.log(`Provider evidence summary: ${mdPath}`);
console.log(`Provider evidence status: ${report.status}`);
if (!report.gcloudAvailable) console.log("Provider action still required: gcloud is not installed in this workspace, so run the export from Google Cloud Console or Cloud Shell.");
if (failures.length) process.exitCode = 1;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body !== undefined ? { "content-type": "application/json" } : {}),
      ...((options.token === "" ? "" : options.token ?? token) ? { authorization: `Bearer ${options.token ?? token}` } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${body.error ?? text}`);
  return body;
}

async function check(name, fn) {
  const startedAt = new Date().toISOString();
  try {
    const summary = await fn();
    report.checks.push({ name, status: "passed", ok: true, startedAt, finishedAt: new Date().toISOString(), summary });
  } catch (error) {
    report.checks.push({ name, status: "failed", ok: false, startedAt, finishedAt: new Date().toISOString(), summary: error.message });
  }
}

function commandAvailable(command) {
  try {
    execFileSync("which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function renderMarkdown(result) {
  const lines = [
    "# GCOS Restore Provider Evidence",
    "",
    `Generated: ${result.generatedAt}`,
    `Base URL: ${result.baseUrl}`,
    `Firebase Project: ${result.projectId}`,
    `Firestore Namespace: ${result.namespace}`,
    `Suggested Export Prefix: ${result.exportPrefix}`,
    `Status: ${result.status}`,
    "",
    "## GCOS Checks",
    ""
  ];
  for (const item of result.checks) lines.push(`- ${item.status.toUpperCase()} - ${item.name}: ${item.summary}`);
  lines.push("", "## Provider Action", "", result.providerAction.summary, "", "### Firebase Console Steps", "");
  for (const step of result.providerAction.consoleSteps) lines.push(`- ${step}`);
  lines.push("", "### Cloud Shell Commands", "", "```bash");
  lines.push(...result.providerAction.gcloudCommands);
  lines.push("```", "");
  if (!result.gcloudAvailable) {
    lines.push("Note: `gcloud` is not installed in this local workspace. Run the provider export from Google Cloud Shell or Firebase/Google Cloud Console.", "");
  }
  return `${lines.join("\n")}\n`;
}
