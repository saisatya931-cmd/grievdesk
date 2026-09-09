import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

export const seedDemoUsers = async () => {
  try {
    // 1. Ensure Admin exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@grievdesk.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME || 'Administrator',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
      });
      console.log('✅ Demo Admin created:', admin.email);
    }

    // 2. Ensure Demo Student exists
    const studentEmail = 'student@gmail.com';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Demo Student',
        email: studentEmail,
        password: 'Password@123',
        role: 'student',
        studentId: 'STU-2026-001',
        department: 'Computer Science',
      });
      console.log('✅ Demo Student created:', student.email);
    } else {
      // Ensure role is student
      if (student.role !== 'student') {
        student.role = 'student';
        await student.save();
        console.log('✅ Updated role to student for:', student.email);
      }
    }

    return { admin, student };
  } catch (error) {
    console.error('❌ Error seeding demo users:', error.message);
  }
};

// If run directly from CLI
if (process.argv[1]?.includes('seedUsers')) {
  await connectDB();
  await seedDemoUsers();
  process.exit(0);
}
