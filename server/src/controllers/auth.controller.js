const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { validateRegister, validateLogin } = require('../utils/validate');

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

// Never return the password hash or other internal fields
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register(req, res) {
  const { name, email, password } = validateRegister(req.body);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

async function login(req, res) {
  const { email, password } = validateLogin(req.body);

  const user = await User.findOne({ email }).select('+passwordHash');
  const isMatch = user && (await bcrypt.compare(password, user.passwordHash));

  // Same message whether the email or the password is wrong, so attackers cannot
  // use this endpoint to discover which emails are registered
  if (!isMatch) {
    throw new AppError(401, 'Email or password is incorrect');
  }

  res.json({ token: signToken(user), user: publicUser(user) });
}

module.exports = { register, login };
