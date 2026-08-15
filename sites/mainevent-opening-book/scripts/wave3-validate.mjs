/**
 * Wave 3 gate.
 *
 * Nine research agents wrote nine JSON files. This reads all of them and
 * refuses anything that would put a fabricated or unusable row on the
 * board. It prints findings and exits non-zero; it does not repair, because
 * a script that quietly fixes a bad row is how a bad row ships.
 *
 * Run: node scripts/wave3-validate.mjs
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve("research/wave3");
const SRC = fs.readFileSync(path.resolve("src/data/prospects.ts"), "utf8");

const LANES = new Set([
  "schools", "colleges", "fitness-youth-sports", "corporate", "auto-finance",
  "hospitality-civic", "faith-nonprofit", "healthcare", "local-retail-food",
]);
const PACKAGES = new Set(
  [...fs.readFileSync(path.resolve("src/data/packages.ts"), "utf8")
    .matchAll(/^\s{4}id: "([a-z0-9-]+)",$/gm)].map((m) => m[1]),
);
const PRIORITIES = new Set(["anchor", "high", "medium", "low"]);
const ORG_TYPES = new Set(["school", "independent", "chain", "unknown"]);
const EMAIL_CONF = new Set(["verified_public", "form_only", "none"]);
const NAICS = new Set([
  "22", "23", "31", "42", "44", "48", "51", "52", "53", "54", "56", "61",
  "62", "71", "72", "81", "92",
]);

/* The venue, taken from src/data/venue.ts rather than retyped, because the
   whole point of recomputing distance here is to agree with the app. */
const venueSrc = fs.readFileSync(path.resolve("src/data/venue.ts"), "utf8");
const VLAT = Number(/lat:\s*(-?[\d.]+)/.exec(venueSrc)[1]);
const VLNG = Number(/lng:\s*(-?[\d.]+)/.exec(venueSrc)[1]);

const R = 3958.8;
const rad = (d) => (d * Math.PI) / 180;
function haversine(lat, lng) {
  const dLat = rad(lat - VLAT);
  const dLng = rad(lng - VLNG);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(VLAT)) * Math.cos(rad(lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** A comparable key. Punctuation and legal suffixes are noise here. */
const norm = (s) =>
  (s ?? "")
    .toLowerCase()
    .replace(/[.,'’&]/g, "")
    .replace(/\b(inc|llc|corp|corporation|company|co|ltd|the)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

const existingNames = new Set(
  [...SRC.matchAll(/^\s{4}name: "(.+?)",$/gm)].map((m) => norm(m[1])),
);
const existingIds = new Set(
  [...SRC.matchAll(/^\s{4}id: "([a-z0-9-]+)",$/gm)].map((m) => m[1]),
);
const excludedNames = new Set(
  [...SRC.matchAll(/^\s{4}name: "(.+?)",$/gm)].map((m) => norm(m[1])),
);

export function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/, "");
}

/* Only the numbered segment files. `_validated.json` is this script's own
   output and `_existing-naics.json` is an object rather than an array; both
   would be read back in and neither is a research file. */
const files = fs
  .readdirSync(DIR)
  .filter((f) => /^\d\d-.*\.json$/.test(f))
  .sort();
const rows = [];
for (const f of files) {
  const parsed = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  parsed.forEach((r) => rows.push({ ...r, __src: f }));
}

const errors = [];
const warnings = [];
const seenId = new Map();

for (const r of rows) {
  const where = `${r.__src} :: ${r.name}`;
  const off = Boolean(r.excludeReason) || r.lat == null || r.lng == null;

  if (!LANES.has(r.lane)) errors.push(`${where}: bad lane "${r.lane}"`);
  if (!NAICS.has(String(r.naics))) errors.push(`${where}: bad naics "${r.naics}"`);
  if (!ORG_TYPES.has(r.orgType)) errors.push(`${where}: bad orgType "${r.orgType}"`);
  if (!PRIORITIES.has(r.priority)) errors.push(`${where}: bad priority "${r.priority}"`);
  if (!EMAIL_CONF.has(r.emailConfidence))
    errors.push(`${where}: bad emailConfidence "${r.emailConfidence}"`);
  if (!PACKAGES.has(r.leadPackageId))
    errors.push(`${where}: leadPackageId "${r.leadPackageId}" is not a published package`);

  /* RULE 2. An email without the page it was read off is a guessed email. */
  if (r.email && !r.emailSourceUrl)
    errors.push(`${where}: email with no emailSourceUrl. Guessed addresses do not ship.`);
  if (r.email && r.emailConfidence !== "verified_public")
    errors.push(`${where}: has an email but emailConfidence is "${r.emailConfidence}"`);
  if (!r.email && r.emailConfidence === "verified_public")
    errors.push(`${where}: verified_public with no address`);
  if (r.emailConfidence === "form_only" && !r.contactFormUrl)
    warnings.push(`${where}: form_only with no contactFormUrl`);

  for (const k of ["orgTypeBasis", "whyTheyFit", "headcountBasis", "addressSource", "buyingWindow"])
    if (!r[k] || String(r[k]).trim().length < 8) errors.push(`${where}: ${k} is empty or a stub`);
  /* A separate, shorter floor. "Owner" is five characters and is the
     correct answer for half the local retail lane; a length rule tuned for
     sentences must not reject the shortest true job title there is. */
  if (!r.decisionMakerTitle || r.decisionMakerTitle.trim().length < 4)
    errors.push(`${where}: decisionMakerTitle is empty or a stub`);
  if (/\b(mr|mrs|ms|dr)\b|,\s*(jr|sr)\b/i.test(r.decisionMakerTitle ?? ""))
    warnings.push(`${where}: decisionMakerTitle looks like a person, not a role`);

  if (!(r.headcountLow > 0) || !(r.headcountHigh >= r.headcountLow))
    errors.push(`${where}: headcount range ${r.headcountLow}-${r.headcountHigh} is not a range`);
  /* A GROUP SIZE, NOT A POPULATION. The venue publishes 26+ lanes at one
     lane per 20 guests, so the largest thing the building can hold in one
     night is on the order of 500. A row saying 14,000 is district
     enrolment wearing a headcount's clothes, and every revenue figure
     downstream would inherit it. */
  if (r.headcountHigh > 600)
    errors.push(`${where}: headcountHigh ${r.headcountHigh} is a population, not a group size`);

  if (!off) {
    if (r.lat < 33.5 || r.lat > 34.3 || r.lng < -118.4 || r.lng > -117.3)
      errors.push(`${where}: coordinate outside the trade-area envelope`);
    const miles = haversine(r.lat, r.lng);
    r.__miles = Math.round(miles * 10) / 10;
    if (miles > 7.2) errors.push(`${where}: ${r.__miles} mi from the venue, outside the trade area`);
    if (r.milesFromVenue != null && Math.abs(miles - r.milesFromVenue) > 0.35)
      warnings.push(`${where}: agent said ${r.milesFromVenue} mi, recomputed ${r.__miles} mi (venue anchor differs)`);
    if (r.geocodeStatus !== "matched")
      errors.push(`${where}: has a coordinate but geocodeStatus is "${r.geocodeStatus}"`);
  } else {
    if (!r.excludeReason) errors.push(`${where}: null pin with no excludeReason`);
  }

  if (existingNames.has(norm(r.name)))
    errors.push(`${where}: already on the board`);

  const id = slugify(r.name);
  if (existingIds.has(id)) errors.push(`${where}: id "${id}" collides with an existing row`);
  if (seenId.has(id)) errors.push(`${where}: id "${id}" collides with ${seenId.get(id)}`);
  seenId.set(id, where);
  r.__id = id;
}

const onBoard = rows.filter((r) => !r.excludeReason && r.lat != null);
const off = rows.filter((r) => r.excludeReason || r.lat == null);

console.log(`files          ${files.length}`);
console.log(`rows read      ${rows.length}`);
console.log(`on the board   ${onBoard.length}`);
console.log(`held off       ${off.length}`);
console.log(`venue anchor   ${VLAT}, ${VLNG}`);
console.log("");
const by = (k) => {
  const t = {};
  onBoard.forEach((r) => (t[r[k]] = (t[r[k]] || 0) + 1));
  return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([a, b]) => `${a} ${b}`).join(", ");
};
console.log(`lane           ${by("lane")}`);
console.log(`naics          ${by("naics")}`);
console.log(`city           ${by("city")}`);
console.log(`email          ${by("emailConfidence")}`);
console.log(`priority       ${by("priority")}`);
console.log("");
if (warnings.length) {
  console.log(`--- ${warnings.length} warnings`);
  warnings.forEach((w) => console.log("  ! " + w));
  console.log("");
}
if (errors.length) {
  console.log(`--- ${errors.length} ERRORS`);
  errors.forEach((e) => console.log("  x " + e));
  process.exit(1);
}
console.log("clean");
fs.writeFileSync(
  path.join(DIR, "_validated.json"),
  JSON.stringify(rows, null, 2),
);
