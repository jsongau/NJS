import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const ROOT="/tmp/work/me-prospecting/dist", BASE="/me";
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".json":"application/json"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p.startsWith(BASE))p=p.slice(BASE.length)||"/";let f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const n=path.join(f,"index.html");f=fs.existsSync(n)?n:path.join(ROOT,"index.html");}res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(4190,r));
const TILE=fs.readFileSync("/tmp/work/me-prospecting/scripts/_tile.png");
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});

for (const w of [1440, 380]) {
  const ctx=await b.newContext({viewport:{width:w,height:800}});
  const p=await ctx.newPage();
  await p.goto("http://localhost:4190/me/today",{waitUntil:"networkidle"});
  await p.waitForTimeout(500);
  const link = p.getByLabel("The screens used every day").locator("[data-featured='key'] a");
  console.log(w, "featured key accessible name:", JSON.stringify(await link.evaluate(el=>el.innerText.replace(/\s+/g," ").trim())), "| aria:", await link.getAttribute("aria-label"));
  await ctx.close();
}

// aria-live regions on the board + what changes when a run is taken
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.route(/cartocdn/,r=>r.fulfill({status:200,contentType:"image/png",body:TILE}));
const p=await ctx.newPage();
await p.goto("http://localhost:4190/me/map",{waitUntil:"networkidle"});
await p.waitForTimeout(1500);
const before=await p.evaluate(()=>[...document.querySelectorAll("[aria-live]")].map(e=>({live:e.getAttribute("aria-live"),atomic:e.getAttribute("aria-atomic"),txt:e.innerText.replace(/\s+/g," ").trim().slice(0,110)})));
console.log("LIVE REGIONS before:", JSON.stringify(before,null,1));
await p.getByRole("button",{name:/Put the run on the board/i}).first().click();
await p.waitForTimeout(900);
const after=await p.evaluate(()=>[...document.querySelectorAll("[aria-live]")].map(e=>({live:e.getAttribute("aria-live"),txt:e.innerText.replace(/\s+/g," ").trim().slice(0,110)})));
console.log("LIVE REGIONS after:", JSON.stringify(after,null,1));
// the strip overlap at 1024: are readouts actually covered?
await p.setViewportSize({width:1024,height:800});
await p.goto("http://localhost:4190/me/today",{waitUntil:"networkidle"});
await p.waitForTimeout(500);
const cover=await p.evaluate(()=>{
  const nav=document.querySelector("[data-featured='key']").closest("nav");
  const out=[];
  for(const li of nav.querySelectorAll("ul li")){
    const a=li.querySelector("a"); const b=a.getBoundingClientRect();
    // point at the centre of the readout (last child span)
    const kids=[...a.children]; const ro=kids[kids.length-1].getBoundingClientRect();
    const cx=ro.x+ro.width/2, cy=ro.y+ro.height/2;
    const top=document.elementFromPoint(cx,cy);
    out.push({key:a.textContent.trim().slice(0,10), readoutCoveredBy: top && !a.contains(top) ? (top.closest("a")?.textContent.trim().slice(0,14) || top.tagName) : "self"});
  }
  return out;
});
console.log("1024 readout hit test:", JSON.stringify(cover));
await b.close(); server.close();
