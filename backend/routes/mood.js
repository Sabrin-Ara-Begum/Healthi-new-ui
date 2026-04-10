const express = require("express");
const router = express.Router();

// Placeholder route for mood tracker
router.get("/", (req, res) => {
  res.json({ message: "Mood tracker route placeholder" });
});

module.exports = router;
