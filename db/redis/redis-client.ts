import { createClient, type RedisClientType } from "redis";

const url: string = process.env.REDIS_URL || "redis://localhost:6379";
const password: string | undefined = process.env.REDIS_PASSWORD;

export const redisClient: RedisClientType = createClient(
  password ? { url, password } : { url }
);

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err?.message || err);
});

export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return redisClient;
  } catch (error: any) {
    console.error("Redis connection error:", error?.message || error);
    throw error;
  }
};
