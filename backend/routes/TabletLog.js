const mongoose = require("mongoose");

const TabletLogSchema = new mongoose.Schema({
  name: { type: String, required: true },       // Name of tablet entered by user
  result: { type: String, required: true },     // AI description of tablet
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional: link to user
});

module.exports = mongoose.model("TabletLog", TabletLogSchema);
