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
          const m = id.match(/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(@[^/]+\/[^/]+|[^/]+)/);
          const pkg = m ? m[1] : '';

          // React ve React runtime'ına bağlı tüm paketler TEK chunk'ta olmalı.
          // Aksi halde charts/editor gibi chunk'lar React yüklenmeden çalışıp
          // "Cannot read properties of undefined (reading 'forwardRef')" veriyor.
          // React'ı AYRI bir chunk'a ALMIYORUZ; entry (index) chunk'ında kalıyor.
          // Ayrı bir react-vendor chunk'ı yapıldığında Rollup, CJS interop
          // helper'ını (getDefaultExportFromCjs) charts chunk'ına yerleştirip
          // react-vendor'dan oraya import ekliyor. Oluşan
          // react-vendor <-> charts döngüsünde charts, React binding'i
          // initialize olmadan çalışıyor ve canlıda
          // "Cannot read properties of undefined (reading 'forwardRef')" veriyor.
          // Entry chunk her zaman ilk yüklendiği için bu sıra sorunu ortadan kalkıyor.
          const reactCore = new Set([
            'react',
            'react-dom',
            'react-is',
            'scheduler',
            'object-assign',
            'use-sync-external-store',
            'prop-types',
            'react-router',
            'react-router-dom',
          ]);
          if (reactCore.has(pkg)) return;

          // Dinamik ikon seti (import * as LucideIcons) ana bundle'ı şişiriyordu
          if (pkg === 'lucide-react') return 'icons';
          // Grafik kütüphaneleri yalnızca rapor/dashboard sayfalarında gerekli
          if (pkg === 'recharts' || pkg.startsWith('d3-') || pkg.startsWith('victory-')) return 'charts';
          if (pkg === 'chart.js' || pkg.startsWith('react-chartjs')) return 'chartjs';
          if (pkg === 'turkey-map-react' || pkg === 'ts-turkey-map') return 'turkey-map';
          if (pkg === 'framer-motion' || pkg === 'motion-dom' || pkg === 'motion-utils') return 'motion';
          if (pkg === 'tesseract.js') return 'ocr';
          if (pkg === 'react-quill' || pkg === 'quill' || pkg.startsWith('quill-')) return 'editor';
          if (pkg === 'socket.io-client' || pkg.startsWith('engine.io')) return 'realtime';
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
