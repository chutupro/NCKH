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
})
