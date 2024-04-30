const sharp = require("sharp");
const Book = require("../src/models/book");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const Fuse = require("fuse.js");
require("dotenv").config();

exports.getaddBooks = async (req, res) => {
  res.render("owner/edit-books", {
    pageTitle: "Add Books",
    path: "/add-books",
    editing: false,
  });
};

exports.addBooks = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract the _id from the decoded token
    const userId = decoded._id;
    // console.log(userId);
    const book = new Book({
      ...req.body,
      owner: userId,
      cover: req.file.buffer,
    });

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    book.cover = buffer;

    const result = await book.save();
    // res.status(201).send(result);
    res.redirect("/allBooks");
  } catch (error) {
    res.status(404).redirect("/404");
    console.log(error);
  }
};

//get all the books which are available
exports.getAllAvailableBooks = async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.isAvailable) {
    match.isAvailable = req.query.isAvailable === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "books",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    req.user.books.forEach((book) => {
      if (book.cover) {
        book.cover = book.cover.toString("base64");
      }
    });
    const userBooks = req.user.books;
    res.render("owner/myprofile", {
      path: "/userbooks",
      pageTitle: "My Books",
      products: userBooks,
      owner: req.user
    });
  } catch (error) {
    // res.status(404).redirect("/404");

    res.status(404).redirect("/404");
    console.log(error);
  }
};

exports.getAuthorizedBook = async (req, res) => {
  try {
    const _id = req.params.id;

    const book = await Book.findOne({ _id, owner: req.user._id });
    if (!book) {
      res.status(404).send("Book not found");
    }
    if (book.cover) {
      book.cover = book.cover.toString("base64");
    }
    res.render("owner/mybook", {
      path: "/userBook",
      pageTitle: book.title,
      product: book,
    });
  } catch (error) {
    res.status(404).redirect("/404");
    console.log(error);
  }
};

exports.allBooks = async (req, res) => {
  try {
    const query = req.query;
    itemsPerPage = query.itemsPerPage || 3;
    const page = +query.page || 1;

    const total = await Book.find({ isAvailable: true }).countDocuments();

    const result = await Book.find({ isAvailable: true })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    result.forEach((book) => {
      if (book.cover) {
        book.cover = book.cover.toString("base64");
      }
    });

    res.render("owner/dashboard", {
      path: "/allBooks",
      pageTitle: "Homepage",
      products: result,
      query: query,
      owner: req.user,
      currentPage: page,
      hasNextPage: itemsPerPage * page < total,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(total / itemsPerPage),
    });
  } catch (error) {
    res.status(404).redirect("/404");

    console.log(error);
  }
};

exports.bookDetails = async (req, res) => {
  try {
    const _id = req.params.id;
    const book = await Book.findById(_id);

    if (!book) {
      res.status(404).send("Book not found");
    }
    if (book.cover) {
      book.cover = book.cover.toString("base64");
    }
    res.render("owner/product-detail", {
      product: book,
      pageTitle: book.title,
      path: "/book-detail",
      owner: req.user,
    });
  } catch (error) {
    res.status(404).redirect("/404");
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const query = req.query;
    itemsPerPage = query.itemsPerPage || 3;
    const page = +query.page || 1;

    const total = await Book.find().countDocuments();

    const result = await Book.find()
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    result.forEach((book) => {
      if (book.cover) {
        book.cover = book.cover.toString("base64");
      }
    });
    res.render("books/homepage.ejs", {
      path: "/",
      pageTitle: "Homepage",
      products: result,
      currentPage: page,
      hasNextPage: itemsPerPage * page < total,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(total / itemsPerPage),
    });
  } catch (error) {
    res.status(404).redirect("/404");

    console.log(error);
  }
};

exports.getDetailedBook = async (req, res) => {
  try {
    const _id = req.params.id;
    const book = await Book.findById(_id);

    if (!book) {
      res.status(404).send("Book not found");
    }
    if (book.cover) {
      book.cover = book.cover.toString("base64");
    }

    res.render("books/product-detail", {
      product: book,
      pageTitle: book.title,
      path: "/books",
    });
  } catch (error) {
    res.status(404).redirect("/404");
  }
};

exports.getupdateBook = async (req, res) => {
  try {
    const editMode = req.query.edit;
    if (!editMode) {
      return res.redirect("/books");
    }
    const _id = req.params.id;

    const product = await Book.findById(_id);

    if (!product) {
      res.redirect("/books");
    }
    res.render("owner/edit-books", {
      pageTitle: "Edit Books",
      path: "/edit-book",
      editing: editMode,
      product: product,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateBook = async (req, res) => {
  const updates = Object.keys(req.body).filter(
    (update) => update !== "productId"
  );
  const allowedUpdates = [
    "title",
    "author",
    "genre",
    "purchased_year",
    "cover",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send(`Invalid update!`);
  }

  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract the _id from the decoded token
    const userId = decoded._id;

    const product = await Book.findByIdAndUpdate(
      { _id: req.body.productId, owner: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).send("Can't Find Book");
    }

    if (req.file) {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      product.cover = buffer;
    }

    await product.save();

    res.redirect("/userbooks");
  } catch (error) {
    res.status(404).redirect("/404");

    console.log(error);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const _id = req.params.id;
    const deletedBook = await Book.findByIdAndDelete({
      _id,
      owner: req.user._id,
    });

    if (!deletedBook) {
      res.status(404).send("No book with the provided ID was found.");
    }
    res.redirect("/userbooks");
  } catch (error) {
    res.status(404).redirect("/404");

    console.log(error);
  }
};

exports.searchBook = async (req, res) => {
  try {
    const { query } = req.query;
    itemsPerPage = req.query.itemsPerPage || 3;
    const page = +req.query.page || 1;

    let ans;

    const result = await Book.find({});

    result.forEach((book) => {
      if (book.cover) {
        book.cover = book.cover.toString("base64");
      }
    });

    const fuse = new Fuse(result, {
      keys: ["title", "author", "genre", "purchased_year"],
      includeScore: true,
    });

    ans = fuse.search(query);

    ans.sort((a, b) => a.score - b.score);

    const total = ans.length;
    // console.log(total);

    ans = ans.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    res.render("owner/search", {
      path: "/searchBooks",
      pageTitle: "Books Found",
      products: ans.map((item) => item.item),
      query: query,
      owner: req.user,
      length: total,
      currentPage: page,
      hasNextPage: itemsPerPage * page < total,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(total / itemsPerPage),
    });
  } catch (error) {
    res.status(404).redirect("/404");
    console.log(error);
  }
};

exports.searchHomeBook = async (req, res) => {
  try {
    const { query } = req.query;
    itemsPerPage = req.query.itemsPerPage || 3;
    const page = +req.query.page || 1;

    let ans;

    const result = await Book.find({});

    result.forEach((book) => {
      if (book.cover) {
        book.cover = book.cover.toString("base64");
      }
    });

    const fuse = new Fuse(result, {
      keys: ["title", "author", "genre", "purchased_year"],
      includeScore: true,
    });

    ans = fuse.search(query);

    ans.sort((a, b) => a.score - b.score);

    const total = ans.length;
    // console.log(total);

    ans = ans.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    res.render("books/search", {
      path: "/searchHomeBooks",
      pageTitle: "Books Found",
      products: ans.map((item) => item.item),
      query: query,
      length: total,
      currentPage: page,
      hasNextPage: itemsPerPage * page < total,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(total / itemsPerPage),
    });
  } catch (error) {
    res.status(404).redirect("/404");

    console.log(error);
  }
};
