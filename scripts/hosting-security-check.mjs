import { request } from "node:https";

const domain = process.env.GCOS_DOMAIN ?? "rmvi.org";
const baseUrl = `https://${domain}`;
const checks = [];

await run("App shell is no-cache", async () => {
  const response = await head("/");
  expectStatus(response, 200);
  assert(header(response, "cache-control").includes("no-cache"), `cache-control is ${header(response, "cache-control") || "missing"}`);
  return header(response, "cache-control");
});

await run("Admin shell is no-cache", async () => {
  const response = await head("/admin");
  expectStatus(response, 200);
  assert(header(response, "cache-control").includes("no-cache"), `cache-control is ${header(response, "cache-control") || "missing"}`);
  return header(response, "cache-control");
});

await run("Service worker updates immediately", async () => {
  const response = await get("/sw.js");
  expectStatus(response, 200);
  assert(header(response, "cache-control").includes("no-cache"), `cache-control is ${header(response, "cache-control") || "missing"}`);
  assert(/CACHE_VERSION\s*=\s*"rmvi-gcos-offline-v\d+"/.test(response.body), "cache version marker missing");
  return response.body.match(/rmvi-gcos-offline-v\d+/)?.[0] ?? "version found";
});

await run("Manifest is install-ready", async () => {
  const response = await get("/manifest.webmanifest");
  expectStatus(response, 200);
  assert(header(response, "cache-control").includes("no-cache"), `cache-control is ${header(response, "cache-control") || "missing"}`);
  const manifest = JSON.parse(response.body);
  assert(manifest.name?.includes("Remedy Movement International"), "manifest name missing RMVI");
  assert(manifest.display === "standalone", "manifest display is not standalone");
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "manifest icons are missing");
  return `${manifest.short_name}, ${manifest.icons.length} icons`;
});

await run("Security headers are active", async () => {
  const response = await head("/");
  const csp = header(response, "content-security-policy");
  assert(csp.includes("frame-ancestors 'none'"), "CSP frame-ancestors missing");
  assert(csp.includes("object-src 'none'"), "CSP object-src missing");
  assert(header(response, "x-frame-options") === "DENY", "X-Frame-Options not DENY");
  assert(header(response, "x-content-type-options") === "nosniff", "X-Content-Type-Options not nosniff");
  assert(header(response, "referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy mismatch");
  assert(header(response, "cross-origin-opener-policy") === "same-origin", "COOP mismatch");
  assert(header(response, "cross-origin-resource-policy") === "same-origin", "CORP mismatch");
  return "CSP, XFO, XCTO, referrer, COOP, CORP";
});

await run("Fingerprinted assets are immutable", async () => {
  const shell = await get("/");
  const asset = shell.body.match(/assets\/[^" ]+\.js/)?.[0] ?? shell.body.match(/assets\/[^" ]+\.css/)?.[0];
  assert(asset, "no fingerprinted asset found in shell");
  const response = await head(`/${asset}`);
  expectStatus(response, 200);
  assert(header(response, "cache-control").includes("immutable"), `cache-control is ${header(response, "cache-control") || "missing"}`);
  return `${asset} -> ${header(response, "cache-control")}`;
});

for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✕"} ${check.name}: ${check.detail}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`Hosting security check failed for ${baseUrl}`);
  process.exitCode = 1;
} else {
  console.log(`Hosting security check passed for ${baseUrl}`);
}

async function run(name, fn) {
  try {
    const detail = await fn();
    checks.push({ name, ok: true, detail });
  } catch (error) {
    checks.push({ name, ok: false, detail: error.message });
  }
}

function expectStatus(response, status) {
  assert(response.status === status, `expected ${status}, got ${response.status}`);
}

function header(response, name) {
  return String(response.headers[name.toLowerCase()] ?? "");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function head(path) {
  return requestPath(path, "HEAD");
}

function get(path) {
  return requestPath(path, "GET");
}

function requestPath(path, method) {
  return retryRequest(path, method, 3);
}

async function retryRequest(path, method, attempts) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await rawRequestPath(path, method);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(750 * attempt);
    }
  }
  throw lastError;
}

function rawRequestPath(path, method) {
  return new Promise((resolve, reject) => {
    const req = request(new URL(path, baseUrl), {
      method,
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
      res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
    });
    req.on("timeout", () => req.destroy(new Error("request timed out")));
    req.on("error", reject);
    req.end();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
