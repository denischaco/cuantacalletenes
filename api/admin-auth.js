/**
 * Vercel Serverless Function: /api/admin-auth
 * Valida de forma segura en el servidor la contraseña maestra de Superadmin (Root)
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const inputPassword = body?.password ? String(body.password).trim() : '';

    const expectedSecret =
      process.env.ADMIN_PASSWORD ||
      process.env.VITE_ADMIN_PASSWORD ||
      process.env.ROOT_PASSWORD ||
      process.env.VITE_ROOT_PASSWORD ||
      process.env.ADMIN_CLEAR_PASSWORD ||
      process.env.VITE_ADMIN_CLEAR_PASSWORD ||
      process.env.ADMIN_SECRET ||
      process.env.ADMIN_PASS ||
      process.env.PASSWORD;

    if (!expectedSecret) {
      return res.status(500).json({
        ok: false,
        error: 'Variable de contraseña no encontrada en el servidor'
      });
    }

    const cleanExpected = String(expectedSecret).trim();

    if (inputPassword && inputPassword === cleanExpected) {
      return res.status(200).json({ ok: true, role: 'root' });
    }

    return res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
  } catch (err) {
    return res.status(400).json({ ok: false, error: 'Error al procesar la solicitud' });
  }
}
