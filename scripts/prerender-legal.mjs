/** Static policy bodies from the same content used by React; no extra framework. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const content = JSON.parse(await readFile('src/Pages/Legal/legalContent.json', 'utf8'));
const shell = await readFile('dist/index.html', 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
if (!shell.includes('<div id="root"></div>')) throw new Error('Unexpected application root; policy generation stopped');
for (const kind of ['privacy', 'terms']) {
  const page = content[kind];
  const sections = page.sections.map(section => `<section class="mb-6"><h2 class="mb-3 text-xl">${escape(section.heading)}</h2>${section.paragraphs.map(text => `<p class="mb-4">${escape(text)}</p>`).join('')}</section>`).join('');
  const body = `<main class="mx-auto max-w-4xl px-6 pt-40 pb-12 text-sm leading-7"><a class="underline" href="/">${escape(content.business)} — Home</a><h1 class="mb-6 text-3xl">${escape(page.title)}</h1><p class="mb-4">${escape(page.intro)}</p><p class="mb-6">Last updated: ${escape(content.updated)}.</p>${sections}<address class="not-italic">${escape(content.business)}<br><a href="mailto:${escape(content.email)}">${escape(content.email)}</a><br><a href="${escape(content.phoneHref)}">${escape(content.phone)}</a></address><nav aria-label="Policy and company links"><a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms &amp; Conditions</a> | <a href="/contact">Contact</a> | <a href="/about">About</a> | <a href="/services">Services</a></nav></main>`;
  const html = shell.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)} | ${escape(content.business)}</title>`).replace('</head>', `<link rel="canonical" href="https://codestra.co/${kind}"></head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  await mkdir(`dist/${kind}`, {recursive:true});
  await writeFile(`dist/${kind}/index.html`, html);
  console.log(`Generated /${kind}: accessible without JavaScript`);
}
