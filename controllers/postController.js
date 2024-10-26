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
  const authorId = parseInt(req.params.userId);

  // if authorId is not a valid INT
  if (!authorId) {
    res.render("errors/error", {
      user: req.user,
      errMsg: ["That user does not exist"],
    });
  }

  try {
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

    const formattedPosts = result.map((post) => {
      post.createdAgo = formatTimeAgo(post.createdAt);
      return post;
    });

    if (result.length > 0) {
      res.render("user-posts", {
        posts: formattedPosts,
        user: req.user,
        author: formattedPosts[0].author.username,
        errMsg: null,
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
          errMsg: null,
        });
      } else {
        res.render("errors/error", {
          user: req.user,
          errMsg: ["That user does not exist"],
        });
      }
    }
  } catch (err) {
    console.log(`Err retrieving posts for user ${authorId}: ${err}`);
    res.render("user-posts", {
      posts: [],
      user: req.user,
      author: null,
      errMsg: `Err retrieving posts for user`,
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
      errMsg: null,
    });
  } catch (err) {
    console.log(`Error retrieving recent posts: ${err}`);
    res.render("recent-posts", {
      posts: [],
      user: req.user,
      errMsg: "Error retrieving recent posts",
    });
  }
};

module.exports.getReportForm = async function (req, res) {
  const { postId } = req.params;

  try {
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
        id: parseInt(postId),
      },
    });

    if (result) {
      const formattedPost = {
        ...result,
        createdAgo: formatTimeAgo(result.createdAt),
      };

      res.render("./forms/report-form", {
        post: formattedPost,
        user: req.user,
        errMsg: null,
      });
    } else {
      res.render("./errors/error", {
        user: req.user,
        errMsg: ["Could not retrieve post", "Please try again later"],
      });
    }
  } catch (err) {
    console.log(`Err retrieving post ${postId} for report: ${err}`);
    res.render("./forms/report-form", {
      post: null,
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
    res.status(500).render("errors/error", {
      user: req.user,
      errMsg: ["Error retrieving post reports", "Please try again later"],
    });
  }
};

module.exports.getAdminDashboardComments = async function (req, res) {
  try {
    const result = await prisma.commentReport.findMany({
      select: {
        id: true,
        reason: true,
        resolved: true,
        comment: {
          select: {
            id: true,
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
      report.comment.createdAgo = formatTimeAgo(report.comment.createdAt);
      return report;
    });

    res.render("adminDashboardComments", {
      user: req.user,
      reports: formattedReports,
    });
  } catch (err) {
    console.log(`Error retrieving post reports: ${err}`);
    res.status(500).render("errors/error", {
      user: req.user,
      errMsg: ["Error retrieving post reports", "Please try again later"],
    });
  }
};

module.exports.postReportForm = async function (req, res) {
  const postId = parseInt(req.body.postId);
  const { reason } = req.body;

  try {
    await prisma.postReport.create({
      data: {
        postId,
        reason,
      },
    });
    res.redirect("/");
  } catch (err) {
    console.log(`Error reporting post: ${err}`);
    res.status(401).render(`errors/error`, {
      user: req.user,
      errMsg: ["Error reporting post", "Please try again later"],
    });
  }
};
