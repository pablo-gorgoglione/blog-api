const mongoose = require("mongoose");
const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const oResponse = require("../lib/response").sendResponse;
const ObjectId = require("mongodb").ObjectId;
//const { post } = require("../routes");

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

exports.getOne = (req, res, next) => {
  let id = req.params.id;
  Post.findById(id)
    .then((post) => {
      if (!post) {
        return res.json(
          oResponse(0, "the post does not exist or some problem with it")
        );
      }
      return res.json(oResponse(1, "Ok", post));
    })
    .catch((err) => {
      return res.json(oResponse(0, err));
    });
};

exports.createOne = (req, res, next) => {
  let authorCreating = new ObjectId(req.user.id);

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
      return res.json(oResponse(1, "Post created successfully", data));
    })
    .catch((err) => {
      return res.json({ Succes: 0, err });
    });
};

exports.deleteOne = (req, res, next) => {
  let postToRemove = new ObjectId(req.params.id);
  Comment.deleteMany({ postId: postToRemove }).catch((err) =>
    res.json(oResponse(0, err))
  );

  let id = req.params.id;
  Post.findByIdAndRemove(id, (err, post) => {
    if (err) {
      res.json(oResponse(0, err));
    }
    res.json(oResponse(1, "Removed", post));
  });
};

exports.updateOne = (req, res, next) => {
  let postData = req.body;
  let id = req.params.id;

  Post.findByIdAndUpdate(id, postData, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        return res.json(oResponse(0, "Cannot update the post"));
      }
      return res.json(oResponse(1, "Post was updated successfully.", data));
    })
    .catch((err) => {
      return res.json(oResponse(0, err));
    });
};

//update? one or many ??
