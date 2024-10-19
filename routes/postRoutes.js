const express = require("express");
const postController = require("../controllers/postController");

const router = express.Router();

// --- POST ROUTES --- //
router.post("/new", postController.addPostToDatabase);

// --- GET ROUTES --- //
router.get("/posts/user=:userId", postController.getUsersPosts);

router.post("/", postController.getRecentPosts);

module.exports = router;
