import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { generateRouteHtmlPlugin } from './scripts/generate-routes.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), generateRouteHtmlPlugin()],
})
