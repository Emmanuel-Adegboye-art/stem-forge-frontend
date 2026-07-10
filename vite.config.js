import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ai: resolve(__dirname, 'ai-generate.html'),
        scheme: resolve(__dirname, 'scheme.html'),
        attendance: resolve(__dirname, 'attendance.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        contact: resolve(__dirname, 'contact.html'),
        comingSoon: resolve(__dirname, 'coming-soon.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
