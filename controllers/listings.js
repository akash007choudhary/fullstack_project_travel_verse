const listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});


// READ - Get all listings with accring to search too
module.exports.index = async (req, res) => {
    let { category } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    const all_listings = await listing.find(filter);

    res.render("listings/index.ejs", {
        all_listings,
        success: req.flash("success"),
        error: req.flash("error")
    });
};
// NEW FORM TO CREATE NEW LISTING
module.exports.renderNewForm = (req, res) => {
res.render("./listings/new.ejs");
};

// CREATE NEW LISTING
module.exports.createListing = async (req, res) => {

    // 1. Validate listing data
    let result = listingSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(400, result.error);
    }

    // 2. Create new listing
    const newListing = new listing(req.body.listing);

    // 3. Assign owner
    newListing.owner = req.user._id;

    // 4. Get coordinates from Mapbox
    let response = await geocodingClient.forwardGeocode({
        query: `${newListing.location}, ${newListing.country}`,
        limit: 1,
        mode: "mapbox.places-permanent"
    }).send();

    
    if (response.body.features.length === 0) {
        throw new ExpressError(400, "Location not found!");
    }

    let coordinates = response.body.features[0].geometry.coordinates;

    // 5. Assign geometry
    newListing.geometry = {
        type: "Point",
        coordinates: coordinates
    };

    // 6. Assign uploaded image
    newListing.image = {
        url: req.file.path,
        filename: req.file.filename
    };

    console.log(newListing);
    // 7. Save listing
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

    console.log(user.geometry.coordinates);
    res.render("./listings/show.ejs", { user,mapToken: process.env.MAP_TOKEN });
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
