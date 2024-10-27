const express = require("express");
const cors = require("cors");
const commentController = require("../controllers/commentController");
const { isPaid, isAuth, isAdmin } = require("../lib/authMiddleware");

const router = new express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- POST ROUTES --- //
router.post("/add-comment", isPaid, commentController.addCommentToDatabase);

router.post("/report-:commentId", isAuth, commentController.postReportComment);

router.post(
  "/comments/resolve-report-delete-:reportId",
  isAdmin,
  commentController.deleteCommentFromReport,
);

router.post(
  "/comments/resolve-report-remove-:reportId",
  isAdmin,
  commentController.resolveCommentFromReport,
);

// --- COMMENT ROUTES --- //
router.get(
  "/report-comment-form-:commentId",
  isAuth,
  commentController.getReportForm,
);

module.exports = router;
