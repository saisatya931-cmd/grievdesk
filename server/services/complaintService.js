import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

export const createComplaint = async (complaintData, userId, userName, userEmail) => {
  const {
    title,
    description,
    category,
    priority = 'Medium',
    department,
    location,
    attachments,
  } = complaintData;

  const complaint = await Complaint.create({
    student: userId,
    studentName: userName,
    studentEmail: userEmail,
    title,
    description,
    category,
    priority,
    department: department || null,
    location: location || null,
    attachments: attachments || [],
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date(),
      },
    ],
  });

  // Create notification for student
  await Notification.create({
    user: userId,
    title: 'Complaint Submitted',
    message: 'Your complaint has been submitted successfully',
    type: 'success',
    relatedComplaint: complaint._id,
  });

  // Create notification for administrators
  try {
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Complaint Submitted',
        message: `New complaint "${title}" submitted by ${userName || 'a student'}`,
        type: 'info',
        relatedComplaint: complaint._id,
      });
    }
  } catch (adminNotifErr) {
    console.error('Failed to notify admins of new complaint:', adminNotifErr);
  }

  return complaint;
};

export const getComplaints = async (filters = {}) => {
  const query = {};

  if (filters.category) query.category = filters.category;
  if (filters.department) query.department = filters.department;
  if (filters.priority) query.priority = filters.priority;
  if (filters.status) query.status = filters.status;
  if (filters.student) query.student = filters.student;
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { complaintId: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const complaints = await Complaint.find(query)
    .populate('student', 'name email studentId phone department')
    .populate('department', 'name head')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Complaint.countDocuments(query);

  return {
    complaints,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
};

export const getComplaintById = async (complaintId) => {
  const complaint = await Complaint.findById(complaintId)
    .populate('student', 'name email studentId phone department')
    .populate('department', 'name head description')
    .populate('adminRemarks.addedBy', 'name email')
    .populate('statusHistory.changedBy', 'name email')
    .populate('resolution.resolvedBy', 'name email');

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  return complaint;
};

export const markComplaintAsViewed = async (complaintId, viewedBy) => {
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  if (!complaint.isViewedByAdmin) {
    complaint.isViewedByAdmin = true;
    complaint.viewedAt = new Date();
    complaint.viewedBy = viewedBy;

    if (complaint.status === 'Submitted') {
      complaint.status = 'Viewed';
    }

    complaint.statusHistory.push({
      status: 'Viewed by Administrator',
      changedBy: viewedBy,
      remark: 'Complaint opened and reviewed by administrator',
      timestamp: new Date(),
    });

    await complaint.save();

    // Create notification for student
    await Notification.create({
      user: complaint.student,
      title: 'Complaint Viewed',
      message: `🔔 Your complaint ${complaint.complaintId || ''} has been viewed by the administrator.`,
      type: 'info',
      relatedComplaint: complaint._id,
    });
  }

  return complaint;
};

export const updateComplaintStatus = async (complaintId, newStatus, updatedBy, remark) => {
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  const validTransitions = {
    'Submitted': ['Viewed', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    'Viewed': ['Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    'Under Review': ['Assigned', 'In Progress', 'Resolved', 'Closed'],
    'Assigned': ['In Progress', 'Resolved', 'Closed'],
    'In Progress': ['Resolved', 'Closed'],
    'Resolved': ['Closed', 'In Progress'],
    'Closed': ['In Progress'],
  };

  if (validTransitions[complaint.status] && !validTransitions[complaint.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${complaint.status} to ${newStatus}`);
  }

  complaint.status = newStatus;
  complaint.statusHistory.push({
    status: newStatus,
    changedBy: updatedBy,
    remark: remark || `Status changed to ${newStatus}`,
    timestamp: new Date(),
  });

  if (newStatus === 'Resolved') {
    complaint.resolvedAt = new Date();
  }

  await complaint.save();

  // Create notification
  await Notification.create({
    user: complaint.student,
    title: 'Complaint Status Updated',
    message: `Your complaint ${complaint.complaintId || ''} status has been updated to ${newStatus}`,
    type: 'info',
    relatedComplaint: complaint._id,
  });

  return complaint;
};

export const addAdminRemark = async (complaintId, remark, addedBy) => {
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  complaint.adminRemarks.push({
    remark,
    addedBy,
    addedAt: new Date(),
  });

  // Also log to status history timeline
  complaint.statusHistory.push({
    status: complaint.status,
    changedBy: addedBy,
    remark: `Admin Remark: ${remark}`,
    timestamp: new Date(),
  });

  await complaint.save();

  // Create notification
  await Notification.create({
    user: complaint.student,
    title: 'Admin Remark Added',
    message: `💬 An administrator added a remark on your complaint ${complaint.complaintId || ''}: "${remark}"`,
    type: 'info',
    relatedComplaint: complaint._id,
  });

  return complaint;
};

export const assignDepartment = async (complaintId, departmentId, assignedBy) => {
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  const department = await Department.findById(departmentId);
  if (!department) {
    throw new Error('Department not found');
  }

  complaint.department = departmentId;
  complaint.status = 'Assigned';
  complaint.statusHistory.push({
    status: 'Assigned',
    changedBy: assignedBy,
    remark: `Assigned to ${department.name}`,
    timestamp: new Date(),
  });

  await complaint.save();

  // Create notification
  await Notification.create({
    user: complaint.student,
    title: 'Complaint Assigned',
    message: `Your complaint has been assigned to ${department.name}`,
    type: 'info',
    relatedComplaint: complaint._id,
  });

  return complaint;
};

export const updatePriority = async (complaintId, newPriority) => {
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  complaint.priority = newPriority;
  await complaint.save();

  return complaint;
};

export const resolveComplaint = async (complaintId, resolutionText, resolvedBy) => {
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  complaint.status = 'Resolved';
  complaint.resolution = {
    resolutionText: resolutionText || 'Issue resolved by administration',
    resolvedBy,
    resolvedAt: new Date(),
  };
  complaint.resolvedAt = new Date();
  complaint.statusHistory.push({
    status: 'Resolved',
    changedBy: resolvedBy,
    remark: resolutionText ? `Resolution: ${resolutionText}` : 'Complaint marked as resolved',
    timestamp: new Date(),
  });

  await complaint.save();

  // Create notification
  await Notification.create({
    user: complaint.student,
    title: 'Complaint Resolved',
    message: `✅ Your complaint ${complaint.complaintId || ''} has been resolved.`,
    type: 'success',
    relatedComplaint: complaint._id,
  });

  return complaint;
};

export const addAttachment = async (complaintId, fileData) => {
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  complaint.attachments.push({
    filename: fileData.filename,
    originalName: fileData.originalName,
    size: fileData.size,
    mimeType: fileData.mimeType,
    uploadedAt: new Date(),
  });

  await complaint.save();

  return complaint;
};
