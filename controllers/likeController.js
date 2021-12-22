const mongoose = require('mongoose');
const Like = require('../models/LikeModel');
const oResponse = require('../lib/response').sendResponse;
const ObjectId = require('mongodb').ObjectId;
const Post = require('../models/PostModel');
const Comment = require('../models/CommentModel');

//TODO: - use a transaction for create the like and update the post likeCounter
exports.like = async (req, res) => {
  // get the ids to work with
  let idUser = new ObjectId(req.user.id);
  let idPost = new ObjectId(req.params.idPost);
  let idComment = new ObjectId(req.params.idComment);

  //userId and postId are the models ids

  // Create the like for a Post == has no idcomment ....
  if (!req.params.idComment) {
    const objLike = new Like({
      userId: idUser,
      postId: idPost,
    });
    try {
      //look for a user like in this post, -- only one per user
      const findLike = await Like.findOne({ userId: idUser })
        .where('postId')
        .equals(idPost);

      // if user Already has a like in the post, then he cannot like again
      if (findLike) {
        return res.status(400).json(oResponse(0, 'Only one like per user'));
      }

      //save the createLike == new like
      const newLike = await objLike.save(objLike);

      //search for the post that is being likedd
      const findPost = await Post.findById(idPost);
      if (!findPost) {
        return res.status(400).json(oResponse(0, 'post does not exist'));
      }

      //update the likeCounter
      findPost.likeCounter = findPost.likeCounter + 1;
      const updatePost = await Post.findByIdAndUpdate(idPost, findPost, {
        useFindAndModify: false,
      });
      if (!updatePost) {
        return res.status(500).json(oResponse(0, 'Cannot update the post'));
      }

      return res
        .status(200)
        .json(oResponse(1, { likeCounter: findPost.likeCounter }));
    } catch (err) {
      return res.status(400).json(oResponse(0, err));
    }
  } else {
    //create the like for a comment
    const objLike = new Like({
      userId: idUser,
      postId: idPost,
      commentId: idComment,
    });

    try {
      const findLike = await Like.findOne({ userId: idUser })
        .where('postId')
        .equals(idPost)
        .where('commentId')
        .equals(idComment);
      if (findLike) {
        return res.status(400).json(oResponse(0, 'Only one like per user'));
      }
      const newLike = await objLike.save(objLike);

      const findComment = await Comment.findById(idComment);
      if (!findComment) {
        return res.status(400).json(oResponse(0, 'comment does not exist'));
      }
      findComment.likeCounter = findComment.likeCounter + 1;
      const updateComment = await Comment.findByIdAndUpdate(
        idComment,
        findComment,
        { useFindAndModify: false }
      );
      if (!updateComment) {
        return res.status(500).json(oResponse(0, 'Cannot update the comment'));
      }
      return res
        .status(200)
        .json(oResponse(1, { likeCounter: findComment.likeCounter }));
    } catch (err) {
      return res.status(400).json(oResponse(0, err));
    }
  }
};

exports.dislike = async (req, res) => {
  // get the ids to work with
  let idUser = new ObjectId(req.user.id);
  let idPost = new ObjectId(req.params.idPost);
  let idComment = new ObjectId(req.params.idComment);

  //userId and postId are the models ids

  // Delete like for one Post == has no idcomment
  if (!req.params.idComment) {
    try {
      //look for a user like in this post, -- only one per user
      const findLike = await Like.findOne({ userId: idUser })
        .where('postId')
        .equals(idPost);

      // if user Already has a like in the post, then he cannot like again
      if (!findLike) {
        return res
          .status(400)
          .json(oResponse(0, "Can't downvote if you didn't upvote"));
      }
      await Like.findByIdAndDelete(findLike._id);
      const findPost = await Post.findById(idPost);
      if (!findPost) {
        return res.status(400).json(oResponse(0, 'post does not exist'));
      }
      findPost.likeCounter = findPost.likeCounter - 1;
      const updatePost = await Post.findByIdAndUpdate(idPost, findPost, {
        useFindAndModify: false,
      });
      if (!updatePost) {
        return res
          .status(500)
          .json(oResponse(0, 'Cannot update the post(like)'));
      }
      return res
        .status(200)
        .json(oResponse(1, { likeCounter: findPost.likeCounter }));
    } catch (err) {
      return res.status(400).json(oResponse(0, err));
    }
  } else {
    try {
      // Delete like for one Comment == has no idpost
      const findLike = await Like.findOne({ userId: idUser })
        .where('postId')
        .equals(idPost)
        .where('commentId')
        .equals(idComment);
      if (!findLike) {
        return res
          .status(400)
          .json(oResponse(0, "Can't downvote if you didn't upvote"));
      }
      await Like.findByIdAndDelete(findLike._id);
      const findComment = await Comment.findById(idComment);
      if (!findComment) {
        return res.status(400).json(oResponse(0, 'comment does not exist'));
      }
      findComment.likeCounter = findComment.likeCounter - 1;
      const updateComment = await Comment.findByIdAndUpdate(
        idComment,
        findComment,
        { useFindAndModify: false }
      );
      if (!updateComment) {
        return res
          .status(500)
          .json(oResponse(0, 'Cannot update the comment(like)'));
      }
      return res
        .status(200)
        .json(oResponse(1, { likeCounter: findComment.likeCounter }));
    } catch (err) {
      return res.status(400).json(oResponse(0, err));
    }
  }

  //TODO - comment Like
};
