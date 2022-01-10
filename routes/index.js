const router = require('express').Router();
const passport = require('passport');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

router.use('/user', require('./userRoutes'));

router.get('/post', postController.getAll);
router.get('/post/:idPost', postController.getOne);
router.get('/post/:idPost/comment', commentController.getAllForOnePost);

router.use(
  '/post',
  passport.authenticate('jwt', { session: false }),
  require('./postRoutes')
);

module.exports = router;
