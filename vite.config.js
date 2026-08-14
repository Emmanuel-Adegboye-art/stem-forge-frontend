import { defineConfig } from 'vite';
import { resolve, basename } from 'path';
import { readdirSync } from 'fs';

const pages = Object.fromEntries(
  readdirSync(__dirname)
    .filter(file => file.endsWith('.html'))
    .map(file => [basename(file, '.html'), resolve(__dirname, file)])
);

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: pages
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
