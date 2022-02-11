const router = require('express').Router();
const passport = require('passport');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

router.get('/post', postController.getAll);
router.get('/post/:idPost', postController.getOne);
router.get('/post/:idPost/comment', commentController.getAllForOnePost);

router.use(
  '/post',
  passport.authenticate('jwt', { session: false }),
  require('./postRoutes')
);
router.use('/user', require('./userRoutes'));

module.exports = router;
