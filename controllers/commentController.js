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
    console.log(`Error uploading comment: ${err}`);
    res.status(500).render("./errors/error", {
      user: req.user,
      errMsg: ["Error adding comment", "Please try again later"],
    });
  }
};

module.exports.postReportComment = async function (req, res) {
  const { reason } = req.body;
  const commentId = parseInt(req.body.commentId);

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
    res.status(500).render("./errors/error", {
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
    console.log(`Error retrieving comment reports: ${err}`);
    res.status(500).render("./errors/error", {
      user: req.user,
      errMsg: ["Error retrieving comment reports", "Please try again later"],
    });
  }
};

module.exports.getReportForm = async function (req, res) {
  const commentId = parseInt(req.params.commentId);

  try {
    const result = await prisma.comment.findFirst({
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        id: commentId,
      },
    });

    if (result) {
      const formattedComment = {
        ...result,
        createdAgo: formatTimeAgo(result.createdAt),
      };

      res.render("./forms/report-comment-form", {
        comment: formattedComment,
        user: req.user,
      });
    } else {
      res.render("./errors/error", {
        user: req.user,
        errMsg: ["Could not retrieve comment", "Please try again later"],
      });
    }
  } catch (err) {
    console.log(`Err retrieving Comment ${commentId} for report: ${err}`);
    res.status(500).render("./errors/error", {
      user: req.user,
      errMsg: ["Could not match report to comment", "Please try again later"],
    });
  }
};

module.exports.deleteCommentFromReport = async function (req, res) {
  const reportId = parseInt(req.params.reportId);

  try {
    await prisma.$transaction(async (db) => {
      // Retrieve and resolve report
      const updateReport = await db.commentReport.update({
        where: {
          id: reportId,
        },
        data: {
          resolved: true,
        },
      });

      // delete comment
      const deleteResult = await db.comment.delete({
        where: {
          id: updateReport.commentId,
        },
      });

      console.log(
        `Deleting comment ${updateReport.commentId} via report ${reportId}: ${JSON.stringify(deleteResult, null, 2)}`,
      );
    });
    res.redirect("/dashboard/comments");
  } catch (err) {
    console.log(`Err deleting comment by report: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  }
};

module.exports.resolveCommentFromReport = async function (req, res) {
  const reportId = parseInt(req.params.reportId);

  try {
    const result = await prisma.commentReport.update({
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
    res.redirect("/dashboard/comments");
  } catch (err) {
    console.log(`Err resolving report: ${err}`);
    res.status(500).render("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  }
};
