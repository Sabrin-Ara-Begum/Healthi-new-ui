import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema({
  email: { type: String, required: true },
  symptoms: { type: String, required: true },
  reply: { type: String, required: true },
  severity: { type: String, default: "" },
  duration: { type: String, default: "" },
  age: { type: Number, default: null },
  gender: { type: String, default: "" },
  existingConditions: { type: String, default: "" },
  currentMedications: { type: String, default: "" },
  allergies: { type: String, default: "" },
  temperature: { type: String, default: "" },
  bloodPressure: { type: String, default: "" },
  uploadedFiles: [{
    name: { type: String },
    url: { type: String }
  }],
  confidence: { type: Number, default: null },
  recommendations: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("SymptomHistory", symptomSchema);