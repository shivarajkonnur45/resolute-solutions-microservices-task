const redis = require("redis");
const COLOR = "\x1b[31m";
const RESET = "\x1b[0m";

const internalUrl = process.env.REDIS_URL_INTERNAL;
const portRedis = process.env.REDIS_PORT;

//! For Local Code
// const client = redis.createClient();

//! For deployment
const client = redis.createClient({
    url: `redis://${internalUrl}:${portRedis}`
});

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

const redisConnection = async () => {
  try {
    await client.connect();
    await client.set("ClientPing", "Redis Client Pong", {
      NX: true,
    });
    const test = await client.get("AdminPing");
    console.log(`${COLOR}${test}${RESET}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { client, redisConnection };
