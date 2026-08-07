import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT='/home/claude/fairshare/dist';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);
 if(p.startsWith('/molsoncoors'))p=p.slice(12)||'/';let f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const i=path.join(f,'index.html');f=fs.existsSync(i)?i:path.join(ROOT,'index.html');}
 res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4186,r));
const TILE=fs.readFileSync('/tmp/tile.png');
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:2});
await ctx.route(/cartocdn\.com/, r=>r.fulfill({status:200,contentType:'image/png',body:TILE}));
await ctx.route(/fonts\.googleapis\.com/, r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();
p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:4186/molsoncoors/',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2200);

console.log('accounts in list:', await p.locator('aside[aria-label="Accounts in territory"] ul > li').count());
console.log('asian markets:', await p.locator('aside[aria-label="Accounts in territory"]').getByText(/99 Ranch|H Mart|Hong Kong|Great Wall|168 Market/).count());

await p.locator('aside[aria-label="Accounts in territory"] ul > li > button').first().click();
await p.waitForTimeout(700);

// horizontal overflow check inside the drawer
const overflow = await p.evaluate(()=>{
  const d=document.querySelector('aside[aria-label*="detail"]');
  if(!d) return null;
  let worst=0, culprit='';
  d.querySelectorAll('*').forEach(el=>{
    const over = el.scrollWidth - el.clientWidth;
    if(over>worst){worst=over;culprit=el.className||el.tagName;}
  });
  return {drawerScrollW:d.scrollWidth, drawerClientW:d.clientWidth, worstOverflow:worst, culprit:String(culprit).slice(0,60)};
});
console.log('drawer overflow:', JSON.stringify(overflow));
console.log('default tab:', await p.locator('[role=tab][aria-selected=true]').innerText());
await p.screenshot({path:'docs/proof-drawer-tabs.png'});

// cycle tabs, check each renders
for (const t of ['Opportunity','Cold box','Promotion','Plan']) {
  await p.locator(`[role=tab]:has-text("${t}")`).click();
  await p.waitForTimeout(250);
}
await p.locator('[role=tab]:has-text("SKUs")').click();
await p.waitForTimeout(300);

await b.close(); server.close();
console.log(errs.length?'ERRORS: '+errs.join(' | '):'no page errors');
