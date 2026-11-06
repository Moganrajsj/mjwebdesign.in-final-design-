const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

// Minimal .env loader so `npm run dev` picks up SMTP settings without extra flags.
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}
loadEnv(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false") === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
const MAIL_TO = process.env.MAIL_TO || SMTP_USER;
const MAIL_FROM = process.env.MAIL_FROM || `MJ web designs <${SMTP_USER}>`;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), "application/json; charset=utf-8");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readJsonBody(req, limit = 100 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// Simple in-memory throttle: 5 enquiries per IP per 10 minutes.
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
function allowed(ip) {
  const now = Date.now();
  const entry = hits.get(ip) || [];
  const recent = entry.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch {
    throw new Error("nodemailer is not installed. Run: npm install");
  }
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_USER / SMTP_PASS are not set in .env");
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function handleEnquiry(req, res) {
  const ip = req.socket.remoteAddress || "unknown";
  if (!allowed(ip)) {
    return sendJson(res, 429, { ok: false, error: "Too many enquiries. Please try again later." });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { ok: false, error: err.message });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const service = String(body.service || "").trim();
  const message = String(body.message || "").trim();
  const company = String(body.company || "").trim(); // honeypot

  if (company) return sendJson(res, 200, { ok: true }); // silently drop bots
  if (!name || !phone || !message) {
    return sendJson(res, 400, { ok: false, error: "Name, phone and message are required." });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(res, 400, { ok: false, error: "Please enter a valid email address." });
  }

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

  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: email || undefined,
      subject: `New project enquiry from ${name}`,
      text,
      html,
    });
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error("Enquiry email failed:", err.message);
    return sendJson(res, 502, { ok: false, error: "Could not send the enquiry email." });
  }
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host || HOST}`).pathname);
  } catch {
    return send(res, 400, "Bad Request");
  }

  if (urlPath === "/api/enquiry") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJson(res, 405, { ok: false, error: "Use POST" });
    }
    return handleEnquiry(req, res);
  }

  // Resolve inside ROOT to prevent path traversal.
  let filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) return send(res, 403, "Forbidden");

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) return send(res, 404, "404 Not Found");
      const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      send(res, 200, data, type);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n  MJ Web Designs dev server running at:\n\n  http://${HOST}:${PORT}\n`);
  console.log("  Serving:", ROOT);
  console.log(
    `  Enquiry email: ${SMTP_USER ? `via ${SMTP_HOST}:${SMTP_PORT} to ${MAIL_TO}` : "NOT configured (set SMTP_USER/SMTP_PASS in .env)"}`
  );
  console.log("  Press Ctrl+C to stop.\n");
});
