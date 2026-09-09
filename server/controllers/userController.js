import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;

    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Permanently deletes the authenticated user's account.
 * Anonymizes submitted complaints to preserve institutional audit trails
 * while completely removing the user record, personal identifiers, and notifications.
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Please type DELETE to confirm permanent account deletion.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // 1. Anonymize all complaints submitted by this user to preserve institutional compliance & records
    await Complaint.updateMany(
      { student: userId },
      {
        $set: {
          studentName: 'Former Student (Account Deleted)',
          studentEmail: 'anonymized@grievdesk.internal',
          isAnonymized: true,
        },
      }
    );

    // 2. Clean up user notifications
    await Notification.deleteMany({ user: userId });

    // 3. Permanently remove the user document
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Your GrievDesk account has been permanently deleted.',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete account. Please try again.',
    });
  }
};

/**
 * [ADMIN ONLY] List all student accounts with search, status filters,
 * aggregated complaints count, and security/activity metrics.
 */
export const getStudents = async (req, res) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { role: 'student' };

    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        query.$or = [{ status: 'active' }, { status: { $exists: false }, isActive: true }];
      } else if (status === 'suspended') {
        query.$or = [{ status: 'suspended' }, { isActive: false }];
      } else {
        query.status = status;
      }
    }

    // Search filter (name, email, or studentId)
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { name: regex },
        { email: regex },
        { studentId: regex },
        { department: regex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const students = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await User.countDocuments(query);

    // Compute complaintsCount for each student
    const studentIds = students.map((s) => s._id);
    const complaintsCounts = await Complaint.aggregate([
      { $match: { student: { $in: studentIds } } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]);

    const countsMap = {};
    complaintsCounts.forEach((c) => {
      countsMap[c._id.toString()] = c.count;
    });

    const enrichedStudents = students.map((s) => ({
      ...s,
      status: s.status || (s.isActive ? 'active' : 'suspended'),
      complaintsCount: countsMap[s._id.toString()] || 0,
      failedLoginAttempts: s.failedLoginAttempts || 0,
    }));

    // Overview counters for admin dashboard stats
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({
      role: 'student',
      $or: [{ status: 'active' }, { status: { $exists: false }, isActive: true }],
    });
    const suspendedStudents = await User.countDocuments({
      role: 'student',
      $or: [{ status: 'suspended' }, { isActive: false }],
    });
    const flaggedStudents = await User.countDocuments({
      role: 'student',
      failedLoginAttempts: { $gte: 3 },
    });

    res.status(200).json({
      success: true,
      data: enrichedStudents,
      statistics: {
        total: totalStudents,
        active: activeStudents,
        suspended: suspendedStudents,
        flagged: flaggedStudents,
      },
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch student accounts.',
    });
  }
};

/**
 * [ADMIN ONLY] Retrieve detailed profile and full complaint history for a specific student.
 */
export const getStudentDetails = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' })
      .select('-password')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.',
      });
    }

    const complaints = await Complaint.find({ student: student._id })
      .select('complaintId title category priority status createdAt resolvedAt department isPublic')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        student: {
          ...student,
          status: student.status || (student.isActive ? 'active' : 'suspended'),
          complaintsCount: complaints.length,
          failedLoginAttempts: student.failedLoginAttempts || 0,
        },
        complaints,
      },
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve student details.',
    });
  }
};

/**
 * [ADMIN ONLY] Update a student account's status (active, suspended, pending).
 */
export const updateStudentStatusByAdmin = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, suspended, or pending.',
      });
    }

    const isActive = status === 'active';

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { status, isActive, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
      message: `Student account status updated to ${status}.`,
    });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update student status.',
    });
  }
};

/**
 * [ADMIN ONLY] Permanently delete a suspicious or unauthorized student account.
 * Properly anonymizes existing submitted complaints to preserve audit trails.
 */
export const deleteStudentAccountByAdmin = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.',
      });
    }

    // 1. Anonymize all complaints submitted by this student to retain institutional records
    await Complaint.updateMany(
      { student: studentId },
      {
        $set: {
          studentName: 'Former Student (Account Deleted by Administrator)',
          studentEmail: 'anonymized@grievdesk.internal',
          isAnonymized: true,
        },
      }
    );

    // 2. Delete student notifications
    await Notification.deleteMany({ user: studentId });

    // 3. Permanently remove the user document
    await User.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: `Student account (${student.email}) has been permanently deleted and complaint records anonymized.`,
    });
  } catch (error) {
    console.error('Error deleting student account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete student account.',
    });
  }
};
