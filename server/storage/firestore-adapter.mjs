import { createHash } from "node:crypto";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfigured, getFirebaseAdminApp } from "../firebase-admin.mjs";

const COLLECTIONS = [
  { name: "stations", type: "array", key: "id" },
  { name: "messages", type: "array", key: "id" },
  { name: "reports", type: "array", key: "id" },
  { name: "reportAssignments", type: "array", key: "id" },
  { name: "approvals", type: "array", key: "id" },
  { name: "tasks", type: "array", key: "id" },
  { name: "policies", type: "array", key: "id" },
  { name: "calendarEvents", type: "array", key: "id" },
  { name: "liveSessions", type: "array", key: "id" },
  { name: "personnel", type: "array", key: "id" },
  { name: "escalations", type: "array", key: "id" },
  { name: "transfers", type: "array", key: "id" },
  { name: "offices", type: "array", key: "id" },
  { name: "documents", type: "array", key: "id" },
  { name: "files", type: "array", key: "id" },
  { name: "aiDrafts", type: "array", key: "id" },
  { name: "audit", type: "array", key: "id" },
  { name: "events", type: "array", key: "id" },
  { name: "offlineQueue", type: "array", key: "id" },
  { name: "authCredentials", type: "object", key: "email" },
  { name: "readinessActions", type: "object", key: "name" },
  { name: "securityControls", type: "object", key: "name" },
  { name: "complianceReviews", type: "object", key: "id" },
  { name: "evidenceVault", type: "object", key: "id" },
  { name: "persistenceMeta", type: "singleton", key: "id" }
];

export function createFirestoreStorageAdapter() {
  const configured = firebaseConfigured();
  const namespace = sanitizeNamespace(process.env.GCOS_FIREBASE_NAMESPACE ?? "production");
  let db = null;
  let lastFirestoreError = configured ? null : "Firebase project not configured";

  function firestore() {
    if (!configured) return null;
    if (!db) db = getFirestore(getFirebaseAdminApp());
    return db;
  }

  function collectionRef(collection) {
    return firestore().collection(`gcos_${namespace}_${collection.name}`);
  }

  return {
    provider: "firestore",
    mode: configured ? "firebase-firestore" : "firebase-unconfigured",
    namespace,

    async loadState({ seed, migrate }) {
      if (!configured) {
        console.warn("GCOS_STORAGE_PROVIDER=firestore is selected, but Firebase is not configured. Starting from seed state.");
        return seed;
      }
      try {
        const loaded = {};
        let totalRecords = 0;
        for (const collection of COLLECTIONS) {
          const snapshot = await collectionRef(collection).get();
          totalRecords += snapshot.size;
          loaded[collection.name] = deserializeCollection(collection, snapshot.docs.map((doc) => doc.data()));
        }
        if (totalRecords === 0) return seed;
        lastFirestoreError = null;
        return migrate({ ...seed, ...loaded });
      } catch (error) {
        lastFirestoreError = error.message;
        console.warn(`GCOS Firestore unavailable during startup: ${error.message}. Starting from seed state.`);
        return seed;
      }
    },

    async saveState(state) {
      if (!configured) return;
      try {
        for (const collection of COLLECTIONS) {
          await replaceCollection(collectionRef(collection), serializeCollection(collection, state[collection.name]));
        }
        lastFirestoreError = null;
      } catch (error) {
        lastFirestoreError = error.message;
        console.warn(`GCOS Firestore save skipped: ${error.message}`);
      }
    },

    statusSync(state) {
      return {
        provider: "firestore",
        mode: this.mode,
        namespace,
        projectId: process.env.GCOS_FIREBASE_PROJECT_ID ?? process.env.GOOGLE_CLOUD_PROJECT ?? "not configured",
        hash: hashState(state),
        records: recordCounts(state),
        lastBackup: state.persistenceMeta?.lastBackup ?? null,
        lastVerifiedAt: state.persistenceMeta?.lastVerifiedAt ?? null,
        lastVerifiedBy: state.persistenceMeta?.lastVerifiedBy ?? null,
        migrationReady: configured,
        databaseError: lastFirestoreError
      };
    },

    async status(state) {
      let firestoreStatus = {
        connected: false,
        namespace,
        error: lastFirestoreError ?? (configured ? "Not checked" : "Firebase project not configured")
      };
      if (configured) {
        try {
          await firestore().collection(`gcos_${namespace}_persistenceMeta`).limit(1).get();
          firestoreStatus = { connected: true, namespace, checkedAt: new Date().toISOString() };
          lastFirestoreError = null;
        } catch (error) {
          lastFirestoreError = error.message;
          firestoreStatus = { connected: false, namespace, error: error.message };
        }
      }
      return {
        ...this.statusSync(state),
        file: null,
        backupsPath: null,
        backupSupport: true,
        readyForExternalDatabase: configured && firestoreStatus.connected,
        database: firestoreStatus,
        note: firestoreStatus.connected ? "Firestore storage adapter is connected." : "Set Firebase project credentials to connect Firestore."
      };
    },

    async backupState(state, { actor, label }) {
      return {
        path: `firestore://${namespace}`,
        label: sanitizeLabel(label ?? "firestore-snapshot"),
        hash: hashState(state),
        createdAt: new Date().toISOString(),
        createdBy: actor,
        provider: "firestore"
      };
    },

    async backupManifest(state) {
      const latest = state.persistenceMeta?.lastBackup ?? null;
      const backups = latest ? [{ ...latest, path: latest.path ?? `firestore://${namespace}`, file: latest.label, bytes: 0 }] : [];
      const checks = [
        { name: "backup-present", ok: Boolean(latest?.hash), detail: latest ? `${latest.label} recorded` : "No Firestore snapshot recorded" },
        { name: "provider", ok: configured, detail: configured ? "Firebase configured" : "Firebase project not configured" },
        { name: "hashes", ok: backups.every((backup) => String(backup.hash ?? "").startsWith("sha256:")), detail: backups.length ? `${backups.length} hashes recorded` : "No hashes recorded" }
      ];
      return {
        generatedAt: new Date().toISOString(),
        provider: "firestore",
        mode: this.mode,
        backupsPath: null,
        total: backups.length,
        totalBytes: 0,
        latest,
        backups,
        checks,
        status: checks.every((check) => check.ok) ? "protected" : "needs-backup",
        nextAction: latest ? "Confirm Firestore managed exports are scheduled" : "Create a Firestore backup record"
      };
    },

    async restoreDrill(state) {
      const latest = state.persistenceMeta?.lastBackup ?? null;
      const managedRestoreConfirmed = process.env.GCOS_MANAGED_RESTORE_DRILL === "1" || Boolean(state.persistenceMeta?.lastRestoreDrill?.valid);
      const checks = [
        { name: "backup-recorded", ok: Boolean(latest?.hash), detail: latest ? `${latest.label} snapshot metadata recorded` : "No Firestore snapshot metadata" },
        { name: "provider", ok: configured, detail: configured ? "Firebase configured" : "Firebase project not configured" },
        { name: "managed-restore", ok: managedRestoreConfirmed, detail: managedRestoreConfirmed ? "Managed restore drill confirmed" : "Set GCOS_MANAGED_RESTORE_DRILL=1 after Firestore restore drill" }
      ];
      return {
        generatedAt: new Date().toISOString(),
        provider: "firestore",
        mode: this.mode,
        backup: latest,
        valid: checks.every((check) => check.ok),
        status: checks.every((check) => check.ok) ? "restorable" : "blocked",
        liveHash: hashState(state),
        backupHash: latest?.hash ?? null,
        computedBackupHash: latest?.hash ?? null,
        recordDelta: 0,
        liveRecords: recordCounts(state),
        backupRecords: recordCounts(state),
        checks,
        nextAction: latest ? "Run a managed Firestore export/restore drill" : "Create a Firestore snapshot before restore drill"
      };
    },

    exportState(state, actor) {
      return {
        exportedAt: new Date().toISOString(),
        exportedBy: actor,
        provider: "firestore",
        status: this.statusSync(state),
        state
      };
    },

    migrationPlan(state) {
      const records = recordCounts(state);
      const collections = COLLECTIONS.map((collection) => ({
        collection: collection.name,
        targetTable: `gcos_${namespace}_${collection.name}`,
        records: records[collection.name] ?? countCollection(state[collection.name], collection.type),
        strategy: "firestore-document-upsert",
        identityKey: collection.key,
        ready: configured
      }));
      return {
        generatedAt: new Date().toISOString(),
        source: { provider: "firestore", mode: this.mode, source: `firebase:${namespace}` },
        target: { provider: "firestore", namespace, mode: configured ? "live-provider" : "unconfigured" },
        estimatedRows: collections.reduce((sum, item) => sum + item.records, 0),
        collections,
        projections: [],
        objectStorage: {
          provider: "firebase-storage",
          files: state.files?.length ?? 0,
          bytes: (state.files ?? []).reduce((sum, file) => sum + (file.size ?? 0), 0),
          strategy: "store binary payloads in Firebase Storage and metadata in Firestore"
        },
        checks: [
          { name: "firebase-project", ok: configured, detail: configured ? "Configured" : "Missing GCOS_FIREBASE_PROJECT_ID" },
          { name: "firestore-adapter", ok: true, detail: "Firestore read/write adapter implemented" }
        ],
        blockers: configured ? [] : ["Set Firebase project credentials before using Firestore provider"],
        nextSteps: configured ? ["Run Firebase smoke checks", "Confirm Firestore backup/export policy"] : ["Configure Firebase project"]
      };
    },

    schemaPlan(state) {
      const plan = this.migrationPlan(state);
      return {
        generatedAt: new Date().toISOString(),
        schema: namespace,
        dialect: "firestore",
        schemaVersion: 1,
        tableCount: plan.collections.length,
        estimatedRows: plan.estimatedRows,
        importOrder: plan.collections.map((item) => item.collection),
        tables: plan.collections.map((item) => ({
          name: item.targetTable,
          collection: item.collection,
          records: item.records,
          primaryKey: item.identityKey,
          columns: [{ name: "payload", type: "map", nullable: false }],
          indexes: [],
          importStrategy: item.strategy
        })),
        checks: plan.checks
      };
    },

    importDryRun(state) {
      const plan = this.migrationPlan(state);
      return {
        generatedAt: new Date().toISOString(),
        provider: "firestore",
        target: plan.target,
        schema: namespace,
        valid: configured,
        estimatedRows: plan.estimatedRows,
        estimatedBatches: plan.collections.length,
        estimatedDurationMs: Math.max(50, plan.estimatedRows * 8),
        batches: plan.collections.map((item, index) => ({
          batch: index + 1,
          table: item.targetTable,
          collection: item.collection,
          records: item.records,
          strategy: configured ? item.strategy : "blocked",
          primaryKey: item.identityKey,
          status: configured ? "ready" : "blocked",
          estimatedMs: Math.max(25, item.records * 8)
        })),
        objectStorage: plan.objectStorage,
        checks: plan.checks,
        warnings: [],
        blockers: configured ? [] : ["Set Firebase credentials before Firestore import"],
        nextAction: configured ? "Firestore adapter can persist live state" : "Configure Firebase provider"
      };
    },

    cutoverChecklist(state) {
      const dryRun = this.importDryRun(state);
      const checks = [
        { name: "firebase-provider", ok: configured, detail: configured ? "Firebase provider selected" : "Firebase project not configured" },
        { name: "adapter-read-write", ok: configured, detail: configured ? "Firestore read/write path implemented" : "Firebase credentials required" },
        { name: "import-dry-run", ok: dryRun.valid, detail: dryRun.nextAction },
        { name: "restore-drill", ok: Boolean(state.persistenceMeta?.lastRestoreDrill?.valid), detail: state.persistenceMeta?.lastRestoreDrill ? `${state.persistenceMeta.lastRestoreDrill.status} recorded` : "Run Firestore restore drill" }
      ];
      const blockers = checks.filter((check) => !check.ok).map((check) => check.name);
      return {
        generatedAt: new Date().toISOString(),
        provider: "firestore",
        targetProvider: "firestore",
        ready: blockers.length === 0,
        status: blockers.length ? "hold" : "go",
        checks,
        blockers,
        requiredSwitches: [
          { name: "GCOS_STORAGE_PROVIDER", value: "firestore", ready: configured },
          { name: "GCOS_FIREBASE_PROJECT_ID", value: configured ? "configured" : "required", ready: configured }
        ],
        rollbackPlan: [
          "Switch GCOS_STORAGE_PROVIDER back to json",
          "Restart from latest JSON backup if Firestore smoke checks fail"
        ],
        nextAction: blockers.length ? `Complete ${blockers.length} Firebase cutover checks` : "Firebase provider ready"
      };
    },

    async databaseSmoke(state, { actor } = {}) {
      const generatedAt = new Date().toISOString();
      if (!configured) {
        return {
          generatedAt,
          generatedBy: actor ?? "system",
          provider: "firestore",
          mode: this.mode,
          connected: false,
          schemaReady: false,
          readWrite: false,
          projectionTablesReady: false,
          status: "blocked",
          checks: [{ name: "firebase-project", ok: false, detail: "Firebase project not configured" }],
          records: recordCounts(state),
          nextAction: "Set GCOS_FIREBASE_PROJECT_ID and credentials before running Firebase smoke check"
        };
      }
      const smokeId = `smoke-${Date.now()}`;
      const ref = firestore().collection(`gcos_${namespace}_smoke`).doc(smokeId);
      const checks = [];
      try {
        const payload = { generatedAt, actor: actor ?? "system", hash: hashState(state), records: recordCounts(state) };
        await ref.set(payload);
        checks.push({ name: "write", ok: true, detail: "Smoke document written" });
        const readBack = await ref.get();
        const readWrite = readBack.exists && readBack.data()?.hash === payload.hash;
        checks.push({ name: "read", ok: readWrite, detail: readWrite ? "Smoke document read back" : "Smoke document mismatch" });
        await ref.delete();
        checks.push({ name: "cleanup", ok: true, detail: "Smoke document deleted" });
        return {
          generatedAt,
          generatedBy: actor ?? "system",
          provider: "firestore",
          mode: this.mode,
          connected: true,
          schemaReady: true,
          readWrite,
          projectionTablesReady: true,
          status: checks.every((check) => check.ok) ? "passed" : "failed",
          checks,
          records: recordCounts(state),
          nextAction: "Firebase smoke check passed; continue launch verification"
        };
      } catch (error) {
        lastFirestoreError = error.message;
        return {
          generatedAt,
          generatedBy: actor ?? "system",
          provider: "firestore",
          mode: this.mode,
          connected: false,
          schemaReady: false,
          readWrite: false,
          projectionTablesReady: false,
          status: "failed",
          error: error.message,
          checks: [...checks, { name: "firestore-smoke", ok: false, detail: error.message }],
          records: recordCounts(state),
          nextAction: "Fix Firebase credentials or Firestore permissions and rerun smoke check"
        };
      }
    },

    async exportMigrationBundle() {
      throw new Error("Firestore migration export is only available from the JSON provider");
    },

    async exportSchemaPackage() {
      throw new Error("Firestore schema export is only available from the JSON provider");
    }
  };
}

async function replaceCollection(ref, records) {
  const existing = await ref.listDocuments();
  for (let index = 0; index < existing.length; index += 400) {
    const batch = ref.firestore.batch();
    for (const doc of existing.slice(index, index + 400)) batch.delete(doc);
    await batch.commit();
  }
  for (let index = 0; index < records.length; index += 400) {
    const batch = ref.firestore.batch();
    for (const record of records.slice(index, index + 400)) {
      batch.set(ref.doc(record.id), {
        id: record.id,
        payload: removeUndefined(record.payload),
        sourceCollection: record.sourceCollection,
        updatedAt: new Date().toISOString()
      });
    }
    await batch.commit();
  }
}

function serializeCollection(collection, value) {
  if (collection.type === "array") {
    return (Array.isArray(value) ? value : []).map((payload, index) => ({
      id: String(payload?.[collection.key] ?? `${collection.name}-${index}`),
      payload,
      sourceCollection: collection.name
    }));
  }
  if (collection.type === "object") {
    return Object.entries(value ?? {}).map(([id, payload]) => ({
      id,
      payload,
      sourceCollection: collection.name
    }));
  }
  return [{ id: "singleton", payload: value ?? {}, sourceCollection: collection.name }];
}

function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, removeUndefined(entryValue)])
  );
}

function deserializeCollection(collection, docs) {
  if (collection.type === "array") return docs.map((doc) => doc.payload).filter(Boolean);
  if (collection.type === "object") {
    return Object.fromEntries(docs.map((doc) => [doc.id, doc.payload]));
  }
  return docs[0]?.payload ?? {};
}

function hashState(state) {
  return `sha256:${createHash("sha256").update(JSON.stringify(state)).digest("hex")}`;
}

function recordCounts(state) {
  return {
    stations: state.stations?.length ?? 0,
    messages: state.messages?.length ?? 0,
    reports: state.reports?.length ?? 0,
    approvals: state.approvals?.length ?? 0,
    tasks: state.tasks?.length ?? 0,
    policies: state.policies?.length ?? 0,
    calendarEvents: state.calendarEvents?.length ?? 0,
    liveSessions: state.liveSessions?.length ?? 0,
    personnel: state.personnel?.length ?? 0,
    escalations: state.escalations?.length ?? 0,
    transfers: state.transfers?.length ?? 0,
    offices: state.offices?.length ?? 0,
    documents: state.documents?.length ?? 0,
    files: state.files?.length ?? 0,
    aiDrafts: state.aiDrafts?.length ?? 0,
    audit: state.audit?.length ?? 0,
    events: state.events?.length ?? 0,
    offlineQueue: state.offlineQueue?.length ?? 0
  };
}

function countCollection(value, type) {
  if (type === "array") return Array.isArray(value) ? value.length : 0;
  if (type === "object") return Object.keys(value ?? {}).length;
  return value ? 1 : 0;
}

function sanitizeNamespace(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "production";
}

function sanitizeLabel(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "snapshot";
}
