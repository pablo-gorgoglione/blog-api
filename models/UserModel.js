const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UserSchema = mongoose.Schema({
  //0 user, 1 author, ... ?
  role: { type: Number },
  username: {
    type: String,
    required: [true, 'A username is required'],
    minlength: 4,
  },
  likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  likedComments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  dateJoined: { type: Date, default: Date.now() },
  hash: { type: String, require: [true, 'Password is required'] },
  salt: { type: String, require: [true, 'Password is required'] },
});

module.exports = mongoose.model('User', UserSchema);
