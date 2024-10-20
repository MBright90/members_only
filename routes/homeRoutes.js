const express = require("express");
const passport = require("passport");
const cors = require("cors");
const userController = require("../controllers/userController");

const router = new express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- POST ROUTES --- //
router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  }),
);

router.post("/register", userController.addUserToDatabase);

// --- GET ROUTES --- //

router.get("/log-in", (req, res) => {
  res.render("forms/log-in-form");
});

router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/register", (req, res) => {
  res.render("forms/register-form");
});

router.get("/", (req, res) => {
  const user = req.user;
  if (user) {
    res.render("home", { user: { name: user.first_name, id: user.id } });
  } else {
    res.render("landing-page");
  }
});

module.exports = router;
