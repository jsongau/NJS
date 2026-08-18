import type { ProspectPackageStatus } from "@/domain/types";
import { PACKAGES } from "@/data/packages";
import { DEFAULT_PERIOD_ID } from "@/data/venue";

/**
 * THE FACT TABLE, seeded.
 *
 * One row per organisation this desk has actually done something about,
 * against the package the board leads with, in the current quarter.
 *
 * SEVENTY-FIVE OF THE HUNDRED AND NINE STILL SAY "unworked", AND THAT IS
 * THE MOST IMPORTANT NUMBER IN THE FILE. Twenty-one of them are written
 * out below as unworked rows so a reader can see them sitting there; the
 * other fifty-four have no row at all, which reads the same way
 * downstream and is the honest record of organisations nobody has been
 * near.
 *
 * WHAT PRODUCED THE THIRTY-FOUR THAT DID MOVE. Sixty-four outbound
 * touches over a few weeks, thirty-six replies, and a thread in
 * data/conversations.ts behind every single one. The touch count and the
 * last touch date on each row below are the outbound messages in that
 * thread, counted, rather than a chip somebody set by hand. If the
 * thread says two, the row says two.
 *
 * READ THE SHAPE BEFORE READING ANY ROW. Sixteen in conversation, eleven
 * reached out with nothing usable back, three dates held against no
 * deposit, two booked, two lost, seventy-five never touched. That is not
 * a flattering distribution and it is not meant to be. A reply rate a
 * little over half, on a board where almost every first touch is a web
 * form because no organisation on it publishes an address, is what this
 * trade area actually returns; anything better would be a claim about
 * outreach nobody here has made.
 *
 * BOTH SIGNED ROWS CAME IN RATHER THAN WENT OUT. A campus half a mile
 * away wrote to the quote page, and a bakery rang about a staff evening.
 * Seven of the thirty-four threads were started by the organisation
 * rather than by this desk, and every signed row and two of the three
 * held dates are among those seven. Twenty-seven organisations were
 * opened cold and not one of them has signed anything. That is the most
 * uncomfortable sentence in this file and it is the one most worth
 * acting on, because it says the inbox is currently worth more per hour
 * than the route is.
 *
 * WHAT MOVED A ROW, AND WHAT DID NOT. A genuine reply moves a record to
 * "conversation", because that is what the vocabulary says the word
 * means. An automatic absence reply does not, and neither does being
 * told you have reached the wrong desk, that everything is decided at a
 * regional office, or to come back in January: those are requeues rather
 * than answers, and a board that let a robot promote a record would be
 * lying by the end of the first week. Four rows below are sitting at
 * "reached-out" with a reply in the thread for exactly that reason.
 *
 * THE THREE HELD DATES ARE THE MOST FRAGILE THING HERE. None of them is
 * worth anything until it is signed, which is why they are listed
 * separately from the two that are booked rather than folded in with
 * them. One waits on a school board, one on a lodge committee that meets
 * on a known night, and one on a hospital committee and an invoice route
 * nobody here controls. Note the dates rather than the statuses: the
 * largest hold sits on the same evening as the larger of the two signed
 * bookings, and a board that did not show that collision would be
 * hiding the only capacity question on it.
 *
 * THE RETAIL AND COLLECTIBLE COHORT WAS WORKED ON FOOT, BECAUSE THERE IS
 * NO OTHER WAY TO WORK IT. No row on this board publishes an email
 * address, so the shops that have moved were moved by a go-see, and the
 * threads say so: the channel on those messages is "in-person" and the
 * body is a summary written afterwards rather than a quote. Their
 * `signalSource` reads "observed" for the same reason. The ones that
 * have not moved have not been visited yet.
 *
 * THE SILENT ROWS SAY "unknown" RATHER THAN "reported". Nobody told this
 * desk where those records stand, because nobody replied. Calling that
 * "reported" would be a small lie that makes a quiet board look like a
 * conversation.
 *
 * Everything downstream, the desk order, the lane counts, the capacity
 * chart, the nav badges, the ratio on the Book page, is a selector over
 * this array. Change one row and the whole application moves.
 */
/**
 * The package every row is measured against.
 *
 * Read out of the catalogue rather than typed here, exactly as
 * data/prospects.ts reads its lead package, so this file can never
 * measure a hundred and nine organisations against a package
 * data/packages.ts does not carry.
 */
const LEAD_PACKAGE_ID: string =
  PACKAGES.find((p) => p.id === "all-inclusive-party")?.id ?? PACKAGES[0].id;

/**
 * The quarter this board describes.
 *
 * Taken from data/venue.ts rather than restated, because the period a
 * status belongs to and the period the application opens on have to be
 * the same thing or the desk opens empty.
 */
const PERIOD_ID: string = DEFAULT_PERIOD_ID;

export const SEED_STATUSES: ProspectPackageStatus[] = [
  // -------------------------------------------------------------
  // Booked. Signed, with a deposit. The only rows that are revenue,
  // and both of them are organisations that wrote to this desk first.
  // -------------------------------------------------------------
  {
    prospectId: "cerritos-high-school",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "booked",
    discussedHeadcount: 60,
    targetDate: "2026-11-20",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-12",
    confidence: "high",
    provenance: "illustrative",
  },
  {
    prospectId: "porto-s-bakery-and-cafe",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "booked",
    discussedHeadcount: 120,
    targetDate: "2026-12-11",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-15",
    confidence: "high",
    provenance: "illustrative",
  },

  // -------------------------------------------------------------
  // Held. A date blocked against no deposit, which is worth nothing
  // until it is signed and is listed here so nobody counts it twice.
  // One of the three sits on an evening that already carries a signed
  // booking, which is exactly the collision a board exists to show.
  // -------------------------------------------------------------
  {
    prospectId: "uci-health-lakewood",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "soft-hold",
    discussedHeadcount: 280,
    targetDate: "2026-12-11",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-18",
    confidence: "high",
    provenance: "illustrative",
  },
  {
    prospectId: "norwalk-la-mirada-unified-school-district",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "soft-hold",
    discussedHeadcount: 96,
    targetDate: "2026-12-18",
    signalSource: "reported",
    touches: 3,
    lastTouchAt: "2026-09-22",
    confidence: "high",
    provenance: "illustrative",
  },
  {
    prospectId: "lakewood-bellflower-elks-lodge-no-888",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "soft-hold",
    discussedHeadcount: 60,
    targetDate: "2026-12-04",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-23",
    confidence: "high",
    provenance: "illustrative",
  },

  // -------------------------------------------------------------
  // In conversation. They replied and they are talking. Half of these
  // are sourcing conversations rather than booking ones, which is what
  // a promotions desk in an industrial trade area actually produces.
  // -------------------------------------------------------------
  {
    prospectId: "abc-unified-school-district",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-17",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "cerritos-college",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    discussedHeadcount: 200,
    targetDate: "2027-01-21",
    signalSource: "reported",
    touches: 3,
    lastTouchAt: "2026-09-21",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "los-cerritos-center",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-15",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "gen-restaurant-group-inc",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    discussedHeadcount: 45,
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-19",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "french-press-custom-apparel-printing-and-design",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "reported",
    touches: 3,
    lastTouchAt: "2026-09-18",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "nettrophy-buena-park-plaque-and-trophy",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-15",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "patchmade-llc",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-14",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "wismettac-asian-foods-inc",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-16",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "yamaha-corporation-of-america",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-17",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "chalice-collectibles",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    discussedHeadcount: 60,
    targetDate: "2026-12-19",
    signalSource: "reported",
    touches: 3,
    lastTouchAt: "2026-09-21",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "hot-topic",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "observed",
    observedAt: "2026-09-08",
    touches: 2,
    lastTouchAt: "2026-09-15",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "krazy-nick-s-games",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    discussedHeadcount: 24,
    signalSource: "observed",
    observedAt: "2026-09-09",
    touches: 2,
    lastTouchAt: "2026-09-17",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "cerritos-library",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "observed",
    observedAt: "2026-09-14",
    touches: 2,
    lastTouchAt: "2026-09-16",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "premier-workspaces-cerritos-tower",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    discussedHeadcount: 40,
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-17",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "railmaster-hobbies",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    discussedHeadcount: 40,
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-17",
    confidence: "medium",
    provenance: "illustrative",
  },
  {
    prospectId: "norwalk-chamber-of-commerce",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "conversation",
    signalSource: "reported",
    touches: 2,
    lastTouchAt: "2026-09-18",
    confidence: "medium",
    provenance: "illustrative",
  },

  // -------------------------------------------------------------
  // Reached out. Contacted, and nothing usable back. Three of these
  // have a reply in the thread and are still sitting here, because an
  // absence reply, a routing correction and "come back in January" are
  // requeues rather than answers.
  // -------------------------------------------------------------
  {
    prospectId: "la-mirada-high-school",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "unknown",
    touches: 1,
    lastTouchAt: "2026-09-09",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "whitney-high-school",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "unknown",
    touches: 2,
    lastTouchAt: "2026-09-21",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "epson-america-inc",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "reported",
    touches: 1,
    lastTouchAt: "2026-09-08",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "inbody-usa",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "unknown",
    touches: 2,
    lastTouchAt: "2026-09-21",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "365-custom-printing",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "unknown",
    touches: 2,
    lastTouchAt: "2026-09-16",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "superior-signs-and-graphics",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "unknown",
    touches: 2,
    lastTouchAt: "2026-09-22",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "silver-spur-corporation",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "unknown",
    touches: 2,
    lastTouchAt: "2026-09-23",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "pop-mart",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "observed",
    observedAt: "2026-09-08",
    touches: 1,
    lastTouchAt: "2026-09-08",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "boxlunch",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "observed",
    observedAt: "2026-09-08",
    touches: 1,
    lastTouchAt: "2026-09-08",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "city-of-cerritos-city-hall",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "unknown",
    touches: 1,
    lastTouchAt: "2026-09-12",
    confidence: "low",
    provenance: "illustrative",
  },
  {
    prospectId: "the-source-oc",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "reached-out",
    signalSource: "reported",
    touches: 1,
    lastTouchAt: "2026-09-14",
    confidence: "low",
    provenance: "illustrative",
  },

  // -------------------------------------------------------------
  // Lost. Recorded rather than hidden, because both of these taught
  // this desk something a warm row would not have.
  // -------------------------------------------------------------
  {
    prospectId: "steven-label-corporation",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "lost",
    signalSource: "reported",
    touches: 1,
    lastTouchAt: "2026-09-09",
    confidence: "high",
    provenance: "illustrative",
  },
  {
    prospectId: "big-air-trampoline-park-buena-park",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "lost",
    signalSource: "observed",
    observedAt: "2026-09-11",
    touches: 1,
    lastTouchAt: "2026-09-11",
    confidence: "high",
    provenance: "illustrative",
  },

  // -------------------------------------------------------------
  // Never touched, and written out rather than left implicit.
  //
  // Twenty-one of the seventy-seven. They are here so the board shows
  // its own arrears instead of quietly omitting them: two card shops
  // within walking distance, four decorators and packers that have
  // never had a quote request, a college, two districts, three
  // campuses, and four amusement operators nobody has walked into. The
  // other fifty-six are not in this file at all and read the same way.
  // -------------------------------------------------------------
  {
    prospectId: "best-buy-cerritos",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "gamestop-south-st-cerritos",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "toys-r-us",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "tilted-gaming",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "perfect-rares-card-center",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "sandbox-vr-cerritos",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "medieval-times-dinner-and-tournament",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "the-gardens-casino",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "biola-university",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "bellflower-unified-school-district",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "norwalk-high-school",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "john-glenn-high-school",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "mcauliffe-middle-school",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "polydot-print-specialists",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "anderson-printco-cypress-printing-and-silkscreen",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "manhattan-stitching-company",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "studio-credit",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "vertex-packaging-supplies",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "eno-brands",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "unfi",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
  {
    prospectId: "santa-fe-springs-chamber-of-commerce",
    packageId: LEAD_PACKAGE_ID,
    periodId: PERIOD_ID,
    status: "unworked",
    signalSource: "modeled",
    touches: 0,
    confidence: "low",
    provenance: "modeled",
  },
];
