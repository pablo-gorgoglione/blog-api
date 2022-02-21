const router = require('express').Router({ mergeParams: true });
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

router.get('/', postController.getAll);
router.get('/:idPost/comment', commentController.getAllForOnePost);
router.get('/:idPost', postController.getOne);

module.exports = router;
