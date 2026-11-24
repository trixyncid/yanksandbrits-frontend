// Fails the Vercel production build if vercel.json still rewrites /api to the staging backend
// (the host is hard-coded per branch, so a staging merge can carry it into production).
import { readFileSync } from 'node:fs'

const { rewrites = [] } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const staging = rewrites.filter((r) => r.destination.includes('staging'))

if (process.env.VERCEL_ENV === 'production' && staging.length) {
  console.error(`vercel.json points production at a staging backend: ${staging[0].destination}`)
  process.exit(1)
}
