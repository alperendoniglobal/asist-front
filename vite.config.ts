import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Dinamik ikon seti (import * as LucideIcons) ana bundle'ı şişiriyordu
          if (id.includes('lucide-react')) return 'icons';
          // Grafik kütüphaneleri yalnızca rapor/dashboard sayfalarında gerekli
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) return 'charts';
          if (id.includes('chart.js') || id.includes('react-chartjs')) return 'chartjs';
          if (id.includes('turkey-map-react') || id.includes('ts-turkey-map')) return 'turkey-map';
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion';
          if (id.includes('tesseract.js')) return 'ocr';
          if (id.includes('react-quill') || id.includes('quill')) return 'editor';
          if (id.includes('socket.io') || id.includes('engine.io')) return 'realtime';
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) return 'react-vendor';
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  // Server ayarları - PM2 ile çalıştırmak için
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
  },
})
