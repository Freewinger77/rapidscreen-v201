import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// ES Module equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      'pages': path.resolve(__dirname, './src/pages'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '(components)': path.resolve(__dirname, './src/(components)'),
      // Alias retell-sdk to empty module for browser (it's server-side only)
      'retell-sdk': path.resolve(__dirname, './src/lib/retell-sdk-stub.ts'),
    }
  },
  optimizeDeps: {
    exclude: ['retell-sdk', 'retell-client-js-sdk'],
  },
})
