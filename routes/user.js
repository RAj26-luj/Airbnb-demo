const express = require('express');
const router = express.Router();
const { savereturnTo,isLoggedIn } = require('../middleware.js');
const { registerGet, registerPost, loginGet, loginPost, logout, checkAvalibility,checkEmailAvalibility} = require('../controllers/user.js');

// resister routes
router.route('/register')
      .get(registerGet)
      .post(registerPost);
//login routes
router.route('/login')
      .get(loginGet)
      .post(savereturnTo, loginPost);
//logout route
router.get('/logout',isLoggedIn, logout );
router.get('/check-username', checkAvalibility);
router.get("/check-email",checkEmailAvalibility);

module.exports = router; 