const User = require("../models/user.js");

// GET: Show signup form
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// POST: Register new user
module.exports.signup = async (req, res, next) => {
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
};

// GET: Show login form
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// POST: Login user
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");

    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;

    res.redirect(redirectUrl);
};

// POST: Logout user
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You have been logged out!");
        res.redirect("/login");
    });
};