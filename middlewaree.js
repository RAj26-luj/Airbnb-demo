const Listing=require('./models/listing');
const { listingSchema } = require('./schema');
const { reviewSchema } = require('./schema.js');
const Review = require('./models/review.js');  
const ExpressError = require('./utils/ExpressError.js');  
//check if user is authenticated middleware
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.method === 'GET' &&
            req.originalUrl !== '/login' &&
            req.originalUrl !== '/register') {
            req.session.returnTo = req.originalUrl;
        }

        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};
//save returnTo url middleware
const savereturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};
//check if current user is owner middleware 
const isOwner = async(req, res, next) => {
    const { id } = req.params;
    let lissting= await Listing.findById(id);
    if (!lissting.owner._id.equals(res.locals.currUser._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};
//validtate listing schema middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};
//validate review schema middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    } else {
    next();}
};
//check if current user is review author middleware
const isAuthor = async(req, res, next) => {
    const { id,reviewId } = req.params;
    let review= await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};
module.exports = { isLoggedIn, savereturnTo,isOwner, validateListing ,validateReview, isAuthor};