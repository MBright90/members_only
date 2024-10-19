const { generateHash } = require("../lib/passwordUtils");
const users = require("../models/user");

module.exports.addUserToDatabase = async function (req, res) {
  const { username, password, first_name, last_name, membership } = req.body;
  const { salt, hash } = generateHash(password);

  try {
    await users.createNewUser(
      username,
      first_name,
      last_name,
      salt,
      hash,
      membership,
    );
    res.redirect("/log-in");
  } catch (err) {
    res.status(500).json({ err: err });
  }
};

module.exports.getUserByUsername = async function (username) {
  try {
    const result = await users.getUserByUsername(username);
    return result;
  } catch (err) {
    return new Error(`Error retrieving user by username: ${err}`);
  }
};

module.exports.getUserById = async function (userId) {
  try {
    const result = await users.getUserById(userId);
    return result;
  } catch (err) {
    return new Error(`Error retrieving user by id: ${err}`);
  }
};
