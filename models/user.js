const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose= require("passport-local-mongoose");

const userSchema= new Schema({
    emial:{
        type: String,
        required: true,
    },
});

// auotmatically adds Passport authentication features to the User model, including username/password handling, password hashing, and user authentication methods.
User.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);