import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path"; import http from "node:http";
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".json":"application/json",".webmanifest":"application/manifest+json",".woff2":"font/woff2",".ico":"image/x-icon",".webp":"image/webp"};
function serve(root,port){const s=http.createServer((req,res)=>{const raw=decodeURIComponent(req.url.split("?")[0]);const url=raw.startsWith("/me")?raw.slice(3)||"/":raw;let f=path.join(root,url);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,"index.html");if(!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end("404");return;}res.writeHead(200,{"content-type":TYPES[path.extname(f)]??"application/octet-stream"});fs.createReadStream(f).pipe(res);});return new Promise(r=>s.listen(port,()=>r(s)));}
const a=await serve(process.argv[2],4631), b=await serve(process.argv[3],4632);
const br=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});
async function probe(port,label){const p=await br.newPage({viewport:{width:1440,height:900}});
await p.goto(`http://localhost:${port}/me/today`,{waitUntil:"networkidle"});
const r=await p.evaluate(()=>{
  const hits=[];
  const walk=(el,trail)=>{ for(const c of el.children){ const t=(c.textContent||"").trim();
    if(/^Desk\s*151/.test(t.replace(/\s+/g," ")) && c.children.length<=4){ hits.push({trail:trail+">"+c.tagName.toLowerCase()+"."+(c.className||"").toString().slice(0,40), text:t.replace(/\s+/g," ").slice(0,70)}); }
    walk(c, trail+">"+c.tagName.toLowerCase()); } };
  walk(document.body,"body");
  const desks=[...document.querySelectorAll("*")].filter(e=>e.children.length===0 && (e.textContent||"").trim()==="Desk").map(e=>{let t=[],n=e;while(n&&n!==document.body){t.unshift(n.tagName.toLowerCase()+(n.className?"."+String(n.className).split(" ")[0]:""));n=n.parentElement;}return t.slice(-5).join(">");});
  return {deskCount:desks.length, desks};
});
await p.close(); console.log(label, JSON.stringify(r,null,1));}
await probe(4631,"DEPLOYED"); await probe(4632,"NEW");
await br.close(); a.close(); b.close();
