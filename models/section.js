// models/section.js
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  className: { type: String, required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);
