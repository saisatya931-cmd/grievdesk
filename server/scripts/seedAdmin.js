import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@grievdesk.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
    });

    console.log('✅ Admin user created successfully');
    console.log(`Email: ${admin.email}`);
    console.log('Please change the password after first login');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
