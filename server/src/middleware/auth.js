const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Reads "Authorization: Bearer <token>", verifies it and attaches the user id
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new AppError(401, 'Please log in to continue'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, 'Your session has expired. Please log in again'));
  }
}

module.exports = requireAuth;
