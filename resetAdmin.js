const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');

async function resetAdminPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/schooldb1', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const email = 'admin@example.com';
    const username = 'admin';
    const rawPassword = 'Admin#2025';
    const role = 'admin';

    // Hash the password
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    // Upsert admin user
    const adminUser = await User.findOneAndUpdate(
      { role: 'admin' },
      {
        name: 'Admin User',
        email: email,
        username: username,
        password: hashedPassword,
        role: role
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Admin user created/updated:
    Email: ${email}
    Username: ${username}
    Password: ${rawPassword}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error resetting admin password:', err);
  }
}

resetAdminPassword();
