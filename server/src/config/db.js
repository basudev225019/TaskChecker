const mongoose = require('mongoose');

// Cached so serverless invocations reuse one connection instead of opening a new one each time
let connection = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Check your .env file.');
  }

  if (!connection) {
    connection = mongoose.connect(uri).catch((err) => {
      connection = null;
      throw err;
    });
    await connection;
    console.log('MongoDB connected');
  }
  return connection;
}

module.exports = connectDB;
