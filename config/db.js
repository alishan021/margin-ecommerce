
// const mongoDB = 'mongodb://localhost:27017/margin-tools'; if connecting to local database


const mongoose = require('mongoose');

const mongoDB = process.env.DB_URI;
let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(mongoDB, { bufferCommands: false });
    isConnected = true;
    console.log('database connected successfully');
  } catch (error) {
    console.log('Database error : ' + error);
    throw error;
  }
}

module.exports = connectDB;