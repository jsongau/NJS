import fs from "node:fs";
import path from "node:path";

/**
 * Fold the preview build into ONE self-contained html file.
 *
 * The user opens previews from Downloads over file://. A normal Vite
 * build references /assets/*.js and /assets/*.css, which resolve to
 * nothing there, and the page renders as unstyled blue-link text. So the
 * JS, the CSS, and the brand images all get inlined and the result is a
 * single file that works with no server at all.
 */
const dir = path.resolve(process.argv[2] ?? "dist-preview");
const out = path.resolve(process.argv[3] ?? "preview.html");

let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");

const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".gif": "image/gif" };

/** Images first, so the JS that references them picks up the data URI. */
function inlineImages(source) {
  return source.replace(/["'](?:\.\/)?assets\/([^"']+?\.(png|jpe?g|svg|webp|gif))["']/g, (m, rel, ext) => {
    const file = path.join(dir, "assets", rel);
    if (!fs.existsSync(file)) return m;
    const b64 = fs.readFileSync(file).toString("base64");
    return `"data:${mime["." + ext.toLowerCase()] ?? "application/octet-stream"};base64,${b64}"`;
  });
}

// css
html = html.replace(/<link[^>]+rel="stylesheet"[^>]+href="(?:\.\/)?([^"]+)"[^>]*>/g, (m, href) => {
  const file = path.join(dir, href);
  if (!fs.existsSync(file)) return m;
  const css = inlineImages(fs.readFileSync(file, "utf8"));
  return `<style>${css}</style>`;
});

// js, in document order so the chunk loads before the entry
const scripts = [...html.matchAll(/<script[^>]+src="(?:\.\/)?([^"]+)"[^>]*><\/script>/g)];
for (const [tag, src] of scripts) {
  const file = path.join(dir, src);
  if (!fs.existsSync(file)) continue;
  const code = inlineImages(fs.readFileSync(file, "utf8"));
  // A replacer FUNCTION, not a string. Minified bundles contain "$&" and
  // "$\'" sequences, and String.replace expands those in a string
  // replacement, which splices the script tag back into the middle of
  // React. A function replacement disables that substitution entirely.
  html = html.replace(tag, () => `<script type="module">\n${code}\n</script>`);
}

// modulepreload links point at files that no longer exist standalone
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, "");

fs.writeFileSync(out, html);
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`wrote ${out} (${kb} KB), ${scripts.length} scripts inlined`);
/**
 * Only attribute references matter. A path that survives INSIDE the
 * bundled JS is usually a build-manifest string that is never fetched;
 * a path in a src= or href= attribute is a request the browser will
 * actually make, and over file:// that request fails silently.
 */
const live = [...html.matchAll(/\b(?:src|href)="(\.?\/?assets\/[^"]+)"/g)].map((m) => m[1]);
if (live.length > 0) {
  console.error("STILL REFERENCES assets/ in attributes, preview would break over file://");
  console.error(live.join("\n"));
  process.exit(1);
}
console.log("no live assets/ references, safe to open from file://");
