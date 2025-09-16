import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addMemberToBoard,
  removeMemberFromBoard
} from '../controllers/boardController.js';
import {
  createBoardValidation,
  updateBoardValidation,
  addMemberValidation
} from '../utils/validation.js';

const router = express.Router();

// @route   GET /api/boards
// @desc    Get all boards for user
// @access  Private
router.get('/', auth, getAllBoards);

// @route   GET /api/boards/:id
// @desc    Get single board
// @access  Private
router.get('/:id', auth, getBoardById);

// @route   POST /api/boards
// @desc    Create new board
// @access  Private
router.post('/', auth, createBoardValidation, createBoard);

// @route   PUT /api/boards/:id
// @desc    Update board
// @access  Private
router.put('/:id', auth, updateBoardValidation, updateBoard);

// @route   DELETE /api/boards/:id
// @desc    Delete board
// @access  Private
router.delete('/:id', auth, deleteBoard);

// @route   POST /api/boards/:id/members
// @desc    Add member to board
// @access  Private
router.post('/:id/members', auth, addMemberValidation, addMemberToBoard);

// @route   DELETE /api/boards/:id/members/:memberId
// @desc    Remove member from board
// @access  Private
router.delete('/:id/members/:memberId', auth, removeMemberFromBoard);

export default router;
