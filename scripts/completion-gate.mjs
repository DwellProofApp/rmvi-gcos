import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = join(ROOT, "launch-reports");
const liveUrl = (process.env.GCOS_COMPLETION_URL ?? process.env.GCOS_PRODUCT_SMOKE_URL ?? process.env.GCOS_HEALTHCHECK_URL ?? "https://rmvi.org").replace(/\/$/, "");
const mutate = process.env.GCOS_COMPLETION_MUTATE === "1";
const emailTest = process.env.GCOS_COMPLETION_EMAIL_TEST === "1" || process.env.GCOS_PRODUCT_SMOKE_EMAIL_TEST === "1";
const emailTo = process.env.GCOS_COMPLETION_EMAIL_TO ?? process.env.GCOS_PRODUCT_SMOKE_EMAIL_TO;
const checks = [
  {
    name: "Build web application",
    command: "npm run build"
  },
  {
    name: "Run automated tests",
    command: "npm test"
  },
  {
    name: "Run internal page audit",
    command: "npm run internal:audit"
  },
  {
    name: "Verify deployment alignment",
    command: "npm run deployment:align",
    env: { GCOS_HEALTHCHECK_URL: liveUrl }
  },
  {
    name: "Run live healthcheck",
    command: "npm run healthcheck",
    env: { GCOS_HEALTHCHECK_URL: liveUrl }
  },
  {
    name: "Run live runtime smoke",
    command: "npm run runtime:smoke",
    env: { GCOS_HEALTHCHECK_URL: liveUrl }
  },
  {
    name: mutate ? "Run full live product workflow smoke" : "Run read-only live product workflow smoke",
    command: "npm run product:smoke",
    env: {
      GCOS_PRODUCT_SMOKE_URL: liveUrl,
      ...(mutate ? { GCOS_PRODUCT_SMOKE_MUTATE: "1" } : {}),
      ...(emailTest ? { GCOS_PRODUCT_SMOKE_EMAIL_TEST: "1" } : {}),
      ...(emailTo ? { GCOS_PRODUCT_SMOKE_EMAIL_TO: emailTo } : {})
    }
  }
];

const report = {
  generatedAt: new Date().toISOString(),
  liveUrl,
  mode: mutate ? "full-live-mutation" : "read-only-live",
  emailTest,
  emailTo: emailTo ?? null,
  checks: []
};

for (const check of checks) {
  console.log(`\n=== ${check.name} ===`);
  const result = await run(check.command, check.env);
  report.checks.push({
    name: check.name,
    command: check.command,
    status: result.code === 0 ? "passed" : "failed",
    code: result.code,
    durationMs: result.durationMs,
    outputTail: tail(result.output)
  });
  if (result.code !== 0) {
    report.status = "failed";
    break;
  }
}

if (!report.status) {
  const skippedEmail = report.checks.some((item) => /live ChurchMail email delivery test: skipped/i.test(item.outputTail));
  report.status = skippedEmail ? "passed-with-email-test-skipped" : "passed";
}

report.nextActions = nextActions(report);

await mkdir(REPORT_DIR, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-");
const jsonPath = join(REPORT_DIR, `completion-gate-${stamp}.json`);
const mdPath = join(REPORT_DIR, `completion-gate-${stamp}.md`);
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(mdPath, renderMarkdown(report));

console.log(`\nCompletion gate status: ${report.status}`);
console.log(`Completion gate report: ${jsonPath}`);
console.log(`Completion gate summary: ${mdPath}`);
for (const action of report.nextActions) console.log(`Next: ${action}`);

if (report.status === "failed") process.exitCode = 1;

function run(command, extraEnv = {}) {
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: ROOT,
      env: { ...process.env, ...extraEnv },
      shell: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });
    child.on("close", (code) => resolve({ code, output, durationMs: Date.now() - started }));
  });
}

function tail(value, max = 2600) {
  if (value.length <= max) return value.trim();
  return value.slice(-max).trim();
}

function nextActions(result) {
  if (result.status === "failed") {
    const failed = result.checks.find((item) => item.status === "failed");
    return [`Fix failed gate: ${failed?.name ?? "unknown check"}`];
  }
  if (result.status === "passed-with-email-test-skipped") {
    return [
      "Run live email delivery with GCOS_COMPLETION_EMAIL_TEST=1 after choosing the destination inbox.",
      "Record final launch signoff and restore evidence."
    ];
  }
  return ["Record final launch signoff and restore evidence."];
}

function renderMarkdown(result) {
  const lines = [
    "# GCOS Completion Gate",
    "",
    `Generated: ${result.generatedAt}`,
    `Live URL: ${result.liveUrl}`,
    `Mode: ${result.mode}`,
    `Status: ${result.status}`,
    "",
    "## Checks",
    ""
  ];
  for (const item of result.checks) {
    lines.push(`- ${item.status.toUpperCase()} - ${item.name} (${Math.round(item.durationMs / 1000)}s)`);
  }
  lines.push("", "## Next Actions", "");
  for (const action of result.nextActions) lines.push(`- ${action}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}
