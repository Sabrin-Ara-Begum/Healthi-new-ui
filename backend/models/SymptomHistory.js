const mongoose = require("mongoose");

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

module.exports = mongoose.model("SymptomHistory", symptomHistorySchema);