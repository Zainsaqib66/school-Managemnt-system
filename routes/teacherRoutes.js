const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

function ensureTeacher(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'teacher') return next();
  res.redirect('/login');
}

router.get('/teacher', ensureTeacher, (req, res) => {
  res.render('teacher/dashboard', { user: req.user });
});

module.exports = router;
