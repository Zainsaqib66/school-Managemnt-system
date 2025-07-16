const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  rollNumber:  { type: Number, required: true, unique: true },
  className:   { type: String, required: true },      // renamed from `class`
  dob:         { type: Date },
  gender:      { type: String, enum: ['M','F','Other'] },
  address:     { type: String },
  phone:       { type: String },
  email:       { type: String, match: /.+\@.+\..+/ },
  guardian: {
    fatherName:{ type: String },
    motherName:{ type: String },
    contact:   { type: String }
  },
  admissionDate:{ type: Date, default: Date.now },
  section:     { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);