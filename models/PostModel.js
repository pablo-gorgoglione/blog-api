const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const PostSchema = mongoose.Schema({
  authorId: { type: Schema.Types.ObjectId, ref: "Author", required: true },
  title: { type: String, require: [true, "A title is required"] },
  content: { type: String, require: [true, "A content is required"] },
  datePublished: { type: Date, default: Date.now() },
  tags: [String],
  isPublished: {
    type: Number,
    min: 0,
    max: 1,
    require: [true, "A post status is required"],
  },
  likeCounter: { type: Number, default: 0 },
});

module.exports = mongoose.model("Post", PostSchema);
