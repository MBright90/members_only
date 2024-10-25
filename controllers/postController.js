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
    res.status(500).json({ err: err });
  }
};

module.exports.getUsersPosts = async function (req, res) {
  const authorId = parseInt(req.params.userId);

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
        user: { name: req.user.username, id: req.user.id },
        author: formattedPosts[0].author.username,
        errMsg: null,
      });
    } else {
      const author = await prisma.user.findFirst({
        where: {
          id: authorId,
        },
      });
      res.render("user-posts", {
        posts: [],
        user: { name: req.user.username, id: req.user.id },
        author: author.username,
        errMsg: null,
      });
    }
  } catch (err) {
    console.log(`Err retrieving posts for user ${authorId}: ${err}`);
    res.render("user-posts", {
      posts: [],
      user: { name: req.user.username, id: req.user.id },
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
      user: { name: req.user.username, id: req.user.id },
      errMsg: null,
    });
  } catch (err) {
    console.log(`Error retrieving recent posts: ${err}`);
    res.render("recent-posts", {
      posts: [],
      user: { name: req.user.username, id: req.user.id },
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

    console.log(result);

    if (result) {
      const formattedPost = {
        ...result,
        createdAgo: formatTimeAgo(result.createdAt),
      };

      console.log(formattedPost);

      res.render("./forms/report-form", {
        post: formattedPost,
        user: { name: req.user.username, id: req.user.id },
        errMsg: null,
      });
    } else {
      res.render("./forms/report-form", {
        post: null,
        user: { name: req.user.username, id: req.user.id },
        errMsg: ["Could not find post", "Please try again later"],
      });
    }
  } catch (err) {
    console.log(`Err retrieving post ${postId} for report: ${err}`);
    res.render("./forms/report-form", {
      post: null,
      user: { name: req.user.username, id: req.user.id },
      errMsg: ["Could not match report to post", "Please try again later"],
    });
  }
};

module.exports.postReportForm = async function (req, res) {
  console.log(req.body);
  const postId = parseInt(req.body.postId);
  const { reason } = req.body;

  try {
    await prisma.report.create({
      data: {
        postId,
        reason,
      },
    });
    res.redirect("/");
  } catch (err) {
    console.log(`Error reporting post: ${err}`);
    res.status(401).render(`errors/error`, {
      user: { name: req.user.username, id: req.user.id },
      errMsg: ["Error reporting post", "Please try again later"],
    });
  }
};
