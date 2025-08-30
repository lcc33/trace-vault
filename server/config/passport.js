// passport.js
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

module.exports = function (passport) {
  // const callbackURL =
  //   process.env.NODE_ENV === "development"
  //      "http://localhost:5000/auth/google/callback"
  //      "https://tracevault.vercel.app/auth/google/callback";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback", // <-- dynamic based on dev/prod
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });
          if (existingUser) return done(null, existingUser);

          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value,
            username:
              profile.displayName.replace(/\s+/g, "").toLowerCase() +
              Date.now(),
          });

          return done(null, newUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) =>
    User.findById(id).then((user) => done(null, user))
  );
};
