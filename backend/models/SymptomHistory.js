import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema({
  email: String,
  symptoms: String,
  reply: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("SymptomHistory", symptomSchema);