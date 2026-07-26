import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import SymptomHistory from "../models/SymptomHistory.js";

dotenv.config();

const router = express.Router();

// Initialize OpenRouter via OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

/**
 * POST /api/symptoms/check
 * Body: { symptoms: "fever, cough, headache", userEmail: "test@example.com" }
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
          role: "system",
          content: `
You are Healthi AI.

Return ONLY valid JSON.

Never return markdown.

Never return explanations outside JSON.

Return exactly this structure:

{
  "urgency":{
    "title":"",
    "points":[]
  },
  "causes":{
    "title":"",
    "points":[]
  },
  "homeCare":{
    "title":"",
    "points":[]
  },
  "avoid":{
    "title":"",
    "points":[]
  },
  "emergency":{
    "title":"",
    "points":[]
  },
  "specialist":{
    "name":"",
    "reason":""
  }
}
`
        },
        {
          role: "user",
          content: `
Patient Symptoms:

${symptoms}

Analyze carefully.

Return ONLY valid JSON.

{
  "urgency":{
    "title":"Urgency & Action Plan",
    "points":[
      "",
      "",
      ""
    ]
  },

  "causes":{
    "title":"Possible Causes",
    "points":[
      "",
      "",
      ""
    ]
  },

  "why":{
    "title":"Why these symptoms match",
    "points":[
      "",
      "",
      ""
    ]
  },

  "homeCare":{
    "title":"Home Care",
    "points":[
      "",
      "",
      ""
    ]
  },

  "avoid":{
    "title":"Things to Avoid",
    "points":[
      "",
      "",
      ""
    ]
  },

  "emergency":{
    "title":"Emergency Warning Signs",
    "points":[
      "",
      "",
      ""
    ]
  },

  "specialist":{
    "name":"",
    "reason":""
  }
}

Rules:

- Always fill EVERY section.
- Never leave a section empty.
- Maximum 3 bullet points each.
- Bullet points should be short.
- Recommend only ONE specialist.
- Never return markdown.
- Never return explanations outside JSON.
`
        }
      ],
      max_tokens: 500,
    });

    const contentText = completion.choices[0].message.content.trim();
    const result = JSON.parse(contentText);

    // Format plain-text summary to store in MongoDB history
    if (userEmail) {
      const urgencyText = result.urgency?.points ? result.urgency.points.map(p => `• ${p}`).join('\n') : '';
      const causesText = result.causes?.points ? result.causes.points.map(p => `• ${p}`).join('\n') : '';
      const homeCareText = result.homeCare?.points ? result.homeCare.points.map(p => `• ${p}`).join('\n') : '';
      const avoidText = result.avoid?.points ? result.avoid.points.map(p => `• ${p}`).join('\n') : '';
      const emergencyText = result.emergency?.points ? result.emergency.points.map(p => `• ${p}`).join('\n') : '';
      const specialistText = result.specialist ? `${result.specialist.name} (${result.specialist.reason})` : '';

      const summaryLines = [
        `Urgency & Action Plan:\n${urgencyText}`,
        `Possible Causes:\n${causesText}`,
        `Home Care:\n${homeCareText}`,
        `Things to Avoid:\n${avoidText}`,
        `Emergency Warning Signs:\n${emergencyText}`,
        `Recommended Specialist:\n${specialistText}`
      ];

      const replyText = summaryLines.filter(line => !line.endsWith(':\n')).join('\n\n');

      await SymptomHistory.create({
        email: userEmail,
        symptoms,
        reply: replyText
      });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error checking symptoms",
      error: err.message,
    });
  }
});

export default router;
