const db = require("../config/database");

// TABLE posts
// id: integer,
// author_id: integer,
// title: VARCHAR,
// message: VARCHAR,
// date_time: datetime YYYY--MM-DD HH:MI:SS

module.export.createNewPost = async function (userId, title, message) {
  await db.query(
    "INSERT INTO posts (author_id, title, message, date_time) VALUES (($1), ($2), ($3), NOW())",
    [userId, title, message],
  );
};

module.exports.getPostById = async function (postId) {
  const { rows } = db.query(
    "SELECT posts.id, title, message, date_time, username AS author FROM posts\
     JOIN users ON posts.author_id = users.id\
     WHERE id = $($1)",
    [postId],
  );
  return rows[0] || new Error("Post not found");
};

module.exports.getRecentPosts = async function () {
  const { rows } = await db.query(
    "SELECT posts.id, title, message, date_time, username AS author FROM posts\
     JOIN users ON posts.author_id = users.id\
     ORDER BY date_time LIMIT 10;",
  );
  return rows.length > 0 ? rows : new Error("No posts found");
};

module.exports.getPostsByUserId = async function (userId) {
  const { rows } = await db.query(
    "SELECT posts.id, author_id, title, message, date_time, username AS author FROM posts \
     JOIN users ON posts.author_id = users.id\
     WHERE users.id = $1;",
    [userId],
  );
  return rows.length > 0 ? rows : new Error("No posts found for user");
};
