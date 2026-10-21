import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // With VITE_API_BASE_URL=/api/v1 the browser calls the dev server, which
    // forwards to Django, so auth cookies stay first-party (like vercel.json).
    // 127.0.0.1 avoids other local servers that answer on localhost:8000.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
