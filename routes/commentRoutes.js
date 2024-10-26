const express = require("express");
const cors = require("cors");
const commentController = require("../controllers/commentController");
const { isPaid } = require("../lib/authMiddleware");

const router = new express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- POST ROUTES --- //
router.post("/add-comment", isPaid, commentController.addCommentToDatabase);

module.exports = router;
