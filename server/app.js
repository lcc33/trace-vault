const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let reports = [];

app.post("/api/report", (req, res) => {
  const { itemName, itemCategory, locationLost, description, contact } = req.body;

  const addReport = {
    id: reports.length + 1,
    name: itemName,
    category: itemCategory,
    location: locationLost,
    description,
    contact,
  };

  reports.push(addReport);
  res.json({ message: "Report added successfully", report: addReport });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
