const express = require("express");
const router = express.Router({ mergeParams: true });

const asyncWrap = require("../utils/async");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isReviewOwner } = require("../middleware");
const reviewcontroller = require("../controllers/reviews.js");

// VALIDATE REVIEW
const validateReview = (req, res, next) => {
    let result = reviewSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(400, result.error);
    } else {
        next();
    }
};

// CREATE REVIEW
router.post(
    "/",
    isLoggedIn,
    validateReview,
    asyncWrap(reviewcontroller.createReview)
);

// DELETE REVIEW
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewOwner,
    asyncWrap(reviewcontroller.destroyReview)
);

module.exports = router;