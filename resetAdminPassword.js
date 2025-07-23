const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const User     = require('./models/user');

async function resetAdminPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/schoolDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const rawEmail = 'admin@example.com';
    const rawUsername = 'adminuser';
    const rawPwd   = 'Admin#2025';
    const hash     = await bcrypt.hash(rawPwd, 12);

    // Upsert: update existing or create if missing
    await User.findOneAndUpdate(
      { role: 'admin' },
      {
        name:     'Admin User',
        email:    rawEmail,
        username: rawUsername,
        password: hash,
        role:     'admin'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Admin reset to: ${rawEmail} / ${rawUsername} / ${rawPwd}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error resetting admin password:', err);
  }
}

resetAdminPassword();
