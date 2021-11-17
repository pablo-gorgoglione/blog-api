const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: { type: String, require: [true, "A username is required"] },
  dateJoined: { type: Date, default: Date.now() },
  hash: { type: String, require: [true, "Password is required"] },
  salt: { type: String, require: [true, "Password is required"] },
});

module.exports = mongoose.model("User", UserSchema);
