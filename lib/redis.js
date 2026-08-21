import Redis from 'ioredis';

let client = null;

export function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    const err = new Error(
      'REDIS_URL is not set on this deployment. In Vercel: Storage tab -> ' +
      'connect your Redis database to this project (Production + Preview), then redeploy.'
    );
    err.code = 'NO_REDIS_ENV';
    throw err;
  }
  // Reuse the connection across warm serverless invocations instead of
  // reconnecting on every request.
  if (!client) {
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      // Vercel's Node.js serverless functions are TCP-capable, so a normal
      // ioredis connection works here (unlike Edge Functions).
    });
    client.on('error', (e) => console.error('Redis connection error:', e));
  }
  return client;
}
