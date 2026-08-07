require("dotenv").config();
const { createClient } = require("redis");

async function clearCache() {
  const url = process.env.REDIS_URL;
  const password = process.env.REDIS_PASSWORD;

  if (!url || !password) {
    console.error("Missing REDIS_URL or REDIS_PASSWORD in .env");
    process.exit(1);
  }

  const client = createClient({ url, password });

  try {
    await client.connect();
    console.log("Connected to Redis.");

    const keysToClear = [
      "homepage",
      "content_category_page",
      "content_category_page_contents",
      "content_category_page_meta",
      "search"
    ];

    console.log(`Clearing keys: ${keysToClear.join(", ")}`);
    const result = await client.del(keysToClear);
    console.log(`Successfully deleted ${result} keys.`);

    await client.disconnect();
    console.log("Disconnected from Redis.");
  } catch (error) {
    console.error("Redis error:", error);
    process.exit(1);
  }
}

clearCache();
