const express = require('express');
const router = express.Router();
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const {index,AddGet,AddPost,Show,EditGet,EditPost,Destroy,searchListings,searchSuggestions,categoryListings}=require('../controllers/listings.js');
const multer  = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage: storage });

// all listings
router.route('/')
      .get(index)
      .post(isLoggedIn, upload.single('listing[image]'), validateListing, AddPost);

// serch listings
router.get('/search', searchListings);

// search suggestions for autocomplete
router.get('/search/suggestions', searchSuggestions);

// new listing
router.get("/new", isLoggedIn, AddGet);
// listings by category
router.get('/category/:category', categoryListings);

// show / update / delete
router.route('/:id')
      .get(Show)
      .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, EditPost)
      .delete(isLoggedIn, isOwner, Destroy);

// edit form
router.get("/:id/edit", isLoggedIn, isOwner, EditGet);

module.exports = router;
