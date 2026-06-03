import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { 
  validateRegistration, 
  validateLogin, 
  validateVerification 
} from '../middlewares/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, AuthController.register);
router.post('/verify-email', validateVerification, AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.post('/login', validateLogin, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getMe);

export default router;