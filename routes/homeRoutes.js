const express = require("express");
const passport = require("passport");
const cors = require("cors");
const prisma = require("../config/database");

const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");
const userController = require("../controllers/userController");
const { isAdmin } = require("../lib/authMiddleware");
const { formatTimeAgo } = require("../lib/timeUtils");

const router = new express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- POST ROUTES --- //
router.get(
  "/guest-log-in",
  (req, res, next) => {
    (req.body.username = process.env.GUEST_UN),
      (req.body.password = process.env.GUEST_PW),
      next();
  },
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  }),
);

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

router.get("/dashboard/posts", isAdmin, postController.getAdminDashboardPosts);
router.get(
  "/dashboard/comments",
  isAdmin,
  commentController.getAdminDashboardComments,
);
router.get("/dashboard", (req, res) => {
  res.redirect("dashboard/posts");
});

router.get("/", async (req, res) => {
  const user = req.user;

  if (user) {
    try {
      // Retrieve recent post
      const result = await prisma.post.findMany({
        where: {
          authorId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      });
      const recentPost = result[0];
      if (recentPost) {
        recentPost.createdAgo = formatTimeAgo(recentPost.createdAt);
      }

      const now = Date.now();

      // Get post which has most new comments created in past 24 hours
      const activeCommentsId = await prisma.comment.groupBy({
        by: ["postId"],
        where: {
          createdAt: { gte: new Date(now - 24 * 60 * 60 * 1000) },
        },
        _count: { postId: true },
        orderBy: { _count: { postId: "desc" } },
        take: 1,
      });

      const popularPost = await prisma.post.findFirst({
        where: {
          id: activeCommentsId[0].postId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      popularPost.createdAgo = formatTimeAgo(popularPost.createdAt);

      res.render("home", {
        user,
        recentPost: recentPost || null,
        popularPost,
      });
    } catch (err) {
      console.log(`Error retrieving home information: ${err}`);
      res.render("/errors/error", {
        user,
        errMsg: [""],
      });
    }
  } else {
    res.render("landing-page");
  }
});

module.exports = router;
