import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // Fix CSS minification issues
    postcss: {
      plugins: []
    },
    preprocessorOptions: {
      scss: {
        additionalData: ''
      }
    }
  },
  build: {
    // Using default CSS minifier
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  }
})
