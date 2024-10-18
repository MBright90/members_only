require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const db = require("./config/database");
const router = require("./routes/homeRoutes");

const PgStore = require("connect-pg-simple")(session);

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SESSION MIDDLEWARE --- //
const sessionStore = new PgStore({
  pool: db,
  table: "users",
  createTableIfMissing: true,
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// --- PASSPORT AUTHENTICATION --- //
require("./config/passport");
app.use(passport.session());

// --- ROUTES --- //
app.use("/", router);

// --- ERROR HANDLING --- //

// --- SERVER --- //
const PORT = process.env.PORT;
app.listen(3000, () => {
  console.log(`Server listening on port ${PORT}`);
});
