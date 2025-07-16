// models/section.js
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  className: { type: String, required: true, index: true }
}, { timestamps: true });

// Prevent duplicate section names within the same class
sectionSchema.index(
  { className: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model('Section', sectionSchema);
