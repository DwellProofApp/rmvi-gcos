# RMVI GCOS Firebase Deployment

This is the recommended Google launch path for `rmvi.org`.

## Target Architecture

```text
rmvi.org
  -> Firebase Hosting
  -> Cloud Run service: rmvi-gcos-api
  -> Node GCOS API + built React workstation
  -> Firestore record storage
  -> Firebase Storage object vault
```

Firebase Hosting gives RMVI a clean public web entry point. Cloud Run runs the GCOS server. Firestore stores the dynamic office-node database, users, ChurchMail records, reports, approvals, tasks, policies, transfers, audit rows, and workflow state. Firebase Storage stores uploaded PDFs, photos, signed documents, receipts, voice notes, and report evidence.

The browser does not write directly to Firestore or Firebase Storage yet. All data access goes through the GCOS API, and the server uses the Firebase Admin SDK. That keeps permissions centralized around station sessions and GCOS authority rules.

## One-Time Google Setup

1. Create a Firebase project, for example `rmvi-gcos`.
2. Enable Firestore in Native mode.
3. Enable Firebase Storage.
4. Enable Firebase Hosting.
5. Enable Cloud Run in the linked Google Cloud project.
6. Create or select a Cloud Run service account with Firestore and Storage access.
7. Connect `rmvi.org` in Firebase Hosting after the first deploy.

## Cloud Run API Deploy

From the project root:

```bash
git pull origin main
npm run cloudrun:deploy
```

The helper above deploys the Cloud Run source build, sets the production Firebase/Firestore/Storage environment variables, stamps the API with the current Git commit, and runs the deployment alignment check.

Manual equivalent:

```bash
gcloud run deploy rmvi-gcos-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,GCOS_DOMAIN=rmvi.org,GCOS_DEPLOYMENT_TARGET=firebase,GCOS_STORAGE_PROVIDER=firestore,GCOS_FIREBASE_PROJECT_ID=rmvi-gcos,GCOS_FIREBASE_NAMESPACE=production,GCOS_OBJECT_STORAGE_PROVIDER=firebase-storage,GCOS_FIREBASE_STORAGE_BUCKET=rmvi-gcos.firebasestorage.app,GCOS_SERVE_WEB=1,GCOS_ALLOWED_ORIGIN=https://rmvi.org,GCOS_HEALTHCHECK_URL=https://rmvi.org,GCOS_ENABLE_DEV_RESET=0,GCOS_REQUIRE_API_AUTH=1,GCOS_MANAGED_RESTORE_DRILL=0
```

If the project uses the older Firebase Storage bucket format, use that bucket value instead, for example `rmvi-gcos.appspot.com`.

## Firebase Hosting Deploy

After Cloud Run exists:

```bash
npm run firebase:deploy
```

The `firebase.json` file routes `/api/**` and `/health` to the Cloud Run service, while every other URL serves the built GCOS web app.

## Local Firebase-Style Run

For local testing with a service account JSON:

```bash
cp .env.firebase.example .env.firebase
export GCOS_FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
npm run firebase:run
```

Cloud Run should use its attached service account instead of a downloaded JSON key.

## Production Verification

Run these before changing DNS:

```bash
npm run build
npm test
npm run production:check
npm run release:check
```

After the live site responds:

```bash
GCOS_HEALTHCHECK_URL=https://rmvi.org npm run launch:verify:live
```

## Firebase Security Position

Firestore and Storage rules are locked down by default. GCOS writes through the Admin SDK on the server, so public client reads and writes are disabled. User access stays controlled by GCOS station login, RBAC permissions, hierarchy routing, workflow rules, and audit logging.
