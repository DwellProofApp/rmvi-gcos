import { resolve4, resolveTxt } from "node:dns/promises";
import { request } from "node:https";
import tls from "node:tls";

const domain = process.env.GCOS_DOMAIN ?? "rmvi.org";
const firebaseIp = process.env.GCOS_FIREBASE_HOSTING_IP ?? "199.36.158.100";
const expectedSite = process.env.GCOS_FIREBASE_SITE_ID ?? process.env.GCOS_FIREBASE_PROJECT_ID ?? "rmvi-gcos";
const baseUrl = `https://${domain}`;

const checks = [];

await run("A record points to Firebase Hosting", async () => {
  const addresses = await resolve4(domain);
  assert(addresses.includes(firebaseIp), `${domain} resolves to ${addresses.join(", ") || "nothing"}, expected ${firebaseIp}`);
  return addresses.join(", ");
});

await run("Firebase ownership TXT is published", async () => {
  const records = (await resolveTxt(domain)).flat().join(" ");
  assert(records.includes(`hosting-site=${expectedSite}`), `missing hosting-site=${expectedSite}`);
  return `hosting-site=${expectedSite}`;
});

await run("TLS certificate covers rmvi.org", async () => {
  const cert = await getCertificate(domain);
  const subjectAltName = cert.subjectaltname ?? "";
  assert(subjectAltName.includes(`DNS:${domain}`), `certificate SAN is ${subjectAltName || "empty"}`);
  return subjectAltName;
});

await run("Web shell is served by Firebase Hosting", async () => {
  const response = await requestPath("/");
  assert(response.status >= 200 && response.status < 300, `GET / returned ${response.status}`);
  assert(response.body.includes("GCOS - Global Church Operating System") || response.body.includes('id="root"'), "web shell does not look like GCOS");
  return `HTTP ${response.status}`;
});

await run("Admin route is rewritten to the GCOS app", async () => {
  const response = await requestPath("/admin");
  assert(response.status >= 200 && response.status < 300, `GET /admin returned ${response.status}`);
  assert(response.body.includes("GCOS - Global Church Operating System") || response.body.includes('id="root"'), "admin route does not return the GCOS shell");
  return `HTTP ${response.status}`;
});

await run("Cloud Run API rewrite is active", async () => {
  const response = await requestPath("/health");
  assert(response.status >= 200 && response.status < 300, `GET /health returned ${response.status}`);
  const body = JSON.parse(response.body);
  assert(body.status === "ok" && body.service === "gcos-api", "health body is not GCOS API");
  return body.service;
});

for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✕"} ${check.name}: ${check.detail}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`Firebase domain check failed for ${baseUrl}`);
  process.exitCode = 1;
} else {
  console.log(`Firebase domain check passed for ${baseUrl}`);
}

async function run(name, fn) {
  try {
    const detail = await fn();
    checks.push({ name, ok: true, detail });
  } catch (error) {
    checks.push({ name, ok: false, detail: error.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getCertificate(hostname) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: hostname, port: 443, servername: hostname, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      resolve(cert);
    });
    socket.on("timeout", () => socket.destroy(new Error("TLS request timed out")));
    socket.on("error", reject);
  });
}

function requestPath(path) {
  return new Promise((resolve, reject) => {
    const req = request(new URL(path, baseUrl), {
      method: "GET",
      timeout: 10000,
      headers: {
        "cache-control": "no-cache"
      }
    }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    });
    req.on("timeout", () => req.destroy(new Error("request timed out")));
    req.on("error", reject);
    req.end();
  });
}
