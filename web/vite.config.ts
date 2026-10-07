import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/labeltd-remake/' : '/',
  cacheDir: '.vite-cache',
  server: { host: '127.0.0.1' },
}));
