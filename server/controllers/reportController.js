const Report = require("../models/Report");

exports.addReport = async (req, res) => {
  try {
    const newReport = req.body.newReport || req.body;
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
  const { name, description, location } = req.body;
  const { id } = req.params;

  Report.findByIdAndUpdate(id, { name, description, location }, { new: true })
    .then((updatedReport) => res.json(updatedReport))
    .catch((err) => res.status(500).json({ error: "Failed to update Report" }));
};

exports.deleteReport = async (req, res) => {
  const { id } = req.params;

  Report.findByIdAndDelete(id)
    .then(() => res.json({ message: "Report Deleted" }))
    .catch((err) => res.status(500).json({ error: "Failed to delete report" }));
};
