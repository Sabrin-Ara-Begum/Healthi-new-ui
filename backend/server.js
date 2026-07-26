import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Route imports
import authRoutes from "./routes/auth.js";
import proxyRoutes from "./routes/proxy.js";
import symptomRoutes from "./routes/symptoms.js";
import doctorRoutes from "./routes/doctors.js";
import tabletRoutes from "./routes/tablets.js";
import tabletVisionRoutes from "./routes/tabletVision.js";
import moodRoutes from "./routes/mood.js";

// Model imports
import SymptomHistory from "./models/SymptomHistory.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected");
})
.catch((err) => {
  console.log("MongoDB error:", err);
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/proxy", proxyRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/tablets", tabletRoutes);
app.use("/api/tablet", tabletVisionRoutes);
app.use("/api/mood", moodRoutes);

/**
 * SYMPTOM CHECKER AI (AI Chat Assistant Endpoint)
 */
app.post("/api/openrouter/chat", async (req, res) => {
  try {
    const { message, email } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://healthi-ai-bppm.onrender.com",
        "X-Title": "Healthi AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // SAVE HISTORY IN MONGODB
    if (email) {
      await SymptomHistory.create({
        email,
        symptoms: message,
        reply
      });
    }

    res.json({
      reply
    });

  } catch (error) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({
      error: "OpenRouter API failed"
    });
  }
});

/**
 * GET USER SYMPTOM HISTORY
 * Maps 'reply' field to 'result' for frontend checklist compatibility.
 */
app.get("/api/history/:email", async (req, res) => {
  try {
    const history = await SymptomHistory
      .find({ email: req.params.email })
      .sort({ createdAt: -1 });

    // Map fields so both result and reply are present
    const mapped = history.map(item => ({
      _id: item._id,
      email: item.email,
      symptoms: item.symptoms,
      reply: item.reply,
      result: item.reply,
      createdAt: item.createdAt
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({
      error: "Could not fetch history"
    });
  }
});

app.listen(5001, () => {
  console.log("Backend running on port 5001");
});