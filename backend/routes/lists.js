import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getListsByBoard,
  createList,
  updateList,
  reorderList,
  deleteList
} from '../controllers/listController.js';
import {
  createListValidation,
  updateListValidation,
  reorderListValidation
} from '../utils/validation.js';

const router = express.Router();

// @route   GET /api/lists/board/:boardId
// @desc    Get all lists for a board
// @access  Private
router.get('/board/:boardId', auth, getListsByBoard);

// @route   POST /api/lists
// @desc    Create new list
// @access  Private
router.post('/', auth, createListValidation, createList);

// @route   PUT /api/lists/:id
// @desc    Update list
// @access  Private
router.put('/:id', auth, updateListValidation, updateList);

// @route   PUT /api/lists/:id/reorder
// @desc    Reorder lists
// @access  Private
router.put('/:id/reorder', auth, reorderListValidation, reorderList);

// @route   DELETE /api/lists/:id
// @desc    Delete list
// @access  Private
router.delete('/:id', auth, deleteList);

export default router;
