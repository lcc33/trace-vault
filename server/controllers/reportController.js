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

