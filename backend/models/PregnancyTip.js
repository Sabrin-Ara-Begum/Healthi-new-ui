import mongoose from "mongoose";

const pregnancyTipSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  tip: { type: String, required: true },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("PregnancyTip", pregnancyTipSchema);
