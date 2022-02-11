const mongoose = require('mongoose');
const User = require('../models/UserModel');
const genSaltHash = require('../lib/utils').genPassword;
const utils = require('../lib/utils');
const sendResponse = require('../lib/response').sendResponse;

exports.register = async (req, res, next) => {
  try {
    const user_name = req.body.username;
    if (!user_name) {
      return res.status(400).json(sendResponse(0, "Username can't be empty"));
    }

    const data = await User.findOne({ username: user_name });
    if (data) {
      return res
        .status(400)
        .json(sendResponse(0, 'The username is already in use'));
    }

    saltHash = genSaltHash(req.body.password);

    const newUser = new User({
      username: req.body.username,
      hash: saltHash.hash,
      salt: saltHash.salt,
      dateJoined: Date.now(),
      role: req.body.role,
    });

    user = await newUser.save();
    res.status(201).json(sendResponse(1, user));
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
          _id: user._id,
          experiesIn: tokenObject.expires,
          likedPosts: user.likedPosts,
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
      return res.status(500).json(sendResponse(0, 'cant find the user'));
    }

    if (updateUser.username === newUsername) {
      return res
        .status(400)
        .json(sendResponse(0, "That's your current username"));
    }
    checkName = await User.findOne({ username: newUsername });
    if (checkName) {
      return res
        .status(400)
        .json(sendResponse(0, 'Username is already in use '));
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

exports.getOne = async (req, res, next) => {
  // let user_id = req.params.idUser; // ????? is in the req.user
  const user_id = req.user.id;
  try {
    user = await User.findById(user_id).select(['-hash', '-salt']);
    if (!user) {
      return res.status(500).json(sendResponse(0, 'Cannot find the user'));
    }

    return res.status(200).json(sendResponse(1, user));
  } catch (error) {
    return res.status(500).json(sendResponse(0, error));
  }
};

exports.deleteOne = async (req, res, next) => {
  user_id = req.user.id;

  user = await User.findByIdAndDelete(user_id);
  if (!user) {
    return res.status(500).json(sendResponse(0, 'Cannot delete the user'));
  }
  return res
    .status(200)
    .json(
      sendResponse(1, { userDeleted: user.username + ' has been deleted' })
    );
};
