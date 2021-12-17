const router = require('express').Router({ mergeParams: true });
const likeController = require('../controllers/likeController');
router.post('/', likeController.like);
router.delete('/', likeController.dislike);
module.exports = router;
