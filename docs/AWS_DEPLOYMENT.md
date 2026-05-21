# RMVI GCOS AWS Deployment

This is the AWS launch path for `rmvi.org` when moving GCOS from local/Replit hosting to AWS.

## Recommended AWS Architecture

```text
rmvi.org
  -> Route 53 / external DNS
  -> AWS App Runner service
  -> Node GCOS single-process server
  -> Built React web app served from dist
  -> Amazon RDS PostgreSQL
  -> Amazon S3 object vault
```

GCOS is already built as a single Node service that serves both the web app and API. For AWS, use App Runner first. It is simpler than ECS for the first production launch and still supports automatic deploys from GitHub.

## Required AWS Services

- App Runner service connected to `DwellProofApp/rmvi-gcos`
- RDS PostgreSQL instance
- S3 bucket named `rmvi-gcos-vault`
- IAM role or access keys with read/write/delete permissions for that S3 bucket
- TLS certificate for `rmvi.org` through App Runner custom domain verification

## App Runner Settings

Source:

```text
GitHub repository: DwellProofApp/rmvi-gcos
Branch: main
Runtime: Node.js
Build command: npm install && npm run build
Start command: npm run start:aws
Port: 8080
```

Environment variables should be copied from `.env.aws.example`, with real values for:

```text
GCOS_DATABASE_URL
GCOS_AWS_REGION
GCOS_S3_BUCKET
```

If App Runner uses an instance role for S3 access, do not set AWS access keys. If using access keys, set them as App Runner secrets:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

## RDS PostgreSQL

Set:

```text
GCOS_STORAGE_PROVIDER=database
GCOS_DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
GCOS_DATABASE_SSL=1
```

Run the production readiness check after secrets are configured:

```bash
npm run production:check
```

## S3 Object Vault

Set:

```text
GCOS_OBJECT_STORAGE_PROVIDER=aws-s3
GCOS_AWS_REGION=us-east-1
GCOS_S3_BUCKET=rmvi-gcos-vault
```

Then run:

```bash
npm run object:smoke
```

## DNS And Live Verification

After App Runner creates the custom-domain target, point `rmvi.org` to AWS and verify TLS. Then run:

```bash
GCOS_HEALTHCHECK_URL=https://rmvi.org npm run healthcheck
GCOS_HEALTHCHECK_URL=https://rmvi.org npm run launch:verify:live
```

## Current Local Status

This workspace can prepare and push the repository to GitHub, but it cannot create AWS resources until AWS CLI credentials or AWS console access are configured.

The code now includes:

- `npm run start:aws`
- `npm run aws:run`
- `.env.aws.example`
- S3 object vault support through `GCOS_OBJECT_STORAGE_PROVIDER=aws-s3`

