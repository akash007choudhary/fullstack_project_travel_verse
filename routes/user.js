
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

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

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", "Welcome to Travel Verse!");

            const redirectUrl = res.locals.redirectUrl || "/listings";
            delete req.session.redirectUrl;

            res.redirect(redirectUrl);
        });

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
router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Welcome back!");

        const redirectUrl = res.locals.redirectUrl || "/listings";
        delete req.session.redirectUrl;

        res.redirect(redirectUrl);
    }
);

// POST: Logout Route
router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You have been logged out!");
        res.redirect("/login");
    });
});

module.exports = router;
