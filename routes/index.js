const router = require("express").Router();
const passport = require("passport");
const postController = require("../controllers/postController");

router.use("/user", require("./userRoutes"));

// original
router.get("/post/", postController.getAll);

router.use(
  "/post",
  passport.authenticate("jwt", { session: false }),
  require("./postRoutes")
);
// router.use("/post", require("./postRoutes"));

module.exports = router;
