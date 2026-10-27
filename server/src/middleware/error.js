const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Single place that turns errors into a consistent JSON shape: { message }
// Internal details (stack traces, database errors) are logged, never sent.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body must be valid JSON';
  } else if (err.code === 11000) {
    // Duplicate key from a unique index (for example, an email already registered)
    status = 409;
    message = 'That email is already registered';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Some fields are invalid';
  }

  if (status === 500) {
    console.error(err);
    message = 'Something went wrong on our side. Please try again';
  }

  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
