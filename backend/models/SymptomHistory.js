const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema({
  email: String,
  symptoms: String,
  reply: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SymptomHistory", symptomSchema);