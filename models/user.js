const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'principal', 'teacher', 'student'],
    default: 'student'
  }
}, { timestamps: true });

// Add password comparison method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// ✅ Prevent OverwriteModelError during hot reloads (important for Nodemon)
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
