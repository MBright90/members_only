const { generateHash } = require("../lib/passwordUtils");
const users = require("../models/user");

module.exports.addUserToDatabase = async function (userInput) {
  const { username, password, first_name, last_name, membership } = userInput;
  console.log("creating hash");

  const { salt, hash } = generateHash(password);

  console.log("creating user");

  await users.createNewUser(
    username,
    first_name,
    last_name,
    salt,
    hash,
    membership,
  );
};
