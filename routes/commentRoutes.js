const router = require('express').Router({ mergeParams: true });
const commentController = require('../controllers/commentController');

router.post('/', commentController.createOne);
router.use('/:idComment/like', require('./likeRoutes'));
router.delete('/:idComment', commentController.deleteOne);
// router.post('/:idComment', commentController.createOne);
// router.put('/:idComment', commentController.updateOne);

module.exports = router;
