const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 3,
    },
    author: {
      type: String,
    },
    genre: {
      type: String,
      required: true,
    },
    purchased_year: {
      type: Number,
      default: new Date().getFullYear(),
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    cover: {
      type: Buffer,
    },
    exchanged_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
