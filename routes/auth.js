const express = require('express');
const passport = require('passport');
const router = express.Router();

// Login GET
router.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error') });
});

// Login POST
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res) => {
    res.redirect('/home');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

module.exports = router;
