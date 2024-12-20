const express = require("express");
const cors = require("cors");
const postController = require("../controllers/postController");
const { isPaid, isAuth, isAdmin } = require("../lib/authMiddleware");

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

router.get("/report-post-form-:postId", isAuth, postController.getReportForm);

router.get(
  "/resolve-report-delete-:reportId",
  isAdmin,
  postController.deletePostFromReport,
);

router.get(
  "/resolve-report-remove-:reportId",
  isAdmin,
  postController.resolvePostFromReport,
);

router.get("/user/:userId", isAuth, postController.getUsersPosts);

router.get("/:postId", isAuth, postController.getPostWithComments);

router.get("/", postController.getRecentPosts);

module.exports = router;
