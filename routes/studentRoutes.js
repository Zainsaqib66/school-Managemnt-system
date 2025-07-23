const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Student = require('../models/student');

// GET /students — list all students
router.get('/students', ensureAuthenticated, async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.render('admin/studentList', { students });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading students');
  }
});

module.exports = router;
