// libraries
import mongoose from "mongoose";

// types
import { type Mongoose } from "mongoose";

// env variables
const uri: string | undefined = process.env.MONGODB_URI;
const dbName: string | undefined = process.env.DB_NAME;

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env");
}

if (!dbName) {
  throw new Error("Please add your DB_NAME to .env");
}

// enable mongoose log
// mongoose.set("debug", true);

// cache for the connection
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async (): Promise<Mongoose> => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Attempting MongoDB connection...');
    cached.promise = mongoose
      .connect(uri as string, {
        dbName,
        minPoolSize: 2,
        maxPoolSize: 10,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000, // Keep-alive ping every 10s to prevent NAT drop
        family: 4
      })
      .then((mongoose) => {
        console.log('✅ MongoDB connected');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default connectDB;
