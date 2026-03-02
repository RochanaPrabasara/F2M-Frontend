import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // load env file based on `mode` (development, production, etc.)
  // the third argument '' makes all variables available without the VITE_ prefix check
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // base path for the frontend; useful when deploying to a sub‑directory
    base: env.VITE_BASE_PATH || '/',

    plugins: [
      react(),
      tailwindcss(),
    ],
  }
})
