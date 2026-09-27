import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_URL,
  token:
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_TOKEN,
});

const ONLINE_KEY = 'active_players';
const TIMEOUT_SECONDS = 90;

export default async function handler(req, res) {
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - TIMEOUT_SECONDS;

  // Clave mensual para contar visitantes únicos reales del mes en curso (ej: unique_players:2026-09)
  const d = new Date();
  const monthKey = `unique_players:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  try {
    const pipe = redis.pipeline();
    pipe.zremrangebyscore(ONLINE_KEY, 0, cutoff);

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const deviceId = body?.deviceId || body?.sessionId;

      if (body?.sessionId) {
        pipe.zadd(ONLINE_KEY, { score: now, member: body.sessionId });
      }

      if (deviceId) {
        pipe.pfadd(monthKey, deviceId);
        pipe.expire(monthKey, 90 * 86400); // 90 días de vigencia
      }
    }

    pipe.zcard(ONLINE_KEY);
    pipe.pfcount(monthKey);
    const results = await pipe.exec();

    const onlineCount = results[results.length - 2] || 0;
    const monthlyCount = results[results.length - 1] || 0;

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    }

    return res.status(200).json({
      online: onlineCount,
      monthlyPlayers: monthlyCount
    });
  } catch (error) {
    console.error('Error con Redis:', error);
    return res.status(500).json({ error: 'Internal Error', message: error.message });
  }
}