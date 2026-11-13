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
// The well-rounded path: five pillars, and per focus its pillars, health notes, ladder and questions.
// Gear Jay uses: [id, name, brand, why, link, [focus ids]]. Empty until he fills it; nothing renders while it is empty.
const GEAR = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/gear.json'), 'utf8'));
const PATH = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/path.json'), 'utf8'));
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
        hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Training packs', itemListElement: [{ '@type': 'Offer', price: '2400', priceCurrency: 'USD', itemOffered: { '@type': 'Service', name: 'The 12-pack: twelve private training sessions' } }] } }),
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
  'fit-muscle': fitPage('muscle-building', 'Muscle building', 'Muscle Building Personal Trainer in Orange County · NJS Fitness',
    'Private strength training for building muscle in Brea and across Orange County. Clean form, load that goes up each week, twice a week for six weeks.', 'Muscle building personal training'),
  'fit-fatloss': fitPage('fat-loss', 'Fat loss', 'Fat Loss Personal Trainer in Orange County · NJS Fitness',
    'Private training for fat loss in Brea and across Orange County. Strength work that keeps your muscle, conditioning rounds and simple eating habits, twice a week for six weeks.', 'Fat loss personal training'),
  'fit-conditioning': fitPage('conditioning', 'Conditioning', 'Private Conditioning Coach in Orange County · NJS Fitness',
    'Private conditioning sessions in Brea and across Orange County: timed rounds and intervals on pads, the bag and bodyweight, twice a week for six weeks.', 'Conditioning training'),
  'fit-shoulders': fitPage('shoulder-strength', 'Shoulder strength', 'Shoulder Strength and Mobility Training in Orange County · Steel Clubs and Maces · NJS Fitness',
    'Private shoulder training in Brea and across Orange County with steel clubs and maces: rotation, stability and strength, twice a week for six weeks.', 'Shoulder strength training'),
  'fit-mobility': fitPage('mobility-and-yoga', 'Mobility and yoga', 'Private Yoga and Mobility Sessions in Orange County · NJS Fitness',
    'Private yoga and mobility sessions in Brea and across Orange County, with 400+ hours of yoga training behind them. Hips, back and shoulders that move freely.', 'Private yoga and mobility'),
  'fit-pilates': fitPage('reformer-pilates', 'Reformer Pilates', 'Private Reformer Pilates in Orange County · NJS Fitness',
    'Private reformer Pilates sessions in Orange County with Nathan J. Song, who is completing his reformer certification. Core strength, alignment and control.', 'Reformer Pilates'),
  'fit-coach': {
    ...fitPage('coach', 'About Nathan', 'About Nathan J. Song, Personal Trainer in Orange County · NJS Fitness',
      'Nathan J. Song is a personal trainer in Orange County: three-time SHRED winner, steel clubs and maces coach, kickboxing and yoga. Classes in Brea and Rancho Santa Margarita.', null),
  },
  'fit-path': fitPage('path', 'The path', 'A Well-Rounded Body: Strength, Engine, Mobility, Control and Skill · NJS Fitness',
    'The five parts of a capable body and the training that builds each one: strength, conditioning, mobility, core control and striking skill, with a four-level ladder for each.', null),
  'fit-notes': fitPage('notes', "Coach's notes", "Coach's Notes: Warm-Ups, Band Workouts and Shoulder Care · NJS Fitness",
    'Short, sourced notes from a personal trainer in Orange County: a warm-up worth ten minutes, a full band workout, and what helps a sore AC joint.', null),
  'fit-note-warmup': fitPage('notes/warm-up', 'Warm-up', 'A Ten Minute Warm-Up That Works: Four Parts, With Sources · NJS Fitness',
    'A four-part warm-up for lifting and striking, and what the research says about warm-ups, injuries and static stretching.', null),
  'fit-note-bands': fitPage('notes/band-workouts', 'Band workouts', 'A Full Resistance Band Workout, and Whether Bands Build Strength · NJS Fitness',
    'A six-move resistance band workout for home or travel, and what a review of seven studies found when bands were compared with weights.', null),
  'fit-note-ac': fitPage('notes/ac-joint', 'AC joint', 'A Sore AC Joint: What Helps, Where Acupuncture Fits, and When to Train · NJS Fitness',
    'What a shoulder separation is, what standard care looks like, what the evidence says about acupuncture for shoulder pain, and how to train once you are cleared.', null),
  'fit-note-recovery': fitPage('notes/recovery-room', 'Recovery room', 'Cryotherapy, Normatec Boots, Red Light and HydroMassage: What Is Worth It · NJS Fitness',
    'What each recovery room tool is, what the research says about cryotherapy, compression boots, red light therapy, HydroMassage beds and sports massage, and which gyms list them.', null),
  'fit-book': {
    ...fitPage('book', 'Book a time', 'Book a Personal Training Session · NJS Fitness',
      'Start the 12-pack: pick an open Thursday hour in Brea, or request a time in Rancho Santa Margarita, at home or online. Nathan confirms every booking by email.', null),
  },
};
const FOCUS_PAGE = { 'fit-muscle': 'muscle', 'fit-fatloss': 'fat-loss', 'fit-conditioning': 'conditioning', 'fit-shoulders': 'shoulders', 'fit-boxing': 'boxing', 'fit-kickboxing': 'kickboxing', 'fit-muaythai': 'muay-thai', 'fit-mobility': 'mobility', 'fit-pilates': 'pilates' };
for (const [key, id] of Object.entries(FOCUS_PAGE)) {
  PAGES[key].jsonld.push(ld('FAQPage', { mainEntity: PATH.focus[id].qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }));
}
PAGES['fit-coach'].jsonld = [ld('ProfilePage', { mainEntity: COACH }), crumbs('coach', 'About Nathan')];
PAGES['fit-book'].jsonld = [crumbs('book', 'Book a time')];
const note = (key, slug, name, headline) => { PAGES[key].jsonld = [ld('Article', { headline, author: COACH, datePublished: '2026-11-10', mainEntityOfPage: SITE + '/fitness/' + slug }), ld('BreadcrumbList', { itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'Fitness', item: SITE + '/fitness' }, { '@type': 'ListItem', position: 2, name: "Coach's notes", item: SITE + '/fitness/notes' }, { '@type': 'ListItem', position: 3, name, item: SITE + '/fitness/' + slug }] })]; };
PAGES['fit-notes'].jsonld = [crumbs('notes', "Coach's notes")];
note('fit-note-warmup', 'notes/warm-up', 'Warm-up', 'A ten minute warm-up in four parts');
note('fit-note-bands', 'notes/band-workouts', 'Band workouts', 'A full resistance band workout');
note('fit-note-recovery', 'notes/recovery-room', 'Recovery room', 'The recovery room: what each tool is and what the research says');
note('fit-note-ac', 'notes/ac-joint', 'AC joint', 'A sore AC joint: what helps and where acupuncture fits');
PAGES['fit-path'].jsonld = [crumbs('path', 'The path'), ld('ItemList', { name: 'The five pillars', itemListElement: PATH.pillars.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p[1], description: p[2] })) })];
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
  recover: '<path class="a nf-a-breathe" d="M32 8c8 10 12 16 12 22a12 12 0 0 1-24 0c0-6 4-12 12-22z"/><path class="nf-a-trail" stroke-dasharray="4 4" d="M8 52c6-4 10-4 16 0s10 4 16 0 10-4 16 0"/>',
  band: '<path class="nf-a-breathe a" d="M14 32c8-9 28-9 36 0c-8 9-28 9-36 0z"/><path d="M6 24v16M58 24v16"/><circle cx="10" cy="32" r="4"/><circle cx="54" cy="32" r="4"/>',
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

// A large animated mark for a focus page: the focus icon on a tile, inside the hero's halo and rings.
// The icon sits in its own nested <svg>, so its moving part keeps its 64-grid coordinates.
function renderFocusArt(id) {
  if (!FOCUS_ICONS[id]) throw new Error('no focus icon for ' + id);
  return ['<figure class="nf-art nf-fart" data-nf-fart aria-hidden="true">',
    '<svg viewBox="0 0 360 260" fill="none" stroke-linecap="round" stroke-linejoin="round">',
    '  <defs><linearGradient id="fa-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE1D4"/><stop offset=".72" stop-color="#FBF1EA"/><stop offset="1" stop-color="#FAF6F2"/></linearGradient><radialGradient id="fa-halo"><stop offset="0" stop-color="#FFF7E8"/><stop offset=".55" stop-color="#FFD2BF" stop-opacity=".7"/><stop offset="1" stop-color="#FFD2BF" stop-opacity="0"/></radialGradient><clipPath id="fa-card"><rect x="8" y="8" width="344" height="244" rx="28"/></clipPath></defs>',
    '  <rect x="8" y="8" width="344" height="244" rx="28" fill="url(#fa-sky)"/>',
    '  <g clip-path="url(#fa-card)"><g class="h2-halo"><circle cx="180" cy="128" r="118" fill="url(#fa-halo)"/></g>',
    '  <g class="h2-orbit" stroke-width="2"><circle cx="180" cy="128" r="104" stroke="#B9A7F5" stroke-dasharray="3 11" opacity=".7"/><circle cx="180" cy="128" r="88" stroke="#7FD3C8" stroke-dasharray="26 14" opacity=".5"/></g></g>',
    '  <g class="h2-drift"><circle cx="46" cy="52" r="5" fill="#7FD3C8"/><circle cx="318" cy="204" r="4" fill="#B9A7F5"/><path d="M312 44l3.5 7 7 3.5-7 3.5-3.5 7-3.5-7-7-3.5 7-3.5z" fill="#FF8A6B"/><rect x="38" y="190" width="7" height="12" rx="3.5" fill="#FFD2A8" transform="rotate(-18 41 196)"/></g>',
    '  <g class="fa-sat fa-sat1"><circle cx="180" cy="24" r="6.5" fill="#7FD3C8" stroke="#121416" stroke-width="2.5"/></g><g class="fa-sat fa-sat2"><circle cx="180" cy="216" r="5.5" fill="#FF8A6B" stroke="#121416" stroke-width="2.5"/><circle cx="92" cy="128" r="4" fill="#B9A7F5" stroke="#121416" stroke-width="2"/></g>',
    '  <path class="fa-tw" d="M70 96l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5z" fill="#121416"/><path class="fa-tw fa-tw2" d="M292 150l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FF6F61"/>',
    '  <circle class="fa-ring" cx="180" cy="128" r="70" stroke="#FF8A6B" stroke-width="4"/>',
    '  <g class="fa-tile"><rect x="112" y="64" width="136" height="136" rx="38" fill="#121416" opacity=".12" transform="translate(5 7)"/><rect x="112" y="60" width="136" height="136" rx="38" fill="#fff" stroke="#121416" stroke-width="3.5"/>',
    '  <svg class="nf-fi" x="126" y="74" width="108" height="108" viewBox="0 0 64 64" fill="none" stroke="#121416" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' + FOCUS_ICONS[id] + '</svg></g>',
    '  <g class="fa-chip fa-chip1"><rect x="26" y="182" width="74" height="50" rx="14" fill="#fff" stroke="#121416" stroke-width="3"/>' + [0, 1, 2, 3].map((k) => '<rect class="fa-bar" style="--k:' + k + '" x="' + (40 + k * 12) + '" y="' + (212 - k * 6) + '" width="7" height="' + (10 + k * 6) + '" rx="2.5" fill="' + (k === 3 ? '#FF8A6B' : '#121416') + '"/>').join('') + '</g>',
    '  <g class="fa-chip fa-chip2"><rect x="256" y="30" width="78" height="42" rx="14" fill="#fff" stroke="#121416" stroke-width="3"/><path class="fa-ecg" d="M266 52h12l4-10 7 20 5-14 4 4h22" stroke="#FF6F61" stroke-width="3"/></g>',
    '</svg>', '</figure>'].join('\n');
}

// ---- The well-rounded path (partials/fitness/path.json) ----
const PILLAR = Object.fromEntries(PATH.pillars.map((p, i) => [p[0], { i, name: p[1], line: p[2], focus: p[3] }]));
const focusRow = (id) => FOCUS.find((f) => f[0] === id);
const pathOf = (id) => { const f = PATH.focus[id]; if (!f) throw new Error('no path data for ' + id); return f; };
// A point on the wheel: spoke k of five, starting at the top and going clockwise, at radius r.
const WC = [180, 150];
const wpt = (k, r) => { const a = (-90 + k * 72) * Math.PI / 180; return [WC[0] + r * Math.cos(a), WC[1] + r * Math.sin(a)].map((n) => Math.round(n * 10) / 10); };
const wpoly = (rs) => rs.map((r, k) => wpt(k, r).join(',')).join(' ');

// The wheel: a five-spoke radar. This page's pillar is full, the pillars it also helps are part
// filled, the rest are open and pulse. Every other spoke is a link to the page that fills it.
function renderWheel(id) {
  const f = pathOf(id), R = 92;
  const level = (pid) => pid === f.main ? 1 : f.also.includes(pid) ? 0.62 : 0.2;
  const nodes = PATH.pillars.map(([pid, name, line, fid], k) => {
    const [x, y] = wpt(k, R), [lx, ly] = wpt(k, R + 30);
    const st = pid === f.main ? 'main' : f.also.includes(pid) ? 'also' : 'open';
    const anchor = Math.abs(lx - WC[0]) < 8 ? 'middle' : lx > WC[0] ? 'start' : 'end';
    const dot = '<g class="wh-node wh-' + st + '" data-wh-line="' + esc(name + ': ' + line) + '"><circle class="wh-hit" cx="' + x + '" cy="' + y + '" r="22"/><circle class="wh-pulse" cx="' + x + '" cy="' + y + '" r="11"/><circle class="wh-dot" cx="' + x + '" cy="' + y + '" r="11"/><text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="' + anchor + '">' + esc(name) + '</text></g>';
    return fid === id ? dot : '<a href="' + focusRow(fid)[3] + '" aria-label="' + esc(name + ': ' + focusRow(fid)[1]) + '">' + dot + '</a>';
  });
  const svg = ['<figure class="nf-art nf-wheel" data-nf-wheel>',
    '<svg viewBox="0 0 360 300" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="The five pillars: ' + esc(PATH.pillars.map((p) => p[1]).join(', ')) + '">',
    '  <g class="wh-grid"><polygon points="' + wpoly([R, R, R, R, R]) + '"/><polygon points="' + wpoly(Array(5).fill(R * 2 / 3)) + '"/><polygon points="' + wpoly(Array(5).fill(R / 3)) + '"/>' + PATH.pillars.map((_, k) => '<path d="M' + WC.join(' ') + 'L' + wpt(k, R).join(' ') + '"/>').join('') + '</g>',
    '  <g class="wh-fill"><polygon points="' + wpoly(PATH.pillars.map((p) => R * level(p[0]))) + '"/></g>',
    '  ' + nodes.join('\n  '),
    '</svg>',
    '<figcaption data-nf-whcap>' + esc(PILLAR[f.main].name + ': ' + PILLAR[f.main].line) + '</figcaption>', '</figure>'].join('\n');
  const missing = PATH.pillars.filter((p) => p[0] !== f.main && !f.also.includes(p[0])).slice(0, 2);
  const cards = missing.map(([pid, name, , fid]) => { const [, fname, fline, href] = focusRow(fid); return '<a class="nf-card nf-pairc" href="' + href + '"><span class="nf-fic">' + FI(FOCUS_ICONS[fid]) + '</span><h3>' + esc(fname) + '</h3><p><b>Adds ' + esc(name) + '.</b> ' + esc(fline) + '</p></a>'; }).join('');
  const also = f.also.length ? ' and helps ' + f.also.map((a) => PILLAR[a].name.toLowerCase()).join(' and ') : '';
  return ['<section class="nf-sec tight" id="wheel" aria-labelledby="wheel-h">', '  <div class="wrap nf-wheelrow">',
    '    <div><div class="nf-h"><div><p class="nf-k">Well-rounded</p><h2 id="wheel-h"><span>' + esc(PILLAR[f.main].name) + ' here.</span><span>Round out the rest.</span></h2></div><p>A capable body has five parts. This page builds ' + PILLAR[f.main].name.toLowerCase() + also + '. The open points on the wheel are what to add next. <a class="nf-more" href="/fitness/path">See the whole path</a></p></div>',
    '    <div class="nf-cards">' + cards + '</div></div>',
    svg, '  </div>', '</section>'].join('\n');
}

// The ladder: four levels, each one something a person can do and check.
function renderLadder(id) {
  const f = pathOf(id);
  const bars = (n) => '<svg class="nf-lv-bars" viewBox="0 0 34 26" aria-hidden="true">' + [0, 1, 2, 3].map((k) => '<rect class="' + (k <= n ? 'on' : '') + '" x="' + (k * 9) + '" y="' + (18 - k * 6) + '" width="6" height="' + (8 + k * 6) + '" rx="2" style="--k:' + k + '"/>').join('') + '</svg>';
  return ['<section class="nf-sec tight" id="ladder" aria-labelledby="ladder-h">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">Your ladder</p><h2 id="ladder-h"><span>Four levels.</span><span>One step at a time.</span></h2></div><p>Each level is something you can do and check. Your first 12-pack is built to reach level 1. Tap where you are now.</p></div>',
    '    <ol class="nf-ladder" data-nf-ladder>',
    ...f.ladder.map((text, n) => '      <li style="--s:' + n + '"><button type="button" class="nf-lv" aria-pressed="false" data-lv="' + (n + 1) + '">' + bars(n) + '<span class="nf-lv-n">Level ' + (n + 1) + '</span><b>' + esc(PATH.levels[n]) + '</b><span>' + esc(text) + '</span></button></li>'),
    '    </ol>',
    '    <p class="nf-lv-msg" role="status" data-nf-lvmsg>Starting fresh? Your first 12-pack is built to reach level 1.</p>',
    '  </div>', '</section>'].join('\n');
}

// Health: three plain benefits, each with a link to the public source that says it.
function renderHealth(id) {
  const f = pathOf(id);
  return ['<section class="nf-sec tight" id="health" aria-labelledby="health-h">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">What it does for you</p><h2 id="health-h"><span>Good for more</span><span>than the mirror.</span></h2></div><p>What public health sources say about this kind of training. General information, not medical advice.</p></div>',
    '    <div class="nf-cards c3">',
    ...f.health.map(([title, text, src, url], n) => '      <article class="nf-card nf-hc" style="--i:' + n + '"><svg class="nf-hc-i" viewBox="0 0 44 24" aria-hidden="true"><path d="M1 12h10l3-8 5 16 4-12 3 4h17"/></svg><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p><a class="nf-src" href="' + url + '" target="_blank" rel="noopener">' + esc(src) + '</a></article>'),
    '    </div>', '  </div>', '</section>'].join('\n');
}

// The path hub: the whole wheel, then each pillar with the pages that build it and where each ladder starts and ends.
function renderPathWheel() {
  const R = 92;
  const nodes = PATH.pillars.map(([pid, name, line], k) => {
    const [x, y] = wpt(k, R), [lx, ly] = wpt(k, R + 30);
    const anchor = Math.abs(lx - WC[0]) < 8 ? 'middle' : lx > WC[0] ? 'start' : 'end';
    return '<a href="#p-' + pid + '" aria-label="' + esc(name) + '"><g class="wh-node wh-main" data-wh-line="' + esc(name + ': ' + line) + '"><circle class="wh-hit" cx="' + x + '" cy="' + y + '" r="22"/><circle class="wh-pulse" cx="' + x + '" cy="' + y + '" r="11"/><circle class="wh-dot" cx="' + x + '" cy="' + y + '" r="11"/><text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="' + anchor + '">' + esc(name) + '</text></g></a>';
  });
  return ['<figure class="nf-art nf-wheel nf-wheel-all" data-nf-wheel>',
    '<svg viewBox="0 0 360 300" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="The five pillars: ' + esc(PATH.pillars.map((p) => p[1]).join(', ')) + '">',
    '  <g class="wh-grid"><polygon points="' + wpoly(Array(5).fill(R)) + '"/><polygon points="' + wpoly(Array(5).fill(R * 2 / 3)) + '"/><polygon points="' + wpoly(Array(5).fill(R / 3)) + '"/>' + PATH.pillars.map((_, k) => '<path d="M' + WC.join(' ') + 'L' + wpt(k, R).join(' ') + '"/>').join('') + '</g>',
    '  <g class="wh-fill"><polygon points="' + wpoly(Array(5).fill(R)) + '"/></g>',
    '  ' + nodes.join('\n  '), '</svg>',
    '<figcaption data-nf-whcap>Point at a pillar to see what it means. Tap one to jump to it.</figcaption>', '</figure>'].join('\n');
}
function renderPathPillars() {
  return PATH.pillars.map(([pid, name, line]) => {
    const rows = FOCUS.filter((f) => PATH.focus[f[0]].main === pid);
    return ['<section class="nf-sec tight" id="p-' + pid + '" aria-labelledby="p-' + pid + '-h">', '  <div class="wrap">',
      '    <div class="nf-h"><div><p class="nf-k">Pillar ' + (PILLAR[pid].i + 1) + ' of 5</p><h2 id="p-' + pid + '-h">' + esc(name) + '</h2></div><p><b>' + esc(line) + '</b> ' + (rows.length > 1 ? rows.length + ' ways to build it. Pick the one you would look forward to.' : 'One page builds it.') + '</p></div>',
      '    <div class="nf-cards ' + (rows.length >= 3 ? 'c3' : 'c2') + '">',
      ...rows.map(([fid, fname, fline, href]) => '      <a class="nf-card nf-pathc" href="' + href + '"><span class="nf-fic">' + FI(FOCUS_ICONS[fid]) + '</span><h3>' + esc(fname) + '</h3><p>' + esc(fline) + '</p><dl><div><dt>Level 1</dt><dd>' + esc(PATH.focus[fid].ladder[0]) + '</dd></div><div><dt>Level 4</dt><dd>' + esc(PATH.focus[fid].ladder[3]) + '</dd></div></dl><span class="nf-more">See the ladder</span></a>'),
      '    </div>', '  </div>', '</section>'].join('\n');
  }).join('\n\n');
}

// Gear row for a focus page. Links are marked sponsored and the disclosure sits right above them.
function renderGear(id) {
  const items = GEAR.filter((g) => g[5].includes(id));
  if (!items.length) return '';
  return ['<section class="nf-sec tight" id="gear" aria-labelledby="gear-h">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">Gear I use</p><h2 id="gear-h"><span>What I train with,</span><span>and why.</span></h2></div><p class="nf-disc">Some of these links pay me a small commission. It costs you nothing, and I only list gear I use.</p></div>',
    '    <div class="nf-cards c3">',
    ...items.map(([gid, name, brand, why, url]) => '      <a class="nf-card nf-gear" href="' + esc(url) + '" target="_blank" rel="sponsored nofollow noopener" data-nf-gear="' + esc(gid) + '"><p class="nf-k">' + esc(brand) + '</p><h3>' + esc(name) + '</h3><p>' + esc(why) + '</p><span class="nf-src">View at ' + esc(brand) + '</span></a>'),
    '    </div>', '  </div>', '</section>'].join('\n');
}

function renderQa(id) {
  const f = pathOf(id);
  return ['<section class="nf-sec tight" id="questions" aria-labelledby="qa-h">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">Questions</p><h2 id="qa-h">Before you book.</h2></div></div>',
    '    <div class="nf-faq">',
    ...f.qa.map(([q, a]) => '      <details><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>'),
    '    </div>', '  </div>', '</section>'].join('\n');
}

function renderFocus() {
  const card = ([id, name, line, href], i) => '      <li class="nf-fc" style="--i:' + i + '"><button type="button" class="nf-fbtn" data-focus="' + id + '" data-p="' + [PATH.focus[id].main].concat(PATH.focus[id].also).join(' ') + '" aria-pressed="false"><span class="nf-fic">' + FI(FOCUS_ICONS[id]) + '</span><b>' + esc(name) + '</b><span>' + esc(line) + '</span><i class="nf-tick" aria-hidden="true"></i></button><a class="nf-flink" href="' + href + '" aria-label="Learn more about ' + esc(name) + '">Learn more</a></li>';
  return ['<section class="nf-sec" id="focus" aria-labelledby="focus-h">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">Your focus</p><h2 id="focus-h"><span>Your 12 sessions,</span><span>your choice.</span></h2></div><p>Pick one or two things you want from the next six weeks. I build every session around them. Change your mind later and we change the plan.</p></div>',
    '    <ul class="nf-focus" data-nf-focus>', ...FOCUS.map(card), '    </ul>',
    '    <div class="nf-fbar" data-nf-fbar data-n="0"><svg class="nf-mini" viewBox="-40 -40 80 80" aria-hidden="true" data-nf-mini><polygon points="' + PATH.pillars.map((_, k) => wpt(k, 30).map((n, j) => Math.round((n - WC[j]) * 10) / 10).join(',')).join(' ') + '"/>' + PATH.pillars.map(([pid, name], k) => { const [x, y] = wpt(k, 30); return '<circle data-pl="' + pid + '" data-name="' + name + '" cx="' + Math.round((x - WC[0]) * 10) / 10 + '" cy="' + Math.round((y - WC[1]) * 10) / 10 + '" r="7"/>'; }).join('') + '</svg><p data-nf-fsum><b>Pick up to two</b>Tap a card to add it to your plan.</p><a class="nf-btn nf-ink" href="/fitness/book?pack=12" data-nf-fgo>Build my 12-pack</a></div>',
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
    if (m[1].startsWith('nf-fart-')) return renderFocusArt(m[1].slice(8));
    if (m[1].startsWith('nf-wheel-')) return renderWheel(m[1].slice(9));
    if (m[1].startsWith('nf-ladder-')) return renderLadder(m[1].slice(10));
    if (m[1].startsWith('nf-health-')) return renderHealth(m[1].slice(10));
    if (m[1].startsWith('nf-qa-')) return renderQa(m[1].slice(6));
    if (m[1].startsWith('nf-gear-')) return renderGear(m[1].slice(8));
    if (m[1] === 'nf-path-wheel') return renderPathWheel();
    if (m[1] === 'nf-path-pillars') return renderPathPillars();
    if (seen.includes(m[1])) throw new Error('include loop: ' + seen.concat(m[1]).join(' > '));
    return expand(read(m[1]), seen.concat(m[1]));
  }).join('\n');
}

// Mary's headline rule, enforced here so no page can forget it: a heading with more than one phrase
// ("Pick a pack. Book your first time.") gets each phrase in <span class="ph">, an inline-block, so the
// browser breaks lines between phrases, never inside one. Phrases end at . , : ; ? ! — · or a <br>.
// One-phrase headings are left alone; `text-wrap: balance` in studio.css keeps them from orphaning.
const VOID = /^<(br|img|wbr|input|hr)\b/i;
const BOUND = /([.,:;?!—·])(\s+)/;
export function phraseWrap(inner) {
  if (/class="[^"]*\bph\b/.test(inner) || /<(div|p|ul|ol|li|section|figure|svg)\b/i.test(inner)) return inner;
  const parts = inner.split(/(<[^>]+>)/).filter((x) => x !== '');
  const pieces = []; const seps = []; let cur = '';
  const cut = (sep) => { pieces.push(cur); seps.push(sep); cur = ''; };
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i];
    if (t.startsWith('<')) {
      if (/^<br\b/i.test(t)) { cut(t); continue; }
      if (VOID.test(t) || t.startsWith('</')) { cur += t; continue; }
      // An inline element is one unit; a plain <span> (a stacked line) gets its own phrase wrap.
      const name = t.match(/^<([a-z0-9]+)/i)[1].toLowerCase();
      let depth = 1, j = i + 1, body = '';
      for (; j < parts.length && depth; j++) {
        const u = parts[j];
        if (u.startsWith('<') && !VOID.test(u) && new RegExp('^</?' + name + '\\b', 'i').test(u)) depth += u.startsWith('</') ? -1 : 1;
        if (depth) body += u;
      }
      cur += t + (t === '<span>' ? phraseWrap(body) : body) + '</' + name + '>';
      i = j - 1;
      continue;
    }
    let rest = t;
    for (let m; (m = rest.match(BOUND));) {
      const end = m.index + m[1].length;
      const after = rest.slice(end + m[2].length);
      cur += rest.slice(0, end);
      if (after === '' && i === parts.length - 1) { rest = ''; break; }
      cut(' ');
      rest = after;
    }
    cur += rest;
  }
  pieces.push(cur);
  const real = pieces.filter((p) => p.trim());
  const join = (wrap) => pieces.map((p, k) => (p.trim() ? (wrap ? '<span class="ph">' + p.trim() + '</span>' : p) : '') + (k < seps.length ? seps[k] : '')).join('').trim();
  return real.length < 2 ? join(false) : join(true);
}
// Widow control: the last two words of each phrase (4+ words) share a no-break space.
function widow(seg) {
  const parts = seg.split(/(<[^>]+>)/);
  if (parts.filter((t) => !t.startsWith('<')).join('').trim().split(/\s+/).length < 4) return seg;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].startsWith('<')) continue;
    const t = parts[i].replace(/\s+$/, ''); const k = t.lastIndexOf(' ');
    if (k > -1) { parts[i] = t.slice(0, k) + '\u00a0' + t.slice(k + 1) + parts[i].slice(t.length); return parts.join(''); }
  }
  return seg;
}
const widows = (inner) => (/class="ph"/.test(inner) ? inner.replace(/(<span class="ph">)([\s\S]*?)(<\/span>)(?=\s|<br|$)/g, (_, a, b, c) => a + widow(b) + c) : widow(inner));
const phraseHeadings = (html) => html.replace(/(<h([1-3])\b[^>]*>)([\s\S]*?)(<\/h\2>)/g, (_, open, _l, inner, close) => open + widows(phraseWrap(inner)) + close);

export function renderPage(id) {
  const page = PAGES[id];
  const cur = Object.fromEntries(['plans', 'build', 'work', 'care', 'crew'].map((t) => ['cur_' + t, page.nav === t ? ' aria-current="page"' : '']));
  const fit = page.mode === 'fitness';
  const mode = { brand: fit ? 'NJS Fitness' : 'NJS Studio', mode: fit ? 'fitness' : 'business',
    biz_href: fit ? '/' : page.path, fit_href: '/fitness',
    biz_cur: fit ? '' : ' aria-current="true"', fit_cur: fit ? ' aria-current="true"' : '' };
  const extra = { extra_css: fit ? '<link rel="stylesheet" href="/assets/studio/fitness.css">' + (id === 'fit-book' ? '\n<link rel="stylesheet" href="/assets/studio/booker.css">' : '') : '' };
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
  html = phraseHeadings(html);
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
