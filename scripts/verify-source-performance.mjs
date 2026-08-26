import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const [home, css, index] = await Promise.all([
  read('src/Pages/Home/Home.tsx'),
  read('src/index.css'),
  read('index.html'),
])

const failures = []
if (/Rectangle\.png|bg\.png|services\.png/.test(home)) failures.push('homepage imports a legacy large image')
if (/@import\s+url\(/.test(css)) failures.push('CSS loads a render-blocking remote font or stylesheet')
if (!index.includes('meta name="description"')) failures.push('index.html is missing a description')
if (!index.includes('rel="canonical"')) failures.push('index.html is missing a canonical URL')
if (!home.includes('id="main-content"')) failures.push('homepage is missing the main-content landmark')

if (failures.length) throw new Error(`Source performance/SEO validation failed:\n- ${failures.join('\n- ')}`)
console.log('Source performance/SEO checks: PASS')
