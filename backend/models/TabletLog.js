import mongoose from "mongoose";

const tabletLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true },
  imageUrl: { type: String },
  medicine: { type: String, required: true },
  generic: { type: String },
  composition: { type: String },
  uses: [{ type: String }],
  dosage: { type: String },
  sideEffects: [{ type: String }],
  warnings: [{ type: String }],
  confidence: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("TabletLog", tabletLogSchema);
