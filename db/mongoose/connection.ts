// libraries
import mongoose from "mongoose";

// types
import { type Mongoose } from "mongoose";

// cache for the connection across Next.js hot reloads
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Global connection event handlers for auto-recovery on network drops
if (!(global as any).mongooseEventsAttached) {
  mongoose.connection.on("disconnected", () => {
    if ((global as any).mongoose) {
      (global as any).mongoose.conn = null;
      (global as any).mongoose.promise = null;
    }
  });

  mongoose.connection.on("error", (err: any) => {
    const errorMsg = err?.message || String(err);
    if ((global as any).mongoose) {
      (global as any).mongoose.conn = null;
      (global as any).mongoose.promise = null;
    }
  });

  (global as any).mongooseEventsAttached = true;
}

const connectDB = async (): Promise<Mongoose> => {
  const uri: string | undefined = process.env.MONGODB_URI;
  const dbName: string | undefined = process.env.DB_NAME || "Flowrish";

  if (!uri) {
    throw new Error("Please add your MONGODB_URI to .env");
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is not ready, force clean reset
  if (mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri as string, {
        dbName,
        minPoolSize: 0, // Prevents OpenSSL idle socket TLS corruption on macOS/Node
        maxPoolSize: 15,
        maxIdleTimeMS: 15000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
        retryWrites: true,
        retryReads: true
      })
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((error) => {
        cached.conn = null;
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default connectDB;
