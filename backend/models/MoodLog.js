import mongoose from "mongoose";

const moodLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  mood: { type: String, required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("MoodLog", moodLogSchema);
