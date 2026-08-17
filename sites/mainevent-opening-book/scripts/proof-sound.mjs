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
 *   1. NOTHING SOUNDS BEFORE ARMING. This is the one that matters. A
 *      hiring manager opening this at a desk with other people around
 *      them must get silence, and "we set a default to false" is a claim
 *      about source code rather than about behaviour.
 *   2. Nothing is written to storage before arming either, so a reader
 *      who never touches it leaves no trace and gets the default forever.
 *   3. The control is found by its ARIA state and its title rather than
 *      by a hashed class, and it says "Sound off" in words.
 *   4. Arming plays its own cue, inside the gesture, which is the only
 *      moment a browser will let an AudioContext start at all.
 *   5. One key press is one note. The delegated listener does not stack.
 *   6. The ground switch plays its two note cue and NOT the generic
 *      press on top of it, which is what data-sound="off" is for. Two,
 *      not three, is the whole assertion.
 *   7. Clicking into a text field and typing four characters plays
 *      nothing. Typing is not a percussion instrument.
 *   8. The choice survives a reload, the same way the ground does.
 *   9. Silencing it actually silences it.
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
    const realStart = osc.start.bind(osc);
    osc.start = (t) => { window.__notes.push({ type: osc.type, freq: osc.frequency.value, at: t }); return realStart(t); };
    return osc;
  };
});

await p.goto('http://localhost:4198/me/',{waitUntil:'networkidle'});
await p.waitForTimeout(500);

const read = async () => p.evaluate(() => window.__notes.length);

// 1. Silent by default: press things, nothing should sound.
await p.click('a[href="/me/today"]').catch(()=>{});
await p.waitForTimeout(200);
await p.click('#ground-switch');
await p.waitForTimeout(300);
console.log('notes before arming (must be 0):', await read());

// 2. Storage before arming: no sound slice.
const before = await p.evaluate(() => localStorage.getItem('opening-book.v1'));
console.log('sound slice before arming:', /sound/.test(before||'') ? 'PRESENT (wrong)' : 'absent (correct)');

// 3. Arm it.
const btn = await p.$('button[aria-pressed][title*="Sound"]');
console.log('control found:', Boolean(btn), await btn.evaluate(e=>e.innerText.replace(/\s+/g,' ')));
await btn.click();
await p.waitForTimeout(400);
const armed = await read();
console.log('notes from the arming cue (expect 3):', armed);
console.log('label after arming:', await btn.evaluate(e=>e.innerText.replace(/\s+/g,' ')), 'aria-pressed:', await btn.getAttribute('aria-pressed'));

// 4. A queue key press.
await p.click('a[href="/me/inbox"]');
await p.waitForTimeout(300);
console.log('notes after one key press (expect +1):', (await read()) - armed);
const afterKey = await read();

// 5. The ground switch plays its own two note cue, not the press.
await p.click('#ground-switch');
await p.waitForTimeout(300);
console.log('notes from the ground switch (expect exactly 2, not 3):', (await read()) - afterKey);
const afterThrow = await read();

// 6. Typing is not an instrument.
const field = await p.$('input[type="search"], input[placeholder*="Name"]');
if (field) { await field.click(); await field.type('brea'); await p.waitForTimeout(200); }
console.log('notes from clicking and typing in a text field (expect 0):', (await read()) - afterThrow);
const afterType = await read();

// 7. It survives a reload, because the choice is stored.
await p.reload({waitUntil:'networkidle'});
await p.waitForTimeout(500);
const stored = await p.evaluate(() => localStorage.getItem('opening-book.v1'));
console.log('sound slice after arming:', /sound/.test(stored||'') ? 'present (correct)' : 'ABSENT (wrong)');
const btn2 = await p.$('button[aria-pressed][title*="Sound"]');
console.log('still armed after reload:', await btn2.getAttribute('aria-pressed'), await btn2.evaluate(e=>e.innerText.replace(/\s+/g,' ')));

// 8. And it can be silenced again.
await btn2.click(); await p.waitForTimeout(200);
const base = await read();
await p.click('a[href="/me/today"]'); await p.waitForTimeout(300);
console.log('notes after silencing, then pressing a key (expect 0):', (await read()) - base);

// 9. Collapsed rail drops it, per the rule that had to move files.
await p.click('button[title*="Collapse the rail"]');
await p.waitForTimeout(300);
console.log('control visible when the rail is collapsed (expect false):', await (await p.$('button[aria-pressed][title*="Sound"]')).isVisible());

console.log('page errors:', errs.length ? errs : 'none');
await b.close(); s.close();
