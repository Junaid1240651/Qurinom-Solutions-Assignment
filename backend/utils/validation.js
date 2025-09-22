import { body } from 'express-validator';

// Auth validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .exists()
    .withMessage('Password is required')
    .notEmpty()
    .withMessage('Password cannot be empty')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Board validation rules
const createBoardValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),

  body('background')
    .optional()
    .custom((value) => {
      // Allow hex colors
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
        return true;
      }
      // Allow gradients
      if (value.startsWith('linear-gradient') || value.startsWith('radial-gradient')) {
        return true;
      }
      // Allow image URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      throw new Error('Background must be a valid hex color, gradient, or image URL');
    }),

  body('isStarred')
    .optional()
    .isBoolean()
    .withMessage('isStarred must be a boolean value')
  ,
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value')
];

const updateBoardValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),

  body('background')
    .optional()
    .custom((value) => {
      // Allow hex colors
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
        return true;
      }
      // Allow gradients
      if (value.startsWith('linear-gradient') || value.startsWith('radial-gradient')) {
        return true;
      }
      // Allow image URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      throw new Error('Background must be a valid hex color, gradient, or image URL');
    }),

  body('isStarred')
    .optional()
    .isBoolean()
    .withMessage('isStarred must be a boolean value')
  ,
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value')
];

const addMemberValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('role')
    .optional()
    .isIn(['admin', 'editor', 'viewer'])
    .withMessage('Invalid role')
];

// List validation rules
const createListValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('board')
    .isMongoId()
    .withMessage('Valid board ID is required')
];

const updateListValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
];

const reorderListValidation = [
  body('position')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer')
];

// Card validation rules
const createCardValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('list')
    .isMongoId()
    .withMessage('Valid list ID is required'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot be more than 2000 characters'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

const updateCardValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot be more than 2000 characters'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

const moveCardValidation = [
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required'),

  body('position')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer')
];

const addCommentValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// User validation rules
const updateUserProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

export {
  // Auth validations
  registerValidation,
  loginValidation,
  updateProfileValidation,

  // Board validations
  createBoardValidation,
  updateBoardValidation,
  addMemberValidation,

  // List validations
  createListValidation,
  updateListValidation,
  reorderListValidation,

  // Card validations
  createCardValidation,
  updateCardValidation,
  moveCardValidation,
  addCommentValidation,

  // User validations
  updateUserProfileValidation
};