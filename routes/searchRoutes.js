// routes/searchRoutes.js
const express = require('express');
const router  = express.Router();
const Student = require('../models/student');

// GET /search?q=...
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ students: [], classes: [] });

    // build regex for name & class
    const regex = new RegExp(q, 'i');
    const orClauses = [
      { name:      regex },
      { class:     regex }
    ];
    // if user typed only digits, also match rollNumber exactly
    if (/^\d+$/.test(q)) {
      orClauses.push({ rollNumber: Number(q) });
    }

    // find students (limit for performance)
    const students = await Student
      .find({ $or: orClauses })
      .limit(20)
      .select('name rollNumber class');

    // distinct class names that match
    const classes = await Student.distinct('class', { class: regex });

    res.json({ students, classes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ students: [], classes: [] });
  }
});

module.exports = router;
