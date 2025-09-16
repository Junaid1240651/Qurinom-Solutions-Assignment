import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Board from '../models/Board.js';
import Card from '../models/Card.js';
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

const getUserStats = asyncHandler(async (req, res) => {
  // Get boards where user is owner or member
  const boards = await Board.find({
    $or: [
      { owner: req.user.id },
      { 'members.user': req.user.id }
    ]
  });

  const boardIds = boards.map(board => board._id);

  // Get cards assigned to user
  const assignedCards = await Card.find({
    members: req.user.id,
    board: { $in: boardIds }
  });

  // Get cards created by user (if we track creator)
  const createdCards = await Card.find({
    createdBy: req.user.id,
    board: { $in: boardIds }
  });

  // Calculate overdue cards
  const now = new Date();
  const overdueCards = assignedCards.filter(card =>
    card.dueDate && card.dueDate < now && !card.completed
  );

  const stats = {
    totalBoards: boards.length,
    ownedBoards: boards.filter(board => board.owner.toString() === req.user.id).length,
    memberBoards: boards.filter(board =>
      board.owner.toString() !== req.user.id &&
      board.members.some(member => member.user.toString() === req.user.id)
    ).length,
    assignedCards: assignedCards.length,
    createdCards: createdCards.length,
    overdueCards: overdueCards.length,
    completedCards: assignedCards.filter(card => card.completed).length
  };

  return sendSuccess(res, 200, 'User statistics retrieved successfully', { stats });
});

const updateUserPreferences = asyncHandler(async (req, res) => {
  const { theme, notifications, language, timezone } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return sendNotFoundError(res, 'User not found');
  }

  // Update preferences (assuming we have a preferences field in User model)
  const preferences = {
    ...(user.preferences || {}),
    ...(theme && { theme }),
    ...(notifications !== undefined && { notifications }),
    ...(language && { language }),
    ...(timezone && { timezone })
  };

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { preferences },
    { new: true, runValidators: true }
  ).select('-password');

  return sendSuccess(res, 200, 'Preferences updated successfully', {
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      preferences: updatedUser.preferences,
      createdAt: updatedUser.createdAt
    }
  });
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return sendNotFoundError(res, 'User not found');
  }
  await User.findByIdAndDelete(req.user.id);

  return sendSuccess(res, 200, 'Account deleted successfully');
});

export {
  searchUsers,
  getUserById,
  updateUserProfile,
  getUserStats,
  updateUserPreferences,
  deleteUserAccount
};