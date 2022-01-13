const router = require('express').Router();
const userController = require('../controllers/userController');
const passport = require('passport');

router.post('/register', userController.register);

router.post('/login', userController.login);

router.put(
  '/username',
  passport.authenticate('jwt', { session: false }),
  userController.changeUsername
);

router.put(
  '/password',
  passport.authenticate('jwt', { session: false }),
  userController.changePassword
);
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  userController.getOne
);

router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  userController.deleteOne
);

module.exports = router;
