import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize OpenRouter via OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

/**
 * POST /api/mood/check
 * Body: { mood: "I feel anxious today", history: [] }
 */
router.post("/check", async (req, res) => {
  try {
    const { mood, history = [] } = req.body;

    if (!mood) {
      return res.status(400).json({ message: "Please express your mood" });
    }

    const chatHistory = history.map(h => `${h.role === 'user' ? 'User' : 'Companion'}: ${h.text}`).join('\n');
    const userMessage = mood;

    const completion = await client.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are a compassionate, warm, and empathetic AI Companion. Your sole purpose is to listen to the user, validate their feelings, and help them feel calmer, safer, and less alone.

Follow these strict conversational principles:
1. **Be Short and Conversational:** Never write walls of text. Keep your responses to 2 or 3 sentences maximum. This feels like a real, natural text conversation.
2. **Validate First:** Before offering any advice or perspective, explicitly validate their emotions (e.g., "That sounds incredibly exhausting," or "It makes total sense that you feel hurt by that"). 
3. **No Rigid Bullet Points or Lists:** Do not use structured lists, markdown asterisks (**), or hashtags. Speak in soft, flowing, human-like sentences.
4. **Ask Gentle, Open-Ended Questions:** End your response with a single, low-pressure question that invites them to share more *if* they want to (e.g., "Do you want to talk about what happened, or would you rather just vent?").
5. **Tone:** Keep your tone warm, authentic, gentle, and completely non-judgmental. Do not sound like a clinical textbook or an overly cheery toxic-positive cheerleader.
`
        },
        {
          role: "user",
          content: `
Current conversation history:
${chatHistory}

User says: "${userMessage}"

Respond naturally based on these rules:
`
        }
      ],
      max_tokens: 500,
    });

    const result = completion.choices[0].message.content.trim();

    res.json({
      message: "Success",
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error checking mood",
      error: err.message,
    });
  }
});

export default router;
