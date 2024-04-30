const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    // const token = req.header("Authorization");
    // const token = req.cookies.token;
    const s = req.headers.cookie;
    const token = s.substring(6);
    // console.log(token);
    if (!token) {
      throw new Error("token not found");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) throw new Error("User not found!");

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).redirect("/login");
    console.log(error);
  }
};

module.exports = auth;
