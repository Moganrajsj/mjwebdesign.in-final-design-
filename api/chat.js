const { generateReply } = require("../lib/gemini-chat");

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;
const requestsByIp = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestsByIp.get(ip) || []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestsByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestsByIp.set(ip, recent);

  if (requestsByIp.size > 1000) {
    for (const [key, timestamps] of requestsByIp) {
      if (!timestamps.length || now - timestamps[timestamps.length - 1] >= WINDOW_MS) {
        requestsByIp.delete(key);
      }
    }
  }
  return false;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST" });
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > 20 * 1024) {
    return res.status(413).json({ error: "Message is too large." });
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "") ||
    req.socket && req.socket.remoteAddress || "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many messages. Please try again in a few minutes." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON." });
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Invalid request." });
  }

  const result = await generateReply(body);
  return res.status(result.status).json(result.body);
};
