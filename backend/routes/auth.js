import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import { createNotification } from "./notifications.js";

const router = express.Router();

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Multer Storage Configuration for Profile Avatar Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image type. Supported: JPG, JPEG, PNG, WEBP."));
    }
  }
});

/**
 * SIGN UP
 */
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
    });

    await user.save();
    
    // Create initial welcome notification
    await createNotification(
      email,
      "Welcome to Healthi AI!",
      `Hello ${name}, welcome! We are thrilled to be part of your wellness journey.`,
      "info"
    );

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference || "light",
        avatar: user.avatar || ""
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/auth/validate
 * Validate token and return user
 */
router.get("/validate", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ email: decoded.email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

/**
 * GET /api/auth/profile
 * Fetch full profile details
 */
router.get("/profile", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});

/**
 * PUT /api/auth/profile
 * Edit profile details
 */
router.put("/profile", async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      age,
      gender,
      bloodGroup,
      allergies,
      medicalConditions,
      emergencyContact,
      address,
      location
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find and update user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        name,
        phone,
        age: age ? Number(age) : null,
        gender,
        bloodGroup,
        allergies,
        medicalConditions,
        emergencyContact,
        address,
        location
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Trigger Notification
    await createNotification(
      email,
      "Profile Updated",
      "Your medical profile has been updated successfully.",
      "success"
    );

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

/**
 * POST /api/auth/profile/avatar
 * Upload profile avatar
 */
router.post("/profile/avatar", (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Email is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No avatar image provided" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findOneAndUpdate(
      { email },
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Avatar uploaded successfully", avatarUrl, user });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Failed to upload avatar", error: err.message });
  }
});

/**
 * PUT /api/auth/profile/theme
 * Update theme preference
 */
router.put("/profile/theme", async (req, res) => {
  try {
    const { email, themePreference } = req.body;
    if (!email || !themePreference) {
      return res.status(400).json({ message: "Email and theme preference required" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { themePreference },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Theme preference updated successfully", themePreference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update theme preference", error: err.message });
  }
});

export default router;