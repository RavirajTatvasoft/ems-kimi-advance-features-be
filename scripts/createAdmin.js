const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@eventify.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@eventify.com',
      password: 'admin123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@eventify.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdminUser();
