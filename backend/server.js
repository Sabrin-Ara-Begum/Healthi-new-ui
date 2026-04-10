import express from "express"
import fetch from "node-fetch"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js";
import proxyRoutes from "./routes/proxy.js";
import mongoose from "mongoose";
import SymptomHistory from "./models/SymptomHistory.js";

dotenv.config()

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected");
})
.catch((err) => {
  console.log("MongoDB error:", err);
});

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/proxy", proxyRoutes);

/**
 * SYMPTOM CHECKER AI
 */
app.post("/api/openrouter/chat", async (req, res) => {
  try {

    const { message, email } = req.body

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5174",
        "X-Title": "Healthi AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    })

    const data = await response.json()

    const reply = data.choices[0].message.content

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
    })

  } catch (error) {

    console.error("OpenRouter Error:", error)

    res.status(500).json({
      error: "OpenRouter API failed"
    })

  }
})


/**
 * GET USER SYMPTOM HISTORY
 */
app.get("/api/history/:email", async (req, res) => {

  try {

    const history = await SymptomHistory
      .find({ email: req.params.email })
      .sort({ createdAt: -1 });

    res.json(history);

  } catch (error) {

    res.status(500).json({
      error: "Could not fetch history"
    });

  }

});


app.listen(5001, () => {
  console.log("Backend running on port 5001")
})