const router = require("express").Router();
const postController = require("../controllers/postController");

//middleware to see if the current user is author or not
function isAuthor(req, res, next) {
  if (req.user.role === 0) {
    res.json({ message: "You are not authorized" });
  }
  next();
}
//routes

//get all
// router.get("/", postController.getAll);

//get one
router.get("/:idPost", postController.getOne);

//create one
router.post("/", isAuthor, postController.createOne);

//delete one
router.delete("/:idPost", isAuthor, postController.deleteOne);

//update one
router.put("/:idPost", isAuthor, postController.updateOne);

router.use("/:idPost/comment", require("./commentRoutes"));
router.use("/:idPost/like", require("./likeRoutes"));

module.exports = router;
