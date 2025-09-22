import { validationResult } from 'express-validator';
import List from '../models/List.js';
import Board from '../models/Board.js';
import Card from '../models/Card.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError, sendValidationError, sendNotFoundError, sendForbiddenError } from '../utils/response.js';

// Helper function to check board access
const checkBoardAccess = (board, userId) => {
  if (board.isPrivate === false) return true; // Team visibility
  return board.owner.toString() === userId || 
    board.members.some(member => member.user.toString() === userId);
};

// Helper function to get user role
const getUserRole = (board, userId) => {
  const ownerId = board.owner._id ? board.owner._id.toString() : board.owner.toString();
  const isOwner = ownerId === userId.toString();
  
  if (isOwner) return 'owner';
  
  const member = board.members.find(m => {
    const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString();
  });
  
  return member ? member.role : null;
};

// Helper function to check admin access (owner or admin)
const checkAdminAccess = (board, userId) => {
  const role = getUserRole(board, userId);
  return role === 'owner' || role === 'admin';
};

// Helper function to check content creation/editing access (owner, admin, or editor)
const checkContentAccess = (board, userId) => {
  if (board.isPrivate === false) return true; // Team boards allow edits
  const role = getUserRole(board, userId);
  return role === 'owner' || role === 'admin' || role === 'editor';
};

const getListsByBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.boardId);

  if (!board) {
    return sendNotFoundError(res, 'Board not found');
  }

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  const lists = await List.find({ board: req.params.boardId })
    .populate({
      path: 'cards',
      options: { sort: { position: 1 } },
      populate: [
        { path: 'members', select: 'name email avatar' },
        { path: 'comments', populate: { path: 'author', select: 'name email avatar' } }
      ]
    })
    .sort({ position: 1 });

  return sendSuccess(res, 200, 'Lists retrieved successfully', { lists });
});

const createList = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { title, board } = req.body;

  const boardDoc = await Board.findById(board);

  if (!boardDoc) {
    return sendNotFoundError(res, 'Board not found');
  }

  // Check if user has access to board
  if (!checkBoardAccess(boardDoc, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Check if user can create content (owner, admin, or editor)
  if (!checkContentAccess(boardDoc, req.user.id)) {
    return sendForbiddenError(res, 'Only board owners, admins, and editors can create lists');
  }

  // Get the highest position
  const lastList = await List.findOne({ board }).sort({ position: -1 });
  const position = lastList ? lastList.position + 1 : 0;

  const list = await List.create({
    title,
    board,
    position
  });

  // Add list to board
  boardDoc.lists.push(list._id);
  await boardDoc.save();

  return sendSuccess(res, 201, 'List created successfully', { list });
});

const updateList = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const list = await List.findById(req.params.id).populate('board');

  if (!list) {
    return sendNotFoundError(res, 'List not found');
  }

  const board = list.board;

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Check if user can edit content (owner, admin, or editor)
  if (!checkContentAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Only board owners, admins, and editors can edit lists');
  }

  const updatedList = await List.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  return sendSuccess(res, 200, 'List updated successfully', { list: updatedList });
});

const reorderList = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { position } = req.body;
  const list = await List.findById(req.params.id).populate('board');

  if (!list) {
    return sendNotFoundError(res, 'List not found');
  }

  const board = list.board;

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Check if user can edit content (owner, admin, or editor)
  if (!checkContentAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Only board owners, admins, and editors can reorder lists');
  }

  // Update positions of other lists
  if (position > list.position) {
    await List.updateMany(
      { 
        board: board._id, 
        position: { $gt: list.position, $lte: position },
        _id: { $ne: list._id }
      },
      { $inc: { position: -1 } }
    );
  } else if (position < list.position) {
    await List.updateMany(
      { 
        board: board._id, 
        position: { $gte: position, $lt: list.position },
        _id: { $ne: list._id }
      },
      { $inc: { position: 1 } }
    );
  }

  list.position = position;
  await list.save();

  return sendSuccess(res, 200, 'List reordered successfully', { list });
});

const deleteList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id).populate('board');

  if (!list) {
    return sendNotFoundError(res, 'List not found');
  }

  const board = list.board;

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Check if user can edit content (owner, admin, or editor)
  if (!checkContentAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Only board owners, admins, and editors can delete lists');
  }

  // Delete all cards in the list
  await Card.deleteMany({ list: req.params.id });

  // Remove list from board
  board.lists = board.lists.filter(listId => listId.toString() !== req.params.id);
  await board.save();

  // Update positions of remaining lists
  await List.updateMany(
    { board: board._id, position: { $gt: list.position } },
    { $inc: { position: -1 } }
  );

  await List.findByIdAndDelete(req.params.id);

  return sendSuccess(res, 200, 'List deleted successfully');
});

export {
  getListsByBoard,
  createList,
  updateList,
  reorderList,
  deleteList
};