const router = require("express").Router({ mergeParams: true });
const commentController = require("../controllers/commentController");

router.post("/", commentController.createOne);
router.post("/:idComment", commentController.createOne);
router.delete("/:idComment", commentController.deleteOne);
router.put("/:idComment", commentController.updateOne);
router.get("/", commentController.getAllForOnePost);
router.use("/:idComment/like", require("./likeRoutes"));

module.exports = router;
