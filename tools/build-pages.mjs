#!/usr/bin/env node
// Builds the NJS Studio pages from one set of section partials.
//   node tools/build-pages.mjs          write every page and sitemap.xml
//   node tools/build-pages.mjs --check  fail if a committed page is stale
//
// Every section lives once in partials/studio/<name>.html. A page is a short template in
// partials/studio/pages/<page>.html made of <!--@name--> lines (a whole line, replaced by that
// partial, recursively) and {{var}} values from PAGES below. Pages are plain static files, so
// Vercel serves them with no build step; this tool runs on the Mac before a commit.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = join(ROOT, 'partials/studio');
export const SITE = 'https://nathanjsong.com';

const FAQ = JSON.parse(readFileSync(join(P, 'faq.json'), 'utf8'));
const GOALS = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/goals.json'), 'utf8'));
const PROJECTS = JSON.parse(readFileSync(join(ROOT, 'assets/studio/data/projects.json'), 'utf8')).projects;

const ORG = {
  '@type': 'ProfessionalService', '@id': SITE + '/#studio', name: 'NJS Studio', url: SITE + '/',
  description: 'Websites, customer portals and AI agents for local businesses, built by Nathan J. Song.',
  founder: { '@type': 'Person', name: 'Nathan J. Song', url: SITE + '/resume' },
  address: { '@type': 'PostalAddress', addressLocality: 'Brea', addressRegion: 'CA', addressCountry: 'US' },
  areaServed: 'Orange County, California',
};
const ld = (type, extra) => ({ '@context': 'https://schema.org', '@type': type, ...extra });

export const PAGES = {
  home: {
    out: 'index.html', path: '/', nav: null,
    title: 'NJS Studio · Build your project · Nathan J. Song',
    description: "NJS Studio is Nathan J. Song's build practice in Brea, California. Pick your business and the features it needs, watch your plan fill in, then book a call or send the plan.",
    og_title: 'NJS Studio · Websites, portals and AI agents',
    og_description: "Tell me what you run. I'll show you what to build. Websites, customer portals and AI agents for local businesses, by Nathan J. Song in Orange County.",
    skip_href: '#build', skip_text: 'Skip to the configurator',
    jsonld: { '@context': 'https://schema.org', ...ORG },
  },
  plans: {
    out: 'plans/index.html', path: '/plans', nav: 'plans', h1: 'pl-h',
    title: 'Plans · Basic, Premium and Partner · NJS Studio',
    description: 'Three ways to work with Nathan J. Song: a hosted website that ranks nearby, a system your customers log in to and pay through, or a partner running AI agents in your back office.',
    og_title: 'NJS Studio plans: a website, a system, or me alongside you',
    og_description: 'Basic, Premium and Partner plans for local businesses in Orange County. Every plan starts with a short audit and ends with something live.',
    skip_href: '#pricing', skip_text: 'Skip to the plans',
    jsonld: [
      ld('Service', { name: 'Websites, customer portals and AI agents', provider: { '@id': ORG['@id'] }, areaServed: ORG.areaServed,
        hasOfferCatalog: { '@type': 'OfferCatalog', name: 'NJS Studio plans', itemListElement: ['Basic', 'Premium', 'Partner'].map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } })) } }),
      ld('FAQPage', { mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }),
    ],
  },
  build: {
    out: 'build/index.html', path: '/build', nav: 'build', h1: 'b-h',
    title: 'Build your project · NJS Studio',
    description: 'Pick your business and what it should do, watch your plan and timeline fill in, then send the plan or request a 20-minute call with Nathan J. Song.',
    og_title: 'Build your project with NJS Studio',
    og_description: 'A two-minute configurator for websites, customer portals and AI agents. Send the plan, get times for your first audit session.',
    skip_href: '#build', skip_text: 'Skip to the configurator',
    jsonld: ld('WebPage', { name: 'Build your project', about: { '@id': ORG['@id'] } }),
  },
  work: {
    out: 'work/index.html', path: '/work', nav: 'work', h1: 'd-h',
    title: 'Delivered projects · Every feature shipped · NJS Studio',
    description: 'Boba Night, CoverCapy, PM Countdown and BoxVacay: products Nathan J. Song designed, built and still runs, with every shipped feature listed and checked.',
    og_title: 'Delivered by NJS Studio: every feature shipped, still live',
    og_description: 'Four live products with their features, numbers and sources. Client projects join the wall as they ship.',
    skip_href: '#delivered', skip_text: 'Skip to the projects',
    jsonld: ld('ItemList', { name: 'Delivered projects', itemListElement: PROJECTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'CreativeWork', name: p.name, url: p.url, description: p.sub, creator: { '@id': ORG['@id'] } } })) }),
  },
  care: {
    out: 'care/index.html', path: '/care', nav: 'care',
    title: 'Care plans · Hosting, Care and Partner · NJS Studio',
    description: 'Who looks after your site once it is live: hosting and backups, payment and AI helper checks, or a nightly review loop. Month to month, accounts in your name.',
    og_title: 'NJS Studio care plans: keep it running',
    og_description: 'Hosting, Care and Partner plans, month to month. Platform bills go to you directly with no markup.',
    skip_href: '#care', skip_text: 'Skip to the care plans',
    jsonld: ld('Service', { name: 'Website and AI agent care plans', provider: { '@id': ORG['@id'] }, areaServed: ORG.areaServed }),
  },
  crew: {
    out: 'crew/index.html', path: '/crew', nav: 'crew', h1: 'w-h',
    title: 'The crew · One lead, five AI agents · NJS Studio',
    description: 'You work with Nathan J. Song from the first call to the hand off. Behind him is a crew of AI agents he directs and checks, each on written rules.',
    og_title: 'NJS Studio: one lead, five AI agents',
    og_description: 'How the crew works, how every change is checked, and how a project runs from audit to hand off.',
    skip_href: '#crew', skip_text: 'Skip to the crew',
    jsonld: ld('AboutPage', { name: 'The crew', mainEntity: { '@type': 'Person', name: 'Nathan J. Song', url: SITE + '/resume', worksFor: { '@id': ORG['@id'] } } }),
  },
  fitness: {
    out: 'fitness/index.html', path: '/fitness', nav: null, mode: 'fitness',
    title: 'NJS Fitness · Kickboxing, yoga and Pilates coaching in Orange County · Nathan J. Song',
    description: 'Kickboxing, yoga and reformer Pilates coaching with Nathan J. Song in Brea, Rancho Santa Margarita and Corona. Pick your goal and request a private session.',
    og_title: 'NJS Fitness: a strong mind needs a strong body',
    og_description: 'Pick a goal, from your first 5K to an amateur fight, and see how Nathan J. Song would train you for it. Orange County and the Inland Empire.',
    skip_href: '#goals', skip_text: 'Skip to the goals',
    jsonld: [
      ld('ProfilePage', { mainEntity: { '@type': 'Person', '@id': SITE + '/fitness#coach', name: 'Nathan J. Song', jobTitle: 'Kickboxing, yoga and reformer Pilates coach',
        knowsAbout: ['Kickboxing', 'Yoga', 'Reformer Pilates', 'Mobility', 'Conditioning'], url: SITE + '/fitness',
        areaServed: ['Brea, CA', 'Rancho Santa Margarita, CA', 'Corona, CA', 'Orange County, California', 'Inland Empire, California'] } }),
      ld('Service', { name: 'Private kickboxing, yoga and Pilates coaching', provider: { '@id': SITE + '/fitness#coach' }, areaServed: 'Orange County and the Inland Empire, California',
        hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Fitness goals', itemListElement: GOALS.map(([, n]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } })) } }),
    ],
  },
};
for (const [id, p] of Object.entries(PAGES)) p.id = id;

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function renderFaq() {
  return ['<section class="sec faq" id="faq" aria-labelledby="faq-h">', '  <div class="wrap">',
    '    <div class="sec-h"><div><span class="kick">Questions</span><h2 id="faq-h">What it costs, how long it takes, who owns it.</h2></div><p>Straight answers before the call. Anything missing, ask me on it.</p></div>',
    '    <div class="faq-list">',
    ...FAQ.map(([q, a]) => '      <details><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>'),
    '    </div>', '  </div>', '</section>'].join('\n');
}

// Fitness goals: one card per goal, from partials/fitness/goals.json. Icons by Agent Goldsmith:
// 32 grid, 2px strokes, one flat accent shape (.a), same language as the studio icons.
const GI = (b) => '<svg class="gi" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + b + '</svg>';
const GOAL_ICONS = {
  run5k: '<circle class="a" cx="20" cy="6.5" r="3" stroke="none"/><circle cx="19" cy="5.5" r="2.6"/><path d="M12 13l4-3 4 2 3 4M16 10l-2 8 5 3v7M14 18l-4 4H5"/>',
  run10k: '<path class="a" d="M5 26c6-1 9-5 11-10s5-9 11-10" stroke="none" opacity="0"/><path d="M4 27c6-1 9-5 11-10s5-9 12-10"/><circle class="a" cx="27" cy="7" r="3" stroke="none"/><circle cx="4" cy="27" r="1.6" fill="currentColor" stroke="none"/><path d="M10 7h4M12 5v4" stroke-width="1.6"/>',
  fight: '<rect class="a" x="11" y="22" width="13" height="7" rx="1.5" stroke="none"/><rect x="9" y="4" width="16" height="16" rx="6"/><path d="M9 14c-3 0-4 4-1 5.5"/><rect x="10" y="20" width="14" height="7.5" rx="1.5"/><path d="M27 4l3-2M28 8h3" stroke-width="1.6"/>',
  strike: '<circle class="a" cx="21" cy="16" r="7" stroke="none"/><circle cx="20" cy="15" r="8"/><circle cx="20" cy="15" r="3.5"/><path d="M2 15h6M4 10l4 2M4 20l4-2"/>',
  grapple: '<path class="a" d="M10 12c3 4 9 4 12 0l3 6c-5 5-13 5-18 0z" stroke="none"/><path d="M6 18c5 5 15 5 20 0M9 12c3 4 11 4 14 0M8 8l-3 4 3 6M24 8l3 4-3 6"/><path d="M13 23v4M19 23v4"/>',
  energy: '<path class="a" d="M18.5 3.5L8.5 17.5h7L14.5 28.5l10-14h-7z" stroke="none" transform="translate(1 .5)"/><path d="M17.5 3L7.5 17h7l-1 11 10-14h-7z"/>',
  weight: '<path class="a" d="M8 12h16l2 15H6z" stroke="none" opacity=".9"/><path d="M7 11h18l2.4 17H4.6zM12 11a4 4 0 0 1 8 0"/><path d="M13 20l3-3 3 3" stroke-width="1.8"/>',
  injury: '<path class="a" d="M16 4.5v22c-4.5-2-8.5-5.5-8.5-11.5V8z" stroke="none"/><path d="M16 3l10 4v8c0 7-4.5 11-10 13-5.5-2-10-6-10-13V7z"/><path d="M12 15h8M16 11v8"/>',
  strong: '<rect class="a" x="4.5" y="9" width="5" height="14" rx="1.6" stroke="none"/><rect x="4.5" y="9" width="5" height="14" rx="1.6"/><rect x="22.5" y="9" width="5" height="14" rx="1.6"/><path d="M9.5 16h13M2 12.5v7M30 12.5v7"/>',
  desk: '<rect class="a" x="6" y="6" width="20" height="13" rx="2" stroke="none" opacity=".35"/><rect x="5" y="5" width="22" height="14" rx="2"/><path d="M12 27h8M16 19v8"/><path d="M11 13c2-3 8-3 10 0" stroke-width="1.8"/>',
};
function renderGoals() {
  const card = ([id, name, how, tags, who], i) => '      <button type="button" class="fx-goal" data-goal="' + id + '" aria-pressed="false" style="--i:' + i + '">' +
    '<span class="fx-gi">' + GI(GOAL_ICONS[id]) + '</span><b>' + esc(name) + '</b><span class="fx-how">' + esc(how) + '</span>' +
    '<span class="fx-tags">' + tags.map((t) => '<i>' + esc(t) + '</i>').join('') + '</span><em>' + esc(who) + '</em></button>';
  return ['<section class="sec fx-goals" id="goals" aria-labelledby="fg-h">', '  <div class="wrap">',
    '    <div class="sec-h"><div><span class="kick">What do you want your body to do?</span><h2 id="fg-h">Pick a goal.</h2></div><p>Each one shows how I\'d train you for it, and says plainly which parts I coach myself.</p></div>',
    '    <div class="fx-goal-grid">', ...GOALS.map(card), '    </div>',
    '    <div class="fx-pick" id="fx-pick" aria-live="polite"><p>Pick a goal above and I\'ll set up your request.</p><a class="btn btn-lime" href="#book">Request a private session</a></div>',
    '  </div>', '</section>'].join('\n');
}

export function sitemap() {
  const urls = Object.values(PAGES).map((p) => p.path).concat('/resume');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => '  <url><loc>' + SITE + (u === '/' ? '/' : u) + '</loc></url>').join('\n') + '\n</urlset>\n';
}

const PF = join(ROOT, 'partials/fitness');
const read = (name) => {
  let f = join(P, name + '.html');
  if (!existsSync(f)) f = join(PF, name + '.html');
  if (!existsSync(f)) throw new Error('missing partial ' + name);
  return readFileSync(f, 'utf8').replace(/\n$/, '');
};

function expand(text, seen = []) {
  return text.split('\n').map((line) => {
    const m = line.match(/^<!--@([a-z0-9-/]+)-->$/);
    if (!m) return line;
    if (m[1] === 'faq') return renderFaq();
    if (m[1] === 'fit-goals') return renderGoals();
    if (seen.includes(m[1])) throw new Error('include loop: ' + seen.concat(m[1]).join(' > '));
    return expand(read(m[1]), seen.concat(m[1]));
  }).join('\n');
}

export function renderPage(id) {
  const page = PAGES[id];
  const cur = Object.fromEntries(['plans', 'build', 'work', 'care', 'crew'].map((t) => ['cur_' + t, page.nav === t ? ' aria-current="page"' : '']));
  const fit = page.mode === 'fitness';
  const mode = { brand: fit ? 'NJS Fitness' : 'NJS Studio', mode: fit ? 'fitness' : 'business',
    biz_href: fit ? '/' : page.path, fit_href: '/fitness',
    biz_cur: fit ? '' : ' aria-current="true"', fit_cur: fit ? ' aria-current="true"' : '' };
  const vars = { ...page, ...cur, ...mode, jsonld: page.jsonld ? '<script type="application/ld+json">' + JSON.stringify(page.jsonld).replace(/</g, '\\u003c') + '</script>' : '' };
  let html = expand(read('pages/' + id), ['pages/' + id]);
  html = html.replace(/\{\{([a-z_]+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(id + ': no value for {{' + k + '}}');
    return String(vars[k]);
  });
  // Each tab page's first heading is its h1.
  if (page.h1) {
    const re = new RegExp('<h2 id="' + page.h1 + '">(.*?)</h2>');
    if (!re.test(html)) throw new Error(id + ': no h2#' + page.h1 + ' to promote');
    html = html.replace(re, '<h1 id="' + page.h1 + '">$1</h1>');
  }
  // An empty {{jsonld}} line leaves no blank line behind.
  return html.replace(/\n\n<\/head>/, '\n</head>') + '\n';
}

export function buildAll() {
  const out = {};
  for (const id of Object.keys(PAGES)) out[PAGES[id].out] = renderPage(id);
  out['sitemap.xml'] = sitemap();
  out['robots.txt'] = 'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n';
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const files = buildAll();
  let stale = 0;
  for (const [rel, html] of Object.entries(files)) {
    const f = join(ROOT, rel);
    const cur = existsSync(f) ? readFileSync(f, 'utf8') : null;
    if (cur === html) continue;
    if (check) { console.error('stale: ' + rel); stale++; continue; }
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, html);
    console.log('wrote ' + rel);
  }
  if (check && stale) process.exit(1);
  if (check) console.log('pages up to date');
}
