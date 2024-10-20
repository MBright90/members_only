module.exports.isAuth = function (req, res, next) {
  if (req.isAuthenticated()) next();
  else
    res
      .status(401)
      .json({ msg: "You are not authorized to view this resource" });
};

module.exports.isPaid = function (req, res, next) {
  if (req.user.membership == "paid") next();
  else
    res
      .status(401)
      .json({ msg: "You need a paid membership to view this resource" });
};
