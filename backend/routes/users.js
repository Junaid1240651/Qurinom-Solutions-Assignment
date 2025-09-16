import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  searchUsers,
  getUserById,
  updateUserProfile,
  getUserStats,
  updateUserPreferences,
  deleteUserAccount
} from '../controllers/userController.js';
import {
  updateUserProfileValidation
} from '../utils/validation.js';

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by email
// @access  Private
router.get('/search', auth, searchUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, getUserStats);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, getUserById);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateUserProfileValidation, updateUserProfile);

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, updateUserPreferences);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, deleteUserAccount);

export default router;
