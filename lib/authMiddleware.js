module.exports.isAuth = function (req, res, next) {
  // Used for guests
  if (req.isAuthenticated()) next();
  else
    res.status(401).render("./errors/error", {
      user: { name: req.user?.username || null, id: req.user?.id || null },
      errMsg: ["You need an account to view this resource"],
    });
};

module.exports.isPaid = function (req, res, next) {
  // Used for general site functionality
  if (req.user.paid == true) next();
  else
    res.status(401).render("./errors/error", {
      user: { name: req.user?.username || null, id: req.user?.id || null },
      errMsg: ["You need a full membership to view this resource"],
    });
};

module.exports.isAdmin = function (req, res, next) {
  // Used for admin pages
  if (req.user.admin == true) next();
  else
    res.status(401).render("./errors/error", {
      user: { name: req.user?.username || null, id: req.user?.id || null },
      errMsg: ["You need admin privileges to view this resource"],
    });
};
