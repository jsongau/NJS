/**
 * PROOF: the cabinet is silent until it is asked, and then it is not.
 *
 * Sound is the one feature in this application whose defect is invisible
 * to every other check in this folder. A screenshot cannot hear it, the
 * contrast walk cannot hear it, and a person running the app with the
 * volume down cannot hear it either. So this file listens the only way a
 * machine can: it replaces AudioContext.prototype.createOscillator before
 * the bundle boots and records every note the application actually
 * starts, with its wave and its frequency.
 *
 * WHAT IT ASSERTS, in the order the risk runs:
 *
 * THE CONTRACT CHANGED ON 17 AUGUST 2026 and this file changed with it.
 * Sound used to be silent until armed; the owner decided it should be on
 * by default. The assertions below are the NEW contract. Running the old
 * ones against this build would report a defect on a working application,
 * which is the failure this project has hit seven times.
 *
 *   1. NOTHING SOUNDS BEFORE THE FIRST PRESS. This is still the one that
 *      matters and it is still true: on by default cannot mean playing on
 *      load, because no browser starts an AudioContext outside a gesture.
 *      The page loads, sits there, and is silent.
 *   2. Nothing is written to storage on arrival either. The absent slice
 *      IS the default now, and the default is on.
 *   3. The control is found by its ARIA state and its title rather than
 *      by a hashed class, and it reads "Sound on" on a first visit.
 *   4. The FIRST press makes a sound, without anything being armed first.
 *   5. One key press is one note. The delegated listener does not stack.
 *   6. The ground switch plays its two note cue and NOT the generic
 *      press on top of it, which is what data-sound="off" is for. Two,
 *      not three, is the whole assertion.
 *   7. Clicking into a text field and typing four characters plays
 *      nothing. Typing is not a percussion instrument.
 *   8. THE MAP HAS ITS OWN VOICE. A click inside the map surface plays
 *      the bell rather than the desk click, and it is checked by
 *      FREQUENCY rather than by counting notes, because two cues that
 *      both play one note are indistinguishable to a counter. 880Hz is
 *      the map; 210Hz is everywhere else.
 *   9. Silencing it actually silences it, and THAT choice is what
 *      survives a reload, because the stored slice is now the departure
 *      from the default rather than the default itself.
 *  10. The collapsed rail drops the control, which is the rule that had
 *      to move out of SideRail.module.css because a class name in a CSS
 *      module is hashed per file and the rule matched nothing where it
 *      was first written.
 *
 * Run: node scripts/proof-sound.mjs
 *
 * The browser is launched with --autoplay-policy=no-user-gesture-required
 * for one reason only: Playwright's clicks are real gestures, but the
 * headless default has been known to suspend a context created inside
 * one anyway, and a proof that fails for a reason unrelated to the code
 * is a proof nobody runs twice. The first assertion, silence before
 * arming, is the one that would be weakened by that flag, and it is not:
 * the application never calls the audio layer at all while it is off, so
 * there is nothing for a policy to permit.
 */
import { chromium } from "playwright";
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = process.argv[2] ?? "/tmp/work/me-prospecting/dist", BASE='/me';
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.startsWith(BASE))p=p.slice(BASE.length)||'/';let f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const n=path.join(f,'index.html');f=fs.existsSync(n)?n:path.join(ROOT,'index.html');}r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>s.listen(4198,r));
const b=await chromium.launch({executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.route(/fonts\.googleapis|fonts\.gstatic|cartocdn|tile\.openstreetmap/, r=>r.fulfill({status:200,body:''}));
const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));

// Instrument the Web Audio API before the app boots, so every oscillator
// the application actually starts is recorded with its real settings.
await p.addInitScript(() => {
  window.__notes = [];
  const proto = (window.AudioContext || window.webkitAudioContext).prototype;
  const realOsc = proto.createOscillator;
  proto.createOscillator = function () {
    const osc = realOsc.call(this);
    /*
      READ THE SCHEDULED FREQUENCY, NOT THE CURRENT ONE.

      The first version of this recorded osc.frequency.value at the moment
      start() was called and every note came back as 440Hz, which is the
      AudioParam default. Nothing was wrong with the application: the real
      value is SCHEDULED with setValueAtTime for a moment that has not
      happened yet, so reading .value reports what the parameter is now
      rather than what the note will be. A harness that reports 440 for
      every cue would have said the map sounds exactly like the desk,
      which is the assertion this file exists to make.
    */
    let scheduled = null;
    const realSet = osc.frequency.setValueAtTime.bind(osc.frequency);
    osc.frequency.setValueAtTime = (v, t) => {
      if (scheduled === null) scheduled = v;
      return realSet(v, t);
    };
    const realStart = osc.start.bind(osc);
    osc.start = (t) => {
      window.__notes.push({ type: osc.type, freq: scheduled ?? osc.frequency.value, at: t });
      return realStart(t);
    };
    return osc;
  };
});

await p.goto('http://localhost:4198/me/',{waitUntil:'networkidle'});
await p.waitForTimeout(500);

const read = async () => p.evaluate(() => window.__notes.length);
const notes = async () => p.evaluate(() => window.__notes.slice());

// 1. Nothing on load. The page has been sitting here since goto.
console.log('notes on arrival, before any press (must be 0):', await read());

// 2. Nothing written to storage either: absent slice IS the default.
const before = await p.evaluate(() => localStorage.getItem('opening-book.v1'));
console.log('sound slice on arrival:', /sound/.test(before||'') ? 'PRESENT (wrong)' : 'absent (correct)');

// 3. The control reads "Sound on" without anybody having pressed it.
const btn = await p.$('button[aria-pressed][title*="Sound"]');
console.log('control on a first visit:', await btn.evaluate(e=>e.innerText.replace(/\s+/g,' ')), 'aria-pressed:', await btn.getAttribute('aria-pressed'));

// 4. The FIRST press makes a sound, with nothing armed beforehand.
await p.click('a[href="/me/today"]');
await p.waitForTimeout(300);
const first = await notes();
console.log('notes from the very first press (expect 1):', first.length, first.map(n=>Math.round(n.freq)+'Hz').join(','));

// 5 and 6. Another key, then the ground switch's own two note cue.
await p.click('a[href="/me/inbox"]'); await p.waitForTimeout(250);
const afterKey = (await notes()).length;
console.log('notes after a second key press (expect +1):', afterKey - first.length);
await p.click('#ground-switch'); await p.waitForTimeout(300);
const afterThrow = await notes();
console.log('notes from the ground switch (expect exactly 2):', afterThrow.length - afterKey);

// 7. Typing is not an instrument.
const field = await p.$('input[type="search"], input[placeholder*="Name"]');
if (field) { await field.click(); await field.type('brea'); await p.waitForTimeout(250); }
console.log('notes from clicking and typing in a text field (expect 0):', (await notes()).length - afterThrow.length);

// 8. THE MAP HAS ITS OWN VOICE, checked by frequency and not by count.
await p.goto(`http://localhost:4198${BASE}/map`, { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const beforeMap = (await notes()).length;
const zone = await p.$('[data-sound-zone="map"]');
console.log('map surface declares its zone:', Boolean(zone));
const anyMarker = await p.$('.leaflet-marker-icon, .ob-marker');
if (anyMarker) { await anyMarker.click({force:true}); await p.waitForTimeout(350); }
const mapNotes = (await notes()).slice(beforeMap);
const desk = mapNotes.filter(n => n.freq < 400).length;
const bell = mapNotes.filter(n => n.freq >= 800).length;
console.log('notes from a click inside the map:', mapNotes.length, mapNotes.map(n=>Math.round(n.freq)+'Hz').join(','));
console.log('  desk-voice notes under 400Hz (expect 0):', desk, '  map-voice notes at or above 800Hz (expect 1 or more):', bell);

// 9. Silencing survives a reload, because the stored slice is the
//    departure from the default.
//
// BACK TO A CONSOLE SCREEN FIRST. /map is the takeover and the rail is
// not on it, so looking for the control here would report it missing on
// an application where it is exactly where it should be.
await p.goto(`http://localhost:4198${BASE}/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
const btn2 = await p.$('button[aria-pressed][title*="Sound"]');
await btn2.click(); await p.waitForTimeout(200);
const quiet = (await notes()).length;
await p.click('a[href="/me/today"]'); await p.waitForTimeout(300);
console.log('notes after silencing, then pressing a key (expect 0):', (await notes()).length - quiet);
const stored = await p.evaluate(() => localStorage.getItem('opening-book.v1'));
console.log('the silence is stored:', /sound/.test(stored||'') ? 'yes (correct)' : 'NO (wrong)');
await p.reload({waitUntil:'networkidle'});
await p.waitForTimeout(600);
const btn3 = await p.$('button[aria-pressed][title*="Sound"]');
console.log('still silent after a reload:', await btn3.evaluate(e=>e.innerText.replace(/\s+/g,' ')), 'aria-pressed:', await btn3.getAttribute('aria-pressed'));

// 10. Collapsed rail drops the control.
await p.click('button[title*="Collapse the rail"]');
await p.waitForTimeout(300);
console.log('control visible when the rail is collapsed (expect false):', await (await p.$('button[aria-pressed][title*="Sound"]')).isVisible());

console.log('page errors:', errs.length ? errs : 'none');
await b.close(); s.close();
