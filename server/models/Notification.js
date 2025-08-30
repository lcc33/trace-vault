const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // recipient
    type: {
      type: String,
      enum: ["CLAIM_CREATED", "CLAIM_ACCEPTED", "CLAIM_REJECTED", "REPORT_RESOLVED", "REPORT_EDITED", "REPORT_DELETED"],
      required: true,
      index: true,
    },
    data: {
      // lightweight payload for client
      reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
      claimId: { type: mongoose.Schema.Types.ObjectId, ref: "Claim" },
      previewText: String,
      image: String, // optional (e.g., report image)
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
