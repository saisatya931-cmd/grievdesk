import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get complaint statistics
    const totalComplaints = await Complaint.countDocuments({ student: studentId });
    const submittedCount = await Complaint.countDocuments({
      student: studentId,
      status: 'Submitted',
    });
    const underReviewCount = await Complaint.countDocuments({
      student: studentId,
      status: 'Under Review',
    });
    const inProgressCount = await Complaint.countDocuments({
      student: studentId,
      status: 'In Progress',
    });
    const resolvedCount = await Complaint.countDocuments({
      student: studentId,
      status: 'Resolved',
    });
    const closedCount = await Complaint.countDocuments({
      student: studentId,
      status: 'Closed',
    });

    // Get recent complaints
    const recentComplaints = await Complaint.find({ student: studentId })
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalComplaints,
          submitted: submittedCount,
          underReview: underReviewCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          closed: closedCount,
        },
        recentComplaints,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    // Get complaint statistics
    const totalComplaints = await Complaint.countDocuments();
    const submittedCount = await Complaint.countDocuments({ status: 'Submitted' });
    const underReviewCount = await Complaint.countDocuments({
      status: 'Under Review',
    });
    const assignedCount = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgressCount = await Complaint.countDocuments({
      status: 'In Progress',
    });
    const resolvedCount = await Complaint.countDocuments({ status: 'Resolved' });
    const closedCount = await Complaint.countDocuments({ status: 'Closed' });

    // Get priority distribution
    const criticalCount = await Complaint.countDocuments({ priority: 'Critical' });
    const highCount = await Complaint.countDocuments({ priority: 'High' });
    const mediumCount = await Complaint.countDocuments({ priority: 'Medium' });
    const lowCount = await Complaint.countDocuments({ priority: 'Low' });

    // Get user statistics
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get recent complaints
    const recentComplaints = await Complaint.find()
      .populate('student', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalComplaints,
          submitted: submittedCount,
          underReview: underReviewCount,
          assigned: assignedCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          closed: closedCount,
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount,
          totalStudents,
          totalAdmins,
        },
        recentComplaints,
        complaintsByCategory,
        complaintsByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Get monthly complaint trends
    const monthlyTrends = await Complaint.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get resolution rate
    const totalComplaints = await Complaint.countDocuments(query);
    const resolvedComplaints = await Complaint.countDocuments({
      ...query,
      status: { $in: ['Resolved', 'Closed'] },
    });
    const resolutionRate =
      totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(2) : 0;

    // Get average resolution time
    const resolutionTimes = await Complaint.aggregate([
      { $match: { ...query, resolvedAt: { $ne: null } } },
      {
        $project: {
          resolutionTime: {
            $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
        },
      },
    ]);

    const avgResolutionTime =
      resolutionTimes.length > 0 ? resolutionTimes[0].avgResolutionTime.toFixed(2) : 0;

    const categoryDistribution = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const statusDistribution = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const priorityDistribution = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyTrends,
        resolutionRate,
        avgResolutionTime,
        totalComplaints,
        resolvedComplaints,
        categoryDistribution,
        statusDistribution,
        priorityDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
