import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

function disableHmrSafeClientPlugin(): Plugin {
  return {
    name: 'disable-hmr-safe-client',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const reqPath = (req.url ?? '').split('?')[0];
        if (reqPath === '/@vite-plugin-pwa/pwa-entry-point-loaded') {
          res.statusCode = 200;
          res.setHeader(
            'Content-Type',
            'application/javascript; charset=utf-8'
          );
          res.setHeader('Cache-Control', 'no-store');
          res.end('export default function registerDevSW() {}\n');
          return;
        }
        if (reqPath === '/dev-sw.js') {
          res.statusCode = 200;
          res.setHeader(
            'Content-Type',
            'application/javascript; charset=utf-8'
          );
          res.setHeader('Cache-Control', 'no-store');
          res.end(
            "self.addEventListener('install', () => self.skipWaiting());\n" +
              "self.addEventListener('activate', () => self.registration.unregister());\n"
          );
          return;
        }
        next();
      });
    },
    transform(code, id) {
      const cleanId = id.split('?')[0].replace(/\\/g, '/');
      if (!cleanId.endsWith('/vite/dist/client/client.mjs')) {
        return null;
      }
      let nextCode = code;
      nextCode = nextCode.replace(
        'ws.send(JSON.stringify(data));',
        'if (ws && ws.readyState === 1) ws.send(JSON.stringify(data));'
      );
      nextCode = nextCode.replace(
        'wsTransport.send(data);',
        'wsTransport?.send?.(data);'
      );
      nextCode = nextCode.replace(
        'async connect(handlers) {',
        'async connect(handlers) {\n\t\t\tvoid handlers;\n\t\t\treturn;'
      );
      return nextCode !== code ? {code: nextCode, map: null} : null;
    },
  };
}

export default defineConfig(() => {
  const hmrDisabled = process.env.DISABLE_HMR === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Rota — Controle para Entregadores',
          short_name: 'Rota',
          description:
            'Controle de ganhos, gastos e quilômetros rodados para entregadores de moto.',
          theme_color: '#0E131D',
          background_color: '#0E131D',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          lang: 'pt-BR',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: !hmrDisabled,
          type: 'module',
        },
      }),
      ...(hmrDisabled ? [disableHmrSafeClientPlugin()] : []),
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: !hmrDisabled,
      watch: hmrDisabled ? null : {},
      forwardConsole: hmrDisabled ? false : undefined,
    },
  };
});
