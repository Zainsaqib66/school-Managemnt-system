const express = require('express');
const router = express.Router();

const Class   = require('../models/class');
const Section = require('../models/section');
const Student = require('../models/student');

// Middleware to protect admin routes
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.redirect('/login');
}

// 🏠 Admin Dashboard
router.get('/admin', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { user: req.user });
});

// 👥 Users Page
router.get('/admin/users', ensureAdmin, (req, res) => {
  res.render('admin/userList', { user: req.user });
});

// 🚀 CLASS ROUTES

// List all classes
router.get('/admin/classes', ensureAdmin, async (req, res) => {
  const classes = await Class.find();
  res.render('admin/classList', { user: req.user, classes });
});

// Create class
router.post('/admin/classes/create', ensureAdmin, async (req, res) => {
  await Class.create({ name: req.body.name });
  res.redirect('/admin/classes');
});

// Edit class
router.post('/admin/classes/edit/:id', ensureAdmin, async (req, res) => {
  await Class.findByIdAndUpdate(req.params.id, { name: req.body.name });
  res.redirect('/admin/classes');
});

// Delete class
router.post('/admin/classes/delete/:id', ensureAdmin, async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.redirect('/admin/classes');
});

// 📚 SECTION ROUTES

// View sections for one class
router.get('/admin/classes/:classId/sections', ensureAdmin, async (req, res) => {
  const classItem = await Class.findById(req.params.classId);
  const sections  = await Section.find({ classId: req.params.classId });
  res.render('admin/sectionList', { user: req.user, classItem, sections });
});

// Create new section under class
router.post('/admin/classes/:classId/sections/create', ensureAdmin, async (req, res) => {
  await Section.create({
    name:    req.body.name,
    classId: req.params.classId
  });
  res.redirect(`/admin/classes/${req.params.classId}/sections`);
});

// 👨‍🎓 STUDENT ROUTES

// List all students
router.get('/admin/students', ensureAdmin, async (req, res) => {
  const students = await Student.find();
  res.render('admin/studentList', { user: req.user, students, section: null });
});

// Show Add Student form
router.get('/admin/students/add', ensureAdmin, async (req, res) => {
  const classes  = await Class.find();
  const sections = await Section.find();
  res.render('admin/addStudentAdmin', {
    user: req.user,
    classes,
    sections,
    form: {},
    error: null
  });
});

// Create student (global)
router.post('/admin/students/create', ensureAdmin, async (req, res) => {
  const { name, rollNumber, className, section } = req.body;
  if (!name || !rollNumber || !className || !section) {
    const classes  = await Class.find();
    const sections = await Section.find();
    return res.render('admin/addStudentAdmin', {
      user: req.user,
      classes,
      sections,
      form: req.body,
      error: 'Name, Roll Number, Class & Section are required.'
    });
  }
  await Student.create({
    name, rollNumber, className, section,
    email: req.body.email,
    phone: req.body.phone,
    dob: req.body.dob,
    admissionDate: req.body.admissionDate,
    gender: req.body.gender,
    address: req.body.address,
    guardian: {
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      contact:    req.body.guardianContact
    }
  });
  res.redirect('/admin/students');
});

// View students in a specific section
router.get('/admin/sections/:sectionId/students', ensureAdmin, async (req, res) => {
  const section  = await Section.findById(req.params.sectionId);
  const students = await Student.find({ section: req.params.sectionId });
  res.render('admin/studentList', { user: req.user, section, students });
});

// View single student
router.get('/admin/students/view/:id', ensureAdmin, async (req, res) => {
  const student = await Student.findById(req.params.id);
  res.render('admin/viewStudentAdmin', { user: req.user, student });
});

// Edit student form
router.get('/admin/students/edit/:id', ensureAdmin, async (req, res) => {
  const student = await Student.findById(req.params.id);
  const classes = await Class.find();
  res.render('admin/editStudent', { user: req.user, student, classes, error: null });
});

// Handle student update
router.post('/admin/students/edit/:id', ensureAdmin, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      rollNumber: req.body.rollNumber,
      className: req.body.className,
      email: req.body.email,
      phone: req.body.phone,
      dob: req.body.dob,
      admissionDate: req.body.admissionDate,
      gender: req.body.gender,
      address: req.body.address,
      section: req.body.section,
      guardian: {
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        contact: req.body.guardianContact
      }
    });
    res.redirect('/admin/students');
  } catch {
    const student = await Student.findById(req.params.id);
    const classes = await Class.find();
    res.render('admin/editStudent', {
      user: req.user,
      student,
      classes,
      error: 'Update failed, please try again'
    });
  }
});

// Delete student
router.post('/admin/students/delete/:id', ensureAdmin, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect('/admin/students');
});
// … above your CLASS ROUTES …

// Show standalone Add Class page
router.get('/admin/classes/add', ensureAdmin, (req, res) => {
  res.render('admin/addClass', {
    user: req.user,
    error: null,
    form: {}
  });
});

// Create class (already exists – just ensure your form posts here)
router.post('/admin/classes/create', ensureAdmin, async (req, res) => {
  try {
    await Class.create({ name: req.body.name });
    res.redirect('/admin/classes');
  } catch (err) {
    // In case of error, re-render the form with an error message
    res.render('admin/addClass', {
      user: req.user,
      error: 'Could not create class, please try again.',
      form: req.body
    });
  }
});

module.exports = router;
