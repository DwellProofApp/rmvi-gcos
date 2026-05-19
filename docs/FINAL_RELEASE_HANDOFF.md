# RMVI GCOS Final Release Handoff

Target domain: `rmvi.org`

This build is ready for a controlled web MVP launch once the production host secrets are configured in Replit. It is not an App Store build; all users enter through the secure web sign-in portal.

## Completed Product Scope

- Professional Remedy Movement International sign-in portal.
- Station-based workstations for International, National, District, Local Branch, Finance, Audit, and Mission offices.
- ChurchMail governance inbox and official message workflows.
- Reporting center with 48 preloaded church report templates.
- Editable report detail workspace with section fields, prepared-by, attestation, checklist, evidence, review, packet, verify, and submit actions.
- Approval engine with signatures, delegation, holds, execution, archive records, and audit trail.
- Task, policy, calendar, personnel, transfer, escalation, hierarchy, office, archive, audit, security, evidence vault, and AI desk modules.
- File upload and object-vault linking for documents, evidence, and reports.
- JSON persistence, backup, restore drill, migration bundle, Postgres schema package, import dry run, and cutover checklist.
- Launch readiness, deployment plan, operations monitor, and launch signoff matrix.
- Production scripts for build, test, readiness, healthcheck, domain check, and final release check.
- Launch verification runner for local release gates and live `rmvi.org` smoke checks.

## Required Replit Secrets

Set these before public production launch:

```text
NODE_ENV=production
GCOS_DOMAIN=rmvi.org
GCOS_DEPLOYMENT_TARGET=replit
GCOS_SERVE_WEB=1
GCOS_ALLOWED_ORIGIN=https://rmvi.org
GCOS_HEALTHCHECK_URL=https://rmvi.org
GCOS_ENABLE_DEV_RESET=0
GCOS_REQUIRE_API_AUTH=1
GCOS_STORAGE_PROVIDER=database
GCOS_DATABASE_URL=<managed postgres connection string>
GCOS_DATABASE_SSL=1
GCOS_DATABASE_POOL_SIZE=5
GCOS_OBJECT_VAULT_PATH=<persistent object vault path>
GCOS_LOGIN_RATE_LIMIT=8
GCOS_LOGIN_RATE_WINDOW_MS=300000
GCOS_MUTATION_RATE_LIMIT=2000
GCOS_MUTATION_RATE_WINDOW_MS=60000
GCOS_MANAGED_RESTORE_DRILL=1
```

## Final Release Commands

Run locally before pushing a final deployment:

```bash
npm test
npm run build
npm run release:check
```

Run in the production environment after secrets are configured:

```bash
npm run production:check
npm run replit:run
GCOS_HEALTHCHECK_URL=https://rmvi.org npm run healthcheck
npm run domain:check
npm run launch:verify:live
```

## Production Acceptance Criteria

- `npm test` passes.
- `npm run build` passes.
- `npm run release:check` returns 100%.
- `npm run launch:verify` passes locally before deployment.
- `npm run production:check` returns at least 90%.
- `npm run launch:verify:live` passes from Replit after domain activation.
- `https://rmvi.org/health` returns `gcos-api`.
- `https://rmvi.org/api/status` reports workflow counts and production limits.
- `https://rmvi.org/api/bootstrap` requires an authenticated station session.
- `https://rmvi.org/` displays the RMVI GCOS sign-in portal.
- Audit workspace records backup manifest, restore drill, launch readiness, deployment plan, operations monitor, and launch signoff.

## Known Launch Boundary

The codebase is complete for a controlled web MVP and has the production readiness framework. Enterprise deployment still depends on real hosting operations: managed database provisioning, real station password rotation, production backups, domain DNS completion, and live smoke tests. Use `docs/PRODUCTION_INFRASTRUCTURE.md` as the launch infrastructure runbook.
