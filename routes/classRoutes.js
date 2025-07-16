// routes/classRoutes.js
const express = require('express');
const router  = express.Router();
const Class   = require('../models/class');
const Student = require('../models/student');
const Section = require('../models/section');

// LIST all classes with student & section counts
router.get('/', async (req, res) => {
  try {
    const classList = await Class.find().sort('name');

    // student counts
    const studentCounts = await Student.aggregate([
      { $group: { _id: '$className', count: { $sum: 1 } } }
    ]);
    const studentMap = {};
    studentCounts.forEach(i => { studentMap[i._id] = i.count; });

    // section counts
    const sectionCounts = await Section.aggregate([
      { $group: { _id: '$className', count: { $sum: 1 } } }
    ]);
    const sectionMap = {};
    sectionCounts.forEach(i => { sectionMap[i._id] = i.count; });

    // build array
    const classes = classList.map((c, idx) => ({
      index:        idx + 1,
      _id:          c._id,
      name:         c.name,
      studentCount: studentMap[c.name]  || 0,
      sectionCount: sectionMap[c.name]  || 0
    }));

    res.render('classes', {
      classes,
      message: req.query.message || null,
      error:   req.query.error   || null
    });
  } catch (err) {
    console.error(err);
    res.render('classes', {
      classes: [],
      message: null,
      error:   'Unable to load classes'
    });
  }
});

// CREATE new class
router.post('/add', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.redirect('/classes?error=Name+required');
  try {
    await Class.create({ name });
    res.redirect('/classes?message=Class+added');
  } catch (err) {
    res.redirect('/classes?error=' + encodeURIComponent(err.message));
  }
});

// EDIT class name
router.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.redirect('/classes?error=Name+required');
  try {
    const cls = await Class.findById(id);
    cls.name = name;
    await cls.save();
    res.redirect('/classes?message=Class+updated');
  } catch (err) {
    res.redirect('/classes?error=Unable+to+update+class');
  }
});

// REDIRECT class view to sections list
router.get('/:className', (req, res) => {
  const c = encodeURIComponent(req.params.className);
  res.redirect(`/classes/${c}/sections`);
});

// DELETE class + its students
router.post('/delete/:id', async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (cls) {
      await Student.deleteMany({ className: cls.name });
      await Section.deleteMany({ className: cls.name });
    }
    res.redirect('/classes?message=Class+deleted');
  } catch {
    res.redirect('/classes?error=Unable+to+delete+class');
  }
});

module.exports = router;
