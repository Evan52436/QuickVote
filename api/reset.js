import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
    await Promise.all([kv.set('votes:yes', 0), kv.set('votes:no', 0)]);
    return res.status(200).json({ yes: 0, no: 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
