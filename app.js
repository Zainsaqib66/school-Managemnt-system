const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const path       = require('path');

const classRoutes   = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const searchRoutes  = require('./routes/searchRoutes');

const app = express();

// MongoDB
mongoose.connect('mongodb://localhost:27017/schoolDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static & bodyParser
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => res.redirect('/home'));
app.get('/home', (req, res) => res.render('home'));
app.use('/classes', classRoutes);
app.use('/students', studentRoutes);
app.use('/search', searchRoutes);

// 404
app.use((req, res) => res.status(404).render('404'));

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
