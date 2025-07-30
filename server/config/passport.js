const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, Profiler, done) => {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePic: profile.photos[0].value,
        });
        return done(null, newUser);
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) =>
    User.findById(id).then((user) => done(null, user))
  );
};
