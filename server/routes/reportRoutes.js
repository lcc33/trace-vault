const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  getReports,
  updateReport,
  deleteReport,
  getUserReports,
} = require("../controllers/reportController");

const Report = require("../models/Report");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Auth middleware
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized access denied!" });
}

// --- Routes ---

// POST new report
router.post(
  "/api/reports",
  ensureAuth,
  upload.single("itemImage"),
  async (req, res) => {
    try {
      const { category, description, contact } = req.body;

      const newReport = new Report({
        category,
        description,
        contact,
        image: req.file?.filename || null,
        user: req.user._id,
      });

      await newReport.save();
      req.app.get("io").emit("newReport", newReport);

      res.json({ message: "Report added successfully", report: newReport });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to add report" });
    }
  }
);

// GET all reports
router.get("/api/reports", ensureAuth, async (req, res) => {
  try {
    await getReports(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

// PUT update report (with optional new image upload)
router.put(
  "/api/reports/:id",
  ensureAuth,
  upload.single("itemImage"), // allow updating image if needed
  async (req, res) => {
    try {
      await updateReport(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update report" });
    }
  }
);

// DELETE report
router.delete("/api/reports/:id", ensureAuth, async (req, res) => {
  try {
    await deleteReport(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete report" });
  }
});

// GET reports by the authenticated user
router.get("/api/reports/user", ensureAuth, async (req, res) => {
  try {
    await getUserReports(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user reports" });
  }
});

router.post("/api/logout", (req, res) => {
  // If using cookie/session
  res.clearCookie("connect.sid"); // or your session cookie name
  req.session = null; // destroy session if using express-session
  return res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
