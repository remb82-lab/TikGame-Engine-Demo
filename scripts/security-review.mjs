import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = new URL('../', import.meta.url).pathname
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', '.vite'])
const ignoredFiles = new Set(['scripts/security-review.mjs'])
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.yml', '.yaml', '.html', '.css', '.txt'])

const forbidden = [
  ['GitHub classic token', /ghp_[A-Za-z0-9]{30,}/g],
  ['GitHub fine-grained token', /github_pat_[A-Za-z0-9_]{30,}/g],
  ['OpenAI-style secret', /sk-[A-Za-z0-9_-]{20,}/g],
  ['Google API key', /AIza[0-9A-Za-z_-]{30,}/g],
  ['JWT-like credential', /eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}/g],
  ['Private source repository', new RegExp(['TikGame-Engine', 'APP'].join('-'), 'g')],
  ['Private Factory marker', new RegExp(['AI-Software', 'Factory'].join('-'), 'g')],
  ['Supabase project URL', /https:\/\/[a-z0-9]{15,}\.supabase\.co/gi],
]

const findings = []

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full)
      continue
    }
    const rel = relative(root, full).replaceAll('\\', '/')
    if (ignoredFiles.has(rel)) continue
    const ext = entry.name.includes('.') ? `.${entry.name.split('.').pop()}` : ''
    if (!textExtensions.has(ext) && !['LICENSE'].includes(entry.name)) continue
    const content = await readFile(full, 'utf8')
    for (const [label, pattern] of forbidden) {
      pattern.lastIndex = 0
      if (pattern.test(content)) findings.push(`${label}: ${rel}`)
    }
  }
}

await walk(root)

if (findings.length) {
  console.error('SECURITY REVIEW: FAILED')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('SECURITY REVIEW: GREEN')
console.log('No credential patterns, private source repo markers, private Factory markers, or Supabase project URLs detected.')
