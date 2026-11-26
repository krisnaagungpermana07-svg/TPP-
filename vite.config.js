import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('questions.json')) return 'question-bank';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
