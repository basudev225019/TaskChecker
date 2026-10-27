// Vercel serverless entry: runs the Express app for every /api/* request.
const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

module.exports = async (req, res) => {
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'Server is not configured' });
    return;
  }
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(503).json({ message: 'Database unavailable. Please try again' });
    return;
  }
  return app(req, res);
};
