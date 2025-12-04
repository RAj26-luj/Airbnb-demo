if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const port=8080;
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError.js');  
const MongoDBURL=process.env.ATLASDB_URL;
const listingsRouter=require('./routes/listings.js');
const reviewsRouter=require('./routes/review.js');
const usersRouter=require('./routes/user.js');
const session = require('express-session');
const flash=require('connect-flash');
const ejsMate=require('ejs-mate');
const passport=require('passport');
const User=require('./models/user.js');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo; 
const Listing = require('./models/listing.js');
const wrapAsync = require('./utils/wrapAsync.js');


//ejs setup
app.engine('ejs', ejsMate);
//connect to MongoDB
main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});
async function main() {
  await mongoose.connect(MongoDBURL);
};
//views path
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//pulic middleware
app.use(express.static(path.join(__dirname, "public")));
//decode from url
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//method override middleware
app.use(methodOverride("_method"));
//session middleware
const store = MongoStore.create({
  mongoUrl: MongoDBURL,
  touchAfter: 24 * 3600 , // seconds
  crypto: {
    secret: process.env.SECRET,
  }
});

store.on('error', (e) => {
  console.log('SESSION STORE ERROR', e);
});
const sessionConfig = {
    store: store,
    secret: process.env.SECRET ,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
//flash middleware
app.use(flash());
//passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash & user setup
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});
// review routes
app.use('/listings/:id/reviews', reviewsRouter);
//listing routes
app.use('/listings', listingsRouter);
//user routes
app.use('/', usersRouter);
//
app.get('/privacy',(req,res) =>{
    res.render('listings/privacy.ejs');
});
app.get('/terms',(req,res) =>{
    res.render('listings/terms.ejs');
});
app.get('/', wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", { listings });
}));
// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});
// Centralized error handler
app.use((err, req, res, next) => {
    console.error('Error handler caught:', err); 

    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { statusCode, message });
});
//listening to server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
