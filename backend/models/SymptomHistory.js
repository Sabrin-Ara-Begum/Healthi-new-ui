import mongoose from "mongoose";

const symptomHistorySchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SymptomHistory = mongoose.model("SymptomHistory", symptomHistorySchema);

export default SymptomHistory;