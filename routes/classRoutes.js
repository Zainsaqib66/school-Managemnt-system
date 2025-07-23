const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Class = require('../models/class');

router.use(ensureAuthenticated);

// List classes
router.get('/classes', async (req, res) => {
  const classes = await Class.find();
  res.render('classes/classList', { classes });
});

// Show add class form
router.get('/classes/add', (req, res) => {
  res.render('classes/addClass');
});

// Handle add class POST
router.post('/classes/add', async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.redirect('/classes');
  } catch (err) {
    console.error(err);
    res.redirect('/classes/add');
  }
});

// Show edit class form
router.get('/classes/edit/:id', async (req, res) => {
  const classObj = await Class.findById(req.params.id);
  if (!classObj) return res.redirect('/classes');
  res.render('classes/editClass', { classObj });
});

// Handle edit class POST
router.post('/classes/edit/:id', async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/classes');
  } catch (err) {
    console.error(err);
    res.redirect(`/classes/edit/${req.params.id}`);
  }
});

// Delete class
router.get('/classes/delete/:id', async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.redirect('/classes');
  } catch (err) {
    console.error(err);
    res.redirect('/classes');
  }
});

module.exports = router;
