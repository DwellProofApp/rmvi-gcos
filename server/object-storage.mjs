import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function createObjectStorageAdapter({
  provider,
  vaultPath,
  r2AccountId,
  r2Bucket,
  r2AccessKeyId,
  r2SecretAccessKey,
  s3Bucket,
  awsRegion,
  awsAccessKeyId,
  awsSecretAccessKey
}) {
  const selected = String(provider ?? "filesystem").toLowerCase();
  if (selected === "filesystem") return createFilesystemObjectStorage({ vaultPath });
  if (selected === "r2" || selected === "cloudflare-r2") {
    return createR2ObjectStorage({ r2AccountId, r2Bucket, r2AccessKeyId, r2SecretAccessKey });
  }
  if (selected === "s3" || selected === "aws-s3") {
    return createS3ObjectStorage({ s3Bucket, awsRegion, awsAccessKeyId, awsSecretAccessKey });
  }
  throw new Error(`Unsupported GCOS_OBJECT_STORAGE_PROVIDER: ${provider}`);
}

function createFilesystemObjectStorage({ vaultPath }) {
  const root = resolve(vaultPath);
  return {
    provider: "filesystem",
    mode: "server-object-vault",
    location: root,
    configured: Boolean(root),

    async putObject({ key, body }) {
      const diskPath = resolve(root, key);
      if (!diskPath.startsWith(root)) throw new Error("Invalid object key");
      await mkdir(dirname(diskPath), { recursive: true });
      await writeFile(diskPath, body);
      return { storagePath: diskPath };
    },

    async getObject({ key, storagePath }) {
      const diskPath = storagePath ? resolve(storagePath) : resolve(root, key);
      if (!diskPath.startsWith(root)) throw new Error("Invalid object key");
      return readFile(diskPath);
    },

    async deleteObject({ key, storagePath }) {
      const diskPath = storagePath ? resolve(storagePath) : resolve(root, key);
      if (!diskPath.startsWith(root)) throw new Error("Invalid object key");
      await rm(diskPath, { force: true });
    },

    async smokeCheck({ actor } = {}) {
      return smokeObjectStorage(this, { actor });
    }
  };
}

function createR2ObjectStorage({ r2AccountId, r2Bucket, r2AccessKeyId, r2SecretAccessKey }) {
  const configured = Boolean(r2AccountId && r2Bucket && r2AccessKeyId && r2SecretAccessKey);
  const endpoint = r2AccountId ? `https://${r2AccountId}.r2.cloudflarestorage.com` : "";
  let client = null;

  function getClient() {
    if (!configured) throw new Error("Cloudflare R2 is not configured");
    if (!client) {
      client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey
        }
      });
    }
    return client;
  }

  return {
    provider: "cloudflare-r2",
    mode: "s3-compatible-object-storage",
    location: configured ? `${endpoint}/${r2Bucket}` : "Cloudflare R2 not configured",
    configured,

    async putObject({ key, body, contentType }) {
      await getClient().send(new PutObjectCommand({
        Bucket: r2Bucket,
        Key: key,
        Body: body,
        ContentType: contentType
      }));
      return { storagePath: `r2://${r2Bucket}/${key}` };
    },

    async getObject({ key }) {
      const response = await getClient().send(new GetObjectCommand({
        Bucket: r2Bucket,
        Key: key
      }));
      return Buffer.from(await response.Body.transformToByteArray());
    },

    async deleteObject({ key }) {
      await getClient().send(new DeleteObjectCommand({
        Bucket: r2Bucket,
        Key: key
      }));
    },

    async smokeCheck({ actor } = {}) {
      return smokeObjectStorage(this, { actor });
    }
  };
}

function createS3ObjectStorage({ s3Bucket, awsRegion, awsAccessKeyId, awsSecretAccessKey }) {
  const configured = Boolean(s3Bucket && awsRegion);
  let client = null;

  function getClient() {
    if (!configured) throw new Error("AWS S3 object storage is not configured");
    if (!client) {
      const clientConfig = { region: awsRegion };
      if (awsAccessKeyId && awsSecretAccessKey) {
        clientConfig.credentials = {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey
        };
      }
      client = new S3Client(clientConfig);
    }
    return client;
  }

  return {
    provider: "aws-s3",
    mode: "s3-object-storage",
    location: configured ? `s3://${s3Bucket}` : "AWS S3 not configured",
    configured,

    async putObject({ key, body, contentType }) {
      await getClient().send(new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        Body: body,
        ContentType: contentType
      }));
      return { storagePath: `s3://${s3Bucket}/${key}` };
    },

    async getObject({ key }) {
      const response = await getClient().send(new GetObjectCommand({
        Bucket: s3Bucket,
        Key: key
      }));
      return Buffer.from(await response.Body.transformToByteArray());
    },

    async deleteObject({ key }) {
      await getClient().send(new DeleteObjectCommand({
        Bucket: s3Bucket,
        Key: key
      }));
    },

    async smokeCheck({ actor } = {}) {
      return smokeObjectStorage(this, { actor });
    }
  };
}

async function smokeObjectStorage(adapter, { actor } = {}) {
  const generatedAt = new Date().toISOString();
  const base = {
    generatedAt,
    generatedBy: actor ?? "system",
    provider: adapter.provider,
    mode: adapter.mode,
    location: adapter.location,
    configured: adapter.configured,
    write: false,
    read: false,
    cleanup: false,
    checks: []
  };

  if (!adapter.configured) {
    return {
      ...base,
      status: "blocked",
      nextAction: "Configure durable object storage before launching file, evidence, image, and voice report workflows.",
      checks: [
        { name: "configured", ok: false, detail: `${adapter.provider} is not configured` }
      ]
    };
  }

  const key = `smoke/object-vault-smoke-${Date.now()}.txt`;
  const body = Buffer.from(`rmvi-gcos-object-smoke:${generatedAt}`);
  let stored = null;

  try {
    stored = await adapter.putObject({ key, body, contentType: "text/plain" });
    base.write = true;
    base.checks.push({
      name: "write",
      ok: true,
      detail: stored.storagePath ?? key
    });

    const downloaded = await adapter.getObject({ key, storagePath: stored.storagePath });
    base.read = Buffer.compare(Buffer.from(downloaded), body) === 0;
    base.checks.push({
      name: "read",
      ok: base.read,
      detail: base.read ? "Smoke object read back successfully" : "Smoke object content mismatch"
    });

    if (typeof adapter.deleteObject === "function") {
      await adapter.deleteObject({ key, storagePath: stored.storagePath });
      base.cleanup = true;
    }
    base.checks.push({
      name: "cleanup",
      ok: base.cleanup,
      detail: base.cleanup ? "Smoke object removed" : "Storage adapter does not support cleanup"
    });

    const passed = base.write && base.read && base.cleanup;
    return {
      ...base,
      status: passed ? "passed" : "failed",
      nextAction: passed
        ? "Object storage is ready for report packets, signed documents, media, and evidence files."
        : "Review the failed object storage checks before launch."
    };
  } catch (error) {
    base.checks.push({
      name: "object-storage-smoke",
      ok: false,
      detail: error.message
    });
    return {
      ...base,
      status: "failed",
      error: error.message,
      nextAction: "Fix object storage credentials, bucket access, or vault permissions, then rerun the smoke check."
    };
  }
}
