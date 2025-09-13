import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, getMe);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password', validateResetPassword, resetPassword);

export default router;