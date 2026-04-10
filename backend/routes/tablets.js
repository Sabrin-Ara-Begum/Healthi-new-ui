const express = require("express");
const router = express.Router();
const axios = require("axios");

// Example endpoint using OpenRouter API
router.post("/", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/responses",
      {
        model: "gpt-4o-mini",
        input: prompt,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      message: "Tablet route success",
      response: response.data,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Tablet route error", error: err.message });
  }
});

module.exports = router;


