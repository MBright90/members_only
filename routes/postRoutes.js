const express = require("express");
const cors = require("cors");
const postController = require("../controllers/postController");
const { isPaid, isAuth } = require("../lib/authMiddleware");

const router = express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- POST ROUTES --- //
router.post("/new", isPaid, postController.addPostToDatabase);

router.post("/report-:postId", isAuth, postController.postReportForm);

// --- GET ROUTES --- //
router.get("/new", isPaid, (req, res) =>
  res.render("./forms/new-post-form", {
    user: req.user,
  }),
);

router.get("/report-form-:postId", isAuth, postController.getReportForm);

router.get("/user/:userId", isAuth, postController.getUsersPosts);

router.get("/:postId", isAuth, postController.getPostWithComments);

router.get("/", postController.getRecentPosts);

module.exports = router;
