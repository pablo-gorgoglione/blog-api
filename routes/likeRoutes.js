const router = require("express").Router({ mergeParams: true });
const likeController = require("../controllers/likeController");
router.post("/", likeController.upVote);
router.delete("/", likeController.downVote);
module.exports = router;
