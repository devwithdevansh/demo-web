const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/salon-dashboard";

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin already exists. Credentials: username: "admin", password: "password123" (if unchanged)');
      process.exit(0);
    }

    // Create admin
    const admin = new Admin({
      username: 'admin',
      password: 'password123'
    });

    await admin.save();
    console.log('Admin user successfully seeded!');
    console.log('Username: admin');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
