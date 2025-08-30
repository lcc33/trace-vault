const router = require("express").Router();
const ensureAuthed = require("./auth");
const Notification = require("../models/Notification");

// List my notifications (newest first)
router.get("/", ensureAuthed, async (req, res) => {
  const items = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(items);
});

// Mark one as read
router.put("/:id/read", ensureAuthed, async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { $set: { isRead: true } });
  res.json({ ok: true });
});

// Mark all as read
router.put("/read-all", ensureAuthed, async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
  res.json({ ok: true });
});

module.exports = router;
