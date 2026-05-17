# Replit Domain Setup For rmvi.org

Use this when connecting the GCOS web deployment to `rmvi.org` in Replit.

## Production Environment

```text
VITE_GCOS_API_BASE=
GCOS_HOST=0.0.0.0
GCOS_SERVE_WEB=1
GCOS_WEB_DIST_PATH=dist
GCOS_ALLOWED_ORIGIN=https://rmvi.org
GCOS_HEALTHCHECK_URL=https://rmvi.org
GCOS_ENABLE_DEV_RESET=0
GCOS_MAX_BODY_BYTES=1048576
```

Leave `VITE_GCOS_API_BASE` empty because the built web app and API are served from the same origin.

## Build And Start

```bash
npm install
npm run build
npm start
```

For Replit, this repo includes `.replit` and `replit.nix`.

Use this run command:

```bash
npm run replit:run
```

For a deployment command, use the same command:

```bash
npm run replit:run
```

The server will use `GCOS_API_PORT` if provided. If not, it will use the host platform `PORT`.

## Replit Secrets

Add these as Replit environment variables or Secrets:

```text
GCOS_HOST=0.0.0.0
GCOS_SERVE_WEB=1
GCOS_WEB_DIST_PATH=dist
GCOS_ALLOWED_ORIGIN=https://rmvi.org
GCOS_HEALTHCHECK_URL=https://rmvi.org
GCOS_ENABLE_DEV_RESET=0
GCOS_MAX_BODY_BYTES=1048576
```

Only set `VITE_GCOS_API_BASE` if the API is deployed on a different origin. For `rmvi.org`, leave it empty.

## Domain Verification

Current deployment state as of May 17, 2026:

- `rmvi.org` was removed from the unrelated Asset Manager / DwellProof Replit deployment.
- The GCOS source is published to `https://github.com/DwellProofApp/rmvi-gcos`.
- Replit imported the repository into a new `rmvi-gcos` project.
- The remaining step is to attach `rmvi.org` to the `rmvi-gcos` deployment in Replit and publish it.

1. Open the Replit `rmvi-gcos` project.
2. Run the app once and confirm Replit can build it.
3. Publish/deploy the app using `npm run replit:run`.
4. Open the deployment Domains panel.
5. Connect `rmvi.org` to this `rmvi-gcos` deployment.
6. In the DNS provider for `rmvi.org`, add the records Replit provides if Replit requests changes.
7. Wait until Replit changes the domain state from `Verifying` to active.
8. Open `https://rmvi.org`.
9. Run `GCOS_HEALTHCHECK_URL=https://rmvi.org npm run healthcheck`.
10. Run `npm run domain:check` for DNS plus GCOS endpoint verification.

## Launch Checks

- `https://rmvi.org/health` returns API health.
- `https://rmvi.org/api/status` returns workflow counts.
- `https://rmvi.org/manifest.webmanifest` loads.
- Login works with station credentials.
- ChurchMail, Reports, Approvals, Tasks, Policies, Calendar, Personnel, Archive, and Audit open from the sidebar.

If `npm run domain:check` reports that DNS is not ready, Replit is still waiting on DNS records or propagation.

If `rmvi.org` resolves but serves another app, remove `rmvi.org` from the other Replit deployment first, then attach it to this GCOS deployment. The correct GCOS checks are:

```text
https://rmvi.org/health      -> {"status":"ok","service":"gcos-api",...}
https://rmvi.org/api/status  -> JSON with GCOS workflow counts
https://rmvi.org/            -> GCOS - Global Church Operating System
```
