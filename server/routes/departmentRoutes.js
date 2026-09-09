import express from 'express';
import * as departmentController from '../controllers/departmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, departmentController.getDepartments);
router.post('/', authenticate, authorize('admin'), departmentController.createDepartment);
router.put('/:id', authenticate, authorize('admin'), departmentController.updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), departmentController.deleteDepartment);

export default router;
