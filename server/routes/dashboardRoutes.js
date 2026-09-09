import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/student', authenticate, dashboardController.getStudentDashboard);
router.get('/admin', authenticate, authorize('admin'), dashboardController.getAdminDashboard);
router.get('/analytics', authenticate, authorize('admin'), dashboardController.getAnalytics);

export default router;
