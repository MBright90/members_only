const posts = require("../models/post");
const prisma = require("../config/database");

module.exports.addPostToDatabase = async function (req, res) {
  const { title, content } = req.body;
  const authorId = req.user.id;
  const author = req.user.username;

  try {
    await prisma.post.create({
      data: {
        title,
        content,
        author,
        authorId,
      },
    });

    res.redirect("/posts");
  } catch (err) {
    res.status(500).json({ err: err });
  }
};

module.exports.getUsersPosts = async function (req, res) {
  const authorId = req.params.userId;

  try {
    const result = await posts.getPostsByUserId(authorId);
    if (result.length > 0) {
      res.render("user-posts", { username: result[0].author, posts: result });
    } else {
      const author = await prisma.user.findFirst(authorId);
      res.render("user-posts", { username: author.username, posts: [] });
    }
  } catch (err) {
    res.status(500).json({ err: err });
  }
};

module.exports.getRecentPosts = async function (req, res) {
  try {
    const result = await posts.getRecentPosts();
    res.render("recent-posts", { posts: result });
  } catch (err) {
    res.status(500).json({ err: err });
  }
};
