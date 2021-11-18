const router = require("express").Router({ mergeParams: true });
const commentController = require("../controllers/commentController");

router.post("/", commentController.createOne);
router.post("/:commentId", commentController.createOne);
router.delete("/:id", commentController.deleteOne);
router.put("/:id", commentController.updateOne);
router.get("/", commentController.getAllForOnePost);
module.exports = router;
