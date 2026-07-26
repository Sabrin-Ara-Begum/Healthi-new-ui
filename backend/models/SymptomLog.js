import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  symptoms: [String],
  predictedDiseases: [String],
  recommendedDoctor: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("SymptomLog", symptomSchema);
