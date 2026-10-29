import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Vitest (npm test / npm run coverage). https://vitest.dev/config/
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // Tests run in mock mode, so no API is needed. (Vitest uses mode "test",
    // which ignores .env.development.local; this makes the choice explicit.)
    env: { VITE_USE_MOCKS: 'true' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/test/**', 'src/**/*.test.{js,jsx}'],
    },
  },
})
