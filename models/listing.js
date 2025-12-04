const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    url: String,
    filename: String
  },
  price: Number,
  city: { type: String, required: true },
  location: String,
  country: String,
  latitude: Number,
  longitude: Number,

  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },

  reviews: [{
    type: Schema.Types.ObjectId,
    ref: review
  }],
  
  owner: { type: Schema.Types.ObjectId, ref: "User" }
});

listingSchema.post('findOneAndDelete', async function(listing) {
    if (listing) {
        await review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;