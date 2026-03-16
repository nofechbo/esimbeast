import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/chatPrompt";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Rate limiting: max 10 messages per minute per IP
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

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "You're sending messages too quickly. Please wait a moment." });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required" });
  }

  if (messages.length > 20) {
    return res.status(400).json({ error: "Conversation is too long. Please start a new chat." });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.content && lastMessage.content.length > 500) {
    return res.status(400).json({ error: "Message is too long. Please keep it under 500 characters." });
  }

  try {
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
    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Failed to get response" });
  }
}
