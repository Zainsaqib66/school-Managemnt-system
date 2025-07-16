// scripts/migrate-className-to-classId.js
const mongoose = require('mongoose');
const Class   = require('../models/Class');
const Student = require('../models/Student');

async function run() {
  await mongoose.connect('mongodb://localhost/your-db');

  const students = await Student.find({});
  for (let s of students) {
    if (!s.class && s.className) {
      // find the Class whose name matches:
      const cls = await Class.findOne({ name: s.className });
      if (cls) {
        s.class = cls._id;
        await s.save();
        console.log(`Migrated "${s.name}" → class ${cls.name}`);
      } else {
        console.warn(`No Class found named "${s.className}" for student ${s._id}`);
      }
    }
  }

  mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
