import { redis } from '../lib/redis.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [yes, no] = await Promise.all([redis.get('votes:yes'), redis.get('votes:no')]);
      return res.status(200).json({ yes: Number(yes) || 0, no: Number(no) || 0 });
    }

    if (req.method === 'POST') {
      const { choice } = req.body || {};
      if (choice !== 'yes' && choice !== 'no') {
        return res.status(400).json({ error: 'choice must be "yes" or "no"' });
      }
      const newVal = await redis.incr(`votes:${choice}`);
      const otherKey = choice === 'yes' ? 'votes:no' : 'votes:yes';
      const other = Number(await redis.get(otherKey)) || 0;
      return res.status(200).json({
        yes: choice === 'yes' ? newVal : other,
        no: choice === 'no' ? newVal : other,
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
}
