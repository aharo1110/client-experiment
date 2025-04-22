import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  base: isDev ? '/' : './',
  envDir: path.resolve(__dirname, '..'),
  envPrefix: 'APP_',
  plugins: [react()], // Add React plugin for Vite
  build: {
    outDir: 'dist/www', // Output directory for the web build
    rollupOptions: {
      external: ['electron'], // Exclude Electron from the web build
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Optional: Alias for cleaner imports
    },
  },
  server: {
    port: 5173, // Development server port
    strictPort: true, // Fail if the port is already in use
  },
});
