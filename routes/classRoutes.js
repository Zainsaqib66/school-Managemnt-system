// routes/classRoutes.js
const express = require('express');
const router  = express.Router();
const Class   = require('../models/class');
const Student = require('../models/student');

// GET /classes — list all classes
router.get('/', async (req, res) => {
  const classes = await Class.find().sort('name');
  res.render('classes', { classes });
});

// POST /classes/add — create new class
router.post('/add', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.redirect('/classes?error=Name%20required');
  }
  try {
    await Class.create({ name });
    res.redirect('/classes');
  } catch (e) {
    res.redirect('/classes?error=' + encodeURIComponent(
      e.code === 11000 ? 'Class%20already%20exists' : e.message
    ));
  }
});

// GET /classes/:className — list students in class
router.get('/:className', async (req, res) => {
  const className = req.params.className;
  const students  = await Student.find({ class: className }).sort('rollNumber');
  res.render('classStudents', { className, students });
});

module.exports = router;
