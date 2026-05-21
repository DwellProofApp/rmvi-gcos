# RMVI GCOS AWS Deployment

This is the AWS launch path for `rmvi.org` when moving GCOS from local/Replit hosting to AWS.

## Recommended AWS Architecture

```text
rmvi.org
  -> Route 53 / external DNS
  -> AWS Elastic Beanstalk Node.js environment
  -> Node GCOS single-process server
  -> Built React web app served from dist
  -> Amazon RDS PostgreSQL
  -> Amazon S3 object vault
```

GCOS is already built as a single Node service that serves both the web app and API. Use Elastic Beanstalk first because it supports Node.js web applications, reads `package.json`, forwards traffic through the `PORT` environment variable, and remains available to new AWS customers.

## Required AWS Services

- Elastic Beanstalk application and Node.js environment
- RDS PostgreSQL instance
- S3 bucket named `rmvi-gcos-vault`
- IAM role or access keys with read/write/delete permissions for that S3 bucket
- TLS certificate for `rmvi.org`

## Elastic Beanstalk Settings

Create a Node.js Elastic Beanstalk environment, then deploy the repository source bundle from `main`.

```text
GitHub repository: DwellProofApp/rmvi-gcos
Branch: main
Platform: Node.js on Amazon Linux 2023
Start command: Procfile -> web: npm run aws:run
Port: 8080
```

Elastic Beanstalk sets `PORT`; `npm run start:aws` reads it and binds GCOS to `0.0.0.0`.

Environment variables should be copied from `.env.aws.example`, with real values for:

```text
GCOS_DATABASE_URL
GCOS_AWS_REGION
GCOS_S3_BUCKET
```

If the Elastic Beanstalk instance profile has S3 access, do not set AWS access keys. If using access keys, store them as environment properties or AWS Secrets Manager values:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

## App Runner Note

AWS documentation now states that App Runner is no longer open to new customers. If your AWS account already has App Runner access, the repo can still run with:

```text
Build command: npm install && npm run build
Start command: npm run start:aws
Port: 8080
Runtime: nodejs22
```

Otherwise use Elastic Beanstalk.

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
- `Procfile`
- S3 object vault support through `GCOS_OBJECT_STORAGE_PROVIDER=aws-s3`
