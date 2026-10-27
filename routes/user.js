
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
// GET: Show signup form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// POST: Register new user
router.post("/signup", async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        let newUser = new User({
            username: username,
            email: email
        });

        let registeredUser = await User.register(newUser, password);

        req.flash("success", "Welcome to Travel Verse!");
        res.redirect("/listings");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
});


// GET Login Route
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// POST Login Route
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
});

module.exports = router;

