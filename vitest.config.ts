import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    env: {
      DATABASE_URL: 'file:./prisma/test.db',
    },
    testTimeout: 15000,
    // All integration tests share one SQLite file via better-sqlite3;
    // concurrent workers cause file-lock contention against it.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
