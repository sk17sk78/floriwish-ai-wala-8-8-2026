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
    console.warn("⚠️ MongoDB disconnected, resetting connection cache...");
    if ((global as any).mongoose && mongoose.connection.readyState === 0) {
      (global as any).mongoose.conn = null;
      (global as any).mongoose.promise = null;
    }
  });

  mongoose.connection.on("error", (err: any) => {
    const errorMsg = err?.message || String(err);
    // Ignore transient pool clearing notifications from idle socket timeout as driver auto-refreshes them
    if (errorMsg.includes("Connection pool") || errorMsg.includes("SSL routines")) {
      console.info("ℹ️ MongoDB pool auto-clearing stale idle socket (normal cloud keepalive behavior)");
    } else {
      console.warn("⚠️ MongoDB connection error event:", errorMsg);
    }
    
    // Only reset global singleton if connection is actually completely dead/disconnected (readyState === 0)
    if (mongoose.connection.readyState === 0 && (global as any).mongoose) {
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

  // If connection is in a disconnected state (0), reset promise to force fresh connection
  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    console.log("🔄 Attempting MongoDB connection...");
    cached.promise = mongoose
      .connect(uri as string, {
        dbName,
        minPoolSize: 2,  // Keep warm connections alive (eliminates cold-start latency)
        maxPoolSize: 30, // Headroom for high concurrency burst traffic
        maxIdleTimeMS: 30000, // Recycle idle connections before cloud NAT/firewall drops them
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        heartbeatFrequencyMS: 5000,  // Faster reconnection detection
        retryWrites: true,
        retryReads: true,
        tls: true,
        family: 4 // IPv4 only (avoids dual-stack IPv6 DNS delays)
      })
      .then((m) => {
        console.log("✅ MongoDB connected successfully");
        cached.conn = m;
        return m;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error?.message || error);
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
