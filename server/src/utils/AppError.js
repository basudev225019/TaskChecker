// An error with an HTTP status and a message that is safe to show to the user
class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

module.exports = AppError;
