const Section = require('../models/section');
const Student = require('../models/student');

exports.listSections = async (req, res) => {
  try {
    const { className } = req.params;
    const sections = await Section.find({ className }).sort('name');

    // count students per section
    const counts = await Student.aggregate([
      { $match: { className } },
      { $group: { _id: '$section', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => countMap[c._id] = c.count);

    const withCounts = sections.map((s, i) => ({
      index: i + 1,
      _id: s._id,
      name: s.name,
      studentCount: countMap[s.name] || 0
    }));

    res.render('sections', {
      className,
      sections: withCounts,
      message: req.query.message || null,
      error: req.query.error || null
    });
  } catch {
    res.render('sections', { className: req.params.className, sections: [], message: null, error: 'Failed to load sections' });
  }
};

exports.addSection = async (req, res) => {
  const { className } = req.params;
  const { name } = req.body;
  if (!name) return res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=${encodeURIComponent('Name required')}`);
  try {
    await Section.create({ name, className });
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?message=${encodeURIComponent('Section added')}`);
  } catch (e) {
    const msg = e.code === 11000 ? 'Section already exists in this class' : e.message;
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=${encodeURIComponent(msg)}`);
  }
};

exports.editSection = async (req, res) => {
  const { className, id } = req.params;
  const { name } = req.body;
  if (!name) return res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=${encodeURIComponent('Name required')}`);
  try {
    const section = await Section.findById(id);
    if (!section) throw new Error('Section not found');
    const oldName = section.name;
    section.name = name;
    await section.save();

    // Update students referencing old section
    await Student.updateMany({ className, section: oldName }, { section: name });

    res.redirect(`/classes/${encodeURIComponent(className)}/sections?message=${encodeURIComponent('Section updated')}`);
  } catch {
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=${encodeURIComponent('Failed to update section')}`);
  }
};

exports.deleteSection = async (req, res) => {
  const { className, id } = req.params;
  try {
    await Section.findByIdAndDelete(id);
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?message=${encodeURIComponent('Section deleted')}`);
  } catch {
    res.redirect(`/classes/${encodeURIComponent(className)}/sections?error=${encodeURIComponent('Failed to delete section')}`);
  }
};

exports.getSectionsJson = async (req, res) => {
  try {
    const { className } = req.params;
    const sections = await Section.find({ className }).sort('name').select('name -_id');
    res.json(sections.map(s => s.name));
  } catch {
    res.status(500).json([]);
  }
};
