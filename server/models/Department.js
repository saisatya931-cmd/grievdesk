import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide department name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: null,
  },
  head: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Department', departmentSchema);
