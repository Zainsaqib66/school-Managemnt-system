// routes/classRoutes.js
const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const Student = require('../models/student');

// GET /classes — list all classes
// GET /classes — list all classes with student count
router.get('/', async (req, res) => {
  const classList = await Class.find().sort('name');
  const studentCounts = await Student.aggregate([
    { $group: { _id: "$class", count: { $sum: 1 } } }
  ]);

  const countMap = {};
  studentCounts.forEach(item => {
    countMap[item._id] = item.count;
  });

  const classes = classList.map(c => ({
    _id: c._id,
    name: c.name,
    studentCount: countMap[c.name] || 0
  }));

  res.render('classes', {
    classes,
    message: req.query.message || null,
    error: req.query.error || null
  });
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
  const students = await Student.find({ class: className }).sort('rollNumber');
  res.render('classStudents', { className, students });
});


// POST /classes/delete/:id — delete a class
router.post('/delete/:id', async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    const message = 'Class deleted successfully';
    res.redirect(`/classes?message=${encodeURIComponent(message)}`);
  } catch (e) {
    res.redirect(`/classes?error=${encodeURIComponent('Failed to delete class')}`);
  }
});


module.exports = router;
