import { request } from "node:https";

const domain = process.env.GCOS_DOMAIN ?? "rmvi.org";
const baseUrl = `https://${domain}`;
const expectedTarget = process.env.GCOS_DEPLOYMENT_TARGET ?? "firebase";
const checks = [];

const webBuild = await run("Web build manifest", async () => {
  const response = await get("/build-info.json");
  expectStatus(response, 200);
  const body = JSON.parse(response.body);
  assert(body.app === "rmvi-gcos", "web build app id mismatch");
  assert(Boolean(body.gitCommit), "web build commit missing");
  assert(body.deploymentTarget === expectedTarget, `web deployment target is ${body.deploymentTarget}`);
  return body;
});

const apiBuild = await run("API build manifest", async () => {
  const response = await get("/api/deployment/build-info");
  expectStatus(response, 200);
  const body = JSON.parse(response.body);
  assert(body.app === "rmvi-gcos", "api build app id mismatch");
  assert(Boolean(body.gitCommit), "api build commit missing");
  assert(body.runtimeTarget === expectedTarget, `api runtime target is ${body.runtimeTarget}`);
  assert(body.storageProvider === "firestore", `api storage provider is ${body.storageProvider}`);
  return body;
});

await run("Web and API commits align", async () => {
  assert(webBuild?.gitCommit === apiBuild?.gitCommit, `web ${webBuild?.gitCommit ?? "missing"} != api ${apiBuild?.gitCommit ?? "missing"}`);
  return `${webBuild.gitCommit} on ${domain}`;
});

await run("Health endpoint advertises same API build", async () => {
  const response = await get("/health");
  expectStatus(response, 200);
  const body = JSON.parse(response.body);
  assert(body.status === "ok" && body.service === "gcos-api", "health endpoint did not return API ok");
  assert(body.build?.gitCommit === apiBuild?.gitCommit, `health ${body.build?.gitCommit ?? "missing"} != api ${apiBuild?.gitCommit ?? "missing"}`);
  return `${body.service} ${body.build.gitCommit}`;
});

for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✕"} ${check.name}: ${check.detail}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`Deployment alignment check failed for ${baseUrl}`);
  process.exitCode = 1;
} else {
  console.log(`Deployment alignment check passed for ${baseUrl}`);
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
  if (result?.gitCommit) return `${result.gitCommit} generated ${result.generatedAt}`;
  return "passed";
}

function get(path) {
  return retryRequest(path, 3);
}

async function retryRequest(path, attempts) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await rawRequest(path);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(750 * attempt);
    }
  }
  throw lastError;
}

function rawRequest(path) {
  return new Promise((resolve, reject) => {
    const req = request(new URL(path, baseUrl), {
      method: "GET",
      timeout: 20000,
      headers: {
        "cache-control": "no-cache"
      }
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

function expectStatus(response, status) {
  assert(response.status === status, `expected ${status}, got ${response.status}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
