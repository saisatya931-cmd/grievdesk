import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const registerUser = async (userData) => {
  const { name, email, password, role = 'student', studentId } = userData;

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    throw new Error('Email already exists');
  }

  // Create user
  user = await User.create({
    name,
    email,
    password,
    role,
    studentId,
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    },
    token,
  };
};

export const loginUser = async (email, password, expectedRole = null) => {
  // Validate
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    await user.save();
    throw new Error('Invalid credentials');
  }

  // Enforce account status check (suspension / deactivation)
  if (user.status === 'suspended' || user.isActive === false) {
    throw new Error('Your account has been suspended. Please contact the administrator.');
  }

  if (user.status === 'pending') {
    throw new Error('Your account is pending verification. Please contact the administrator.');
  }

  // Enforce expected role if specified
  if (expectedRole && user.role !== expectedRole) {
    if (expectedRole === 'admin') {
      throw new Error('Access denied: Administrative privileges required.');
    } else {
      throw new Error('These credentials cannot be used for the student portal.');
    }
  }

  // On successful authentication, reset failed attempts and log timestamp
  user.lastLogin = new Date();
  user.failedLoginAttempts = 0;
  await user.save();

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      status: user.status,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
    },
    token,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    status: user.status,
    lastLogin: user.lastLogin,
    failedLoginAttempts: user.failedLoginAttempts,
    createdAt: user.createdAt,
  };
};
