const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const listing = require("./models/listing");
const methodOverride = require("method-override");
const app = express();
const port = 3000;

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


// app.get("/testlisting", async(req,res)=>{
//     let sample = new listing({
//     title: "Cozy Beach House",
//     description: "A comfortable house near the beach.",
//     // image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
//     price: 2500,
//     location: "Goa",
//     country: "India"
//     });

//     await sample.save();
//     console.log("sample saved ");
//     res.send("sucessful ");

// })


// READ
app.get("/listings", async(req, res) => {
 const all_listings=await listing.find({});
 res.render("./listings/index.ejs",{all_listings});
});

// NEW FORM TO CREATE NEW LISTING ( READ)
app.get("/listings/new",(req,res)=>{
res.render("./listings/new.ejs");
});

// CRETAE NEW LISTING (POST)
app.post("/listings", async (req, res) => {
  const newListing = new listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
} );

// READ → Get one particular listing
app.get("/listings/:id", async(req,res)=>{
let {id}=req.params;

    const user = await listing.findById(id);

    res.render("./listings/show.ejs",{user});

});


// UPDATE
app.get("/listings/:id/edit", async (req,res)=>{
  const {id }= req.params;
    const user = await listing.findById(id);
res.render("./listings/edit.ejs",{user});
});


app.put("/listings/:id", async (req,res)=>{
  const {id }= req.params;
  const updatedListing = await listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
});




// DELETE
app.delete("/listings/:id", async (req,res)=>{
  const {id }= req.params;
  await listing.findByIdAndDelete(id);
  res.redirect("/listings");
});


// Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
