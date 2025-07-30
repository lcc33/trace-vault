const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
const app = express();
connectDB();
require("dotenv").config();
app.use(cors());
app.use(express.json());
require("./config/passport")(passport);

app.use(
  session({
    secret: "tracevalla",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Static files
// app.use(express.static(path.join(__dirname, "public")));

//socket.io setup shii
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
// const { Socket } = require("dgram");

const io = new Server(server, {
  cors: { origin: "*" },
});
io.on("connection", (Socket) => {
  console.log("new client connected");

  Socket.on("disconnet", () => {
    console.log("client disconnected");
  });
});
app.set("io", io);

// Routes
app.use("/", require("./routes/reportRoutes"));
app.use("/auth", require("./routes/auth"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
