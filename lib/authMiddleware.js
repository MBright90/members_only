module.exports.isAuth = function (req, res, next) {
  if (req.isAuthenticated()) next();
  else
    res
      .status(401)
      .json({ msg: "You are not authorized to view this resource" });
};

module.exports.isPaid = function (req, res, next) {
  if (req.user.paid == true) next();
  else
    res
      .status(401)
      .json({ msg: "You need a full membership to view this resource" });
};

module.exports.isAdmin = function (req, res, next) {
  if (req.user.admin == true) next();
  else
    res
      .status(401)
      .json({ msg: "You need a full membership to view this resource" });
};
