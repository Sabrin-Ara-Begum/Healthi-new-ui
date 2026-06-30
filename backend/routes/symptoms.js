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
          content: `
You are an experienced AI Health Assistant.

The user reports the following symptoms:

${symptoms}

Analyze these symptoms carefully and respond in the following format.

# 🩺 Symptom Assessment

## 1. 🚨 Urgency & Action Plan

- **Recommended Action:** (Seek Emergency Care / Schedule a Doctor's Visit / Monitor at Home)
- **Reason:** Explain why.
- **Red Flags:** List symptoms that require immediate emergency care.

---

## 2. 🔍 Potential Causes

List the possible conditions from most likely to least likely.

For each condition include:
- Condition name
- Probability (High / Medium / Low)
- Why these symptoms match
- Other symptoms commonly seen

---

## 3. 👨‍⚕️ Consultation & Specialty

Recommend:
- Which doctor should be consulted
- How urgently the appointment should be scheduled

Also provide four useful questions the patient should ask the doctor.

---

## 4. 🏠 First Aid & Home Care

Provide:
- Immediate first-aid
- Safe home remedies
- Hydration advice
- Diet recommendations
- Rest recommendations

---

## 5. ⚠️ Things to Avoid

Mention:
- Activities to avoid
- Medicines to avoid unless prescribed
- Common mistakes patients make

---

## 6. 📅 Seek Immediate Medical Help If

Provide a checklist of emergency warning signs.

---

## 7. ⚕️ Disclaimer

State that this is an AI-generated assessment and not a medical diagnosis.

Use Markdown headings, bullet points, and short paragraphs.

Do NOT return JSON.
`,
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
