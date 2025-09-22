import { validationResult } from 'express-validator';
import Card from '../models/Card.js';
import List from '../models/List.js';
import Board from '../models/Board.js';
import Comment from '../models/Comment.js';
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

const getCardsByList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.listId).populate('board');

  if (!list) {
    return sendNotFoundError(res, 'List not found');
  }

  const board = list.board;

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  const cards = await Card.find({ list: req.params.listId })
    .populate('members', 'name email avatar')
    .populate({
      path: 'comments',
      populate: { path: 'author', select: 'name email avatar' }
    })
    .sort({ position: 1 });

  return sendSuccess(res, 200, 'Cards retrieved successfully', { cards });
});

const searchCards = asyncHandler(async (req, res) => {
  const { q, boardId, label, dueDate } = req.query;

  // Get user's boards
  const userBoards = await Board.find({
    $or: [
      { owner: req.user.id },
      { 'members.user': req.user.id }
    ]
  }).select('_id');

  const boardIds = userBoards.map(board => board._id);

  let query = { board: { $in: boardIds } };

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  if (boardId) {
    query.board = boardId;
  }

  if (label) {
    query['labels.name'] = { $regex: label, $options: 'i' };
  }

  if (dueDate) {
    const date = new Date(dueDate);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    query.dueDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const cards = await Card.find(query)
    .populate('list', 'title')
    .populate('board', 'title')
    .populate('members', 'name email avatar')
    .sort({ updatedAt: -1 });

  return sendSuccess(res, 200, 'Cards search completed', { cards });
});

const createCard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { title, description, list, dueDate, labels } = req.body;

  const listDoc = await List.findById(list).populate('board');

  if (!listDoc) {
    return sendNotFoundError(res, 'List not found');
  }

  const board = listDoc.board;

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Check if user can create content (owner, admin, or editor)
  if (!checkContentAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Only board owners, admins, and editors can create cards');
  }

  // Get the highest position
  const lastCard = await Card.findOne({ list }).sort({ position: -1 });
  const position = lastCard ? lastCard.position + 1 : 0;

  const card = await Card.create({
    title,
    description,
    list,
    board: board._id,
    position,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    labels: labels || []
  });

  // Add card to list
  listDoc.cards.push(card._id);
  await listDoc.save();


  // Populate the card with the same structure as when fetching lists
  await card.populate([
    { path: 'members', select: 'name email avatar' },
    { path: 'comments', populate: { path: 'author', select: 'name email avatar' } }
  ]);

  return sendSuccess(res, 201, 'Card created successfully', { card });
});

const updateCard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const card = await Card.findById(req.params.id).populate('board');

  if (!card) {
    return sendNotFoundError(res, 'Card not found');
  }

  const board = card.board;

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Check if user can edit content (owner, admin, or editor)
  if (!checkContentAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Only board owners, admins, and editors can edit cards');
  }

  const oldTitle = card.title;
  const updatedCard = await Card.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );


  await updatedCard.populate('members', 'name email avatar');

  return sendSuccess(res, 200, 'Card updated successfully', { card: updatedCard });
});

const moveCard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { listId, position } = req.body;

  const card = await Card.findById(req.params.id).populate('board');

  if (!card) {
    return sendNotFoundError(res, 'Card not found');
  }

  const newList = await List.findById(listId).populate('board');

  if (!newList) {
    return sendNotFoundError(res, 'Target list not found');
  }

  // Check if user has access to both boards
  const hasAccessToCardBoard = checkBoardAccess(card.board, req.user.id);
  const hasAccessToNewBoard = checkBoardAccess(newList.board, req.user.id);

  if (!hasAccessToCardBoard || !hasAccessToNewBoard) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Check if user can edit content on both boards (owner, admin, or editor)
  if (!checkContentAccess(card.board, req.user.id) || !checkContentAccess(newList.board, req.user.id)) {
    return sendForbiddenError(res, 'Only board owners, admins, and editors can move cards');
  }

  const oldListId = card.list;
  const oldPosition = card.position;

  // Update positions in old list
  await Card.updateMany(
    { list: oldListId, position: { $gt: oldPosition } },
    { $inc: { position: -1 } }
  );

  // Update positions in new list
  await Card.updateMany(
    { list: listId, position: { $gte: position } },
    { $inc: { position: 1 } }
  );

  // Update card
  card.list = listId;
  card.board = newList.board._id;
  card.position = position;
  await card.save();

  // Update list references
  const oldList = await List.findById(oldListId);
  oldList.cards = oldList.cards.filter(cardId => cardId.toString() !== req.params.id);
  await oldList.save();

  newList.cards.push(card._id);
  await newList.save();


  await card.populate('members', 'name email avatar');

  return sendSuccess(res, 200, 'Card moved successfully', { card });
});

const deleteCard = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id).populate('board');

  if (!card) {
    return sendNotFoundError(res, 'Card not found');
  }

  const board = card.board;

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  // Check if user can edit content (owner, admin, or editor)
  if (!checkContentAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Only board owners, admins, and editors can delete cards');
  }

  // Delete comments
  await Comment.deleteMany({ card: req.params.id });

  // Remove card from list
  const list = await List.findById(card.list);
  list.cards = list.cards.filter(cardId => cardId.toString() !== req.params.id);
  await list.save();

  // Update positions of remaining cards
  await Card.updateMany(
    { list: card.list, position: { $gt: card.position } },
    { $inc: { position: -1 } }
  );

  await Card.findByIdAndDelete(req.params.id);

  return sendSuccess(res, 200, 'Card deleted successfully');
});

const getComments = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id)
    .populate('board')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'name username email'
      }
    });

  if (!card) {
    return sendNotFoundError(res, 'Card not found');
  }

  // Check if user has access to this board
  // Team boards are visible to any authenticated user
  const userRole = getUserRole(card.board, req.user.id);
  if (!userRole && card.board.isPrivate !== false) {
    return sendForbiddenError(res, 'Access denied to this board');
  }

  // Sort comments by creation date (newest first)
  const comments = card.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return sendSuccess(res, 200, 'Comments retrieved successfully', { comments });
});

const addCommentToCard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { text } = req.body;

  const card = await Card.findById(req.params.id).populate('board');

  if (!card) {
    return sendNotFoundError(res, 'Card not found');
  }

  const board = card.board;

  // Check if user has access to board
  if (!checkBoardAccess(board, req.user.id)) {
    return sendForbiddenError(res, 'Access denied');
  }

  const comment = await Comment.create({
    text,
    card: req.params.id,
    author: req.user.id
  });

  // Add comment to card
  card.comments.push(comment._id);
  await card.save();


  await comment.populate('author', 'name email avatar');

  return sendSuccess(res, 201, 'Comment added successfully', { comment });
});

export {
  getCardsByList,
  searchCards,
  createCard,
  updateCard,
  moveCard,
  deleteCard,
  getComments,
  addCommentToCard
};