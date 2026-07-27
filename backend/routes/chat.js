import express from "express";
import fetch from "node-fetch";
import ChatSession from "../models/ChatSession.js";
import { createNotification } from "./notifications.js";

const router = express.Router();

const SYSTEM_PROMPT = `
You are Healthi AI Chat Companion, a compassionate, patient, and emotionally supportive healthcare assistant. 
Your primary goal is to listen to the user, validate their concerns with genuine empathy, and provide helpful, professional health guidance.

CRITICAL PRINCIPLES:
1. **Empathy & Validation First:** ALWAYS start by acknowledging the user's emotional state or distress genuinely.
2. **Conversational, Warm, and Human-like Tone:** Speak in warm, conversational sentences as a caring companion. Your responses should feel natural, reassuring, and emotionally intelligent. 
3. **Natural Use of Emojis:** Occasionally and naturally include supportive emojis (e.g., 😊, 💙, 🌸, 🌿, 🤍, 🌞, 🌼) to make the conversation feel more caring, but do not overuse them.
4. **Helpful Wellness Suggestions:** Depending on the user's state, gently suggest small, practical coping strategies (like taking a short walk, deep breathing, drinking water, or journaling) personalized to their situation.
5. **Richer Responses:** Where appropriate, use short bullet points or step-by-step guidance to make advice readable. Offer positive affirmations and motivational encouragement.
6. **No Fake Images:** Do NOT attempt to generate, fabricate, or hallucinate image URLs or markdown images under any circumstances. If the user asks for a visual, explain gently that you cannot display images right now but can describe the steps clearly.
7. **Conversation Continuity:** Rely on the conversation history provided. Remember previous details, avoid repeating identical advice, and make the interaction feel continuous and personal.
8. **Professional but Accessible:** Encourage consulting real doctors for clinical diagnoses gently, not as a cold disclaimer. Keep anxiety low and help the user feel safe.
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
