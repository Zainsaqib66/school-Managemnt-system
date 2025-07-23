const User = require('../models/user');
const Class = require('../models/class');

exports.listUsers = async (req, res) => {
  try {
    const filter = {};
    const q = (req.query.q || '').trim();
    const role = req.query.role;

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { username: regex }];
    }
    if (role && ['admin', 'principal', 'teacher', 'student'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter).sort('role name');
    res.render('admin/userList', {
      users,
      q,
      role,
      message: req.flash('success')[0],
      error: req.flash('error')[0]
    });
  } catch (e) {
    req.flash('error', 'Failed to fetch users');
    res.redirect('/admin/users');
  }
};

exports.showAddUserForm = async (req, res) => {
  try {
    const classes = await Class.find().sort('name');
    res.render('admin/addUser', {
      roles: ['admin', 'principal', 'teacher', 'student'],
      classes,
      form: {}
    });
  } catch {
    res.status(500).send('Server Error');
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, username, role, password, subject, className } = req.body;
    const u = new User({
      name,
      email,
      username,
      password,
      role,
      subject: role === 'teacher' ? subject : undefined,
      className: role === 'teacher' ? className : undefined
    });
    await u.save();
    req.flash('success', 'User created successfully');
    res.redirect('/admin/users');
  } catch (err) {
    const classes = await Class.find().sort('name');
    res.render('admin/addUser', {
      roles: ['admin', 'principal', 'teacher', 'student'],
      classes,
      error: err.code === 11000 ? 'Email or username already taken' : err.message,
      form: req.body
    });
  }
};

exports.showEditUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    const classes = await Class.find().sort('name');
    res.render('admin/editUser', {
      user,
      roles: ['admin', 'principal', 'teacher', 'student'],
      classes,
      error: null
    });
  } catch (e) {
    req.flash('error', 'Failed to load user');
    res.redirect('/admin/users');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, username, role, subject, className } = req.body;
    const update = {
      name,
      email,
      username,
      role,
      subject: role === 'teacher' ? subject : undefined,
      className: role === 'teacher' ? className : undefined
    };
    await User.findByIdAndUpdate(req.params.id, update, { runValidators: true });
    req.flash('success', 'User updated successfully');
    res.redirect('/admin/users');
  } catch (err) {
    const user = await User.findById(req.params.id);
    const classes = await Class.find().sort('name');
    res.render('admin/editUser', {
      user,
      roles: ['admin', 'principal', 'teacher', 'student'],
      classes,
      error: err.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    if (user.role === 'admin') {
      req.flash('error', 'Cannot delete admin user');
      return res.redirect('/admin/users');
    }
    await user.deleteOne();
    req.flash('success', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch {
    req.flash('error', 'Failed to delete user');
    res.redirect('/admin/users');
  }
};
