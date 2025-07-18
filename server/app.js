const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

const REPORTS_FILE = path.join(__dirname, "reports.json");

let reports = [];
if (fs.existsSync(REPORTS_FILE)) {
  try {
    reports = JSON.parse(fs.readFileSync(REPORTS_FILE, "utf-8"));
  } catch (err) {
    reports = [];
  }
}

app.post("/api/report", (req, res) => {
  const body = req.body.newReport ? req.body.newReport : req.body;

  const { name, category, location, description, contact } = body;

  const addReport = {
    id: reports.length + 1,
    name: name,
    category: category,
    location: location,
    description: description,
    contact: contact,
  };

  reports.push(addReport);

  fs.writeFile(REPORTS_FILE, JSON.stringify(reports), (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to save report" });
    }
    res.json({ message: "Report added successfully", report: addReport });
  });
});

app.get("/reports", (req, res) => {
  res.json(reports);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
