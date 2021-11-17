const mongoose = require("mongoose");
const Author = require("../models/AuthorModel");
const Post = require("../models/PostModel");
const oResponse = require("../lib/response").sendResponse;

exports.getAll = (req, res, next) => {
  Post.find()
    .then((posts) => {
      if (!posts) {
        return res.json(oResponse(0, "there are no posts"));
      }
      return res.json(oResponse(1, "All posts", posts));
    })
    .catch((err) => {
      return res.json(oResponse(0, err));
    });
};

exports.createOne = (req, res, next) => {
  let authorCreating = new Author();
  Author.findById(req.user._id).then((author) => {
    if (!author) {
      res.status(404).json(oResponse(0, "error on the findAuthor "));
    }
    authorCreating = new Author(author);
  });

  const newPost = new Post({
    authorId: authorCreating,
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags,
    isPublished: req.body.isPublished,
  });

  newPost
    .save(newPost)
    .then((data) => {
      return res.json(oResponse(1, "i think it was created", data));
    })
    .catch((err) => {
      return res.json({ Succes: 0, err });
    });
};

//delete

//update? one or many ??
