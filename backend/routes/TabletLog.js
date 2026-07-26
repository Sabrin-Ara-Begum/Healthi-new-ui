import mongoose from "mongoose";

const TabletLogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("TabletLogRoutePlaceholder", TabletLogSchema);
