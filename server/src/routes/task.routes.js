const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { listTasks, createTask, updateTask, deleteTask } = require('../controllers/task.controller');

const router = Router();

// All task routes require a logged-in user
router.use(requireAuth);

router.get('/', listTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
