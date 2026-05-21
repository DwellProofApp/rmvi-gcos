import { cert, getApps, initializeApp } from "firebase-admin/app";

export function getFirebaseAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.GCOS_FIREBASE_PROJECT_ID
    ?? process.env.GOOGLE_CLOUD_PROJECT
    ?? process.env.GCLOUD_PROJECT
    ?? "";
  const storageBucket = process.env.GCOS_FIREBASE_STORAGE_BUCKET
    ?? process.env.FIREBASE_STORAGE_BUCKET
    ?? (projectId ? `${projectId}.firebasestorage.app` : undefined);
  const serviceAccountJson = process.env.GCOS_FIREBASE_SERVICE_ACCOUNT_JSON;

  const options = {
    projectId: projectId || undefined,
    storageBucket
  };

  if (serviceAccountJson) {
    options.credential = cert(JSON.parse(serviceAccountJson));
  }

  return initializeApp(options);
}

export function firebaseConfigured() {
  return Boolean(
    process.env.GCOS_FIREBASE_PROJECT_ID
    || process.env.GOOGLE_CLOUD_PROJECT
    || process.env.GCLOUD_PROJECT
    || process.env.GCOS_FIREBASE_SERVICE_ACCOUNT_JSON
  );
}
