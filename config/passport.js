const passport = require("passport");
const LocalStrategy = require("passport-local");
const userController = require("./controllers/userController");
const { validPassword } = require("../lib/passwordUtils");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await userController.getUserByUsername(username);

      if (!user) return done(null, false);

      const isValid = validPassword(password, user.hash);

      if (isValid) return done(null, user);
      return done(null, false);
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
    const user = 'lol' // get user
    done(null, user);
  } catch (err) {
    done(err);
  }
});
