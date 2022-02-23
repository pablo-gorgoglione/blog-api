const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
// extra
const User = require('../models/UserModel');
const Post = require('../models/PostModel');
const Comment = require('../models/CommentModel');
const oResponse = require('../lib/response').sendResponse;

exports.createOne = async (req, res, next) => {
  //CREATE IDS
  let user_id = new ObjectId(req.user.id);
  let post_id = new ObjectId(req.params.idPost);
  let content = req.body.content;

  // START TRANSACTION
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // CREATE COMMENT ON SESSION
    const comment = await Comment.create([
      { user: user_id, postId: post_id, content: content },
    ]);

    // FIND THE TARGET POST
    const findPost = await Post.findById(post_id);
    if (!findPost) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(oResponse(0, 'post does not exist'));
    }

    // UPDATE POST DATA (commentCounter) ON SESSION
    findPost.commentCounter = findPost.commentCounter + 1;
    const updatePost = await Post.findByIdAndUpdate(findPost._id, findPost, {
      useFindAndModify: false,
    }).session(session);
    if (!updatePost) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json(oResponse(0, 'Cannot update the post'));
    }

    // COMMIT TRANSACTION
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json(
      oResponse(1, {
        commentCounter: findPost.commentCounter,
        idComment: comment[0]._id,
      })
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json(oResponse(0, err));
  }
};

exports.deleteOne = async (req, res, next) => {
  let id = req.params.idComment;
  let post_id = req.params.idPost;

  // START TRANSACTION
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // FIND THE TARGET POST
    const findComment = await Comment.findById(req.params.idComment);
    if (!findComment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json(oResponse(0, 'Comment not found'));
    }

    // VALIDATE THAT THE USER IS THE AUTHOR OF THE COMMENT
    if (!findComment.user == req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(401)
        .send(oResponse(0, 'You can only delete your own comments'));
    }

    // DELETE COMMENT ON SESSION
    await Comment.findByIdAndDelete(id).session(session);

    // FIND THE TARGET POST
    const findPost = await Post.findById(post_id);
    if (!findPost) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(oResponse(0, 'post does not exist'));
    }

    // UPDATE POST DATA (commentCounter) ON SESSION
    findPost.commentCounter = findPost.commentCounter - 1;
    const updatePost = await Post.findByIdAndUpdate(findPost._id, findPost, {
      useFindAndModify: false,
    }).session(session);
    if (!updatePost) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json(oResponse(0, 'Cannot update the post'));
    }

    // COMMIT TRANSACTION
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(
      oResponse(1, {
        commentCounter: findPost.commentCounter,
      })
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json(oResponse(0, error));
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
  try {
    let query = Comment.find({ postId: commentSearch })
      .sort({ date: 'desc' })
      .populate({
        path: 'user',
        select: 'username _id',
      });
    let promise = query.exec();

    promise
      .then((comments) => {
        if (!comments) {
          return res.status(400).json(oResponse(0, 'No comments found'));
        }
        return res.status(200).json(oResponse(1, comments));
      })
      .catch((err) => {
        return res.status(500).json(oResponse(0, err));
      });
  } catch (error) {
    return res.status(500).json(oResponse(0, error));
  }
};
