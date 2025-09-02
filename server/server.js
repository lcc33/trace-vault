const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const app = express();
connectDB();
require("dotenv").config();
const allowedOrigins = [
  "http://localhost:4321",
  "https://tracevault.vercel.app"
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, curl, etc.
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // ✅ allow cookies/sessions across domains
}));


app.use(express.json());
require("./config/passport")(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "tracevalla",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // secure cookies in prod
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());


//socket.io setup shii
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

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
io.on("connection", (socket) => {
  console.log("new client connected");

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on("disconnect", () => {
    // optional: cleanup
  });
});

// helper you can reuse in routes:
// app.set("notifyUser", (userId, event, payload) => {
//   if (!userId) return;
//   io.to(`user:${userId}`).emit(event, payload);
// });

// Also good to broadcast report resolved:
// app.set("broadcast", (event, payload) => io.emit(event, payload));


// Routes
app.use("/", require("./routes/reportRoutes"));
app.use("/auth", require("./routes/auth"));
app.use("/claims", require("./routes/claimRoutes"));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/claims", express.static(path.join(__dirname, "uploads/claims")));


app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});


app.use("/claims", require("./routes/claimRoutes"));
// app.use("/notifications", require("./routes/notificationsRoutes"));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));