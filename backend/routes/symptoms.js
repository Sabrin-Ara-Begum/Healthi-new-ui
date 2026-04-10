const express = require("express");
const router = express.Router();
const OpenAI = require("openai"); // still use openai SDK

require("dotenv").config();

// Initialize OpenRouter via OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  // IMPORTANT: point base URL to OpenRouter
  baseURL: "https://openrouter.ai/api/v1",
});

/**
 * POST /api/symptoms/check
 * Body: { symptoms: "fever, cough, headache" }
 */
router.post("/check", async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: "Please provide symptoms" });
    }

    const completion = await client.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // use an available model (OpenRouter supports many)
      messages: [
        {
          role: "user",
          content: `Given symptoms: ${symptoms}, list possible diseases stepwise and suggest doctor types in structured JSON format.`,
        },
      ],
      max_tokens: 500,
    });

    const result = completion.choices[0].message.content;

    res.json({
      message: "Success",
      result,
    });
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({
      message: "Error checking symptoms",
      error: err.response ? err.response.data : err.message,
    });
  }
});

module.exports = router;
