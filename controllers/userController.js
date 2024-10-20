const { generateHash } = require("../lib/passwordUtils");
const prisma = require("../config/database");

module.exports.addUserToDatabase = async function (req, res) {
  const { username, password, email, name } = req.body;
  const { salt, hash } = generateHash(password);

  try {
    await prisma.user.create({
      data: {
        username,
        email,
        salt,
        hash,
        name,
      },
    });
    res.redirect("/log-in");
  } catch (err) {
    res.status(500).json({ err: err });
  }
};

module.exports.getUserByUsername = async function (username) {
  try {
    const result = await prisma.user.findFirst({ where: { username } });
    return result;
  } catch (err) {
    return new Error(`Error retrieving user by username: ${err}`);
  }
};

module.exports.getUserById = async function (id) {
  try {
    const result = await prisma.user.findFirst({ id });
    return result;
  } catch (err) {
    return new Error(`Error retrieving user by id: ${err}`);
  }
};
