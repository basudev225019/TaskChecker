const mongoose = require('mongoose');
const AppError = require('./AppError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rejects anything that is not a plain string (this also blocks NoSQL operator
// injection such as { "$ne": null } being sent as a password or email).
function requireString(value, field) {
  if (typeof value !== 'string') {
    throw new AppError(400, `${field} must be text`);
  }
  return value.trim();
}

function validateRegister(body = {}) {
  const name = requireString(body.name ?? '', 'Name');
  const email = requireString(body.email ?? '', 'Email').toLowerCase();
  const password = requireString(body.password ?? '', 'Password');

  if (!name) throw new AppError(400, 'Name is required');
  if (name.length > 60) throw new AppError(400, 'Name must be 60 characters or fewer');
  if (!EMAIL_PATTERN.test(email)) throw new AppError(400, 'Please enter a valid email address');
  if (password.length < 8) throw new AppError(400, 'Password must be at least 8 characters');

  return { name, email, password };
}

function validateLogin(body = {}) {
  const email = requireString(body.email ?? '', 'Email').toLowerCase();
  const password = requireString(body.password ?? '', 'Password');

  if (!email || !password) throw new AppError(400, 'Email and password are required');

  return { email, password };
}

// When partial is true (PATCH), only the fields that were sent are returned
function validateTaskInput(body = {}, { partial = false } = {}) {
  const data = {};

  if (body.title !== undefined || !partial) {
    const title = requireString(body.title ?? '', 'Title');
    if (!title) throw new AppError(400, 'Title is required');
    if (title.length > 120) throw new AppError(400, 'Title must be 120 characters or fewer');
    data.title = title;
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') {
      data.dueDate = null;
    } else {
      const dueDate = new Date(requireString(body.dueDate, 'Due date'));
      if (Number.isNaN(dueDate.getTime())) throw new AppError(400, 'Due date is not a valid date');
      data.dueDate = dueDate;
    }
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') throw new AppError(400, 'Completed must be true or false');
    data.completed = body.completed;
  }

  if (partial && Object.keys(data).length === 0) {
    throw new AppError(400, 'Nothing to update');
  }

  return data;
}

function parseObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid task id');
  }
  return id;
}

module.exports = { validateRegister, validateLogin, validateTaskInput, parseObjectId };
