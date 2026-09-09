import express from 'express';
import * as aiController from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', authenticate, aiController.analyzeComplaint);
router.post('/chat', authenticate, aiController.aiChat);

export default router;
