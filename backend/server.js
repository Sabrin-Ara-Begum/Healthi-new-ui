const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const moodRoutes = require("./routes/mood");
const symptomRoutes = require("./routes/symptoms");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/symptoms", symptomRoutes);

app.get("/", (req, res) => {
  res.send("Healthi backend running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});