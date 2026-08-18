import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const ROOT="/tmp/work/me-prospecting/dist", BASE="/me", OUT="/tmp/shots-copy";
fs.mkdirSync(OUT,{recursive:true});
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);
 if(p.startsWith(BASE))p=p.slice(BASE.length)||"/"; let f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const n=path.join(f,"index.html"); f=fs.existsSync(n)?n:path.join(ROOT,"index.html");}
 res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"}); fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4189,r));
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
for (const [id,tag] of [["brea-olinda-high-school","school"],["old-brea-chop-house","retail"]]) {
  const ctx=await b.newContext({viewport:{width:1000,height:1400}});
  await ctx.route(/fonts\.g/,r=>r.fulfill({status:200,contentType:"text/css",body:""}));
  const page=await ctx.newPage();
  await page.goto(`http://localhost:4189${BASE}/quote/${id}`,{waitUntil:"domcontentloaded"});
  await page.waitForTimeout(1400);
  const h=await page.evaluate(()=>document.body.scrollHeight);
  await page.setViewportSize({width:1000,height:Math.min(h+40,7000)});
  await page.waitForTimeout(400);
  await page.screenshot({path:`${OUT}/quote-${tag}.png`});
  console.log(`\n===== QUOTE ${tag} =====`);
  console.log(await page.evaluate(()=>document.querySelector("main").innerText));
  await ctx.close();
}
await b.close(); server.close();
