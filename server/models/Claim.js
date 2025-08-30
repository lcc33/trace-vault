const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true },
  claimer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  image: { type: String }, // filename of uploaded image
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Claim", claimSchema);
