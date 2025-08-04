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

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "unauthorized access deniad!" });
}

router.post('/api/report', ensureAuth, upload.single('itemImage'), async (req, res) => {
  try {
    const { itemName, category, location, description, contact } = req.body;

    const newReport = new Report({
      name: itemName,
      category,
      location,
      description,
      contact,    // or leave out if you want
      image: req.file.filename,
      user: req.user._id,         // tie to current user
    });

    await newReport.save();

    // emit to sockets
    req.app.get('io').emit('newReport', newReport);

    res.json({ message: 'Report added successfully', report: newReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add report' });
  }
});


// GET all reports
router.get("/reports", ensureAuth, getReports);

module.exports = router;
