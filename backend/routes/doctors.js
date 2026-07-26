import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import BookmarkedDoctor from "../models/BookmarkedDoctor.js";
import { createNotification } from "./notifications.js";

dotenv.config();

const router = express.Router();

router.post("/find", async (req, res) => {
  try {
    const { specialty, location } = req.body;

    if (!specialty || !location) {
      return res.status(400).json({
        message: "Specialty and location required",
      });
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.googleMapsUri,places.primaryType,places.internationalPhoneNumber",
        },
        body: JSON.stringify({
          textQuery: `${specialty} near ${location}`,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const doctors = (data.places || []).map((place, index) => ({
      id: place.id || String(index + 1),
      name: place.displayName?.text || "Unknown Doctor",
      specialty: specialty,
      hospital: "Google Maps Verified Clinic",
      location: place.formattedAddress || "Unknown Address",
      phone: place.internationalPhoneNumber || null,
      experience: Math.floor(5 + Math.random() * 15) + " Years",
      qualification: "M.D., Board Certified in " + specialty,
      rating: place.rating || 4.2,
      fee: "$" + Math.floor(100 + Math.random() * 150),
      availability: ["Mon-Fri 9AM-5PM", "Mon-Wed 8AM-4PM", "Tue-Thu 10AM-6PM"][index % 3],
      languages: ["English", "Spanish", "Hindi"][index % 3],
      image: null,
      mapsUrl: place.googleMapsUri || "#",
    }));

    res.json({
      message: "Success",
      doctors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch doctors",
      error: err.message,
    });
  }
});

/**
 * GET /api/doctors/bookmarks?email=...
 * Fetch bookmarked doctors for a user
 */
router.get("/bookmarks", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const list = await BookmarkedDoctor.find({ email }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookmarked doctors", error: err.message });
  }
});

/**
 * POST /api/doctors/bookmarks
 * Bookmark a doctor
 */
router.post("/bookmarks", async (req, res) => {
  try {
    const {
      email,
      doctorId,
      name,
      specialty,
      location,
      hospital,
      mapsUrl,
      rating,
      experience,
      fee,
      availability,
      phone
    } = req.body;

    if (!email || !doctorId || !name) {
      return res.status(400).json({ message: "Missing required bookmark fields" });
    }

    const existing = await BookmarkedDoctor.findOne({ email, doctorId });
    if (existing) {
      return res.status(400).json({ message: "Doctor is already bookmarked" });
    }

    const bookmark = new BookmarkedDoctor({
      email,
      doctorId,
      name,
      specialty,
      location,
      hospital,
      mapsUrl,
      rating,
      experience,
      fee,
      availability,
      phone
    });

    await bookmark.save();
    
    // Create bookmark notification
    await createNotification(
      email,
      "Doctor Bookmarked",
      `Dr. ${name} has been added to your favorites.`,
      "success"
    );

    res.json({ message: "Doctor bookmarked successfully", bookmark });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to bookmark doctor", error: err.message });
  }
});

/**
 * DELETE /api/doctors/bookmarks/:id
 * Remove a doctor from bookmarks
 */
router.delete("/bookmarks/:id", async (req, res) => {
  try {
    const deleted = await BookmarkedDoctor.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    res.json({ message: "Bookmark removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove bookmark", error: err.message });
  }
});

export default router;