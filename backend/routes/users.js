import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  searchUsers,
  getUserById,
  updateUserProfile
} from '../controllers/userController.js';
import {
  updateUserProfileValidation
} from '../utils/validation.js';

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by email
// @access  Private
router.get('/search', auth, searchUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, getUserById);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateUserProfileValidation, updateUserProfile);


export default router;
