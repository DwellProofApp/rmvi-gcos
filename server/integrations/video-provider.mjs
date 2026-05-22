export function createVideoProvider() {
  const provider = process.env.GCOS_VIDEO_PROVIDER ?? "jitsi";
  const jitsiDomain = process.env.GCOS_JITSI_DOMAIN ?? "meet.jit.si";
  const dailyKey = process.env.GCOS_DAILY_API_KEY ?? "";
  const dailyDomain = process.env.GCOS_DAILY_DOMAIN ?? "";

  function slug(value) {
    return String(value ?? "gcos-session")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "gcos-session";
  }

  async function createDailyRoom(session) {
    const name = `rmvi-${slug(session.title)}-${Date.now().toString(36)}`;
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        authorization: `Bearer ${dailyKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name,
        privacy: "private",
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
        }
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Daily room creation failed: ${response.status} ${JSON.stringify(body)}`);
    return {
      provider: "daily",
      roomName: body.name ?? name,
      joinUrl: body.url ?? (dailyDomain ? `https://${dailyDomain}/${name}` : ""),
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000).toISOString()
    };
  }

  return {
    provider,
    status() {
      return {
        provider,
        ready: provider === "jitsi" || provider === "internal" || (provider === "daily" && Boolean(dailyKey)),
        realtime: provider === "daily" ? "provider-room" : provider === "jitsi" ? "external-room-link" : "internal-record"
      };
    },
    async createRoom(session) {
      if (provider === "daily" && dailyKey) return createDailyRoom(session);
      if (provider === "jitsi") {
        const roomName = `rmvi-gcos-${slug(session.title)}-${session.id?.slice(0, 8) ?? Date.now().toString(36)}`;
        return {
          provider: "jitsi",
          roomName,
          joinUrl: `https://${jitsiDomain}/${roomName}`,
          expiresAt: null
        };
      }
      return {
        provider: "internal",
        roomName: session.id,
        joinUrl: `/app?section=Live+Comms&session=${encodeURIComponent(session.id)}`,
        expiresAt: null
      };
    }
  };
}
