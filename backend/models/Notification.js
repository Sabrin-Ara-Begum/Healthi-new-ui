import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true }, // 'success' | 'info' | 'reminder' | 'alert'
  color: { type: String, required: true }, // e.g. 'text-green-500'
  bgColor: { type: String, required: true }, // e.g. 'bg-green-50'
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
