const mongoose = require("mongoose");
const genPassword = require("../lib/utils").genPassword;
const Author = require("../models/AuthorModel");
const utils = require("../lib/utils");
const sendResponse = require("../lib/response").sendResponse;

exports.register = async (req, res, next) => {
  const newAuthor = new Author({
    username: "pabloDos",
    dateJoined: Date.now(),
    hash: "",
    salt: "",
  });

  // const saltHash = genPassword(req.body.pw);
  const saltHash = genPassword("12345");
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  newAuthor.salt = salt;
  newAuthor.hash = hash;

  try {
    newAuthor.save().then((author) => {
      res.json(sendResponse(1, "Registered", { author: author }));
    });
  } catch (err) {
    res.json(sendResponse(0, err));
  }
};

exports.login = async (req, res, next) => {
  Author.findOne({ username: req.body.username })
    .then((author) => {
      if (!author) {
        return res.status(401).json(sendResponse(0, "Could not find User"));
      }
      const isValid = utils.validPassword(
        req.body.password,
        author.hash,
        author.salt
      );
      if (isValid) {
        const tokenObject = utils.issueJWT(author);
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
    authorId: req.user._id,
  });
};
