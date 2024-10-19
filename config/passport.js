const passport = require("passport");
const LocalStrategy = require("passport-local");
const {
  getUserById,
  getUserByUsername,
} = require("../controllers/userController");
const { validPassword } = require("../lib/passwordUtils");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);

      if (!user) return done(null, false);

      const isValid = validPassword(password, user.hash, user.salt);

      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await getUserById(userId);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
