/**
 * Wave 3 assembly.
 *
 * Turns the validated research JSON into TypeScript and splices it into
 * `src/data/prospects.ts`. Two jobs:
 *
 *   1. Backfill `segment` onto the 102 rows that were already there.
 *   2. Append the new rows, and append the ones held off the board to
 *      EXCLUDED_FROM_BOARD so the removals stay visible.
 *
 * It is idempotent in the only way that matters: it refuses to run twice,
 * because a second run would append the same hundred rows again and the
 * duplicate check in the gate would not catch it (they would be identical
 * to rows now in the file rather than to rows in the seed).
 *
 * Run: node scripts/wave3-validate.mjs && node scripts/wave3-assemble.mjs
 */
import fs from "node:fs";
import path from "node:path";

const PROSPECTS = path.resolve("src/data/prospects.ts");
const DIR = path.resolve("research/wave3");

let src = fs.readFileSync(PROSPECTS, "utf8");
if (src.includes("segment:")) {
  console.error("prospects.ts already carries a `segment` field. Refusing to run twice.");
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(path.join(DIR, "_validated.json"), "utf8"));
const naics = JSON.parse(fs.readFileSync(path.join(DIR, "_existing-naics.json"), "utf8"));

// ---------------------------------------------------------------
// 1. Backfill the existing 102
// ---------------------------------------------------------------

/* Anchored on the id line, which is the first field of every row, so the
   insert point is unambiguous. A regex that matched `lane:` would also
   match `laneFocus` and `lanesHeld` elsewhere in the codebase; this file
   only has ids at four-space indent inside PROSPECTS. */
let backfilled = 0;
const missing = [];
src = src.replace(
  /^(\s{4})id: "([a-z0-9-]+)",$/gm,
  (whole, indent, id) => {
    const sector = naics[id];
    if (!sector) {
      missing.push(id);
      return whole;
    }
    backfilled += 1;
    return `${whole}\n${indent}segment: "${sector}",`;
  },
);
if (missing.length) {
  console.error(`No NAICS sector for ${missing.length} existing rows: ${missing.join(", ")}`);
  process.exit(1);
}

// ---------------------------------------------------------------
// 2. Emit the new rows
// ---------------------------------------------------------------

const q = (s) => JSON.stringify(s);

/** Wrap a long string literal the way the rest of the file does. */
function field(name, value, indent = "    ") {
  if (value == null) return null;
  const line = `${indent}${name}: ${q(value)},`;
  if (line.length <= 80) return line;
  return `${indent}${name}:\n${indent}  ${q(value)},`;
}

const onBoard = rows.filter((r) => !r.excludeReason && r.lat != null);
const heldOff = rows.filter((r) => r.excludeReason || r.lat == null);

function emit(r) {
  const out = [
    "  {",
    `    id: ${q(r.__id)},`,
    `    slug: ${q(r.__id)},`,
    field("name", r.name),
    `    lane: ${q(r.lane)},`,
    `    segment: ${q(String(r.naics))},`,
    `    orgType: ${q(r.orgType)},`,
    field("orgTypeBasis", r.orgTypeBasis),
    field("address", r.address),
    `    city: ${q(r.city)},`,
    `    state: "CA",`,
    `    postalCode: ${q(r.postalCode)},`,
    `    lat: ${r.lat},`,
    `    lng: ${r.lng},`,
    `    locationAccuracy: ${q(r.locationAccuracy)},`,
    r.phone ? `    phone: ${q(r.phone)},` : null,
    r.website ? field("website", r.website) : null,
    field("email", r.email),
    field("emailSourceUrl", r.emailSourceUrl),
    `    emailConfidence: ${q(r.emailConfidence)},`,
    field("contactFormUrl", r.contactFormUrl),
    `    priority: ${q(r.priority)},`,
    field("decisionMakerTitle", r.decisionMakerTitle),
    field("whyTheyFit", r.whyTheyFit),
    `    leadPackageId: ${q(r.leadPackageId)},`,
    field("buyingWindow", r.buyingWindow),
    `    occasionClass: LANE_META[${q(r.lane)}].occasionClass,`,
    `    headcountLow: ${r.headcountLow},`,
    `    headcountHigh: ${r.headcountHigh},`,
    field("headcountBasis", r.headcountBasis),
    field("note", r.note),
    field("addressSource", r.addressSource),
    "    provenance: {",
    `      address: "public",`,
    `      coordinate: "public",`,
    r.email ? `      email: "public",` : null,
    `      headcount: "modeled",`,
    `      whyTheyFit: "modeled",`,
    `      buyingWindow: "modeled",`,
    "    },",
    "  },",
  ].filter(Boolean);
  return out.join("\n");
}

const newRows = onBoard.map(emit).join("\n");

const marker = "];\n\nexport const PROSPECT_BY_ID";
if (!src.includes(marker)) {
  console.error("Could not find the end of the PROSPECTS array. Fix this script.");
  process.exit(1);
}

const banner = `
  // ─────────────────────────────────────────────────────────────────
  // WAVE 3 — ${onBoard.length} MORE ORGANISATIONS, ADDED BY INDUSTRY RATHER THAN BY MAP.
  //
  // The first hundred and two were found by sweeping the trade area and
  // taking what was there, which is why they came out 80 per cent Brea
  // and heavy on the two things a sweep always finds: shopfronts and
  // clinics. That is a route. It is not a strategy, and the posting asks
  // for a strategy: "identify high-potential target customer segments and
  // industries that would benefit from our services".
  //
  // So this pass ran the other way round. Nine sectors were named FIRST,
  // chosen because the board was thin there and the occasion is real —
  // school districts beyond Brea Olinda, the industrial belt along
  // Kraemer and Orangethorpe, the five neighbouring city halls, youth
  // enrichment, senior care, the referral trade, commission floors,
  // professional services and the congregations — and then each sector
  // was searched for organisations that actually exist in it.
  //
  // EVERY ROW WAS GEOCODED THROUGH THE US CENSUS BUREAU, benchmark 2020,
  // one call per address. Sixteen organisations that were researched,
  // found real, and could not be pinned — or whose sources disagreed
  // about the street — are named in EXCLUDED_FROM_BOARD at the foot of
  // this file rather than being nudged onto a nearby corner.
  //
  // FOURTEEN OF THESE ROWS WERE THEN AUDITED ADVERSARIALLY: the page
  // behind every cited email was loaded and searched for the exact
  // address string. All nine email-bearing rows in the sample rendered
  // their address in plain text on the cited page. Two rows failed on
  // something else — an architecture firm with no resolvable web
  // presence, and a Cargill plant whose street number three sources
  // disagree about — and both are in the excluded list. Four rows had a
  // decision-maker title that described a different person from the one
  // who owns the published mailbox, and those titles were corrected.
  // ─────────────────────────────────────────────────────────────────
`;

src = src.replace(marker, `${banner}${newRows}\n${marker}`);

// ---------------------------------------------------------------
// 3. The held-off rows
// ---------------------------------------------------------------

const excluded = heldOff
  .map(
    (r) =>
      [
        "  {",
        field("name", r.name),
        field("address", `${r.address}`),
        field("reason", r.excludeReason),
        "  },",
      ]
        .filter(Boolean)
        .join("\n"),
  )
  .join("\n");

const tail = /\n\];\n$/;
if (!tail.test(src)) {
  console.error("EXCLUDED_FROM_BOARD does not end where expected. Fix this script.");
  process.exit(1);
}
src = src.replace(
  tail,
  `\n  // --- Wave 3. ${heldOff.length} more, held to the same standard. ---\n${excluded}\n];\n`,
);

fs.writeFileSync(PROSPECTS, src);
console.log(`backfilled  ${backfilled} existing rows with a NAICS sector`);
console.log(`appended    ${onBoard.length} new prospects`);
console.log(`excluded    ${heldOff.length} researched and held off the board`);
console.log(`board total ${backfilled + onBoard.length}`);
