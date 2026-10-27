const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const { validateTaskInput, parseObjectId } = require('../utils/validate');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Every query filters by owner, so users can only ever reach their own tasks.
// A task that belongs to someone else is reported as "not found" (404), not 403,
// so the API does not reveal that the id exists.

async function listTasks(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
  const filter = { owner: req.userId };

  const [items, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

async function createTask(req, res) {
  const data = validateTaskInput(req.body);
  const task = await Task.create({ ...data, owner: req.userId });

  res.status(201).json(task);
}

async function updateTask(req, res) {
  const id = parseObjectId(req.params.id);
  const data = validateTaskInput(req.body, { partial: true });

  const task = await Task.findOneAndUpdate({ _id: id, owner: req.userId }, data, {
    new: true,
    runValidators: true,
  });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  res.json(task);
}

async function deleteTask(req, res) {
  const id = parseObjectId(req.params.id);

  const task = await Task.findOneAndDelete({ _id: id, owner: req.userId });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  res.status(204).end();
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
