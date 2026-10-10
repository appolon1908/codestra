import { gzipSync } from 'node:zlib'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const distDirectory = path.join(process.cwd(), 'dist')
const indexPath = path.join(distDirectory, 'en', 'index.html')
const html = await readFile(indexPath, 'utf8')

const fail = (message) => {
  console.error(`PERFORMANCE_BUDGET_FAILED: ${message}`)
  process.exitCode = 1
}

if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html)) {
  fail('the initial document loads a remote Google font')
}

const assetReferences = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+\.(?:js|css))[^\"]*"/g)]
  .map((match) => match[1])
const uniqueAssets = [...new Set(assetReferences)]

if (uniqueAssets.length === 0) fail('no initial JavaScript or CSS assets were found')

const assets = []
for (const reference of uniqueAssets) {
  const bytes = await readFile(path.join(distDirectory, reference.replace(/^\//, '')))
  assets.push({
    path: reference,
    type: reference.endsWith('.css') ? 'css' : 'js',
    rawBytes: bytes.byteLength,
    gzipBytes: gzipSync(bytes, { level: 9 }).byteLength,
  })
}

const sum = (type, field) => assets
  .filter((asset) => asset.type === type)
  .reduce((total, asset) => total + asset[field], 0)

const initialJavaScriptGzip = sum('js', 'gzipBytes')
const initialCssGzip = sum('css', 'gzipBytes')
const initialTotalGzip = initialJavaScriptGzip + initialCssGzip
const htmlBytes = Buffer.byteLength(html)

const budgets = {
  initialJavaScriptGzip: 230 * 1024,
  initialCssGzip: 70 * 1024,
  initialTotalGzip: 280 * 1024,
  htmlBytes: 40 * 1024,
}

if (initialJavaScriptGzip > budgets.initialJavaScriptGzip) fail(`initial JavaScript is ${initialJavaScriptGzip} bytes gzip; budget is ${budgets.initialJavaScriptGzip}`)
if (initialCssGzip > budgets.initialCssGzip) fail(`initial CSS is ${initialCssGzip} bytes gzip; budget is ${budgets.initialCssGzip}`)
if (initialTotalGzip > budgets.initialTotalGzip) fail(`initial JS+CSS is ${initialTotalGzip} bytes gzip; budget is ${budgets.initialTotalGzip}`)
if (htmlBytes > budgets.htmlBytes) fail(`index HTML is ${htmlBytes} bytes; budget is ${budgets.htmlBytes}`)

const report = {
  checkedAt: new Date().toISOString(),
  budgets,
  actual: { initialJavaScriptGzip, initialCssGzip, initialTotalGzip, htmlBytes },
  initialAssets: assets,
}

await writeFile(path.join(distDirectory, 'performance-budget.json'), JSON.stringify(report, null, 2))
if (process.exitCode) process.exit(process.exitCode)

console.log(`Performance budgets passed: JS ${initialJavaScriptGzip} B gzip, CSS ${initialCssGzip} B gzip, total ${initialTotalGzip} B gzip.`)
