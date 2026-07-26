import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import TabletLog from "../models/TabletLog.js";

const router = express.Router();

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Multer Setup with File Filters & Size Limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Supported types: JPG, JPEG, PNG, WEBP."));
    }
  }
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * POST /api/tablet/identify
 * Identifies medicine using Gemini and optionally saves results to user history.
 */
router.post("/identify", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            imagePart,
            {
              text: `
You are a medicine identification AI.

Analyze the uploaded medicine/tablet image.

Return ONLY valid JSON in this exact format. Do not include markdown code block syntax.

{
  "medicine": "",
  "generic": "",
  "composition": "",
  "uses": ["", ""],
  "dosage": "",
  "sideEffects": ["", ""],
  "warnings": ["", ""],
  "confidence": 95
}

Rules:
- Do not write markdown.
- Do not use \`\`\`.
- Do not explain anything.
- If uncertain, make your best guess and reduce confidence.
`,
            },
          ],
        },
      ],
    });

    const text = response.text;
    let result;

    try {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Gemini raw text parsing failed:", text);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI returned invalid content structure.");
      }
    }

    // Clean up file
    fs.unlinkSync(req.file.path);

    // Save to database if email is provided
    const email = req.body.email;
    if (email && result) {
      await TabletLog.create({
        email,
        medicine: result.medicine || "Unknown Medicine",
        generic: result.generic || "N/A",
        composition: result.composition || "N/A",
        uses: result.uses || [],
        dosage: result.dosage || "N/A",
        sideEffects: result.sideEffects || [],
        warnings: result.warnings || [],
        confidence: result.confidence || 0
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Gemini Error:", err);

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("File deletion error:", unlinkErr);
      }
    }

    res.status(500).json({
      message: "Medicine identification failed.",
      error: err.message,
    });
  }
});

/**
 * GET /api/tablet/history
 * Fetch user scan logs with search, filter, and pagination
 */
router.get("/history", async (req, res) => {
  try {
    const { email, search, page = 1, limit = 5 } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const query = { email };

    // Search query matching medicine, generic, or composition
    if (search) {
      query.$or = [
        { medicine: { $regex: search, $options: "i" } },
        { generic: { $regex: search, $options: "i" } },
        { composition: { $regex: search, $options: "i" } }
      ];
    }

    const currentPage = parseInt(page);
    const limitPerPage = parseInt(limit);
    const skip = (currentPage - 1) * limitPerPage;

    const logs = await TabletLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitPerPage);

    const totalLogs = await TabletLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        totalItems: totalLogs,
        totalPages: Math.ceil(totalLogs / limitPerPage),
        currentPage,
        limitPerPage
      }
    });
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({
      message: "Failed to fetch scan history",
      error: err.message
    });
  }
});

/**
 * DELETE /api/tablet/history/:id
 * Delete a specific tablet scan log by ID
 */
router.delete("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLog = await TabletLog.findByIdAndDelete(id);

    if (!deletedLog) {
      return res.status(404).json({ message: "Scan log not found" });
    }

    res.json({ message: "Scan log deleted successfully" });
  } catch (err) {
    console.error("Delete history error:", err);
    res.status(500).json({
      message: "Failed to delete scan log",
      error: err.message
    });
  }
});

export default router;