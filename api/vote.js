import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [yes, no] = await Promise.all([kv.get('votes:yes'), kv.get('votes:no')]);
      return res.status(200).json({ yes: yes || 0, no: no || 0 });
    }

    if (req.method === 'POST') {
      const { choice } = req.body || {};
      if (choice !== 'yes' && choice !== 'no') {
        return res.status(400).json({ error: 'choice must be "yes" or "no"' });
      }
      const newVal = await kv.incr(`votes:${choice}`);
      const other = choice === 'yes' ? await kv.get('votes:no') : await kv.get('votes:yes');
      return res.status(200).json({
        yes: choice === 'yes' ? newVal : (other || 0),
        no: choice === 'no' ? newVal : (other || 0),
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
