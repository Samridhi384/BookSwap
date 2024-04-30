const express = require("express");

const router = express.Router();
const bookController = require("../../controllers/book");
const auth = require("../middlewares/auth");
const multer = require("multer");

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

router.get("/add-books", auth, bookController.getaddBooks);

router.post(
  "/add-books",
  auth,
  upload.single("cover"),
  bookController.addBooks
);

router.get("/userbooks", auth, bookController.getAllAvailableBooks);

router.get("/", bookController.getAllBooks);

router.get("/books/:id", bookController.getDetailedBook);

router.get("/userBook/:id", auth, bookController.getAuthorizedBook);

router.get("/allBooks", auth, bookController.allBooks);

router.get("/book-detail/:id", auth, bookController.bookDetails);

router.get("/edit-book/:id", auth, bookController.getupdateBook);

router.post(
  "/edit-book",
  auth,
  upload.single("cover"),
  bookController.updateBook
);

router.get("/delete-book/:id", auth, bookController.deleteBook);

router.get("/searchBooks", auth, bookController.searchBook);

router.get("/searchHomeBooks", bookController.searchHomeBook);

// router.post(
//   "/addImage",
//   auth,
//   upload.single("cover"),
//   bookController.addCoverPage
// );

module.exports = router;
