import User from '../models/User.js';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { getTokenFromCookies } from '../utils/cookies.js';
import { sendAuthError } from '../utils/response.js';

export const auth = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first, then from cookies
    const authHeader = req.header('Authorization');
    let token = extractTokenFromHeader(authHeader);

    // If no token in header, try cookies
    if (!token) {
      token = getTokenFromCookies(req);
    }

    if (!token) {
      return sendAuthError(res, 'No token, authorization denied');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendAuthError(res, 'Token is not valid - user not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendAuthError(res, 'Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendAuthError(res, 'Invalid token format');
    }
    return sendAuthError(res, 'Token is not valid');
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. No user found.' });
    }

    const userRole = req.user.role || 'user';
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};
