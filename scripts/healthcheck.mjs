const baseUrl = (process.env.GCOS_HEALTHCHECK_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");

const checks = [
  {
    name: "API health",
    path: "/health",
    verify: async (response) => {
      const body = await response.json();
      return body.status === "ok" && body.service === "gcos-api";
    }
  },
  {
    name: "Operational status",
    path: "/api/status",
    verify: async (response) => {
      const body = await response.json();
      return body.status === "ok"
        && body.service === "gcos-api"
        && typeof body.uptimeSeconds === "number"
        && body.counts?.stations > 0
        && body.counts?.tasks > 0
        && body.counts?.policies > 0
        && body.counts?.calendarEvents > 0
        && body.counts?.personnel > 0
        && body.limits?.maxBodyBytes > 0;
    }
  },
  {
    name: "Bootstrap state",
    path: "/api/bootstrap/public",
    verify: async (response) => {
      const body = await response.json();
      return Array.isArray(body.stations)
        && Array.isArray(body.messages)
        && Array.isArray(body.reports)
        && Array.isArray(body.audit);
    }
  },
  {
    name: "Web shell",
    path: "/",
    verify: async (response) => {
      const body = await response.text();
      return body.includes("GCOS - Global Church Operating System") || body.includes("id=\"root\"");
    }
  }
];

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const passed = await check.verify(response);
    if (!passed) throw new Error("unexpected response body");
    console.log(`✓ ${check.name}`);
  } catch (error) {
    console.error(`✕ ${check.name}: ${error.message}`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  console.log(`GCOS healthcheck passed for ${baseUrl}`);
}
