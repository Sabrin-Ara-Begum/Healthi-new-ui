import express from "express";
import multer from "multer";
import OpenAI from "openai";
import fs from "fs";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64 = imageBuffer.toString("base64");

    const completion = await client.chat.completions.create({
      model: "openai/gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
You are a medicine identification expert.

Look carefully at this tablet or medicine strip.

Return ONLY valid JSON.

{
"name":"",
"manufacturer":"",
"strength":"",
"confidence":"",
"uses":"",
"dosage":"",
"sideEffects":"",
"warnings":"",
"alternatives":""
}
`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    fs.unlinkSync(req.file.path);

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Medicine identification failed",
    });
  }
});

export default router;