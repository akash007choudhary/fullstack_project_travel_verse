const express= require("express");
const router= express.Router({mergeParams:true});
const asyncWrap=require("../utils/async");
const ExpressError = require("../utils/ExpressError");
const {listingSchema, reviewSchema} = require("../schema");
const listing = require("../models/listing");
// const { isLoggedIn } = require("../middleware.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
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
router.get("/new",isLoggedIn, (req, res) => {
    
    res.render("./listings/new.ejs");
});


// CREATE NEW LISTING  with seerve side validation as one could send teh lsiting but without some fiekd like city , price etc the REQUIRED will handle that 
// for eror msegae well do JOI Package of npm
router.post("/", isLoggedIn,validateListing, asyncWrap(async (req, res, next) => {

    let result = listingSchema.validate(req.body);

    console.log(result);

    if (result.error) {
        throw new ExpressError(400, result.error);
    }

    const newListing = new listing(req.body.listing);

    newListing.owner=req.user._id;

    await newListing.save();
    req.flash("success","new listing created ");
    res.redirect("/listings");
}));


// READ - Get one particular listing
router.get("/:id", asyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await listing.findById(id).populate("reviews").populate("owner");
    if(!user){
         req.flash("error"," listing does not exist ! ");
         return res.redirect("/listings");
    }
    await listing.populate(user, {
        path: "reviews.owner"
    });
    res.render("./listings/show.ejs", { user });
}));


// UPDATE - Show edit form
router.get("/:id/edit" , isLoggedIn, isOwner, asyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await listing.findById(id);
    if (!user) { req.flash("error", "Listing does not exist!"); 
    return res.redirect("/listings"); }
    res.render("./listings/edit.ejs", { user });
}));


// UPDATE - Actually update listing
router.put("/:id", isLoggedIn,isOwner,validateListing, asyncWrap(async (req, res) => {
   
  const { id } = req.params;

    const updatedListing = await listing.findByIdAndUpdate(
        id,
        { ...req.body.listing }
    );
if(!updatedListing){
         req.flash("error"," listing does not exist ! ");
         return res.redirect("/listings");
    }
    req.flash("success"," listing updated ");
    res.redirect(`/listings/${id}`);
}));


// DELETE yaahna se revieew aka deletion call hoga middle ware .findByIdAndDelete
router.delete("/:id", isLoggedIn, isOwner,asyncWrap(async (req, res) => {
    const { id } = req.params;

    await listing.findByIdAndDelete(id);
 req.flash("success"," listing deleted ");
    res.redirect("/listings");
}));


module.exports =router;