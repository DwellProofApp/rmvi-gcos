import { request } from "node:https";

const domain = process.env.GCOS_DOMAIN ?? "rmvi.org";
const baseUrl = `https://${domain}`;
const expectedCommit = process.env.GCOS_EXPECTED_COMMIT ?? "";
const checks = [];

const webBuild = await run("Web build", async () => {
  const body = await getJson("/build-info.json");
  if (expectedCommit) assert(body.gitCommit === expectedCommit, `web commit ${body.gitCommit ?? "missing"} != ${expectedCommit}`);
  return body;
});

const apiBuild = await run("API build", async () => {
  const body = await getJson("/api/deployment/build-info");
  assert(body.gitCommit === webBuild?.gitCommit, `api commit ${body.gitCommit ?? "missing"} != web ${webBuild?.gitCommit ?? "missing"}`);
  assert(body.storageProvider === "firestore", `api storage provider is ${body.storageProvider ?? "missing"}`);
  return `${body.gitCommit} / ${body.storageProvider}`;
});

const bootstrap = await run("Bootstrap state", async () => {
  const body = await getJson("/api/bootstrap/public");
  assert(Array.isArray(body.offices), "offices missing");
  assert(Array.isArray(body.stations), "stations missing");
  assert(Array.isArray(body.routingRules), "routingRules missing");
  return body;
});

await run("Pioneer office identity", async () => {
  const pioneerOffice = bootstrap?.offices?.find((office) => office.email === "pioneer@rmvi.org");
  const pioneerStation = bootstrap?.stations?.find((station) => station.email === "pioneer@rmvi.org");
  assert(pioneerOffice, "pioneer@rmvi.org office missing");
  assert(pioneerStation, "pioneer@rmvi.org station missing");
  assert(pioneerOffice.permissionPreset === "Executive Override", `Pioneer permission is ${pioneerOffice.permissionPreset ?? "missing"}`);
  assert((pioneerOffice.workflowAccess ?? []).includes("Approvals"), "Pioneer approvals access missing");
  return "Pioneer Office / Executive Override";
});

await run("Workflow routing rules", async () => {
  const routes = bootstrap?.routingRules?.filter((rule) => rule.destinationOffice === "Pioneer Office") ?? [];
  assert(routes.some((rule) => rule.workType === "Report"), "Pioneer report routing rule missing");
  assert(routes.some((rule) => rule.workType === "Approval"), "Pioneer approval routing rule missing");
  assert(routes.every((rule) => rule.active), "Pioneer routing rules must be active");
  return `${routes.length} Pioneer routes active`;
});

for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✕"} ${check.name}: ${check.detail}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`Office routing live check failed for ${baseUrl}`);
  process.exitCode = 1;
} else {
  console.log(`Office routing live check passed for ${baseUrl}`);
}

async function run(name, fn) {
  try {
    const result = await fn();
    checks.push({ name, ok: true, detail: summarize(result) });
    return result;
  } catch (error) {
    checks.push({ name, ok: false, detail: error.message });
    return null;
  }
}

function summarize(result) {
  if (typeof result === "string") return result;
  if (result?.gitCommit) return `${result.gitCommit} (${result.generatedAt ?? "no timestamp"})`;
  if (Array.isArray(result)) return `${result.length} records`;
  if (result && typeof result === "object") return "available";
  return "passed";
}

async function getJson(path) {
  const response = await requestPath(path);
  assert(response.status === 200, `${path} returned ${response.status}`);
  try {
    return JSON.parse(response.body);
  } catch {
    throw new Error(`${path} did not return JSON`);
  }
}

function requestPath(path) {
  return new Promise((resolve, reject) => {
    const req = request(new URL(path, baseUrl), {
      method: "GET",
      timeout: 20000,
      headers: { "cache-control": "no-cache" }
    }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });
    req.on("timeout", () => req.destroy(new Error(`Timed out requesting ${path}`)));
    req.on("error", reject);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
