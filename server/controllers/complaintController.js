import * as complaintService from '../services/complaintService.js';
import * as aiService from '../services/aiService.js';
import Complaint from '../models/Complaint.js';

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, department, location, attachments } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required',
      });
    }

    // Try to get AI analysis
    let aiAnalysis = {};
    try {
      aiAnalysis = await aiService.analyzeComplaint(title, description);
    } catch (error) {
      console.log('AI analysis failed, continuing without it:', error.message);
    }

    const complaintData = {
      title,
      description,
      category,
      priority,
      department: department || null,
      location: location || null,
      attachments: attachments || [],
    };

    const complaint = await complaintService.createComplaint(
      complaintData,
      req.user._id,
      req.user.name,
      req.user.email
    );

    // Add AI analysis if available
    if (Object.keys(aiAnalysis).length > 0) {
      complaint.aiAnalysis = aiAnalysis;
      await complaint.save();
    }

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      department: req.query.department,
      priority: req.query.priority,
      status: req.query.status,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await complaintService.getComplaints(filters);

    res.status(200).json({
      success: true,
      data: result.complaints,
      pagination: {
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const filters = {
      student: req.user._id,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    };

    const result = await complaintService.getComplaints(filters);

    res.status(200).json({
      success: true,
      data: result.complaints,
      pagination: {
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id);

    // Check authorization - student can only see their own complaints
    if (
      req.user.role === 'student' &&
      complaint.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint',
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(error.message === 'Complaint not found' ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markComplaintAsViewed = async (req, res) => {
  try {
    const complaint = await complaintService.markComplaintAsViewed(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(error.message === 'Complaint not found' ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, remark } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const complaint = await complaintService.updateComplaintStatus(
      req.params.id,
      status,
      req.user._id,
      remark
    );

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const addRemark = async (req, res) => {
  try {
    const { remark } = req.body;

    if (!remark) {
      return res.status(400).json({
        success: false,
        message: 'Remark is required',
      });
    }

    const complaint = await complaintService.addAdminRemark(
      req.params.id,
      remark,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(error.message === 'Complaint not found' ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required',
      });
    }

    const complaint = await complaintService.assignDepartment(
      req.params.id,
      departmentId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required',
      });
    }

    const complaint = await complaintService.updatePriority(req.params.id, priority);

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(error.message === 'Complaint not found' ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { resolutionText } = req.body;

    if (!resolutionText) {
      return res.status(400).json({
        success: false,
        message: 'Resolution text is required',
      });
    }

    const complaint = await complaintService.resolveComplaint(
      req.params.id,
      resolutionText,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(error.message === 'Complaint not found' ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const trackPublicComplaint = async (req, res) => {
  try {
    const rawId = req.params.id?.trim();
    if (!rawId) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID is required',
      });
    }

    // Try finding by complaintId (case-insensitive) or by _id if valid mongo ObjectId
    const query = {
      $or: [
        { complaintId: { $regex: new RegExp(`^${rawId}$`, 'i') } },
      ],
    };

    if (rawId.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: rawId });
    }

    const complaint = await Complaint.findOne(query).populate('department', 'name code');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint with tracking ID "${rawId}" was not found.`,
      });
    }

    // Sanitize output for public viewing (exclude student sensitive PII)
    const trackingData = {
      _id: complaint._id,
      complaintId: complaint.complaintId || rawId,
      title: complaint.title,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      department: complaint.department ? { name: complaint.department.name, code: complaint.department.code } : null,
      location: complaint.location,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      resolvedAt: complaint.resolvedAt,
      statusHistory: complaint.statusHistory || [],
      adminRemarks: (complaint.adminRemarks || []).map((r) => ({
        remark: r.remark,
        addedAt: r.addedAt,
      })),
      resolution: complaint.resolution?.resolutionText ? {
        resolutionText: complaint.resolution.resolutionText,
        resolvedAt: complaint.resolution.resolvedAt,
      } : null,
      aiAnalysis: complaint.aiAnalysis ? {
        category: complaint.aiAnalysis.category,
        priority: complaint.aiAnalysis.priority,
        summary: complaint.aiAnalysis.summary,
        recommendedDepartment: complaint.aiAnalysis.recommendedDepartment,
      } : null,
    };

    res.status(200).json({
      success: true,
      data: trackingData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error tracking complaint',
    });
  }
};
