const Class = require('../models/class');
const Section = require('../models/section');
const Student = require('../models/student');

exports.listClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort('name');
    
    // Count students and sections per class
    const studentCounts = await Student.aggregate([
      { $group: { _id: '$className', count: { $sum: 1 } } }
    ]);
    const sectionCounts = await Section.aggregate([
      { $group: { _id: '$className', count: { $sum: 1 } } }
    ]);

    const studentMap = {};
    studentCounts.forEach(c => studentMap[c._id] = c.count);
    const sectionMap = {};
    sectionCounts.forEach(c => sectionMap[c._id] = c.count);

    const classesWithCounts = classes.map((c, idx) => ({
      index: idx + 1,
      _id: c._id,
      name: c.name,
      studentCount: studentMap[c.name] || 0,
      sectionCount: sectionMap[c.name] || 0
    }));

    res.render('classes', {
      classes: classesWithCounts,
      message: req.query.message || null,
      error: req.query.error || null
    });
  } catch (e) {
    res.render('classes', { classes: [], message: null, error: 'Failed to load classes' });
  }
};

exports.addClass = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.redirect('/classes?error=' + encodeURIComponent('Class name required'));
  try {
    await Class.create({ name });
    res.redirect('/classes?message=' + encodeURIComponent('Class created successfully'));
  } catch (e) {
    let msg = e.code === 11000 ? 'Class already exists' : e.message;
    res.redirect('/classes?error=' + encodeURIComponent(msg));
  }
};

exports.editClassForm = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) throw new Error('Class not found');
    res.render('editClass', { cls, error: null });
  } catch {
    res.redirect('/classes?error=' + encodeURIComponent('Class not found'));
  }
};

exports.updateClass = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.render('editClass', { cls: { _id: req.params.id, name: '' }, error: 'Name is required' });
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) throw new Error('Class not found');

    const oldName = cls.name;
    cls.name = name;
    await cls.save();

    // Update all sections and students referencing the old class name
    await Section.updateMany({ className: oldName }, { className: name });
    await Student.updateMany({ className: oldName }, { className: name });

    res.redirect('/classes?message=' + encodeURIComponent('Class updated successfully'));
  } catch (e) {
    let msg = e.code === 11000 ? 'Class already exists' : e.message;
    res.render('editClass', { cls: { _id: req.params.id, name }, error: msg });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (cls) {
      await Section.deleteMany({ className: cls.name });
      await Student.deleteMany({ className: cls.name });
    }
    res.redirect('/classes?message=' + encodeURIComponent('Class and related data deleted'));
  } catch {
    res.redirect('/classes?error=' + encodeURIComponent('Failed to delete class'));
  }
};
