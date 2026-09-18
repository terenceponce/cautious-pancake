import { defineConfig } from '@playwright/test'

// Wide-open active window and a known STOCK (3) so the serial suite can walk
// the store from full to empty deterministically.
const now = Date.now()
const serverEnv = {
  ...process.env,
  STORE: 'memory',
  SALE_START: new Date(now - 60 * 60_000).toISOString(),
  SALE_END: new Date(now + 60 * 60_000).toISOString(),
  STOCK: '3',
  PORT: '3000',
}

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: { baseURL: 'http://localhost:5173' },
  webServer: [
    {
      command: 'node ../server/dist/server.js',
      url: 'http://localhost:3000/health',
      env: serverEnv,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  ],
})
