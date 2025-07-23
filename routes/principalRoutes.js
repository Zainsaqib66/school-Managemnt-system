const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

function ensurePrincipal(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'principal') return next();
  res.redirect('/login');
}

router.get('/principal', ensurePrincipal, (req, res) => {
  res.render('principal/dashboard', { user: req.user });
});

module.exports = router;
