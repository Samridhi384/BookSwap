const express = require("express");

const router = express.Router();
const userController = require("../../controllers/user");
const auth = require("../middlewares/auth");

//create user
router.post("/users", userController.postSignup);

router.post("/login", userController.login);

router.get("/logout", auth, userController.logout);

router.post("/logoutAll", auth, userController.logoutAll);

router.get("/login", userController.getLogin);

router.get("/users", userController.getSignup);

router.get("/add-to-library", auth, userController.getaddToLibrary);

router.post("/add-to-library", auth, userController.addToLibrary);

router.get("/delete-lib-book/:id", auth, userController.deleteLibBook);

// router.get("/dashboard", auth, userController.dashboard);
// router.get("/users", auth, userController.getUserProfile);

//forget password
router.get("/forgot-password", userController.getForgotPassword);

router.post("/forgot-password", userController.postForgotPassword);

router.get("/after-forgot-password", userController.afterForgotPassword);

router.get("/reset-password/:token", userController.getResetPassword);

router.post("/reset-password/:token", userController.postResetPassword);

module.exports = router;
