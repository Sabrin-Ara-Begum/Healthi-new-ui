import mongoose from "mongoose";

const moodLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  mood: { type: String, required: true }, // Emoji representation, e.g., 😊
  label: { type: String, required: true }, // Text representation, e.g., Happy
  note: { type: String, default: "" },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM AM/PM
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("MoodLog", moodLogSchema);
