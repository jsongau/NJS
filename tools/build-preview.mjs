#!/usr/bin/env node
// Builds a single self-contained preview of /studio that opens from disk:
//   node tools/build-preview.mjs <out.html>
// Inlines studio.css, the public catalog, projects.json and every studio module. Each module
// is wrapped in its own scope, so the page code is the same code that ships, unchanged.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const A = join(ROOT, 'assets/studio');
const ORDER = ['engine', 'util', 'icons', 'store', 'configurator', 'care', 'summary', 'endings', 'delivered', 'blueprint', 'plans', 'madlib', 'main'];

function wrap(name, src) {
  const exported = [];
  let body = src.replace(/^import\s*\{([^}]+)\}\s*from\s*'\.\/([a-z-]+)\.js';\s*$/gm, (_, names, mod) => {
    if (!ORDER.includes(mod)) throw new Error('unknown module ' + mod + ' in ' + name);
    return 'const {' + names + '} = __m_' + mod + ';';
  });
  if (/^import\s/m.test(body)) throw new Error('unsupported import form in ' + name);
  body = body.replace(/^export\s+(async\s+function|function|const|let)\s+([A-Za-z_$][\w$]*)/gm, (_, kind, id) => { exported.push(id); return kind + ' ' + id; });
  if (/^export\s/m.test(body)) throw new Error('unsupported export form in ' + name);
  return 'const __m_' + name + ' = (() => {\n' + body + '\nreturn { ' + exported.join(', ') + ' };\n})();\n';
}

export function buildPreview() {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const css = readFileSync(join(A, 'studio.css'), 'utf8');
  const catalog = readFileSync(join(A, 'data/studio-catalog.public.json'), 'utf8');
  const projects = readFileSync(join(A, 'data/projects.json'), 'utf8');
  const js = ORDER.map((m) => wrap(m, readFileSync(join(A, m + '.js'), 'utf8'))).join('\n');
  const safe = (s) => s.replace(/<\//g, '<\\/');
  let out = html
    .replace('<link rel="stylesheet" href="/assets/studio/studio.css">', () => '<style>\n' + css + '</style>')
    .replace('<script type="module" src="/assets/studio/main.js"></script>\n', '')
    .replace('<title>', '<!-- Preview build: one file, CSS, JS and JSON inlined from the NJS repo layout. -->\n<title>');
  out = out.replace('</body>', () =>
    '<script type="application/json" id="studio-catalog-data">' + safe(catalog) + '</script>\n' +
    '<script type="application/json" id="studio-projects-data">' + safe(projects) + '</script>\n' +
    '<script type="module">\n' + safe(js) + '</script>\n</body>');
  if (out.includes('src="/assets/studio/main.js"') || out.includes('href="/assets/studio/studio.css"')) throw new Error('inlining failed');
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const outPath = process.argv[2];
  if (!outPath) { console.error('usage: node tools/build-preview.mjs <out.html>'); process.exit(1); }
  const out = buildPreview();
  writeFileSync(outPath, out);
  console.log('Wrote ' + outPath + ' (' + Math.round(out.length / 1024) + ' KB)');
}
