const prisma = require("../config/database");
const { formatTimeAgo } = require("../lib/timeUtils");

module.exports.addCommentToDatabase = async function (req, res) {
  const { content } = req.body;
  const postId = parseInt(req.body.postId);
  const authorId = req.user.id;

  try {
    await prisma.comment.create({
      data: {
        content,
        postId,
        authorId,
      },
    });

    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.log(`Error uploading post: ${err}`);
    res.status(500).render("./errors/error", {
      user: req.user,
      errMsg: ["Error adding comment", "Please try again later"],
    });
  }
};

module.exports.postReportComment = async function (req, res) {
  const { reason, commentId } = req.body;

  try {
    await prisma.commentReport.create({
      data: {
        commentId,
        reason,
      },
    });

    res.redirect("/posts");
  } catch (err) {
    console.log(`Error adding comment: ${err}`);
    res.render("./errors/error", {
      user: req.user,
      errMsg: ["Error creating report", "Please try again later"],
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
    res.status(500).render("./errors/error", {
      user: req.user,
      errMsg: ["Error retrieving post reports", "Please try again later"],
    });
  }
};
