const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    if (req.user && req.user.email === "bryanedwarding@gmail.com") {
      res.redirect("/Dashboard");
    } else {
      res.redirect("/Home");
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

module.exports = router;
