const listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");

// READ - Get all listings
module.exports.index = async (req, res) => {
const all_listings = await listing.find({});
res.render("./listings/index.ejs", { all_listings });
};

// NEW FORM TO CREATE NEW LISTING
module.exports.renderNewForm = (req, res) => {
res.render("./listings/new.ejs");
};

// CREATE NEW LISTING
module.exports.createListing = async (req, res) => {
let result = listingSchema.validate(req.body);


if (result.error) {
    throw new ExpressError(400, result.error);
}

const newListing = new listing(req.body.listing);

newListing.owner = req.user._id;

newListing.image = { url: req.file.path, filename: req.file.filename };
await newListing.save();

req.flash("success", "New listing created!");
res.redirect("/listings");


};

// READ - Get one particular listing
module.exports.showListing = async (req, res) => {
const { id } = req.params;


const user = await listing.findById(id)
    .populate("reviews")
    .populate("owner");

if (!user) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
}

await listing.populate(user, {
    path: "reviews.owner"
});

res.render("./listings/show.ejs", { user });

};

// UPDATE - Show edit form
module.exports.renderEditForm = async (req, res) => {
const { id } = req.params;


const user = await listing.findById(id);

if (!user) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
}

res.render("./listings/edit.ejs", { user });


};

// UPDATE - Actually update listing
module.exports.updateListing = async (req, res) => {
const { id } = req.params;


const updatedListing = await listing.findByIdAndUpdate(
    id,
    { ...req.body.listing }
);

if (!updatedListing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
}
// Update image only if a new image was uploaded
 if ( typeof req.file!=="undefined") { updatedListing.image = { url: req.file.path, filename: req.file.filename }; await updatedListing.save(); }

req.flash("success", "Listing updated!");
res.redirect(`/listings/${id}`);


};

// DELETE LISTING
module.exports.destroyListing = async (req, res) => {
const { id } = req.params;


const deletedListing = await listing.findByIdAndDelete(id);

if (!deletedListing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
}

req.flash("success", "Listing deleted!");
res.redirect("/listings");


};
