// Agent Goldsmith's crew portraits (2026-11-03). One drawing language with the logo and the
// icon set: 64 grid, ink tile, paper line work, one pink accent. Each portrait has one moving
// part that plays when its card is hovered or focused (motion in studio.css, "Crew portraits").
const T = (inner, tile = '#121416') => '<svg class="ca" viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="17" fill="' + tile + '"/>' + inner + '</svg>';
const P = '#FBF5F6', K = '#FF4F9A', I = '#121416';

export const CREW_ART = {
  // Nathan: the N with its pink dot, on a pink tile. The dot hops.
  nathan: T('<rect x="16" y="18" width="6.5" height="28" rx="1" fill="' + I + '"/><polygon points="16,18 22.5,18 46,46 39.5,46" fill="' + I + '"/><rect x="39.5" y="18" width="6.5" height="28" rx="1" fill="' + I + '"/>' +
    '<g class="ca-m ca-hop"><circle cx="42.75" cy="11.5" r="3.6" fill="' + P + '"/></g>', K),

  // Ross, architect: a compass on a grid, drawing an arc. The compass swings, the arc redraws.
  ross: T('<g stroke="' + P + '" stroke-width=".6" opacity=".18"><path d="M12 22h40M12 32h40M12 42h40M22 12v40M32 12v40M42 12v40"/></g>' +
    '<path class="ca-d" d="M17 47a15 15 0 0 1 30 0" fill="none" stroke="' + K + '" stroke-width="2.6" stroke-linecap="round" pathLength="1"/>' +
    '<g class="ca-m ca-swing"><path d="M32 15L21 46M32 15l11 31" stroke="' + P + '" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="14" r="3.4" fill="' + I + '" stroke="' + P + '" stroke-width="2.2"/><path d="M32 10.5V7" stroke="' + P + '" stroke-width="2.2" stroke-linecap="round"/></g>'),

  // Mary, UX: a screen with three blocks and a cursor. The blocks trade places.
  mary: T('<rect x="11" y="13" width="42" height="34" rx="4" fill="none" stroke="' + P + '" stroke-width="2.2"/><path d="M11 20h42" stroke="' + P + '" stroke-width="2.2"/>' +
    '<g class="ca-m ca-b1"><rect x="16" y="25" width="15" height="17" rx="2" fill="' + K + '"/></g><g class="ca-m ca-b2"><rect x="34" y="25" width="14" height="7" rx="2" fill="' + P + '" opacity=".85"/></g><g class="ca-m ca-b3"><rect x="34" y="35" width="14" height="7" rx="2" fill="' + P + '" opacity=".45"/></g>' +
    '<g class="ca-m ca-cur"><path d="M41 41l9 3.6-3.8 1.5-1.5 3.8z" fill="' + P + '" stroke="' + I + '" stroke-width="1.2" stroke-linejoin="round"/></g>'),

  // Agent NS, evidence: a page under a lens, then a check. The lens sweeps, the check stamps.
  ns: T('<rect x="15" y="11" width="25" height="33" rx="3" fill="none" stroke="' + P + '" stroke-width="2.2"/><path d="M20 19h15M20 25h15M20 31h10" stroke="' + P + '" stroke-width="2" stroke-linecap="round" opacity=".6"/>' +
    '<g class="ca-m ca-lens"><circle cx="39" cy="38" r="8" fill="' + I + '" stroke="' + K + '" stroke-width="3"/><path d="M45 44l6 6" stroke="' + K + '" stroke-width="3.4" stroke-linecap="round"/></g>' +
    '<path class="ca-d" d="M35.5 38.2l2.4 2.4 4.8-4.8" fill="none" stroke="' + P + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>'),

  // Jane, builder: a stack of blocks. The pink block lifts and lands with a squash.
  jane: T('<rect x="14" y="40" width="36" height="9" rx="2" fill="' + P + '"/><rect x="19" y="30" width="26" height="9" rx="2" fill="' + P + '" opacity=".7"/>' +
    '<g class="ca-m ca-drop"><rect x="24" y="20" width="16" height="9" rx="2" fill="' + K + '"/></g>' +
    '<g class="ca-k" stroke="' + K + '" stroke-width="1.8" stroke-linecap="round"><path d="M20 22l-3-1.5M44 22l3-1.5"/></g>'),

  // Goldsmith, marks: a pen nib on a bezier curve with its handles. The curve draws, the nib rides it.
  goldsmith: T('<path d="M14 44L24 20M50 20L40 44" stroke="' + P + '" stroke-width="1.2" opacity=".35"/><circle cx="24" cy="20" r="2" fill="' + P + '" opacity=".6"/><circle cx="50" cy="20" r="2" fill="' + P + '" opacity=".6"/>' +
    '<path class="ca-d" d="M14 44C24 20 40 44 50 20" fill="none" stroke="' + P + '" stroke-width="3" stroke-linecap="round" pathLength="1"/>' +
    '<rect x="11.5" y="41.5" width="5" height="5" rx="1" fill="' + I + '" stroke="' + P + '" stroke-width="1.6"/>' +
    '<g class="ca-m ca-nib"><path d="M50 20l-5.5 2.5 1.5 6.5 6.5 1.5 2.5-5.5z" fill="' + K + '"/><path d="M50 20l2.7 6.1" stroke="' + I + '" stroke-width="1.3" stroke-linecap="round"/></g>'),
};

// Agents a client can have built. Each maps to catalog features, so picking one changes the plan.
export const CLIENT_AGENTS = [
  { id: 'frontdesk', short: 'Answers and books, after hours too', icon: 'msg', name: 'Front-desk agent', does: 'Answers the questions you get every day and books the visit, after hours too.', example: 'A gym: class times, prices, a trial booked.', features: ['book', 'follow'] },
  { id: 'followup', short: 'Reminders, rebooks and win-backs', icon: 'cal', name: 'Follow-up agent', does: 'Reminders before the visit, a rebook after a no-show, a nudge when a regular drifts off.', example: 'A salon: "Your usual Thursday is open."', features: ['follow'] },
  { id: 'reviews', short: 'Asks happy customers for reviews', icon: 'star', name: 'Review agent', does: 'Asks happy customers for a review at the right moment, and never the unhappy ones.', example: 'A cafe: asks after the third visit.', features: ['reviews'] },
  { id: 'numbers', short: 'Your week on one screen', icon: 'chart', name: 'Numbers agent', does: 'Your Monday numbers on one screen and in one short email. No spreadsheet digging.', example: 'A shop: sales, top items, who came back.', features: ['dash'] },
  { id: 'backoffice', short: 'One repeat job, on a schedule', icon: 'bot', name: 'Back-office agent', does: 'One repeat job done on a schedule: rosters, inventory, invoices, the waitlist. With a log and an off switch.', example: 'A studio: texts the waitlist when a spot opens.', features: ['agent'] },
  { id: 'watchdog', short: 'Checks your agents every night', icon: 'loop', name: 'Watchdog', does: 'Checks your agents every night and proposes fixes. Nothing changes until you approve it.', example: 'Any business with agents running.', features: ['loop'] },
];

// Agent faces for the menu and the agent picker (Goldsmith, 2026-11-03): one bot head per agent a
// client can have built, each with its own prop and one motion on hover; every face blinks now and
// then so the row feels alive. "Yours" is the empty slot: a dashed head waiting to be designed.
const H = '<rect class="af-head" x="14" y="21" width="36" height="28" rx="10" fill="' + P + '"/>';
const EYES = '<g class="af-e"><circle cx="26" cy="34" r="3" fill="' + I + '"/><circle cx="38" cy="34" r="3" fill="' + I + '"/></g>';
const MOUTH = '<path class="af-mo" d="M28 42q4 3 8 0" fill="none" stroke="' + I + '" stroke-width="2.2" stroke-linecap="round"/>';
const F = (id, inner, tile = I) => '<svg class="af af-' + id + '" viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="17" fill="' + tile + '"/>' + inner + '</svg>';

export const AGENT_FACES = {
  frontdesk: F('frontdesk', H + EYES + MOUTH +
    '<path d="M13 33a19 19 0 0 1 38 0" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round"/>' +
    '<rect x="9" y="30" width="7" height="11" rx="3" fill="' + K + '"/><rect x="48" y="30" width="7" height="11" rx="3" fill="' + K + '"/>' +
    '<path d="M13 41q0 8 10 8" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="49" r="2.4" fill="' + K + '"/>'),
  followup: F('followup', H + EYES + MOUTH +
    '<path d="M32 21v-6" stroke="' + P + '" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="32" cy="10" r="6.5" fill="' + K + '"/><g class="af-m"><path d="M32 10V6.2M32 10h3" stroke="' + I + '" stroke-width="1.8" stroke-linecap="round"/></g>'),
  reviews: F('reviews', H + EYES + MOUTH +
    '<path d="M32 21v-5" stroke="' + P + '" stroke-width="2.4" stroke-linecap="round"/>' +
    '<g class="af-m"><path d="M32 3.5l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z" fill="' + K + '"/></g>' +
    '<circle cx="21" cy="40" r="2.2" fill="' + K + '" opacity=".55"/><circle cx="43" cy="40" r="2.2" fill="' + K + '" opacity=".55"/>'),
  numbers: F('numbers', H +
    '<rect x="18.5" y="27" width="27" height="14" rx="5" fill="' + I + '"/>' +
    '<g class="af-bars"><rect class="b1" x="23" y="33" width="4" height="5" rx="1" fill="' + K + '"/><rect class="b2" x="30" y="30" width="4" height="8" rx="1" fill="' + K + '"/><rect class="b3" x="37" y="31.5" width="4" height="6.5" rx="1" fill="' + P + '"/></g>' +
    '<path d="M28 45h8" stroke="' + I + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M32 21v-5" stroke="' + P + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="13" r="3.2" fill="' + K + '"/>'),
  backoffice: F('backoffice', H + EYES + MOUTH +
    '<path d="M32 21v-5" stroke="' + P + '" stroke-width="2.4" stroke-linecap="round"/>' +
    '<g class="af-m"><path d="M32 3.5l1.5 2.4 2.8-.6.6 2.8 2.4 1.5-1.4 2.5 1.4 2.5-2.4 1.5-.6 2.8-2.8-.6L32 21l-1.5-2.4-2.8.6-.6-2.8-2.4-1.5 1.4-2.5-1.4-2.5 2.4-1.5.6-2.8 2.8.6z" fill="' + K + '"/><circle cx="32" cy="12.2" r="2.6" fill="' + I + '"/></g>' +
    '<rect x="44" y="39" width="4" height="4" rx="1" fill="' + K + '" opacity=".6"/>'),
  watchdog: F('watchdog', '<g class="af-ears"><path class="ear-l" d="M16 25l3-13 9 9z" fill="' + K + '"/><path class="ear-r" d="M48 25l-3-13-9 9z" fill="' + K + '"/></g>' + H +
    '<g class="af-e af-scan"><circle cx="26" cy="34" r="3" fill="' + I + '"/><circle cx="38" cy="34" r="3" fill="' + I + '"/></g>' +
    '<ellipse cx="32" cy="41.5" rx="3" ry="2.2" fill="' + I + '"/>'),
  yours: F('yours', '<g class="af-dash"><rect x="14" y="21" width="36" height="28" rx="10" fill="none" stroke="' + P + '" stroke-width="2" stroke-dasharray="4 3.2" opacity=".75"/>' +
    '<path d="M32 21v-6" stroke="' + P + '" stroke-width="2" stroke-dasharray="2 2" opacity=".75"/><circle cx="32" cy="11" r="3.5" fill="none" stroke="' + P + '" stroke-width="2" stroke-dasharray="2 2" opacity=".75"/></g>' +
    '<g class="af-plus"><circle cx="32" cy="35" r="8" fill="' + K + '"/><path d="M32 31v8M28 35h8" stroke="' + I + '" stroke-width="2.4" stroke-linecap="round"/></g>'),
};
