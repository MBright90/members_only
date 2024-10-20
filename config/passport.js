const passport = require("passport");
const LocalStrategy = require("passport-local");
const { validPassword } = require("../lib/passwordUtils");
const db = require("../config/database");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.user.findFirst({ where: { username } });

      if (!user) return done(null, false, { message: "Incorrect username" });

      const isValid = validPassword(password, user.hash, user.salt);

      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password" });
      }
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.user.findFirst({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
