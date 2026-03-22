import Anthropic from "@anthropic-ai/sdk";
import { appendChatLogRow } from "@/lib/googleSheets";
import { SYSTEM_PROMPT } from "@/lib/chatPrompt";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const USER_MESSAGE_MAX_CHARS = 500;
const TOTAL_INPUT_MAX_CHARS = 30000;

// In-process rate limit (resets on deploy/restart, not shared across instances)
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;
const ipRequests = new Map();

let lastCleanup = Date.now();

function isRateLimited(ip) {
  const now = Date.now();

  // Prune stale entries periodically during request handling
  if (now - lastCleanup > 5 * 60 * 1000) {
    for (const [key, entry] of ipRequests) {
      if (now - entry.windowStart > RATE_WINDOW_MS) ipRequests.delete(key);
    }
    lastCleanup = now;
  }

  const entry = ipRequests.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    ipRequests.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Weak filter: rejects requests without a matching Origin/Referer (spoofable outside browsers)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  if (process.env.NODE_ENV !== "development" && siteUrl) {
    try {
      const originRaw = req.headers["origin"] || req.headers["referer"] || "";
      const origin = Array.isArray(originRaw) ? originRaw[0] : originRaw;
      const allowed = new URL(siteUrl).origin;
      const actual = new URL(origin).origin;
      if (actual !== allowed) {
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  // Best-effort IP: assumes Render appends the real client IP as the last XFF entry
  const xffRaw = req.headers["x-forwarded-for"];
  const xff = Array.isArray(xffRaw) ? xffRaw.join(",") : xffRaw;
  const ip = xff?.split(",").pop().trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "You're sending messages too quickly. Please wait a moment." });
  }

  const { messages, conversationId, pagePath } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required" });
  }

  if (messages.length > 20) {
    return res.status(400).json({ error: "Conversation is too long. Please start a new chat." });
  }

  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") {
      return res.status(400).json({ error: "Invalid message role." });
    }
    if (typeof m.content !== "string") {
      return res.status(400).json({ error: "Invalid message content." });
    }
  }

  const currentMessage = messages[messages.length - 1];
  if (currentMessage.role !== "user") {
    return res.status(400).json({ error: "Last message must be from the user." });
  }
  if (currentMessage.content.length > USER_MESSAGE_MAX_CHARS) {
    return res.status(400).json({ error: `Message is too long. Please keep it under ${USER_MESSAGE_MAX_CHARS} characters.` });
  }

  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > TOTAL_INPUT_MAX_CHARS) {
    return res.status(400).json({ error: "Conversation is too large. Please start a new chat." });
  }

  try {
    const startedAt = Date.now();
    const response = await client.messages.create({
      model: process.env.CHAT_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n\n") || "Sorry, I could not generate a response.";

    void appendChatLogRow({
        timestamp: new Date(startedAt).toISOString(),
        conversationId: typeof conversationId === "string" && conversationId.trim() ? conversationId.trim() : "unknown",
        pagePath: typeof pagePath === "string" && pagePath.trim() ? pagePath.trim() : "/",
        userMessage: currentMessage.content,
        assistantReply: text,
      }).catch((sheetError) => {
        console.error("Failed to append chat log row to Google Sheets:", sheetError);
      });

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Failed to get response" });
  }
}
