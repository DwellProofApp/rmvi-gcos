import { normalizeStationEmail } from "../domain.mjs";
import { getFirebaseAdminApp, firebaseConfigured } from "../firebase-admin.mjs";

export function createAuthProvider() {
  const provider = process.env.GCOS_AUTH_PROVIDER ?? "local";
  const firebaseReady = firebaseConfigured();
  const firebaseWebApiKey = process.env.GCOS_FIREBASE_WEB_API_KEY ?? process.env.FIREBASE_WEB_API_KEY ?? "";

  async function getAuth() {
    if (!firebaseReady) return null;
    const { getAuth } = await import("firebase-admin/auth");
    return getAuth(getFirebaseAdminApp());
  }

  async function findFirebaseUser(email) {
    const auth = await getAuth();
    if (!auth) return null;
    try {
      return await auth.getUserByEmail(normalizeStationEmail(email));
    } catch (error) {
      if (error?.code === "auth/user-not-found") return null;
      throw error;
    }
  }

  async function upsertFirebaseUser({ email, password, displayName, disabled = false, claims = {} }) {
    const normalizedEmail = normalizeStationEmail(email);
    const auth = await getAuth();
    if (!auth) return { ok: false, provider, mode: "firebase-unconfigured" };
    const existing = await findFirebaseUser(normalizedEmail);
    const payload = {
      email: normalizedEmail,
      emailVerified: true,
      displayName: displayName ?? normalizedEmail,
      disabled
    };
    if (password) payload.password = password;
    const user = existing
      ? await auth.updateUser(existing.uid, payload)
      : await auth.createUser(payload);
    if (Object.keys(claims).length) {
      await auth.setCustomUserClaims(user.uid, claims);
    }
    return { ok: true, provider: "firebase", uid: user.uid, email: user.email };
  }

  async function setFirebaseDisabled(email, disabled) {
    const user = await findFirebaseUser(email);
    if (!user) return { ok: false, provider: "firebase", mode: "user-not-found" };
    const auth = await getAuth();
    await auth.updateUser(user.uid, { disabled });
    return { ok: true, provider: "firebase", uid: user.uid, disabled };
  }

  async function signInWithFirebasePassword(email, password) {
    if (!firebaseWebApiKey) return { ok: false, provider: "firebase", mode: "web-api-key-missing" };
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseWebApiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: normalizeStationEmail(email),
        password: String(password ?? ""),
        returnSecureToken: true
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, provider: "firebase", error: body?.error?.message ?? "Firebase sign-in failed" };
    return {
      ok: true,
      provider: "firebase",
      uid: body.localId,
      idToken: body.idToken,
      refreshToken: body.refreshToken,
      expiresIn: body.expiresIn
    };
  }

  return {
    provider,
    status() {
      return {
        provider,
        firebaseConfigured: firebaseReady,
        passwordSignIn: provider === "firebase" && Boolean(firebaseWebApiKey),
        provisioning: provider === "firebase" && firebaseReady
      };
    },
    async verifyPassword(email, password) {
      if (provider !== "firebase") return { ok: false, provider, mode: "local-password" };
      return signInWithFirebasePassword(email, password);
    },
    async issueToken(email, claims = {}) {
      if (provider !== "firebase" || !firebaseReady) return null;
      try {
        const user = await findFirebaseUser(email);
        if (!user) return null;
        const auth = await getAuth();
        return await auth.createCustomToken(user.uid, claims);
      } catch {
        return null;
      }
    },
    async provisionStation(stationRecord, password, claims = {}) {
      if (provider !== "firebase") return { ok: false, provider, mode: "local-auth" };
      return upsertFirebaseUser({
        email: stationRecord.email,
        password,
        displayName: stationRecord.title ?? stationRecord.email,
        disabled: stationRecord.status === "Suspended",
        claims: {
          stationId: stationRecord.id,
          stationLevel: stationRecord.level,
          stationEmail: stationRecord.email,
          ...claims
        }
      });
    },
    async activateStation(stationRecord) {
      if (provider !== "firebase") return { ok: false, provider, mode: "local-auth" };
      return setFirebaseDisabled(stationRecord.email, false);
    },
    async suspendStation(stationRecord) {
      if (provider !== "firebase") return { ok: false, provider, mode: "local-auth" };
      return setFirebaseDisabled(stationRecord.email, true);
    },
    async setPassword(stationRecord, password) {
      if (provider !== "firebase") return { ok: false, provider, mode: "local-auth" };
      return upsertFirebaseUser({ email: stationRecord.email, password, displayName: stationRecord.title });
    }
  };
}
