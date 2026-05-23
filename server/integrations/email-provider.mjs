import { normalizeStationEmail } from "../domain.mjs";

export function createEmailProvider() {
  const provider = process.env.GCOS_EMAIL_PROVIDER ?? "log";
  const from = process.env.GCOS_EMAIL_FROM ?? "churchmail@rmvi.org";
  const replyTo = process.env.GCOS_EMAIL_REPLY_TO ?? from;
  const sendgridKey = process.env.GCOS_SENDGRID_API_KEY ?? "";
  const resendKey = process.env.GCOS_RESEND_API_KEY ?? "";

  function resolveRecipients(message, fallback = []) {
    const values = [
      message.to,
      message.recipient,
      message.routeTo,
      message.email,
      ...fallback
    ].filter(Boolean);
    return Array.from(new Set(values.flatMap((value) => String(value).split(/[,\s;]+/)).filter((value) => value.includes("@")).map(normalizeStationEmail)));
  }

  async function sendWithSendGrid({ to, subject, text, html }) {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        authorization: `Bearer ${sendgridKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: to.map((email) => ({ email })) }],
        from: { email: from, name: "RMVI GCOS ChurchMail" },
        reply_to: { email: replyTo },
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html ?? `<pre>${escapeHtml(text)}</pre>` }
        ]
      })
    });
    if (!response.ok) throw new Error(`SendGrid delivery failed: ${response.status} ${await response.text()}`);
    return { ok: true, provider: "sendgrid", messageId: response.headers.get("x-message-id") };
  }

  async function sendWithResend({ to, subject, text, html }) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from: `RMVI GCOS ChurchMail <${from}>`,
        reply_to: replyTo,
        to,
        subject,
        text,
        html
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Resend delivery failed: ${response.status} ${JSON.stringify(body)}`);
    return { ok: true, provider: "resend", messageId: body.id };
  }

  async function send(payload) {
    const to = Array.isArray(payload.to) ? payload.to : resolveRecipients(payload);
    if (!to.length) return { ok: false, provider, mode: "no-recipient" };
    const request = { ...payload, to };
    if (provider === "sendgrid" && sendgridKey) return sendWithSendGrid(request);
    if (provider === "resend" && resendKey) return sendWithResend(request);
    return {
      ok: provider === "log",
      provider,
      mode: provider === "log" ? "logged" : "provider-secret-missing",
      to,
      subject: payload.subject
    };
  }

  return {
    provider,
    status() {
      return {
        provider,
        from,
        replyTo,
        ready: provider === "log" || (provider === "sendgrid" && Boolean(sendgridKey)) || (provider === "resend" && Boolean(resendKey)),
        deliveryMode: provider === "log" ? "internal-log" : provider === "sendgrid" ? "sendgrid-api" : provider === "resend" ? "resend-api" : "unknown",
        domain: from.split("@")[1] ?? "rmvi.org",
        missing: provider === "resend" && !resendKey ? ["GCOS_RESEND_API_KEY"] : provider === "sendgrid" && !sendgridKey ? ["GCOS_SENDGRID_API_KEY"] : []
      };
    },
    async deliverChurchMail(message, fallbackRecipients = []) {
      const to = resolveRecipients(message, fallbackRecipients);
      const text = [
        `RMVI GCOS ChurchMail`,
        `Classification: ${message.kind}`,
        `Subject: ${message.subject}`,
        `From: ${message.from}`,
        `Status: ${message.status}`,
        `Attachments: ${message.files ?? "No attachments"}`,
        "",
        "This message was generated from the official GCOS governance record."
      ].join("\n");
      return send({
        to,
        subject: `[GCOS ${message.kind}] ${message.subject}`,
        text,
        html: `<p><strong>RMVI GCOS ChurchMail</strong></p><p>${escapeHtml(message.subject)}</p><p>Status: ${escapeHtml(message.status)}</p>`
      });
    },
    async sendAccountActivated({ station, password, actor }) {
      const text = [
        "Your RMVI GCOS station account has been activated.",
        `Station: ${station.title ?? station.email}`,
        `Email: ${station.email}`,
        password ? `Temporary password: ${password}` : "Use the password assigned by your administrator.",
        `Approved by: ${actor ?? "RMVI GCOS administrator"}`,
        "",
        "Sign in at https://rmvi.org"
      ].join("\n");
      return send({
        to: [station.email],
        subject: "RMVI GCOS station account activated",
        text,
        html: `<p>Your RMVI GCOS station account has been activated.</p><p><strong>${escapeHtml(station.email)}</strong></p>`
      });
    },
    async sendTestEmail({ to, actor }) {
      return send({
        to: [to],
        subject: "RMVI GCOS ChurchMail delivery test",
        text: [
          "RMVI GCOS ChurchMail delivery test.",
          `Requested by: ${actor ?? "GCOS administrator"}`,
          `Provider: ${provider}`,
          `Time: ${new Date().toISOString()}`,
          "",
          "If you received this message, live ChurchMail email delivery is connected."
        ].join("\n"),
        html: `<p><strong>RMVI GCOS ChurchMail delivery test</strong></p><p>If you received this message, live ChurchMail email delivery is connected.</p>`
      });
    }
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
