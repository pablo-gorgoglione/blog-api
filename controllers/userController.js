const mongoose = require("mongoose");
const genPassword = require("../lib/utils").genPassword;
const User = require("../models/UserModel");
const utils = require("../lib/utils");
const sendResponse = require("../lib/response").sendResponse;

exports.register = async (req, res, next) => {
  const newUser = new User({
    role: req.body.role,
    username: req.body.username,
    dateJoined: Date.now(),
    hash: "",
    salt: "",
  });
  const saltHash = genPassword(req.body.password);
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  newUser.salt = salt;
  newUser.hash = hash;

  try {
    newUser.save().then((user) => {
      res.json(sendResponse(1, "Registered", { user: user }));
    });
  } catch (err) {
    res.json(sendResponse(0, err));
  }
};

exports.login = async (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        return res.status(401).json(sendResponse(0, "Could not find User"));
      }
      const isValid = utils.validPassword(
        req.body.password,
        user.hash,
        user.salt
      );
      if (isValid) {
        const tokenObject = utils.issueJWT(user);
        res.status(200).json(
          sendResponse(1, "Logged", {
            token: tokenObject.token,
            experiesIn: tokenObject.expires,
          })
        );
      } else {
        res.status(401).json(sendResponse(0, "Wrong user data"));
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.home = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: "You are successfully authenticated to this route!",
    userId: req.user._id,
  });
};
