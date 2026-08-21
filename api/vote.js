import { getRedis } from '../lib/redis.js';

const LOG_KEY = 'votes:log';
const LOG_MAX = 199; // keep latest 200 entries

export default async function handler(req, res) {
  try {
    const redis = getRedis();

    if (req.method === 'GET') {
      const [yes, no, rawEntries] = await Promise.all([
        redis.get('votes:yes'),
        redis.get('votes:no'),
        redis.lrange(LOG_KEY, 0, 19), // most recent 20 (LPUSH -> newest at index 0)
      ]);
      const entries = rawEntries
        .map((e) => { try { return JSON.parse(e); } catch { return null; } })
        .filter(Boolean);
      return res.status(200).json({ yes: Number(yes) || 0, no: Number(no) || 0, entries });
    }

    if (req.method === 'POST') {
      const { choice, name } = req.body || {};
      if (choice !== 'yes' && choice !== 'no') {
        return res.status(400).json({ error: 'choice must be "yes" or "no"' });
      }
      const safeName = String(name || '').trim().slice(0, 40) || 'Anonymous';

      const newVal = await redis.incr(`votes:${choice}`);
      const otherKey = choice === 'yes' ? 'votes:no' : 'votes:yes';
      const other = Number(await redis.get(otherKey)) || 0;

      const entry = JSON.stringify({ name: safeName, choice, ts: Date.now() });
      await redis.lpush(LOG_KEY, entry);
      await redis.ltrim(LOG_KEY, 0, LOG_MAX);

      return res.status(200).json({
        yes: choice === 'yes' ? newVal : other,
        no: choice === 'no' ? newVal : other,
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: String(err.message || err) });
  }
}
