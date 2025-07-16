// routes/studentRoutes.js
const express = require('express');
const router  = express.Router();
const Class   = require('../models/class');
const Student = require('../models/student');

// Helper to load all classes
async function loadClasses() {
  return Class.find().sort('name');
}

// LIST all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort('rollNumber');
    res.render('studentList', {
      students,
      message: req.query.message || null
    });
  } catch {
    res.render('studentList', {
      students: [],
      message: null,
      error:   'Unable to fetch students.'
    });
  }
});

// SHOW add-student form
router.get('/add', async (req, res) => {
  const classes        = await loadClasses();
  const defaultClass   = req.query.className || '';
  const defaultSection = req.query.section   || '';
  res.render('addStudent', {
    error:   null,
    student: { className: defaultClass, section: defaultSection },
    classes
  });
});

// CREATE new student
router.post('/add', async (req, res) => {
  const classes = await loadClasses();
  const {
    name, rollNumber, className,
    section, dob, gender,
    address, phone, email,
    fatherName, motherName, guardianContact,
    admissionDate
  } = req.body;

  // Required fields
  if (!name || !rollNumber || !className || !section) {
    return res.render('addStudent', {
      error:   'Name, Roll #, Class & Section are required',
      student: req.body,
      classes
    });
  }
  // Class must exist
  if (!await Class.exists({ name: className })) {
    return res.render('addStudent', {
      error:   'Selected class does not exist',
      student: req.body,
      classes
    });
  }
  // Roll number unique
  if (await Student.exists({ rollNumber })) {
    return res.render('addStudent', {
      error:   'Roll number already in use',
      student: req.body,
      classes
    });
  }

  try {
    await Student.create({
      name,
      rollNumber,
      className,
      section,
      dob,
      gender,
      address,
      phone,
      email,
      guardian: { fatherName, motherName, contact: guardianContact },
      admissionDate
    });
    res.redirect('/students?message=Student+added');
  } catch (err) {
    console.error(err);
    res.render('addStudent', {
      error:   'Unable to create student',
      student: req.body,
      classes
    });
  }
});

// VIEW student details
router.get('/view/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.redirect('/students');
    res.render('viewStudent', { student });
  } catch {
    res.redirect('/students');
  }
});

// SHOW edit-student form
router.get('/edit/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const classes = await loadClasses();
    if (!student) return res.redirect('/students');
    res.render('editStudent', { error: null, student, classes });
  } catch {
    res.redirect('/students');
  }
});

// UPDATE student — require name, rollNumber, className, section; allow partial update
router.post('/edit/:id', async (req, res) => {
  const classes = await loadClasses();
  let {
    name,
    rollNumber,
    className,
    section,
    dob, gender,
    address, phone, email,
    fatherName, motherName, guardianContact,
    admissionDate
  } = req.body;

  // Coerce section to string if array
  if (Array.isArray(section)) {
    section = section[0];
  }

  // Required fields
  if (!name || !rollNumber || !className || !section) {
    return res.render('editStudent', {
      error:   'Name, Roll #, Class & Section are required',
      student: { _id: req.params.id, ...req.body, section },
      classes
    });
  }
  // Class must exist
  if (!await Class.exists({ name: className })) {
    return res.render('editStudent', {
      error:   'Selected class does not exist',
      student: { _id: req.params.id, ...req.body, section },
      classes
    });
  }

  // Build update object
  const update = {
    name,
    rollNumber,
    className,
    section,
    dob,
    gender,
    address,
    phone,
    email,
    admissionDate,
    guardian: {
      fatherName,
      motherName,
      contact: guardianContact
    }
  };

  try {
    await Student.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true, context: 'query' }
    );
    res.redirect('/students?message=Student+updated');
  } catch (err) {
    console.error(err);
    res.render('editStudent', {
      error:   'Unable to update student',
      student: { _id: req.params.id, ...req.body, section },
      classes
    });
  }
});

// DELETE student
router.post('/delete/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    const msg = student
      ? `Deleted student '${student.name}'`
      : 'Student not found';
    res.redirect(`/students?message=${encodeURIComponent(msg)}`);
  } catch {
    res.redirect(`/students?error=${encodeURIComponent('Unable to delete student')}`);
  }
});

module.exports = router;
