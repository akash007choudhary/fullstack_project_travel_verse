
const mongoose = require("mongoose");

const initdata = require("./data.js");

const Listing = require("../models/listing.js");

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

const initDB = async () => {
    await Listing.deleteMany({});

    initdata.data = initdata.data.map((obj) => ({
        ...obj,
        owner: "6ae0bf5134d822dfb5aeaf4e",
    }));

    await Listing.insertMany(initdata.data);

    console.log("data was initialized");
};

initDB();
