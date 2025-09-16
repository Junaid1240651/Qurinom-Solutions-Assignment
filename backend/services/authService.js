import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { setTokenCookie, clearTokenCookie } from '../utils/cookies.js';

export const createUserWithToken = async (userData, res = null, useCookies = false) => {
  const user = await User.create(userData);
  const token = generateToken(user._id);
  
  // Set cookie if requested and response object is provided
  if (useCookies && res) {
    setTokenCookie(res, token);
  }
  
  const result = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  };

  // Only include token in response if not using cookies
  if (!useCookies) {
    result.token = token;
  }

  return result;
};

export const authenticateUser = async (email, password, res = null, useCookies = false) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return null;
  }

  const token = generateToken(user._id);
  
  // Set cookie if requested and response object is provided
  if (useCookies && res) {
    setTokenCookie(res, token);
  }
  
  const result = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  };

  // Only include token in response if not using cookies
  if (!useCookies) {
    result.token = token;
  }

  return result;
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt
  };
};

export const updateUserProfile = async (userId, updateData) => {
  // Check if email is already taken by another user
  if (updateData.email) {
    const existingUser = await User.findOne({ 
      email: updateData.email, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      throw new Error('Email is already taken');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return null;
  }

  return {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    createdAt: updatedUser.createdAt
  };
};

export const userExistsByEmail = async (email) => {
  const user = await User.findOne({ email });
  return !!user;
};

export const logoutUser = (res) => {
  clearTokenCookie(res);
};