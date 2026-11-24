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

import { GYMS as COACH_GYMS, KIND_SYM, kindJewel } from '../assets/studio/places.js';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = join(ROOT, 'partials/studio');
export const SITE = 'https://nathanjsong.com';

const FAQ = JSON.parse(readFileSync(join(P, 'faq.json'), 'utf8'));
const GOALS = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/goals.json'), 'utf8'));
const FOCUS = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/focus.json'), 'utf8'));
// The well-rounded path: five pillars, and per focus its pillars, health notes, ladder and questions.
// Gear Jay uses: [id, name, brand, why, link, [focus ids]]. Empty until he fills it; nothing renders while it is empty.
const GEAR = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/gear.json'), 'utf8'));
const GUIDES = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/guides.json'), 'utf8'));
// Chain studios (CorePower, Orangetheory and so on): map only, never ranked, no profile pages.
const CHAINS = JSON.parse(readFileSync(join(ROOT, 'partials/fitness/chains.json'), 'utf8'));
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
  areaServed: ['Brea, CA', 'Rancho Santa Margarita, CA', 'Corona, CA', 'Orange County, California', 'Inland Empire, California'],
};
const crumbs = (slug, name) => ld('BreadcrumbList', { itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'Fitness', item: SITE + '/fitness' },
  { '@type': 'ListItem', position: 2, name, item: SITE + '/fitness/' + slug },
] });
// A guide is ranked only when Jay has given every gym on it a rank. Until then it is a list grouped by region.
function guideRanked(g) { return g.gyms.every((x) => Number.isInteger(x.rank)); }
const NUMW = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const numWord = (n) => NUMW[n] || (n < 30 ? 'twenty-' + NUMW[n - 20] : String(n));
const capWord = (n) => { const w = numWord(n); return w[0].toUpperCase() + w.slice(1); };
const guideN = (k) => GUIDES.guides[k].gyms.length;
function guideOrder(g) { return guideRanked(g) ? [...g.gyms].sort((a, b) => a.rank - b.rank) : g.gyms; }
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
  funnels: {
    out: 'funnels/index.html', path: '/funnels', nav: null, h1: 'fn-h', css: 'funnels',
    title: 'Funnel Build Templates · Intake and Growth Funnels · NJS Studio',
    description: 'Working funnel templates by Nathan J. Song: a memorial and senior care intake funnel and a sweepstakes growth funnel, with the ads, CRM pipelines, automations and reporting behind them.',
    og_title: 'Funnels that end in a booked call, not a click',
    og_description: 'Click through working funnel templates, from the first ad to the CRM pipeline and the Monday report.',
    skip_href: '#fn-list', skip_text: 'Skip to the templates',
    jsonld: ld('CollectionPage', { name: 'Funnel build templates', hasPart: [{ '@type': 'CreativeWork', name: 'Memorial and senior care intake funnel', url: SITE + '/funnels/memorial' }, { '@type': 'CreativeWork', name: 'Sweepstakes growth funnel', url: SITE + '/ritual' }] }),
  },
  'funnel-behind': {
    out: 'funnels/memorial/behind/index.html', path: '/funnels/memorial/behind', nav: null, h1: 'bh-h', css: 'funnel-memorial',
    title: 'Behind the Funnel: Meta Ads, Zapier and GoHighLevel · Funnel Build Template · NJS Studio',
    description: 'What runs the memorial intake funnel: one lead traced through Meta ads, Zapier and GoHighLevel, the add-ons that plug in, and the pipelines, follow-up and reporting behind it.',
    og_title: 'Behind the funnel: Meta ads, Zapier and GoHighLevel',
    og_description: 'One lead traced end to end, the add-ons, the pipelines and the follow-up.',
    skip_href: '#stack', skip_text: 'Skip to the stack',
    jsonld: ld('WebPage', { name: 'Behind the memorial intake funnel', isPartOf: { '@type': 'CollectionPage', name: 'Funnel build templates', url: SITE + '/funnels' } }),
  },
  'funnel-builder': {
    out: 'funnels/memorial/builder/index.html', path: '/funnels/memorial/builder', nav: null, h1: 'fb-h', css: 'funnel-builder',
    title: 'Memorial Landing Page Builder · Funnel Build Template · NJS Studio',
    description: 'Build a funeral pre-planning or senior care landing page in two minutes: nine starting pages, researched wording angles with sources, and live phone and desktop preview.',
    og_title: 'Memorial landing page builder',
    og_description: 'Nine starting pages, researched wording angles with sources, live preview.',
    skip_href: '#builder', skip_text: 'Skip to the builder',
    jsonld: ld('WebPage', { name: 'Memorial landing page builder', isPartOf: { '@type': 'CollectionPage', name: 'Funnel build templates', url: SITE + '/funnels' } }),
  },
  'funnel-memorial': {
    out: 'funnels/memorial/index.html', path: '/funnels/memorial', nav: null, h1: 'headline', css: 'funnel-memorial',
    title: 'Memorial and Senior Care Intake Funnel · Funnel Build Template · NJS Studio',
    description: 'A funnel build template for funeral pre-planning and senior care: three intake paths, ten sourced planning tools, and the ads, CRM and follow-up behind them.',
    og_title: 'Memorial and senior care intake funnel, a build template',
    og_description: 'Three intake paths, ten planning tools, and the ads, CRM and follow-up behind them. Concept brand, demo only.',
    skip_href: '#kit', skip_text: 'Skip to the planning toolkit',
    jsonld: ld('WebPage', { name: 'Memorial and senior care intake funnel', isPartOf: { '@type': 'CollectionPage', name: 'Funnel build templates', url: SITE + '/funnels' } }),
  },
  ops: {
    out: 'marketing-ops/index.html', path: '/marketing-ops', nav: null, h1: 'ops-h', css: 'ops',
    title: 'Meta Ads, GoHighLevel CRM and Marketing Automation · Nathan J. Song',
    description: 'How Nathan J. Song runs Meta ads, GoHighLevel pipelines, email and SMS follow-up, review requests and owner reporting, with a worked example for funeral planning.',
    og_title: 'Ads and CRM, run as one system',
    og_description: 'Meta ads, GoHighLevel, automation, reviews and reporting, with results from three years in dental and a worked example for memorial planning and senior living.',
    skip_href: '#example', skip_text: 'Skip to the worked example',
    jsonld: ld('ProfilePage', { name: 'Marketing operations', mainEntity: { '@type': 'Person', name: 'Nathan J. Song', url: SITE + '/resume', jobTitle: 'Marketing operations manager', knowsAbout: ['Meta Ads', 'GoHighLevel', 'CRM automation', 'Email and SMS marketing', 'Review management', 'Conversion tracking'] } }),
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
    description: 'Personal training with Nathan J. Song in Brea, Rancho Santa Margarita and Corona: muscle building, fat loss, steel clubs and maces, kickboxing and yoga. Twelve private sessions.',
    og_title: 'NJS Fitness: a strong mind needs a strong body',
    og_description: 'Twelve private sessions with a three-time SHRED winner. Book a time in Brea, Rancho Santa Margarita or Corona.',
    skip_href: '#packs', skip_text: 'Skip to the packs',
    jsonld: [
      ld('ProfilePage', { mainEntity: COACH }),
      ld('Service', { name: 'Personal training packs', serviceType: 'Personal training', provider: { '@id': COACH['@id'] }, areaServed: 'Orange County, California',
        hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Training packs', itemListElement: [{ '@type': 'Offer', price: '2400', priceCurrency: 'USD', itemOffered: { '@type': 'Service', name: 'The 12-pack: twelve private training sessions' } }] } }),
    ],
  },
  'fit-pt': fitPage('personal-training', 'Personal training', 'Personal Training for Muscle Building and Fat Loss in Orange County · NJS Fitness',
    'One on one personal training for muscle building and fat loss in Brea and Rancho Santa Margarita, with a three-time SHRED winner. Twelve private sessions.', 'Personal training'),
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
    'Private strength training for building muscle in Brea and across Orange County. Clean form, load that goes up each week, in a 12-session pack.', 'Muscle building personal training'),
  'fit-fatloss': fitPage('fat-loss', 'Fat loss', 'Fat Loss Personal Trainer in Orange County · NJS Fitness',
    'Private training for fat loss in Brea and across Orange County. Strength work that keeps your muscle, conditioning rounds and simple eating habits, in a 12-session pack.', 'Fat loss personal training'),
  'fit-conditioning': fitPage('conditioning', 'Conditioning', 'Private Conditioning Coach in Orange County · NJS Fitness',
    'Private conditioning sessions in Brea and across Orange County: timed rounds and intervals on pads, the bag and bodyweight, in a 12-session pack.', 'Conditioning training'),
  'fit-shoulders': fitPage('shoulder-strength', 'Shoulder strength', 'Shoulder Strength and Mobility Training in Orange County · Steel Clubs and Maces · NJS Fitness',
    'Private shoulder training in Brea and across Orange County with steel clubs and maces: rotation, stability and strength, in a 12-session pack.', 'Shoulder strength training'),
  'fit-mobility': fitPage('mobility-and-yoga', 'Mobility and yoga', 'Private Yoga and Mobility Sessions in Orange County · NJS Fitness',
    'Private yoga and mobility sessions in Brea and across Orange County, with 400+ hours of yoga training behind them. Hips, back and shoulders that move freely.', 'Private yoga and mobility'),
  'fit-pilates': fitPage('reformer-pilates', 'Reformer Pilates', 'Private Reformer Pilates in Orange County · NJS Fitness',
    'Private reformer Pilates sessions in Orange County with Nathan J. Song, who is completing his reformer certification. Core strength, alignment and control.', 'Reformer Pilates'),
  'fit-coach': {
    ...fitPage('coach', 'About Nathan', 'About Nathan J. Song, Personal Trainer in Orange County · NJS Fitness',
      'Nathan J. Song is a personal trainer in Orange County: three-time SHRED winner, steel clubs and maces coach, kickboxing and yoga. Classes in Brea, Rancho Santa Margarita and Corona.', null),
  },
  'fit-path': fitPage('path', 'The path', 'A Well-Rounded Body: Strength, Engine, Mobility, Control and Skill · NJS Fitness',
    'The five parts of a capable body and the training that builds each one: strength, conditioning, mobility, core control and striking skill, with a four-level ladder for each.', null),
  'fit-notes': fitPage('notes', "Coach's notes", "Coach's Notes: Warm-Ups, Band Workouts and Shoulder Care · NJS Fitness",
    'Short, sourced notes from a personal trainer in Orange County: a warm-up worth ten minutes, a full band workout, and what helps a sore AC joint.', null),
  'fit-guides': fitPage('guides', 'Guides', 'Where to Train in Southern California: Boxing, Kickboxing and Muay Thai Gym Guides · NJS Fitness',
    'Guides to boxing, kickboxing and Muay Thai gyms across Los Angeles, Orange County and the Inland Empire, written by a working coach. No paid placements.', null),
  'fit-guide-boxing': fitPage('guides/boxing-gyms-socal', 'Boxing gyms', 'Boxing Gyms in Southern California: ' + guideN('boxing') + ' Worth Knowing in LA, OC and the Inland Empire · NJS Fitness',
    capWord(guideN('boxing')) + ' boxing gyms across Los Angeles, Orange County and the Inland Empire, with what each is known for and its official link. Written by a working coach.', null),
  'fit-guide-kickboxing': fitPage('guides/kickboxing-gyms-socal', 'Kickboxing and Muay Thai gyms', 'Kickboxing and Muay Thai Gyms in Southern California: ' + guideN('kickboxing') + ' Worth Knowing · NJS Fitness',
    capWord(guideN('kickboxing')) + ' kickboxing and Muay Thai gyms across Los Angeles, Orange County and the Inland Empire, with what each is known for and its official link.', null),
  'fit-guide-yoga': fitPage('guides/yoga-studios-socal', 'Yoga studios', 'Yoga Studios in Southern California: ' + guideN('yoga') + ' Worth Knowing, Hot and Not Hot · NJS Fitness',
    capWord(guideN('yoga')) + ' yoga studios across Los Angeles, Orange County and the Inland Empire, with styles, heated or not, and each official link.', null),
  'fit-near': fitPage('guides/near-me', 'Near me', 'Map of Boxing, Kickboxing, Jiu-Jitsu, Pilates and Yoga Near Me in Southern California · NJS Fitness',
    'An interactive map of boxing, kickboxing, jiu-jitsu, Pilates and yoga in Los Angeles, Orange County and the Inland Empire. Filter by kind and sort by distance.', null),
  'fit-guide-pilates': fitPage('guides/reformer-pilates-studios-socal', 'Reformer Pilates studios', 'Reformer Pilates Studios in Southern California: ' + guideN('pilates') + ' Worth Knowing in LA, OC and the Inland Empire · NJS Fitness',
    capWord(guideN('pilates')) + ' reformer Pilates studios across Los Angeles, Orange County and the Inland Empire, with what each offers and its official link.', null),
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
      'Start the 12-pack: pick a time in Brea, Rancho Santa Margarita or Corona, or request in-home or online training. Nathan confirms every booking by email.', null),
  },
};
const FOCUS_PAGE = { 'fit-muscle': 'muscle', 'fit-fatloss': 'fat-loss', 'fit-conditioning': 'conditioning', 'fit-shoulders': 'shoulders', 'fit-boxing': 'boxing', 'fit-kickboxing': 'kickboxing', 'fit-muaythai': 'muay-thai', 'fit-mobility': 'mobility', 'fit-pilates': 'pilates' };
for (const [key, id] of Object.entries(FOCUS_PAGE)) {
  PAGES[key].jsonld.push(ld('FAQPage', { mainEntity: PATH.focus[id].qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }));
}
PAGES['fit-coach'].jsonld = [ld('ProfilePage', { mainEntity: COACH }), crumbs('coach', 'About Nathan')];
PAGES['fit-book'].jsonld = [crumbs('book', 'Book a time')];
PAGES['fit-guides'].jsonld = [crumbs('guides', 'Guides')];
PAGES['fit-near'].jsonld = [ld('BreadcrumbList', { itemListElement: [['Fitness', '/fitness'], ['Guides', '/fitness/guides'], ['Near me', '/fitness/guides/near-me']].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })) })];
// Gym guides: an ItemList of the gyms in page order, so the list itself is readable by search engines.
for (const [key, id] of [['boxing', 'fit-guide-boxing'], ['kickboxing', 'fit-guide-kickboxing'], ['pilates', 'fit-guide-pilates'], ['yoga', 'fit-guide-yoga']]) {
  const g = GUIDES.guides[key];
  PAGES[id].jsonld = [ld('ItemList', { name: PAGES[id].og_title, numberOfItems: guideOrder(g).length, dateModified: GUIDES.checked,
    itemListElement: guideOrder(g).map((x, i) => ({ '@type': 'ListItem', position: i + 1, item: Object.assign({ '@type': 'SportsActivityLocation', name: x.name, address: { '@type': 'PostalAddress', addressLocality: x.city, addressRegion: 'CA' } }, x.p ? { url: SITE + '/fitness/guides/gyms/' + x.p.slug } : x.site ? { url: x.site } : {}) })) }),
  ld('BreadcrumbList', { itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Fitness', item: SITE + '/fitness' }, { '@type': 'ListItem', position: 2, name: 'Guides', item: SITE + '/fitness/guides' }, { '@type': 'ListItem', position: 3, name: PAGES[id].og_title, item: SITE + PAGES[id].path }] })];
}
const note = (key, slug, name, headline) => { PAGES[key].jsonld = [ld('Article', { headline, author: COACH, datePublished: '2026-11-10', mainEntityOfPage: SITE + '/fitness/' + slug }), ld('BreadcrumbList', { itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'Fitness', item: SITE + '/fitness' }, { '@type': 'ListItem', position: 2, name: "Coach's notes", item: SITE + '/fitness/notes' }, { '@type': 'ListItem', position: 3, name, item: SITE + '/fitness/' + slug }] })]; };
PAGES['fit-notes'].jsonld = [crumbs('notes', "Coach's notes")];
note('fit-note-warmup', 'notes/warm-up', 'Warm-up', 'A ten minute warm-up in four parts');
note('fit-note-bands', 'notes/band-workouts', 'Band workouts', 'A full resistance band workout');
note('fit-note-recovery', 'notes/recovery-room', 'Recovery room', 'The recovery room: what each tool is and what the research says');
note('fit-note-ac', 'notes/ac-joint', 'AC joint', 'A sore AC joint: what helps and where acupuncture fits');
PAGES['fit-path'].jsonld = [crumbs('path', 'The path'), ld('ItemList', { name: 'The five pillars', itemListElement: PATH.pillars.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p[1], description: p[2] })) })];
for (const [k, id] of [['boxing', 'fit-guide-boxing'], ['kickboxing', 'fit-guide-kickboxing'], ['pilates', 'fit-guide-pilates'], ['yoga', 'fit-guide-yoga']]) PAGES[id].count_word = guideN(k) > 20 ? String(guideN(k)) : capWord(guideN(k));
PAGES['fit-guides'].n_boxing = capWord(guideN('boxing')); PAGES['fit-guides'].n_kick = capWord(guideN('kickboxing')); PAGES['fit-guides'].n_pilates = capWord(guideN('pilates')); PAGES['fit-guides'].n_yoga = capWord(guideN('yoga'));
// One page per gym that has a profile (`p`) in guides.json. Every fact on it comes from p.src.
const GUIDE_META = { boxing: ['fit-guide-boxing', 'Boxing gym', 'Boxing gyms'], kickboxing: ['fit-guide-kickboxing', 'Kickboxing and Muay Thai gym', 'Kickboxing and Muay Thai gyms', 'More kickboxing and Muay Thai gyms'], pilates: ['fit-guide-pilates', 'Reformer Pilates studio', 'Reformer Pilates studios', 'More reformer Pilates studios'], yoga: ['fit-guide-yoga', 'Yoga studio', 'Yoga studios', 'More yoga studios'] };
GUIDE_META.boxing[3] = 'More boxing gyms';
const GUIDE_CTA = { boxing: ['boxing', 'A gym class moves fast. Twelve private sessions with me cover stance, footwork and conditioning, so you walk into any gym on this list ready to keep up.'], kickboxing: ['kickboxing', 'A gym class moves fast. Twelve private sessions with me cover stance, footwork and conditioning, so you walk into any gym on this list ready to keep up.'], pilates: ['pilates', 'A group reformer class moves fast. Twelve private sessions with me build the core control, breathing and spring work first, so you walk into any studio on this list ready to keep up.'], yoga: ['mobility', 'A studio class moves at the pace of the room. Twelve private sessions with me build the mobility, breathing and basic postures first, so you walk into any studio on this list at ease.'] };
const REGION_NAME = { LA: 'Los Angeles', OC: 'Orange County', IE: 'Inland Empire' };
const CHECKED_DAY = new Date(GUIDES.checked + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
function gymBody(key, x) {
  const [gid, kind, plural] = GUIDE_META[key]; const g = GUIDES.guides[key]; const q = x.p; const unit = g.unit || 'gym';
  const ext = (href, text, cls) => '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + href + '" target="_blank" rel="noopener">' + text + '<span class="sr"> (opens in a new tab)</span></a>';
  const rows = [
    q.since ? ['Since', esc(q.since)] : null,
    ...(q.people || []).map(([role, name]) => [esc(role), esc(name)]),
    q.address ? ['Address', esc(q.address)] : null,
    q.offers ? ['What it offers', '<ul>' + q.offers.map((o) => '<li>' + esc(o) + '</li>').join('') + '</ul>'] : null,
    x.heat ? ['Room', ({ hot: 'Heated classes', none: 'No heated classes listed', both: 'Heated and unheated classes' })[x.heat]] : null,
    q.hours ? ['Hours', esc(q.hours)] : null,
    q.price ? ['Prices', esc(q.price)] : null,
    (x.site || x.instagram) ? ['Official links', [x.site ? ext(x.site, 'Official site') : '', x.instagram ? ext(x.instagram, 'Instagram') : ''].filter(Boolean).join(' · ')] : null,
    ['Last checked', '<time datetime="' + GUIDES.checked + '">' + CHECKED_DAY + '</time>'],
  ].filter(Boolean);
  const near = g.gyms.filter((y) => y.p && y !== x).sort((a, b) => (b.region === x.region) - (a.region === x.region)).slice(0, 4);
  return [
    '<section class="nf-hero sub nf-gd nf-gp" aria-labelledby="gp-h" style="padding-bottom:10px">', '  <div class="wrap">', '    <div>',
    '      <p class="nf-crumb"><a href="/fitness">Fitness</a> / <a href="/fitness/guides">Guides</a> / <a href="' + PAGES[gid].path + '">' + plural + '</a> / ' + esc(x.name) + '</p>',
    '      <p class="nf-k nf-bk-k nf-gp-k">' + gic(KEY_ICON[key]) + kind + ' · ' + esc(x.city) + ' · ' + REGION_NAME[x.region] + '</p>',
    '      <h1 id="gp-h" class="nf-gp-h1">' + esc(x.name) + '</h1>',
    '      <p class="nf-lede">' + esc(x.known) + (q.about ? ' ' + esc(q.about) : '') + '</p>',
    '      <div class="nf-ctas">' + (x.site ? ext(x.site, 'Visit the official site', 'nf-btn') : '') + (x.instagram ? ext(x.instagram, 'See its Instagram', 'nf-btn') : '') + (x.lat ? '<a class="nf-btn" href="/fitness/guides/near-me?focus=' + q.slug + '">See it on the map</a>' : '') + '</div>',
    '      <p class="nf-gp-ck">Checked ' + CHECKED_DAY + ' · Independent profile · No paid placement</p>',
    '    </div>', '  </div>', '</section>', '',
    '<section class="nf-sec tight" aria-labelledby="gp-facts">', '  <div class="wrap nf-gp-grid">',
    '    <div>',
    '      <h2 id="gp-facts" class="nf-gp-h2">The facts</h2>',
    '      <dl class="nf-gp-dl">' + rows.map(([k, v]) => '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>').join('') + '</dl>',
    '      <p class="nf-note nf-gp-src"><b>Where this comes from:</b> ' + q.src.map(([t, u]) => ext(u, esc(t))).join(' · ') + '. Hours, prices and coaches change, so confirm with the ' + unit + ' before you go. NJS Fitness is not affiliated with ' + esc(x.name) + '. Something wrong or out of date? <a href="/fitness/book">Tell me</a>.</p>',
    '    </div>',
    '    <aside class="nf-gp-me" aria-labelledby="gp-me">',
    '      <p class="nf-k">From the coach who wrote this</p>',
    '      <h2 id="gp-me">Learn the basics one on one first.</h2>',
    '      <p>' + GUIDE_CTA[key][1] + '</p>',
    '      <a class="nf-btn nf-coral" href="/fitness/book?pack=12&focus=' + (key === 'boxing' ? 'boxing' : 'kickboxing') + '">Book your first session</a>',
    '      <p class="nf-gp-me-n">Pay nothing today. I confirm by email.</p>',
    '    </aside>',
    '  </div>', '</section>', '',
    '<section class="nf-sec tight" aria-labelledby="gp-more">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">Keep looking</p><h2 id="gp-more">' + GUIDE_META[key][3] + '</h2></div><p><a class="nf-gp-all" href="' + PAGES[gid].path + '">See the full list</a></p></div>',
    '    <div class="nf-cards c2">' + near.map((y) => '<a class="nf-card" href="/fitness/guides/gyms/' + y.p.slug + '"><p class="nf-k">' + esc(y.city) + ' · ' + y.region + '</p><h3>' + esc(y.name) + '</h3><p>' + esc(y.known) + '</p><span class="nf-more">Open the profile</span></a>').join('') + '</div>',
    '  </div>', '</section>'].join('\n');
}
for (const key of Object.keys(GUIDE_META)) for (const x of GUIDES.guides[key].gyms) {
  if (!x.p) continue;
  const [gid, kind, plural] = GUIDE_META[key]; const slug = 'guides/gyms/' + x.p.slug; const id = 'fit-gym-' + x.p.slug;
  PAGES[id] = { ...fitPage(slug, x.name, x.name + ', ' + x.city + ': Coaches, Classes and Official Links · NJS Fitness',
    x.name + ' in ' + x.city + ': who runs it, what it offers, the address and its official links. Checked ' + CHECKED_DAY + '. An independent profile by a working coach.', null), tpl: 'fit-gym', gymref: [key, x] };
  const founder = (x.p.people || []).find(([role]) => /^Founder/.test(role));
  PAGES[id].jsonld = [
    ld('SportsActivityLocation', Object.assign({ name: x.name, description: x.known, address: Object.assign({ '@type': 'PostalAddress', addressLocality: x.city, addressRegion: 'CA', addressCountry: 'US' }, x.p.address ? { streetAddress: x.p.address } : {}) },
      x.site ? { url: x.site } : {}, x.instagram ? { sameAs: [x.instagram] } : {}, x.p.since ? { foundingDate: x.p.since } : {}, founder ? { founder: { '@type': 'Person', name: founder[1].split(',')[0] } } : {})),
    ld('WebPage', { name: PAGES[id].og_title, url: SITE + PAGES[id].path, dateModified: GUIDES.checked, author: COACH, isPartOf: { '@type': 'WebPage', url: SITE + PAGES[gid].path } }),
    ld('BreadcrumbList', { itemListElement: [['Fitness', '/fitness'], ['Guides', '/fitness/guides'], [plural, PAGES[gid].path], [x.name, PAGES[id].path]].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })) })];
}
for (const [k, id] of [['boxing', 'fit-guide-boxing'], ['kickboxing', 'fit-guide-kickboxing'], ['pilates', 'fit-guide-pilates'], ['yoga', 'fit-guide-yoga']]) PAGES[id].art = k;
PAGES['fit-near'].art = 'near'; PAGES['fit-guides'].art = 'hub';
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
    '    <div class="nf-h"><div><p class="nf-k">Your focus</p><h2 id="focus-h"><span>Your 12 sessions,</span><span>your choice.</span></h2></div><p>Pick one or two things you want from your 12 sessions. I build every session around them. Change your mind later and we change the plan.</p></div>',
    '    <ul class="nf-focus" data-nf-focus>', ...FOCUS.map(card), '    </ul>',
    '    <div class="nf-fbar" data-nf-fbar data-n="0"><svg class="nf-mini" viewBox="-40 -40 80 80" aria-hidden="true" data-nf-mini><polygon points="' + PATH.pillars.map((_, k) => wpt(k, 30).map((n, j) => Math.round((n - WC[j]) * 10) / 10).join(',')).join(' ') + '"/>' + PATH.pillars.map(([pid, name], k) => { const [x, y] = wpt(k, 30); return '<circle data-pl="' + pid + '" data-name="' + name + '" cx="' + Math.round((x - WC[0]) * 10) / 10 + '" cy="' + Math.round((y - WC[1]) * 10) / 10 + '" r="7"/>'; }).join('') + '</svg><p data-nf-fsum><b>Pick up to two</b>Tap a card to add it to your plan.</p><a class="nf-btn nf-ink" href="/fitness/book?pack=12" data-nf-fgo>Build my 12-pack</a></div>',
    '  </div>', '</section>'].join('\n');
}
function renderFocusForm() {
  return '      <fieldset class="wide"><legend>Your focus <span class="nf-fine" style="font-weight:400">(pick one or two)</span></legend><div class="nf-choice nf-choice-3">' +
    FOCUS.map(([id, name]) => '<label><input type="checkbox" name="focus" value="' + id + '"><span>' + esc(name) + '</span></label>').join('') + '</div></fieldset>';
}

// One gym guide: gyms as cards, grouped by region (or in Jay's order once he has ranked them), then the
// method, the sources and where Jay coaches. Outbound links open in a new tab.
const REGIONS = [['LA', 'Los Angeles'], ['OC', 'Orange County'], ['IE', 'Inland Empire']];
function renderGuide(key) {
  const g = GUIDES.guides[key];
  if (!g) throw new Error('no guide ' + key);
  const ranked = guideRanked(g); const unit = g.unit || 'gym'; const Unit = unit[0].toUpperCase() + unit.slice(1);
  const day = new Date(GUIDES.checked + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const count = (r) => g.gyms.filter((x) => x.region === r).length;
  const regs = REGIONS.filter(([r]) => count(r));
  const pad = (n) => String(n).padStart(2, '0');
  const links = (x) => (x.site || x.instagram || x.p)
    ? (x.p ? '<a class="nf-rk-prof" href="/fitness/guides/gyms/' + x.p.slug + '">Full profile<span class="sr"> of ' + esc(x.name) + '</span></a>' : '') + (x.site ? '<a href="' + x.site + '" target="_blank" rel="noopener">Official site<span class="sr"> for ' + esc(x.name) + ', opens in a new tab</span></a>' : '') + (x.instagram ? '<a href="' + x.instagram + '" target="_blank" rel="noopener">Instagram<span class="sr"> for ' + esc(x.name) + ', opens in a new tab</span></a>' : '')
    : '<span class="nf-rk-none">No official site found</span>';
  const row = (x, n) => '      <li class="nf-rk-row" data-region="' + x.region + '">' +
    (n ? '<p class="nf-rk-n" aria-label="Number ' + n + '">' + pad(n) + '</p>' : '') +
    '<div class="nf-rk-who"><h3>' + (x.p ? '<a href="/fitness/guides/gyms/' + x.p.slug + '">' + esc(x.name) + '</a>' : esc(x.name)) + '</h3><p class="nf-rk-where">' + esc(x.city) + (x.heat ? ' · ' + ({ hot: 'Heated', none: 'Not heated', both: 'Heated and not' })[x.heat] : '') + '</p></div>' +
    '<p class="nf-rk-reg"><span>' + x.region + '</span></p>' +
    '<div class="nf-rk-what"><p>' + esc(x.known) + '</p>' + (x.note ? '<p class="nf-rk-note"><b>Nathan:</b> ' + esc(x.note) + '</p>' : '') + '</div>' +
    '<p class="nf-rk-links">' + links(x) + '</p></li>';
  const band = (r, name) => '      <li class="nf-rk-band" data-region="' + r + '">' + regArt(r) + '<h2 id="gd-' + r.toLowerCase() + '">' + name + '</h2><span>' + pad(count(r)) + ' ' + unit + 's</span></li>';
  const rows = ranked ? guideOrder(g).map((x, i) => row(x, i + 1))
    : regs.flatMap(([r, name]) => [band(r, name), ...g.gyms.filter((x) => x.region === r).map((x) => row(x, 0))]);
  const lists = [
    '    <div class="nf-rk' + (ranked ? ' ranked' : '') + '" data-nf-rk>',
    '      <header class="nf-rk-mast"><p class="nf-rk-title">' + gic(KEY_ICON[key], 'nf-gi-lg') + (ranked ? 'The ' + g.gyms.length : 'The list') + '</p>' +
      '<p class="nf-rk-meta">' + esc(g.sport) + ' · Southern California · ' + pad(g.gyms.length) + ' ' + unit + 's · Checked ' + day + '</p></header>',
    '      <div class="nf-rk-bar"><div class="nf-rk-f" role="group" aria-label="Show a region">' +
      '<button type="button" data-rk-f="all" aria-pressed="true">All<small>' + pad(g.gyms.length) + '</small></button>' +
      regs.map(([r, name]) => '<button type="button" data-rk-f="' + r + '" aria-pressed="false">' + gic(r) + name + '<small>' + pad(count(r)) + '</small></button>').join('') + '</div>' +
      '<p class="nf-rk-how"><a class="nf-rk-tomap" href="/fitness/guides/near-me?show=' + KEY_TOP[key] + (key === 'boxing' ? '&kind=boxing' : key === 'kickboxing' ? '&kind=kick' : '') + '">' + gic('pin') + 'See them on the map</a>' + (ranked ? 'Ranked by a working coach. <a href="#method">How</a>' : 'Grouped by region, not ranked yet. <a href="#method">Why</a>') + '</p></div>',
    '      <div class="nf-rk-head" aria-hidden="true">' + (ranked ? '<span>Rank</span>' : '') + '<span>' + Unit + '</span><span>Region</span><span>Known for</span><span>Links</span></div>',
    '      <ol class="nf-rk-list">', ...rows, '      </ol>',
    '    </div>'];
  return ['<section class="nf-sec tight" aria-label="' + esc(g.sport) + ' ' + unit + 's">', '  <div class="wrap">', ...lists, '  </div>', '</section>', '',
    '<section class="nf-sec tight" id="method" aria-labelledby="gd-method">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">Method</p><h2 id="gd-method"><span>How this list</span><span>is made.</span></h2></div><p>Last checked ' + day + '.</p></div>',
    '    <div class="nf-cards c3">',
    '      <article class="nf-card"><p class="nf-num">01</p><h3>Facts come from sources.</h3><p>What a gym is known for comes from its own site, news coverage or a published directory, all listed below. ' + (ranked ? 'The order is mine.' : 'The list is grouped by region, not ranked: I add my own order as I get to know each gym.') + '</p></article>',
    '      <article class="nf-card"><p class="nf-num">02</p><h3>No paid placements.</h3><p>No gym paid or asked to be here. I do not copy star ratings; follow the link and read the reviews yourself.</p></article>',
    '      <article class="nf-card"><p class="nf-num">03</p><h3>Where I coach.</h3><p>I teach at UFC Gym Brea, 9Round in Rancho Santa Margarita and Club Studio in Corona, so I left them off this list. <a href="/fitness#where">See where I train clients.</a></p></article>',
    '    </div>',
    '    <p class="nf-note nf-gym-src"><b>Sources:</b> ' + g.sources.map(([t, u]) => '<a href="' + u + '" target="_blank" rel="noopener">' + esc(t) + '</a>').join(' · ') + '. A gym missing or changed? <a href="/fitness/book">Tell me</a>.</p>',
    '  </div>', '</section>'].join('\n');
}

// Guide graphics (Goldsmith): one stroke icon per kind, and hero art drawn from the guide's own counts.
const GICON = {
  boxing: '<path d="M7 11V7a4 4 0 0 1 8 0v1h1a3 3 0 0 1 3 3v2a5 5 0 0 1-3 4.6V20H8v-3.2A4 4 0 0 1 5 13a2 2 0 0 1 2-2z"/><path d="M15 8v4M8 20v1.5h8V20"/>',
  kick: '<circle cx="7" cy="5" r="2"/><path d="M7 8l3 5-3 7M10 13l9-2.5 1.5 2.5M7 8l-3 4"/>',
  reformer: '<rect x="2" y="13" width="20" height="3" rx="1.5"/><path d="M5 16v3M19 16v3M7 13V9h6v4M15 11h5M17.5 9v4"/>',
  mat: '<rect x="3" y="14" width="18" height="5" rx="2.5"/><path d="M7 14V8h12v6M10 11h6"/>',
  yoga: '<path d="M12 5c2 2.5 2 6 0 9-2-3-2-6.5 0-9zM12 14c-1-3-4-5-7-5 0 4 3 7 7 7M12 14c1-3 4-5 7-5 0 4-3 7-7 7M4 20h16"/>',
  hot: '<path d="M12 3c1 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2 1-3.6 2-4.6 0 2 1 3 2 3 0-3-1-5 1-8.9z"/>',
  pin: '<path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/>',
  run: '<circle cx="14" cy="4.5" r="2"/><path d="M13 8l-4 2.5-1.5 3.5M13 8l1.5 5-3.5 3-2 4.5M14.5 13l3.5 2 .5 4M13 8l4 1.5 2.5-2"/>',
  // The three regions: a palm for Los Angeles, surf for Orange County, mountains for the Inland Empire.
  LA: '<path d="M13 21c0-5-.5-8-2-11"/><path d="M11 10c-2.5-2-5-1.5-6.5.5M11 10c-.5-3 1-5 3.5-5.5M11 10c2.5-1.5 5.5-.5 6.5 2M11 10c-3 .5-4.5 3-4.5 5"/><path d="M5 21h14"/><circle cx="18.5" cy="5.5" r="1.8"/>',
  OC: '<path d="M7 11a5 5 0 0 1 10 0"/><path d="M12 3v1.5M5.5 5.5l1 1M18.5 5.5l-1 1"/><path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 19.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  IE: '<path d="M2 19l6-10 4 6 3-4 7 8z"/><path d="M6.6 11.4l1.4 1.2 1.6-1"/><circle cx="18" cy="6" r="2"/>',
};
// Larger, moving art for each region heading on a guide.
const REGION_ART = {
  LA: '<circle class="ra-sun" cx="74" cy="15" r="9" fill="#FF8A6B"/><path d="M40 44V26h8v18M50 44V18h9v26M61 44V30h7v14M70 44V24h8v20M80 44V32h8v12" fill="currentColor" opacity=".9"/><path d="M4 44h88" stroke="currentColor" stroke-width="2"/><path d="M22 44c0-12-1-19-4-26" stroke="currentColor" stroke-width="2.5"/><g class="ra-frond" stroke="#1F8A7D" stroke-width="2.5"><path d="M18 18c-5-4-10-3-13 1M18 18c-1-6 2-10 7-11M18 18c5-3 11-1 13 4M18 18c-6 1-9 6-9 10M18 18c4 1 7 5 7 9"/></g>',
  OC: '<path class="ra-sun" d="M36 27a12 12 0 0 1 24 0z" fill="#FF8A6B"/><path d="M48 6v4M30 12l3 3M66 12l-3 3" stroke="#FF8A6B" stroke-width="2.5"/><g class="ra-wave" stroke="#1F8A7D" stroke-width="2.5"><path d="M-12 33c6-5 12-5 18 0s12 5 18 0 12-5 18 0 12 5 18 0 12-5 18 0 12 5 18 0 12-5 18 0"/></g><g class="ra-wave ra-w2" stroke="currentColor" stroke-width="2.5"><path d="M-12 42c6-5 12-5 18 0s12 5 18 0 12-5 18 0 12 5 18 0 12-5 18 0 12 5 18 0 12-5 18 0"/></g>',
  IE: '<circle class="ra-sun" cx="20" cy="13" r="8" fill="#FF8A6B"/><path d="M2 44l24-30 14 18 10-12 22 24z" fill="currentColor"/><path d="M26 14l-7 8.8 5 3 3-3.4 4 3 1.6-2.8z" fill="#fff"/><path d="M82 44V22" stroke="currentColor" stroke-width="2.5"/><g class="ra-blades" stroke="#7A5BD0" stroke-width="2.5"><path d="M82 22V10M82 22v12M82 22H70M82 22h12"/></g><circle cx="82" cy="22" r="2.4" fill="currentColor"/><path d="M0 44h96" stroke="currentColor" stroke-width="2"/>',
};
const regArt = (r) => '<svg class="nf-ra nf-ra-' + r.toLowerCase() + '" viewBox="0 0 96 48" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + REGION_ART[r] + '</svg>';
const KEY_ICON = { boxing: 'boxing', kickboxing: 'kick', pilates: 'reformer', yoga: 'yoga' };
const gic = (name, cls) => '<svg class="nf-gi' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + GICON[name] + '</svg>';
const ART_FONT = 'font-family="Inter Tight, Inter, sans-serif"';
function artRank(key) {
  const g = GUIDES.guides[key]; const rows = ['LA', 'OC', 'IE'].map((r) => [r, g.gyms.filter((x) => x.region === r).length]);
  const max = Math.max(...rows.map(([, n]) => n), 1);
  return '    <div class="nf-hero-art nf-bk-art"><figure class="nf-art nf-art-rank" aria-hidden="true"><svg viewBox="0 0 360 260" fill="none">' +
    '<rect x="8" y="8" width="344" height="244" rx="26" fill="#121416"/><rect x="28" y="30" width="304" height="5" rx="2.5" fill="#FF8A6B"/>' +
    '<text x="28" y="74" ' + ART_FONT + ' font-size="28" font-weight="700" fill="#F6F3EE" letter-spacing="-1">The list</text>' +
    '<text x="28" y="94" font-family="ui-monospace, monospace" font-size="10.5" fill="#8E9389" letter-spacing="1.4">' + String(g.gyms.length).padStart(2, '0') + ' ' + (g.unit || 'gym').toUpperCase() + 'S · SOUTHERN CALIFORNIA</text>' +
    '<circle cx="306" cy="70" r="26" fill="#FF8A6B"/><g transform="translate(288 52) scale(1.5)" stroke="#121416" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + GICON[KEY_ICON[key]] + '</g>' +
    rows.map(([r, n], i) => { const y = 116 + i * 42; const w = Math.max(18, Math.round((n / max) * 212));
      return '<g class="rk-r rk-r' + i + '"><text x="28" y="' + (y + 21) + '" ' + ART_FONT + ' font-size="24" font-weight="700" fill="#F6F3EE">' + r + '</text>' +
        '<rect x="78" y="' + (y + 3) + '" width="212" height="22" rx="11" fill="#1E2124"/><rect class="rk-bar" x="78" y="' + (y + 3) + '" width="' + w + '" height="22" rx="11" fill="' + (i === 0 ? '#FF8A6B' : i === 1 ? '#7FD3C8' : '#C9CCC4') + '"/>' +
        '<text x="332" y="' + (y + 20) + '" text-anchor="end" font-family="ui-monospace, monospace" font-size="14" font-weight="600" fill="#C9CCC4">' + String(n).padStart(2, '0') + '</text></g>'; }).join('') +
    '</svg></figure></div>';
}
function artNear() {
  const pin = (x, y, fill, ic) => '<g class="nr-pin" transform="translate(' + x + ' ' + y + ')"><circle r="15" fill="' + fill + '"/><g transform="translate(-9.6 -9.6) scale(.8)" stroke="#121416" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + GICON[ic] + '</g></g>';
  return '    <div class="nf-hero-art nf-bk-art"><figure class="nf-art nf-art-near" aria-hidden="true"><svg viewBox="0 0 360 260" fill="none">' +
    '<rect x="8" y="8" width="344" height="244" rx="26" fill="#121416"/>' +
    '<g stroke="#1E2124" stroke-width="1">' + [60, 110, 160, 210].map((y) => '<path d="M24 ' + y + 'H336"/>').join('') + [80, 140, 200, 260, 320].map((x) => '<path d="M' + x + ' 24V236"/>').join('') + '</g>' +
    '<g stroke="#3B3F44" stroke-width="1.5"><circle cx="150" cy="140" r="38"/><circle cx="150" cy="140" r="74"/><circle cx="150" cy="140" r="110" stroke-dasharray="3 6"/></g>' +
    '<circle class="nr-pulse" cx="150" cy="140" r="38" stroke="#FF8A6B" stroke-width="2"/>' +
    '<path class="nr-route" d="M150 140L212 96" stroke="#FF8A6B" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 6"/>' +
    pin(212, 96, '#FF8A6B', 'boxing') + pin(92, 84, '#7FD3C8', 'yoga') + pin(254, 176, '#C9CCC4', 'reformer') + pin(84, 196, '#C9CCC4', 'kick') + pin(296, 70, '#7FD3C8', 'yoga') +
    '<circle cx="150" cy="140" r="9" fill="#F6F3EE"/><circle cx="150" cy="140" r="4" fill="#FF8A6B"/>' +
    '<g class="nr-tag"><rect x="222" y="112" width="74" height="26" rx="13" fill="#F6F3EE"/><text x="259" y="129.5" text-anchor="middle" ' + ART_FONT + ' font-size="13" font-weight="700" fill="#121416">1.6 miles</text></g>' +
    '</svg></figure></div>';
}
// Near me: every place from every guide in one list. The page sorts it by distance in the browser;
// the visitor's position never leaves the device.
const HEAT = { hot: 'Heated', none: 'No heated classes listed', both: 'Heated and not heated' };
const NEAR_CATS = [['boxing', 'Boxing'], ['kick', 'Kickboxing and Muay Thai'], ['reformer', 'Reformer Pilates'], ['mat', 'Mat Pilates'], ['yoga', 'Yoga']];
const NEAR_AREAS = [['Brea', 33.9167, -117.9001], ['Anaheim', 33.8366, -117.9143], ['Irvine', 33.6846, -117.8265], ['Newport Beach', 33.6189, -117.9298], ['Rancho Santa Margarita', 33.6409, -117.6031], ['Corona', 33.8753, -117.5664], ['Riverside', 33.9806, -117.3755], ['Rancho Cucamonga', 34.1064, -117.5931], ['Temecula', 33.4936, -117.1484], ['Downtown Los Angeles', 34.0407, -118.2468], ['Hollywood', 34.0928, -118.3287], ['Santa Monica', 34.0195, -118.4912], ['North Hollywood', 34.1870, -118.3813], ['Pasadena', 34.1478, -118.1445], ['Long Beach', 33.7701, -118.1937]];
// The filter tree: a branch, then its kinds. Tokens land in each row's data-cat.
const NEAR_TREE = [
  ['strike', 'Striking and MMA', 'boxing', [['boxing', 'Boxing'], ['kick', 'Kickboxing and Muay Thai'], ['bjj', 'Jiu-jitsu'], ['mma', 'MMA']]],
  ['pilates', 'Pilates', 'reformer', [['reformer', 'Reformer'], ['mat', 'Mat']]],
  ['yoga', 'Yoga', 'yoga', [['hot', 'Hot yoga'], ['nothot', 'Not hot']]],
];
const NEAR_LABEL = { boxing: 'Boxing', kick: 'Kickboxing and Muay Thai', bjj: 'Jiu-jitsu', mma: 'MMA', reformer: 'Reformer Pilates', mat: 'Mat Pilates', yoga: 'Yoga' };
const KEY_TOP = { boxing: 'strike', kickboxing: 'strike', grappling: 'strike', pilates: 'pilates', yoga: 'yoga' };
function nearCats(key, x) {
  const t = ((x.p && x.p.offers) || []).join(' | ') + ' | ' + x.known;
  const has = (re) => re.test(t);
  const out = [];
  if (x.kinds) out.push(...x.kinds);
  if (key === 'boxing') out.push('boxing');
  if (key === 'kickboxing') out.push('kick');
  if (KEY_TOP[key] === 'strike') {
    if (has(/muay thai|kickboxing/i)) out.push('kick');
    if (has(/(^|[^k])boxing/i)) out.push('boxing');
    if (has(/jiu.?jitsu|\bbjj\b/i)) out.push('bjj');
    if (has(/\bmma\b|mixed martial/i)) out.push('mma');
  }
  if (key === 'pilates') out.push('reformer');
  if (key === 'yoga') { out.push('yoga'); if (x.heat === 'hot' || x.heat === 'both') out.push('hot'); if (x.heat === 'none' || x.heat === 'both') out.push('nothot'); }
  if (key === 'pilates' || key === 'yoga') { if (has(/\bmat (pilates|work|class)\b|mat pilates/i)) out.push('mat'); if (key === 'yoga' && has(/reformer/i)) out.push('reformer'); }
  const kinds = [...new Set(out)];
  const tops = NEAR_TREE.filter(([, , , subs]) => subs.some(([c]) => kinds.includes(c)) || kinds.includes('yoga') && subs.some(([c]) => c === 'hot')).map(([id]) => id);
  return { kinds, tops: [...new Set([KEY_TOP[key], ...tops])] };
}
// Animated tile art for the branch picker (Goldsmith). Colour comes from the tile's --top.
const TILE_ART = {
  all: '<svg viewBox="0 0 120 84" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 66c18-10 30 6 50-4s28-16 54-6" stroke="currentColor" stroke-width="2" stroke-dasharray="3 6" opacity=".5"/>' +
    '<g class="ta-pin ta-p1"><path d="M30 52s-11-10-11-19a11 11 0 0 1 22 0c0 9-11 19-11 19z" fill="#E0563A"/><circle cx="30" cy="33" r="4" fill="#fff"/></g>' +
    '<g class="ta-pin ta-p2"><path d="M62 44s-13-12-13-23a13 13 0 0 1 26 0c0 11-13 23-13 23z" fill="#1F8A7D"/><circle cx="62" cy="21" r="5" fill="#fff"/></g>' +
    '<g class="ta-pin ta-p3"><path d="M94 56s-11-10-11-19a11 11 0 0 1 22 0c0 9-11 19-11 19z" fill="#7A5BD0"/><circle cx="94" cy="37" r="4" fill="#fff"/></g></svg>',
  strike: '<svg viewBox="0 0 120 84" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M58 4h40" stroke="currentColor" stroke-width="3"/>' +
    '<g class="ta-bag"><path d="M78 4v12" stroke="currentColor" stroke-width="2.5"/><rect x="64" y="16" width="28" height="52" rx="12" fill="var(--top)"/><path d="M64 30h28M64 54h28" stroke="#fff" stroke-width="2" opacity=".55"/></g>' +
    '<g class="ta-glove"><path d="M12 40h18a12 12 0 0 1 12 12v2a10 10 0 0 1-10 10H16a6 6 0 0 1-6-6V42a2 2 0 0 1 2-2z" fill="currentColor"/><path d="M10 50H4M10 58H2" stroke="currentColor" stroke-width="2.5"/></g>' +
    '<g class="ta-hit" stroke="var(--top)" stroke-width="2.5"><path d="M52 34l-5-6M50 46h-8M53 58l-5 6"/></g></svg>',
  pilates: '<svg viewBox="0 0 120 84" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="56" width="104" height="8" rx="4" fill="currentColor"/><path d="M16 64v12M104 64v12" stroke="currentColor" stroke-width="3"/>' +
    '<path d="M100 56V30h8v26" stroke="currentColor" stroke-width="3"/><g class="ta-spring" stroke="var(--top)" stroke-width="2.5"><path d="M100 44l-6-4-6 8-6-8-6 8-6-8"/></g>' +
    '<g class="ta-carriage"><rect x="22" y="44" width="44" height="12" rx="5" fill="var(--top)"/><rect x="26" y="34" width="16" height="10" rx="4" fill="currentColor"/><circle cx="58" cy="34" r="6" fill="currentColor"/></g></svg>',
  yoga: '<svg viewBox="0 0 120 84" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="ta-heat" stroke="var(--top)" stroke-width="2.5" opacity=".7"><path d="M22 34c-5-6 5-9 0-15"/><path d="M98 34c-5-6 5-9 0-15"/><path d="M60 12c-4-4 4-6 0-10" opacity=".7"/></g>' +
    '<g class="ta-sit"><circle cx="60" cy="24" r="8" fill="currentColor"/><path d="M60 34c-9 0-14 8-15 20h30c-1-12-6-20-15-20z" fill="var(--top)"/><path d="M45 50c-10 3-16 7-20 12M75 50c10 3 16 7 20 12" stroke="currentColor" stroke-width="5"/>' +
    '<path d="M28 68c12-8 24-10 32-10s20 2 32 10" stroke="currentColor" stroke-width="7"/></g><path d="M14 78h92" stroke="currentColor" stroke-width="2" opacity=".35"/></svg>',
};
TILE_ART.run = '<svg viewBox="0 0 120 84" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M96 66V30l10-6" stroke="currentColor" stroke-width="3"/><rect x="10" y="62" width="92" height="9" rx="4.5" fill="currentColor"/>' +
  '<g class="ta-belt" stroke="#fff" stroke-width="2" opacity=".7"><path d="M20 66.5h6M36 66.5h6M52 66.5h6M68 66.5h6M84 66.5h6"/></g>' +
  '<g class="ta-run"><circle cx="58" cy="16" r="7" fill="currentColor"/><path d="M56 26l-10 8-4 10M56 26l4 16-12 8-6 11M60 42l12 5 2 13M56 26l12 5 8-7" stroke="var(--top)" stroke-width="5"/></g>' +
  '<g class="ta-hit" stroke="var(--top)" stroke-width="2.5"><path d="M30 24H18M26 36H12M30 48H20"/></g></svg>';
const GUIDE_OF = { boxing: ['fit-guide-boxing', 'Boxing guide'], kickboxing: ['fit-guide-kickboxing', 'Kickboxing guide'], pilates: ['fit-guide-pilates', 'Pilates guide'], yoga: ['fit-guide-yoga', 'Yoga guide'] };
// One emblem per home gym, drawn for this site (no gym logos): a ring and heavy bag, a nine-station round clock,
// and studio lights over a dumbbell. Each has its own accent colour, used for its card and its map pin.
const HOME_ART = {
  brea: ['#FF8A6B', '<svg class="nf-gx nf-gx-brea" viewBox="0 0 64 64" fill="none" aria-hidden="true" data-gx="gx-brea"><defs><clipPath id="gx-brea"><circle cx="32" cy="32" r="27"/></clipPath></defs><circle class="gx-orbit" cx="32" cy="32" r="30.5" stroke="#FF8A6B" stroke-width="1.5" stroke-dasharray="2 5"/><circle cx="32" cy="32" r="27.5" fill="#1D2126" stroke="#FF8A6B" stroke-width="2.5"/><g clip-path="url(#gx-brea)"><path d="M4 50h56v14H4z" fill="#2A2F36"/><path d="M10 28v24M54 28v24" stroke="#F4EFE9" stroke-width="3.5" stroke-linecap="round"/><path d="M10 33h44M10 39h44M10 45h44" stroke="#FF8A6B" stroke-width="1.8"/><rect x="7.5" y="26" width="5" height="6" rx="1.5" fill="#FF8A6B"/><rect x="51.5" y="26" width="5" height="6" rx="1.5" fill="#FF8A6B"/><g class="gx-bag"><path d="M32 2v11" stroke="#F4EFE9" stroke-width="1.6"/><rect x="25.5" y="13" width="13" height="24" rx="6" fill="#FF8A6B" stroke="#121416" stroke-width="1.2"/><path d="M26 19h12M26 31h12" stroke="#121416" stroke-width="1.4" opacity=".55"/><path d="M29.5 17v15" stroke="#fff" stroke-width="2" opacity=".4" stroke-linecap="round"/></g><g class="gx-hit" stroke="#FFE0B8" stroke-width="2.2" stroke-linecap="round"><path d="M45 15l4-3M47 22h5M45 29l4 3"/></g></g></svg>'],
  rsm: ['#7FD3C8', '<svg class="nf-gx nf-gx-rsm" viewBox="0 0 64 64" fill="none" aria-hidden="true" data-gx="gx-rsm"><defs><clipPath id="gx-rsm"><circle cx="32" cy="32" r="27"/></clipPath></defs><circle class="gx-orbit" cx="32" cy="32" r="30.5" stroke="#7FD3C8" stroke-width="1.5" stroke-dasharray="2 5"/><circle cx="32" cy="32" r="27.5" fill="#1D2126" stroke="#7FD3C8" stroke-width="2.5"/><g clip-path="url(#gx-rsm)"><g class="gx-sts"><circle class="gx-st" style="--i:0" cx="32.0" cy="11.5" r="2.7"/><circle class="gx-st" style="--i:1" cx="45.2" cy="16.3" r="2.7"/><circle class="gx-st" style="--i:2" cx="52.2" cy="28.4" r="2.7"/><circle class="gx-st" style="--i:3" cx="49.8" cy="42.2" r="2.7"/><circle class="gx-st" style="--i:4" cx="39.0" cy="51.3" r="2.7"/><circle class="gx-st" style="--i:5" cx="25.0" cy="51.3" r="2.7"/><circle class="gx-st" style="--i:6" cx="14.2" cy="42.2" r="2.7"/><circle class="gx-st" style="--i:7" cx="11.8" cy="28.4" r="2.7"/><circle class="gx-st" style="--i:8" cx="18.8" cy="16.3" r="2.7"/></g><g class="gx-hand"><path d="M32 32V13" stroke="#FF8A6B" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="12" r="3.4" stroke="#FF8A6B" stroke-width="1.6"/></g><g class="gx-glove"><path d="M24.5 33.5c-3 0-3.6-4.6-.6-5.6" stroke="#7FD3C8" stroke-width="3.4" stroke-linecap="round"/><path d="M25 35c-2.5-7 1-13 7.5-13 4.5 0 7.5 3 7.5 7v5c0 3.5-2.5 6-6 6h-4c-2.5 0-4.5-2-5-5z" fill="#7FD3C8" stroke="#121416" stroke-width="1.2"/><rect x="27.5" y="39" width="10" height="5" rx="1.5" fill="#F4EFE9" stroke="#121416" stroke-width="1.2"/><path d="M30 27c2-1.5 5-1.5 7 0" stroke="#121416" stroke-width="1.4" stroke-linecap="round" opacity=".5"/></g></g></svg>'],
  corona: ['#B9A7F5', '<svg class="nf-gx nf-gx-corona" viewBox="0 0 64 64" fill="none" aria-hidden="true" data-gx="gx-corona"><defs><clipPath id="gx-corona"><circle cx="32" cy="32" r="27"/></clipPath></defs><circle class="gx-orbit" cx="32" cy="32" r="30.5" stroke="#B9A7F5" stroke-width="1.5" stroke-dasharray="2 5"/><circle cx="32" cy="32" r="27.5" fill="#1D2126" stroke="#B9A7F5" stroke-width="2.5"/><g clip-path="url(#gx-corona)"><path class="gx-beam gx-beam1" d="M12 6L20 54H40z" fill="#B9A7F5" opacity=".42"/><path class="gx-beam gx-beam2" d="M52 6L24 54H44z" fill="#FF8A6B" opacity=".34"/><path d="M4 50h56v14H4z" fill="#2A2F36"/><g class="gx-db"><path d="M22 27h20" stroke="#F4EFE9" stroke-width="3" stroke-linecap="round"/><rect x="16.5" y="19" width="5" height="16" rx="2" fill="#F4EFE9"/><rect x="42.5" y="19" width="5" height="16" rx="2" fill="#F4EFE9"/><rect x="12.5" y="22" width="4" height="10" rx="1.5" fill="#B9A7F5"/><rect x="47.5" y="22" width="4" height="10" rx="1.5" fill="#B9A7F5"/></g><rect class="gx-eq" style="--i:0" x="21.5" y="42" width="3" height="6" rx="1.2" fill="#B9A7F5"/><rect class="gx-eq" style="--i:1" x="26.0" y="38" width="3" height="10" rx="1.2" fill="#B9A7F5"/><rect class="gx-eq" style="--i:2" x="30.5" y="41" width="3" height="7" rx="1.2" fill="#B9A7F5"/><rect class="gx-eq" style="--i:3" x="35.0" y="37" width="3" height="11" rx="1.2" fill="#B9A7F5"/><rect class="gx-eq" style="--i:4" x="39.5" y="43" width="3" height="5" rx="1.2" fill="#B9A7F5"/><circle cx="12" cy="6.5" r="3" fill="#F4EFE9"/><circle cx="52" cy="6.5" r="3" fill="#F4EFE9"/></g></svg>'],
};
// What each branch adds to training with Jay, in the words of the five pillars on /fitness/path.
const ADDS = { yoga: 'Adds mobility', pilates: 'Adds control', run: 'Adds engine', strike: 'Adds skill' };
// Who runs a place shows in its mark: independents keep the teardrop pin, chains get a rounded square with initials
// (letters, not the company's logo) and a small link badge. The same marks are used on the map, in the list and in Run by.
const CHAIN_MONO = { corepower: 'CP', yogasix: 'Y6', ufc: 'UFC', '9round': '9R', rumble: 'RB', orangetheory: 'OT', stride: 'ST' };
const LINK_SVG = '<svg class="nf-link" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6.5 9.5l3-3M7 4.500l1-1a3 3 0 0 1 4.500 4.500l-1 1M9 11.500l-1 1A3 3 0 0 1 3.500 8l1-1"/></svg>'.replace(/(\d\.\d)00\b/g, '$1');
const markChain = (id) => '<span class="nf-mark nf-mark-chain"><b>' + CHAIN_MONO[id] + '</b>' + LINK_SVG + '</span>';
const MARK_INDIE = '<span class="nf-mark nf-mark-indie"><i></i></span>';
// One emblem per kind of place (Goldsmith): champagne line art on a jewel in the kind's colour. Drawn once as a
// sprite, used by every card, the colour key and the map cards. Coral strikes, teal Pilates, violet yoga, amber runs.
const KIND_NAME = { strike: 'Striking', pilates: 'Pilates', yoga: 'Yoga', run: 'Run and HIIT' };
const KIND_SPRITE = ('<svg class="nf-kx-sprite" width="0" height="0" aria-hidden="true" focusable="false">' + Object.entries(KIND_SYM).map(([k, d]) => '<symbol id="kx-' + k + '" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round">' + d + '</symbol>').join('') +
  '<symbol id="kx-laurel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20c-3-2-4.500-5.500-4-10M17 20c3-2 4.500-5.500 4-10"/><path d="M3.200 13.500c1.800-.400 3 .300 3.600 1.800M4.200 9.500c1.700.100 2.700 1 3 2.600M19.800 9.500c-1.700.100-2.700 1-3 2.600M20.800 13.500c-1.800-.400-3 .300-3.600 1.800M8.500 21h7"/><path d="M12 6.500l1.500 3 3.300.500-2.400 2.300.600 3.200-3-1.600-3 1.600.600-3.200-2.400-2.300 3.300-.500z" fill="currentColor" stroke="none"/></symbol></svg>').replace(/(\d\.\d)00\b/g, '$1');
const kx = (top, cls) => '<span class="nf-kx nf-top-' + top + (cls ? ' ' + cls : '') + '" aria-hidden="true"><svg viewBox="0 0 48 48"><use href="#kx-' + top + '"/></svg></span>';
const LAUREL = '<svg class="nf-laurel" viewBox="0 0 24 24" aria-hidden="true"><use href="#kx-laurel"/></svg>';
// Distance stops in miles: every mile up to five, then every five up to thirty. Index 0 is any distance.
const NEAR_MILES = [null, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30];
const TRY_WORD = { yoga: 'Yoga', pilates: 'Pilates', run: 'Intervals', strike: 'Striking' };
function renderNear() {
  const indie = Object.entries(GUIDES.guides).flatMap(([key, g]) => g.gyms.map((x) => ({ key, x, ...nearCats(key, x) })));
  const chained = Object.entries(CHAINS.chains).flatMap(([id, c]) => c.places.map(([name, city, region, address, lat, lng, url]) =>
    ({ chain: id, c, kinds: c.kinds, tops: [c.top], x: { name: c.name + ' ' + name, city, region, lat, lng, addr: address, site: url, known: c.label } })));
  const all = [...indie, ...chained].sort((a, b) => a.x.name.localeCompare(b.x.name));
  const brands = [['indie', 'Independent', indie.length, 'strike pilates yoga'], ...Object.entries(CHAINS.chains).map(([id, c]) => [id, c.name, c.places.length, c.top])];
  const n = (c) => all.filter((r) => r.kinds.includes(c) || r.tops.includes(c)).length;
  const pad = (v) => String(v).padStart(2, '0');
  const scored = all.some((r) => typeof r.x.score === 'number');
  const label = (r) => r.chain ? r.c.label : r.kinds.filter((c) => NEAR_LABEL[c]).map((c) => NEAR_LABEL[c]).join(' · ') + (r.x.heat ? ' · ' + HEAT[r.x.heat] : '');
  const addr = (x) => x.addr ? x.addr : (x.p && x.p.address && /\d/.test(x.p.address) ? x.p.address.split('. ')[0] : '');
  const dir = (x) => 'https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=' + encodeURIComponent(addr(x) ? x.name + ', ' + addr(x) : x.name + ', ' + x.city + ', CA');
  const row = (r) => { const x = r.x; const top = r.chain ? r.c.top : KEY_TOP[r.key]; const ic = r.chain ? r.c.ic : r.kinds.find((c) => GICON[c]) || 'pin'; const [gid, gname] = r.chain ? [] : GUIDE_OF[r.key];
    const g = r.chain ? null : GUIDES.guides[r.key]; const word = r.chain ? '' : gname.replace(/ guide$/, '').toLowerCase();
    const pick = r.chain ? '' : guideRanked(g) ? 'No. ' + x.rank + ' in my ' + word + ' ranking' : 'In my ' + word + ' guide';
    return '        <li class="nf-nr-row nf-top-' + top + '"' + (pick ? ' data-pick="' + pick + '"' : '') + ' data-top="' + top + '" data-ic="' + ic + '" data-cat="' + [...new Set([...r.tops, ...r.kinds])].join(' ') + '"' + (x.lat ? ' data-lat="' + x.lat + '" data-lng="' + x.lng + '"' : '') +
      ' data-region="' + x.region + '" data-brand="' + (r.chain || 'indie') + '"' + (r.chain ? ' data-mono="' + CHAIN_MONO[r.chain] + '"' : '') + ' data-nav="' + dir(x) + '"' + (addr(x) ? ' data-addr="' + esc(addr(x)) + '"' : '') + (x.p ? ' data-slug="' + x.p.slug + '"' + (x.p.since ? ' data-since="' + x.p.since + '"' : '') : '') + (typeof x.score === 'number' ? ' data-score="' + x.score + '"' : '') + '>' +
      '<div class="nf-nr-side">' + kx(top) + '<p class="nf-nr-d"><b>' + x.region + '</b><small></small></p></div>' +
      '<div class="nf-nr-main"><h3>' + (x.p ? '<a href="/fitness/guides/gyms/' + x.p.slug + '">' + esc(x.name) + '</a>' : esc(x.name)) + '</h3>' +
      '<p class="nf-nr-cat nf-top-' + top + '"><b class="nf-nr-kind">' + KIND_NAME[top] + '</b>' + (x.heat === 'hot' || x.heat === 'both' ? gic('hot') : '') + '<span>' + label(r).replace(new RegExp('^' + KIND_NAME[top] + '( · |$)'), '') + '</span></p>' +
      '<p class="nf-nr-tags">' + (pick ? '<a class="nf-nr-pick" href="' + PAGES[gid].path + '#gd-' + x.region.toLowerCase() + '">' + LAUREL + pick + '</a>' : '') + (ADDS[top] ? '<em class="nf-nr-adds">' + ADDS[top] + '</em>' : '') + (r.chain ? '<em class="nf-nr-own">' + LINK_SVG + 'Chain</em>' : '') + '</p>' +
      '<p class="nf-nr-where">' + esc(x.city) + (x.p && x.p.since ? ' · since ' + esc(x.p.since) : '') + '</p>' +
      (addr(x) ? '<p class="nf-nr-addr"><a href="' + dir(x) + '" target="_blank" rel="noopener">' + gic('pin') + '<span>' + esc(addr(x)) + '</span><span class="sr">, start navigation in Google Maps, opens in a new tab</span></a></p>' : '') +
      (r.chain ? '' : '<p class="nf-nr-known">' + esc(x.known) + '</p>') +
      '<p class="nf-rk-links">' + (x.lat ? '<button type="button" data-nr-show>Show on map</button>' : '') + '<a href="' + dir(x) + '" target="_blank" rel="noopener" data-nr-nav>Navigate<span class="sr"> to ' + esc(x.name) + ', opens in a new tab</span></a>' +
      (x.p ? '<a href="/fitness/guides/gyms/' + x.p.slug + '">Full profile<span class="sr"> of ' + esc(x.name) + '</span></a>' : x.site ? '<a href="' + x.site + '" target="_blank" rel="noopener">' + (r.chain ? 'Studio page' : 'Official site') + '<span class="sr"> for ' + esc(x.name) + ', opens in a new tab</span></a>' : '') +
      '</p></div></li>'; };
  const icons = '<template data-nr-icons>' + Object.keys(GICON).map((k) => '<span data-k="' + k + '">' + gic(k) + '</span>').join('') + '</template>';
  const tile = (id, name, sub) => '<button type="button" class="nf-tile nf-top-' + id + '" data-nr-top="' + id + '" aria-pressed="' + (id === 'all') + '">' + TILE_ART[id] +
    '<span class="nf-tile-t"><b>' + name + '</b><small>' + sub + '</small></span><span class="nf-tile-n">' + pad(id === 'all' ? all.length : n(id)) + '</span></button>';
  const regs = REGIONS.map(([r, name]) => [r, name, all.filter((q) => q.x.region === r).length]);
  // What sits within 10 straight-line miles of each gym Jay coaches at, by what it adds.
  const mi = (p, q) => { const R = (d) => d * Math.PI / 180; const h = Math.sin(R(q[0] - p[0]) / 2) ** 2 + Math.cos(R(p[0])) * Math.cos(R(q[0])) * Math.sin(R(q[1] - p[1]) / 2) ** 2; return 3958.8 * 2 * Math.asin(Math.sqrt(h)); };
  const topOf = (r) => r.chain ? r.c.top : KEY_TOP[r.key];
  const homes = Object.entries(COACH_GYMS).map(([id, g]) => { const close = all.filter((r) => r.x.lat && mi(g.at, [r.x.lat, r.x.lng]) <= 10);
    const tryTop = { brea: 'yoga', rsm: 'pilates', corona: 'run' }[id] || 'yoga';
    const within = (m) => all.filter((r) => r.x.lat && topOf(r) === tryTop && mi(g.at, [r.x.lat, r.x.lng]) <= m).length;
    const tryMi = [2, 3, 4, 5, 10, 15, 20].find((m) => within(m) >= 2) || 10;
    return { id, g, tryTop, tryMi, tryN: within(tryMi), near: [['yoga', 'yoga'], ['pilates', 'Pilates'], ['run', 'interval'], ['strike', 'striking']].map(([top, w]) => [close.filter((r) => topOf(r) === top).length, w]) }; });
  return ['<section class="nf-sec tight" aria-label="Places near you">', '  <div class="wrap">',
    '    <div class="nf-rk nf-nr" data-nf-near>',
    '      <div class="nf-nr-try" role="group" aria-label="Examples"><span>New here? Try one:</span>' + homes.map((h) => '<button type="button" data-nr-try data-slug="' + h.g.slug + '" data-top="' + h.tryTop + '" data-mi="' + NEAR_MILES.indexOf(h.tryMi) + '" style="--hg:' + HOME_ART[h.id][0] + '">' + HOME_ART[h.id][1].split('gx-' + h.id).join('gx-' + h.id + '-try') + '<span><b>' + TRY_WORD[h.tryTop] + ' within ' + h.tryMi + ' miles</b><small>of ' + esc(h.g.name) + '</small></span></button>').join('') + '</div>',
    '      <div class="nf-nr-loc"><p class="nf-nr-step"><b>1</b>Pick a spot: one of my gyms above, or your own</p>' +
      '<button type="button" class="nf-btn nf-coral" data-nr-geo>' + gic('pin') + 'Use my location</button><button type="button" class="nf-btn" data-nr-drop aria-pressed="false">Drop a pin</button>' +
      '<label class="nf-nr-pick"><span>or an area</span><select data-nr-city><option value="">Choose an area</option>' + NEAR_AREAS.map(([name, la, ln]) => '<option value="' + la + ',' + ln + '">' + name + '</option>').join('') + '</select></label>' +
      '<form class="nf-nr-addr" data-nr-addr role="search"><input type="search" name="q" placeholder="Or type an address or a city" aria-label="Address or city" autocomplete="street-address" enterkeyhint="search"><button type="submit" class="nf-btn">Find</button></form></div>',
    '      <div class="nf-nr-dist" data-nr-distbox><p class="nf-nr-step"><b>2</b>Set the distance</p>' +
      '<p class="nf-nr-dist-h"><span>Within</span><output data-nr-distout>any distance</output><span class="nf-nr-dist-of" data-nr-distnote>Pick a spot first.</span></p>' +
      '<div class="nf-nr-ruler" data-nr-ruler style="--p:0"><div class="nf-nr-ruler-track"><i class="nf-nr-ruler-fill"></i>' + NEAR_MILES.map((m, i) => '<i class="nf-nr-ruler-tick' + (i === 0 || i >= 5 ? ' big' : '') + (i > 5 ? ' z2' : '') + (i === 5 ? ' turn' : '') + '" style="--q:' + (i / (NEAR_MILES.length - 1)) + '"></i>').join('') +
      '<b class="nf-nr-ruler-thumb"><output class="nf-nr-ruler-bub" data-nr-bub>Any</output></b></div>' +
      '<input type="range" min="0" max="' + (NEAR_MILES.length - 1) + '" step="1" value="0" data-nr-dist aria-label="Distance in miles, drag to set">' +
      '<div class="nf-nr-ruler-nums">' + NEAR_MILES.map((m, i) => '<button type="button" data-tap="aux"' + (i > 5 ? ' class="z2"' : i === 5 ? ' class="turn"' : '') + ' data-nr-mi="' + i + '" style="--q:' + (i / (NEAR_MILES.length - 1)) + '" aria-pressed="' + (i === 0) + '" aria-label="' + (m ? m + (m === 1 ? ' mile' : ' miles') : 'Any distance') + '">' + (m || 'Any') + '</button>').join('') + '</div>' +
      '<p class="nf-nr-ruler-zones" aria-hidden="true"><span class="z1"><i></i>1 mile at a time</span><span class="z2"><i></i>5 miles at a time</span></p></div></div>',
    '      <div class="nf-nr-tiles" role="group" aria-label="What are you looking for"><p class="nf-nr-step"><b>3</b>Choose what you want</p>' + tile('all', 'Everything', 'All ' + all.length + ' places') +
      tile('strike', 'Striking and MMA', 'Skill · boxing, jiu-jitsu') + tile('pilates', 'Pilates', 'Control · reformer, mat') + tile('yoga', 'Yoga', 'Mobility · hot or not') + tile('run', 'Running and HIIT', 'Engine · intervals') + '</div>',
    '      <div class="nf-nr-by" role="group" aria-label="Run by"><p class="nf-nr-by-h">Run by</p><div class="nf-nr-by-s">' + brands.map(([id, name, c, tops]) => '<button type="button" class="nf-nr-brand" data-nr-brand="' + id + '" data-tops="' + tops + '" aria-pressed="false">' + (id === 'indie' ? MARK_INDIE : markChain(id)) + '<span><b>' + name + '</b><small>' + c + (id === 'indie' ? ' places' : ' studios') + '</small></span></button>').join('') + '</div></div>',
    '      <div class="nf-nr-tools"><button type="button" class="nf-nr-open" data-nr-sheet aria-expanded="false"><svg class="nf-gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/></svg>Filters<b data-nr-badge hidden>0</b></button>' +
      '<label class="nf-nr-sort"><span>Sort by</span><select data-nr-sort><option value="near">Closest first</option><option value="az">A to Z</option><option value="old">Longest running</option>' + (scored ? '<option value="score">My rating</option>' : '') + '</select></label>' +
      '<p class="nf-nr-status" data-nr-status role="status">' + all.length + ' places, A to Z. Share your location to see the closest first.</p></div>',
    '      <div class="nf-nr-shade" data-nr-shade hidden></div>',
    '      <div class="nf-nr-panel" data-nr-panel aria-label="Filters">',
    '        <div class="nf-nr-grab" aria-hidden="true"></div><p class="nf-nr-ptitle">Filters</p>',
    '        <fieldset class="nf-nr-fs nf-nr-fkind"><legend>Kind</legend><div class="nf-nr-kinds">' +
      '<p class="nf-nr-subhint" data-nr-sub="all">Pick Striking, Pilates or Yoga to choose kinds: boxing or jiu-jitsu, reformer or mat, hot or not.</p>' +
      '<p class="nf-nr-subhint" data-nr-sub="run" hidden>Treadmill and interval studios. Use Run by to pick Orangetheory or STRIDE.</p>' +
      NEAR_TREE.map(([id, name, , subs]) => '<div class="nf-nr-checks nf-top-' + id + '" role="group" aria-label="' + name + ' kinds" data-nr-sub="' + id + '" hidden>' +
        subs.map(([c, sn]) => '<button type="button" data-nr-kind="' + c + '" aria-pressed="false">' + (GICON[c] ? gic(c) : gic('yoga')) + '<span>' + sn + '</span><small>' + pad(n(c)) + '</small></button>').join('') + '</div>').join('') + '</div></fieldset>',
    '        <fieldset class="nf-nr-fs"><legend>Region</legend><div class="nf-nr-checks">' + regs.map(([r, name, c]) => '<button type="button" data-nr-reg="' + r + '" aria-pressed="false">' + gic(r) + '<span>' + name + '</span><small>' + pad(c) + '</small></button>').join('') + '</div></fieldset>',
    '        <div class="nf-nr-pfoot"><button type="button" class="nf-nr-clear" data-nr-clear>Clear all</button><button type="button" class="nf-btn nf-coral" data-nr-done>Show places</button></div>',
    '      </div>',
    // Three home gyms: the places Jay coaches at. Picking one centres the map on it; everything else is what sits around it.
    '      <section class="nf-nr-homes" data-nr-homes aria-labelledby="nr-homes-h">' +
      '<div class="nf-nr-homes-t"><p class="nf-k">Train with me</p><h2 id="nr-homes-h">Three home gyms.</h2>' +
      '<p class="nf-nr-homes-s" data-nr-home-sum>Pick one. The map centres on it and shows what is close by to round you out.</p></div>' +
      '<div class="nf-nr-homes-g">' + homes.map((h) => '<article class="nf-nr-home" style="--hg:' + HOME_ART[h.id][0] + '" data-hg="' + HOME_ART[h.id][0] + '" data-lat="' + h.g.at[0] + '" data-lng="' + h.g.at[1] + '" data-name="' + esc(h.g.name) + '" data-city="' + esc(h.g.city) + '" data-short="' + esc(h.g.short) + '" data-slug="' + h.g.slug + '" data-nav="https://www.google.com/maps/dir/?api=1&amp;travelmode=driving&amp;dir_action=navigate&amp;destination=' + encodeURIComponent(h.g.name + ', ' + h.g.city + ', CA') + '">' +
        '<button type="button" class="nf-nr-home-b" data-nr-home aria-pressed="false">' + HOME_ART[h.id][1] + '<span class="nf-nr-home-n"><b>' + esc(h.g.name) + '</b><small>' + esc(h.g.region) + ' · ' + esc(h.g.short) + '</small><small class="nf-nr-home-d" data-nr-home-d></small></span></button>' +
        '<p class="nf-nr-home-c">Within 10 miles: ' + h.near.map(([n, w]) => '<b>' + n + '</b> ' + w).join(', ') + '</p>' +
        '<a class="nf-nr-home-k" href="/fitness/book?loc=' + h.g.slug + '">Book here<span class="sr"> at ' + esc(h.g.name) + '</span></a></article>').join('') + '</div></section>',
    '      <div class="nf-nr-split" data-nr-split data-view="list">',
    '        <div class="nf-nr-listcol">' + KIND_SPRITE + '<div class="nf-nr-key" aria-label="What the colours mean"><p class="nf-nr-key-why"><b>I coach you at three gyms. This map is for the other days.</b> Add what one coach cannot cover alone: yoga for mobility, Pilates for control, intervals for your engine, a fight gym for skill.</p><p class="nf-nr-key-h">Read a card by its colour</p><ul>' + Object.keys(KIND_NAME).map((k) => '<li class="nf-top-' + k + '">' + kx(k) + '<span><b>' + KIND_NAME[k] + '</b><small>' + ADDS[k] + '</small></span></li>').join('') + '</ul><p class="nf-nr-key-p">' + LAUREL + '<span>The laurel marks a place from one of <a href="/fitness/guides">my gym guides</a>. Chains never carry it.</span></p></div><ol class="nf-nr-list" data-nr-list>', ...all.map(row), '        </ol><button type="button" class="nf-btn nf-nr-more" data-nr-more hidden>Show more</button></div>',
    '        <div class="nf-nr-mapbox"><div class="nf-nr-mapbar" role="group" aria-label="Move the map">' +
      '<button type="button" data-nr-fly="me">' + gic('pin') + 'Me</button><button type="button" data-nr-fly="all">All</button>' + ['LA', 'OC', 'IE'].map((r) => '<button type="button" data-nr-fly="' + r + '" aria-label="Move the map to ' + REGION_NAME[r] + '">' + gic(r) + r + '</button>').join('') + '' +
      '<button type="button" class="nf-nr-lucky" data-nr-fly="lucky">Surprise me</button><span class="nf-nr-inview" data-nr-inview aria-live="polite"></span></div>' +
      '<div class="nf-nr-mapwrap"><div class="nf-nr-find" data-nr-find><label class="nf-nr-find-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input type="text" inputmode="search" enterkeyhint="search" data-nr-q role="combobox" aria-expanded="false" aria-controls="nr-sug" aria-autocomplete="list" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Try: yoga 4 miles from Brea" aria-label="Search the map. Type a kind, a distance, a place or an address"><button type="button" class="nf-nr-qx" data-nr-qx hidden aria-label="Clear the search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></label><div class="nf-nr-sug" id="nr-sug" role="listbox" aria-label="Suggestions" data-nr-sug hidden></div></div>' +
      '<div class="nf-nr-spots" role="group" aria-label="Measure from"><span>From</span>' + homes.map((h) => '<button type="button" data-nr-home-pin="' + h.g.slug + '" data-nr-spotbtn="' + h.g.slug + '" aria-pressed="false" style="--hg:' + HOME_ART[h.id][0] + '"><i></i>' + h.g.city.replace('Rancho Santa Margarita', 'RSM') + '</button>').join('') + '<button type="button" data-nr-geo data-nr-spotbtn="you" aria-pressed="false"><i class="me"></i>Me</button></div>' +
      '<div class="nf-nr-mapbtns"><button type="button" data-nr-full aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><span>Expand</span></button>' +
      '<button type="button" data-nr-drop aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s6-5.5 6-10a6 6 0 0 0-12 0c0 4.5 6 10 6 10z"/><path d="M12 8v6M9 11h6"/></svg><span>Drop a pin</span></button></div>' +
      '<div class="nf-nr-map" data-nr-map role="application" aria-label="Map of gyms and studios. Every place on it is also in the list."></div>' +
      '<div class="nf-nr-legend" aria-label="What the pins mean"><span><i class="lg-home"></i>My home gyms</span><span>' + MARK_INDIE + 'Independent</span><span><span class="nf-mark nf-mark-chain lg-chain">' + LINK_SVG + '</span>Chain</span><span><i class="lg-pick">' + LAUREL + '</i>In my guides</span></div>' +
      '<aside class="nf-nr-place" data-nr-place hidden aria-label="The place you picked"></aside><div class="nf-nr-fullbar" data-nr-fullbar><button type="button" class="nf-nr-sum" data-nr-deck aria-expanded="true"><span data-nr-sum>Every place on the map</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button></div>' +
      '<div class="nf-nr-cards" data-nr-cards aria-label="Places on the map, swipe to move the map"></div></div>' +
      '<p class="nf-nr-mapnote">Pins are placed by neighborhood, so tap Navigate for the exact door. Click the map once to zoom with the wheel. Drop a pin to measure from anywhere, and drag it to move.</p></div>',
    '      </div>',
    '      <div class="nf-nr-view" role="group" aria-label="List or map"><button type="button" data-nr-view="list" aria-pressed="true">List</button><button type="button" data-nr-view="map" aria-pressed="false">Map</button></div>',
    '      ' + icons,
    '      <p class="nf-note nf-gym-src">Distances are straight-line and approximate. Your position is used on this page only: I never receive or store it. The map loads street tiles from OpenStreetMap for the area you look at, and an address you type is sent to the OpenStreetMap search to find the spot. There are no star ratings here: I do not copy other sites\' scores. Chain studios come from each company\'s own location pages, checked ' + new Date(CHAINS.checked + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '; they are not ranked. The three gyms I coach at carry their own pin and are not ranked. Their pins sit at the city centre until I add each street address, so the counts around them are close, not exact. A place missing? <a href="/fitness/book">Tell me</a>.</p>',
    '    </div>', '  </div>', '</section>', '',
    '<section class="nf-sec tight" aria-labelledby="nr-lists">', '  <div class="wrap">',
    '    <div class="nf-h"><div><p class="nf-k">The full lists</p><h2 id="nr-lists">Every independent place is in a guide</h2></div><p>Each guide lists its places by region, with a profile page for nearly every one. Chain studios are on the map only.</p></div>',
    '    <div class="nf-cards c2">' + Object.entries(GUIDES.guides).map(([key, g]) => { const [gid] = GUIDE_OF[key];
      return '<div class="nf-card nf-nr-gcard"><p class="nf-k">' + pad(g.gyms.length) + ' ' + (g.unit || 'gym') + 's</p><h3><a href="' + PAGES[gid].path + '">' + esc(GUIDE_META[key][2]) + ' in Southern California</a></h3>' +
        '<p class="nf-nr-glinks">' + REGIONS.filter(([r]) => g.gyms.some((x) => x.region === r)).map(([r, name]) => '<a href="' + PAGES[gid].path + '#gd-' + r.toLowerCase() + '">' + gic(r) + name + '</a>').join('') + '</p></div>'; }).join('') + '</div>',
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
    if (m[1] === 'nf-focus') return renderFocus();
    if (m[1] === 'nf-focus-form') return renderFocusForm();
    if (m[1].startsWith('nf-tiles-')) return renderTiles(m[1].slice(9));
    if (m[1].startsWith('nf-fart-')) return renderFocusArt(m[1].slice(8));
    if (m[1].startsWith('nf-wheel-')) return renderWheel(m[1].slice(9));
    if (m[1].startsWith('nf-ladder-')) return renderLadder(m[1].slice(10));
    if (m[1].startsWith('nf-health-')) return renderHealth(m[1].slice(10));
    if (m[1].startsWith('nf-qa-')) return renderQa(m[1].slice(6));
    if (m[1].startsWith('nf-gear-')) return renderGear(m[1].slice(8));
    if (m[1] === 'nf-near') return renderNear();
    if (m[1] === 'nf-kinds') return '<ul class="nf-two-k">' + Object.keys(KIND_NAME).map((k) => '<li><a class="nf-top-' + k + '" href="/fitness/guides/near-me?show=' + k + '">' + kindJewel(k) + '<span><b>' + KIND_NAME[k] + '</b><small>' + ADDS[k] + '</small></span></a></li>').join('') + '</ul>';
    if (m[1].startsWith('nf-guide-')) return renderGuide(m[1].slice(9));
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
  const extra = { extra_css: page.css ? '<link rel="stylesheet" href="/assets/studio/' + page.css + '.css">' : fit ? '<link rel="stylesheet" href="/assets/studio/fitness.css">' + (id === 'fit-book' ? '\n<link rel="stylesheet" href="/assets/studio/booker.css">' : '') : '' };
  const vars = { ...page, ...cur, ...mode, ...extra, ...(page.gymref ? { gym_body: gymBody(...page.gymref) } : {}), ...(page.art ? { hero_art: page.art === 'near' || page.art === 'hub' ? artNear() : artRank(page.art) } : {}), jsonld: page.jsonld ? '<script type="application/ld+json">' + JSON.stringify(page.jsonld).replace(/</g, '\\u003c') + '</script>' : '' };
  let html = expand(read('pages/' + (page.tpl || id)), ['pages/' + id]);
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
