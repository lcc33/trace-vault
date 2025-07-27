const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  location: String,
  description: String,
  contact: String,
  image: String, // <-- new field
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
