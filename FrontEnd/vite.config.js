import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Redirect any imports of 'react-i18next' to our shim so we can remove the dependency
      'react-i18next': path.resolve(__dirname, 'src/i18nShim.js')
    }
  }
  ,
  server: {
    // Dev proxy to avoid cross-origin cookie issues during local development
    proxy: {
      // Proxy API calls to backend running on port 3000
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/map-locations': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
      '/upload': 'http://localhost:3000',
      '/timeline': 'http://localhost:3000',
      '/gallery': 'http://localhost:3000',
      '/categories': 'http://localhost:3000',
      '/comments': 'http://localhost:3000',
      '/articles_post': 'http://localhost:3000',
    },
  },
})
