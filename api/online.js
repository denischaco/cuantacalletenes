import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ONLINE_KEY = 'active_players';
const TIMEOUT_SECONDS = 90;

export default async function handler(req, res) {
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - TIMEOUT_SECONDS;

  try {
    const pipe = redis.pipeline();
    pipe.zremrangebyscore(ONLINE_KEY, 0, cutoff);

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body?.sessionId) {
        pipe.zadd(ONLINE_KEY, { score: now, member: body.sessionId });
      }
    }

    pipe.zcard(ONLINE_KEY);
    const results = await pipe.exec();
    const count = results[results.length - 1] || 0;

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    }

    return res.status(200).json({ online: count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Error' });
  }
}
