const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const User = require('./models/user');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/schoolDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const batch = [
    {
      name: 'Admin User',
      email: 'admin@school.com',
      username: 'admin',
      role: 'admin',
      password: 'Admin@1234'
    },
    {
      name: 'Principal User',
      email: 'principal@school.com',
      username: 'principal',
      role: 'principal',
      password: 'Principal@1234'
    }
  ];

  for (let i = 1; i <= 10; i++) {
    const first = faker.name.firstName();
    const last = faker.name.lastName();
    batch.push({
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@school.com`,
      username: `${first.toLowerCase()}${i}`,
      role: 'teacher',
      password: faker.internet.password(8) + `T${i}!`
    });
  }

  for (let i = 1; i <= 30; i++) {
    const first = faker.name.firstName();
    const last = faker.name.lastName();
    batch.push({
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@school.com`,
      username: `${first.toLowerCase()}${i}`,
      role: 'student',
      password: faker.internet.password(8) + `S${i}!`
    });
  }

  for (const u of batch) {
    const hashed = await bcrypt.hash(u.password, 12);
    await User.create({
      name: u.name,
      email: u.email,
      username: u.username,
      password: hashed,
      role: u.role
    });
    console.log(`Created ${u.role}: ${u.email} / ${u.password}`);
  }

  await mongoose.disconnect();
  console.log('All users generated!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
