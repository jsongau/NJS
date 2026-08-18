/**
 * Throwaway theme proof. Top-of-page shots at 1440 and 380 for a handful of
 * routes, plus the new /method section, plus a greyscale pass so the lane
 * ramp can be checked with hue removed.
 */
import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const ROOT="/tmp/work/me-prospecting/dist", BASE="/me", OUT="/tmp/theme-shots";
fs.mkdirSync(OUT,{recursive:true});
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p.startsWith(BASE))p=p.slice(BASE.length)||"/";let f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const n=path.join(f,"index.html");f=fs.existsSync(n)?n:path.join(ROOT,"index.html");}res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4183,r));
const TILE=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4cOcKAAUwApGnG1K1AAAAAElFTkSuQmCC","base64");
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
const ctx=await b.newContext({viewport:{width:1440,height:1000}});
await ctx.route(/cartocdn|tile\.openstreetmap/,r=>r.fulfill({status:200,contentType:"image/png",body:TILE}));
await ctx.route(/fonts\.googleapis|fonts\.gstatic/,r=>r.fulfill({status:200,contentType:"text/css",body:""}));
for (const [route,name] of [["/lanes","lanes"],["/","desk"],["/packages","packages"],["/book","book"],["/method","method"],["/field","field"]]) {
  const page=await ctx.newPage();
  await page.goto(`http://localhost:4183${BASE}${route}`,{waitUntil:"domcontentloaded"});
  await page.waitForTimeout(1200);
  await page.screenshot({path:`${OUT}/${name}.png`});
  if (route==="/method") {
    await page.evaluate(()=>{document.getElementById("theme")?.scrollIntoView();});
    await page.waitForTimeout(500);
    await page.screenshot({path:`${OUT}/method-theme.png`});
    await page.evaluate(()=>{window.scrollBy(0,900);
      for(const el of document.querySelectorAll("*")){const cs=getComputedStyle(el);if(/(auto|scroll)/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+2)el.scrollTop+=900;}});
    await page.waitForTimeout(400);
    await page.screenshot({path:`${OUT}/method-theme-2.png`});
  }
  if (route==="/lanes") {
    await page.evaluate(()=>{document.documentElement.style.filter="grayscale(1)";});
    await page.waitForTimeout(300);
    await page.screenshot({path:`${OUT}/lanes-greyscale.png`});
  }
  await page.close();
}
await ctx.close();
const m=await b.newContext({viewport:{width:380,height:820}});
await m.route(/fonts\.googleapis|fonts\.gstatic/,r=>r.fulfill({status:200,contentType:"text/css",body:""}));
for (const [route,name] of [["/lanes","m-lanes"],["/method","m-method"]]) {
  const page=await m.newPage();
  await page.goto(`http://localhost:4183${BASE}${route}`,{waitUntil:"domcontentloaded"});
  await page.waitForTimeout(1100);
  await page.screenshot({path:`${OUT}/${name}.png`});
  await page.close();
}
await b.close(); server.close();
console.log("shots in", OUT);
