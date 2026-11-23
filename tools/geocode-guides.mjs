#!/usr/bin/env node
// Replaces the hand-typed coordinates in partials/fitness/guides.json with ones from the US Census
// Geocoder (free, no key). Run it on a machine with open network access, then rebuild the pages:
//   node tools/geocode-guides.mjs
//   node tools/build-pages.mjs
// It only touches places that have a street address, marks each hit with geo: "census", and lists
// every address the geocoder could not match so those can be fixed by hand.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('../partials/fitness/guides.json', import.meta.url));
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// "470 N Doheny Dr, West Hollywood, CA 90048. Also 2150 ..." -> the first address only, without the suite.
const clean = (a) => a.split('. ')[0].replace(/,?\s*(Suites?|Ste|Units?|#)[^,]*/i, '').replace(/^[^\d]*?(?=\d)/, '').trim();

let hit = 0; const miss = [];
for (const guide of Object.values(data.guides)) {
  for (const x of guide.gyms) {
    const addr = x.p && x.p.address;
    if (!addr || !/\d/.test(addr)) continue;
    const q = clean(addr);
    const url = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?benchmark=Public_AR_Current&format=json&address=' + encodeURIComponent(q);
    try {
      const res = await fetch(url); const json = await res.json();
      const m = json.result && json.result.addressMatches && json.result.addressMatches[0];
      if (m) { x.lat = Number(m.coordinates.y.toFixed(5)); x.lng = Number(m.coordinates.x.toFixed(5)); x.geo = 'census'; hit++; console.log('ok   ', x.name, x.lat, x.lng); }
      else { miss.push(x.name + ' | ' + q); console.log('miss ', x.name); }
    } catch (err) { miss.push(x.name + ' | ' + q + ' | ' + err.message); console.log('error', x.name, err.message); }
    await sleep(250);
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
console.log('\n' + hit + ' places geocoded. ' + miss.length + ' not matched:');
for (const m of miss) console.log('  ' + m);
