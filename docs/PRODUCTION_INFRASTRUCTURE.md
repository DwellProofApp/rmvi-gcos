# RMVI GCOS Production Infrastructure

This runbook is the launch infrastructure checklist for `rmvi.org`.

## Target Architecture

```text
rmvi.org
  -> Replit Deployment: rmvi-gcos
  -> Node single-process server
  -> Built React web app served from dist
  -> GCOS API under same origin
  -> Managed Postgres persistence
  -> Cloudflare R2 object vault for uploaded files and evidence
```

GCOS remains web-first. Users enter through `https://rmvi.org`, then the sign-in portal loads the correct station workstation.

## AWS Path

The AWS launch path is documented in `docs/AWS_DEPLOYMENT.md`. Use AWS Elastic Beanstalk, Amazon RDS PostgreSQL, and Amazon S3 for the first AWS production deployment. App Runner is only an option if the AWS account already has access.

```bash
npm run aws:run
```

## Required Production Services

1. Replit production deployment for `rmvi-gcos`.
2. Custom domain `rmvi.org` attached to that deployment.
3. Managed Postgres database for users, reports, messages, workflows, approvals, audit rows, office hierarchy, and sessions.
4. Object vault storage for PDFs, photos, videos, voice notes, signed documents, and report evidence.
5. Production secrets configured from `.env.production.example`.
6. Backup and restore drill recorded from the GCOS Audit workspace.

## Replit Secrets

Set these in Replit Secrets, not in source code:

```text
NODE_ENV=production
GCOS_HOST=0.0.0.0
GCOS_DOMAIN=rmvi.org
GCOS_DEPLOYMENT_TARGET=replit
GCOS_SERVE_WEB=1
GCOS_WEB_DIST_PATH=dist
GCOS_ALLOWED_ORIGIN=https://rmvi.org
GCOS_HEALTHCHECK_URL=https://rmvi.org
GCOS_ENABLE_DEV_RESET=0
GCOS_REQUIRE_API_AUTH=1
GCOS_STORAGE_PROVIDER=database
GCOS_DATABASE_URL=<managed postgres connection string>
DATABASE_URL=<optional Replit Postgres fallback if GCOS_DATABASE_URL is not set>
GCOS_DATABASE_SSL=1
GCOS_DATABASE_POOL_SIZE=5
GCOS_OBJECT_STORAGE_PROVIDER=cloudflare-r2
GCOS_R2_ACCOUNT_ID=<cloudflare account id>
GCOS_R2_BUCKET=rmvi-gcos-vault
GCOS_R2_ACCESS_KEY_ID=<r2 access key id>
GCOS_R2_SECRET_ACCESS_KEY=<r2 secret access key>
GCOS_OBJECT_VAULT_PATH=<local fallback path>
GCOS_MAX_BODY_BYTES=1048576
GCOS_LOGIN_RATE_LIMIT=8
GCOS_LOGIN_RATE_WINDOW_MS=300000
GCOS_MUTATION_RATE_LIMIT=2000
GCOS_MUTATION_RATE_WINDOW_MS=60000
GCOS_MANAGED_RESTORE_DRILL=1
```

Leave `VITE_GCOS_API_BASE` empty for same-origin production serving.

## Database Launch

1. Create the managed Postgres database.
2. Put the connection string in `GCOS_DATABASE_URL`. If Replit provides `DATABASE_URL` automatically, GCOS will use that as a fallback.
3. Keep `GCOS_STORAGE_PROVIDER=database`.
4. Set `GCOS_DATABASE_SSL=1`.
5. Run `npm run production:check` in Replit.
6. Open GCOS Audit workspace and record:
   - backup manifest
   - restore drill
   - import dry run
   - cutover checklist

## Storage Architecture

Use two storage systems:

1. `Managed Postgres`
   - Stores all GCOS records: users, station accounts, permissions, ChurchMail metadata, reports, approvals, tasks, policies, transfers, offices, audit rows, and workflow state.
   - Use Replit Postgres first. GCOS accepts either `GCOS_DATABASE_URL` or Replit's standard `DATABASE_URL`.

2. `Cloudflare R2 Object Vault`
   - Stores uploaded files: report packets, PDFs, images, voice reports, videos, signed transfer letters, receipts, and evidence files.
   - For the Replit launch, set `GCOS_OBJECT_STORAGE_PROVIDER=cloudflare-r2` and add the R2 account ID, bucket, access key ID, and secret access key.
   - Keep `GCOS_OBJECT_VAULT_PATH=/var/lib/gcos/object-vault` as the local fallback for development.

## Object Vault Launch

Create a Cloudflare R2 bucket named `rmvi-gcos-vault`, then create an R2 API token with object read/write access for that bucket.

Set these Replit Secrets:

```text
GCOS_OBJECT_STORAGE_PROVIDER=cloudflare-r2
GCOS_R2_ACCOUNT_ID=<cloudflare account id>
GCOS_R2_BUCKET=rmvi-gcos-vault
GCOS_R2_ACCESS_KEY_ID=<r2 access key id>
GCOS_R2_SECRET_ACCESS_KEY=<r2 secret access key>
```

Uploaded documents, report evidence, and archive files will be stored in R2. GCOS stores file metadata, hashes, ownership, and audit links in Postgres.

## Verification Commands

Production secrets worksheet:

```bash
npm run secrets:plan
```

Local release gate:

```bash
npm run launch:verify
npm run preaws:check
npm run internal:audit
```

Live Replit/domain gate:

```bash
npm run launch:verify:live
```

The live command runs:

- final release check
- production build
- API/storage tests
- production environment profile
- `https://rmvi.org` healthcheck
- authenticated runtime smoke for station login, protected APIs, object storage, and session renewal
- DNS and domain ownership check

Every run writes a JSON report into `launch-reports/`. The folder is ignored by git because each launch report is environment-specific evidence.

`npm run secrets:plan` writes `launch-reports/production-secrets-plan.md` and `launch-reports/production-secrets-plan.json`. Use the Markdown file as the Replit Secrets checklist.

## Final Signoff

After `npm run launch:verify:live` passes:

1. Sign in to `https://rmvi.org`.
2. Open `Audit`.
3. Record launch readiness.
4. Record deployment plan.
5. Record operations monitor.
6. Record launch signoff.
7. Rotate demo station passwords before admitting real users.

## Launch Hold Conditions

Do not invite production users if any of these are true:

- `npm run launch:verify:live` fails.
- `npm run runtime:smoke` fails against the live deployment.
- `https://rmvi.org/health` does not return `gcos-api`.
- `https://rmvi.org/api/status` does not report GCOS workflow counts.
- `rmvi.org` serves another app.
- `GCOS_DATABASE_URL` is still a placeholder.
- Demo station passwords are still active for real offices.
- `GCOS_REQUIRE_API_AUTH` is not enabled.
- Backup manifest and restore drill are not recorded.
