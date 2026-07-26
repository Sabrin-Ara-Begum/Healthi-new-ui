import express from "express";

const router = express.Router();

// Placeholder route for pregnancy tips
router.get("/", (req, res) => {
  res.json({ message: "Pregnancy tips route placeholder" });
});

export default router;
