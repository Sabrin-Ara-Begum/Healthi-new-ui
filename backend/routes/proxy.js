import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  const url = req.query.url;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

export default router;
