import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const baseUrl = (process.env.GCOS_FINAL_ACTIVATION_URL ?? process.env.GCOS_PRODUCT_SMOKE_URL ?? process.env.GCOS_HEALTHCHECK_URL ?? "https://rmvi.org").replace(/\/$/, "");
const runEmailTest = process.env.GCOS_FINAL_ACTIVATION_EMAIL_TEST === "1" || process.env.GCOS_PRODUCT_SMOKE_EMAIL_TEST === "1";
const attestRestore = process.env.GCOS_RESTORE_DRILL_ATTESTATION === "MANAGED_RESTORE_CONFIRMED";
const certifyTraining = process.env.GCOS_ROLLOUT_CERTIFY_COMPLETED === "1";

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  mode: "final-live-activation",
  runEmailTest,
  attestRestore,
  certifyTraining,
  steps: [],
  nextActions: []
};

await run("01 rollout and training preparation", "npm", ["run", "rollout:finish"], {
  required: true,
  env: {
    GCOS_HEALTHCHECK_URL: baseUrl,
    GCOS_ROLLOUT_FINISH_URL: baseUrl,
    GCOS_ROLLOUT_FINISH_MUTATE: "1",
    GCOS_ROLLOUT_CERTIFY_COMPLETED: certifyTraining ? "1" : "0"
  }
});

await run("02 restore evidence preparation", "npm", ["run", "restore:evidence"], {
  required: true,
  env: {
    GCOS_HEALTHCHECK_URL: baseUrl,
    GCOS_RESTORE_EVIDENCE_URL: baseUrl
  }
});

if (attestRestore) {
  await run("03 managed restore attestation", "npm", ["run", "restore:managed:attest"], {
    required: true,
    env: {
      GCOS_HEALTHCHECK_URL: baseUrl
    }
  });
} else {
  skip(
    "03 managed restore attestation",
    "provider attestation not requested",
    "After the Firestore export/restore provider evidence is reviewed, rerun with GCOS_RESTORE_DRILL_ATTESTATION=MANAGED_RESTORE_CONFIRMED and GCOS_RESTORE_DRILL_REFERENCE set."
  );
}

await run("04 live product workflow", "npm", ["run", "product:smoke"], {
  required: true,
  env: {
    GCOS_PRODUCT_SMOKE_URL: baseUrl,
    GCOS_PRODUCT_SMOKE_MUTATE: "1",
    GCOS_PRODUCT_SMOKE_EMAIL_TEST: runEmailTest ? "1" : "0"
  }
});

await run("05 Firebase launch verification", "npm", ["run", "launch:verify:firebase"], {
  required: true,
  env: {
    GCOS_HEALTHCHECK_URL: baseUrl,
    GCOS_PRODUCT_SMOKE_URL: baseUrl,
    GCOS_MANAGED_RESTORE_DRILL: "1"
  }
});

const failed = report.steps.filter((step) => step.status === "failed" && step.required);
const skipped = report.steps.filter((step) => step.status === "skipped");
report.status = failed.length ? "hold" : skipped.length ? "passed-with-provider-actions" : "passed";

if (failed.length) {
  report.nextActions.push(...failed.map((step) => step.fix ?? `Fix ${step.name}.`));
}
if (!runEmailTest) {
  report.nextActions.push("Run one real Resend delivery test with GCOS_FINAL_ACTIVATION_EMAIL_TEST=1 and GCOS_PRODUCT_SMOKE_EMAIL_TO set to a confirmed inbox.");
}
if (!attestRestore) {
  report.nextActions.push("Complete the provider Firestore export/restore review, then rerun with GCOS_RESTORE_DRILL_ATTESTATION=MANAGED_RESTORE_CONFIRMED.");
}
if (!certifyTraining) {
  report.nextActions.push("After live walkthroughs, rerun with GCOS_ROLLOUT_CERTIFY_COMPLETED=1 to mark first-wave training complete.");
}
if (!report.nextActions.length) {
  report.nextActions.push("Final activation proof passed. Archive the activation report and begin controlled first-wave rollout.");
}

await mkdir(REPORT_DIR, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-");
const jsonPath = join(REPORT_DIR, `final-live-activation-${stamp}.json`);
const mdPath = join(REPORT_DIR, `final-live-activation-${stamp}.md`);
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, renderMarkdown(report));

for (const step of report.steps) {
  const marker = step.status === "passed" ? "✓" : step.status === "skipped" ? "-" : "✕";
  console.log(`${marker} ${step.name}: ${step.summary}`);
}
console.log(`Final live activation report: ${jsonPath}`);
console.log(`Final live activation summary: ${mdPath}`);
console.log(`Final live activation status: ${report.status}`);

if (failed.length) process.exitCode = 1;

async function run(name, command, args, options = {}) {
  const startedAt = new Date().toISOString();
  const result = await exec(command, args, { env: options.env });
  report.steps.push({
    name,
    required: Boolean(options.required),
    status: result.code === 0 ? "passed" : "failed",
    ok: result.code === 0,
    startedAt,
    finishedAt: new Date().toISOString(),
    command: [command, ...args].join(" "),
    summary: summarize(result),
    fix: result.code === 0 ? undefined : fixFor(name),
    stdout: trimOutput(result.stdout),
    stderr: trimOutput(result.stderr)
  });
}

function skip(name, summary, fix) {
  report.steps.push({
    name,
    required: false,
    status: "skipped",
    ok: true,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    summary,
    fix
  });
}

function exec(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: { ...process.env, ...(options.env ?? {}) },
      shell: false
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

function summarize(result) {
  const text = `${result.stdout}\n${result.stderr}`.trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.at(-1) ?? (result.code === 0 ? "passed" : "failed");
}

function trimOutput(output) {
  return output.trim().split("\n").slice(-80).join("\n");
}

function fixFor(name) {
  if (name.includes("rollout")) return "Confirm admin credentials and rerun the rollout finish command.";
  if (name.includes("restore evidence")) return "Confirm Firestore/Firebase APIs are reachable and rerun restore evidence preparation.";
  if (name.includes("restore attestation")) return "Confirm the provider export/restore reference and rerun restore:managed:attest.";
  if (name.includes("product workflow")) return "Review the product workflow smoke report for the failed workflow route.";
  if (name.includes("launch verification")) return "Review the launch verification report and fix the failed launch gate.";
  return `Review ${name}.`;
}

function renderMarkdown(result) {
  const lines = [
    "# GCOS Final Live Activation",
    "",
    `Generated: ${result.generatedAt}`,
    `Base URL: ${result.baseUrl}`,
    `Status: ${result.status}`,
    "",
    "## Steps",
    ""
  ];
  for (const step of result.steps) {
    lines.push(`- ${step.status.toUpperCase()} - ${step.name}: ${step.summary}`);
  }
  lines.push("", "## Next Actions", "");
  for (const action of result.nextActions) lines.push(`- ${action}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}
