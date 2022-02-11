const mongoose = require('mongoose');
const Post = require('../models/PostModel');
const User = require('../models/UserModel');
const Comment = require('../models/CommentModel');
const oResponse = require('../lib/response').sendResponse;
const ObjectId = require('mongodb').ObjectId;

exports.getAll = (req, res, next) => {
  Post.find({})
    .then((posts) => {
      if (!posts) {
        return res.status(400).json(oResponse(1, 'there are no posts'));
      }
      return res.status(200).json(oResponse(1, posts));
    })
    .catch((err) => {
      return res.status(500).json(oResponse(0, err));
    });
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
    return res.status(500).json(oResponse(0, err));
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
    return res.status(500).json({ error: error });
  }
};

exports.deleteOne = (req, res, next) => {
  let postToRemove = new ObjectId(req.params.idPost);

  Comment.deleteMany({ postId: postToRemove }).catch((err) =>
    res.status(500).json(oResponse(0, err))
  );

  let id = req.params.idPost;
  Post.findByIdAndRemove(id, (err, post) => {
    if (err) {
      res.status(500).json(oResponse(0, err));
    }
    res.status(200).json(oResponse(1, post));
  });
};

exports.updateOne = (req, res, next) => {
  let postData = req.body;
  let id = req.params.idPost;

  Post.findByIdAndUpdate(id, postData, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        return res.status(400).json(oResponse(0, 'Cannot update the post'));
      }
      return res.status(200).json(oResponse(1, data));
    })
    .catch((err) => {
      return res.status(500).json(oResponse(0, err));
    });
};
