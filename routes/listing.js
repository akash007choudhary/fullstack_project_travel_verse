const express= require("express");
const router= express.Router({mergeParams:true});
const asyncWrap=require("../utils/async");
const ExpressError = require("../utils/ExpressError");
const {listingSchema, reviewSchema} = require("../schema");
const listing = require("../models/listing");


const validateListing = (req, res, next) => {

    let result = listingSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(400, result.error);
    } else {
        next();
    }
};


// READ - Get all listings
router.get("/", asyncWrap(async (req, res) => {
    const all_listings = await listing.find({});

    res.render("./listings/index.ejs", { all_listings });
}));


// NEW FORM TO CREATE NEW LISTING
router.get("/new", (req, res) => {
    res.render("./listings/new.ejs");
});


// CREATE NEW LISTING  with seerve side validation as one could send teh lsiting but without some fiekd like city , price etc the REQUIRED will handle that 
// for eror msegae well do JOI Package of npm
router.post("/",validateListing, asyncWrap(async (req, res, next) => {

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
router.get("/:id", asyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await listing.findById(id).populate("reviews");

    res.render("./listings/show.ejs", { user });
}));


// UPDATE - Show edit form
router.get("/:id/edit", asyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await listing.findById(id);

    res.render("./listings/edit.ejs", { user });
}));


// UPDATE - Actually update listing
router.put("/:id",validateListing, asyncWrap(async (req, res) => {
   
  const { id } = req.params;

    const updatedListing = await listing.findByIdAndUpdate(
        id,
        { ...req.body.listing }
    );

    res.redirect(`/listings/${id}`);
}));


// DELETE yaahna se revieew aka deletion call hoga middle ware .findByIdAndDelete
router.delete("/:id", asyncWrap(async (req, res) => {
    const { id } = req.params;

    await listing.findByIdAndDelete(id);

    res.redirect("/listings");
}));


module.exports =router;