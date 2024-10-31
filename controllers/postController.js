const prisma = require("../config/database");
const { formatTimeAgo } = require("../lib/timeUtils");

module.exports.addPostToDatabase = async function (req, res) {
  const { title, content } = req.body;
  const authorId = req.user.id;

  try {
    await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
    });

    res.redirect("/posts");
  } catch (err) {
    console.log(`Error uploading post: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Error adding post to database", "Please try again later"],
    });
  }
};

module.exports.getUsersPosts = async function (req, res) {
  try {
    const authorId = parseInt(req.params.userId);
    if (isNaN(authorId)) throw new Error("User does not exist");

    const result = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        authorId: authorId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (result.length > 0) {
      const formattedPosts = result.map((post) => {
        post.createdAgo = formatTimeAgo(post.createdAt);
        return post;
      });

      res.render("user-posts", {
        posts: formattedPosts,
        user: req.user,
        author: formattedPosts[0].author.username,
      });
    } else {
      const author = await prisma.user.findFirst({
        where: {
          id: authorId,
        },
      });
      if (author) {
        res.render("user-posts", {
          posts: [],
          user: req.user,
          author: author.username,
        });
      } else {
        throw new Error("That user does not exist");
      }
    }
  } catch (err) {
    console.log(`Err retrieving posts for user ${req.params.userId}: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving posts for user"],
    });
  }
};

module.exports.getPostWithComments = async function (req, res) {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) throw new Error("Invalid postId");

    const result = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (result) {
      result.createdAgo = formatTimeAgo(result.createdAt);
      result.comments.forEach((comment) => {
        comment.createdAgo = formatTimeAgo(comment.createdAt);
      });
      res.render("post", {
        user: req.user,
        post: result,
      });
    } else {
      res.render("/errors/error", {
        user: req.user,
        errMsg: ["Could not retrieve post"],
      });
    }
  } catch (err) {
    console.log(`Error retrieving post with comments: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Could not retrieve post"],
    });
  }
};

module.exports.getRecentPosts = async function (req, res) {
  try {
    const result = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const formattedPosts = result.map((post) => {
      post.createdAgo = formatTimeAgo(post.createdAt);
      return post;
    });

    res.render("recent-posts", {
      posts: formattedPosts,
      user: req.user,
    });
  } catch (err) {
    console.log(`Error retrieving recent posts: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving recent posts"],
    });
  }
};

module.exports.getReportForm = async function (req, res) {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) throw new Error("Invalid postId");

    const result = await prisma.post.findFirst({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        id: postId,
      },
    });

    if (result) {
      const formattedPost = {
        ...result,
        createdAgo: formatTimeAgo(result.createdAt),
      };

      res.render("./forms/report-post-form", {
        post: formattedPost,
        user: req.user,
      });
    } else {
      res.render("/errors/error", {
        user: req.user,
        errMsg: ["Could not retrieve post", "Please try again later"],
      });
    }
  } catch (err) {
    console.log(`Err retrieving post ${req.params.postId} for report: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Could not match report to post", "Please try again later"],
    });
  }
};

module.exports.getAdminDashboardPosts = async function (req, res) {
  try {
    const result = await prisma.postReport.findMany({
      select: {
        id: true,
        reason: true,
        resolved: true,
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      where: {
        resolved: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const formattedReports = result.map((report) => {
      report.post.createdAgo = formatTimeAgo(report.post.createdAt);
      return report;
    });

    res.render("adminDashboardPosts", {
      user: req.user,
      reports: formattedReports,
    });
  } catch (err) {
    console.log(`Error retrieving post reports: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving post reports", "Please try again later"],
    });
  }
};

module.exports.postReportForm = async function (req, res) {
  try {
    const { reason } = req.body;
    const postId = parseInt(req.body.postId);
    if (isNaN(postId)) throw new Error("Invalid postId");

    await prisma.postReport.create({
      data: {
        postId,
        reason,
      },
    });
    res.redirect("/");
  } catch (err) {
    console.log(`Error reporting post: ${err}`);
    res.status(500).render(`/errors/error`, {
      user: req.user,
      errMsg: ["Error reporting post", "Please try again later"],
    });
  }
};

module.exports.deletePostFromReport = async function (req, res) {
  try {
    const reportId = parseInt(req.params.reportId);
    if (isNaN(reportId)) throw new Error("Invalid reportId");

    await prisma.$transaction(async (db) => {
      // Retrieve and resolve report
      const updateReport = await db.postReport.update({
        where: {
          id: reportId,
        },
        data: {
          resolved: true,
        },
      });

      // delete comment
      const deleteResult = await db.post.delete({
        where: {
          id: updateReport.postId,
        },
      });

      console.log(
        `Deleting post ${updateReport.postId} via report ${reportId}: ${JSON.stringify(deleteResult, null, 2)}`,
      );
    });
    res.redirect("/dashboard/posts");
  } catch (err) {
    console.log(`Err deleting post by report: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  }
};

module.exports.resolvePostFromReport = async function (req, res) {
  try {
    const reportId = parseInt(req.params.reportId);
    if (isNaN(reportId)) throw new Error("Invalid reportId");

    const result = await prisma.postReport.update({
      where: {
        id: reportId,
      },
      data: {
        resolved: true,
      },
    });
    console.log(
      `Resolved report ${reportId}: ${JSON.stringify(result, null, 2)}`,
    );
    res.redirect("/dashboard/posts");
  } catch (err) {
    console.log(`Err resolving report: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  }
};
