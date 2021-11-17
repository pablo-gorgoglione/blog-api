const router = require("express").Router();

router.use("/author", require("./authorRoutes"));
router.use("/post", require("./postRoutes"));

module.exports = router;
