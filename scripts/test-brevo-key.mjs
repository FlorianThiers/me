import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFile = path.join(root, '.env')

function loadEnv(filePath) {
  const out = {}
  if (!fs.existsSync(filePath)) return out
  for (const raw of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const env = loadEnv(envFile)
const apiKey = env.BREVO_API_KEY?.trim()
const mcpToken = env.BREVO_MCP_TOKEN?.trim()

if (!apiKey) {
  console.error('FAIL: BREVO_API_KEY missing in .env')
  process.exit(1)
}

const res = await fetch('https://api.brevo.com/v3/account', {
  headers: { 'api-key': apiKey },
})
const body = await res.json().catch(() => ({}))

if (res.ok) {
  console.log('OK: BREVO_API_KEY valid')
  console.log('    account:', body.email || body.companyName || '(connected)')
} else {
  console.error('FAIL: BREVO_API_KEY rejected:', res.status, body.message || body.code || res.statusText)
  process.exit(1)
}

if (mcpToken) {
  const endsOk = mcpToken.endsWith('==') || mcpToken.endsWith('=')
  console.log('OK: BREVO_MCP_TOKEN loaded,', mcpToken.length, 'chars', endsOk ? '(padding intact)' : '')
} else {
  console.log('SKIP: BREVO_MCP_TOKEN not set (MCP only)')
}
