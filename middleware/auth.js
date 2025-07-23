function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in first.');
  res.redirect('/login');
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied.');
  res.redirect('/login');
}

function ensurePrincipal(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'principal') {
    return next();
  }
  req.flash('error', 'Access denied.');
  res.redirect('/login');
}

function ensureTeacher(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'teacher') {
    return next();
  }
  req.flash('error', 'Access denied.');
  res.redirect('/login');
}

module.exports = { ensureAuth, ensureAdmin, ensurePrincipal, ensureTeacher };
