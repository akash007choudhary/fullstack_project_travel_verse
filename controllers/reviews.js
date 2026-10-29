const listing = require("../models/listing");
const Review = require("../models/review");

// CREATE NEW REVIEW
module.exports.createReview = async (req, res) => {
    let user = await listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
    newReview.owner = req.user._id;

    user.reviews.push(newReview);

    await newReview.save();
    await user.save();

    req.flash("success", "new review created");
    res.redirect(`/listings/${user._id}`);
};

// DELETE REVIEW
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
};