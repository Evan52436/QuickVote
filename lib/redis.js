import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function getRedis() {
  if (!url || !token) {
    const err = new Error(
      'No Redis store connected to this deployment. In Vercel: Storage tab -> ' +
      'connect a Redis (Upstash) database to this project, then redeploy.'
    );
    err.code = 'NO_REDIS_ENV';
    throw err;
  }
  return new Redis({ url, token });
}
