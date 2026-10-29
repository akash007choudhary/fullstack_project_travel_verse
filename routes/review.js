const express= require("express");
const router= express.Router({mergeParams: true});
const asyncWrap=require("../utils/async");
const ExpressError = require("../utils/ExpressError");
const {listingSchema, reviewSchema} = require("../schema");
const listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn, isReviewOwner } = require("../middleware");


const validateReview = (req, res, next) => {

    let result = reviewSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(400, result.error);
    } else {
        next();
    }
};

// reviews post route 
router.post("/",  isLoggedIn ,validateReview,asyncWrap (async(req, res) => {
    let user = await listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
    newReview.owner = req.user._id;
    user.reviews.push(newReview);

    await newReview.save();
    await user.save();
    // res.send("new review saved ");
     req.flash("success","new review created ");
    res.redirect(`/listings/${user._id}`);
})
);
// dlete a reviw  as use review as independendt to hatana ahu hai but also ffrom the listing array se to we use pull method in mongoose
router.delete("/:reviewId", isLoggedIn, isReviewOwner, asyncWrap(async (req, res) => {
    let { id, reviewId } = req.params;

    await listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
}));
module.exports=router;
