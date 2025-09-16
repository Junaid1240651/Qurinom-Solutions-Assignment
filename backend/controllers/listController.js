import { validationResult } from 'express-validator';
import List from '../models/List.js';
import Board from '../models/Board.js';
import Card from '../models/Card.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError, sendValidationError, sendNotFoundError, sendForbiddenError } from '../utils/response.js';

// Helper function to check board access
const checkBoardAccess = (board, userId) => {
  return board.owner.toString() === userId || 
         board.members.some(member => member.user.toString() === userId);
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