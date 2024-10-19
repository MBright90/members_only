const db = require("../config/database");

// TABLE users
// id: integer,
// username: VARCHAR,
// first_name: VARCHAR,
// last_name: VARCHAR,
// hash: VARCHAR,
// salt: VARCHAR,
// membership: VARCHAR (paid/free)

module.exports.createNewUser = async function (
  username,
  firstName,
  lastName,
  salt,
  hash,
  membership = "free",
) {
  await db.query(
    "INSERT INTO users (username, first_name, last_name, hash, salt, membership) VALUES (($1), ($2), ($3), ($4), ($5), ($6));",
    [username, firstName, lastName, hash, salt, membership],
  );
};

module.exports.getUserByUsername = async function (username) {
  const { rows } = await db.query(
    "SELECT * FROM users WHERE username = ($1);",
    [username],
  );
  return rows[0] || new Error("User not found");
};

module.exports.getUserById = async function (userId) {
  const { rows } = await db.query("SELECT * FROM users WHERE id = ($1);", [
    userId,
  ]);
  return rows[0] || new Error("User not found");
};
