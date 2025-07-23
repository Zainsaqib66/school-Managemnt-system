const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/schooldb1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  username: String
});

// Password compare method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Middleware & View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) return done(null, false, { message: 'Email not found' });

    const match = await user.comparePassword(password);
    if (!match) return done(null, false, { message: 'Incorrect password' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Import route files
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');
const principalRoutes = require('./routes/principalRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const homeRoutes = require('./routes/homeRoutes');

// Use routes
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', studentRoutes);
app.use('/', classRoutes);
app.use('/', principalRoutes);
app.use('/', teacherRoutes);
app.use('/', homeRoutes);

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
