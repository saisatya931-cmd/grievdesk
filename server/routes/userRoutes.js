import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);
router.delete('/account', authenticate, userController.deleteAccount);

// Admin only student management
router.get('/students', authenticate, authorize('admin'), userController.getStudents);
router.get('/students/:id', authenticate, authorize('admin'), userController.getStudentDetails);
router.put('/students/:id/status', authenticate, authorize('admin'), userController.updateStudentStatusByAdmin);
router.delete('/students/:id', authenticate, authorize('admin'), userController.deleteStudentAccountByAdmin);

// General Admin user endpoints
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.put('/:id/status', authenticate, authorize('admin'), userController.updateUserStatus);

export default router;
