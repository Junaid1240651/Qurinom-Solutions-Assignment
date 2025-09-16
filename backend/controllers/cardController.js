import { validationResult } from 'express-validator';
import Card from '../models/Card.js';
import List from '../models/List.js';
import Board from '../models/Board.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError, sendValidationError, sendNotFoundError, sendForbiddenError } from '../utils/response.js';

// Helper function to check board access
const checkBoardAccess = (board, userId) => {
  return board.owner.toString() === userId ||
    board.members.some(member => member.user.toString() === userId);
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

  // Create activity
  await Activity.create({
    type: 'card_created',
    description: `Created card "${title}"`,
    card: card._id,
    user: req.user.id
  });

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

  const oldTitle = card.title;
  const updatedCard = await Card.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Create activity if title changed
  if (oldTitle !== updatedCard.title) {
    await Activity.create({
      type: 'card_updated',
      description: `Renamed card from "${oldTitle}" to "${updatedCard.title}"`,
      card: updatedCard._id,
      user: req.user.id
    });
  }

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

  // Create activity
  await Activity.create({
    type: 'card_moved',
    description: `Moved card "${card.title}" from "${oldList.title}" to "${newList.title}"`,
    card: card._id,
    user: req.user.id,
    metadata: {
      fromList: oldList.title,
      toList: newList.title
    }
  });

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

  // Delete comments and activities
  await Comment.deleteMany({ card: req.params.id });
  await Activity.deleteMany({ card: req.params.id });

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

  // Create activity
  await Activity.create({
    type: 'comment_added',
    description: `Added a comment to "${card.title}"`,
    card: card._id,
    user: req.user.id
  });

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
  addCommentToCard
};