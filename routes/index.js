const router = require("express").Router();
const passport = require("passport");

router.use("/user", require("./userRoutes"));

router.use(
  "/post",
  passport.authenticate("jwt", { session: false }),
  require("./postRoutes")
);

module.exports = router;
