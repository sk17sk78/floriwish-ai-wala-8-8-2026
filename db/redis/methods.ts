import { connectRedis } from "./connection";

export const set = async <T>({
  key,
  value,
  ttl
}: {
  key: string;
  value: T;
  ttl?: number; // Time to live in seconds
}): Promise<boolean> => {
  try {
    const redisClient = await connectRedis();

    const stringifiedValue = JSON.stringify(value);
    console.log(`[REDIS SET] Key: ${key}, Size: ${stringifiedValue.length} bytes, TTL: ${ttl || 'none'}`);

    let response: string | null;
    if (ttl) {
      response = await redisClient.set(key, stringifiedValue, { EX: ttl });
    } else {
      response = await redisClient.set(key, stringifiedValue);
    }

    const success = response === "OK";
    console.log(`[REDIS SET ${success ? 'SUCCESS' : 'FAILED'}] ${key}`);
    
    return success;
  } catch (error: any) {
    console.warn("Redis set operation failed:", error?.message || error);
    return false;
  }
};

export const get = async <T>({ key }: { key: string }): Promise<T | null> => {
  try {
    const redisClient = await connectRedis();

    const value = await redisClient.get(key);

    if (!value) {
      console.log(`[REDIS GET] Key not found: ${key}`);
      return null;
    }

    const parsedValue = JSON.parse(value) as T;
    console.log(`[REDIS GET] Key found: ${key} (${value.length} bytes)`);

    return parsedValue;
  } catch (error: any) {
    console.warn("Redis get operation failed:", error?.message || error);
    return null;
  }
};

export const del = async ({ keys }: { keys: string[] }): Promise<boolean> => {
  try {
    const validKeys = (keys || []).filter((k) => Boolean(k && typeof k === "string"));
    if (validKeys.length === 0) return true;

    const redisClient = await connectRedis();
    await redisClient.del(validKeys);

    return true;
  } catch (error: any) {
    console.warn("Redis del operation failed:", error?.message || error);
    return false;
  }
};

export const delMany = async ({
  prefix
}: {
  prefix: string;
}): Promise<boolean> => {
  try {
    if (!prefix) return true;
    const redisClient = await connectRedis();
    let cursor = 0;
    let deletedCount = 0;

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: `${prefix}*`,
        COUNT: 100
      });

      cursor = result.cursor;
      const keys = result.keys;

      if (keys.length > 0) {
        const response = await redisClient.del(keys);
        deletedCount += response;
      }
    } while (cursor);

    return true;
  } catch (error: any) {
    console.warn("Redis delMany operation failed:", error?.message || error);
    return false;
  }
};

export const flush = async (): Promise<boolean> => {
  try {
    const redisClient = await connectRedis();
    const response = await redisClient.flushAll();
    return response === "OK";
  } catch (error: any) {
    console.warn("Redis flush operation failed:", error?.message || error);
    return false;
  }
};
