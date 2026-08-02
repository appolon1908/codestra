import { spawnSync } from 'node:child_process'

const allowedAdvisories = new Set([
  // This Vite SPA does not use React Router RSC mode or server actions.
  'https://github.com/advisories/GHSA-qwww-vcr4-c8h2',
])

const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
})

if (!result.stdout) {
  process.stderr.write(result.stderr || 'npm audit returned no report\n')
  process.exit(1)
}

const report = JSON.parse(result.stdout)
const vulnerabilities = Object.values(report.vulnerabilities ?? {})
const advisoryUrls = vulnerabilities.flatMap((vulnerability) =>
  vulnerability.via
    .filter((item) => typeof item === 'object')
    .map((item) => item.url),
)
const unapproved = advisoryUrls.filter((url) => !allowedAdvisories.has(url))

if (unapproved.length > 0) {
  process.stderr.write(`Unapproved production advisories:\n${unapproved.join('\n')}\n`)
  process.exit(1)
}

if (advisoryUrls.length > 0) {
  process.stderr.write(
    `Allowed non-applicable advisory: ${[...new Set(advisoryUrls)].join(', ')}\n`,
  )
}
