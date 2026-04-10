const mongoose = require("mongoose");

const tabletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    imageUrl: String,
    tabletName: String,
    purpose: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TabletLog", tabletSchema);
