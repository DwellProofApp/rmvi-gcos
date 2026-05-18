# GCOS Platform

GCOS is a station-based governance operating system for hierarchical administration. This repo currently contains:

Production domain target: `rmvi.org`

- React/Vite workstation UI
- Native Node.js GCOS API scaffold
- Session-token authentication for protected API mutations
- Hashed station credentials, credential rotation, reset flags, MFA requirements, and lockout controls
- Request validation for API mutation payloads
- Document archive/object-vault metadata workflow
- Local object-vault file uploads with hashes, secure download, and document/evidence linking
- ChurchMail and report attachment vaulting
- Global workstation search across governance records
- Governance notification center for alerts and pending actions
- Live dashboard metrics computed from workflow state
- Command operations layer with ten live governance readiness cards
- Live API/web status indicator in the workstation top bar
- Report drafting workflow from the reporting center
- Approval request creation from the delegation engine
- Station Task Center with assignment, advancement, filtering, escalation, and audit recording
- Policy Registry with authority-gated publishing, station acknowledgement, filtering, and audit recording
- Governance Calendar with deadline scheduling, completion, escalation, filtering, and audit recording
- Personnel Directory with role registration, station assignment, transfer readiness, status updates, and audit recording
- Transfer creation from the transfer identity module
- Manual escalation creation from the escalation engine
- Audit ledger filtering and CSV packet export
- Office registry hierarchy filtering and summary metrics
- Archive vault filtering and storage summary metrics
- Live hierarchy graph metrics from station and office data
- AI source map for draft evidence and trust review
- Workstation refresh and demo data reset controls
- Deployment-ready frontend API base configuration
- Same-origin production serving for the built web app and API
- Operational status endpoint with workflow counts and runtime limits
- Persistence operations for JSON store status, backup, verification, and protected export
- Database migration planning and JSON-to-database bundle export
- Postgres schema planning and SQL package export
- Database import dry-run validation with ordered batches
- Database cutover checklist with go/no-go provider switch gates
- Live Postgres JSONB storage adapter for database-backed persistence
- Launch readiness scoring for MVP and production rollout gates
- Production readiness profile checker for the `rmvi.org` Replit launch
- Deployment healthcheck for API, operational status, bootstrap state, and web shell
- Configurable CORS, request body limits, and production reset protection
- Deployment checklist for hosting readiness
- Persistent browser prototype state
- In-memory backend domain resources
- Web install/PWA shell with service worker caching
- Operational summary document

## Run

```bash
npm run dev
npm run api
npm test
```

Production-style single process:

```bash
npm run build
npm start
```

`npm start` serves the built `dist` web app and the GCOS API from the same Node server.

Replit deployment for `rmvi.org`:

```bash
npm run replit:run
```

Deployment smoke check:

```bash
npm run healthcheck
npm run domain:check
npm run production:check
```

Frontend:

```text
http://127.0.0.1:5174/
```

API:

```text
http://127.0.0.1:8787/
```

Frontend API target:

```bash
cp .env.example .env
```

For single-process hosting, use `.env.production.example` as the production template.

```text
VITE_GCOS_API_BASE=http://127.0.0.1:8787
```

For production, set `VITE_GCOS_API_BASE` to the deployed GCOS API origin. If the API is served from the same origin as the web app, it can be left empty at build time.

The API server can serve the built web app when `GCOS_SERVE_WEB=1` is set. Override the static directory with `GCOS_WEB_DIST_PATH` if needed.

Deployment checklist:

```text
docs/DEPLOYMENT_CHECKLIST.md
docs/REPLIT_RMVI_DOMAIN.md
```

## Environment

```text
VITE_GCOS_API_BASE  Frontend API origin; leave empty for same-origin production serving
GCOS_API_PORT       API/web server port, defaults to 8787
GCOS_HOST           Bind host, use 127.0.0.1 locally and 0.0.0.0 on Replit/hosting
GCOS_STORAGE_PROVIDER Storage adapter, use json by default or database for Postgres JSONB
GCOS_DATABASE_URL   Postgres connection string used when GCOS_STORAGE_PROVIDER=database
GCOS_DATABASE_SSL   Set to 1 when the managed Postgres host requires SSL
GCOS_DATABASE_POOL_SIZE Max Postgres pool connections, defaults to 5
GCOS_DATA_PATH      JSON persistence path, defaults to data/gcos-state.json
GCOS_OBJECT_VAULT_PATH Local file vault directory, defaults beside GCOS_DATA_PATH
GCOS_SERVE_WEB      Set to 1 to serve the built web app from the API server
GCOS_WEB_DIST_PATH  Built web app directory, defaults to dist
GCOS_HEALTHCHECK_URL Base URL used by npm run healthcheck
GCOS_ALLOWED_ORIGIN CORS origin for browser access, defaults to *
GCOS_MAX_BODY_BYTES Maximum JSON request body size, defaults to 1048576
GCOS_ENABLE_DEV_RESET Set to 1 to allow POST /api/dev/reset in production
```

## Web-First Delivery

GCOS is currently built as a web platform for `rmvi.org`. The app includes:

- `public/manifest.webmanifest` for installable web app metadata
- `public/sw.js` for app shell and static asset caching
- Mobile-friendly browser access through the same workstation UI
- In-app install readiness status in the top bar

Native App Store or Google Play distribution is not required for the current build path.

For Replit custom-domain deployment, use `.env.production.example`, set the deployment host to `0.0.0.0`, keep same-origin API serving enabled with `GCOS_SERVE_WEB=1`, and verify `https://rmvi.org` after Replit finishes domain verification.

The API persists development state to:

```text
data/gcos-state.json
```

That file is ignored by git. To restore seeded demo data:

```bash
curl -X POST http://127.0.0.1:8787/api/dev/reset
```

## Demo Credentials

```text
international@gcos.org / gcos-global
np@rmvi.org / gcos-national
district_admin@rmvi.org / gcos-district
local_branch_017@gcos.org / gcos-local
```

## API Resources

```text
GET  /health
GET  /api/status
GET  /api/launch/readiness
POST /api/launch/readiness
GET  /api/persistence/status
POST /api/persistence/backup
POST /api/persistence/verify
GET  /api/persistence/export
GET  /api/persistence/migration-plan
POST /api/persistence/migration-export
GET  /api/persistence/schema-plan
POST /api/persistence/schema-export
GET  /api/persistence/import-dry-run
POST /api/persistence/import-dry-run
GET  /api/persistence/cutover-checklist
POST /api/persistence/cutover-checklist
GET  /api/files
POST /api/files/upload
GET  /api/files/:id/download
POST /api/documents/:id/file
POST /api/evidence-vault/:id/file
GET  /api/bootstrap
POST /api/dev/reset
POST /api/auth/login
GET  /api/station-auth
GET  /api/station-auth/digest
POST /api/stations/:id/credential/rotate
POST /api/stations/:id/credential/reset
POST /api/stations/:id/credential/mfa
POST /api/stations/:id/credential/lock
POST /api/stations/:id/credential/unlock

GET  /api/stations
GET  /api/messages
POST /api/messages
GET  /api/reports
POST /api/reports
POST /api/reports/:id/submit
GET  /api/approvals
POST /api/approvals
POST /api/approvals/:id/approve
GET  /api/tasks
POST /api/tasks
POST /api/tasks/:id/advance
GET  /api/policies
POST /api/policies
POST /api/policies/:id/acknowledge
GET  /api/calendar-events
POST /api/calendar-events
POST /api/calendar-events/:id/complete
GET  /api/personnel
POST /api/personnel
POST /api/personnel/:id/status
GET  /api/escalations
POST /api/escalations
POST /api/escalations/:id/route
POST /api/escalations/:id/resolve
GET  /api/offices
POST /api/offices
GET  /api/transfers
POST /api/transfers
POST /api/transfers/:id/execute
GET  /api/documents
POST /api/documents
GET  /api/audit
GET  /api/events
GET  /api/ai-drafts
POST /api/ai-drafts
POST /api/offline-sync
```

Protected API mutations require the login token:

```bash
curl -X POST http://127.0.0.1:8787/api/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"np@rmvi.org","password":"gcos-national"}'

curl -X POST http://127.0.0.1:8787/api/approvals/app-001/approve \
  -H "content-type: application/json" \
  -H "authorization: Bearer <token>" \
  -d '{}'
```

## Backend Layout

```text
server/index.mjs   API server, routing, persistence boundary
server/domain.mjs  Domain factories, seed state, station permissions
server/services.mjs Workflow and service actions for API resources
server/validation.mjs Request validation for API mutation payloads
```

## Next Build Milestones

## Tests

The current API test suite covers:

- Health endpoint
- Operational status endpoint with counts, runtime limits, and configured CORS
- Same-origin web shell, static asset, and SPA fallback serving
- Successful and failed station login
- Session-token enforcement for protected mutations
- Request validation, malformed JSON handling, and request body size limits
- ChurchMail creation
- Report submission
- Report creation and validation
- Approval execution
- Approval request creation and validation
- Task creation, advancement, validation, persistence, and audit recording
- Policy publishing, acknowledgement, permission denial, validation, persistence, and audit recording
- Calendar event creation, completion, validation, persistence, status counts, and audit recording
- Personnel registration, status updates, permission denial, validation, persistence, and audit recording
- Escalation creation, routing, and resolution
- Office creation and duplicate conflict handling
- Station provisioning after office creation
- Backend permission denials for unauthorized stations
- Transfer execution
- Transfer creation, permission denial, and validation
- Document archive registration and persistence
- ChurchMail/report attachment vault actions
- AI draft generation
- Offline sync
- Audit recording
- JSON persistence across API restart
- Development reset endpoint and production reset lockout

## Next Build Milestones

1. Add production session storage and token rotation.
2. Add frontend component tests for the workstation modules.
3. Add specialized MongoDB, Neo4j, Redis, and object storage adapters.
4. Add binary file upload adapters for ChurchMail/report attachments.
