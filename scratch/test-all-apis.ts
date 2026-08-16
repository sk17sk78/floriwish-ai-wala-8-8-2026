import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

async function testAll() {
  console.log("--- 1. Testing MongoDB Connection ---");
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is missing from .env");
  } else {
    try {
      await mongoose.connect(mongoUri);
      console.log("✅ MongoDB Connected successfully! DB Name:", mongoose.connection.name);
      
      // Test collections
      const collections = await mongoose.connection.db?.listCollections().toArray();
      console.log(`✅ MongoDB collections found: ${collections?.length}`);
      
      const adminRoles = await mongoose.connection.db?.collection("adminroles").countDocuments();
      console.log(`✅ AdminRoles count: ${adminRoles}`);

      const products = await mongoose.connection.db?.collection("contents").countDocuments();
      console.log(`✅ Products count: ${products}`);

      const categories = await mongoose.connection.db?.collection("contentcategories").countDocuments();
      console.log(`✅ Categories count: ${categories}`);

      await mongoose.disconnect();
    } catch (err: any) {
      console.error("❌ MongoDB connection error:", err.message);
    }
  }

  console.log("\n--- 2. Testing Redis Connection ---");
  try {
    const { connectRedis } = await import("../db/redis/redis-client");
    const client = await connectRedis();
    const pingRes = await client.ping();
    console.log("✅ Redis Ping Response:", pingRes);
    await client.disconnect();
  } catch (err: any) {
    console.warn("⚠️ Redis not reachable (App will gracefully fallback to MongoDB without error):", err.message);
  }
}

testAll().then(() => {
  console.log("\n--- DB & Infrastructure Verification Complete ---");
  process.exit(0);
});
