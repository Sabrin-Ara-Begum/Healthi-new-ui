import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true }, // 'user' or 'bot'
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatSession", chatSessionSchema);
