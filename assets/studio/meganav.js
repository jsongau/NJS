// MegaNav 2: each top link keeps working on its own (no JS needed), and a caret opens a panel
// with the deeper pages. Every panel ends on the next step: pick agents, start a plan, send it.
// Desktop opens on hover with a short intent delay; touch and keyboard use the caret button.
// Phones get the same map as an accordion inside the Menu drawer.
import { $, $$, esc, plural, weeksText, reduced } from './util.js';
import { icon } from './icons.js';
import { CLIENT_AGENTS, AGENT_FACES, CREW_ART } from './crewart.js';
import { ticketTier } from './delivered.js';
import { agentPicks } from './picks.js';
import { kindJewel } from './places.js';
import { RIGS } from './breathrigs.js';

const PLAN = {
  launch: { kick: 'A website, hosted', care: 'keep', line: 'Found nearby, takes bookings.' },
  grow: { kick: 'Customers log in and pay', care: 'tend', line: 'Accounts, payments, an AI helper.' },
  run: { kick: 'I work alongside you', care: 'run', line: 'Your dashboard and agents, run monthly.' },
};
const STEPS = [['s-business', 'Your business', 'pro', 'What you do and where'], ['s-package', 'Pick a plan', 'plan_grow', 'Basic, Premium or Partner'], ['s-features', 'Features and agents', 'bot', 'Pages, logins, agents'], ['s-size', 'How big', 'chart', 'Pages and people'], ['s-style', 'The look', 'pages', 'Colors, type and photos'], ['s-extras', 'Extras', 'bolt', 'CRM, offers and add-ons'], ['s-care', 'Care after launch', 'loop', 'Hosting and fixes, monthly']];
// Mini scenes for the funnel template cards: plain SVG, pink on ink, moving when the card is hovered or the panel opens.
const THUMB = {
  doors: '<svg viewBox="0 0 160 84" aria-hidden="true"><rect width="160" height="84" rx="12" fill="#121416"/><g fill="none" stroke="#3A3E43" stroke-width="2"><rect x="14" y="18" width="24" height="40" rx="12"/><rect x="46" y="18" width="24" height="40" rx="12"/></g><rect class="tm-lit" x="78" y="18" width="24" height="40" rx="12" fill="#FF4F9A"/><path class="tm-flow" d="M104 38h18" stroke="#FF8FC0" stroke-width="2" stroke-dasharray="3 4"/><rect x="124" y="22" width="24" height="32" rx="6" fill="#2A2D31"/><rect class="tm-card" x="128" y="27" width="16" height="7" rx="2" fill="#FF8FC0"/><rect x="128" y="38" width="16" height="4" rx="2" fill="#3A3E43"/><rect x="128" y="45" width="10" height="4" rx="2" fill="#3A3E43"/><path d="M14 68h88" stroke="#2A2D31" stroke-width="2"/></svg>',
  blocks: '<svg viewBox="0 0 160 84" aria-hidden="true"><rect width="160" height="84" rx="12" fill="#121416"/><rect x="18" y="12" width="124" height="62" rx="8" fill="#1C1F22" stroke="#3A3E43"/><rect class="tm-b1" x="26" y="20" width="70" height="8" rx="3" fill="#FF4F9A"/><rect class="tm-b2" x="26" y="33" width="108" height="10" rx="3" fill="#2A2D31"/><rect class="tm-b3" x="26" y="48" width="50" height="18" rx="4" fill="#2A2D31"/><rect class="tm-b4" x="82" y="48" width="52" height="18" rx="4" fill="#3A3E43"/><circle class="tm-cur" cx="120" cy="24" r="4" fill="#FF8FC0"/></svg>',
  ticket: '<svg viewBox="0 0 160 84" aria-hidden="true"><rect width="160" height="84" rx="12" fill="#121416"/><path d="M28 20h104v14a8 8 0 0 0 0 16v14H28V50a8 8 0 0 0 0-16z" fill="#1C1F22" stroke="#3A3E43"/><g class="tm-dig" font-family="ui-monospace,monospace" font-size="14" font-weight="700" fill="#121416"><rect x="44" y="30" width="18" height="24" rx="4" fill="#FF4F9A"/><rect x="68" y="30" width="18" height="24" rx="4" fill="#FF4F9A"/><rect x="92" y="30" width="18" height="24" rx="4" fill="#FF8FC0"/><text x="53" y="47" text-anchor="middle">06</text><text x="77" y="47" text-anchor="middle">13</text><text class="tm-tick" x="101" y="47" text-anchor="middle">17</text></g><path d="M118 26v32" stroke="#3A3E43" stroke-dasharray="2 3"/></svg>'
};
const TEMPLATES = [
  ['/funnels/memorial', 'doors', 'Intake funnel', 'Memorial and senior care: three doors, ten tools, one CRM'],
  ['/funnels/memorial/builder', 'blocks', 'Landing page builder', 'Nine starting pages, wording with sources, a rule check'],
  ['/ritual', 'ticket', 'Growth funnel', 'Sweepstakes entry, referrals, then a team buy']
];
// Small cards that close out a side column, so it ends where the panel content ends (no stretched empty card).
const mini = (href, ic, k, t, s, attrs) => '<a class="mn-mini" href="' + href + '"' + (attrs || '') + '><span class="mn-ico gic">' + icon(ic) + '</span><span class="mn-mini-t"><em>' + esc(k) + '</em><strong>' + esc(t) + '</strong><small>' + esc(s) + '</small></span>' + '<svg class="mn-arr" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></a>';
const STUDIO = [
  ['The studio', [['/care', 'team', 'Care plans', 'Hosting, fixes and updates after launch'], ['/crew', 'bot', 'The crew', 'Who builds it, human and agent'], ['/crew#runs', 'loop', 'How a build runs', 'Audit, plan, build, launch, care'], ['/resume', 'user', 'Résumé', 'Nathan J. Song, the builder']]],
  ['Before you start', [['/plans#faq', 'msg', 'Questions', 'Straight answers on scope and payment'], ['/build?call=1', 'cal', 'Request a call', 'Twenty minutes, no pitch deck'], ['/plans', 'star', "What's included", 'Every plan, side by side'], ['/work', 'mark', 'Delivered work', 'Live projects and what each one does']]],
  ['Templates and tools', [['/funnels', 'crm', 'Funnel templates', 'Intake and growth funnels to start from'], ['/funnels/memorial/builder', 'pages', 'Landing page builder', 'Pick a page, swap the wording'], ['/marketing-ops', 'chart', 'Ads and CRM', 'How I run Meta ads and pipelines'], ['/funnels/memorial/behind', 'bolt', 'The stack, wired', 'Meta, Zapier and GoHighLevel']]],
];

const caret = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrow = '<svg class="mn-arr" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const link = (href, ic, t, s) => '<li><a class="mn-link" href="' + href + '">' + (ic.startsWith('kx-') ? '<span class="mn-ico mn-kx">' + kindJewel(ic.slice(3)) + '</span>' : '<span class="mn-ico gic">' + icon(ic) + '</span>') + '<span class="mn-txt"><strong>' + esc(t) + '</strong><small>' + esc(s) + '</small></span></a></li>';

function agentsPanel() {
  const cards = CLIENT_AGENTS.map((a) => '<button type="button" class="mn-ag" data-ag="' + a.id + '" aria-pressed="false">' +
    '<span class="mn-face">' + AGENT_FACES[a.id] + '</span><span class="mn-ag-t"><strong>' + esc(a.name.replace(' agent', '')) + '</strong><small>' + esc(a.short) + '</small></span>' +
    '<span class="mn-add" aria-hidden="true"><i></i></span></button>').join('');
  const yours = '<a class="mn-ag mn-yours" href="/build?call=1" data-carry><span class="mn-face">' + AGENT_FACES.yours + '</span>' +
    '<span class="mn-ag-t"><strong>Your agent here</strong><small>Name the job you repeat every week. I scope an agent for it.</small></span>' + arrow + '</a>';
  return '<div class="mn-in mn-in-agents">' +
    '<div class="mn-main"><p class="mn-hd">Agents I build for your business <span class="mn-new">New</span></p>' +
    '<div class="mn-ags">' + cards + yours + '</div>' +
    '<p class="mn-note">Tap to add one to your plan. Each agent keeps a log and has an off switch.</p></div>' +
    '<aside class="mn-feat mn-feat-dark"><p class="mn-kick">How an agent ships</p>' +
    '<ol class="mn-ship"><li><b>Pick or describe it</b><span>Here, or on a call.</span></li><li><b>I scope it in writing</b><span>What it does, what it never does.</span></li><li><b>Built, watched, fixed</b><span>Checked nightly. Changes wait for your OK.</span></li></ol>' +
    '<p class="mn-count" data-mn="ag-count">No agents picked yet.</p>' +
    '<a class="btn btn-lime mn-go" href="/build" data-mn="ag-go">Build my plan</a>' +
    '<a class="mn-sub" href="/crew#agents">See every agent' + arrow + '</a></aside></div>';
}

function plansPanel(catalog) {
  const dep = catalog.flags && catalog.flags.deposit_enabled;
  const cards = catalog.tiers.map((t) => '<button type="button" class="mn-plan mn-plan-' + t.id + '" data-plan="' + t.id + '">' +
    '<span class="mn-plan-ic gic">' + icon('plan_' + t.id) + '</span><span class="mn-plan-k">' + esc(PLAN[t.id].kick) + '</span>' +
    '<strong>' + esc(t.label) + '</strong><small>' + esc(PLAN[t.id].line) + '</small><span class="mn-plan-go">Start with ' + esc(t.label) + arrow + '</span></button>').join('');
  return '<div class="mn-in mn-in-plans"><div class="mn-main"><p class="mn-hd">Three plans. Start with one, change it any time.</p>' +
    '<div class="mn-plans">' + cards + '</div>' +
    '<p class="mn-hd mn-hd-2">Add to any plan</p><ul class="mn-adds">' +
    link('/build#s-extras', 'crm', 'CRM lifecycle', 'Pipelines, follow-up and reviews') +
    link('/build#s-extras', 'tag', 'Offer landing pages', 'A page per offer, tracked to bookings') +
    link('/build#s-extras', 'search', 'Client acquisition', 'Ads and search set up for leads') +
    '</ul></div>' +
    '<div class="mn-side"><aside class="mn-feat"><p class="mn-kick">How paying works</p><ol class="mn-pay">' +
    '<li><b>Written plan and quote</b><span>Free. You see the scope before you pay anything.</span></li>' +
    '<li><b>Audit deposit</b><span>' + esc(catalog.deposit.label) + '.' + (dep ? '' : ' <em class="mn-soon">Opens soon</em>') + '</span></li>' +
    '<li><b>Care, month to month</b><span>Cancel any time. The site stays yours.</span></li></ol>' +
    '<a class="mn-sub" href="/care">Compare care plans' + arrow + '</a><a class="mn-sub" href="/plans">See full plans' + arrow + '</a></aside>' +
    mini('/build?call=1', 'cal', 'Not sure which?', 'Request a call', 'Twenty minutes, no pitch deck', ' data-carry') + '</div></div>';
}

function buildPanel() {
  const steps = STEPS.map(([id, t, ic, sub], i) => '<li><a class="mn-link mn-step" href="/build#' + id + '" data-step="' + id + '"><span class="mn-ico gic">' + icon(ic) + '</span><span class="mn-txt"><strong><span class="mn-n">' + String(i + 1).padStart(2, '0') + '</span>' + esc(t) + '</strong><small>' + esc(sub) + '</small></span></a></li>').join('') +
    '<li><a class="mn-link mn-step mn-step-call" href="/build?call=1" data-carry><span class="mn-ico gic">' + icon('cal') + '</span><span class="mn-txt"><strong>Rather talk it through?</strong><small>Twenty minutes, no pitch deck</small></span></a></li>';
  const tpl = TEMPLATES.map(([href, th, t, sub]) => '<a class="mn-tcard" href="' + href + '"><span class="mn-thumb">' + THUMB[th] + '</span><strong>' + esc(t) + '</strong><small>' + esc(sub) + '</small></a>').join('');
  return '<div class="mn-in mn-in-build"><div class="mn-main"><p class="mn-hd">Seven steps, about three minutes</p><ol class="mn-steps">' + steps + '</ol>' +
    '<p class="mn-hd mn-hd-2">Funnel build templates <a class="mn-hd-link" href="/funnels">All templates' + arrow + '</a></p><div class="mn-tcards">' + tpl + '</div></div>' +
    '<div class="mn-side"><aside class="mn-feat"><p class="mn-kick">Your plan so far</p><div class="mn-so" data-mn="so"></div>' +
    '<a class="btn btn-lime mn-go" href="/build" data-carry>Continue my plan</a></aside>' +
    mini('/funnels/memorial/builder', 'pages', 'New', 'Build a landing page', 'Nine starting pages, live preview') +
    mini('/funnels/memorial/behind', 'bolt', 'See it wired', 'Meta, Zapier, GoHighLevel', 'One lead, traced end to end') +
    mini('/work', 'mark', 'Proof', 'Delivered work', 'Live projects, each with its scope') +
    mini('/plans#faq', 'msg', 'Before you start', 'Questions, answered', 'Scope, payment and who owns what') + '</div></div>';
}

function workPanel(projects) {
  const rows = projects.projects.map((p) => {
    const t = ticketTier(p);
    const mark = p.logo ? '<img src="' + esc(p.logo) + '" alt="" width="40" height="40" loading="lazy">' : '<b style="background:' + esc(p.color) + '">' + esc(p.mono) + '</b>';
    return '<li><a class="mn-case" href="/work#p-' + p.id + '"><span class="mn-logo">' + mark + '</span><span class="mn-txt"><strong>' + esc(p.name) + ' <span class="mn-tier mn-tier-' + t.id + '">' + esc(t.name) + '</span></strong><small>' + esc(p.job) + '</small></span></a></li>';
  }).join('');
  return '<div class="mn-in mn-in-work"><div class="mn-main"><p class="mn-hd">Delivered projects</p><ul class="mn-cases">' + rows + '</ul></div>' +
    '<div class="mn-side"><aside class="mn-feat"><p class="mn-kick">Every case shows its scope</p><p class="mn-p">What was delivered, the results, and which plan it maps to.</p>' +
    '<a class="btn mn-go" href="/work">See all work</a></aside>' +
    mini('/build', 'plan_launch', 'Start', 'A project like these', 'Pick the closest case and its plan', ' data-carry') +
    mini('/funnels', 'crm', 'Templates', 'Funnel build templates', 'Intake and growth funnels') + '</div></div>';
}

// ===== Fitness panels (2026-11-23). Same parts as the Business panels. Link lines reuse the approved
// focus lines from partials/fitness/focus.json and the note titles; regions only, no gym names.
// Fitness mega nav (2026-11-27). Five tabs, never more: Personal training, What I teach, Nathan's guide,
// Practice free, About. Three of the panels are interactive on desktop (hover, focus or tap swaps a pane and plays
// a small scene); the phone drawer shows the same links as plain lists. The voice is first person and generous:
// Jay teaches, and he hands over the map, the guides and the free tools without holding anything back.
const FIT = {
  'f-pt': [
    ['Build', [['/fitness/muscle-building', 'fitness', 'Muscle building', 'Get stronger and add size where you want it'], ['/fitness/fat-loss', 'chart', 'Fat loss', 'Lose fat and keep the muscle you have'], ['/fitness/conditioning', 'bolt', 'Conditioning', 'Rounds and intervals that raise your engine'], ['/fitness/shoulder-strength', 'mark', 'Shoulder strength', 'Strong, mobile shoulders']]],
    ['Move', [['/fitness/mobility-and-yoga', 'loop', 'Mobility and yoga', 'Hips, back and shoulders that move freely'], ['/fitness/reformer-pilates', 'star', 'Reformer Pilates', "Core strength on the reformer. I'm in certification"], ['/fitness/yoga-and-pilates', 'team', 'Yoga and Pilates', 'Private sessions, on the mat or the reformer'], ['/fitness/personal-training', 'user', 'Personal training', 'One goal at a time, coached rep by rep'], ['/fitness/guides/near-me', 'pin', 'Studios near you', 'Yoga, Pilates and intervals for your own days']]],
  ],
  'f-about': [
    ['The coach', [['/fitness/coach', 'user', 'About Nathan', 'Three-time SHRED winner, clubs and maces coach'], ['/fitness/path', 'chart', 'The path', 'Strength, engine, mobility, control and skill'], ['/fitness#faq', 'msg', 'Questions', 'Membership, mixing focuses, how you pay']]],
    ['Where I train', [['/fitness/book?loc=brea', 'pin', 'Brea', 'North OC'], ['/fitness/book?loc=rancho-santa-margarita', 'pin', 'Rancho Santa Margarita', 'South OC'], ['/fitness/book?loc=corona', 'pin', 'Corona', 'Inland Empire'], ['/fitness/book?loc=in-home', 'home', 'In-home training', 'Home, office or a park in Southern California']]],
  ],
};
// What I teach: three hubs. [id, hub page, name, line, kind jewel or icon, pages]
const HUBS = [
  ['strike', '/fitness/striking', 'Striking', 'Boxing, kickboxing and Muay Thai', 'kx-strike', [['/fitness/boxing', 'fist', 'Boxing', 'Footwork, a clean jab, combinations on mitts'], ['/fitness/kickboxing', 'fist', 'Kickboxing', 'Punches and kicks on Thai pads'], ['/fitness/muay-thai', 'fist', 'Muay Thai', 'Teeps, knees, elbows and the clinch'], ['/fitness/boxing#combo-lab', 'kx-strike', 'Try it: Combo Lab', 'Throw each combo, one shot per tap']]],
  ['clubs', '/fitness/clubs-and-maces', 'Clubs and maces', 'Steel clubs and steel maces', 'mark', [['/fitness/clubs-and-maces', 'mark', 'Clubs and maces', 'Steel club and steel mace training'], ['/fitness/shoulder-strength', 'fitness', 'Shoulder strength', 'Strong, mobile shoulders'], ['/fitness/clubs-and-maces#swing-lab', 'mark', 'Try it: Swing Lab', 'Eighteen club and mace swings']]],
  ['flow', '/fitness/yoga-and-pilates', 'Yoga and Pilates', 'On the mat and on the reformer', 'kx-yoga', [['/fitness/mobility-and-yoga', 'kx-yoga', 'Mobility and yoga', 'Hips, back and shoulders that move freely'], ['/fitness/reformer-pilates', 'kx-pilates', 'Reformer Pilates', "Core strength on the reformer. I'm in certification"], ['/fitness/mobility-and-yoga#breath-lab', 'kx-yoga', 'Try it: yoga breath game', 'Sixteen poses, on the breath'], ['/fitness/reformer-pilates#breath-lab', 'kx-pilates', 'Try it: Pilates breath game', 'Six reformer moves, on the breath']]],
];
// Nathan's guide: what a week can be missing, and the kind of studio that adds it. [id, name, kind, colour, studio, guides]
const ADDS = [
  ['mobility', 'Mobility', 'yoga', '#7A5BD0', 'a yoga studio', [['/fitness/guides/yoga-studios-socal', 'Yoga studios', 'Hot and not heated']]],
  ['control', 'Control', 'pilates', '#1F8A7D', 'a reformer Pilates studio', [['/fitness/guides/reformer-pilates-studios-socal', 'Reformer Pilates studios', 'Across LA, OC and the IE']]],
  ['engine', 'Engine', 'run', '#B8730A', 'a run or interval studio', []],
  ['skill', 'Skill', 'strike', '#E0563A', 'a boxing or Muay Thai gym', [['/fitness/guides/boxing-gyms-socal', 'Boxing gyms', 'Across LA, OC and the IE'], ['/fitness/guides/kickboxing-gyms-socal', 'Kickboxing and Muay Thai gyms', 'Across LA, OC and the IE']]],
];
const HOMES = [['Brea', 'Brea', 'North OC'], ['Rancho+Santa+Margarita', 'Rancho Santa Margarita', 'South OC'], ['Corona', 'Corona', 'Inland Empire']];
// Practice free: the six labs. [href, scene, name, line]
const LABS = [
  ['/fitness/boxing#combo-lab', 'box', 'Combo Lab: boxing', 'Throw each combo, one shot per tap'],
  ['/fitness/kickboxing#combo-lab', 'kick', 'Combo Lab: kickboxing', 'Punches, kicks and knees'],
  ['/fitness/muay-thai#combo-lab', 'knee', 'Combo Lab: Muay Thai', 'Teeps, elbows, knees and the clinch'],
  ['/fitness/clubs-and-maces#swing-lab', 'clubs', 'Swing Lab', 'Eighteen club and mace swings'],
  ['/fitness/mobility-and-yoga#breath-lab', 'yoga', 'Yoga breath game', 'Sixteen poses, on the breath'],
  ['/fitness/reformer-pilates#breath-lab', 'reformer', 'Pilates breath game', 'Six reformer moves, on the breath'],
];
const NOTES = [['/fitness/notes/warm-up', 'check', 'Warm-up', 'Ten minutes, four parts'], ['/fitness/notes/band-workouts', 'pages', 'A full band workout', 'Six moves, head to toe'], ['/fitness/notes/ac-joint', 'search', 'A sore AC joint', 'What helps, and when to train'], ['/fitness/notes/recovery-room', 'star', 'The recovery room', "What's worth it, ranked by evidence"]];

// Small scenes (Goldsmith): plain SVG that moves only while its card is live. The yoga and reformer scenes are the
// Breath Lab figures themselves, drawn by breathrigs.js.
const SC = 'viewBox="0 0 240 150" aria-hidden="true"';
const bag = '<g class="fx-bag"><path d="M172 0v30" stroke="#16181C" stroke-width="3"/><rect x="150" y="30" width="44" height="92" rx="20" fill="#16181C"/><rect x="150" y="48" width="44" height="8" fill="#E0563A"/><rect x="150" y="96" width="44" height="8" fill="#E0563A"/></g>';
const pow = (y) => '<path class="fx-pow" transform="translate(146 ' + y + ')" d="M0-17l5 9 11-5-5 11 9 5-10 3 3 11-10-6-8 9-1-12-11-2 9-7-6-10 11 2z" fill="#FFD166" stroke="#16181C" stroke-width="2.5" stroke-linejoin="round"/>';
const SCENE = {
  box: '<svg class="fx-sc" ' + SC + '><rect width="240" height="150" rx="16" fill="#FCEDE8"/><ellipse cx="172" cy="136" rx="34" ry="5" fill="#E9D5CC"/>' + bag + '<g class="fx-hit fx-jab"><rect x="14" y="66" width="62" height="16" rx="8" fill="#16181C"/><circle cx="88" cy="74" r="17" fill="#E0563A" stroke="#16181C" stroke-width="3"/><path d="M80 66q8-5 15 1" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></g>' + pow(74) + '</svg>',
  kick: '<svg class="fx-sc" ' + SC + '><rect width="240" height="150" rx="16" fill="#FCEDE8"/><ellipse cx="172" cy="136" rx="34" ry="5" fill="#E9D5CC"/>' + bag + '<g class="fx-hit fx-kick"><path d="M30 132L70 96" stroke="#16181C" stroke-width="18" stroke-linecap="round"/><path d="M70 96L116 86" stroke="#16181C" stroke-width="15" stroke-linecap="round"/><path d="M112 86l22-4" stroke="#E0563A" stroke-width="13" stroke-linecap="round"/></g>' + pow(86) + '</svg>',
  knee: '<svg class="fx-sc" ' + SC + '><rect width="240" height="150" rx="16" fill="#FCEDE8"/><ellipse cx="172" cy="136" rx="34" ry="5" fill="#E9D5CC"/>' + bag + '<g class="fx-hit fx-knee"><path d="M66 138L84 100" stroke="#16181C" stroke-width="15" stroke-linecap="round"/><path d="M56 62L84 100" stroke="#E0563A" stroke-width="20" stroke-linecap="round"/><circle cx="86" cy="101" r="12" fill="#16181C"/></g>' + pow(98) + '</svg>',
  clubs: '<svg class="fx-sc" ' + SC + '><rect width="240" height="150" rx="16" fill="#F1ECE4"/><circle cx="120" cy="72" r="52" fill="none" stroke="#16181C" stroke-opacity=".18" stroke-width="2" stroke-dasharray="3 7"/><g class="fx-mace"><path d="M120 72V28" stroke="#16181C" stroke-width="6" stroke-linecap="round"/><circle cx="120" cy="20" r="12" fill="#16181C"/><circle cx="116" cy="16" r="3.5" fill="#E9D3A0"/></g><g class="fx-club"><path d="M120 72v30" stroke="#16181C" stroke-width="5" stroke-linecap="round"/><path d="M120 98v22" stroke="#B9935A" stroke-width="13" stroke-linecap="round"/></g><circle cx="120" cy="72" r="10" fill="#E9D3A0" stroke="#16181C" stroke-width="3"/></svg>',
  yoga: '<svg class="fx-sc fx-rig" data-rig="yoga" viewBox="0 0 360 225" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"></svg>',
  reformer: '<svg class="fx-sc fx-rig" data-rig="reformer" viewBox="0 0 360 225" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"></svg>',
  // The three home gyms as a triangle; the dots around each take the colour of what was picked.
  map: '<svg class="fx-sc fx-map" ' + SC + '><rect width="240" height="150" rx="16" fill="#F3EFE8"/><path d="M0 50h240M0 100h240M80 0v150M160 0v150" stroke="#16181C" stroke-opacity=".06"/><path d="M66 44L178 58L126 118Z" fill="none" stroke="#16181C" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="4 5"/>' +
    [[66, 44, 'North OC', -1], [178, 58, 'Inland Empire', -1], [126, 118, 'South OC', 1]].map(([x, y, n, s], i) => '<g class="fx-home" style="--i:' + i + '"><circle class="fx-ring" cx="' + x + '" cy="' + y + '" r="20"/>' +
      [[-22, -9], [19, -15], [24, 10], [-12, 20]].map(([dx, dy], k) => '<circle class="fx-dot" style="--k:' + k + '" cx="' + (x + dx) + '" cy="' + (y + dy) + '" r="4"/>').join('') +
      '<circle cx="' + x + '" cy="' + y + '" r="7" fill="#16181C"/><circle cx="' + x + '" cy="' + y + '" r="2.6" fill="#E9D3A0"/><text x="' + x + '" y="' + (y + (s > 0 ? 25 : -27)) + '" text-anchor="middle">' + n + '</text></g>').join('') + '</svg>',
};
const jewel = (ic) => (ic.startsWith('kx-') ? '<span class="mn-ico mn-kx">' + kindJewel(ic.slice(3)) + '</span>' : '<span class="mn-ico gic">' + icon(ic) + '</span>');
const fitCols = (id) => FIT[id].map(([h, items]) => '<div class="mn-col"><p class="mn-hd">' + esc(h) + '</p><ul>' + items.map((x) => link(...x)).join('') + '</ul></div>').join('');
// The 12-pack card that closes the training panel: once a week is the pack, twice a week is the push.
const packCard = '<aside class="mn-feat mn-pack"><p class="mn-kick">The 12-pack</p><p class="mn-pack-n">12<small>private sessions</small></p>' +
  '<p class="mn-p">Once a week, built around the focus you pick. <b>Twice a week is the foundation:</b> two fixed days turn training into discipline.</p>' +
  '<a class="btn btn-lime mn-go" href="/fitness/book?pack=12">Book your first session</a><p class="mn-fine">Pay nothing today. I confirm by email.</p></aside>';

function teachPanel() {
  return '<div class="mn-in fx fx-teach" data-fx>' +
    '<div class="fx-picks"><p class="mn-hd">Three disciplines, one coach</p>' + HUBS.map(([id, , name, line, ic], i) => '<button type="button" class="fx-pick" data-fx-pick="' + id + '" aria-pressed="' + (i === 0) + '">' + jewel(ic) + '<span class="mn-txt"><strong>' + esc(name) + '</strong><small>' + esc(line) + '</small></span>' + arrow + '</button>').join('') + '</div>' +
    '<div class="fx-panes">' + HUBS.map(([id, href, name, , , pages], i) => '<div class="fx-pane' + (i === 0 ? ' on' : '') + '" data-fx-pane="' + id + '"><p class="mn-hd">' + esc(name) + '</p><ul>' + pages.map((x) => link(...x)).join('') + '</ul><a class="mn-sub fx-open" href="' + href + '">Open the ' + esc(name[0].toLowerCase() + name.slice(1)) + ' hub' + arrow + '</a></div>').join('') + '</div>' +
    '<aside class="fx-stage">' + [['strike', 'box'], ['clubs', 'clubs'], ['flow', 'yoga']].map(([id, sc], i) => '<div class="fx-view' + (i === 0 ? ' on' : '') + '" data-fx-view="' + id + '">' + SCENE[sc] + '</div>').join('') +
    '<p class="mn-kick">From your head coach</p><p class="mn-p"><b>I coach what I practice.</b> Most trainers pick one discipline. I train all three, and I build your week from the mix.</p>' +
    '<a class="btn btn-lime mn-go" href="/fitness/book?pack=12">Book your first session</a><p class="mn-fine">Pay nothing today. I confirm by email.</p></aside></div>';
}
function guidePanel() {
  const near = (kind) => HOMES.map(([area, city, region]) => '<li><a class="mn-link" href="/fitness/guides/near-me?show=' + kind + '&area=' + area + '">' + jewel('kx-' + kind) + '<span class="mn-txt"><strong>Near ' + esc(city) + '</strong><small>' + esc(region) + ', by distance</small></span></a></li>').join('');
  return '<div class="mn-in fx fx-guide" data-fx>' +
    '<div class="fx-picks"><p class="mn-hd">What is your week missing?</p>' + ADDS.map(([id, name, kind, , studio], i) => '<button type="button" class="fx-pick" data-fx-pick="' + id + '" aria-pressed="' + (i === 0) + '">' + jewel('kx-' + kind) + '<span class="mn-txt"><strong>' + esc(name) + '</strong><small>Add ' + esc(studio) + '</small></span>' + arrow + '</button>').join('') + '</div>' +
    '<div class="fx-panes">' + ADDS.map(([id, name, kind, , studio, guides], i) => '<div class="fx-pane' + (i === 0 ? ' on' : '') + '" data-fx-pane="' + id + '"><p class="mn-hd">' + esc(name) + ': ' + esc(studio) + '</p><ul>' + near(kind) +
      guides.map(([href, t, s]) => link(href, 'pages', 'Guide: ' + t, s)).join('') + '</ul></div>').join('') +
    '<a class="mn-sub fx-open" href="/fitness/guides/near-me">Open the whole map' + arrow + '</a></div>' +
    '<aside class="fx-stage" style="--fx-c:' + ADDS[0][3] + '"><div class="fx-view on">' + SCENE.map + '</div>' +
    '<p class="mn-kick">From your head coach</p><p class="mn-p"><b>I want you out there exploring.</b> Train with me every week, add what your week is missing, and bring back what you learn. I build it into your plan.</p>' +
    '<a class="btn btn-lime mn-go" href="/fitness/book?pack=12">Check in with me weekly</a>' +
    '<a class="mn-sub" href="/fitness/guides">See every gym guide' + arrow + '</a></aside></div>';
}
function freePanel() {
  return '<div class="mn-in fx fx-free" data-fx>' +
    '<div class="fx-labs-w"><p class="mn-hd">Six labs: tap, swing, breathe</p><div class="fx-labs">' + LABS.map(([href, sc, name, line]) => '<a class="fx-lab" href="' + href + '" data-fx-lab>' + '<span class="fx-thumb">' + SCENE[sc] + '</span><strong>' + esc(name) + '</strong><small>' + esc(line) + '</small></a>').join('') + '</div></div>' +
    '<div class="mn-col"><p class="mn-hd">Coach\'s notes</p><ul>' + NOTES.map((x) => link(...x)).join('') + '</ul></div>' +
    '<div class="mn-side"><aside class="mn-feat"><p class="mn-kick">From your head coach</p><p class="mn-p"><b>Everything here is free. I don\'t gatekeep.</b> Practice between our sessions, then show me on the floor. I fix what a screen can\'t see.</p>' +
    '<a class="mn-sub" href="/fitness/path">See the whole path' + arrow + '</a></aside>' + mini('/fitness/book', 'cal', 'One on one', 'Book your first session', 'Pay nothing today') + '</div></div>';
}
const FIT_FILL = {
  'f-pt': () => '<div class="mn-in mn-in-fit">' + fitCols('f-pt') + '<div class="mn-side">' + packCard + mini('/fitness#focus', 'search', 'Not sure?', 'Pick your focus', 'Choose one or two goals') + '</div></div>',
  'f-teach': teachPanel,
  'f-guide': guidePanel,
  'f-free': freePanel,
  'f-about': () => '<div class="mn-in mn-in-fit">' + fitCols('f-about') + '<div class="mn-side"><aside class="mn-feat"><p class="mn-kick">Your head coach</p>' +
    '<p class="mn-p"><b>Nathan J. Song.</b> Three SHRED wins in a row, 400+ hours of yoga training, on the floor seven days a week. Strong mind, strong body.</p>' +
    '<a class="mn-sub" href="/fitness/coach">Read my story' + arrow + '</a></aside>' +
    mini('/fitness/book', 'cal', 'Start', 'Book your first session', 'Pay nothing today') + '</div></div>',
};
const FIT_GROUPS = [['f-pt', 'Personal training', '/fitness/personal-training'], ['f-teach', 'What I teach', '/fitness#focus'], ['f-guide', "Nathan's guide", '/fitness/guides'], ['f-free', 'Practice free', '/fitness/notes'], ['f-about', 'About', '/fitness/coach']];

// The interactive panels. A pick swaps its pane and its scene; a lab card plays while it is hovered or focused.
// Scenes move only while their panel is open, and not at all for visitors who ask for reduced motion.
function mountFitFx(list) {
  const calm = reduced();
  const pick = (b) => { const fx = b.closest('[data-fx]'); const id = b.dataset.fxPick; if (b.getAttribute('aria-pressed') === 'true') return;
    $$('.fx-pick', fx).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $$('.fx-pane', fx).forEach((x) => x.classList.toggle('on', x.dataset.fxPane === id));
    $$('.fx-view[data-fx-view]', fx).forEach((x) => x.classList.toggle('on', x.dataset.fxView === id));
    const add = ADDS.find((a) => a[0] === id); const stage = $('.fx-stage', fx);
    if (add && stage) { stage.style.setProperty('--fx-c', add[3]); const m = $('.fx-map', stage); if (m) { m.classList.remove('go'); void m.getBoundingClientRect(); m.classList.add('go'); } } };
  list.addEventListener('pointerover', (e) => { const b = e.target.closest('.fx-pick'); if (b && e.pointerType === 'mouse') pick(b); });
  list.addEventListener('focusin', (e) => { const b = e.target.closest('.fx-pick'); if (b) pick(b); });
  list.addEventListener('click', (e) => { const b = e.target.closest('.fx-pick'); if (b) pick(b); });
  // The breath figures: one slow breath in and out, then the next move.
  const rigs = {}; const plays = { yoga: ['warrior-two', 'down-dog', 'triangle', 'cat-and-cow'], reformer: ['footwork', 'bridge', 'long-stretch'] };
  const rig = (k) => rigs[k] || (rigs[k] = RIGS[k]());
  const paintRig = (svg, t) => { const r = rig(svg.dataset.rig); const ids = plays[svg.dataset.rig]; const n = Math.floor(t / 3.6) % ids.length; const m = r.moves.find((x) => x.id === ids[n]) || r.moves[0];
    const u = (1 - Math.cos(((t % 3.6) / 3.6) * Math.PI * 2)) / 2; svg.innerHTML = '<g transform="translate(0 12)">' + r.draw(m, u, 0, true) + '</g>'; };
  $$('.fx-rig', list).forEach((svg) => paintRig(svg, 0.9));
  if (calm) return;
  let raf = 0; const t0 = performance.now();
  const live = () => $$('.fx-rig', list).filter((s) => s.closest('.mn-panel:not([hidden])') && (s.closest('.fx-view.on') || s.closest('.fx-lab.live')));
  const loop = (now) => { const on = live(); on.forEach((s) => paintRig(s, (now - t0) / 1000)); raf = on.length ? requestAnimationFrame(loop) : 0; };
  const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };
  list.addEventListener('pointerover', (e) => { const c = e.target.closest('.fx-lab'); $$('.fx-lab.live', list).forEach((x) => { if (x !== c) x.classList.remove('live'); }); if (c) c.classList.add('live'); wake(); });
  list.addEventListener('pointerleave', () => $$('.fx-lab.live', list).forEach((x) => x.classList.remove('live')));
  list.addEventListener('focusin', (e) => { const c = e.target.closest('.fx-lab'); $$('.fx-lab.live', list).forEach((x) => x.classList.remove('live')); if (c) c.classList.add('live'); wake(); });
  list.addEventListener('click', wake);
}

function studioPanel() {
  return '<div class="mn-in mn-in-studio">' + STUDIO.map(([h, items]) => '<div class="mn-col"><p class="mn-hd">' + esc(h) + '</p><ul>' + items.map((x) => link(...x)).join('') + '</ul></div>').join('') +
    '<div class="mn-side"><aside class="mn-feat mn-who"><span class="mn-port">' + (CREW_ART.nathan || '') + '</span><p class="mn-kick">Who builds it</p><p class="mn-p">Nathan J. Song. AI writes most of the code, and I check every change before it ships.</p>' +
    '<a class="mn-sub" href="/crew">Meet the crew' + arrow + '</a></aside>' +
    mini('/build?call=1', 'cal', 'Twenty minutes', 'Request a call', 'Talk it through, no pitch deck', ' data-carry') + '</div></div>';
}

export function mountMegaNav(store) {
  const list = $('#mn-list');
  if (!list) return;
  const { catalog, projects, actions } = store;
  const picks = agentPicks(store);
  const fit = list.dataset.mnSet === 'fit';
  const fill = fit ? FIT_FILL : { agents: agentsPanel, plans: () => plansPanel(catalog), build: buildPanel, work: () => workPanel(projects), studio: studioPanel };
  const items = $$('.mn-item', list);
  items.forEach((li) => {
    const panel = $('.mn-panel', li);
    if (panel && fill[li.dataset.nav]) panel.innerHTML = '<div class="wrap">' + fill[li.dataset.nav]() + '</div>';
  });

  // Open and close. One panel at a time; hover intent so a mouse passing over doesn't flash panels.
  let open = null; let tOpen = 0; let tClose = 0;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const set = (li) => {
    if (open === li) return;
    if (open) { open.classList.remove('open'); $('.mn-caret', open).setAttribute('aria-expanded', 'false'); $('.mn-panel', open).hidden = true; }
    open = li;
    if (li) { li.classList.add('open'); $('.mn-caret', li).setAttribute('aria-expanded', 'true'); $('.mn-panel', li).hidden = false; }
    document.body.classList.toggle('mn-open', !!li);
  };
  items.forEach((li) => {
    if (!$('.mn-panel', li)) return;
    li.addEventListener('mouseenter', () => { if (!fine.matches) return; clearTimeout(tClose); clearTimeout(tOpen); tOpen = setTimeout(() => set(li), open ? 0 : 90); });
    li.addEventListener('mouseleave', () => { if (!fine.matches) return; clearTimeout(tOpen); tClose = setTimeout(() => { if (open === li) set(null); }, 180); });
    $('.mn-caret', li).addEventListener('click', () => set(open === li ? null : li));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { const c = $('.mn-caret', open); set(null); c.focus(); } });
  document.addEventListener('click', (e) => { if (open && !e.target.closest('#mn-list')) set(null); });
  // Tabbing out closes the panel. A null target means focus was dropped (a panel hid, or a click
  // elsewhere, which the click handler covers), so that case is left alone.
  list.addEventListener('focusout', (e) => { if (open && e.relatedTarget && !list.contains(e.relatedTarget)) set(null); });
  addEventListener('resize', () => { if (innerWidth < 860 && open) set(null); }, { passive: true });

  // Panel actions.
  const goBuild = (anchor) => {
    if (document.body.dataset.page === 'build') {
      set(null);
      const s = document.getElementById(anchor || 'build');
      if (s) s.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    location.href = '/build' + (location.hash.length > 2 ? location.hash : '');
  };
  document.addEventListener('click', (e) => {
    const ag = e.target.closest('button.mn-ag');
    if (ag) { picks.toggle(ag.dataset.ag); return; }
    const pl = e.target.closest('[data-plan]');
    if (pl) {
      const id = pl.dataset.plan;
      actions.setTab(id);
      actions.setCarePlan(PLAN[id].care);
      picks.reapply();
      goBuild('s-features');
      return;
    }
    const st = e.target.closest('a[data-step]');
    if (st && document.body.dataset.page === 'build') { e.preventDefault(); goBuild(st.dataset.step); return; }
    const go = e.target.closest('[data-mn="ag-go"]');
    if (go) {
      e.preventDefault();
      const { quote: q } = store.get();
      if (q.tier && q.tier.id === 'run') actions.setCarePlan('run');
      goBuild('s-features');
    }
  });

  function paint() {
    const { sel, quote: q } = store.get();
    const n = picks.size;
    $$('button.mn-ag').forEach((b) => { const on = picks.has(b.dataset.ag); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    $$('[data-mn="ag-count"]').forEach((el) => { el.textContent = n ? plural(n, 'agent', 'agents') + ' in your plan' + (q.tier ? ', a ' + q.tier.label + ' build.' : '.') : 'No agents picked yet.'; });
    $$('[data-mn="ag-go"]').forEach((el) => { el.textContent = n ? 'Build my plan with ' + plural(n, 'agent', 'agents') : 'Build my plan'; });
    $$('.mn-plan').forEach((b) => b.classList.toggle('cur', !!q.tier && q.tier.id === b.dataset.plan));
    const nf = sel.features.length;
    $$('[data-mn="so"]').forEach((el) => {
      el.innerHTML = q.tier
        ? '<p class="mn-so-t"><span class="mn-plan-ic gic">' + icon('plan_' + q.tier.id) + '</span><b>' + esc(q.tier.label) + '</b></p><ul><li><b>' + nf + '</b> ' + (nf === 1 ? 'feature' : 'features') + '</li><li><b>' + n + '</b> ' + (n === 1 ? 'agent' : 'agents') + '</li>' + (q.weeks ? '<li><b>' + esc(weeksText(q.weeks)) + '</b> weeks</li>' : '') + '</ul>'
        : '<p class="mn-p">Nothing picked yet. Start with your business and I fill in the rest.</p>';
    });
    $$('.mn-badge').forEach((el) => { el.textContent = n; el.hidden = !n; });
  }
  store.subscribe(paint);
  picks.subscribe(paint);
  paint();
  mountPhoneMap(fill, fit);
  if (fit) mountFitFx(list);
}

// Phones: the drawer becomes an accordion of the same panels, with agents up top.
function mountPhoneMap(fill, fit) {
  const menu = $('#m-menu');
  if (!menu) return;
  const groups = fit ? FIT_GROUPS : [['agents', 'AI agents', '/crew#agents'], ['plans', 'Plans', '/plans'], ['build', 'Build a project', '/build'], ['work', 'Delivered', '/work'], ['studio', 'Studio', '/care']];
  const cta = menu.querySelector('.btn');
  // Fitness keeps a link home at the top of the drawer. The Business or Fitness switch stays in the header at every
  // width, so the drawer does not repeat it.
  const home = fit;
  menu.innerHTML = groups.map(([id, label, href]) => '<details class="mm-g mm-' + id + '"><summary>' + esc(label) + (id === 'agents' ? ' <span class="mn-new">New</span>' : '') + caret + '</summary>' +
    '<div class="mm-body">' + fill[id]() + '<a class="mm-all" href="' + href + '">Open ' + esc(label) + arrow + '</a></div></details>').join('');
  if (home) menu.insertAdjacentHTML('afterbegin', '<a class="mm-home" href="/fitness">Fitness home</a>');
  if (cta) menu.appendChild(cta);
  menu.addEventListener('toggle', (e) => {
    if (e.target.open) $$('details.mm-g', menu).forEach((d) => { if (d !== e.target) d.open = false; });
  }, true);
}
