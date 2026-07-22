import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const basePath = process.env.BASE_PATH ?? '/';
  const isServing = command === 'serve';

  const rawPort = process.env.PORT ?? '5173';
  const port = Number(rawPort);

  const rawApiPort = process.env.API_PORT ?? '3001';
  const apiPort = Number(rawApiPort);

  if (isServing && (Number.isNaN(port) || port <= 0)) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  if (isServing && (Number.isNaN(apiPort) || apiPort <= 0)) {
    throw new Error(`Invalid API_PORT value: "${rawApiPort}"`);
  }

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: isServing
      ? {
          port,
          strictPort: true,
          host: true,
          proxy: {
            '/api': `http://127.0.0.1:${apiPort}`,
          },
        }
      : undefined,
    preview: isServing
      ? {
          port,
        }
      : undefined,
  };
});
