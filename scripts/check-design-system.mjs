import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(repositoryRoot)

const failures = []
const tokenFile = 'src/styles/corporate-design-system.css'
const requiredFiles = [
  tokenFile,
  'src/Components/Layouts/Navbar.tsx',
  'src/Components/Layouts/Footer.tsx',
  'src/Components/components/Button.tsx',
  'src/Components/ui/button.tsx',
  'docs/design-system.md',
]

const requiredTokens = [
  '--brand-canvas: #080808;',
  '--brand-ink: #f7f8fa;',
  '--brand-accent: #ffd700;',
  '--container-width: 1280px;',
  '--header-height: 76px;',
]

const allowedRawButtonFiles = new Set([
  'src/Components/Layouts/Navbar.tsx',
  'src/Components/components/Button.tsx',
  'src/Components/ui/button.tsx',
])

const runGit = (args) => {
  try {
    return execFileSync('git', args, {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

for (const file of requiredFiles) {
  if (!existsSync(resolve(repositoryRoot, file))) {
    failures.push(`${file}: required design-system file is missing`)
  }
}

if (existsSync(resolve(repositoryRoot, tokenFile))) {
  const tokens = readFileSync(resolve(repositoryRoot, tokenFile), 'utf8')
  for (const token of requiredTokens) {
    if (!tokens.includes(token)) {
      failures.push(`${tokenFile}: required token is missing or changed: ${token}`)
    }
  }
}

const requiredSignatures = [
  ['src/main.tsx', "import './styles/corporate-design-system.css'"],
  ['src/App.tsx', 'className="marketing-route"'],
  ['src/Components/Layouts/Navbar.tsx', 'button--primary'],
  ['src/Components/Layouts/Footer.tsx', 'button--primary'],
  ['src/Components/components/Button.tsx', 'button button--primary'],
  ['src/Components/ui/button.tsx', "cva('button'"],
]

for (const [file, signature] of requiredSignatures) {
  const absolutePath = resolve(repositoryRoot, file)
  if (!existsSync(absolutePath) || !readFileSync(absolutePath, 'utf8').includes(signature)) {
    failures.push(`${file}: canonical design-system signature is missing: ${signature}`)
  }
}

let baseCommit = ''
const baseBranch = process.env.GITHUB_BASE_REF

if (baseBranch) {
  baseCommit = runGit(['merge-base', 'HEAD', `origin/${baseBranch}`])
  if (!baseCommit) {
    baseCommit = runGit(['merge-base', 'HEAD', baseBranch])
  }
}

if (!baseCommit) {
  baseCommit = runGit(['rev-parse', 'HEAD^'])
}

const addedLines = []

if (baseCommit) {
  const diff = runGit(['diff', '--unified=0', '--no-color', `${baseCommit}...HEAD`, '--', 'src'])
  let currentFile = ''
  let currentLine = 0

  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      currentFile = line.slice(6)
      continue
    }

    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)(?:,\d+)?/)
      currentLine = match ? Number(match[1]) : 0
      continue
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      addedLines.push({ file: currentFile, line: currentLine, text: line.slice(1) })
      currentLine += 1
      continue
    }

    if (!line.startsWith('-')) {
      currentLine += 1
    }
  }
}

const literalColor = /(?:#(?:[0-9a-f]{3,8})\b|rgba?\(|hsla?\()/i
const tailwindColor = /(?:bg|text|border|ring|outline|fill|stroke|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}/
const arbitraryColor = /(?:bg|text|border|ring|outline|fill|stroke|from|via|to)-\[\s*#/
const inlineVisualStyle = /style=\{\{[^}]*\b(?:color|background|borderRadius|fontFamily|boxShadow)\b/
const fontDeclaration = /(?:font-family\s*:|fontFamily\s*:)/
const arbitraryGeometry = /(?:rounded-(?:full|2xl|3xl)|(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-[xy])-\[[^\]]+\])/

for (const addition of addedLines) {
  const source = addition.text.trim()
  if (!source || source.startsWith('//') || source.startsWith('/*') || source.startsWith('*')) {
    continue
  }

  const location = `${addition.file}:${addition.line}`

  if (addition.file !== tokenFile && literalColor.test(source)) {
    failures.push(`${location}: use a semantic token instead of a literal color`)
  }

  if (tailwindColor.test(source) || arbitraryColor.test(source)) {
    failures.push(`${location}: color utility bypasses the Codestra semantic token layer`)
  }

  if (inlineVisualStyle.test(source)) {
    failures.push(`${location}: inline visual styling is not permitted`)
  }

  if (addition.file !== tokenFile && fontDeclaration.test(source)) {
    failures.push(`${location}: typography must come from the design-system token layer`)
  }

  if (source.includes('<button') && !allowedRawButtonFiles.has(addition.file)) {
    failures.push(`${location}: use the canonical Button component instead of a raw <button>`)
  }

  if (arbitraryGeometry.test(source)) {
    failures.push(`${location}: arbitrary radius or spacing bypasses the layout scale`)
  }
}

if (failures.length > 0) {
  console.error('\nCodestra design-system guard failed:\n')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  console.error('\nUse docs/design-system.md and src/styles/corporate-design-system.css as the source of truth.\n')
  process.exit(1)
}

const checkedFiles = new Set(addedLines.map(({ file }) => file).filter(Boolean)).size
console.log(`Codestra design-system guard passed. ${checkedFiles} changed source file(s) checked.`)
