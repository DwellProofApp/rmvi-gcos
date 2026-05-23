# RMVI GCOS Production Service Connections

GCOS now has provider adapters for the five production services needed before full church rollout.

## Authentication

Use Firebase Auth for real station identity.

Required environment:

```bash
GCOS_AUTH_PROVIDER=firebase
GCOS_FIREBASE_PROJECT_ID=rmvi-gcos
GCOS_FIREBASE_WEB_API_KEY=...
GCOS_AUTH_FALLBACK_LOCAL=0
```

When an administrator creates or activates a station, GCOS provisions the Firebase Auth user, enables the account, and syncs password resets. In production, keep `GCOS_AUTH_FALLBACK_LOCAL=0` so station sign-in must pass Firebase password sign-in.

## Permanent Database And Storage

Use Firestore for records and Firebase Storage for evidence/files.

```bash
GCOS_STORAGE_PROVIDER=firestore
GCOS_FIREBASE_NAMESPACE=production
GCOS_OBJECT_STORAGE_PROVIDER=firebase-storage
GCOS_FIREBASE_STORAGE_BUCKET=rmvi-gcos.firebasestorage.app
```

The existing Firestore adapter persists stations, offices, ChurchMail, reports, approvals, tasks, live sessions, audit logs, evidence, files, and auth credential metadata.

## RMVI Email

Use a verified `rmvi.org` sender through Resend or SendGrid.

```bash
GCOS_EMAIL_PROVIDER=resend
GCOS_EMAIL_FROM=churchmail@rmvi.org
GCOS_EMAIL_REPLY_TO=admin@rmvi.org
GCOS_RESEND_API_KEY=...
```

Alternative:

```bash
GCOS_EMAIL_PROVIDER=sendgrid
GCOS_SENDGRID_API_KEY=...
```

ChurchMail continues to create an internal permanent governance record. If the email provider is configured, the same message is also delivered externally and marked with provider delivery metadata.

## Video Calling

Use Jitsi room links immediately, or Daily for managed private video rooms.

```bash
GCOS_VIDEO_PROVIDER=jitsi
GCOS_JITSI_DOMAIN=meet.jit.si
```

Managed option:

```bash
GCOS_VIDEO_PROVIDER=daily
GCOS_DAILY_API_KEY=...
```

Every live session now receives provider metadata, room name, and join URL.

## Admin Approval Workflow

Admin approval now performs the production activation sequence:

1. Create office node and station record.
2. Provision/sync Firebase Auth user when enabled.
3. Activate or suspend provider identity with station status changes.
4. Rotate/reset passwords in both GCOS and Firebase Auth.
5. Send activation email through the configured `rmvi.org` email provider.
6. Preserve every action in the immutable audit/event stream.

## Verification

Use these endpoints after setting production secrets:

```bash
GET /api/integrations/readiness
GET /api/production/secrets-plan
GET /api/launch/readiness
POST /api/integrations/email/test
POST /api/files/object-smoke
POST /api/persistence/database-smoke
```

Run:

```bash
npm run build
npm test
GCOS_HEALTHCHECK_URL=https://rmvi.org npm run runtime:smoke
```
