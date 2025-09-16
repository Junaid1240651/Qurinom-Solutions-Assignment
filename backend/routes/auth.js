import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateProfile
} from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation
} from '../utils/validation.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidation, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, loginUser);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, logoutUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfileValidation, updateProfile);

export default router;
