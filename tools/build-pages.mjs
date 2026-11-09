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
const FOCUS = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/focus.json'), 'utf8'));
const TECH = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/techniques.json'), 'utf8'));
const PROJECTS = JSON.parse(readFileSync(join(ROOT, 'assets/studio/data/projects.json'), 'utf8')).projects;

const ORG = {
  '@type': 'ProfessionalService', '@id': SITE + '/#studio', name: 'NJS Studio', url: SITE + '/',
  description: 'Websites, customer portals and AI agents for local businesses, built by Nathan J. Song.',
  founder: { '@type': 'Person', name: 'Nathan J. Song', url: SITE + '/resume' },
  address: { '@type': 'PostalAddress', addressLocality: 'Brea', addressRegion: 'CA', addressCountry: 'US' },
  areaServed: 'Orange County, California',
};
const ld = (type, extra) => ({ '@context': 'https://schema.org', '@type': type, ...extra });

// NJS Fitness: one coach entity shared by every fitness page.
const COACH = {
  '@type': 'Person', '@id': SITE + '/fitness#coach', name: 'Nathan J. Song', alternateName: 'Jiaming Song', jobTitle: 'Personal trainer',
  url: SITE + '/fitness/coach',
  knowsAbout: ['Personal training', 'Muscle building', 'Fat loss', 'Steel club training', 'Steel mace training', 'Boxing', 'Kickboxing', 'Muay Thai', 'Yoga', 'Reformer Pilates'],
  areaServed: ['Brea, CA', 'Rancho Santa Margarita, CA', 'Orange County, California'],
};
const crumbs = (slug, name) => ld('BreadcrumbList', { itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'Fitness', item: SITE + '/fitness' },
  { '@type': 'ListItem', position: 2, name, item: SITE + '/fitness/' + slug },
] });
function fitPage(slug, name, title, description, service, parent) {
  return {
    out: 'fitness/' + slug + '/index.html', path: '/fitness/' + slug, nav: null, mode: 'fitness',
    title, description, og_title: title.replace(/ · NJS Fitness$/, ''), og_description: description,
    skip_href: '#top', skip_text: 'Skip to the page',
    jsonld: service ? [ld('Service', { name: service, serviceType: service, provider: COACH, areaServed: 'Orange County, California', url: SITE + '/fitness/' + slug }), crumbs(slug, name)] : null,
  };
}

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
    title: 'Personal Trainer in Orange County · 12-Pack Training · NJS Fitness',
    description: 'Personal training with Nathan J. Song in Brea and Rancho Santa Margarita: muscle building, fat loss, steel clubs and maces, kickboxing and yoga. Train twice a week for six weeks.',
    og_title: 'NJS Fitness: a strong mind needs a strong body',
    og_description: 'Twelve sessions, twice a week, with a three-time SHRED winner. Book a Thursday hour in Brea or a weekday in Rancho Santa Margarita.',
    skip_href: '#packs', skip_text: 'Skip to the packs',
    jsonld: [
      ld('ProfilePage', { mainEntity: COACH }),
      ld('Service', { name: 'Personal training packs', serviceType: 'Personal training', provider: { '@id': COACH['@id'] }, areaServed: 'Orange County, California',
        hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Training packs', itemListElement: ['The 12-pack', 'The 2-pack'].map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } })) } }),
    ],
  },
  'fit-pt': fitPage('personal-training', 'Personal training', 'Personal Training for Muscle Building and Fat Loss in Orange County · NJS Fitness',
    'One on one personal training for muscle building and fat loss in Brea and Rancho Santa Margarita, with a three-time SHRED winner. Twice a week for six weeks.', 'Personal training'),
  'fit-clubs': fitPage('clubs-and-maces', 'Clubs and maces', 'Steel Club and Steel Mace Training in Orange County · NJS Fitness',
    'Learn the shield cast, the mill, the reverse mill and the mace 360 with coach Nathan J. Song. Steel clubs and maces for strong, durable shoulders and grip, in Orange County.', 'Steel club and steel mace training'),
  'fit-striking': fitPage('striking', 'Striking', 'Boxing, Kickboxing and Muay Thai Coach in Orange County · NJS Fitness',
    'Private boxing, kickboxing and Muay Thai with Nathan J. Song in Brea and Rancho Santa Margarita: focus mitts, speed paddles, Thai pads, setups and stance work.', 'Private boxing, kickboxing and Muay Thai'),
  'fit-boxing': fitPage('boxing', 'Boxing', 'Private Boxing Coach in Orange County · Focus Mitts and Speed Paddles · NJS Fitness',
    'One on one boxing with Nathan J. Song on focus mitts and speed paddles: stance, footwork, setups, combinations and defense. Brea and Rancho Santa Margarita.', 'Private boxing lessons'),
  'fit-kickboxing': fitPage('kickboxing', 'Kickboxing', 'Private Kickboxing Coach in Orange County · Thai Pads, Teeps and Setups · NJS Fitness',
    'One on one kickboxing with Nathan J. Song on Thai pads: the front teep, the round kick, switch kicks and the punches that set them up. Orange County.', 'Private kickboxing lessons'),
  'fit-muaythai': fitPage('muay-thai', 'Muay Thai', 'Private Muay Thai Coach in Orange County · NJS Fitness',
    'One on one Muay Thai with Nathan J. Song: teeps, round kicks, knees, elbows and the clinch on Thai pads. Brea and Rancho Santa Margarita, Orange County.', 'Private Muay Thai lessons'),
  'fit-yoga': fitPage('yoga-and-pilates', 'Yoga and Pilates', 'Private Yoga and Reformer Pilates in Orange County · NJS Fitness',
    'Private yoga with 400+ hours of training behind it, and reformer Pilates sessions while Nathan J. Song completes his certification. Orange County, at home or online.', 'Private yoga and reformer Pilates'),
  'fit-coach': {
    ...fitPage('coach', 'About Nathan', 'About Nathan J. Song, Personal Trainer in Orange County · NJS Fitness',
      'Nathan J. Song is a personal trainer in Orange County: three-time SHRED winner, steel clubs and maces coach, kickboxing and yoga. Classes in Brea and Rancho Santa Margarita.', null),
  },
  'fit-book': {
    ...fitPage('book', 'Book a time', 'Book a Personal Training Session · NJS Fitness',
      'Pick a 12-pack or a 2-pack and an open Thursday hour in Brea, or request a weekday in Rancho Santa Margarita, at home or online. Nathan confirms every booking by email.', null),
  },
};
PAGES['fit-coach'].jsonld = [ld('ProfilePage', { mainEntity: COACH }), crumbs('coach', 'About Nathan')];
PAGES['fit-book'].jsonld = [crumbs('book', 'Book a time')];
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


// Fitness focus areas: one list (partials/fitness/focus.json) drives the home picker and the booking form.
// Icons by Agent Goldsmith on a 64 grid, 2.5px strokes, coral accent shapes (.a). Each icon has one moving
// part; its transform-origin is the point it is attached at (the club at the shoulder, the flame at its base).
const FI = (b) => '<svg class="nf-fi" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + b + '</svg>';
const FOCUS_ICONS = {
  muscle: '<path d="M8 56h48" opacity=".35"/><g class="nf-a-lift"><rect class="a" x="10" y="22" width="8" height="20" rx="2" stroke="none"/><rect x="10" y="22" width="8" height="20" rx="2"/><rect class="a" x="46" y="22" width="8" height="20" rx="2" stroke="none"/><rect x="46" y="22" width="8" height="20" rx="2"/><path d="M18 32h28M5 27v10M59 27v10"/></g><path class="nf-a-spark" d="M32 8v6M24 11l3 4M40 11l-3 4"/>',
  'fat-loss': '<g class="nf-a-flick"><path class="a" d="M32 56c-9 0-14-6-14-13 0-8 7-12 8-20 5 4 6 8 6 12 2-2 3-5 3-8 6 5 11 10 11 17 0 7-5 12-14 12z" stroke="none" opacity=".9"/><path d="M32 58c-10 0-16-7-16-15 0-10 9-14 9-24 6 4 8 9 8 13 2-2 3-5 3-9 7 6 12 12 12 20 0 8-6 15-16 15z"/></g><path d="M26 50c0-4 3-6 6-9 3 3 6 5 6 9" opacity=".6"/>',
  shoulders: '<circle cx="32" cy="44" r="5"/><path d="M14 58c4-8 10-12 18-12s14 4 18 12" opacity=".5"/><path class="nf-a-trail" d="M14 22a20 20 0 0 1 36 0" stroke-dasharray="3 5" opacity=".5"/><g class="nf-a-swing"><path d="M32 44V16" stroke-width="3"/><circle class="a" cx="32" cy="11" r="6" stroke="none"/><circle cx="32" cy="11" r="6"/></g>',
  boxing: '<g class="nf-a-punch"><path class="a" d="M22 22h16a10 10 0 0 1 10 10v2a10 10 0 0 1-10 10H26a6 6 0 0 1-6-6V24z" stroke="none"/><path d="M20 20h18a12 12 0 0 1 12 12v2a12 12 0 0 1-12 12H26a8 8 0 0 1-8-8V22a2 2 0 0 1 2-2z"/><path d="M18 46v8h14v-8M32 20v8"/></g><g class="nf-a-fade"><path d="M4 26h8M2 34h10M4 42h8"/></g>',
  kickboxing: '<rect class="nf-a-hit a" x="44" y="14" width="12" height="36" rx="5" stroke="none"/><rect class="nf-a-hit" x="44" y="14" width="12" height="36" rx="5"/><path class="nf-a-draw" d="M8 54C14 40 24 32 40 30" stroke-dasharray="44" /><path d="M8 54l-2 4M8 54l5 1"/>',
  'muay-thai': '<rect x="48" y="12" width="10" height="40" rx="4"/><g class="nf-a-teep"><path d="M6 36h22"/><path class="a" d="M28 28h10a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6H28z" stroke="none"/><path d="M28 28h10a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6H28"/></g><path d="M6 46h14" opacity=".4"/>',
  conditioning: '<path class="a" d="M32 54S10 42 10 26a11 11 0 0 1 22-4 11 11 0 0 1 22 4c0 16-22 28-22 28z" stroke="none" opacity=".25"/><path d="M32 54S10 42 10 26a11 11 0 0 1 22-4 11 11 0 0 1 22 4c0 16-22 28-22 28z"/><path class="nf-a-pulse" d="M4 34h14l4-8 6 16 5-12 3 4h24" stroke-dasharray="80"/>',
  mobility: '<circle class="nf-a-breathe a" cx="32" cy="32" r="22" stroke="none" opacity=".22"/><circle cx="32" cy="14" r="5"/><path d="M32 19v18M32 37l-10 16M32 37l10 16M16 24l16 4 16-4"/>',
  pilates: '<path d="M6 46h52M10 46v8M54 46v8"/><path d="M12 40h40" opacity=".4"/><g class="nf-a-slide"><rect class="a" x="18" y="34" width="18" height="8" rx="2" stroke="none"/><rect x="18" y="34" width="18" height="8" rx="2"/></g><path d="M10 38c2-2 4 2 6 0" /><path d="M50 30v10M46 30h8"/>',
};

// Technique icons for the striking pages (same grid and stroke as the focus icons).
const TECH_ICONS = {
  mitt: '<g class="nf-a-hit"><ellipse class="a" cx="40" cy="30" rx="14" ry="17" stroke="none" opacity=".9"/><ellipse cx="40" cy="30" rx="14" ry="17"/><circle cx="40" cy="30" r="6"/></g><path d="M40 47v10"/><g class="nf-a-punch"><path d="M6 30h12"/><circle cx="21" cy="30" r="4"/></g>',
  paddle: '<g class="nf-a-hit"><rect class="a" x="34" y="8" width="12" height="30" rx="6" stroke="none"/><rect x="34" y="8" width="12" height="30" rx="6"/><path d="M40 38v18"/></g><g class="nf-a-fade"><path d="M10 20h12M8 28h14M10 36h12"/></g>',
  thaipad: '<g class="nf-a-hit"><rect class="a" x="14" y="12" width="36" height="16" rx="6" stroke="none"/><rect x="14" y="12" width="36" height="16" rx="6"/><rect x="14" y="32" width="36" height="16" rx="6"/></g><path d="M20 52h24M24 48v4M40 48v4"/>',
  setup: '<circle class="nf-a-seq1 a" cx="14" cy="32" r="7" stroke="none"/><circle cx="14" cy="32" r="7"/><circle class="nf-a-seq2 a" cx="32" cy="32" r="7" stroke="none"/><circle cx="32" cy="32" r="7"/><circle class="nf-a-seq3 a" cx="50" cy="32" r="7" stroke="none"/><circle cx="50" cy="32" r="7"/><path d="M21 32h4M39 32h4"/>',
  step: '<g class="nf-a-stepl"><path class="a" d="M18 40c-4 0-6-4-6-9s2-9 6-9 6 4 6 9-2 9-6 9z" stroke="none"/><path d="M18 40c-4 0-6-4-6-9s2-9 6-9 6 4 6 9-2 9-6 9z"/></g><g class="nf-a-stepr"><path d="M44 46c-4 0-6-4-6-9s2-9 6-9 6 4 6 9-2 9-6 9z"/></g><path d="M8 56h48" opacity=".35"/>',
  slip: '<path d="M8 56c6-10 14-14 24-14s18 4 24 14" opacity=".5"/><g class="nf-a-slipx"><circle class="a" cx="32" cy="24" r="10" stroke="none"/><circle cx="32" cy="24" r="10"/></g><path class="nf-a-fade" d="M50 18l8-4M50 26h9"/>',
  conditioning: FOCUS_ICONS.conditioning,
  teep: FOCUS_ICONS['muay-thai'],
  roundkick: FOCUS_ICONS.kickboxing,
  switch: '<path d="M14 22h30l-6-6M50 42H20l6 6"/><circle class="nf-a-seq1 a" cx="50" cy="22" r="5" stroke="none"/><circle class="nf-a-seq2 a" cx="14" cy="42" r="5" stroke="none"/>',
  knee: '<path d="M10 56h44" opacity=".35"/><g class="nf-a-knee"><path d="M22 52l10-16 14 6"/><circle class="a" cx="32" cy="36" r="6" stroke="none"/><circle cx="32" cy="36" r="6"/></g><rect x="48" y="10" width="8" height="30" rx="3"/>',
  elbow: '<path d="M12 50l14-14 16 6"/><circle class="a" cx="26" cy="36" r="5" stroke="none"/><path class="nf-a-draw" d="M20 22a22 22 0 0 1 32 10" stroke-dasharray="44"/>',
  clinch: '<circle class="a nf-a-breathe" cx="32" cy="30" r="10" stroke="none" opacity=".5"/><circle cx="32" cy="30" r="10"/><path d="M12 50c2-14 8-22 20-22s18 8 20 22"/><path d="M18 20c4-6 9-8 14-8s10 2 14 8"/>',
};
function renderTiles(key) {
  const list = TECH[key];
  if (!list) throw new Error('no techniques for ' + key);
  return '<div class="nf-tiles">' + list.map(([icon, title, text]) => '<article class="nf-tile"><span class="nf-fic">' + FI(TECH_ICONS[icon]) + '</span><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p></article>').join('') + '</div>';
}

function renderFocus() {
  const card = ([id, name, line, href], i) => '      <li class="nf-fc" style="--i:' + i + '"><button type="button" class="nf-fbtn" data-focus="' + id + '" aria-pressed="false"><span class="nf-fic">' + FI(FOCUS_ICONS[id]) + '</span><b>' + esc(name) + '</b><span>' + esc(line) + '</span><i class="nf-tick" aria-hidden="true"></i></button><a class="nf-flink" href="' + href + '" aria-label="Learn more about ' + esc(name) + '">Learn more</a></li>';
  return ['<section class="nf-sec" id="focus" aria-labelledby="focus-h">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">Your focus</p><h2 id="focus-h"><span>Your 12 sessions,</span><span>your choice.</span></h2></div><p>Pick one or two things you want from the next six weeks. I build every session around them. Change your mind later and we change the plan.</p></div>',
    '    <ul class="nf-focus" data-nf-focus>', ...FOCUS.map(card), '    </ul>',
    '    <div class="nf-fbar" data-nf-fbar><p data-nf-fsum><b>Pick up to two</b>Tap a card to add it to your plan.</p><a class="nf-btn nf-ink" href="/fitness/book?pack=12" data-nf-fgo>Build my 12-pack</a></div>',
    '  </div>', '</section>'].join('\n');
}
function renderFocusForm() {
  return '      <fieldset class="wide"><legend>Your focus <span class="nf-fine" style="font-weight:400">(pick one or two)</span></legend><div class="nf-choice nf-choice-3">' +
    FOCUS.map(([id, name]) => '<label><input type="checkbox" name="focus" value="' + id + '"><span>' + esc(name) + '</span></label>').join('') + '</div></fieldset>';
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
    if (m[1] === 'nf-focus') return renderFocus();
    if (m[1] === 'nf-focus-form') return renderFocusForm();
    if (m[1].startsWith('nf-tiles-')) return renderTiles(m[1].slice(9));
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
  const extra = { extra_css: fit ? '<link rel="stylesheet" href="/assets/studio/fitness.css">' : '' };
  const vars = { ...page, ...cur, ...mode, ...extra, jsonld: page.jsonld ? '<script type="application/ld+json">' + JSON.stringify(page.jsonld).replace(/</g, '\\u003c') + '</script>' : '' };
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
  return html.replace(/\n\n<\/head>/, '\n</head>').replace(/\n\n<script type="module"/, '\n<script type="module"') + '\n';
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
