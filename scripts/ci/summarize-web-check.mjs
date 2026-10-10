import { appendFileSync, existsSync, readFileSync } from 'node:fs';
const mode = process.argv[2];
if (!['browser', 'lighthouse'].includes(mode)) throw new Error('Unknown check');
const read = (file) => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
const clean = (text) => String(text).replace(/\u001b\[[0-9;]*m/g, '').replace(/(bearer\s+|(?:token|password|secret|authorization)[=:]\s*)[^\s]+/gi, '$1[REDACTED]').replace(/https?:\/\/[^\s)]+/g, (url) => { try { const value = new URL(url); return value.origin + value.pathname; } catch { return '[URL]'; } }).replace(/```/g, "'''").slice(0, 3000);
const lines = [`### ${mode} diagnostics`];
if (mode === 'browser') {
  const report = read('test-results/results.json');
  const visit = (suite) => { for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) for (const result of test.results ?? []) if (['failed', 'timedOut', 'interrupted'].includes(result.status)) lines.push(clean(`${test.projectName}: ${spec.title}: ${result.status}`), ...((result.errors ?? []).map((error) => clean(error.message ?? 'Unknown error')))); for (const child of suite.suites ?? []) visit(child); };
  if (report) { visit(report); lines.push(clean(JSON.stringify(report.stats))); } else lines.push('JSON report unavailable; inspect startup output below.');
} else {
  const assertions = read('.lighthouseci/assertion-results.json');
  if (assertions) for (const item of assertions) if (item.passed === false) lines.push(clean(JSON.stringify(item)));
  const manifest = read('.lighthouseci/manifest.json');
  if (manifest) for (const item of manifest) lines.push(clean(`${item.url}: ${JSON.stringify(item.summary)}`)); else lines.push('Lighthouse reports unavailable; inspect startup output below.');
}
const log = `/tmp/codestra-${mode}.log`;
if (existsSync(log)) lines.push('```text', clean(readFileSync(log, 'utf8').split('\n').slice(-40).join('\n')), '```');
const output = lines.join('\n\n') + '\n';
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, output); else process.stdout.write(output);

if (process.argv[3] === 'failure') {
  const annotation = clean(lines.slice(1).join(' | ')).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  process.stdout.write(`::error title=${mode} diagnostics::${annotation}\n`);
}
