# GCOS Deployment Checklist

Use this checklist when moving GCOS from local development to a hosted web deployment.

Production domain target: `rmvi.org`

## 1. Build Target

- Confirm web-only deployment path.
- Decide whether the API and web app will run from the same origin.
- If same-origin, leave `VITE_GCOS_API_BASE` empty for the production build.
- If separate origins, set `VITE_GCOS_API_BASE` to the public API URL.

## 2. Environment

Use `.env.production.example` as the production template.

```text
VITE_GCOS_API_BASE=
GCOS_API_PORT=8787
GCOS_HOST=0.0.0.0
GCOS_DATA_PATH=/var/lib/gcos/gcos-state.json
GCOS_SERVE_WEB=1
GCOS_WEB_DIST_PATH=dist
GCOS_HEALTHCHECK_URL=https://rmvi.org
GCOS_ALLOWED_ORIGIN=https://rmvi.org
GCOS_MAX_BODY_BYTES=1048576
GCOS_ENABLE_DEV_RESET=0
```

## 3. Build And Start

```bash
npm install
npm run build
npm start
```

Replit run/deployment command:

```bash
npm run replit:run
```

For a custom port:

```bash
GCOS_API_PORT=8080 npm start
```

## 4. Smoke Checks

Run:

```bash
npm run healthcheck
```

Expected checks:

- API health returns `ok`
- Bootstrap state returns station/workflow data
- Web shell returns the GCOS app

Manual checks:

- Open the public domain in a browser.
- Log in with a station account.
- Open ChurchMail, Reports, Approvals, Archive, and Audit.
- Confirm reset and refresh controls work.

## 5. Domain And TLS

- Point `rmvi.org` to the Replit deployment target.
- Complete the Replit custom-domain verification flow while the domain status shows `Verifying`.
- Enable HTTPS/TLS.
- Confirm service worker registration works over HTTPS.
- Confirm `manifest.webmanifest` loads from the domain.
- After verification, run the healthcheck with `GCOS_HEALTHCHECK_URL=https://rmvi.org`.

## 6. Persistence

Current scaffold persistence is JSON-based.

- Set `GCOS_DATA_PATH` to a durable server path.
- Make sure the runtime user can read/write that path.
- Back up the data path before resets.
- Replace JSON persistence with managed databases before high-volume production.

## 7. Production Hardening

Before real organizational rollout:

- Replace demo station passwords.
- Move sessions to durable server-side storage.
- Add password hashing and rotation.
- Add rate limits for login and mutations.
- Add database adapters for PostgreSQL, object storage, and audit retention.
- Disable or protect `/api/dev/reset`.
- Add production monitoring and backups.

## 8. Launch Signoff

- `npm test` passes.
- `npm run build` passes.
- `npm run healthcheck` passes against the public URL.
- Domain, HTTPS, PWA manifest, and service worker are verified.
- Admin users have station credentials.
- Data backup plan is confirmed.
