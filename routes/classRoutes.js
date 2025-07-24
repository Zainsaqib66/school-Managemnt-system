const express = require('express');
const router  = express.Router();
const Class   = require('../models/class');
const Section = require('../models/section');

// middleware to protect admin routes
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.redirect('/login');
}

// ─── CLASS ROUTES ──────────────────────────────────────────────────────────────

// List all classes
router.get('/admin/classes', ensureAdmin, async (req, res) => {
  const classes = await Class.find().sort('name');
  res.render('admin/classList', { user: req.user, classes });
});

// Show standalone “Add Class” page
router.get('/admin/classes/add', ensureAdmin, (req, res) => {
  res.render('admin/addClass', {
    user: req.user,
    error: null,
    form: {}
  });
});

// Create class
router.post('/admin/classes/create', ensureAdmin, async (req, res) => {
  try {
    await Class.create({ name: req.body.name });
    res.redirect('/admin/classes');
  } catch (err) {
    res.render('admin/addClass', {
      user: req.user,
      error: 'Could not create class, please try again.',
      form: req.body
    });
  }
});

// Edit & Delete class (unchanged)
router.post('/admin/classes/edit/:id', ensureAdmin, async (req, res) => {
  await Class.findByIdAndUpdate(req.params.id, { name: req.body.name });
  res.redirect('/admin/classes');
});
router.post('/admin/classes/delete/:id', ensureAdmin, async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.redirect('/admin/classes');
});


// ─── SECTION ROUTES ────────────────────────────────────────────────────────────

// View sections for one class
router.get('/admin/classes/:classId/sections', ensureAdmin, async (req, res) => {
  const classItem = await Class.findById(req.params.classId);
  const sections  = await Section.find({ classId: req.params.classId }).sort('name');
  res.render('admin/sectionList', { user: req.user, classItem, sections });
});

// Show standalone “Add Section” page
router.get('/admin/classes/:classId/sections/add', ensureAdmin, async (req, res) => {
  const classItem = await Class.findById(req.params.classId);
  res.render('admin/addSection', {
    user: req.user,
    classItem,
    error: null,
    form: {}
  });
});

// Create section under class
router.post('/admin/classes/:classId/sections/create', ensureAdmin, async (req, res) => {
  try {
    await Section.create({
      name:    req.body.name,
      classId: req.params.classId
    });
    res.redirect(`/admin/classes/${req.params.classId}/sections`);
  } catch (err) {
    const classItem = await Class.findById(req.params.classId);
    res.render('admin/addSection', {
      user: req.user,
      classItem,
      error: 'Could not create section, please try again.',
      form: req.body
    });
  }
});

// (You can optionally add Edit/Delete section routes here…)

module.exports = router;
