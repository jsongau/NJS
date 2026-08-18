/**
 * The evidence sheet. Screenshots of the deployed build beside the new
 * one on the same screens, plus the two things that only exist in the
 * new one, so an approval is given against pictures rather than against
 * a description of pictures.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const OLD = path.resolve(process.argv[2]);
const NEW = path.resolve(process.argv[3]);
const OUT = path.resolve(process.argv[4] ?? "/tmp/shots");
const BASE = "/me";
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".webp": "image/webp" };

function serve(root, port) {
  const s = http.createServer((req, res) => {
    const raw = decodeURIComponent(req.url.split("?")[0]);
    const url = raw.startsWith(BASE) ? raw.slice(BASE.length) || "/" : raw;
    let f = path.join(root, url);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); res.end("404"); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(f)] ?? "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => s.listen(port, () => r(s)));
}

fs.mkdirSync(OUT, { recursive: true });
const a = await serve(OLD, 4641);
const b = await serve(NEW, 4642);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

async function shot(port, route, name, width = 1440) {
  const p = await browser.newPage({ viewport: { width, height: 900 } });
  await p.goto(`http://localhost:${port}${BASE}${route === "/" ? "/" : route}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(OUT, `${name}.png`) });
  await p.close();
  return `${name}.png`;
}

const pairs = [["/today", "today"], ["/lanes", "lanes"], ["/spend", "spend"], ["/partners", "partners"]];
for (const [route, name] of pairs) {
  await shot(4641, route, `A-deployed-${name}`);
  await shot(4642, route, `B-new-${name}`);
  await shot(4642, `/rationale${route}`, `C-new-rationale-${name}`);
}
await shot(4642, "/map", "D-new-map-takeover");
await shot(4642, "/sellthrough", "E-new-sellthrough");
await shot(4642, "/rationale", "F-new-rationale-home");
await shot(4642, "/today", "G-new-today-narrow", 390);
await shot(4642, "/rationale/today", "H-new-rationale-today-narrow", 390);

await browser.close();
a.close();
b.close();
console.log(fs.readdirSync(OUT).sort().join("\n"));
