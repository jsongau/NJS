import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT='/home/claude/fairshare/dist';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);
 if(p.startsWith('/molsoncoors'))p=p.slice(12)||'/';let f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const i=path.join(f,'index.html');f=fs.existsSync(i)?i:path.join(ROOT,'index.html');}
 res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4188,r));
const errs=[]; const net=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:1500,height:1100},deviceScaleFactor:2});
await ctx.route(/fonts\.googleapis\.com/, r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();
p.on('pageerror',e=>errs.push(e.message));
// watch for ANY outbound request that isn't our own server
p.on('request',r=>{ const u=r.url(); if(!u.startsWith('http://localhost:4188') && !u.startsWith('data:')) net.push(u); });

await p.goto('http://localhost:4188/molsoncoors/supply',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1500);
console.log('recipient on file:', await p.locator('[class*="toAddress"]').innerText());
console.log('subject:', (await p.locator('[class*="subject"]').first().innerText()).replace('Subject','').trim().slice(0,80));
console.log('itemised:', await p.locator('[class*="itemised"]').innerText());
await p.screenshot({path:'docs/proof-send-formatted.png', fullPage:false});

await p.locator('[class*="pvBtn"]:has-text("Plain text")').click();
await p.waitForTimeout(300);
await p.locator('[class*="pvBtn"]:has-text("Formatted")').click();
await p.waitForTimeout(400);

const sendLabel = await p.locator('[class*="sendBtn"]').innerText();
console.log('send button:', sendLabel);
await p.locator('[class*="sendBtn"]').click();
await p.waitForTimeout(700);
console.log('after send:', await p.locator('[class*="sentCard"]').innerText());
await p.screenshot({path:'docs/proof-send-confirmed.png', fullPage:false});

await b.close(); server.close();
console.log('\noutbound network calls during send:', net.length ? net.join(' | ') : 'NONE');
console.log(errs.length?'ERRORS: '+errs.join(' | '):'no page errors');
