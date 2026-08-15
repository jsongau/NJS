import type { EventPackage } from "@/domain/types";

/*
  The family reading order is re-exported from the vocabulary rather than
  declared here. It used to be declared in both places, which is two
  files with an opinion about the order of five values, and the cost of
  that shows up the first time one of them changes.
*/
export { PACKAGE_FAMILY_ORDER } from "@/domain/vocabulary";

/**
 * What Main Event actually sells, as Main Event actually publishes it.
 *
 * EVERY FIELD IN THIS FILE WAS READ OFF MAINEVENT.COM ON 11 AUGUST 2026
 * AND CARRIES THE URL IT WAS READ FROM. Nothing here is a guess, and
 * where Main Event withholds a figure the field is null and its
 * provenance is "withheld" rather than an estimate wearing a number's
 * clothes.
 *
 * THE PATTERN IN THE NULLS IS THE FINDING.
 *
 * Look at what is priced: birthday packages, the All-Access Grad Pack at
 * $29.99, the MVP Grad Pack at $52.00, the Play It Forward fundraiser
 * voucher at $19.95. Every one of those is a product a parent or a PTA
 * treasurer buys on their own, at night, on a phone.
 *
 * Now look at what is not priced: All Access Pass, Corporate All Access
 * Pass, MVP, Level Up, Fun 101, All Day Meeting, Happy Hour, both Full
 * Facility Buyouts, Group and School Lock-In, Bowl 'n Fun, Bowl 'n
 * Games, School All Access Pass, Project Graduation, weddings,
 * quinceañeras. Every one of those pages says to contact the local sales
 * manager, and several say plainly that "room rental fees and revenue
 * minimums may apply".
 *
 * Main Event has drawn a line through its own product range: below it,
 * the website sells; above it, a person does. THE ROLE THIS PROTOTYPE
 * WAS BUILT FOR IS THAT PERSON. Which means the unpriced half of this
 * file is not missing data. It is the job description.
 */

const SRC = {
  corporate: "https://www.mainevent.com/events/corporate-events/",
  allAccess: "https://www.mainevent.com/events/corporate-events/all-access-pass/",
  corpAllAccess:
    "https://www.mainevent.com/events/corporate-events/corporate-all-access-pass/",
  mvp: "https://www.mainevent.com/events/corporate-events/mvp/",
  levelUp: "https://www.mainevent.com/events/corporate-events/level-up/",
  fun101: "https://www.mainevent.com/events/corporate-events/fun-101/",
  allDay: "https://www.mainevent.com/events/corporate-events/all-day-meeting/",
  happyHour: "https://www.mainevent.com/events/corporate-events/happy-hour/",
  corpBuyout:
    "https://www.mainevent.com/events/corporate-events/full-facility-buyout-corporate/",
  teamBuilding: "https://www.mainevent.com/events/teambuilding/",
  school: "https://www.mainevent.com/events/school-events/",
  schoolAllAccess:
    "https://www.mainevent.com/events/school-events/school-all-access-pass/",
  bowlNFun: "https://www.mainevent.com/events/school-events/bowl-n-fun/",
  schoolLockIn:
    "https://www.mainevent.com/events/school-events/lock-in-3-or-4-hours-school/",
  projectGrad:
    "https://www.mainevent.com/events/school-events/project-graduation-or-prom/",
  playItForward:
    "https://www.mainevent.com/events/school-events/play-it-forward/",
  gradPack:
    "https://www.mainevent.com/events/school-events/all-access-grad-pack/",
  gradPacks: "https://www.mainevent.com/events/group-events/grad-packs/",
  group: "https://www.mainevent.com/events/group-events/",
  groupBowlNGames:
    "https://www.mainevent.com/events/group-events/bowl-n-games-group/",
  groupLockIn:
    "https://www.mainevent.com/events/group-events/lock-in-3-or-4-hours-group/",
  groupBuyout:
    "https://www.mainevent.com/events/group-events/full-facility-buyout-group/",
  holidays: "https://www.mainevent.com/events/holidays/",
  birthdays: "https://www.mainevent.com/birthdays/packages/",
} as const;

/** The published booking terms that repeat across almost every package. */
export const STANDARD_TERMS = {
  bookingNoticeDays: 5,
  depositPercent: 50,
  note: "A minimum 5-day booking notice and a 50% deposit are required to reserve. Published verbatim on the All Access Pass, Fun 101, Level Up, MVP and Happy Hour pages.",
  source: SRC.allAccess,
} as const;

/**
 * The lowest published per-person food figure anywhere on the site.
 *
 * It appears twice, in the same words, on two different corporate pages:
 * "Banquet Options starting at $14 per person" and "minimum food spend
 * starting at $14 per person". It is the only F&B number Main Event
 * publishes at all, which makes it the floor under every unpriced
 * corporate package here.
 */
export const BANQUET_FLOOR_PER_GUEST = 14;

export const PACKAGES: EventPackage[] = [
  // -------------------------------------------------------------
  // SELF-SERVE. Priced, published, books itself.
  // -------------------------------------------------------------
  {
    id: "all-access-grad-pack",
    name: "All-Access Grad Pack",
    family: "self-serve",
    inclusions: [
      "2 hours unlimited game play",
      "All-Access wristband for laser tag, gravity ropes and more",
      "1 hour bowling",
      "Laneside buffet: sliders, boneless wings, fries, donut holes",
      "Unlimited soft drinks",
    ],
    minGuests: 10,
    maxGuests: null,
    pricePerGuest: 29.99,
    priceNote: "Excludes tax and service fees.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    laneFit: ["schools", "colleges"],
    source: SRC.gradPack,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "withheld",
    },
  },
  {
    id: "mvp-grad-pack",
    name: "MVP Grad Pack",
    family: "self-serve",
    inclusions: [
      "3 hours unlimited activities",
      "3 hours unlimited game play",
      "Semi-private area",
      "Unlimited soda and iced tea",
      "Banquet options",
      "Customised Main Event bowling pin",
      "Certificate for 1 hour free game play for the graduate",
    ],
    minGuests: 10,
    maxGuests: null,
    pricePerGuest: 52,
    priceNote:
      "Minimum 20 guests for the Kingpin banquet option, which adds $10 per person. Excludes tax and service fees.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    laneFit: ["schools", "colleges"],
    source: SRC.gradPack,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "withheld",
    },
  },
  {
    id: "play-it-forward",
    name: "Play It Forward",
    family: "fundraiser",
    inclusions: [
      "4 hours unlimited bowling, billiards, laser tag, gravity ropes, mini golf and rock climbing where available",
      "$10 game card",
      "2 pizza slices and a soft drink",
      "Bowling shoes",
      "Marketed by Main Event as $60 of fun",
    ],
    minGuests: 10,
    maxGuests: null,
    pricePerGuest: 19.95,
    priceNote:
      "A voucher block, not a party. The group buys at $19.95 and resells at whatever it likes, and the margin is the fundraiser. Minimum 10 vouchers, purchased through the sales office at least 3 business days ahead. Redeemable only at the issuing location, Mon to Thu and Fri 11am to 5pm. Youth 17 and under. Not valid with other offers and not available for birthday parties.",
    dayParts: ["weekday-daytime", "weekday-evening"],
    dayPartNote: "Mon to Thu, and Fri 11am to 5pm only.",
    bookingNoticeDays: 3,
    laneFit: ["schools", "faith-nonprofit", "fitness-youth-sports"],
    source: SRC.playItForward,
    provenance: { pricePerGuest: "public", inclusions: "public", minGuests: "public" },
  },
  {
    id: "spirit-night",
    name: "Spirit Night fundraiser",
    family: "fundraiser",
    inclusions: [
      "Main Event donates 20% of all sales on the night to the nonprofit",
      "The group brings its own people; the venue provides the night",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "There is no per-guest price because nobody buys a package. The group is paid a share of what its own community spends. Minimums and terms beyond the 20% figure are not published.",
    dayParts: ["any"],
    laneFit: ["schools", "faith-nonprofit", "fitness-youth-sports", "colleges"],
    source: SRC.school,
    provenance: { pricePerGuest: "withheld", inclusions: "public", minGuests: "withheld" },
  },
  {
    id: "the-main-event-birthday",
    name: "The Main Event (birthday)",
    family: "self-serve",
    inclusions: [
      "4 activities",
      "$10 Fun Card per guest",
      "1,000 Winner's Choice Points",
      "Food options and unlimited fountain drinks",
      "Dedicated party host",
      "1 hour reserved party space",
      "Online invitations",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 29.99,
    priceNote:
      "The top of the published birthday range. Main Event states birthdays start at $11.99 and go to $29.99 per guest, with a $100 deposit to confirm. Minimum guest count is not published.",
    dayParts: ["any"],
    laneFit: ["fitness-youth-sports", "faith-nonprofit"],
    source: SRC.birthdays,
    provenance: { pricePerGuest: "public", inclusions: "public", minGuests: "withheld" },
  },

  // -------------------------------------------------------------
  // YOUTH GROUP. Published in full, priced nowhere.
  // -------------------------------------------------------------
  {
    id: "school-all-access-pass",
    name: "School All Access Pass",
    family: "youth-group",
    inclusions: [
      "4 hours unlimited bowling and billiards",
      "Laser tag, gravity ropes, mini golf and rock climbing where available",
      "$10 Fun Card",
      "2 pizza slices and a medium soft drink",
      "1 lane per 20 guests",
    ],
    minGuests: 20,
    maxGuests: 300,
    pricePerGuest: null,
    priceNote:
      "Not published. AM Pass runs Mon to Fri from open to 5pm; PM Pass runs Sun to Thu from 5pm to close. Students 17 and under. 48 inch height minimum for laser tag and gravity ropes.",
    dayParts: ["weekday-daytime", "weekday-evening"],
    bookingNoticeDays: 5,
    lanesPerTwentyGuests: 1,
    laneFit: ["schools", "faith-nonprofit"],
    source: SRC.schoolAllAccess,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "public",
    },
  },
  {
    id: "bowl-n-fun",
    name: "Bowl 'n Fun",
    family: "youth-group",
    inclusions: [
      "1 hour bowling with shoes",
      "$10 Fun Card",
      "Choice of laser tag, gravity ropes or glow golf",
      "2 pizza slices and a soft drink",
    ],
    minGuests: 12,
    maxGuests: 50,
    pricePerGuest: null,
    priceNote:
      "Not published. Mon to Fri before 5pm, Sat before 11am, Sun after 6pm. Age 17 and under.",
    dayParts: ["weekday-daytime"],
    dayPartNote:
      "The day parts are the point. This package exists to fill a Tuesday at 10am, which is the hardest inventory in the building to sell and the easiest thing in the world for a school to say yes to.",
    bookingNoticeDays: 5,
    lanesPerTwentyGuests: 1,
    laneFit: ["schools", "faith-nonprofit", "fitness-youth-sports"],
    source: SRC.bowlNFun,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "public",
    },
  },
  {
    id: "project-graduation",
    name: "Project Graduation or Prom",
    family: "youth-group",
    inclusions: [
      "All activities included",
      "In-house catering",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "Neither price nor guest counts are published. This is the largest single youth occasion a venue can sell and Main Event publishes two sentences about it.",
    dayParts: ["after-close"],
    laneFit: ["schools"],
    source: SRC.projectGrad,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "school-lock-in",
    name: "School Lock-In",
    family: "buyout",
    inclusions: [
      "3 or 4 hours, starting 30 minutes after the centre closes",
      "Unlimited activities",
      "Unlimited video game time cards",
      "Private room and AV options",
    ],
    minGuests: 150,
    maxGuests: 800,
    pricePerGuest: null,
    priceNote:
      "Not published. Food is not included. Age 17 and under. Reservation requires a 50% deposit. The group version publishes a 150 guest minimum and 800+ maximum.",
    dayParts: ["after-close"],
    dayPartNote:
      "After close is inventory that costs the venue nothing to sell, because the building was going to be empty anyway.",
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    laneFit: ["schools", "faith-nonprofit", "colleges"],
    source: SRC.schoolLockIn,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "public",
    },
  },

  // -------------------------------------------------------------
  // CORPORATE. Every price gated. This is the job.
  // -------------------------------------------------------------
  {
    id: "corporate-all-access-pass",
    name: "Corporate All Access Pass",
    family: "corporate",
    inclusions: [
      "3 hours unlimited activities",
      "Bowling, billiards, laser tag, gravity ropes, mini golf and rock climbing where available",
      "Bowling shoes",
      "1 lane per 20 guests",
      "Food is not included",
    ],
    minGuests: 20,
    maxGuests: 300,
    pricePerGuest: null,
    priceNote:
      "Not published. Valid Monday before 4pm, Tuesday to Thursday all day, and Friday before 5pm.",
    dayParts: ["weekday-daytime"],
    dayPartNote:
      "Weekdays only, and Friday only before 5pm. Main Event has deliberately excluded this package from its own peak hours.",
    bookingNoticeDays: 5,
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    laneFit: ["corporate", "healthcare", "auto-finance"],
    source: SRC.corpAllAccess,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "public",
    },
  },
  {
    id: "mvp",
    name: "MVP",
    family: "corporate",
    inclusions: [
      "3 hours unlimited activities",
      "3 hour time card for non-redemption games",
      "Bowling pin trophy",
      "Banquet meal and unlimited soft drinks",
      "Semi-private space for 1 hour",
      "1 lane per 20 guests",
    ],
    minGuests: 10,
    maxGuests: 200,
    pricePerGuest: null,
    priceNote:
      "Not published. Chef's Best Banquet is available at additional cost. Valid any day of the week, which makes this the package to lead with when a buyer names a Friday.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    /*
      local-retail-food is here for the food. A restaurant or a boba
      franchise of thirty staff is buying one night a year and the owner
      is buying it out of their own pocket, so a package that includes a
      banquet meal is the one they can hand to a crew and call finished.
      The 10 guest minimum is the part that makes it possible at all.
    */
    laneFit: [
      "corporate",
      "auto-finance",
      "healthcare",
      "hospitality-civic",
      "local-retail-food",
    ],
    source: SRC.mvp,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "public",
    },
  },
  {
    id: "level-up",
    name: "Level Up",
    family: "corporate",
    inclusions: [
      "2 hours all-you-can-play laser tag, gravity ropes, billiards and rock climbing",
      "1 hour game area card",
      "1 lane per 20 guests",
      "Semi-private space",
    ],
    minGuests: 10,
    maxGuests: 150,
    pricePerGuest: null,
    priceNote:
      "Package price is not published. Main Event does publish that banquet options start at $14 per person, which is the only food figure on the entire site.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    /*
      local-retail-food sits in the middle of this lane's range. A shop
      with twenty to fifty on the roster wants the activities and does
      not want to be sold a banquet, and Level Up is the only package
      that is exactly that at a 10 guest minimum. It also runs any day,
      which matters for a business whose only quiet hours move around.
    */
    laneFit: ["corporate", "healthcare", "auto-finance", "local-retail-food"],
    source: SRC.levelUp,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "public",
    },
  },
  {
    id: "fun-101",
    name: "Fun 101",
    family: "corporate",
    inclusions: [
      "1 hour bowling with shoes",
      "Choice of laser tag, gravity ropes or glow golf",
      "30 minute video game card",
    ],
    minGuests: 10,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "Not published, and must be combined with a minimum food spend starting at $14 per person.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    /*
      local-retail-food belongs here more than anywhere else on this
      page. It is the smallest published ask Main Event has for a group
      that is not a school: ten guests, one hour of bowling, one
      activity, and a food spend the buyer controls. A boba counter with
      eight on the roster can reach ten by bringing partners, and the
      owner can work out what it costs standing at the till, which is
      the only kind of arithmetic this lane ever does.
    */
    laneFit: [
      "healthcare",
      "corporate",
      "auto-finance",
      "faith-nonprofit",
      "local-retail-food",
    ],
    source: SRC.fun101,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "withheld",
    },
  },
  {
    id: "all-day-meeting",
    name: "All Day Meeting",
    family: "corporate",
    inclusions: [
      "All-day private meeting room with projection, tables and chairs",
      "One activity of choice",
      "2 hour unlimited time card",
      "Breakfast, lunch and snacks",
      "Unlimited soft drinks, tea and water",
    ],
    minGuests: 20,
    maxGuests: null,
    pricePerGuest: null,
    priceNote: "Not published. Monday to Friday, 8am to 5pm only.",
    dayParts: ["weekday-daytime"],
    dayPartNote:
      "8am to 5pm on a weekday is the emptiest the building will ever be. This package turns that into revenue, and Brea publishes dedicated meeting room space specifically for it.",
    bookingNoticeDays: 5,
    depositPercent: 50,
    laneFit: ["corporate", "healthcare", "hospitality-civic"],
    source: SRC.allDay,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "withheld",
    },
  },
  {
    id: "happy-hour",
    name: "Happy Hour",
    family: "corporate",
    inclusions: [
      "Game Changer banquet meal",
      "2 beer or wine tickets per person",
      "Semi-private space with billiards reserved for 3 hours",
    ],
    minGuests: 10,
    maxGuests: 50,
    pricePerGuest: null,
    priceNote: "Not published. Monday to Friday, 4pm to 7pm.",
    dayParts: ["weekday-evening"],
    bookingNoticeDays: 5,
    depositPercent: 50,
    /*
      local-retail-food, and this is the one package on the file whose
      published maximum is a better fit for the lane than its minimum.
      Fifty guests is the whole of a small franchise and its partners,
      and Monday to Friday between four and seven is the window a shop
      can actually take: the crew that closes on a Saturday can be let
      go early on a Tuesday, and nobody has to shut the doors to do it.
    */
    laneFit: [
      "corporate",
      "auto-finance",
      "hospitality-civic",
      "local-retail-food",
    ],
    source: SRC.happyHour,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "public",
    },
  },
  {
    id: "corporate-buyout",
    name: "Corporate Full Facility Buyout",
    family: "buyout",
    inclusions: [
      "Full private access to the building",
      "Unlimited activities and unlimited video games, excluding redemption points and crane games",
      "Private rooms with AV and seating upgrades",
      "Prep, planning and cleanup",
      "Optional banquet packages and group logo and video display",
    ],
    minGuests: 200,
    maxGuests: 800,
    pricePerGuest: null,
    priceNote:
      "Not published. Main Event says pricing varies by date and time, to call the local Sales Manager, and that revenue minimums may apply. There is no local Sales Manager at Brea yet, which is the whole reason this prototype exists.",
    dayParts: ["any"],
    laneFit: ["corporate", "colleges", "schools"],
    source: SRC.corpBuyout,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
      maxGuests: "public",
    },
  },

  // -------------------------------------------------------------
  // TEAM BUILDING. The only fully priced programme set, and the
  // published prices have a rendering fault worth naming.
  // -------------------------------------------------------------
  {
    id: "relay-rush",
    name: "Relay Rush",
    family: "corporate",
    inclusions: [
      "Video game relays built around communication and problem solving",
      "3 to 4 players per team",
    ],
    minGuests: 12,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "mainevent.com prints this as \"$1995 / Person\", which read literally is $1,995 a head. It is almost certainly a decimal stripped from $19.95, but this prototype will not quote a price it cannot read cleanly. Price does not include sales tax or the published 20% FUN-cilitator host fee.",
    dayParts: ["any"],
    laneFit: ["corporate", "auto-finance", "healthcare"],
    source: SRC.teamBuilding,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
    },
  },
  {
    id: "collab-for-a-cause",
    name: "Collab For A Cause",
    family: "corporate",
    inclusions: [
      "Brain teasers, trivia and arcade games",
      "Culminates in building care packages for local organisations",
      "10 to 15 players per team",
    ],
    minGuests: 12,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "Printed as \"$4295 / Person\" with the same decimal fault as Relay Rush. Excludes sales tax and the 20% FUN-cilitator host fee.",
    dayParts: ["any"],
    dayPartNote:
      "The only Main Event package that ends with a company doing something for the community it sits in. That makes it the one team building programme a local employer will repeat annually, and the one worth leading with in Brea.",
    laneFit: ["corporate", "auto-finance", "faith-nonprofit", "healthcare"],
    source: SRC.teamBuilding,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "public",
    },
  },
];

export const PACKAGE_BY_ID: Record<string, EventPackage> = Object.fromEntries(
  PACKAGES.map((p) => [p.id, p]),
);

/** Packages Main Event publishes a price for. */
export const PRICED_PACKAGES = PACKAGES.filter((p) => p.pricePerGuest !== null);

/** Packages gated behind a sales manager. The reason the role exists. */
export const GATED_PACKAGES = PACKAGES.filter((p) => p.pricePerGuest === null);
