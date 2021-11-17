const router = require("express").Router();
const postController = require("../controllers/postController");
const passport = require("passport");

router.get("/allPosts", postController.getAll);
router.post(
  "/one",
  passport.authenticate("jwt", { session: false }),
  postController.createOne
);

module.exports = router;
