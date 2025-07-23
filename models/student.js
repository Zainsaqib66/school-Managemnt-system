const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  className: String,
  email: String,
  phone: String,
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }
});

module.exports = mongoose.model('Student', studentSchema);
