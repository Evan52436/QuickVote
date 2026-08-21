import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error(
    'Missing Redis env vars. Connect a Redis/KV store to this project in ' +
    'Vercel → Storage, or check that it is linked to this project + environment.'
  );
}

export const redis = new Redis({ url, token });
