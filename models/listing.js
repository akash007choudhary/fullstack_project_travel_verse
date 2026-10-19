const mongoose = require("mongoose");
const { type } = require("../schema");
const Review = require("./review.js");

const Schema = mongoose.Schema;

const listingschema = new Schema({
  title: {
    type: String,
    require: true,
  },
  description: String,
image: {
  filename: {
    type: String,
    default: "listingimage"
  },
  url: {
    type: String,
    default: "https://imgs.search.brave.com/7lQkJq57nPqos8T04rY9VebJ0fXxfF2ES4FkXE7TYrA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vcGljanVt/Ym8uY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy93b21hbi13aXRo/LWJsdWUtZXllcy1w/c3ljaG9sb2d5LWZh/bGxpbmctYXBhcnQt/ZnJlZS1waG90by5q/cGc_dz02MDAmcXVhbGl0eT04MA"
  }
},
    price: {
        type: Number,
        min: 0,
        required: true
    },
      location: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },
reviews: [
    {
        type: Schema.Types.ObjectId,
        ref: "Review"
    }
]
});

// Cascade delete: when a listing is deleted, delete all its associated reviews.
// matlb jab listnn ka dlete call krega findone and delte ko to wo iss middle ware ko phel run krke review ko delte kr dega 
listingschema.post("findOneAndDelete",async(listing)=>{
   if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});


// listing is the file name inside mongoose
const listing = mongoose.model("listing", listingschema);
module.exports = listing;
