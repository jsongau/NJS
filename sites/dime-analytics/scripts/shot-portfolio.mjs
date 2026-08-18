import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT='/home/claude/fairshare/dist';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);
 if(p.startsWith('/molsoncoors'))p=p.slice(12)||'/';let f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(ROOT,'index.html');
 res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4182,r));
const TILE=fs.readFileSync('/tmp/tile.png');
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:1500,height:1000},deviceScaleFactor:2});
await ctx.route(/cartocdn\.com/, r=>r.fulfill({status:200,contentType:'image/png',body:TILE}));
await ctx.route(/fonts\.googleapis\.com/, r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();
p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:4182/molsoncoors/portfolio',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1600);
const info=await p.evaluate(()=>({
  imgs:[...document.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),w:i.naturalWidth,h:i.naturalHeight})),
  cards:document.querySelectorAll('article').length,
}));
console.log('brand images loaded:', info.imgs.filter(i=>i.w>0).length, '/', info.imgs.length);
const broken = info.imgs.filter(i=>i.w===0);
if (broken.length) console.log('BROKEN:', JSON.stringify(broken));
console.log('cards:', info.cards);
await p.screenshot({path:'docs/proof-portfolio.png', fullPage:true});
// also grab the drawer with brand marks
await p.goto('http://localhost:4182/molsoncoors/',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2000);
await p.locator('aside[aria-label="Accounts in territory"] ul > li > button').first().click();
await p.waitForTimeout(700);
await p.screenshot({path:'docs/proof-drawer-brands.png'});
await b.close(); server.close();
console.log(errs.length?'ERRORS: '+errs.join(' | '):'no page errors');
