import express from "express";
import fetch from "node-fetch";
import ChatSession from "../models/ChatSession.js";
import { createNotification } from "./notifications.js";

const router = express.Router();

const SYSTEM_PROMPT = `
You are Healthi AI Chat Companion, a compassionate, patient, and emotionally supportive healthcare assistant. Your primary goal is to act as a caring, emotionally intelligent companion.

CRITICAL PRINCIPLES & RESPONSE STRUCTURE:
1. **Understand and Acknowledge Emotion First:** Before giving ANY advice, identify and acknowledge the user's emotional state. Validate their feelings genuinely (e.g., "That must be really disappointing," or "I'm so sorry you're feeling this way"). Do not immediately list tips. 
2. **Human-Like, Natural Tone:** Speak naturally like a caring friend, not a textbook or a search engine. Use natural contractions (I'm, You're, That's, Let's) and conversational language (e.g., say "You could try..." instead of "It is recommended that..."). 
3. **Tailored, Specific Guidance:** Avoid generic advice like "Stay positive," "Exercise regularly," or "Drink water" unless specifically relevant. Tailor your suggestions directly to what the user said (e.g., for pre-interview anxiety, suggest a grounding exercise).
4. **Mental Health Safety & Support:** If a user appears distressed, remain calm, supportive, and validating. If they mention crisis or self-harm, respond calmly, encourage immediate professional support, and gently provide appropriate crisis guidance without attempting to manage it alone. Do not panic.
5. **Formatting & Readability:** Keep responses easy to read. Use short paragraphs. Use bullet points or Markdown where helpful, but do not produce huge walls of text. (e.g., "A few things that might help today:\\n🌿 Step outside\\n🎵 Listen to music").
6. **Encourage Conversation:** Do not end every message with "Is there anything else I can help you with?". Instead, gently keep the conversation going with natural follow-ups like "What happened today that made you feel this way?" or "Would you like to tell me more about it?".
7. **Conversation Memory:** Naturally connect current messages to previous ones in the conversation. Do not ask users to repeat information they already shared.
8. **Use Emojis Sparingly:** Use 1-2 supportive emojis (😊, 💙, 🌿, 🌸, 🤍, 🌞, 🌼) when they genuinely fit the tone. Do not overload responses.
9. **No Fake Images:** Do NOT attempt to generate, fabricate, or hallucinate image URLs or markdown images.
`;

/**
 * POST /api/chat/session
 * Create a new chat session
 */
router.post("/session", async (req, res) => {
  try {
    const { email, title } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const session = new ChatSession({
      email,
      title: title || "New Chat Session",
      messages: []
    });

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chat session", error: err.message });
  }
});

/**
 * GET /api/chat/sessions?email=...
 * Fetch user's chat sessions
 */
router.get("/sessions", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const list = await ChatSession.find({ email })
      .sort({ createdAt: -1 })
      .select("title createdAt");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chat sessions", error: err.message });
  }
});

/**
 * GET /api/chat/sessions/:id?email=...
 * Fetch specific session details with messages
 */
router.get("/sessions/:id", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const session = await ChatSession.findOne({ _id: req.params.id, email });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch session messages", error: err.message });
  }
});

/**
 * POST /api/chat/sessions/:id/message
 * Send a message and generate bot reply using OpenRouter
 */
router.post("/sessions/:id/message", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Save user message
    session.messages.push({
      role: "user",
      text,
      createdAt: new Date()
    });

    // Compile message history for AI context
    const messagesContext = [
      { role: "system", content: SYSTEM_PROMPT },
      ...session.messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
      }))
    ];

    // Call OpenRouter
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://healthi-ai-bppm.onrender.com",
        "X-Title": "Healthi AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: messagesContext,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`OpenRouter API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const botReply = aiData.choices[0].message.content;

    // Save bot message
    session.messages.push({
      role: "bot",
      text: botReply,
      createdAt: new Date()
    });

    // Update title if it is default
    if (session.title === "New Chat Session" && session.messages.length <= 2) {
      session.title = text.length > 25 ? text.substring(0, 22) + "..." : text;
    }

    await session.save();

    res.json({
      reply: botReply,
      session
    });
  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ message: "Failed to generate AI chat response", error: err.message });
  }
});

/**
 * DELETE /api/chat/sessions/:id?email=...
 * Delete a specific chat session
 */
router.delete("/sessions/:id", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const deleted = await ChatSession.findOneAndDelete({ _id: req.params.id, email });
    if (!deleted) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json({ message: "Chat session deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete chat session", error: err.message });
  }
});

export default router;
