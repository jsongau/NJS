import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT='/home/claude/fairshare/dist';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);
 if(p.startsWith('/molsoncoors'))p=p.slice(12)||'/';let f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(ROOT,'index.html');
 res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4173,r));

// A 256px stand-in tile. CARTO is blocked from this container, so this
// substitutes a neutral basemap purely to verify that the Leaflet layer,
// markers, hull and route render. It is NOT part of the app.
const TILE = fs.readFileSync('/tmp/tile.png'); 

const errors=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for (const [w,h,name] of [[1440,900,'desktop'],[1280,800,'laptop'],[390,844,'mobile']]) {
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});
  await ctx.route(/cartocdn\.com/, r=>r.fulfill({status:200,contentType:'image/png',body:TILE}));
  await ctx.route(/fonts\.googleapis\.com/, r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));
  await page.goto('http://localhost:4173/molsoncoors/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2200);
  // Open the top-ranked account so the drawer is in the proof.
  const card = page.locator('aside[aria-label="Accounts in territory"] ul > li > button').first();
  if (await card.count()) { await card.click(); await page.waitForTimeout(900); }
  const info=await page.evaluate(()=>({
    markers:document.querySelectorAll('.fs-marker').length,
    tiles:document.querySelectorAll('.leaflet-tile').length,
    paths:document.querySelectorAll('.leaflet-overlay-pane path').length,
    boardH:document.querySelector('main section')?.clientHeight,
    docH:document.documentElement.scrollHeight,
  }));
  console.log(name, JSON.stringify(info));
  await page.screenshot({path:`docs/proof-${name}.png`});
  await ctx.close();
}
await b.close(); server.close();
console.log(errors.length?'ERRORS:\n'+errors.join('\n'):'no page errors');
