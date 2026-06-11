import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: [
      'html-to-pdfmake',
      'pdfmake/build/pdfmake',
      'pdfmake/build/vfs_fonts',
    ],
  },
});
