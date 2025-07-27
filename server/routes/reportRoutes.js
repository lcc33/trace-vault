const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const { getReports } = require("../controllers/reportController"); // only getReports now
const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });


router.post('/api/report', upload.single('itemImage'), async (req, res) => {
  try {
    const { itemName, category, location, description, contact } = req.body;

    const newReport = new Report({
      name: itemName,
      category,
      location,
      description,
      contact,
      image: req.file.filename,
    });

    await newReport.save();

    res.json({ message: 'Report added successfully', report: newReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add report' });
  }
});

// GET all reports
router.get("/reports", getReports);

module.exports = router;
