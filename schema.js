const Joi = require("joi");
// Listing schema validation
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    city: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),

    latitude: Joi.number().optional().allow(null, ""),
    longitude: Joi.number().optional().allow(null, ""),

    category: Joi.string()
      .required()
      .valid(
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Hill Stations",
        "Castles",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Arctics",
        "Deserts"
      ),

    image: Joi.object({
      filename: Joi.string().allow("", null),
      url: Joi.string().allow("", null),
    }).allow(null),
  }).required(),
});

// Review schema validation
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5),
    }).required(),
});