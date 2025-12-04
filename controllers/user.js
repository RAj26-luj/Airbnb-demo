const User = require('../models/user.js');
// Register controller
const registerGet=(req, res) => {
  res.render('users/register');
};

const registerPost=async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password); 
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Airbnb!');
      res.redirect('/listings');
    });
  } catch (e) {
    console.log('Register error:', e);
    req.flash('error', e.message);
    res.redirect('/register');
  }
};
// Login controller
const loginGet=(req, res) => {
  res.render('users/login');
};

const loginPost=async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const authenticate = User.authenticate();          
    const { user, error } = await authenticate(username, password);
    if (!user || error) {
      req.flash('error', (error && error.message) || 'Invalid Username or Password');
      return res.redirect('/login');
    }
    req.login(user, (err) => {
      if (err) return next(err);

      req.flash('success', 'Welcome back!');
      const redirectUrl = res.locals.returnTo || '/listings';
      delete req.session.returnTo;
       return res.redirect(redirectUrl);
    });
  }catch (err) {
    return next(err);
  }};
// Logout controller
const logout=(req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Logged you out!');
    res.redirect('/listings');
  });
};
const checkAvalibility=async (req, res) => {
    const { username } = req.query;
    if (!username) return res.json({ available: false });

    const user = await User.findOne({ username });

    res.json({ available: !user });
}
 const checkEmailAvalibility=async (req, res) => {
    const { email } = req.query;
    if (!email) return res.json({ available: false });

    const user = await User.findOne({ email });
    res.json({ available: !user });
}

module.exports={ registerGet, registerPost, loginGet, loginPost, logout , checkAvalibility, checkEmailAvalibility};

 