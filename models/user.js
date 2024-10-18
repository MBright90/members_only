const db = require("../config/database");

async function getUserByUsername(username) {
  const { rows } = await db.query(
    "SELECT * FROM users WHERE username = ($1);",
    [username],
  );
  return rows[0] || new Error("User not found");
}

async function getUserById(userId) {
  const { rows } = await db.query("SELECT * FROM users WHERE id = ($1);", [
    userId,
  ]);
  return rows[0] || new Error("User not found");
}

async function createNewUser(
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
  console.log(`new user registered: ${username}`);
}

module.exports = {
  getUserByUsername,
  getUserById,
  createNewUser,
};
