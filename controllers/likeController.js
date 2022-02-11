const mongoose = require('mongoose');
const Like = require('../models/LikeModel');
const oResponse = require('../lib/response').sendResponse;
const ObjectId = require('mongodb').ObjectId;
const Post = require('../models/PostModel');
const Comment = require('../models/CommentModel');
const User = require('../models/UserModel');

//TODO: - use a transaction for create the like and update the post likeCounter
exports.like = async (req, res) => {
  // get the ids to work with
  let idUser = new ObjectId(req.user.id);
  let idPost = new ObjectId(req.params.idPost);
  let idComment = new ObjectId(req.params.idComment);
  if (!idUser) {
    return res
      .status(401)
      .json(oResponse(0, 'You must be logged in to like it'));
  }

  //userId and postId are the models ids

  // Create the like for a Post == has no idcomment ....
  if (!req.params.idComment) {
    const objLike = new Like({
      userId: idUser,
      postId: idPost,
    });

    try {
      //look for a user like in this post, -- only one per user
      const validateExistence = await Like.findOne({
        userId: idUser,
        postId: idPost,
        commentId: { $exists: false },
      });
      // if user Already has a like in the post, then he cannot like again
      if (validateExistence) {
        await Like.findByIdAndDelete(validateExistence._id);
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

      //update user's likedPosts list
      const tempUser = await User.findById(idUser);
      if (tempUser) {
        tempUser.likedPosts.push(findPost._id);
      }
      const updateUser = await User.findByIdAndUpdate(idUser, tempUser, {
        useFindAndModify: false,
      });
      if (!updateUser) {
        return res.status(500).json(oResponse(0, 'Cannot update the user'));
      }

      return res.status(201).json(
        oResponse(1, {
          likeCounter: findPost.likeCounter,
          likedPosts: tempUser.likedPosts,
        })
      );
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
      const findLike = await Like.findOne({
        userId: idUser,
        postId: idPost,
        commentId: idComment,
      });

      if (findLike) {
        return res.status(400).json(oResponse(0, 'Only one like per user'));
      }
      /* update the like counter */
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
      /* update the user likedPost array */
      const tempUser = await User.findById(idUser);
      if (tempUser) {
        tempUser.likedComments.push(findComment._id);
      }
      const updateUser = await User.findByIdAndUpdate(idUser, tempUser, {
        useFindAndModify: false,
      });
      if (!updateUser) {
        return res.status(500).json(oResponse(0, 'Cannot update the user'));
      }

      return res.status(201).json(
        oResponse(1, {
          likeCounter: findComment.likeCounter,
          likedComments: tempUser.likedComments,
        })
      );
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
          .status(404)
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

      //update user's likedPosts list
      const tempUser = await User.findById(idUser);
      if (tempUser) {
        index = tempUser.likedPosts.indexOf(findPost._id);
        if (index > -1) {
          tempUser.likedPosts.splice(index, 1);
        }
      }
      const updateUser = await User.findByIdAndUpdate(idUser, tempUser, {
        useFindAndModify: false,
      });
      if (!updateUser) {
        return res.status(500).json(oResponse(0, 'Cannot update the user'));
      }
      return res.status(200).json(
        oResponse(1, {
          likeCounter: findPost.likeCounter,
          likedPosts: tempUser.likedPosts,
        })
      );
    } catch (err) {
      return res.status(500).json(oResponse(0, err));
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
        // intentar borrar likedComments y likeCounter con esta informacion, si es que se
        //bugea
        return res
          .status(404)
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

      /* update user's likedPosts array */
      const tempUser = await User.findById(idUser);
      if (tempUser) {
        index = tempUser.likedComments.indexOf(findComment._id);
        if (index > -1) {
          tempUser.likedComments.splice(index, 1);
        }
      }

      const updateUser = await User.findByIdAndUpdate(idUser, tempUser, {
        useFindAndModify: false,
      });
      if (!updateUser) {
        return res.status(500).json(oResponse(0, 'Cannot update the user'));
      }

      return res.status(200).json(
        oResponse(1, {
          likeCounter: findComment.likeCounter,
          likedComments: tempUser.likedComments,
        })
      );
    } catch (err) {
      return res.status(400).json(oResponse(0, err));
    }
  }

  //TODO - comment Like
};
