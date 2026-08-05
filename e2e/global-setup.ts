import { execSync } from 'child_process'

// Reseeds dev.db before the E2E run so tests have deterministic, known
// accounts to log in with (admin@prodance.com/admin123,
// alice@example.com/alice123, etc.) — per TESTING.md, "Every test starts
// from a clean state."
export default function globalSetup() {
  execSync('npx prisma db seed', { stdio: 'inherit' })
}
