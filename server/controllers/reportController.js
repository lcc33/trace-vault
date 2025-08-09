const Report = require('../models/Report');

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
    const reports = await Report.find().populate('user', 'name profilePic');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get reports' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session?.user?.id;
    const { title, description } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (report.userId.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

    report.title = title;
    report.description = description;
    report.updatedAt = new Date();

    await report.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update report" });
  }
};


exports.deleteReport = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session?.user?.id;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (report.userId.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

    await Report.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report" });
  }
};
