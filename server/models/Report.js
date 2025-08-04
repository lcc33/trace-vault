const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    required: [true, "name is required!"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "category is required!"],
    trim: true,
  },
  location: {
    type: String,
    required: [true, "location is required!"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "description is required!"],
    trim: true,
  },
  contact: {
    type: String,
    required: [true, "contact is required!"],
    trim: true,
  },
  image: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
