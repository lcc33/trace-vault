const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
let reports = [];

app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/new", (req, res) => {
  res.render("new-report");
  // res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/", (req, res) => {
  const success = req.query.success;
  const error = req.query.error;
  res.render("reports", { reports, success, error });
});
// app.use(express.static(path.join(__dirname, "public")));
app.post("/", (req, res) => {
  const { itemName, itemCategory, locationLost, description, contact } =
    req.body;
  const addReport = {
    id: reports.length + 1,
    name: itemName,
    category: itemCategory,
    location: locationLost,
    description: description,
    contact: contact,
  };
  reports.push(addReport);
  res.redirect("/?success=Report made successfully");
  // res.send(reports).json;
  console.log(addReport);

  res.redirect("/?success=Report sent successfully");
  // console.log(req.url);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
