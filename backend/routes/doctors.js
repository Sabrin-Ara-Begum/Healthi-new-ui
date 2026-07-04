import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

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
            "places.id,places.displayName,places.formattedAddress,places.rating,places.googleMapsUri,places.primaryType",
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
      id: index + 1,
      name: place.displayName?.text || "Unknown Doctor",
      specialty: specialty,
      hospital: "Google Maps",
      location: place.formattedAddress || "Unknown",

      phone: "Not Available",
      experience: "N/A",
      qualification: "N/A",

      rating: place.rating || 0,

      fee: "Not Available",
      availability: "Call Clinic",

      languages: [],

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

export default router;