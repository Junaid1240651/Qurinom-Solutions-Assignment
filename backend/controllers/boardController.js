import { validationResult } from 'express-validator';
import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError, sendValidationError, sendNotFoundError, sendForbiddenError } from '../utils/response.js';

// Helper function to check board access
const checkBoardAccess = (board, userId) => {
  // Handle both populated and non-populated owner field
  const ownerId = board.owner._id ? board.owner._id.toString() : board.owner.toString();

  const isOwner = ownerId === userId.toString();
  const isMember = board.members.some(member => {
    const memberId = member.user._id ? member.user._id.toString() : member.user.toString();
    return memberId === userId.toString();
  });

  return isOwner || isMember;
};

// Helper function to check admin access
const checkAdminAccess = (board, userId) => {
  const ownerId = board.owner._id ? board.owner._id.toString() : board.owner.toString();
  const isOwner = ownerId === userId.toString();
  const member = board.members.find(m => {
    const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString();
  });
  const isAdmin = member && member.role === 'admin';
  return isOwner || isAdmin;
};

const getAllBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({
    $or: [
      { owner: req.user.id },
      { 'members.user': req.user.id }
    ]
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('lists')
    .sort({ updatedAt: -1 });

  return sendSuccess(res, 200, 'Boards retrieved successfully', { boards });
});

const getBoardById = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate({
      path: 'lists',
      options: { sort: { position: 1 } },
      populate: {
        path: 'cards',
        options: { sort: { position: 1 } },
        populate: [
          { path: 'members', select: 'name email avatar' },
          { path: 'comments', populate: { path: 'author', select: 'name email avatar' } }
        ]
      }
    });

  if (!board) {
    return sendNotFoundError(res, 'Board not found');
  }

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  return sendSuccess(res, 200, 'Board retrieved successfully', { board });
});

const createBoard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { title, description, background } = req.body;

  const board = await Board.create({
    title,
    description,
    background: background || '#0079bf',
    owner: req.user.id,
    members: [{
      user: req.user.id,
      role: 'admin'
    }]
  });

  await board.populate('owner', 'name email avatar');
  await board.populate('members.user', 'name email avatar');

  return sendSuccess(res, 201, 'Board created successfully', { board });
});

const updateBoard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const board = await Board.findById(req.params.id);

  if (!board) {
    return sendNotFoundError(res, 'Board not found');
  }

  // Check if user is owner or admin
  if (!checkAdminAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  const updatedBoard = await Board.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  return sendSuccess(res, 200, 'Board updated successfully', { board: updatedBoard });
});

const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    return sendNotFoundError(res, 'Board not found');
  }

  // Only owner can delete board
  if (board.owner.toString() !== req.user.id) {
    return sendForbiddenError(res, 'Only board owner can delete board');
  }

  // Delete all lists and cards in the board
  await List.deleteMany({ board: req.params.id });
  await Card.deleteMany({ board: req.params.id });

  await Board.findByIdAndDelete(req.params.id);

  return sendSuccess(res, 200, 'Board deleted successfully');
});

const addMemberToBoard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const board = await Board.findById(req.params.id);

  if (!board) {
    return sendNotFoundError(res, 'Board not found');
  }

  // Check if user is owner or admin
  if (!checkAdminAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  const { email, role = 'editor' } = req.body;

  // Find user by email
  const userToAdd = await User.findOne({ email });

  if (!userToAdd) {
    return sendNotFoundError(res, 'User not found');
  }

  // Check if user is already a member
  const existingMember = board.members.find(m => m.user.toString() === userToAdd._id.toString());
  if (existingMember) {
    return sendError(res, 400, 'User is already a member of this board');
  }

  board.members.push({
    user: userToAdd._id,
    role
  });

  await board.save();
  await board.populate('members.user', 'name email avatar');

  return sendSuccess(res, 200, 'Member added to board successfully', { board });
});

const removeMemberFromBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    return sendNotFoundError(res, 'Board not found');
  }

  // Check if user is owner or admin
  if (!checkAdminAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Cannot remove owner
  if (req.params.memberId === board.owner.toString()) {
    return sendError(res, 400, 'Cannot remove board owner');
  }

  board.members = board.members.filter(m => m.user.toString() !== req.params.memberId);
  await board.save();

  return sendSuccess(res, 200, 'Member removed from board successfully', { board });
});

export {
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addMemberToBoard,
  removeMemberFromBoard
};