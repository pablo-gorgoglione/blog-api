const mongoose = require("mongoose");
const Comment = require("../models/CommentModel");
const ObjectId = require("mongodb").ObjectId;
const oResponse = require("../lib/response").sendResponse;

exports.createOne = (req, res, next) => {
  //id of the post req.params
  //id of the user req.user
  //content  req.body

  if (req.params.commentId) {
    let userCommenting = new ObjectId(req.user.id);
    let postCommment = new ObjectId(req.params.id);
    let parentPostCommment = new ObjectId(req.params.commentId);

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
    let userCommenting = new ObjectId(req.user.id);
    let postCommment = new ObjectId(req.params.id);

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
  let id = req.params.id;
  Comment.findByIdAndDelete(id, (err, post) => {
    if (err) {
      res.json(oResponse(0, err));
    }
    res.json(oResponse(1, "Removed", post));
  });
};

exports.updateOne = (req, res, next) => {
  console.log(req.params.id);
  let commentData = req.body;
  let id = req.params.id;
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
  // let post_Id = "6195e3a922a0f8e9526304d8";
  let post_Id = req.params.id;
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

//update
//get all
