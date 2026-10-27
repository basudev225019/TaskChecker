const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/auth.controller');

const router = Router();

// Slows down brute-force attempts on the endpoints that check passwords
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;
