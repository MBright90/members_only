const express = require("express");
const cors = require("cors");
const postController = require("../controllers/postController");
const { isPaid, isAuth } = require("../lib/authMiddleware");

const router = express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- POST ROUTES --- //
router.post("/new", isPaid, postController.addPostToDatabase);

// --- GET ROUTES --- //
router.get("/new", isPaid, (req, res) =>
  res.render("./forms/new-post-form", {
    user: { name: req.user.username, id: req.user.id },
  }),
);

router.get("/report-form-:postId", isAuth, postController.getReportForm);

router.get("/:userId", isAuth, postController.getUsersPosts);

router.get("/", postController.getRecentPosts);

module.exports = router;
