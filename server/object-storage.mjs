import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function createObjectStorageAdapter({
  provider,
  vaultPath,
  r2AccountId,
  r2Bucket,
  r2AccessKeyId,
  r2SecretAccessKey
}) {
  const selected = String(provider ?? "filesystem").toLowerCase();
  if (selected === "filesystem") return createFilesystemObjectStorage({ vaultPath });
  if (selected === "r2" || selected === "cloudflare-r2") {
    return createR2ObjectStorage({ r2AccountId, r2Bucket, r2AccessKeyId, r2SecretAccessKey });
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
    }
  };
}
