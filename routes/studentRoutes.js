// routes/studentRoutes.js
const express = require('express');
const router  = express.Router();
const Class   = require('../models/class');
const Student = require('../models/student');

// GET /students — list all students
router.get('/', async (req, res) => {
  const students = await Student.find().sort('rollNumber');
  res.render('studentList', { students });
});

// GET /students/add — show add-student form
router.get('/add', async (req, res) => {
  const classes = await Class.find().sort('name');
  const fromClass = req.query.className || '';
  res.render('addStudent', {
    error:      req.query.error || null,
    name:       '',
    rollNumber: '',
    className:  fromClass,
    classes
  });
});

// POST /students/add — create student
router.post('/add', async (req, res) => {
  const { name, rollNumber, className } = req.body;
  const classes = await Class.find().sort('name');
  if (!name || !rollNumber || !className) {
    return res.render('addStudent', {
      error: 'All fields are required', name, rollNumber, className, classes
    });
  }
  if (!await Class.findOne({ name: className })) {
    return res.render('addStudent', {
      error: 'Class not found', name, rollNumber, className, classes
    });
  }
  if (await Student.findOne({ rollNumber })) {
    return res.render('addStudent', {
      error: 'Roll number exists', name, rollNumber, className, classes
    });
  }
  await Student.create({ name, rollNumber, class: className });
  // redirect back to class page if added from a class
  return className
    ? res.redirect(`/classes/${encodeURIComponent(className)}`)
    : res.redirect('/students');
});

// GET /students/edit/:id — show edit form
router.get('/edit/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.redirect('/students');
  const classes = await Class.find().sort('name');
  const fromClass = req.query.fromClass || '';
  res.render('editStudent', {
    student, className: student.class, error: null, classes, fromClass
  });
});

// POST /students/edit/:id — update student
router.post('/edit/:id', async (req, res) => {
  const { name, rollNumber, className, fromClass } = req.body;
  const classes = await Class.find().sort('name');
  if (!name || !rollNumber || !className) {
    return res.render('editStudent', {
      error: 'All fields are required',
      student:   { _id: req.params.id, name, rollNumber },
      className, classes, fromClass
    });
  }
  if (!await Class.findOne({ name: className })) {
    return res.render('editStudent', {
      error: 'Class not found',
      student:   { _id: req.params.id, name, rollNumber },
      className, classes, fromClass
    });
  }
  const student = await Student.findById(req.params.id);
  student.name       = name;
  student.rollNumber = rollNumber;
  student.class      = className;
  await student.save();
  return fromClass
    ? res.redirect(`/classes/${encodeURIComponent(fromClass)}`)
    : res.redirect('/students');
});

// POST /students/delete/:id — delete student
router.post('/delete/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  const redirectClass = student?.class;
  await Student.findByIdAndDelete(req.params.id);
  return redirectClass
    ? res.redirect(`/classes/${encodeURIComponent(redirectClass)}`)
    : res.redirect('/students');
});

module.exports = router;
