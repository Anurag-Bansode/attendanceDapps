import mongoose from 'mongoose';
import { MONGO_URI } from '../config.js';
import { logger } from './logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // These options are good defaults
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully.');
  } catch (err) {
    logger.error('Failed to connect to MongoDB', { error: err.message });
    // Exit process with failure in case of connection error
    process.exit(1);
  }
};

export default connectDB;