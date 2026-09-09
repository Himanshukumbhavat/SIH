import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MongoDB is not configured; starting in API-only mode.');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.warn('MongoDB is unavailable; database routes will remain disabled:', error.message);
    return false;
  }
};

export default connectDB;