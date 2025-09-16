import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getCardsByList,
  searchCards,
  createCard,
  updateCard,
  moveCard,
  deleteCard,
  addCommentToCard
} from '../controllers/cardController.js';
import {
  createCardValidation,
  updateCardValidation,
  moveCardValidation,
  addCommentValidation
} from '../utils/validation.js';

const router = express.Router();

// @route   GET /api/cards/list/:listId
// @desc    Get all cards for a list
// @access  Private
router.get('/list/:listId', auth, getCardsByList);

// @route   GET /api/cards/search
// @desc    Search cards across all boards
// @access  Private
router.get('/search', auth, searchCards);

// @route   POST /api/cards
// @desc    Create new card
// @access  Private
router.post('/', auth, createCardValidation, createCard);

// @route   PUT /api/cards/:id
// @desc    Update card
// @access  Private
router.put('/:id', auth, updateCardValidation, updateCard);

// @route   PUT /api/cards/:id/move
// @desc    Move card to different list
// @access  Private
router.put('/:id/move', auth, moveCardValidation, moveCard);

// @route   DELETE /api/cards/:id
// @desc    Delete card
// @access  Private
router.delete('/:id', auth, deleteCard);

// @route   POST /api/cards/:id/comments
// @desc    Add comment to card
// @access  Private
router.post('/:id/comments', auth, addCommentValidation, addCommentToCard);

export default router;
