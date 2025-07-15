// app.js
const express   = require('express');
const mongoose  = require('mongoose');
const path      = require('path');

const classRoutes   = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/schoolDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(()=> console.log('✅ MongoDB connected'))
.catch(err=> console.error('❌ MongoDB error:', err));

// Express setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.render('home'));
app.use('/classes', classRoutes);
app.use('/students', studentRoutes);

// 404 handler
app.use((req, res) => res.status(404).render('404'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🚀 Server running at http://localhost:${PORT}`));
