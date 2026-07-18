import express from "express";
import multer from "multer";
import axios from "axios";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/identify", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const imageBase64 = req.file.buffer.toString("base64");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash",

        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
You are an expert pharmacist.

Look carefully at the uploaded medicine image.

Identify the medicine ONLY if reasonably confident.

Return ONLY valid JSON.

{
  "medicine":"",
  "generic":"",
  "composition":"",
  "uses":[],
  "dosage":"",
  "sideEffects":[],
  "warnings":[],
  "confidence":0
}
`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${req.file.mimetype};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data.choices[0].message.content;

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleaned);

    res.json(result);

  } catch (err) {
    console.error(err.response?.data || err);

    res.status(500).json({
      message: "Medicine identification failed.",
    });
  }
});

export default router;