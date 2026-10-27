const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const app = express();
const port = 3000;
const ExpressError = require("./utils/ExpressError");
const {listingSchema, reviewSchema} = require("./schema");
const session = require ("express-session");
const flash = require("connect-flash");
const passport= require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");
const users = require("./routes/user.js");
const sessionOptions = {
  secret: "akashisgreate",
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now()+ 7*24*60*60*1000,
    maxaAge:7*24*60*60*1000,
    httpOnly: true,
  },
};
// flash const wale niche ke 2 routes se phle ayaega use usmain use krnge 
app.use(session(sessionOptions));
app.use(flash());

// Passport uses sessions to remember an authenticated user across multiple requests, so the user doesn't need to log in again on every page.

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
const listings = require("./routes/listing.js");
const reviews =require("./routes/review.js");


// MongoDB Connection
main()
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wander_lust");
}

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ejs mate
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/async");
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Routes
app.get("/", (req, res) => {
  //   res.render("index");
  res.send("hello project ");
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "student2@gmail.com",
        username: "deltas-student"
    });

    let registered = await User.register(fakeUser, " helloworld2");
    console.log(registered);
  });

  
// ye ise match krega /listings ke jo bhi honge unhe listing.js in routes main  yani /listing common jismain honge 
app.use("/listings",listings);

app.use("/listings/:id/reviews",reviews);
app.use("/", users);

// If the requested page/route does not exist
app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.render("eror.ejs",{message});
    // res.status(statusCode).send(message);
});

// Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
