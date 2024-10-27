const express = require("express");
const cors = require("cors");
const commentController = require("../controllers/commentController");
const { isPaid, isAuth, isAdmin } = require("../lib/authMiddleware");

const router = new express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- POST ROUTES --- //
router.post("/add-comment", isPaid, commentController.addCommentToDatabase);

router.post("/report-:commentId", isAuth, commentController.postReportComment);

// --- GET ROUTES --- //
router.get(
  "/resolve-report-delete-:reportId",
  isAdmin,
  commentController.deleteCommentFromReport,
);

router.get(
  "/resolve-report-remove-:reportId",
  isAdmin,
  commentController.resolveCommentFromReport,
);

router.get(
  "/report-comment-form-:commentId",
  isAuth,
  commentController.getReportForm,
);

module.exports = router;
