const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  id: Number,
  
  category: {
    type: String,
    required: [true, "category is required!"],
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
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
