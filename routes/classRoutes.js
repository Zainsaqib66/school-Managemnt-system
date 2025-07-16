const express = require('express');
const router  = express.Router();
const Class   = require('../models/class');
const Student = require('../models/student');

// LIST all classes with student counts
router.get('/', async (req, res) => {
  const classList = await Class.find().sort('name');
  const studentCounts = await Student.aggregate([
    { $group: { _id: '$className', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  studentCounts.forEach(item => { countMap[item._id] = item.count; });

  const classes = classList.map(c => ({
    _id: c._id,
    name: c.name,
    studentCount: countMap[c.name] || 0
  }));

  res.render('classes', {
    classes,
    message: req.query.message || null,
    error:   req.query.error   || null
  });
});

// CREATE new class
router.post('/add', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.redirect('/classes?error=' + encodeURIComponent('Name required'));
  }
  try {
    await Class.create({ name });
    res.redirect('/classes');
  } catch (err) {
    res.redirect('/classes?error=' +
      encodeURIComponent(err.code === 11000
        ? 'Class already exists'
        : err.message));
  }
});

// VIEW students in one class
router.get('/:className', async (req, res) => {
  try {
    const className = req.params.className;
    const students  = await Student.find({ className }).sort('rollNumber');
    res.render('classStudents', {
      className,
      students,
      message: req.query.message || null,
      error:   req.query.error   || null
    });
  } catch {
    res.redirect('/classes?error=' + encodeURIComponent('Unable to fetch students'));
  }
});

// DELETE a class AND all its students
router.post('/delete/:id', async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (cls) await Student.deleteMany({ className: cls.name });
    res.redirect('/classes?message=' +
      encodeURIComponent('Class and its students deleted.'));
  } catch {
    res.redirect('/classes?error=' +
      encodeURIComponent('Failed to delete class.'));
  }
});

module.exports = router;
