const express = require('express');
const router = express.Router();

const Class = require('../models/class');
const Section = require('../models/section');
const Student = require('../models/student');

// Middleware to protect admin routes
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.redirect('/login');
}

// ======================
// 🏠 Admin Dashboard
// ======================
router.get('/admin', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { user: req.user });
});

// ======================
// 👥 Users Page
// ======================
router.get('/admin/users', ensureAdmin, (req, res) => {
  res.render('admin/userList', { user: req.user });
});

// =============================
// 🚀 CLASS ROUTES
// =============================
router.get('/admin/classes', ensureAdmin, async (req, res) => {
  const classes = await Class.find();
  res.render('admin/classList', { user: req.user, classes });
});

router.post('/admin/classes/create', ensureAdmin, async (req, res) => {
  await Class.create({ name: req.body.name });
  res.redirect('/admin/classes');
});

// =============================
// 📚 SECTION ROUTES
// =============================
router.get('/admin/classes/:classId/sections', ensureAdmin, async (req, res) => {
  const classItem = await Class.findById(req.params.classId);
  const sections = await Section.find({ classId: req.params.classId });
  res.render('admin/sectionList', { user: req.user, classItem, sections });
});

router.post('/admin/classes/:classId/sections/create', ensureAdmin, async (req, res) => {
  await Section.create({
    name: req.body.name,
    classId: req.params.classId
  });
  res.redirect(`/admin/classes/${req.params.classId}/sections`);
});

// =============================
// 👨‍🎓 STUDENT ROUTES
// =============================

// View all students
router.get('/admin/students', ensureAdmin, async (req, res) => {
  const students = await Student.find();
  res.render('admin/studentList', { user: req.user, students, section: null });
});

// View students by section
router.get('/admin/sections/:sectionId/students', ensureAdmin, async (req, res) => {
  const section = await Section.findById(req.params.sectionId);
  const students = await Student.find({ section: req.params.sectionId });
  res.render('admin/studentList', { user: req.user, section, students });
});

// Create new student
router.post('/admin/sections/:sectionId/students/create', ensureAdmin, async (req, res) => {
  await Student.create({
    name: req.body.name,
    rollNumber: req.body.rollNumber,
    className: req.body.className,
    email: req.body.email,
    phone: req.body.phone,
    dob: req.body.dob,
    admissionDate: req.body.admissionDate,
    gender: req.body.gender,
    address: req.body.address,
    section: req.params.sectionId,
    guardian: {
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      contact: req.body.guardianContact
    }
  });
  res.redirect(`/admin/sections/${req.params.sectionId}/students`);
});

// View single student
router.get('/admin/students/view/:id', ensureAdmin, async (req, res) => {
  const student = await Student.findById(req.params.id);
  res.render('admin/viewStudent', { user: req.user, student });
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
  } catch (err) {
    const student = await Student.findById(req.params.id);
    const classes = await Class.find();
    res.render('admin/editStudent', { user: req.user, student, classes, error: 'Update failed' });
  }
});

// Delete student
router.post('/admin/students/delete/:id', ensureAdmin, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect('/admin/students');
});

module.exports = router;
