const mongoose = require("mongoose");
const Like = require("../models/LikeModel");
const oResponse = require("../lib/response").sendResponse;
const ObjectId = require("mongodb").ObjectId;
const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");

exports.upVote = (req, res, next) => {
  let idUser = new ObjectId(req.user.id);
  let idPost = new ObjectId(req.params.idPost);
  let idComment = new ObjectId(req.params.idComment);

  if (req.params.idComment) {
    //Like for the comments
    const newLike = new Like({
      userId: idUser,
      postId: idPost,
      commentId: idComment,
    });

    Like.findOne({ userId: idUser })
      .where("postId")
      .equals(idPost)
      .where("commentId")
      .equals(idComment)
      .then((data) => {
        if (data) {
          return res.status(400).json(oResponse(0, "Only one like per user"));
        }
        newLike
          .save(newLike)
          .then((data) => {
            //update the likeCounter
            Comment.findById(idComment).then((comment) => {
              if (!comment) {
                return res
                  .status(400)
                  .json(oResponse(0, "post does not exist"));
              }
              comment.likeCounter = comment.likeCounter + 1;
              Comment.findByIdAndUpdate(idComment, comment, {
                useFindAndModify: false,
              }).then((data) => {
                if (!data) {
                  return res
                    .status(500)
                    .json(oResponse(0, "Cannot update the comment(like)"));
                }
              });
              return res.json(oResponse(1, data));
            });
          })
          .catch((err) => {
            return res.json(oResponse(0, err));
          });
      });
  } else {
    //Like for the post
    const newLike = new Like({
      userId: idUser,
      postId: idPost,
    });
    Like.findOne({ userId: idUser })
      .where("postId")
      .equals(idPost)
      .then((data) => {
        if (data) {
          return res.status(400).json(oResponse(0, "Only one like per user"));
        }
        newLike
          .save(newLike)
          .then((data) => {
            //update the likeCounter
            Post.findById(idPost).then((post) => {
              if (!post) {
                return res
                  .status(400)
                  .json(oResponse(0, "post does not exist"));
              }
              post.likeCounter = post.likeCounter + 1;
              Post.findByIdAndUpdate(idPost, post, {
                useFindAndModify: false,
              }).then((data) => {
                if (!data) {
                  return res
                    .status(500)
                    .json(oResponse(0, "Cannot update the post(like)"));
                }
              });
              return res.status(200).json(oResponse(1, data));
            });
          })
          .catch((err) => {
            return res.status(400).json(oResponse(0, err));
          });
      });
  }
};
exports.downVote = (req, res, next) => {
  let idUser = new ObjectId(req.user.id);
  let idPost = new ObjectId(req.params.idPost);
  let idComment = new ObjectId(req.params.idComment);

  if (req.params.idComment) {
    //Dislike for the comments

    Like.findOne({ userId: idUser })
      .where("postId")
      .equals(idPost)
      .where("commentId")
      .equals(idComment)
      .then((data) => {
        //validate one like per user
        if (data) {
          Like.findByIdAndDelete(data._id)
            .then(() => {
              //update the likeCounter
              Comment.findById(idComment).then((comment) => {
                if (!comment) {
                  return res
                    .status(400)
                    .json(oResponse(0, "comment does not exist"));
                }
                comment.likeCounter = comment.likeCounter - 1;
                Comment.findByIdAndUpdate(idComment, comment, {
                  useFindAndModify: false,
                }).then((data) => {
                  if (!data) {
                    return res
                      .status(500)
                      .json(oResponse(0, "Cannot update the comment(like)"));
                  }
                });
              });
            })
            .catch((err) => {
              return res.json(oResponse(0, err));
            });
          return res.json(oResponse(1, "DisLike created? xd"));
        }
        res
          .status(400)
          .json(oResponse(0, "can't downvote if you didn't upvote"));
      });
  } else {
    //Like for the post

    Like.findOne({ userId: idUser })
      .where("postId")
      .equals(idPost)
      .then((data) => {
        if (data) {
          Like.findByIdAndDelete(data._id)
            .then(() => {
              //update the likeCounter
              Post.findById(idPost).then((post) => {
                if (!post) {
                  return res
                    .status(400)
                    .json(oResponse(0, "post does not exist"));
                }
                post.likeCounter = post.likeCounter - 1;
                Post.findByIdAndUpdate(idPost, post, {
                  useFindAndModify: false,
                }).then((data) => {
                  if (!data) {
                    return res
                      .status(500)
                      .json(oResponse(0, "Cannot update the post(like)"));
                  }
                });
              });
            })
            .catch((err) => {
              return res.json(oResponse(0, err));
            });
          return res.json(oResponse(1, data));
        }
        return res
          .status(400)
          .json(oResponse(0, "Can't downvote if you didn't upvote"));
      });
  }
};
