const nodemailer = require("nodemailer");

// Read config lazily so Vercel env vars / local .env both work.
function smtpConfig() {
  const user = process.env.SMTP_USER || "";
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    user,
    pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
    to: process.env.MAIL_TO || user,
    from: process.env.MAIL_FROM || `MJ web designs <${user}>`,
  };
}

let transport = null;
let transportKey = "";

function getTransport(cfg) {
  const key = [cfg.host, cfg.port, cfg.secure, cfg.user, cfg.pass].join("|");
  if (transport && transportKey === key) return transport;
  if (!cfg.user || !cfg.pass) {
    throw new Error("SMTP_USER / SMTP_PASS are not configured");
  }
  transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  transportKey = key;
  return transport;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmail({ name, phone, email, service, message }) {
  const text = [
    "New project enquiry",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "not provided"}`,
    `Service: ${service || "not specified"}`,
    "",
    "Project details:",
    message,
  ].join("\n");

  const row = (label, value) =>
    `<tr><td style="padding:10px 16px;border-bottom:1px solid #eee;color:#666;font:600 13px Arial,sans-serif;white-space:nowrap;vertical-align:top">${escapeHtml(
      label
    )}</td><td style="padding:10px 16px;border-bottom:1px solid #eee;color:#000;font:600 14px Arial,sans-serif">${escapeHtml(
      value
    )}</td></tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;background:#F1F2FF;padding:24px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#fff;border:3px solid #000">
    <tr><td style="background:#FFD60A;border-bottom:3px solid #000;padding:18px 20px;font:800 18px Arial,sans-serif;color:#000">New project enquiry</td></tr>
    <tr><td style="padding:8px 0 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Name", name)}
        ${row("Phone", phone)}
        ${row("Email", email || "not provided")}
        ${row("Service", service || "not specified")}
      </table>
    </td></tr>
    <tr><td style="padding:20px">
      <div style="font:600 13px Arial,sans-serif;color:#666;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Project details</div>
      <div style="font:14px/1.6 Arial,sans-serif;color:#000;white-space:pre-wrap">${escapeHtml(
        message
      )}</div>
    </td></tr>
    <tr><td style="background:#1F3BFF;color:#fff;padding:14px 20px;font:700 12px Arial,sans-serif">Sent from the MJ web designs website</td></tr>
  </table>
</body></html>`;

  return {
    subject: `New project enquiry from ${name}`,
    text,
    html,
    replyTo: email || undefined,
  };
}

/**
 * Validate the posted enquiry and email it.
 * Returns { status, body } so both the local dev server and the
 * Vercel serverless function can reuse it.
 */
async function sendEnquiry(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const name = String(input.name || "").trim();
  const phone = String(input.phone || "").trim();
  const email = String(input.email || "").trim();
  const service = String(input.service || "").trim();
  const message = String(input.message || "").trim();
  const honeypot = String(input.company || "").trim();

  if (honeypot) return { status: 200, body: { ok: true } };
  if (!name || !phone || !message) {
    return { status: 400, body: { ok: false, error: "Name, phone and message are required." } };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, body: { ok: false, error: "Please enter a valid email address." } };
  }

  try {
    const cfg = smtpConfig();
    const mail = buildEmail({ name, phone, email, service, message });
    await getTransport(cfg).sendMail({
      from: cfg.from,
      to: cfg.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return { status: 200, body: { ok: true } };
  } catch (err) {
    console.error("Enquiry email failed:", err.message);
    return { status: 502, body: { ok: false, error: "Could not send the enquiry email." } };
  }
}

module.exports = { sendEnquiry, smtpConfig, escapeHtml };
