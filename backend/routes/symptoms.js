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

    const result = JSON.parse(
  completion.choices[0].message.content
);

return res.json(result);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({
      message: "Error checking symptoms",
      error: err.response ? err.response.data : err.message,
    });
  }
});

module.exports = router;
