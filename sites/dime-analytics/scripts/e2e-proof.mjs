import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT='/home/claude/fairshare/dist';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);
 if(p.startsWith('/molsoncoors'))p=p.slice(12)||'/';let f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(ROOT,'index.html');
 res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4180,r));
const TILE=fs.readFileSync('/tmp/tile.png');
const errors=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:1680,height:1000},deviceScaleFactor:2});
await ctx.route(/cartocdn\.com/, r=>r.fulfill({status:200,contentType:'image/png',body:TILE}));
await ctx.route(/fonts\.googleapis\.com/, r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();
p.on('pageerror',e=>errors.push('PAGEERROR: '+e.message));
p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL|ERR_/.test(m.text()))errors.push('CONSOLE: '+m.text());});

await p.goto('http://localhost:4180/molsoncoors/',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2200);

// 1. open the top account, close some voids
await p.locator('aside[aria-label="Accounts in territory"] ul > li > button').first().click();
await p.waitForTimeout(600);
const closeBtns = p.locator('button:has-text("Close void"), button:has-text("Replenish")');
const n = Math.min(4, await closeBtns.count());
for (let i=0;i<n;i++){ await closeBtns.nth(0).click(); await p.waitForTimeout(220); }
console.log('closed', n, 'gaps at account 1');

// 2. second account
await p.locator('aside[aria-label="Accounts in territory"] ul > li > button').nth(3).click();
await p.waitForTimeout(600);
const c2 = p.locator('button:has-text("Close void"), button:has-text("Replenish")');
const n2 = Math.min(3, await c2.count());
for (let i=0;i<n2;i++){ await c2.nth(0).click(); await p.waitForTimeout(220); }
console.log('closed', n2, 'gaps at account 2');

await p.screenshot({path:'docs/proof-drawer.png'});

// 3. plan page
await p.click('a[href="/molsoncoors/plan"]');
await p.waitForTimeout(900);
const planInfo = await p.evaluate(()=>({
  groups: document.querySelectorAll('table').length,
  totals: [...document.querySelectorAll('[class*="totalValue"]')].map(e=>e.textContent).slice(0,10),
}));
console.log('plan:', JSON.stringify(planInfo));
await p.screenshot({path:'docs/proof-plan.png', fullPage:true});

// 4. sheet
await p.click('a[href="/molsoncoors/plan/sheet"]');
await p.waitForTimeout(900);
await p.getByRole('button',{name:'Submit allocation request'}).click();
await p.waitForTimeout(400);
await p.screenshot({path:'docs/proof-sheet.png', fullPage:true});

// 5. print rendering
await p.emulateMedia({media:'print'});
await p.waitForTimeout(300);
await p.pdf({path:'docs/proof-commitment-sheet.pdf', format:'Letter', margin:{top:'0.5in',bottom:'0.5in',left:'0.5in',right:'0.5in'}, printBackground:true});
console.log('pdf written');

await b.close(); server.close();
console.log(errors.length?'ERRORS:\n'+errors.join('\n'):'no page errors');
