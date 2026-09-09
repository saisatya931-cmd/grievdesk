import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
    sparse: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  isAnonymized: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: [true, 'Please provide a complaint title'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Please provide a detailed description'],
    minlength: 10,
    maxlength: 5000,
  },
  category: {
    type: String,
    enum: [
      'Academic',
      'Examination',
      'Faculty',
      'Hostel',
      'Canteen',
      'Transport',
      'Library',
      'Infrastructure',
      'Laboratory',
      'Fees',
      'Scholarship',
      'IT/Technical',
      'Administration',
      'Other',
    ],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null,
  },
  location: {
    type: String,
    trim: true,
    default: null,
  },
  status: {
    type: String,
    enum: ['Submitted', 'Viewed', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    default: 'Submitted',
  },
  isViewedByAdmin: {
    type: Boolean,
    default: false,
  },
  viewedAt: {
    type: Date,
    default: null,
  },
  viewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  attachments: [
    {
      filename: String,
      originalName: String,
      size: Number,
      mimeType: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  aiAnalysis: {
    category: String,
    priority: String,
    summary: String,
    recommendedDepartment: String,
  },
  adminRemarks: [
    {
      remark: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  resolution: {
    resolutionText: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
  },
  statusHistory: [
    {
      status: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      remark: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
});

// Generate complaint ID before saving
complaintSchema.pre('save', async function (next) {
  if (this.isNew && !this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `COMP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Complaint', complaintSchema);
