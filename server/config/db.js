import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-job-portal';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.warn('Server will continue running without MongoDB. Start MongoDB or set a valid MONGO_URI to enable database persistence.');
    return null;
  }
};

export default connectDB;
