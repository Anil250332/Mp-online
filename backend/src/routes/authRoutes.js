import express from 'express';
import {
  requestRegistrationOtp,
  verifyRegistration,
  login,
  logout,
  getMe
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Auth Endpoints
router.post('/register-otp', requestRegistrationOtp);
router.post('/verify-registration', verifyRegistration);
router.post('/login', login);

// Protected Auth Endpoints
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);

export default router;
