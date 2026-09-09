import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait a moment and try again.',
  },
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getProfile);

export default router;
