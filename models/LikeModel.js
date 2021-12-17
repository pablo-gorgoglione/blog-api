const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const LikeSchema = mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
});

module.exports = mongoose.model('Like', LikeSchema);
