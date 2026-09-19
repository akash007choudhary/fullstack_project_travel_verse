const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().min(0).required(),
        country: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.object({
            filename: Joi.string().allow(""),
            url: Joi.string().allow("")
        })
    }).required()
});

module.exports = listingSchema;