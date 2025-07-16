// routes/sectionRoutes.js
const express = require('express');
const router  = express.Router();
const Section = require('../models/section');
const Student = require('../models/student');

// JSON API: get list of section names for a given class
// GET /classes/api/:className
router.get('/api/:className', async (req, res) => {
  try {
    const { className } = req.params;
    const sections = await Section
      .find({ className })
      .sort('name')
      .select('name -_id');
    res.json(sections.map(s => s.name));
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// LIST all sections for a class, with student counts
// GET /classes/:className/sections
router.get('/:className/sections', async (req, res) => {
  const { className } = req.params;

  // fetch sections
  const sections = await Section.find({ className }).sort('name');

  // count students per section
  const counts = await Student.aggregate([
    { $match: { className } },
    { $group: { _id: '$section', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  counts.forEach(c => { countMap[c._id] = c.count; });

  // attach counts
  const withCounts = sections.map(s => ({
    _id: s._id,
    name: s.name,
    studentCount: countMap[s.name] || 0
  }));

  res.render('sections', {
    className,
    sections: withCounts,
    message: req.query.message || null,
    error:   req.query.error   || null
  });
});

// VIEW students in one section
router.get('/:className/sections/:sectionName', async (req, res) => {
  const { className, sectionName } = req.params;
  const students = await Student
    .find({ className, section: sectionName })
    .sort('rollNumber');
  res.render('sectionStudents', {
    className,
    sectionName,
    students
  });
});

// CREATE a section
router.post('/:className/sections/add', async (req, res) => {
  const { className } = req.params;
  const { name } = req.body;
  if (!name) return res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=Name+required`);
  try {
    await Section.create({ name, className });
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?message=Added`);
  } catch (err) {
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=${encodeURIComponent(err.message)}`);
  }
});

// EDIT a section
router.post('/:className/sections/edit/:id', async (req, res) => {
  const { className, id } = req.params;
  const { name } = req.body;
  if (!name) return res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=Name+required`);
  try {
    const sec = await Section.findById(id);
    sec.name = name;
    await sec.save();
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?message=Updated`);
  } catch {
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=Unable+to+update`);
  }
});

// DELETE a section
router.post('/:className/sections/delete/:id', async (req, res) => {
  const { className, id } = req.params;
  try {
    await Section.findByIdAndDelete(id);
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?message=Deleted`);
  } catch {
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=Unable+to+delete`);
  }
});

module.exports = router;
