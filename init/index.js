require("dotenv").config();

const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

// MongoDB Atlas Connection
async function main() {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("MongoDB Atlas connected");
}

const initDB = async () => {

    // Check if listings already exist
    const count = await Listing.countDocuments();

    if (count > 0) {
        console.log("Listings already exist. Skipping initialization.");
        return;
    }

    // Add owner and coordinates to every listing
    const updatedData = await Promise.all(
        initdata.data.map(async (obj) => {

            // Get coordinates using Mapbox
            let response = await geocodingClient.forwardGeocode({
                query: `${obj.location}, ${obj.country}`,
                limit: 1,
                mode: "mapbox.places-permanent"
            }).send();

            let coordinates = response.body.features[0]?.geometry.coordinates;

            if (!coordinates) {
                console.log("Location not found:", obj.location);
            }

            return {
                ...obj,
                owner: "6ae0bf5134d822dfb5aeaf4e",
                ...(coordinates && {
                    geometry: {
                        type: "Point",
                        coordinates: coordinates
                    }
                })
            };
        })
    );

    // Insert updated data
    await Listing.insertMany(updatedData);

    console.log("Data was initialized with coordinates!");
};

// Run everything in order
main()
    .then(initDB)
    .then(() => mongoose.connection.close())
    .catch((err) => {
        console.log(err);
        mongoose.connection.close();
    });