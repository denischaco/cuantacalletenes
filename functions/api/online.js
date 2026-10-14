import { Redis } from '@upstash/redis';

const ONLINE_KEY = 'active_players';
const TIMEOUT_SECONDS = 90;

export async function onRequest(context) {
  const { request, env } = context;

  const url =
    env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    env.KV_REST_API_URL ||
    env.UPSTASH_REDIS_REST_URL ||
    env.UPSTASH_REDIS_URL;

  const token =
    env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
    env.KV_REST_API_TOKEN ||
    env.UPSTASH_REDIS_REST_TOKEN ||
    env.UPSTASH_REDIS_TOKEN;

  // Fallback si no están configuradas las variables de Redis
  if (!url || !token) {
    return new Response(
      JSON.stringify({
        online: 1,
        monthlyPlayers: 1,
        notice: 'Redis env variables not set'
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const redis = new Redis({ url, token });
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - TIMEOUT_SECONDS;

  const d = new Date();
  const monthKey = `unique_players:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  try {
    const pipe = redis.pipeline();
    pipe.zremrangebyscore(ONLINE_KEY, 0, cutoff);

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const deviceId = body?.deviceId || body?.sessionId;

        if (body?.sessionId) {
          pipe.zadd(ONLINE_KEY, { score: now, member: body.sessionId });
        }

        if (deviceId) {
          pipe.pfadd(monthKey, deviceId);
          pipe.expire(monthKey, 90 * 86400); // 90 días
        }
      } catch (err) {
        // Ignorar error de parsing en body vacío
      }
    }

    pipe.zcard(ONLINE_KEY);
    pipe.pfcount(monthKey);
    const results = await pipe.exec();

    const onlineCount = results[results.length - 2] || 0;
    const monthlyCount = results[results.length - 1] || 0;

    return new Response(
      JSON.stringify({
        online: onlineCount,
        monthlyPlayers: monthlyCount
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': request.method === 'GET' ? 's-maxage=15, stale-while-revalidate=30' : 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('Error con Upstash Redis en Cloudflare Pages:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Error',
        message: error.message,
        online: 1
      }),
      {
        status: 200, // Retornamos 200 con fallback para no romper el cliente
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
