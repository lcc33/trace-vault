const express = require("express");
const multer = require("multer");
const path = require("path");
const Claim = require("../models/Claim"); // new Claim model
const Report = require("../models/Report"); // so we can link to report
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// multer config for claim evidence images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/claims/"),
  filename: (req, file, cb) =>
    cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// POST /claims/:reportId
router.post("/:reportId", upload.single("image"), async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { reportId } = req.params;
    const { description } = req.body;

    const newClaim = new Claim({
      report: reportId,
      claimer: req.user._id,
      description,
      image: req.file ? req.file.filename : null,
      status: "pending",
    });

    await newClaim.save();

    res.json({ success: true, claim: newClaim });
  } catch (err) {
    console.error("Claim creation error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET claims for a specific report
router.get("/report/:reportId", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const claims = await Claim.find({ report: req.params.reportId }).populate(
      "claimer",
      "name profilePic"
    );
    res.json({ success: true, claims });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /claims?ownerId=xxx → get all claims on reports owned by a user
router.get("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { ownerId } = req.query;
    if (!ownerId) {
      return res.status(400).json({ success: false, error: "ownerId required" });
    }

    // Find reports created by this owner
    const reports = await Report.find({ user: ownerId }).select("_id");

    // Get all claims targeting those reports
    const claims = await Claim.find({ report: { $in: reports } })
      .populate("claimer", "name username profilePic")
      .populate("report", "description image");

    res.json({ success: true, claims });
  } catch (err) {
    console.error("Fetch claims error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
