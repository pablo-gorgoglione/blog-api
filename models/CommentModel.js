const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const CommentSchema = mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  content: {
    type: String,
    require: [true, "A content is required in the comment"],
  },
  date: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Comment", CommentSchema);
