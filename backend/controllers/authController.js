import { validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.js';
import { 
  createUserWithToken, 
  authenticateUser, 
  getUserProfile, 
  updateUserProfile,
  userExistsByEmail,
  logoutUser as logoutUserService
} from '../services/authService.js';

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { name, email, password, useCookies = false } = req.body;
  
  // Check if user already exists
  const userExists = await userExistsByEmail(email);
  if (userExists) {
    return sendError(res, 400, 'User already exists with this email');
  }

  // Create user with token
  const result = await createUserWithToken({ name, email, password }, res, useCookies);

  return sendSuccess(res, 201, 'User registered successfully', result);
});

const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { email, password, useCookies = false } = req.body;
  
  // Authenticate user
  const result = await authenticateUser(email, password, res, useCookies);
  if (!result) {
    return sendError(res, 400, 'Invalid email or password');
  }

  return sendSuccess(res, 200, 'Login successful', result);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  
  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  return sendSuccess(res, 200, 'User data retrieved successfully', { user });
});

const logoutUser = asyncHandler(async (req, res) => {
  // Clear cookie if it exists
  logoutUserService(res);
  
  return sendSuccess(res, 200, 'Logout successful');
});

const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { name, email } = req.body;
  const updateData = {};
  
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  try {
    const updatedUser = await updateUserProfile(req.user.id, updateData);
    
    if (!updatedUser) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    if (error.message === 'Email is already taken') {
      return sendError(res, 400, error.message);
    }
    throw error;
  }
});

export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateProfile
};