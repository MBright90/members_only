const posts = require("../models/post");
const { getUserById } = require("./userController");

module.exports.addPostToDatabase = async function (req, res) {
  const { title, message } = req.body;
  const author = req.user.id;

  try {
    await posts.createNewPost(author, title, message);
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
      const author = await getUserById(authorId);
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
