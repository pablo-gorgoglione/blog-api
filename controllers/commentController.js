const mongoose = require('mongoose');
const Comment = require('../models/CommentModel');
const ObjectId = require('mongodb').ObjectId;
const oResponse = require('../lib/response').sendResponse;
// extra
const User = require('../models/UserModel');

// function to create the object Comment
function createComment(userId, postId, content, commentParentId) {
  if (commentParentId == false) {
    const newComment = new Comment({
      userId: userId,
      postId: postId,
      content: content,
    });
    return newComment;
  } else {
    const newComment = new Comment({
      userId: userId,
      postId: postId,
      commentParentId: commentParentId,
      content: content,
    });
    return newComment;
  }
}

exports.createOne = async (req, res, next) => {
  // assign the necessary ids
  let user_id = new ObjectId(req.user.id);
  let post_id = new ObjectId(req.params.idPost);
  let content = req.body.content;
  if (req.params.idComment) {
    //If it is a comment of a comment
    let commentParent_id = new ObjectId(req.params.idComment);

    // create the comment object
    newComment = createComment(user_id, post_id, commentParent_id, content);

    //save the to the DB
    try {
      const comments = await newComment.save(newComment);
      return res.status(200).json(oResponse(1, data));
    } catch (err) {
      return res.status(500).json(oResponse(0, err));
    }
  } else {
    // If it is a comment of a post
    newComment = createComment(user_id, post_id, content, false);
    try {
      const data = await newComment.save(newComment);
      return res.status(200).json(oResponse(1, data));
    } catch (err) {
      return res.status(500).json(oResponse(0, err));
    }
  }
};

exports.deleteOne = async (req, res, next) => {
  let id = req.params.idComment;
  let user_id = new ObjectId(req.user.id);

  try {
    const findComment = await Comment.findById(id);
    if (findComment) {
      if (findComment.userId.toString() == user_id.toString()) {
        deletedComment = await Comment.findByIdAndDelete(id);
        if (deletedComment) {
          return res.status(200).json(oResponse(1, deletedComment));
        }
        return res.status(500).json(oResponse(0, ''));
      }
      return res.send(oResponse(0, 'You can only delete your comments'));
    }
    return res.json(oResponse(0, 'Comment not found'));
  } catch (err) {
    return res.json(oResponse(0, err));
  }
};

exports.updateOne = (req, res, next) => {
  let commentData = req.body;
  let id = req.params.idComment;

  Comment.findByIdAndUpdate(id, commentData, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        return res.status(500).json(oResponse(0, 'Cannot update the post'));
      }
      return res.status(201).json(oResponse(1, data));
    })
    .catch((err) => {
      return res.status(500).json(oResponse(0, err));
    });
};

exports.getAllForOnePost = (req, res, next) => {
  let post_Id = req.params.idPost;
  var commentSearch = new ObjectId(post_Id);

  Comment.find({ postId: commentSearch })
    .populate({ path: 'userId', select: 'username' })
    .exec()
    .then((comments) => {
      if (!comments) {
        return res.status(400).json(oResponse(0, 'No comments found'));
      }
      return res.status(200).json(oResponse(1, comments));
    })
    .catch((err) => {
      return res.status(500).json(oResponse(0, err));
    });
};
