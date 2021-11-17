const router = require("express").Router();
const AuthController = require("../controllers/authorController");
const passport = require("passport");

// pasport JWT authenticate
const isAuthenticated = function (req, res, next) {
  passport.authenticate("jwt", { session: false });
  next();
};

router.get("/register", AuthController.register);

router.post("/login", AuthController.login);

router.get(
  "/home",
  passport.authenticate("jwt", { session: false }),
  AuthController.home
);

module.exports = router;
