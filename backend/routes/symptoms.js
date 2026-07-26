import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
import SymptomHistory from "../models/SymptomHistory.js";
import { createNotification } from "./notifications.js";

dotenv.config();

const router = express.Router();

// Initialize OpenRouter via OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Multer Setup for Medical Reports Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "report-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Supported: PDF, JPG, JPEG, PNG, WEBP."));
    }
  }
});

/**
 * POST /api/symptoms/upload-report
 * Upload a report, prescription, or blood report document
 */
router.post("/upload-report", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: "File uploaded successfully",
      name: req.file.originalname,
      url: fileUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload file", error: err.message });
  }
});

/**
 * POST /api/symptoms/check
 * Run AI symptom checker with rich context parameters
 */
router.post("/check", async (req, res) => {
  try {
    const {
      symptoms,
      userEmail,
      severity,
      duration,
      age,
      gender,
      existingConditions,
      currentMedications,
      allergies,
      temperature,
      bloodPressure,
      uploadedFiles // array of { name, url }
    } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: "Please provide symptoms" });
    }

    // Compile clinical metadata text
    const patientContext = `
Patient Demographics: Age ${age || "N/A"}, Gender ${gender || "N/A"}
Symptoms: ${symptoms}
Severity: ${severity || "N/A"}
Duration: ${duration || "N/A"}
Vital signs: Temperature ${temperature || "N/A"}, Blood Pressure ${bloodPressure || "N/A"}
Medical Background: Existing conditions (${existingConditions || "None"}), Current medications (${currentMedications || "None"}), Allergies (${allergies || "None"})
    `;

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
    "title":"Urgency & Action Plan",
    "points":[]
  },
  "causes":{
    "title":"Possible Causes",
    "points":[]
  },
  "homeCare":{
    "title":"Home Care",
    "points":[]
  },
  "avoid":{
    "title":"Things to Avoid",
    "points":[]
  },
  "emergency":{
    "title":"Emergency Warning Signs",
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
Analyze the following patient health context:
${patientContext}

Rules:
- Fill every section.
- Maximum 3 bullet points per category.
- Bullet points must be short and direct.
- Recommend only one medical specialist category (e.g. Cardiologist, Dermatologist).
- Never return markdown.
- Never return text outside JSON.
`
        }
      ],
      max_tokens: 500,
    });

    const contentText = completion.choices[0].message.content.trim();
    let result;

    try {
      const cleaned = contentText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Symptom AI raw parsing failed:", contentText);
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI returned invalid JSON content structure.");
      }
    }

    // Format plain-text summary to store in MongoDB history
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

    if (userEmail) {
      const historyItem = new SymptomHistory({
        email: userEmail,
        symptoms,
        reply: replyText,
        severity: severity || "",
        duration: duration || "",
        age: age ? Number(age) : null,
        gender: gender || "",
        existingConditions: existingConditions || "",
        currentMedications: currentMedications || "",
        allergies: allergies || "",
        temperature: temperature || "",
        bloodPressure: bloodPressure || "",
        uploadedFiles: uploadedFiles || [],
        confidence: 90, // mock match confidence
        recommendations: result.urgency?.points || []
      });

      await historyItem.save();

      // Trigger Notification
      await createNotification(
        userEmail,
        "Symptom History Saved",
        "Your symptom analysis report has been saved to your health history.",
        "success"
      );
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

/**
 * DELETE /api/symptoms/history/:id
 * Delete a specific diagnosis entry
 */
router.delete("/history/:id", async (req, res) => {
  try {
    const deleted = await SymptomHistory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "History entry not found" });
    }
    res.json({ message: "History entry deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete history entry", error: err.message });
  }
});

/**
 * POST /api/symptoms/history/delete-multiple
 * Delete multiple specific diagnosis entries
 */
router.post("/history/delete-multiple", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "IDs array is required" });
    }

    await SymptomHistory.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Selected history entries deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete selected entries", error: err.message });
  }
});

/**
 * DELETE /api/symptoms/history/all/:email
 * Clear all history for a user
 */
router.delete("/history/all/:email", async (req, res) => {
  try {
    const { email } = req.params;
    await SymptomHistory.deleteMany({ email });
    res.json({ message: "All symptom history cleared successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear symptom history", error: err.message });
  }
});

export default router;
