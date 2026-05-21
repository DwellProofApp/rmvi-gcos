import { createJsonStorageAdapter } from "./json-adapter.mjs";
import { createDatabaseStorageAdapter } from "./database-adapter.mjs";
import { createFirestoreStorageAdapter } from "./firestore-adapter.mjs";

export function createStorageAdapter({ provider, dataPath, databaseUrl }) {
  const selected = String(provider ?? "json").toLowerCase();
  if (selected === "json") return createJsonStorageAdapter({ dataPath });
  if (selected === "database") return createDatabaseStorageAdapter({ databaseUrl });
  if (selected === "firestore" || selected === "firebase") return createFirestoreStorageAdapter();
  throw new Error(`Unsupported GCOS_STORAGE_PROVIDER: ${provider}`);
}
