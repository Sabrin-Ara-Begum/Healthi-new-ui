import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

// Route imports
import authRoutes from "./routes/auth.js";
import proxyRoutes from "./routes/proxy.js";
import symptomRoutes from "./routes/symptoms.js";
import doctorRoutes from "./routes/doctors.js";
import tabletRoutes from "./routes/tablets.js";
import tabletVisionRoutes from "./routes/tabletVision.js";
import moodRoutes from "./routes/mood.js";
import chatRoutes from "./routes/chat.js";
import searchRoutes from "./routes/search.js";
import notificationsRoutes from "./routes/notifications.js";

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

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Serve uploads folder statically
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/proxy", proxyRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/tablets", tabletRoutes);
app.use("/api/tablet", tabletVisionRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationsRoutes);

/**
 * SYMPTOM CHECKER AI (AI Chat Assistant Endpoint - Legacy fallback)
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

    // Map fields so both result, reply, and extended fields are present
    const mapped = history.map(item => ({
      _id: item._id,
      email: item.email,
      symptoms: item.symptoms,
      reply: item.reply,
      result: item.reply,
      severity: item.severity,
      duration: item.duration,
      age: item.age,
      gender: item.gender,
      existingConditions: item.existingConditions,
      currentMedications: item.currentMedications,
      allergies: item.allergies,
      temperature: item.temperature,
      bloodPressure: item.bloodPressure,
      uploadedFiles: item.uploadedFiles,
      confidence: item.confidence,
      recommendations: item.recommendations,
      createdAt: item.createdAt
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({
      error: "Could not fetch history"
    });
  }
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  
  switch (error.code) {
    case "EADDRINUSE":
      console.error(`Error: Port ${PORT} is already in use. Please ensure no other backend instances are running.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown to prevent orphaned processes
const shutdown = () => {
  console.log("\nShutting down server gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false).then(() => {
        console.log("MongoDB connection closed.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle Nodemon restarts
process.once("SIGUSR2", () => {
  console.log("\nNodemon restart detected. Shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed for Nodemon restart.");
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false).then(() => {
        console.log("MongoDB connection closed.");
        process.kill(process.pid, "SIGUSR2");
      });
    } else {
      process.kill(process.pid, "SIGUSR2");
    }
  });
});