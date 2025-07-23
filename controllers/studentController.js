const Student = require('../models/student');
const Class = require('../models/class');

exports.listStudents = async (req, res) => {
  try {
    const students = await Student.find().sort('rollNumber');
    res.render('studentList', { students, message: req.query.message || null, error: null });
  } catch {
    res.render('studentList', { students: [], message: null, error: 'Unable to fetch students.' });
  }
};

exports.showAddStudentForm = async (req, res) => {
  const classes = await Class.find().sort('name');
  res.render('addStudent', { error: null, student: {}, classes });
};

exports.createStudent = async (req, res) => {
  const {
    name, rollNumber, className, section, dob, gender,
    address, phone, email, fatherName, motherName, guardianContact, admissionDate
  } = req.body;

  const classes = await Class.find().sort('name');

  if (!name || !rollNumber || !className || !section) {
    return res.render('addStudent', {
      error: 'Name, Roll Number, Class & Section are required',
      student: req.body,
      classes
    });
  }
  if (!await Class.exists({ name: className })) {
    return res.render('addStudent', {
      error: 'Selected class does not exist',
      student: req.body,
      classes
    });
  }
  if (await Student.exists({ rollNumber })) {
    return res.render('addStudent', {
      error: 'Roll number already in use',
      student: req.body,
      classes
    });
  }

  try {
    await Student.create({
      name, rollNumber, className, section, dob, gender, address, phone, email,
      guardian: { fatherName, motherName, contact: guardianContact },
      admissionDate: admissionDate || Date.now()
    });
    res.redirect('/students?message=Student added');
  } catch {
    res.render('addStudent', { error: 'Unable to create student', student: req.body, classes });
  }
};

exports.showEditStudentForm = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const classes = await Class.find().sort('name');
    if (!student) return res.redirect('/students');
    res.render('editStudent', { error: null, student, classes });
  } catch {
    res.redirect('/students');
  }
};

exports.updateStudent = async (req, res) => {
  const {
    name, rollNumber, className, section, dob, gender,
    address, phone, email, fatherName, motherName, guardianContact, admissionDate
  } = req.body;
  const classes = await Class.find().sort('name');

  if (!name || !rollNumber || !className || !section) {
    return res.render('editStudent', {
      error: 'Name, Roll Number, Class & Section are required',
      student: { _id: req.params.id, ...req.body },
      classes
    });
  }
  if (!await Class.exists({ name: className })) {
    return res.render('editStudent', {
      error: 'Selected class does not exist',
      student: { _id: req.params.id, ...req.body },
      classes
    });
  }

  try {
    await Student.findByIdAndUpdate(req.params.id, {
      name, rollNumber, className, section, dob, gender,
      address, phone, email,
      guardian: { fatherName, motherName, contact: guardianContact },
      admissionDate
    }, { new: true, runValidators: true });
    res.redirect('/students?message=Student updated');
  } catch {
    res.render('editStudent', { error: 'Unable to update student', student: { _id: req.params.id, ...req.body }, classes });
  }
};

exports.viewStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.redirect('/students');
    res.render('viewStudent', { student });
  } catch {
    res.redirect('/students');
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/students?message=Student deleted');
  } catch {
    res.redirect('/students?error=Failed to delete student');
  }
};
