const mongoose = require('mongoose');
const genSaltHash = require('../lib/utils').genPassword;
const User = require('../models/UserModel');
const utils = require('../lib/utils');
const sendResponse = require('../lib/response').sendResponse;

exports.register = async (req, res, next) => {
  const user_name = req.body.username;
  if (!user_name) {
    return res.status(400).json(sendResponse(0, "Username can't be empty"));
  }
  try {
    const data = await User.findOne({ username: user_name });
    if (data) {
      return res
        .status(400)
        .json(sendResponse(0, 'The username is already in use'));
    }
  } catch (err) {
    return res.status(502).json(sendResponse(0, err));
  }

  saltHash = genSaltHash(req.body.password);

  const newUser = new User({
    role: req.body.role,
    username: req.body.username,
    dateJoined: Date.now(),
    hash: saltHash.hash,
    salt: saltHash.salt,
  });

  try {
    user = await newUser.save();
    res.status(200).json(sendResponse(1, { user: user }));
  } catch (err) {
    res.status(500).json(sendResponse(0, err));
  }
};

exports.login = async (req, res, next) => {
  const user_name = req.body.username;
  try {
    user = await User.findOne({ username: user_name });
    if (!user) {
      return res.status(400).json(sendResponse(0, 'User does not exist'));
    }
    const isValid = utils.validPassword(
      req.body.password,
      user.hash,
      user.salt
    );
    if (isValid) {
      const tokenObject = utils.issueJWT(user);
      res.status(200).json(
        sendResponse(1, {
          username: user_name,
          token: tokenObject.token,
          experiesIn: tokenObject.expires,
        })
      );
    } else {
      res.status(400).json(sendResponse(0, 'Wrong user data'));
    }
  } catch (err) {
    res.status(500).json(sendResponse(0, err));
  }
};

exports.changeUsername = async (req, res, next) => {
  let newUsername = req.body.newusername;
  user_id = req.user.id;

  try {
    updateUser = await User.findOne({ _id: user_id });
    if (!updateUser) {
      return res.status(500).json(0, 'cant find the user');
    }
    updateUser.username = newUsername;
    data = await User.findByIdAndUpdate(
      user_id,
      updateUser,

      { runValidators: true }
    );
    if (!data) {
      return res
        .status(500)
        .json(sendResponse(0, 'cannot update the username'));
    }
    return res
      .status(200)
      .json(sendResponse(1, { newUsername: newUsername, data }));
  } catch (err) {
    return res.status(500).json(sendResponse(0, err));
  }
};

exports.changePassword = async (req, res, next) => {
  let newPassword = req.body.newpassword;
  user_id = req.user.id;
  try {
    updateUser = await User.findOne({ _id: user_id });
    if (!updateUser) {
      return res.status(500).json(0, 'cant find the user');
    }

    newSaltHash = utils.genPassword(newPassword);

    updateUser.salt = newSaltHash.salt;
    updateUser.hash = newSaltHash.hash;

    data = await User.findByIdAndUpdate(user_id, updateUser, {
      useFindAndModify: false,
    });
    if (!data) {
      return res
        .status(500)
        .json(sendResponse(0, 'cannot update the password'));
    }
    return res
      .status(200)
      .json(sendResponse(1, { newPassword: newPassword, data }));
  } catch (err) {
    return res.status(500).json(sendResponse(0, err));
  }
};

//Test for aunthenticated route.
exports.home = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: 'You are successfully authenticated to this route!',
    userId: req.user._id,
  });
};
