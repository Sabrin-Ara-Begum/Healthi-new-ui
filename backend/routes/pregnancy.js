const express = require("express");
const router = express.Router();

// Placeholder route for pregnancy tips
router.get("/", (req, res) => {
  res.json({ message: "Pregnancy tips route placeholder" });
});

module.exports = router;
