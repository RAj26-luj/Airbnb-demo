const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js'); 


const AddPost=wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
     if (!listing) {
        throw new ExpressError(404, "Listing not found");}
    const review = new Review(req.body.review);
    review.author=req.user._id;
    const existingReview = await Review.findOne({
        _id: { $in: listing.reviews },   
        author: req.user._id            
    });
    if (existingReview) {
        req.flash('error', 'You have already reviewed this property!');
        return res.redirect(`/listings/${listing._id}`);
    }listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash('success', 'Review added Successfully!');
    res.redirect(`/listings/${listing._id}`);
});

const destroy=wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted Successfully!');
    res.redirect(`/listings/${id}`);
});

module.exports={ AddPost, destroy };