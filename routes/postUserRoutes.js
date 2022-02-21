const router = require('express').Router({ mergeParams: true });

router.use('/:idPost/comment', require('./commentRoutes'));

router.use('/:idPost/like', require('./likeRoutes'));

module.exports = router;
