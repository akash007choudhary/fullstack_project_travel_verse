const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncWrap = require("../utils/async");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingcontroller = require("../controllers/listings.js");
const multer = require('multer');

const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

// READ - Get all listings
// CREATE NEW LISTING
router.route("/")
    .get( asyncWrap(listingcontroller.index))
    .post(
    isLoggedIn,
   
    upload.single('listing[image][file]'),
     validateListing,
    
    asyncWrap(listingcontroller.createListing)
    );

    
// NEW FORM TO CREATE NEW LISTING
router.get("/new", isLoggedIn, listingcontroller.renderNewForm);

    // READ - Get one particular listing
    // UPDATE - Actually update listing
    // DELETE LISTING
router.route("/:id")
    .get(asyncWrap(listingcontroller.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image][file]"),
        validateListing,
        asyncWrap(listingcontroller.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        asyncWrap(listingcontroller.destroyListing)
    );


// UPDATE - Show edit form
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    asyncWrap(listingcontroller.renderEditForm)
);
module.exports = router;