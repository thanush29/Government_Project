import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load .env files
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],

    // Make sure env variables exist
    define: {
      'process.env': env
    },

    server: {
      port: 5173,
      strictPort: true,
      open: true, // Auto open browser
    },

    build: {
      target: 'esnext', // Modern build
      sourcemap: false,
      chunkSizeWarningLimit: 600,
    },

    // No need to exclude lucide now
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  };
});
