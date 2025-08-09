const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getReports,
  updateReport,
  deleteReport,
} = require("../controllers/reportController"); // Import new controllers

// Multer config (keep your existing setup)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Auth middleware (improved error message)
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized access denied!" });
}

// --- Routes ---

// POST new report (keep your existing upload logic)
router.post("/api/report", ensureAuth, upload.single("itemImage"), async (req, res) => {
  try {
    const { itemName, category, location, description, contact } = req.body;

    const newReport = new Report({
      name: itemName,
      category,
      location,
      description,
      contact,
      image: req.file?.filename || null, // Handle case where no file is uploaded
      user: req.user._id,
    });

    await newReport.save();
    req.app.get("io").emit("newReport", newReport);
    res.json({ message: "Report added successfully", report: newReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add report" });
  }
});

// GET all reports (unchanged)
router.get("/reports", ensureAuth, getReports);

// --- NEW ROUTES ADDED ---

// PUT update report (no file upload for edits)
router.put("/reports/:id", ensureAuth, async (req, res) => {
  await updateReport(req, res); // Uses controller logic
});

// DELETE report
router.delete("/reports/:id", ensureAuth, async (req, res) => {
  await deleteReport(req, res); // Uses controller logic
});

module.exports = router;