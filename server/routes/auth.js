const express = require("express");
const passport = require("passport");
const session = require("express-session");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "./" }),
  (req, res) => {
    if (req.user && req.user.email === "bryanedwarding@gmail.com") {
      res.redirect("http://tracevault.vercel.app/dashboard");
    } else {
      res.redirect("http://tracevault.vercel.app/home");
    }
  }
  
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy();
    // res.redirect("/"); // or send JSON: res.json({ message: "Logged out" });
  });
});

module.exports = function ensureAuthed(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

module.exports = router;
