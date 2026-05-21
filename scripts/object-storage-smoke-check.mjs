import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createObjectStorageAdapter } from "../server/object-storage.mjs";

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const provider = process.env.GCOS_OBJECT_STORAGE_PROVIDER ?? "filesystem";
const vaultPath = process.env.GCOS_OBJECT_VAULT_PATH ?? join(ROOT_DIR, "data", "object-vault");

const objectStorage = createObjectStorageAdapter({
  provider,
  vaultPath,
  r2AccountId: process.env.GCOS_R2_ACCOUNT_ID,
  r2Bucket: process.env.GCOS_R2_BUCKET,
  r2AccessKeyId: process.env.GCOS_R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.GCOS_R2_SECRET_ACCESS_KEY,
  s3Bucket: process.env.GCOS_S3_BUCKET,
  awsRegion: process.env.GCOS_AWS_REGION ?? process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  firebaseStorageBucket: process.env.GCOS_FIREBASE_STORAGE_BUCKET ?? process.env.FIREBASE_STORAGE_BUCKET
});

const smoke = await objectStorage.smokeCheck({ actor: "object-storage-smoke-check" });

if (smoke.status !== "passed") {
  console.error(`GCOS object storage smoke check ${smoke.status}: ${smoke.nextAction}`);
  for (const check of smoke.checks) {
    console.error(`- ${check.name}: ${check.ok ? "ok" : "failed"} - ${check.detail}`);
  }
  process.exit(1);
}

console.log(`GCOS object storage smoke check passed. ${smoke.provider} ${smoke.mode} at ${smoke.location}`);
