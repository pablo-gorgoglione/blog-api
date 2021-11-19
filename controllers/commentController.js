const mongoose = require("mongoose");
const Comment = require("../models/CommentModel");
const ObjectId = require("mongodb").ObjectId;
const oResponse = require("../lib/response").sendResponse;

exports.createOne = (req, res, next) => {
  if (req.params.idComment) {
    //If it is a comment of a comment
    let userCommenting = new ObjectId(req.user.id);
    let postCommment = new ObjectId(req.params.idPost);
    let parentPostCommment = new ObjectId(req.params.idComment);

    const newComment = new Comment({
      userId: userCommenting,
      postId: postCommment,
      content: req.body.content,
      commentParentId: parentPostCommment,
    });

    newComment
      .save(newComment)
      .then((data) => {
        return res.json(oResponse(1, "Created", data));
      })
      .catch((err) => {
        return res.json(oResponse(0, err));
      });
  } else {
    // If it is a comment of a post
    let userCommenting = new ObjectId(req.user.id);
    let postCommment = new ObjectId(req.params.idPost);

    const newComment = new Comment({
      userId: userCommenting,
      postId: postCommment,
      content: req.body.content,
    });

    newComment
      .save(newComment)
      .then((data) => {
        return res.json(oResponse(1, "Created", data));
      })
      .catch((err) => {
        return res.json(oResponse(0, err));
      });
  }
};

exports.deleteOne = (req, res, next) => {
  let id = req.params.idComment;
  Comment.findByIdAndDelete(id, (err, post) => {
    if (err) {
      res.json(oResponse(0, err));
    }
    res.json(oResponse(1, "Removed", post));
  });
};

exports.updateOne = (req, res, next) => {
  let commentData = req.body;
  let id = req.params.idComment;
  Comment.findByIdAndUpdate(id, commentData, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        return res.json(oResponse(0, "Cannot update the post"));
      }
      return res.json(oResponse(1, "Comment was updated successfully", data));
    })
    .catch((err) => {
      return res.json(oResponse(0, err));
    });
};

exports.getAllForOnePost = (req, res, next) => {
  let post_Id = req.params.idPost;
  var commentSearch = new ObjectId(post_Id);
  console.log(commentSearch);

  Comment.find({ postId: commentSearch })
    .then((data) => {
      if (!data) {
        return res.json(oResponse(0, "No comments found"));
      }
      return res.json(oResponse(1, "Ok", data));
    })
    .catch((err) => {
      return res.json(oResponse(0, err));
    });
};
