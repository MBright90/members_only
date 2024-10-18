const crypto = require("crypto");

function _generateHash(string, salt) {
  return crypto.pbkdf2Sync(string, salt, 10000, 64, "sha512").toString("hex");
}

function generateHash(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = _generateHash(password, salt);
  return { salt, hash };
}

function validPassword(password, hash, salt) {
  const hashVerify = _generateHash(password, salt);
  return hash === hashVerify;
}

module.exports = {
  generateHash,
  validPassword,
};
