const express = require('express');
const router = express.Router();
const Section = require('../models/section');
const Student = require('../models/student');
const { ensureAuth } = require('../middleware/auth');

// List sections in a class
router.get('/:className/sections', ensureAuth, async (req, res) => {
  try {
    const className = req.params.className;
    const sections = await Section.find({ className }).sort('name');
    const data = await Promise.all(sections.map(async (sec, idx) => {
      const studentCount = await Student.countDocuments({ className, section: sec.name });
      return {
        _id: sec._id,
        index: idx + 1,
        name: sec.name,
        studentCount
      };
    }));
    res.render('sections', { className, sections: data, error: null, message: req.flash('success') });
  } catch (e) {
    res.render('sections', { className: req.params.className, sections: [], error: e.message });
  }
});

// Add Section POST
router.post('/:className/sections/add', ensureAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const className = req.params.className;
    if (!name) throw new Error('Section name is required');
    const exists = await Section.findOne({ name, className });
    if (exists) throw new Error('Section already exists in this class');

    await Section.create({ name, className });
    req.flash('success', 'Section added successfully.');
    res.redirect(`/classes/${encodeURIComponent(className)}/sections`);
  } catch (e) {
    req.flash('error', e.message);
    res.redirect(`/classes/${encodeURIComponent(req.params.className)}/sections`);
  }
});

// Edit Section POST
router.post('/:className/sections/edit/:id', ensureAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const { className, id } = req.params;
    if (!name) throw new Error('Section name is required');
    const exists = await Section.findOne({ name, className, _id: { $ne: id } });
    if (exists) throw new Error('Section name already taken in this class');

    await Section.findByIdAndUpdate(id, { name });
    req.flash('success', 'Section updated successfully.');
    res.redirect(`/classes/${encodeURIComponent(className)}/sections`);
  } catch (e) {
    req.flash('error', e.message);
    res.redirect(`/classes/${encodeURIComponent(req.params.className)}/sections`);
  }
});

// Delete Section POST
router.post('/:className/sections/delete/:id', ensureAuth, async (req, res) => {
  try {
    const { className, id } = req.params;
    await Section.findByIdAndDelete(id);
    // Optional: Delete students in this section?
    await Student.deleteMany({ className, section: (await Section.findById(id))?.name });
    req.flash('success', 'Section deleted successfully.');
  } catch (e) {
    req.flash('error', e.message);
  }
  res.redirect(`/classes/${encodeURIComponent(req.params.className)}/sections`);
});

module.exports = router;
