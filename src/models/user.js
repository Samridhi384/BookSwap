const mongoose = require("mongoose");
const validator = require("validator");
const Book = require("./book");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid mail id");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    library: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        title: {
          type: String,
          required: true,
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
        cover: {
          type: Buffer,
        },
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
      },
    ],
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiration: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("books", {
  ref: "Book",
  localField: "_id",
  foreignField: "owner",
});

//Hash the password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

//generate token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//add to library
userSchema.methods.addToLibrary = async function (bookId) {
  const user = this;
  const book = await Book.findById(bookId);

  if (!book) {
    console.log("Book not found");
  }

  const isBookInLibrary = user.library.some((item) =>
    item.bookId.equals(book._id)
  );

  if (isBookInLibrary) {
    console.log("Book is already in the library");
    throw new Error("Book is already in the library");
  }

  // Add the book to the library
  user.library.push({
    bookId: book._id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    purchased_year: book.purchased_year,
    cover: book.cover,
    owner: book.owner,
  });

  book.isAvailable = false;
  book.exchanged_userId = user._id;
  await user.save();
  await book.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
