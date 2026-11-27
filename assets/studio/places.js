// One schedule for every gym (2026-11-23). The calendar on the Fitness home and the booking step both
// read it, so a change here shows in both. Hours are Pacific, as decimals (7.5 is 7:30, 17.25 is 5:15 PM).
// blocks: [kind, long label, length in hours, short label]. open: the hours a visitor can request.
// days: the weekdays a place takes bookings (0 is Sunday). sched: the weekdays with set hours; on the
// other days a visitor requests a part of the day and Jay replies with a time. region: the public label.
// also: classes on a weekday with no set private hours (shown on the coach page's week, not in the booker).
// at: [lat, lng] for the near-me map. These are city centres until Jay adds each street address.
// Brea and Corona take bookings every day (2026-11-23). 9Round is Mon, Tue, Wed and Fri only.
export const GYMS = {
    rsm: { at: [33.6409, -117.6031], city: 'Rancho Santa Margarita', name: '9Round RSM', region: 'Rancho Santa Margarita · South OC', slug: 'rancho-santa-margarita', short: 'Mon · Tue · Wed · Fri', days: [1, 2, 3, 5], sched: [1, 2, 3, 5], member: '9Round', hours: [7, 7.5, 8, 9, 10, 10.5, 11, 12, 13, 13.5], gym: true,
      blocks: { 8: ['class', '8:00 to 10:00 AM · My classes', 2], 11: ['class', '11:00 AM to 1:00 PM · My classes', 2] }, booked: new Set(), open: new Set([7, 7.5, 10, 10.5, 13, 13.5]),
      note: 'Open half hours before, between and after my classes at 9Round.' },
    brea: { at: [33.9167, -117.9001], city: 'Brea', name: 'UFC Gym Brea', region: 'Brea · North OC', slug: 'brea', short: 'Every day', days: [0, 1, 2, 3, 4, 5, 6], sched: [4], member: 'UFC Gym Brea', hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      blocks: { 6: ['class', '6:00 AM · My class', 1], 18: ['class', '6:00 PM · My class', 1] }, booked: new Set([7, 10, 13, 17]), open: new Set([8, 9, 11, 12, 14, 15, 16, 19]),
      note: 'Classes at 6 AM and 6 PM. Open hours in between.' },
    // Club Studio Corona (from 2026-11-23): BOX Tue 5:15 PM and Sat 9:15 AM, CS4 HIIT Sun 8:30 and 9:30 AM.
    // Set private hours: Tue 4 PM and 7:30 PM, Sat 10:30 AM. Every other day is by request.
    corona: { at: [33.8753, -117.5664], city: 'Corona', name: 'Club Studio Corona', region: 'Corona · Inland Empire', slug: 'corona', short: 'Every day', days: [0, 1, 2, 3, 4, 5, 6], sched: [2, 6], member: 'Club Studio', booked: new Set(),
      byDay: {
        2: { hours: [16, 17.25, 19.5], blocks: { 17.25: ['class', '5:15 to 6:15 PM · BOX, my class', 1, 'BOX class'] }, open: new Set([16, 19.5]) },
        6: { hours: [9.25, 10.5], blocks: { 9.25: ['class', '9:15 to 10:15 AM · BOX, my class', 1, 'BOX class'] }, open: new Set([10.5]) },
      },
      also: { 0: [['8:30 AM', 'CS4 HIIT class'], ['9:30 AM', 'CS4 HIIT class']] },
      note: 'Private hours beside my BOX classes. Sunday mornings I teach CS4 HIIT here at 8:30 and 9:30.' },
};

// Parts of a day a visitor can request where a place has no set hours that day.
export const PARTS = [['Morning', '7 to 11 AM'], ['Midday', '11 AM to 3 PM'], ['Evening', '3 to 8 PM']];
// How a gym takes bookings on a weekday: 'sched' (set hours), 'parts' (by request) or null (closed).
export const gymMode = (loc, dow) => (!GYMS[loc].days.includes(dow) ? null : GYMS[loc].sched.includes(dow) ? 'sched' : 'parts');
// A gym's schedule for one weekday: its byDay entry, when it has one, over its usual hours.
export const daySched = (loc, dow) => Object.assign({}, GYMS[loc], (GYMS[loc].byDay || {})[dow]);
// Minutes one session takes at a gym: 9Round books by the half hour, the rest by the hour.
export const slotMinutes = (loc) => (GYMS[loc].gym ? 30 : 60);
export const fmtHour = (h) => (Math.floor(h) % 12 || 12) + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM');
// "2026-11-24T07:30" style value for links and the lead form.
export const slotValue = (isoDay, h) => isoDay + 'T' + String(Math.floor(h)).padStart(2, '0') + (h % 1 ? ':' + String(Math.round((h % 1) * 60)).padStart(2, '0') : '');

// One emblem per kind of place (Goldsmith): line art for the jewel. Read by the page builder (map cards, colour key)
// and by the mega nav, so a kind looks the same everywhere.
export const KIND_SYM = {
  strike: '<path d="M15 26c-3.2 0-4-5-1-6.2"/><path d="M15.5 29c-2.6-9 1.6-16 9.5-16 5.6 0 9.5 3.8 9.5 9v5.500c0 4.2-3 7.5-7.5 7.500h-5c-3.2 0-5.6-2.4-6.5-6z"/><path d="M19 35h14v5.500H19z"/><path d="M22 20c2.4-1.8 5.6-1.8 8 0" opacity=".7"/><path d="M38.5 14l3-3M40.5 20h4M38.5 26l3 3" opacity=".8"/>',
  pilates: '<path d="M6 33h36"/><path d="M9 33v6M39 33v6"/><path d="M37 33V19h4v14"/><path d="M37 26l-3-2.5-3 5-3-5-3 5" opacity=".8"/><rect x="11" y="26" width="14" height="7" rx="2.5"/><path d="M13 26v-4h6v4" opacity=".7"/><circle cx="24" cy="13" r="5.5"/><path d="M24 10v6M21 13h6" opacity=".6"/>',
  yoga: '<path d="M24 34c-5-4-5-13 0-19 5 6 5 15 0 19z"/><path d="M24 34c-7 0-12-5-13-12 5 0 10 3 13 12z"/><path d="M24 34c7 0 12-5 13-12-5 0-10 3-13 12z"/><path d="M19 36c-6 1-11-1-14-5 3-1 6-1 8 0M29 36c6 1 11-1 14-5-3-1-6-1-8 0" opacity=".75"/><path d="M14 40h20" opacity=".6"/><circle cx="24" cy="9" r="1.4" fill="currentColor" stroke="none"/>',
  run: '<circle cx="24" cy="27" r="13"/><path d="M21 9h6M24 9v5M34.5 15l2.5-2.5"/><path d="M12 27h6l2.5-6 4 11 3-8 1.5 3h7" /><path d="M24 17v1.500M34 27h-1" opacity=".5"/>',
};
export const kindJewel = (k) => '<span class="nf-kx nf-top-' + k + '" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + KIND_SYM[k] + '</svg></span>';
