import express from 'express';
import * as complaintController from '../controllers/complaintController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public tracking route (no auth required)
router.get('/track/:id', complaintController.trackPublicComplaint);

// Student routes
router.post('/', authenticate, complaintController.createComplaint);
router.get('/my', authenticate, complaintController.getMyComplaints);

// Admin routes
router.get('/', authenticate, authorize('admin'), complaintController.getComplaints);
router.get('/:id', authenticate, complaintController.getComplaintById);
router.put('/:id/view', authenticate, authorize('admin'), complaintController.markComplaintAsViewed);
router.put('/:id/status', authenticate, authorize('admin'), complaintController.updateComplaintStatus);
router.post('/:id/remark', authenticate, authorize('admin'), complaintController.addRemark);
router.put('/:id/assign', authenticate, authorize('admin'), complaintController.assignDepartment);
router.put('/:id/priority', authenticate, authorize('admin'), complaintController.updatePriority);
router.put('/:id/resolve', authenticate, authorize('admin'), complaintController.resolveComplaint);

export default router;
