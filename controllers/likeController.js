const mongoose = require('mongoose');
const oResponse = require('../lib/response').sendResponse;
const ObjectId = require('mongodb').ObjectId;
const User = require('../models/UserModel');
const Post = require('../models/PostModel');
const Comment = require('../models/CommentModel');
const Like = require('../models/LikeModel');

exports.like = async (req, res) => {
  //CREATE IDS
  const idUser = new ObjectId(req.user.id);
  const idPost = new ObjectId(req.params.idPost);
  const idComment = new ObjectId(req.params.idComment);

  if (!idUser) {
    return res
      .status(401)
      .json(oResponse(0, 'You must be logged in to like it'));
  }

  // START TRANSACTION
  const session = await mongoose.startSession();
  session.startTransaction();

  // CREATE POST LIKE
  if (!req.params.idComment) {
    try {
      // VALIDATE ONLY ONE LIKE PER USER
      const validateExistence = await Like.findOne({
        userId: idUser,
        postId: idPost,
        commentId: { $exists: false },
      });
      if (validateExistence) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(oResponse(0, 'Only one like per user'));
      }

      // CREATE LIKE ON SESSION
      await Like.create([{ userId: idUser, postId: idPost }], {
        session: session,
      });

      // FIND THE TARGET POST
      const findPost = await Post.findById(idPost);
      if (!findPost) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(oResponse(0, 'post does not exist'));
      }

      // UPDATE POST DATA (likeCounter) ON SESSION
      findPost.likeCounter = findPost.likeCounter + 1;
      const updatePost = await Post.findByIdAndUpdate(idPost, findPost, {
        useFindAndModify: false,
      }).session(session);
      if (!updatePost) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(oResponse(0, 'Cannot update the post'));
      }

      // UPDATE USER DATA (likedPosts) ON SESSION
      const tempUser = await User.findById(idUser);
      if (!tempUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(oResponse(0, 'Cannot update user data'));
      }
      tempUser.likedPosts.push(findPost._id);
      const updateUser = await User.findByIdAndUpdate(idUser, tempUser, {
        useFindAndModify: false,
      }).session(session);
      if (!updateUser) {
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json(oResponse(0, 'Cannot update the user'));
      }

      // COMMIT TRANSACTION
      await session.commitTransaction();
      session.endSession();
      return res.status(201).json(
        oResponse(1, {
          likeCounter: findPost.likeCounter,
          likedPosts: tempUser.likedPosts,
        })
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json(oResponse(0, error));
    }
  } else {
    try {
      // VALIDATE ONLY ONE LIKE PER USER
      const findLike = await Like.findOne({
        userId: idUser,
        postId: idPost,
        commentId: idComment,
      });
      if (findLike) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(oResponse(0, 'Only one like per user'));
      }

      // CREATE LIKE ON SESSION
      await Like.create(
        [{ userId: idUser, postId: idPost, commentId: idComment }],
        { session: session }
      );

      // FIND THE TARGET COMMENT
      const findComment = await Comment.findById(idComment);
      if (!findComment) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(oResponse(0, 'comment does not exist'));
      }

      // UPDATE COMMENT DATA (likeCounter) ON SESSION
      findComment.likeCounter = findComment.likeCounter + 1;
      const updateComment = await Comment.findByIdAndUpdate(
        idComment,
        findComment,
        { useFindAndModify: false }
      ).session(session);
      if (!updateComment) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(oResponse(0, 'Cannot update the comment'));
      }

      // UPDATE USER DATA (likedComments) ON SESSION
      const tempUser = await User.findById(idUser);
      if (tempUser) {
        tempUser.likedComments.push(findComment._id);
      }
      const updateUser = await User.findByIdAndUpdate(idUser, tempUser, {
        useFindAndModify: false,
      }).session(session);
      if (!updateUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(oResponse(0, 'Cannot update the user'));
      }

      // COMMIT TRANSACTION
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json(
        oResponse(1, {
          likeCounter: findComment.likeCounter,
          likedComments: tempUser.likedComments,
        })
      );
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(oResponse(0, err));
    }
  }
};

exports.dislike = async (req, res) => {
  //CREATE IDS
  let idUser = new ObjectId(req.user.id);
  let idPost = new ObjectId(req.params.idPost);
  let idComment = new ObjectId(req.params.idComment);

  //START TRANSACTION
  const session = await mongoose.startSession();
  session.startTransaction();

  // DELETE POST LIKE
  if (!req.params.idComment) {
    try {
      // VALIDATE EXISTENCE OF LIKE TO DELETE
      const findLike = await Like.findOne({ userId: idUser })
        .where('postId')
        .equals(idPost);
      if (!findLike) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json(oResponse(0, "Can't downvote if you didn't upvote"));
      }

      // DELETE LIKE ON SESSION
      await Like.findByIdAndDelete(findLike._id).session(session);

      // FIND THE TARGET POST
      const findPost = await Post.findById(idPost);
      if (!findPost) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(oResponse(0, 'post does not exist'));
      }

      // UPDATE POST DATA (likeCounter) ON SESSION
      findPost.likeCounter = findPost.likeCounter - 1;
      const updatePost = await Post.findByIdAndUpdate(idPost, findPost, {
        useFindAndModify: false,
      }).session(session);
      if (!updatePost) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(500)
          .json(oResponse(0, 'Cannot update the post(like)'));
      }

      // UPDATE USER DATA (likedPosts) ON SESSION
      const tempUser = await User.findById(idUser);
      if (tempUser) {
        index = tempUser.likedPosts.indexOf(findPost._id);
        if (index > -1) {
          tempUser.likedPosts.splice(index, 1);
        }
      }
      const updateUser = await User.findByIdAndUpdate(idUser, tempUser, {
        useFindAndModify: false,
      }).session(session);
      if (!updateUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(oResponse(0, 'Cannot update the user'));
      }

      // COMMIT TRANSACTION
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json(
        oResponse(1, {
          likeCounter: findPost.likeCounter,
          likedPosts: tempUser.likedPosts,
        })
      );
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json(oResponse(0, err));
    }
  } else {
    try {
      // DELETE POST LIKE
      // VALIDATE EXISTENCE OF LIKE TO DELETE
      const findLike = await Like.findOne({ userId: idUser })
        .where('postId')
        .equals(idPost)
        .where('commentId')
        .equals(idComment);
      if (!findLike) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json(oResponse(0, "Can't downvote if you didn't upvote"));
      }

      // DELETE LIKE ON SESSION
      await Like.findByIdAndDelete(findLike._id).session(session);

      // FIND THE TARGET COMMENT
      const findComment = await Comment.findById(idComment);
      if (!findComment) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(oResponse(0, 'comment does not exist'));
      }

      // UPDATE COMMENT DATA (likeCounter) ON SESSION
      findComment.likeCounter = findComment.likeCounter - 1;
      const updateComment = await Comment.findByIdAndUpdate(
        idComment,
        findComment,
        { useFindAndModify: false }
      ).session(session);
      if (!updateComment) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(500)
          .json(oResponse(0, 'Cannot update the comment(like)'));
      }

      // UPDATE USER DATA (likedComments) ON SESSION
      const tempUser = await User.findById(idUser);
      if (tempUser) {
        index = tempUser.likedComments.indexOf(findComment._id);
        if (index > -1) {
          tempUser.likedComments.splice(index, 1);
        }
      }
      const updateUser = await User.findByIdAndUpdate(idUser, tempUser, {
        useFindAndModify: false,
      }).session(session);
      if (!updateUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(oResponse(0, 'Cannot update the user'));
      }

      // COMMIT TRANSACTION
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(
        oResponse(1, {
          likeCounter: findComment.likeCounter,
          likedComments: tempUser.likedComments,
        })
      );
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(oResponse(0, err));
    }
  }
};
