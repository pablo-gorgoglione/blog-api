const router = require('express').Router({ mergeParams: true });
const postController = require('../controllers/postController');

router.get('/', postController.getAllNotPublished);

router.put('/:idPost', postController.updateOne);

router.delete('/:idPost', postController.deleteOne);
router.post('/', postController.createOne);

module.exports = router;
