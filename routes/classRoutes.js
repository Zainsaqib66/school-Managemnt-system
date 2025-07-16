// routes/classRoutes.js
const express = require('express');
const router  = express.Router();
const Class   = require('../models/class');
const Section = require('../models/section');
const Student = require('../models/student');

// Helper: count students per class
async function getStudentCounts() {
  const agg = await Student.aggregate([
    { $group: { _id: '$className', count: { $sum: 1 } } }
  ]);
  return agg.reduce((map, o) => {
    map[o._id] = o.count;
    return map;
  }, {});
}

// Helper: count sections per class
async function getSectionCounts() {
  const agg = await Section.aggregate([
    { $group: { _id: '$className', count: { $sum: 1 } } }
  ]);
  return agg.reduce((map, o) => {
    map[o._id] = o.count;
    return map;
  }, {});
}

// LIST all classes
router.get('/', async (req, res) => {
  try {
    const classList     = await Class.find().sort('name');
    const studentCounts = await getStudentCounts();
    const sectionCounts = await getSectionCounts();

    const classes = classList.map((c, i) => ({
      index: i + 1,
      _id: c._id,
      name: c.name,
      studentCount: studentCounts[c.name] || 0,
      sectionCount: sectionCounts[c.name] || 0
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
      error:   'Unable to fetch classes'
    });
  }
});

// CREATE new class
router.post('/add', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.redirect('/classes?error=' + encodeURIComponent('Name required'));
  }
  try {
    await Class.create({ name });
    res.redirect('/classes?message=' + encodeURIComponent('Class created'));
  } catch (err) {
    console.error(err);
    const msg = err.code === 11000 ? 'Class already exists' : err.message;
    res.redirect('/classes?error=' + encodeURIComponent(msg));
  }
});

// VIEW a class → redirect to sections
router.get('/:className', (req, res) => {
  const cn = encodeURIComponent(req.params.className);
  res.redirect(`/classes/${cn}/sections`);
});

// SHOW edit‐class form
router.get('/edit/:id', async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) throw new Error('Not found');
    res.render('editClass', { error: null, cls });
  } catch (err) {
    console.error(err);
    res.redirect('/classes?error=' + encodeURIComponent('Class not found'));
  }
});

// UPDATE class name (and relink all Sections & Students)
router.post('/edit/:id', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.render('editClass', {
      error: 'Name is required',
      cls: { _id: req.params.id, name: '' }
    });
  }

  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) throw new Error('Not found');

    const oldName = cls.name;
    cls.name = name;
    await cls.save();

    // update all Sections & Students that referenced the old className
    await Section.updateMany(
      { className: oldName },
      { className: name }
    );
    await Student.updateMany(
      { className: oldName },
      { className: name }
    );

    res.redirect('/classes?message=' + encodeURIComponent('Class updated'));
  } catch (err) {
    console.error(err);
    const msg = err.code === 11000 ? 'Class already exists' : err.message;
    res.render('editClass', {
      error: msg,
      cls: { _id: req.params.id, name }
    });
  }
});

// DELETE class + its students & sections
router.post('/delete/:id', async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (cls) {
      await Student.deleteMany({ className: cls.name });
      await Section.deleteMany({ className: cls.name });
    }
    res.redirect('/classes?message=' + encodeURIComponent('Class and associated data deleted'));
  } catch (err) {
    console.error(err);
    res.redirect('/classes?error=' + encodeURIComponent('Failed to delete class'));
  }
});

module.exports = router;
