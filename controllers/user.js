const { sendWelcomeMail } = require("../src/email/account");
const User = require("../src/models/user");
const Book = require("../src/models/book");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/users",
    pageTitle: "Signup",
  });
};

exports.postSignup = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 108000000),
      httpOnly: true,
    });

    const registered = await user.save();
    console.log(`Registered User: ${registered}`);

    res.redirect("/dashboard");
    // sendWelcomeMail(user.email, user.userName);

    // res.status(201).send({ user, token });
  } catch (error) {
    // res.status(400).send("");
    console.log(error);
  }
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // if (!user) {
    //   throw new Error("Unable to login");
    // }

    const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   throw new Error("Invalid email or password");
    // }
    const token = await user.generateAuthToken();

    // console.log(token);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 108000000),
      httpOnly: true,
    });
    // console.log(`cookie: ${req.cookies.token}`);

    if (isMatch) {
      res.redirect("/allBooks");
    } else {
      res.send("Invalid  credentials");
    }

    // res.status(200).send({ message: "User Login Successfully", token });
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
    // res.redirect("/login");
  }
};

//user logout
exports.logout = async (req, res) => {
  try {
    req.user.tokens = [];
    res.clearCookie("token");
    // console.log("LOGOUT SUCCESSFULLY");
    await req.user.save();

    res.redirect("/login");
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

//logout all users
exports.logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.status(200).send("Logged out from all the devices");
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

//get the user
exports.getUserProfile = async (req, res) => {
  res.send(req.user);
};

exports.getaddToLibrary = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("library.bookId");

    if (!user) {
      return res.status(404).send("User not found");
    }
    user.library.forEach((item) => {
      if (item.cover) {
        item.cover = item.cover.toString("base64");
        // console.log(item.cover);
      }
    });
    res.render("owner/library", {
      path: "/add-to-library",
      pageTitle: "My Library",
      products: user.library,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addToLibrary = async (req, res) => {
  // const token = req.cookies.token;
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Extract the _id from the decoded token
  const userId = req.user._id;

  const bookId = req.body.productId;
  // console.log(bookId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    await user.addToLibrary(bookId);

    res.redirect("/add-to-library");
    // res.send("Book added to library");
  } catch (error) {
    // res.status(500).send(error.message);
    console.log(error);
  }
};

exports.deleteLibBook = async (req, res) => {
  try {
    const id = req.params.id;

    const userId = req.user._id;

    const user = await User.findById(userId).populate("library.bookId");

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.library = user.library.filter(({ bookId }) => !bookId.equals(id));

    const deletedLibBook = await Book.findByIdAndUpdate(
      { _id: id.toString() },
      { $unset: { exchanged_userId: "" } }
    );

    if (!deletedLibBook) {
      res.status(404).send("No book with the provided ID was found.");
    }

    deletedLibBook.isAvailable = true;

    await deletedLibBook.save();
    await user.save();

    res.redirect("/allBooks");
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};
