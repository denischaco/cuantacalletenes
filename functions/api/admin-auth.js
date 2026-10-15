/**
 * Cloudflare Pages Function: /api/admin-auth
 * Valida de forma segura en el servidor de Cloudflare la contraseña maestra de Superadmin (Root)
 * sin exponer jamás la contraseña en el bundle JavaScript del navegador del cliente.
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Manejo de Preflight CORS si fuera necesario
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const inputPassword = body?.password ? String(body.password).trim() : '';

    // Buscar en todas las variantes de nombres de variables de entorno configurables en Cloudflare
    const expectedSecret =
      env.ADMIN_PASSWORD ||
      env.VITE_ADMIN_PASSWORD ||
      env.ROOT_PASSWORD ||
      env.VITE_ROOT_PASSWORD ||
      env.ADMIN_CLEAR_PASSWORD ||
      env.VITE_ADMIN_CLEAR_PASSWORD ||
      env.ADMIN_SECRET ||
      env.ADMIN_PASS ||
      env.PASSWORD;

    if (!expectedSecret) {
      console.warn('Alerta: Ninguna variable de entorno de contraseña root configurada en Cloudflare.');
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Variable de contraseña no encontrada en Cloudflare (ADMIN_PASSWORD / VITE_ADMIN_PASSWORD).'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const cleanExpected = String(expectedSecret).trim();

    if (inputPassword && inputPassword === cleanExpected) {
      return new Response(
        JSON.stringify({
          ok: true,
          role: 'root',
          message: 'Autenticación exitosa'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Contraseña incorrecta'
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Error al procesar la solicitud de autenticación'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
