const mongoose = require("mongoose");

const LikeSchema = mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  commentId: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
});

module.exports = mongoose.model("Like", LikeSchema);
