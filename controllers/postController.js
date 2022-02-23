const mongoose = require('mongoose');
const Post = require('../models/PostModel');
const User = require('../models/UserModel');
const Comment = require('../models/CommentModel');
const oResponse = require('../lib/response').sendResponse;
const ObjectId = require('mongodb').ObjectId;

exports.getAll = async (req, res, next) => {
  try {
    posts = await Post.find({ isPublished: 1 })
      .sort({ datePublished: 'desc' })
      .exec();
    return res.status(200).json(oResponse(1, posts));
  } catch (error) {
    return res.status(500).json(oResponse(0, err));
  }
};

exports.getAllNotPublished = async (req, res, next) => {
  try {
    posts = await Post.find({ isPublished: 0 })
      .sort({ datePublished: 'desc' })
      .exec();
    return res.status(200).json(oResponse(1, posts));
  } catch (error) {
    return res.status(500).json(oResponse(0, { ...error }));
  }
};

exports.getOne = async (req, res, next) => {
  let idPost = req.params.idPost;
  try {
    post = await Post.findById(idPost);
    if (!post) {
      return res.status(400).json(oResponse(0, 'cannot find the post'));
    }
    return res.status(200).json(oResponse(1, post));
  } catch (error) {
    return res.status(500).json(oResponse(0, error));
  }
};

exports.createOne = async (req, res, next) => {
  try {
    const findUser = await User.findById(req.user.id);
    if (!findUser) {
      return res.status(400).json(oResponse(0, 'User author not found'));
    }
    const newPost = new Post({
      authorId: findUser._id,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      isPublished: req.body.isPublished,
    });

    try {
      const createdPost = await newPost.save();
      return res.status(201).json(oResponse(1, createdPost));
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  } catch (error) {
    return res.status(500).json(oResponse(0, error));
  }
};

exports.deleteOne = async (req, res, next) => {
  const idPost = req.params.idPost;

  //START TRANSACTION
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // DELETE COMMENTS AND POST
    await Comment.deleteMany({ postId: idPost }).session(session);
    await Post.findByIdAndRemove(idPost).session(session);

    // COMMIT TRANSACTION
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(oResponse(1, 'Post deleted'));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json(oResponse(0, error));
  }
};

exports.updateOne = async (req, res, next) => {
  let post = req.body;
  const idPost = req.params.idPost;

  //START TRANSACTION
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const postUpdated = await Post.findByIdAndUpdate(idPost, post, {
      useFindAndModify: false,
    }).session(session);
    // COMMIT TRANSACTION
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(oResponse(1, { postUpdated }));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json(oResponse(0, error));
  }
};
