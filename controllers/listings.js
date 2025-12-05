const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { cloudinary } = require('../cloudConfig.js');
const mbxGeocodind = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocodind({ accessToken: mapBoxToken });
const index = wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", { listings });
});

const AddGet = (req, res) => {
    res.render("listings/new.ejs");
};

const AddPost = wrapAsync(async (req, res) => {
  const listingData = req.body.listing || {};
  const { city, country } = listingData;

 
  if (!city || !country) {
    req.flash("error", "City and Country are required.");
    return res.redirect("/listings/new");
  }


  try {
    const geoResponse = await geocodingClient
      .forwardGeocode({
        query: `${city}, ${country}`,
        limit: 1,
      })
      .send();

    const features = geoResponse.body.features || [];
    const feature = features[0];

    if (!feature || !Array.isArray(feature.center)) {
      req.flash("error", "Could not find coordinates for this location. Please enter a valid city.");
      return res.redirect("/listings/new");
    }

    const [lon, lat] = feature.center;

   
    listingData.latitude = lat;
    listingData.longitude = lon;

   
    if (feature.text) {
      listingData.city = feature.text;
    }

  } catch (err) {
    console.error("Mapbox Geocoding Error:", err.message);
    req.flash("error", "Geocoding service failed. Try again later.");
    return res.redirect("/listings/new");
  }

 
  try {
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;

  
    if (req.file) {
      newListing.image = {
        url: req.file.secure_url || req.file.path || req.file.url,
        filename: req.file.filename || req.file.public_id,
      };
    } else {
      newListing.image = {
        url: "/images/flat-hotel-review-background_23-2148158366.avif",
        filename: "default-image",
      };
    }

    await newListing.save();

    
    req.flash("success", "Property added Successfully!");
    return res.redirect("/listings");

  } catch (err) {
    console.error("Database save error:", err.message);
    req.flash("error", "Failed to add property. Please try again.");
    return res.redirect("/listings/new");
  }
});

const Show = wrapAsync(async (req, res) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ExpressError(400, "Invalid Listing ID");
    }
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            },
        })
        .populate('owner');

    if (!listing) {
        req.flash('error', 'item not found!');
        return res.redirect('/listings');
    }
    res.render("listings/show.ejs", { listing });
});

const EditGet = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'item not found!');
        return res.redirect('/listings');
    }
    let originalUrl = listing.image.url;
    originalUrl = originalUrl.replace('/upload/', '/upload/w_500/');

    res.render("listings/edit.ejs", { listing, originalUrl });
});

const EditPost = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listingData = req.body.listing || {};
  const { city, country } = listingData;

  const listing = await Listing.findById(id);
  if (!listing) {

    if (req.file) {
      const publicId = req.file.filename || req.file.public_id;
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Error deleting Cloudinary image when listing missing:", err);
        }
      }
    }
    req.flash("error", "Item not found!");
    return res.redirect("/listings");
  }

  
  if (city && country) {
    try {
      const geoResponse = await geocodingClient
        .forwardGeocode({
          query: `${city}, ${country}`,
          limit: 1,
        })
        .send();

      const features = geoResponse.body.features || [];
      const feature = features[0];

      if (!feature || !Array.isArray(feature.center)) {
      
        if (req.file) {
          const publicId = req.file.filename || req.file.public_id;
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error("Error deleting Cloudinary image on invalid city:", err);
            }
          }
        }

        req.flash(
          "error",
          "Could not find coordinates for this location. Please enter a valid city."
        );
        return res.redirect(`/listings/${id}/edit`);
      }

      const [lon, lat] = feature.center;

      
      listingData.latitude = lat;
      listingData.longitude = lon;

      if (feature.text) {
        listingData.city = feature.text;
      }
    } catch (err) {
      console.error("Mapbox Geocoding Error (edit):", err.message);

     
      if (req.file) {
        const publicId = req.file.filename || req.file.public_id;
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err2) {
            console.error("Error deleting Cloudinary image on geocoding error:", err2);
          }
        }
      }

      req.flash("error", "Unable to update location. Please try again later.");
      return res.redirect(`/listings/${id}/edit`);
    }
  }

  
  if (listingData.title !== undefined) listing.title = listingData.title;
  if (listingData.description !== undefined) listing.description = listingData.description;
  if (listingData.price !== undefined) listing.price = listingData.price;
  if (listingData.country !== undefined) listing.country = listingData.country;
  if (listingData.location !== undefined) listing.location = listingData.location;
  if (listingData.city !== undefined) listing.city = listingData.city;
  if (listingData.latitude !== undefined) listing.latitude = listingData.latitude;
  if (listingData.longitude !== undefined) listing.longitude = listingData.longitude;

  
  if (req.file) {
   
    if (
      listing.image &&
      listing.image.filename &&
      listing.image.filename !== "default-image"
    ) {
      try {
        await cloudinary.uploader.destroy(listing.image.filename);
      } catch (err) {
        console.error("Error deleting old Cloudinary image on edit:", err);
      }
    }

    listing.image = {
      url: req.file.secure_url || req.file.path || req.file.url,
      filename: req.file.public_id || req.file.filename,
    };
  }

  
  await listing.save();

  req.flash("success", "Details updated Successfully!");
  res.redirect(`/listings/${listing._id}`);
});
const Destroy = wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Item not found!");
        return res.redirect("/listings");
    }

    if (listing.image && listing.image.filename && listing.image.filename !== "default-image") {
        try {
            await cloudinary.uploader.destroy(listing.image.filename);
        } catch (err) {
            console.error("Error deleting Cloudinary image:", err);
        }
    }

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Property deleted successfully!");
    res.redirect("/listings");
});

const searchListings = async (req, res) => {
    const q = (req.query.q || "").trim();

    if (!q) {
        req.flash("error", "Please enter something to search.");
        return res.redirect("/listings");
    }

    const regex = new RegExp(q, "i");

    const listings = await Listing.find({
        $or: [
            { title: regex },
            { city: regex },
            { location: regex },
            { country: regex },
            { category: regex }
        ]
    });

    res.render("listings/search.ejs", {
        listings,
        query: q
    });
};

const searchSuggestions = async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");

    const listings = await Listing.find({
        $or: [
            { title: regex },
            { city: regex },
            { location: regex },
            { country: regex },
            { category: regex }
        ]
    }, {
        title: 1,
        city: 1,
        location: 1,
        country: 1,
        category: 1
    }).limit(7);

    const suggestions = listings.map(l => ({
        id: l._id,
        url: `/listings/${l._id}`,
        label: `${l.title} – ${l.city || l.location || ""}${l.country ? ", " + l.country : ""} (${l.category})`
    }));

    res.json(suggestions);
};

const categoryListings = wrapAsync(async (req, res) => {
    const rawCategory = req.params.category;
    const category = decodeURIComponent(rawCategory);

    const listings = await Listing.find({ category });

    if (!listings.length) {
        req.flash("error", `No properties found in "${category}" category.`);
    }

    res.render("listings/category.ejs", {
        listings,
        category,
        selectedCategory: category
    });
});

module.exports = {
    index,
    AddGet,
    AddPost,
    Show,
    EditGet,
    EditPost,
    Destroy,
    searchListings,
    searchSuggestions,
    categoryListings
};