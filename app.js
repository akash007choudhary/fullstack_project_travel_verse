const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const listing = require("./models/listing");
const methodOverride = require("method-override");
const app = express();
const port = 3000;
const asyncWrap=require("./utils/async");
const ExpressError = require("./utils/ExpressError");
const {listingSchema, reviewSchema} = require("./schema");
const Review= require("./models/review");

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
const wrapAsync = require("./utils/async");
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

const validateListing = (req, res, next) => {

    let result = listingSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(400, result.error);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {

    let result = reviewSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(400, result.error);
    } else {
        next();
    }
};

// READ - Get all listings
app.get("/listings", asyncWrap(async (req, res) => {
    const all_listings = await listing.find({});

    res.render("./listings/index.ejs", { all_listings });
}));


// NEW FORM TO CREATE NEW LISTING
app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs");
});


// CREATE NEW LISTING  with seerve side validation as one could send teh lsiting but without some fiekd like city , price etc the REQUIRED will handle that 
// for eror msegae well do JOI Package of npm
app.post("/listings",validateListing, asyncWrap(async (req, res, next) => {

    let result = listingSchema.validate(req.body);

    console.log(result);

    if (result.error) {
        throw new ExpressError(400, result.error);
    }

    const newListing = new listing(req.body.listing);

    await newListing.save();

    res.redirect("/listings");
}));


// READ - Get one particular listing
app.get("/listings/:id", asyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await listing.findById(id).populate("reviews");

    res.render("./listings/show.ejs", { user });
}));


// UPDATE - Show edit form
app.get("/listings/:id/edit", asyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await listing.findById(id);

    res.render("./listings/edit.ejs", { user });
}));


// UPDATE - Actually update listing
app.put("/listings/:id",validateListing, asyncWrap(async (req, res) => {
   
  const { id } = req.params;

    const updatedListing = await listing.findByIdAndUpdate(
        id,
        { ...req.body.listing }
    );

    res.redirect(`/listings/${id}`);
}));


// DELETE yaahna se revieew aka deletion call hoga middle ware .findByIdAndDelete
app.delete("/listings/:id", asyncWrap(async (req, res) => {
    const { id } = req.params;

    await listing.findByIdAndDelete(id);

    res.redirect("/listings");
}));

// reviews post route 
app.post("/listings/:id/reviews", validateReview, wrapAsync (async(req, res) => {
    let user = await listing.findById(req.params.id);

    let newReview = new Review(req.body.review);

    user.reviews.push(newReview);

    await newReview.save();
    await user.save();
    // res.send("new review saved ");
    res.redirect(`/listings/${user._id}`);
})
);
// dlete a reviw  as use review as independendt to hatana ahu hai but also ffrom the listing array se to we use pull method in mongoose
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

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
