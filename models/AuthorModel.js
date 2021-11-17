const mongoose = require("mongoose");

const AuthorSchema = mongoose.Schema({
  username: String,
  // photo: Buffer,
  dateJoined: { type: Date, default: Date.now() },
  hash: { type: String, required: [true, "Password is required"] },
  salt: { type: String, required: [true, "Password is required"] },
});

module.exports = mongoose.model("Author", AuthorSchema);
