const express = require("express");
const router = express.Router();

const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const asyncWrap = require("../utils/async");
const usercontroller = require("../controllers/users.js");

// SIGNUP ROUTES
router.route("/signup")
    // GET: Show signup form
    .get(usercontroller.renderSignupForm)

    // POST: Register new user
    .post(
        asyncWrap(usercontroller.signup)
    );

// LOGIN ROUTES
router.route("/login")
    // GET: Show login form
    .get(usercontroller.renderLoginForm)

    // POST: Login user
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        usercontroller.login
    );

// POST: Logout user
router.post(
    "/logout",
    usercontroller.logout
);

module.exports = router;