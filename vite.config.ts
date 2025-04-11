import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': ['./components/ui'],
          'pdf-utils': ['jspdf', 'docx', 'jszip', 'file-saver']
        }
      }
    },
    chunkSizeWarningLimit: 800,
  },
  define: {
    // Make environment information available to client
    'process.env.DEPLOY_ENV': JSON.stringify(process.env.DEPLOY_ENV || 'development'),
    'import.meta.env.VITE_GOOGLE_ANALYTICS_ID': JSON.stringify(process.env.VITE_GOOGLE_ANALYTICS_ID),
    'import.meta.env.VITE_MICROSOFT_CLARITY_ID': JSON.stringify(process.env.VITE_MICROSOFT_CLARITY_ID),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
