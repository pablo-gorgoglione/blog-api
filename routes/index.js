const router = require('express').Router();
const passport = require('passport');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

//funcion to see if the current user is author or not
function isAuthor(req, res, next) {
  if (req.user.role === 0) {
    res.json({ message: 'You are not authorized' });
  }
  next();
}

router.use(
  '/user/post',
  passport.authenticate('jwt', { session: false }),
  require('./postUserRoutes')
);

router.use(
  '/author/post',
  passport.authenticate('jwt', { session: false }),
  isAuthor,
  require('./postAuthorRoutes')
);

router.use('/user', require('./userRoutes'));

router.use('/post', require('./postRoutes'));

module.exports = router;
