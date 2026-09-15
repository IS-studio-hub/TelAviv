import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/TelAviv/' : '/',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'es2022',
  },
});
