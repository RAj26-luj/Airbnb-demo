const express = require('express');
const router = express.Router({ mergeParams: true });
const { AddPost,destroy } = require('../controllers/review.js'); 
const { isLoggedIn,validateReview,isAuthor } = require('../middleware.js');
//review routes
router.post("/",isLoggedIn,validateReview, AddPost);
// delete review
router.delete("/:reviewId",isLoggedIn,isAuthor, destroy);
module.exports = router;