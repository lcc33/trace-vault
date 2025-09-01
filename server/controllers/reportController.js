const Report = require("../models/Report");

exports.addReport = async (req, res) => {
  try {
    const newReport = await req.body.newReport || req.body;
    const report = await Report.create(newReport);
    res.json({ message: "Report added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save report" });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("user", "name profilePic");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to get reports" });
  }
};

exports.updateReport = async (req, res) => {
  const { description } = req.body;
  const { id } = req.params;

  Report.findByIdAndUpdate(id, {  description }, { new: true })
    .then((updatedReport) => res.json(updatedReport))
    .catch((err) => res.status(500).json({ error: err }));
};

exports.deleteReport = async (req, res) => {
  const { id } = req.params;

  Report.findByIdAndDelete(id)
    .then(() => res.json({ message: "Report Deleted" }))
    .catch((err) => res.status(500).json({ error: err }));
};

exports.getUserReports = async (req, res) => {
  try {
    const userId = req.query.userId;
    const query = userId ? { user: userId } : {};
    const reports = await Report.find(query).populate("user", "name profilePic");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to get reports" });
  }
};
