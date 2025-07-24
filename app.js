const express       = require('express');
const mongoose      = require('mongoose');
const session       = require('express-session');
const flash         = require('connect-flash');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcrypt');
const path          = require('path');

const app = express();

// ─── DATABASE ────────────────────────────────────────────────────────────────
mongoose.connect('mongodb://127.0.0.1/schooldb1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// ─── USER MODEL ──────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     String,
  email:    String,
  password: String,
  role:     String,
  username: String
});
userSchema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};
const User = mongoose.model('User', userSchema);

// ─── MIDDLEWARE SETUP ────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// ─── PASSPORT CONFIG ────────────────────────────────────────────────────────
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'Email not found' });
    const match = await user.comparePassword(password);
    if (!match) return done(null, false, { message: 'Incorrect password' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
// All your admin/class/section/student routes live here:
const adminRoutes = require('./routes/adminRoutes'); 
app.use('/', adminRoutes);

// ─── AUTH ROUTES ────────────────────────────────────────────────────────────
app.get('/',               (req, res) => res.redirect('/login'));
app.get('/login',          (req, res) => res.render('login', { error: req.flash('error') }));
app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash:   true
  }),
  (req, res) => {
    // Redirect based on role
    if (req.user.role === 'admin')     return res.redirect('/admin');
    if (req.user.role === 'principal') return res.redirect('/principal');
    res.redirect('/home');
  }
);
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/login'));
});

app.get('/home', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.send(`<h2>Welcome ${req.user.name} (${req.user.role})</h2><a href="/logout">Logout</a>`);
});
app.get('/principal', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'principal') return res.redirect('/login');
  res.send(`<h2>Principal Panel</h2><a href="/logout">Logout</a>`);
});

// ─── START SERVER ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
