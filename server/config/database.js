import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnecting = null;

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection attempt is in progress, wait for it
  if (isConnecting) {
    return isConnecting;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student-voice';

  isConnecting = mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 8000,
  }).then((conn) => {
    console.log('✅ MongoDB connected successfully');
    isConnecting = null;
    return conn.connection;
  }).catch((error) => {
    isConnecting = null;
    console.error('❌ MongoDB connection failed:', error.message);
    // In standalone local server mode we may exit, but in serverless we must throw to allow proper 500 response
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      // Don't kill process immediately if called by middleware
    }
    throw error;
  });

  return isConnecting;
};

export default connectDB;
