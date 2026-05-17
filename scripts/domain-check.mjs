import { resolve4 } from "node:dns/promises";
import { request } from "node:https";

const domain = process.env.GCOS_DOMAIN ?? "rmvi.org";
const baseUrl = `https://${domain}`;
let resolvedAddresses = [];

async function main() {
  const addresses = await checkDns();
  await checkEndpoint("/health", "API health", (body) => body.status === "ok" && body.service === "gcos-api");
  await checkEndpoint("/api/status", "Operational status", (body) => body.status === "ok" && body.counts?.stations > 0);
  await checkText("/", "Web shell", (body) => body.includes("GCOS - Global Church Operating System") || body.includes("id=\"root\""));
  console.log(`Domain check passed for ${baseUrl} (${addresses.join(", ")})`);
}

async function checkDns() {
  try {
    const addresses = await resolve4(domain);
    if (addresses.length === 0) throw new Error("no A records returned");
    resolvedAddresses = addresses;
    console.log(`✓ DNS resolves: ${addresses.join(", ")}`);
    return addresses;
  } catch (error) {
    throw new Error(`DNS is not ready for ${domain}: ${error.message}`);
  }
}

async function checkEndpoint(path, name, verify) {
  const response = await requestDomain(path);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${name} returned ${response.status}${wrongAppHint(response.body)}`);
  }
  let body;
  try {
    body = JSON.parse(response.body);
  } catch {
    throw new Error(`${name} did not return JSON${wrongAppHint(response.body)}`);
  }
  if (!verify(body)) throw new Error(`${name} returned unexpected JSON${wrongAppHint(JSON.stringify(body))}`);
  console.log(`✓ ${name}`);
}

async function checkText(path, name, verify) {
  const response = await requestDomain(path);
  if (response.status < 200 || response.status >= 300) throw new Error(`${name} returned ${response.status}${wrongAppHint(response.body)}`);
  const body = response.body;
  if (!verify(body)) throw new Error(`${name} does not look like GCOS${wrongAppHint(body)}`);
  console.log(`✓ ${name}`);
}

function requestDomain(path) {
  const url = new URL(path, baseUrl);
  const ip = resolvedAddresses[0];

  return new Promise((resolve, reject) => {
    const req = request({
      hostname: url.hostname,
      path: url.pathname,
      method: "GET",
      servername: domain,
      timeout: 10000,
      lookup: (hostname, options, callback) => {
        if (options?.all) return callback(null, [{ address: ip, family: 4 }]);
        return callback(null, ip, 4);
      }
    }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    });

    req.on("timeout", () => {
      req.destroy(new Error("request timed out"));
    });
    req.on("error", reject);
    req.end();
  });
}

function wrongAppHint(body) {
  if (/DwellProof/i.test(body)) return " (domain is currently serving DwellProof, not GCOS)";
  if (/Missing or invalid Authorization header/i.test(body)) return " (domain appears routed to another API, not GCOS)";
  return "";
}

main().catch((error) => {
  console.error(`✕ ${error.message}`);
  process.exitCode = 1;
});
