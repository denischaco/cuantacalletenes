import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function apiOnlinePlugin() {
  return {
    name: 'api-online-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/online')) {
          try {
            const { default: handler } = await server.ssrLoadModule('/api/online.js');
            let body = {};
            if (req.method === 'POST') {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const rawBody = Buffer.concat(buffers).toString();
              try {
                body = JSON.parse(rawBody);
              } catch {}
            }
            req.body = body;
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              if (res.statusCode >= 400 && !process.env.UPSTASH_REDIS_REST_URL) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ online: 1 }));
                return;
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            return await handler(req, res);
          } catch (err) {
            console.error('Error in dev /api/online middleware:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiOnlinePlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet')) {
            return 'vendor-leaflet';
          }
          if (id.includes('node_modules/@firebase/firestore') || id.includes('node_modules/firebase/firestore')) {
            return 'vendor-firestore';
          }
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-confetti';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
          if (id.includes('resistenciaStreets.json')) {
            return 'data-streets';
          }
          if (id.includes('esculturasResistencia.json')) {
            return 'data-sculptures';
          }
        }
      }
    }
  }
});
