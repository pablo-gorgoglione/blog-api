const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  //0 user, 1 author, ... ?
  role: { type: Number },
  username: {
    type: String,
    require: [true, "A username is required"],
    minlength: 4,
  },
  dateJoined: { type: Date, default: Date.now() },
  hash: { type: String, require: [true, "Password is required"] },
  salt: { type: String, require: [true, "Password is required"] },
});

module.exports = mongoose.model("User", UserSchema);
