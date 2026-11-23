// One schedule for every gym (2026-11-23). The calendar on the Fitness home and the booking step both
// read it, so a change here shows in both. Hours are Pacific, as decimals (7.5 is 7:30, 17.25 is 5:15 PM).
// blocks: [kind, long label, length in hours, short label]. open: the hours a visitor can request.
// days: the weekdays a place takes bookings (0 is Sunday). sched: the weekdays with set hours; on the
// other days a visitor requests a part of the day and Jay replies with a time. region: the public label.
// Brea and Corona take bookings every day (2026-11-23). 9Round is Mon, Tue, Wed and Fri only.
export const GYMS = {
    rsm: { name: '9Round RSM', region: 'Rancho Santa Margarita · South OC', slug: 'rancho-santa-margarita', short: 'Mon · Tue · Wed · Fri', days: [1, 2, 3, 5], sched: [1, 2, 3, 5], member: '9Round', hours: [7, 7.5, 8, 9, 10, 10.5, 11, 12, 13, 13.5], gym: true,
      blocks: { 8: ['class', '8:00 to 10:00 AM · My classes', 2], 11: ['class', '11:00 AM to 1:00 PM · My classes', 2] }, booked: new Set(), open: new Set([7, 7.5, 10, 10.5, 13, 13.5]),
      note: 'Open half hours before, between and after my classes at 9Round.' },
    brea: { name: 'UFC Gym Brea', region: 'Brea · North OC', slug: 'brea', short: 'Every day', days: [0, 1, 2, 3, 4, 5, 6], sched: [4], member: 'UFC Gym Brea', hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      blocks: { 6: ['class', '6:00 AM · My class', 1], 18: ['class', '6:00 PM · My class', 1] }, booked: new Set([7, 10, 13, 17]), open: new Set([8, 9, 11, 12, 14, 15, 16, 19]),
      note: 'Classes at 6 AM and 6 PM. Open hours in between.' },
    // Club Studio Corona (from 2026-11-23): BOX Tue 5:15 PM and Sat 9:15 AM, CS4 HIIT Sun 8:30 and 9:30 AM.
    // Set private hours: Tue 4 PM and 7:30 PM, Sat 10:30 AM. Every other day is by request.
    corona: { name: 'Club Studio Corona', region: 'Corona · Inland Empire', slug: 'corona', short: 'Every day', days: [0, 1, 2, 3, 4, 5, 6], sched: [2, 6], member: 'Club Studio', booked: new Set(),
      byDay: {
        2: { hours: [16, 17.25, 19.5], blocks: { 17.25: ['class', '5:15 to 6:15 PM · BOX, my class', 1, 'BOX class'] }, open: new Set([16, 19.5]) },
        6: { hours: [9.25, 10.5], blocks: { 9.25: ['class', '9:15 to 10:15 AM · BOX, my class', 1, 'BOX class'] }, open: new Set([10.5]) },
      },
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
