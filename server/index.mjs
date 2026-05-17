import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { audit, createSeedState, getPermissions, normalizeStationEmail } from "./domain.mjs";
import { createServices } from "./services.mjs";
import { validateRequest } from "./validation.mjs";

const PORT = Number(process.env.GCOS_API_PORT ?? process.env.PORT ?? 8787);
const HOST = process.env.GCOS_HOST ?? "127.0.0.1";
const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_PATH = join(SERVER_DIR, "..", "data", "gcos-state.json");
const DATA_PATH = process.env.GCOS_DATA_PATH ?? DEFAULT_DATA_PATH;
const SERVE_WEB = process.env.GCOS_SERVE_WEB === "1";
const WEB_DIST_PATH = process.env.GCOS_WEB_DIST_PATH ?? join(SERVER_DIR, "..", "dist");
const STARTED_AT = new Date();
const ALLOWED_ORIGIN = process.env.GCOS_ALLOWED_ORIGIN ?? "*";
const parsedMaxBodyBytes = Number(process.env.GCOS_MAX_BODY_BYTES ?? 1024 * 1024);
const MAX_BODY_BYTES = Number.isFinite(parsedMaxBodyBytes) && parsedMaxBodyBytes > 0
  ? parsedMaxBodyBytes
  : 1024 * 1024;
const DEV_RESET_ENABLED = process.env.GCOS_ENABLE_DEV_RESET === "1" || process.env.NODE_ENV !== "production";

const state = await loadState();
const services = createServices({ state, record, requirePermission, findById });
const sessions = new Map();

const routes = {
  "GET /health": () => ok({ status: "ok", service: "gcos-api", time: new Date().toISOString() }),
  "GET /api/readiness": () => ok(readinessReport()),
  "GET /api/status": () => ok(operationalStatus()),
  "GET /api/bootstrap": () => ok(services.publicState()),
  "POST /api/dev/reset": () => {
    if (!DEV_RESET_ENABLED) throw new HttpError(403, "Development reset is disabled");
    Object.assign(state, createSeedState());
    record("DevReset", "System", "GCOS API", "Seed state restored");
    return ok(services.publicState());
  },
  "GET /api/stations": () => ok(state.stations),
  "GET /api/messages": () => ok(state.messages),
  "POST /api/messages": ({ body }) => createdResponse(services.createMessage(body)),
  "POST /api/messages/:id/classify": ({ params, body }) => ok(services.classifyMessage(params.id, body)),
  "POST /api/messages/:id/status": ({ params, body }) => ok(services.updateMessageStatus(params.id, body)),
  "GET /api/reports": () => ok(state.reports),
  "POST /api/reports": ({ body }) => createdResponse(services.createReport(body)),
  "POST /api/reports/:id/submit": ({ params, body }) => ok(services.submitReport(params.id, body)),
  "POST /api/reports/:id/correction": ({ params, body }) => ok(services.requestReportCorrection(params.id, body)),
  "POST /api/reports/:id/score": ({ params, body }) => ok(services.updateReportScore(params.id, body)),
  "GET /api/approvals": () => ok(state.approvals),
  "POST /api/approvals": ({ body }) => createdResponse(services.createApproval(body)),
  "POST /api/approvals/:id/approve": ({ params, body }) => ok(services.approveRequest(params.id, body)),
  "POST /api/approvals/:id/sign": ({ params, body }) => ok(services.signApproval(params.id, body)),
  "POST /api/approvals/:id/reject": ({ params, body }) => ok(services.rejectRequest(params.id, body)),
  "GET /api/tasks": () => ok(state.tasks),
  "POST /api/tasks": ({ body }) => createdResponse(services.createTask(body)),
  "POST /api/tasks/:id/advance": ({ params, body }) => ok(services.advanceTask(params.id, body)),
  "POST /api/tasks/:id/priority": ({ params, body }) => ok(services.updateTaskPriority(params.id, body)),
  "GET /api/policies": () => ok(state.policies),
  "POST /api/policies": ({ body }) => createdResponse(services.createPolicy(body)),
  "POST /api/policies/:id/acknowledge": ({ params, body }) => ok(services.acknowledgePolicy(params.id, body)),
  "POST /api/policies/:id/status": ({ params, body }) => ok(services.updatePolicyStatus(params.id, body)),
  "POST /api/policies/:id/retire": ({ params, body }) => ok(services.retirePolicy(params.id, body)),
  "GET /api/calendar-events": () => ok(state.calendarEvents),
  "POST /api/calendar-events": ({ body }) => createdResponse(services.createCalendarEvent(body)),
  "POST /api/calendar-events/:id/complete": ({ params, body }) => ok(services.completeCalendarEvent(params.id, body)),
  "POST /api/calendar-events/:id/priority": ({ params, body }) => ok(services.updateCalendarEventPriority(params.id, body)),
  "POST /api/calendar-events/:id/risk": ({ params, body }) => ok(services.markCalendarEventAtRisk(params.id, body)),
  "GET /api/personnel": () => ok(state.personnel),
  "POST /api/personnel": ({ body }) => createdResponse(services.createPerson(body)),
  "POST /api/personnel/:id/assignment": ({ params, body }) => ok(services.updatePersonAssignment(params.id, body)),
  "POST /api/personnel/:id/status": ({ params, body }) => ok(services.updatePersonStatus(params.id, body)),
  "POST /api/personnel/:id/deactivate": ({ params, body }) => ok(services.deactivatePerson(params.id, body)),
  "GET /api/escalations": () => ok(state.escalations),
  "POST /api/escalations": ({ body }) => createdResponse(services.createEscalation(body)),
  "POST /api/escalations/:id/owner": ({ params, body }) => ok(services.updateEscalationOwner(params.id, body)),
  "POST /api/escalations/:id/severity": ({ params, body }) => ok(services.updateEscalationSeverity(params.id, body)),
  "POST /api/escalations/:id/route": ({ params, body }) => ok(services.routeEscalation(params.id, body)),
  "POST /api/escalations/:id/resolve": ({ params, body }) => ok(services.resolveEscalation(params.id, body)),
  "GET /api/offices": () => ok(state.offices),
  "POST /api/offices": ({ body }) => {
    const result = services.createOffice(body);
    if (result.conflict) return conflict({ error: result.error });
    return createdResponse(result);
  },
  "POST /api/offices/:id/supervisor": ({ params, body }) => ok(services.updateOfficeSupervisor(params.id, body)),
  "POST /api/offices/:id/status": ({ params, body }) => ok(services.updateOfficeStatus(params.id, body)),
  "GET /api/transfers": () => ok(state.transfers),
  "POST /api/transfers": ({ body }) => createdResponse(services.createTransfer(body)),
  "POST /api/transfers/:id/acknowledge": ({ params, body }) => ok(services.acknowledgeTransfer(params.id, body)),
  "POST /api/transfers/:id/risk": ({ params, body }) => ok(services.updateTransferRisk(params.id, body)),
  "POST /api/transfers/:id/execute": ({ params, body }) => ok(services.executeTransfer(params.id, body)),
  "GET /api/documents": () => ok(state.documents),
  "POST /api/documents": ({ body }) => createdResponse(services.createDocument(body)),
  "POST /api/documents/:id/classification": ({ params, body }) => ok(services.updateDocumentClassification(params.id, body)),
  "POST /api/documents/:id/owner": ({ params, body }) => ok(services.updateDocumentOwner(params.id, body)),
  "POST /api/documents/:id/review": ({ params, body }) => ok(services.markDocumentInReview(params.id, body)),
  "POST /api/documents/:id/archive": ({ params, body }) => ok(services.markDocumentArchived(params.id, body)),
  "GET /api/audit": () => ok(state.audit),
  "GET /api/events": () => ok(state.events),
  "GET /api/export": ({ session }) => ok(exportSnapshot(session)),
  "GET /api/ai-drafts": () => ok(state.aiDrafts),
  "POST /api/ai-drafts": ({ body }) => createdResponse(services.createAiDraft(body)),
  "POST /api/ai-drafts/:id/archive": ({ params, body }) => createdResponse(services.archiveAiDraft(params.id, body)),
  "POST /api/ai-drafts/:id/refresh": ({ params, body }) => ok(services.refreshAiDraft(params.id, body)),
  "POST /api/offline-sync": ({ body }) => ok(services.syncOfflineActions(body)),
  "POST /api/auth/login": ({ body }) => {
    const result = services.login(body);
    if (result.unauthorized) return unauthorized({ error: result.error });
    const session = createSession(result.station.email);
    return ok({ ...result, token: session.token, expiresAt: session.expiresAt });
  }
};

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") return send(response, { status: 204, body: null });
    const requestBody = await readJson(request);
    const pathname = new URL(request.url ?? "/", `http://${request.headers.host}`).pathname;
    const match = matchRoute(request.method, pathname);
    if (!match) {
      if (request.method === "GET" && SERVE_WEB && !pathname.startsWith("/api/") && pathname !== "/health") {
        const webAsset = await readWebAsset(pathname);
        if (webAsset) return sendRaw(response, webAsset);
      }
      return send(response, notFound({ error: "Route not found" }));
    }
    validateRequest(match.pattern, requestBody);
    const session = authenticateRequest(request, pathname);
    const body = session ? { ...requestBody, actor: session.email } : requestBody;
    const payload = await match.handler({ body, params: match.params, session });
    if (request.method !== "GET") await saveState();
    return send(response, payload);
  } catch (error) {
    if (error instanceof HttpError || Number.isInteger(error.status)) {
      return send(response, { status: error.status, body: { error: error.message } });
    }
    return send(response, serverError({ error: error.message }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`GCOS API listening on http://${HOST}:${PORT}`);
});

function record(event, actor, object, result) {
  state.audit.unshift(audit(actor ?? "System", event, object, result));
  state.events.unshift(`${event}: ${object}`);
  state.events = state.events.slice(0, 20);
}

function operationalStatus() {
  return {
    status: "ok",
    service: "gcos-api",
    time: new Date().toISOString(),
    startedAt: STARTED_AT.toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    serveWeb: SERVE_WEB,
    persistence: DATA_PATH,
    limits: {
      maxBodyBytes: MAX_BODY_BYTES,
      devResetEnabled: DEV_RESET_ENABLED
    },
    sessions: sessionSummary(),
    counts: {
      stations: state.stations.length,
      messages: state.messages.length,
      reports: state.reports.length,
      approvals: state.approvals.length,
      tasks: state.tasks.length,
      policies: state.policies.length,
      calendarEvents: state.calendarEvents.length,
      personnel: state.personnel.length,
      escalations: state.escalations.length,
      transfers: state.transfers.length,
      offices: state.offices.length,
      documents: state.documents.length,
      audit: state.audit.length,
      events: state.events.length
    }
  };
}

function readinessReport() {
  const status = operationalStatus();
  const checks = [
    { name: "web", ok: SERVE_WEB, detail: SERVE_WEB ? "Web shell served by API" : "API-only mode" },
    { name: "persistence", ok: Boolean(DATA_PATH), detail: DATA_PATH },
    { name: "stations", ok: state.stations.length >= 4, detail: `${state.stations.length} station identities` },
    { name: "audit", ok: state.audit.length > 0, detail: `${state.audit.length} audit rows` },
    { name: "security", ok: DEV_RESET_ENABLED === false || process.env.NODE_ENV !== "production", detail: DEV_RESET_ENABLED ? "Development reset enabled" : "Development reset disabled" },
    { name: "exports", ok: true, detail: "Governance snapshot endpoint available" },
    { name: "sessions", ok: status.sessions.active >= 0, detail: `${status.sessions.active} active sessions` },
    { name: "workflows", ok: state.reports.length > 0 && state.approvals.length > 0, detail: `${state.reports.length} reports, ${state.approvals.length} approvals` }
  ];
  return {
    status: checks.every((check) => check.ok) ? "ready" : "attention",
    checkedAt: new Date().toISOString(),
    checks
  };
}

function exportSnapshot(session) {
  return {
    exportedAt: new Date().toISOString(),
    exportedBy: session.email,
    service: "gcos-api",
    version: "0.1.0",
    counts: operationalStatus().counts,
    state: services.publicState()
  };
}

function createSession(email) {
  const token = `gcos.${randomUUID()}`;
  const startedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  sessions.set(token, { email, startedAt, expiresAt });
  return { token, startedAt, expiresAt };
}

function sessionSummary() {
  const now = Date.now();
  const active = [];
  for (const [token, session] of sessions.entries()) {
    if (Date.parse(session.expiresAt) <= now) {
      sessions.delete(token);
      continue;
    }
    active.push({
      email: session.email,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      minutesRemaining: Math.max(0, Math.round((Date.parse(session.expiresAt) - now) / 60000))
    });
  }
  return {
    active: active.length,
    expiringSoon: active.filter((session) => session.minutesRemaining <= 30).length,
    stations: active
  };
}

function authenticateRequest(request, pathname) {
  const requiresSession = pathname.startsWith("/api/")
    && pathname !== "/api/auth/login"
    && pathname !== "/api/dev/reset"
    && (request.method !== "GET" || pathname === "/api/export");
  if (!requiresSession) return null;

  const token = readBearerToken(request.headers.authorization);
  if (!token) throw new HttpError(401, "Missing session token");

  const session = sessions.get(token);
  if (!session) throw new HttpError(401, "Invalid session token");
  if (Date.parse(session.expiresAt) <= Date.now()) {
    sessions.delete(token);
    throw new HttpError(401, "Expired session token");
  }
  return session;
}

function readBearerToken(header) {
  if (!header) return "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token ?? "" : "";
}

function requirePermission(actor, permission) {
  const station = state.stations.find((item) => item.email === actor);
  if (!station) throw new HttpError(403, "Unknown station actor");
  const permissions = getPermissions(station);
  if (!permissions[permission]) throw new HttpError(403, `Station lacks ${permission}`);
}

async function loadState() {
  const seed = createSeedState();
  try {
    const persisted = JSON.parse(await readFile(DATA_PATH, "utf8"));
    return migratePersistedState({
      ...seed,
      ...persisted,
      stations: persisted.stations ?? seed.stations,
      messages: persisted.messages ?? seed.messages,
      reports: persisted.reports ?? seed.reports,
      approvals: persisted.approvals ?? seed.approvals,
      tasks: persisted.tasks ?? seed.tasks,
      policies: persisted.policies ?? seed.policies,
      calendarEvents: persisted.calendarEvents ?? seed.calendarEvents,
      personnel: persisted.personnel ?? seed.personnel,
      escalations: persisted.escalations ?? seed.escalations,
      transfers: persisted.transfers ?? seed.transfers,
      offices: persisted.offices ?? seed.offices,
      documents: persisted.documents ?? seed.documents,
      aiDrafts: persisted.aiDrafts?.length ? persisted.aiDrafts : seed.aiDrafts,
      audit: persisted.audit ?? seed.audit,
      events: persisted.events ?? seed.events,
      offlineQueue: persisted.offlineQueue ?? seed.offlineQueue
    });
  } catch (error) {
    if (error.code !== "ENOENT") console.warn(`Unable to load persisted state: ${error.message}`);
    return seed;
  }
}

function migratePersistedState(loadedState) {
  const migratedState = JSON.parse(JSON.stringify(loadedState).replaceAll("@rmi.org", "@rmvi.org"));
  for (const station of migratedState.stations) station.email = normalizeStationEmail(station.email);
  for (const office of migratedState.offices) office.email = normalizeStationEmail(office.email);
  const seenStationEmails = new Set();
  migratedState.stations = migratedState.stations.filter((station) => {
    if (seenStationEmails.has(station.email)) return false;
    seenStationEmails.add(station.email);
    return true;
  });
  return migratedState;
}

async function saveState() {
  await mkdir(dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

function findById(collection, id) {
  const item = collection.find((entry) => entry.id === id);
  if (!item) throw new HttpError(404, "Resource not found");
  return item;
}

function matchRoute(method, pathname) {
  const key = `${method} ${pathname}`;
  if (routes[key]) return { handler: routes[key], params: {}, pattern: key };
  for (const [pattern, handler] of Object.entries(routes)) {
    const [routeMethod, routePath] = pattern.split(" ");
    if (routeMethod !== method) continue;
    const params = matchParams(routePath, pathname);
    if (params) return { handler, params, pattern };
  }
  return null;
}

function matchParams(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const part = patternParts[index];
    if (part.startsWith(":")) {
      params[part.slice(1)] = pathParts[index];
    } else if (part !== pathParts[index]) {
      return null;
    }
  }
  return params;
}

async function readJson(request) {
  if (!["POST", "PUT", "PATCH"].includes(request.method ?? "")) return {};
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "Request body too large");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}

function send(response, payload) {
  response.writeHead(payload.status, {
    ...baseHeaders(),
    "content-type": "application/json"
  });
  response.end(payload.body === null ? "" : JSON.stringify(payload.body));
}

function baseHeaders() {
  return {
    "access-control-allow-origin": ALLOWED_ORIGIN,
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer"
  };
}

async function readWebAsset(pathname) {
  const root = resolve(WEB_DIST_PATH);
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const assetPath = resolve(root, relativePath);
  if (!assetPath.startsWith(root)) return null;

  try {
    return {
      status: 200,
      body: await readFile(assetPath),
      contentType: contentTypeFor(assetPath)
    };
  } catch (error) {
    if (extname(decodedPath) || error.code === "EACCES") return null;
    try {
      return {
        status: 200,
        body: await readFile(join(root, "index.html")),
        contentType: "text/html; charset=utf-8"
      };
    } catch {
      return null;
    }
  }
}

function sendRaw(response, payload) {
  response.writeHead(payload.status, {
    ...baseHeaders(),
    "content-type": payload.contentType,
    "cache-control": payload.contentType.startsWith("text/html") ? "no-cache" : "public, max-age=31536000, immutable"
  });
  response.end(payload.body);
}

function contentTypeFor(pathname) {
  const extension = extname(pathname);
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js") return "text/javascript; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".json" || extension === ".webmanifest") return "application/json; charset=utf-8";
  if (extension === ".png") return "image/png";
  if (extension === ".ico") return "image/x-icon";
  return "application/octet-stream";
}

function ok(body) {
  return { status: 200, body };
}

function createdResponse(body) {
  return { status: 201, body };
}

function conflict(body) {
  return { status: 409, body };
}

function unauthorized(body) {
  return { status: 401, body };
}

function notFound(body) {
  return { status: 404, body };
}

function serverError(body) {
  return { status: 500, body };
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
