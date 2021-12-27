const router = require('express').Router();
const passport = require('passport');
const postController = require('../controllers/postController');

router.use('/user', require('./userRoutes'));

// original
router.get('/post', postController.getAll);
router.get('/post/:idPost', postController.getOne);

router.use(
  '/post',
  passport.authenticate('jwt', { session: false }),
  require('./postRoutes')
);

module.exports = router;
