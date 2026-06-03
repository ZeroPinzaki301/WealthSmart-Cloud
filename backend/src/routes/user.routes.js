import express from 'express';
import UserController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadProfilePicture, handleMulterError } from '../config/multer.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.put('/users/profile', UserController.updateProfile);
router.post('/users/profile/picture', uploadProfilePicture, handleMulterError, UserController.uploadProfilePicture);
router.delete('/users/profile/picture', UserController.deleteProfilePicture);
router.get('/users/:id', UserController.getUserById);

export default router;