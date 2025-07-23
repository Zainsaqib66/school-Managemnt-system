const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/schoolDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Delete existing admins
  await User.deleteMany({ role: 'admin' });
  console.log('Deleted all existing admin users.');

  // Create new admin
  const email = 'admin@example.com';
  const username = 'admin';
  const rawPassword = 'Admin#2025';
  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  await User.create({
    name: 'Admin User',
    email,
    username,
    password: hashedPassword,
    role: 'admin'
  });

  console.log(`Admin user created:
    Email: ${email}
    Username: ${username}
    Password: ${rawPassword}
  `);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
