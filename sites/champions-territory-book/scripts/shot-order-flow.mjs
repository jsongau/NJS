import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT='/home/claude/fairshare/dist';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);
 if(p.startsWith('/molsoncoors'))p=p.slice(12)||'/';let f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const idx=path.join(f,'index.html');
   f=fs.existsSync(idx)?idx:path.join(ROOT,'index.html');}
 res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4184,r));
const TILE=fs.readFileSync('/tmp/tile.png');
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:1500,height:1000},deviceScaleFactor:2});
await ctx.route(/cartocdn\.com/, r=>r.fulfill({status:200,contentType:'image/png',body:TILE}));
await ctx.route(/fonts\.googleapis\.com/, r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();
p.on('pageerror',e=>errs.push(e.message));

// 1. Supply desk (the sending side)
await p.goto('http://localhost:4184/molsoncoors/supply',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1500);
const linkText = await p.locator('code').first().innerText();
console.log('generated link:', linkText.slice(0,150));
await p.screenshot({path:'docs/proof-supply.png', fullPage:true});

// 2. Follow that exact link, like a distributor opening the email
const url = linkText.replace(/^https?:\/\/[^/]+/, 'http://localhost:4184');
await p.goto(url,{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1400);
const portal = await p.evaluate(()=>({
  h1: document.querySelector('h1')?.textContent,
  checked: document.querySelectorAll('input[type=checkbox]:checked').length,
  lines: document.querySelectorAll('article').length,
  totalCases: [...document.querySelectorAll('dd')].map(d=>d.textContent).slice(0,4),
}));
console.log('portal from link:', JSON.stringify(portal));
await p.screenshot({path:'docs/proof-order-portal.png', fullPage:true});

// 3. Distributor review side
await p.goto('http://localhost:4184/molsoncoors/distributor',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1200);
await p.screenshot({path:'docs/proof-distributor.png', fullPage:true});

// 4. mobile portal
const m=await ctx.newPage();
await m.setViewportSize({width:390,height:844});
await m.goto(url,{waitUntil:'domcontentloaded'});
await m.waitForTimeout(1200);
await m.screenshot({path:'docs/proof-order-portal-mobile.png'});

await b.close(); server.close();
console.log(errs.length?'ERRORS: '+errs.join(' | '):'no page errors');
