const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const CommentSchema = Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  commentParentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: false,
  },
  content: {
    type: String,
    require: [true, 'A content is required in the comment'],
  },
  date: { type: Date, default: Date.now() },
  isEdited: { type: Number, default: 0 },
  likeCounter: { type: Number, default: 0 },
});

module.exports = mongoose.model('Comment', CommentSchema);
