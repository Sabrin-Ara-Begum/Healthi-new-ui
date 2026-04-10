const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const SymptomHistory = require("../models/SymptomHistory");

require("dotenv").config();

// Initialize OpenRouter via OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

/**
 * POST /api/symptoms/check
 * Body: { symptoms: "fever, cough, headache", userEmail: "abc@gmail.com" }
 */
router.post("/check", async (req, res) => {
  try {
    const { symptoms, userEmail } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: "Please provide symptoms" });
    }

    const completion = await client.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Given symptoms: ${symptoms}, list possible diseases stepwise and suggest doctor types in structured JSON format.`,
        },
      ],
      max_tokens: 500,
    });

    const result = completion.choices[0].message.content;

    if (userEmail) {
      await SymptomHistory.create({
        userEmail,
        symptoms,
        result,
      });
    }

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

/**
 * GET /api/symptoms/history/:email
 */
router.get("/history/:email", async (req, res) => {
  try {
    const data = await SymptomHistory.find({
      userEmail: req.params.email,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: "Error fetching symptom history",
      error: err.message,
    });
  }
});

module.exports = router;