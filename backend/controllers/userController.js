import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError, sendValidationError, sendNotFoundError } from '../utils/response.js';

const searchUsers = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return sendError(res, 400, 'Email query parameter is required');
  }

  const users = await User.find({
    email: { $regex: email, $options: 'i' },
    _id: { $ne: req.user.id } // Exclude current user from search
  })
    .select('name email avatar')
    .limit(10); // Limit results to prevent large responses

  return sendSuccess(res, 200, 'Users search completed', { users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name email avatar createdAt');

  if (!user) {
    return sendNotFoundError(res, 'User not found');
  }

  return sendSuccess(res, 200, 'User retrieved successfully', { user });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { name, avatar } = req.body;

  // Check if user exists
  const user = await User.findById(req.user.id);
  if (!user) {
    return sendNotFoundError(res, 'User not found');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(name && { name }),
      ...(avatar && { avatar })
    },
    { new: true, runValidators: true }
  ).select('-password');

  return sendSuccess(res, 200, 'Profile updated successfully', {
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt
    }
  });
});


export {
  searchUsers,
  getUserById,
  updateUserProfile
};