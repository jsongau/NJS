import type { EventPackage } from "@/domain/types";

/*
  The family reading order is re-exported from the vocabulary rather than
  declared here. It used to be declared in both places, which is two
  files with an opinion about the order of five values, and the cost of
  that shows up the first time one of them changes.
*/
export { PACKAGE_FAMILY_ORDER } from "@/domain/vocabulary";

/**
 * THE OFFER SHELF. WHAT THIS MARKET IS ACTUALLY SELLING, AS THE BRANDS
 * THEMSELVES PUBLISH IT.
 *
 * EVERY FIGURE IN THIS FILE WAS READ OFF A BRAND'S OWN PAGE ON 18 AUGUST
 * 2026 AND CARRIES THE URL IT WAS READ FROM. Nothing here is a guess, and
 * where a brand withholds a figure the field is null and its provenance
 * is "withheld" rather than an estimate wearing a number's clothes.
 *
 * Eighteen brands are represented: the five West Division brands this
 * console is built around, and the thirteen rivals profiled across Los
 * Angeles, Orange, Riverside, San Bernardino and San Diego counties.
 *
 * ── THE PATTERN IN THE NULLS IS THE FINDING ───────────────────────
 *
 * Look at what carries a number. A 47 dollar tune-up. A 47 dollar drain
 * clearing. A 57, a 77, a 99. A 50 off, a 500 off, a 3,500 off. Every
 * one of those is a single job, bought once, by a household that found
 * it on a phone while something in the house was broken.
 *
 * Now look at what does not. NEXGEN's X Protection Plan. Mike Diamond's
 * three protection plans. Service Hero's HERO CLUB and HERO CLUB Plus.
 * Mr. Rooter's Advantage Plan. One Hour's and Benjamin Franklin's Club
 * Membership. Sheldon's maintenance agreement. Service Champions' own
 * CHAMP-Rewards. Every one of them names the programme, itemises the
 * benefits and routes the price to a phone number.
 *
 * NOT ONE OF THE THIRTEEN RIVAL BRANDS PROFILED PUBLISHES A MEMBERSHIP
 * PRICE. Two brands in the whole set do, and both are ours: ASI Rewards
 * at 19.95 a month and Timo's Advantage Plan at 15 a month or 189 a
 * year. A homeowner can compare six drain prices in ninety seconds and
 * cannot compare a single maintenance plan.
 *
 * That is the recommendation this shelf exists to make, and it is the
 * only one on it the evidence actually supports: a transparently priced
 * monthly membership as the headline offer. It cannot be beaten by
 * printing a smaller coupon, and it turns a one-job click into recurring
 * revenue.
 *
 * ── WHAT THIS SHELF GETS WRONG, SAID OUT LOUD ─────────────────────
 *
 * Several brands render their coupon grids client side, so a fetcher
 * reads the page and gets nothing. Service Champions' /all-offers/ and
 * /coupons/ pages are in that state, which means there may be live
 * Champions offers this shelf does not know about. Rows here are what
 * was retrievable, not a guarantee of what is running.
 *
 * The row ids are inherited from the console this was forked from and
 * are deliberately not renamed while other files are still in flight. An
 * id is a join key; the label beside it is what a reader sees.
 */

const SRC = {
  corporate: "https://servicechampions.com/summer-savings/",
  allAccess: "https://servicechampions.com/summer-savings/",
  corpAllAccess: "https://www.nexgenairandplumbing.com/",
  mvp: "https://mikediamondservices.com/specials/",
  levelUp: "https://www.serviceheros.com/",
  fun101: "https://www.mrrooter.com/orange-county/",
  allDay: "https://www.onehourheatandair.com/mission-viejo/",
  happyHour: "https://www.sheldonsservice.com/",
  corpBuyout: "https://www.ars.com/san-diego/coupons",
  teamBuilding: "https://www.benjaminfranklinplumbing.com/south-orange-county/",
  school: "https://www.asiheatingandair.com/community-partnerships/",
  asiRewards: "https://www.asiheatingandair.com/asirewards/",
  timosAdvantage: "https://timos.com/timosadvantageplan/",
  adeedoSystem: "https://www.adeedo.com/summer-savings/",
  projectGrad: "https://servicechampions.com/champ-rewards/",
  freeInspection: "https://www.rooterhero.com/",
  summerCampaign: "https://servicechampions.com/summer-savings/",
  gradPacks: "https://www.asiheatingandair.com/coupons/",
  group: "https://powell-electric.com/coupons/",
  groupBowlNGames: "https://timos.com/at-your-service/coupons/",
  groupLockIn: "https://www.cool-air-tech.com/",
  groupBuyout: "https://www.rotorooter.com/losangeles/",
  holidays: "https://www.asiheatingandair.com/about-us/financing/",
  birthdays: "https://servicechampions.com/make-a-wish/",
} as const;

/**
 * The scheduling terms this console works to.
 *
 * NOT PUBLISHED BY ANY BRAND IN THE SET, and that is the point of the
 * note. None of the five West Division brands publishes a lead time for
 * an install slot or a deposit against one. The only published terms
 * anywhere in the scrape are Timo's membership renewal and cancellation
 * terms. So these two figures are this console's own working
 * assumptions for holding an install day, they are stated as
 * assumptions everywhere they appear, and no screen calls them
 * published.
 */
export const STANDARD_TERMS = {
  bookingNoticeDays: 5,
  depositPercent: 50,
  note: "Five days notice on an install slot and a 50 per cent deposit against it are this console's own working assumptions, not published terms. No brand in the set publishes either. The only published terms found anywhere were Timo's membership renewal and cancellation terms.",
  source: "https://timos.com/timosadvantageplan/termsandconditions/",
} as const;

/**
 * The lowest published recurring price in the whole market.
 *
 * Timo's Advantage Plan at 15 dollars a month, or 189 a year. It is the
 * floor under every membership conversation on this console: the
 * cheapest number a household in these five counties can find published
 * anywhere, and it belongs to one of our own brands.
 *
 * The constant's name is inherited from the fork and is left alone on
 * purpose. Renaming an export while eight other files are mid-edit is
 * how two files stop agreeing about the same number.
 */
export const LOWEST_PUBLISHED_PLAN_PRICE = 15;

export const PACKAGES: EventPackage[] = [
  // -------------------------------------------------------------
  // PRICED AND PUBLISHED. The offer converts off a landing page
  // without anybody picking up a phone.
  // -------------------------------------------------------------
  {
    id: "sc-summer-tuneup-47",
    name: "Service Champions summer campaign, 47 dollars",
    family: "self-serve",
    inclusions: [
      "AC tune-up at 47 dollars",
      "Drain clearing at 47 dollars with a free camera inspection",
      "Sitewide banner: summer is here and so are the savings",
      "Cannot be combined with any other offers, no cash value",
      "Fine print expires 31 August 2026",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 47,
    priceNote:
      "Two weeks of runway left and no successor campaign published anywhere on the site. The tune-up band runs 59 at ARS, 87 at ASI, 88 at Adeedo and 89.95 at Cool Air Tech, so 47 is the floor of the market and it goes dark on 31 August 2026.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    laneFit: ["hvac", "plumbing"],
    source: SRC.summerCampaign,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "sc-drain-47-camera",
    name: "Service Champions drain clearing, 47 with a free camera",
    family: "self-serve",
    inclusions: [
      "Drain clearing at 47 dollars",
      "Camera inspection published as free with the clearing",
      "Member price for the same clearing is 57 dollars",
      "Diagnostic fee for members is 19 dollars",
      "Fine print expires 31 August 2026",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 47,
    priceNote:
      "THE PUBLISHED INCONSISTENCY ON THIS SHELF. CHAMP-Rewards prices member drain clearing at 57 dollars while the public summer promotion clears the same drain for 47. A member reading both pages is paying ten dollars more for being a member. The drain band around it: NEXGEN 57, ASI 57, Rooter Hero 77, Mike Diamond and all three ARS storefronts 99.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    laneFit: ["hvac", "plumbing"],
    source: SRC.allAccess,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "powell-timos-standing",
    name: "Powell and Timo's, one offer each and no expiry",
    family: "self-serve",
    inclusions: [
      "Powell Electric: 49 dollars off an electrical repair",
      "One coupon per job, cannot be combined with other offers",
      "Timo's: 100 dollars off indoor air quality products",
      "Must be presented at time of service, excludes maintenance plans",
      "Neither offer prints an expiry date",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 49,
    priceNote:
      "The two thinnest offer sets in the division. Powell's coupons page says more offers exist and gives a phone number instead of listing them, and carries the line hurry these offers expire soon above an offer with no date on it. Timo's home page carries no dollar figure at all. Nothing here can be flagged stale, because nothing here is dated.",
    dayParts: ["any"],
    laneFit: ["electrical", "partner-property"],
    source: SRC.group,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },

  // -------------------------------------------------------------
  // GIVEN AWAY. What four or more brands hand over for nothing,
  // which is the definition of table stakes.
  // -------------------------------------------------------------
  {
    id: "free-inspection-tier",
    name: "The free inspection tier, given away by four brands",
    family: "fundraiser",
    inclusions: [
      "Free camera or sewer inspection at Rooter Hero, Mr. Rooter, Mike Diamond and ARS",
      "Free water quality test and free water pressure check at NEXGEN and Mike Diamond",
      "Free electrical safety inspection with any paid service at NEXGEN",
      "Free service call with a repair at One Hour and Mike Diamond",
      "Free plumbing check at ASI, published at zero dollars",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 0,
    priceNote:
      "Zero is the published price, and the row is here to argue that it buys nothing. When four unaffiliated brands give the same inspection away, it stops moving a click and becomes the cost of being on the page. Our own free camera inspection sits inside the 47 dollar drain offer, which is the right place for it: attached to a number, not standing in for one.",
    dayParts: ["weekday-daytime", "weekday-evening"],
    dayPartNote:
      "This console schedules the free-inspection message into weekday daytime and evening, where the maintenance call sits. That is our scheduling judgement, not a restriction any brand publishes.",
    laneFit: ["hvac", "partner-property", "electrical"],
    source: SRC.freeInspection,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "community-programmes-unpriced",
    name: "Community programmes, no rate published",
    family: "fundraiser",
    inclusions: [
      "Service Champions with Make-A-Wish Orange County and the Inland Empire, more than 160,000 dollars raised since 2014",
      "Twelve Months of Wishes, a charity calendar with its own navigation slot",
      "ASI as official HVAC and plumbing partner of San Diego State athletics, and a multi-year San Diego Padres partner",
      "ASI donates to the American Lung Association for every air quality system installed, amount not published",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "There is no per-job price because nothing here is bought. The only figure any brand publishes is the cumulative 160,000 dollars raised since 2014. No donation rate, no per-install amount and no sponsorship value is published anywhere, so none is printed here and none should be quoted in a sponsorship conversation.",
    dayParts: ["any"],
    laneFit: ["hvac", "partner-property", "electrical", "plumbing"],
    source: SRC.birthdays,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },

  // -------------------------------------------------------------
  // MEMBERSHIP. Recurring, small ticket, and loyal for as long as
  // the household stays in the property. Two of these publish a
  // price. The third is the reason this shelf exists.
  // -------------------------------------------------------------
  {
    id: "asi-rewards-1995",
    name: "ASI Rewards, 19.95 a month, published",
    family: "youth-group",
    inclusions: [
      "26-point AC precision tune-up once a cooling season",
      "18-point furnace precision tune-up once a heating season",
      "11-point plumbing safety inspection annually on request",
      "Diagnostic fee reduced to 19 dollars, drain clearing at 27 dollars",
      "25 per cent off HVAC repairs, 10 per cent off plumbing repairs",
      "Two-hour service window guarantee and 24-hour repair response",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 19.95,
    priceNote:
      "19.95 a month for the full plan, or 9.95 a month per system for the furnace-only tier. ASI is one of only two brands in the entire eighteen-brand reading, rivals and Champions brands together, that publishes a membership price at all, it gives the plan its own terms page, and it promotes the membership as a fourth offer alongside its coupons. Fees are credited back toward a replacement or a repipe.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    lanesPerTwentyGuests: 1,
    laneFit: ["hvac", "partner-property"],
    source: SRC.asiRewards,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "timos-advantage-15",
    name: "Timo's Advantage Plan, 15 a month or 189 a year",
    family: "youth-group",
    inclusions: [
      "Semi-annual maintenance tier, published at 15 dollars a month",
      "189 dollars a year prepaid, which does not auto-renew",
      "Monthly memberships renew automatically for successive one-month terms",
      "Cancel any time by phone or email",
      "Complimentary one-year enrolment with a new system purchase",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 15,
    priceNote:
      "The lowest published recurring price in the market and the only annual figure anybody prints. Two cautions the terms page states and the plan page does not: benefits taken inside the first six months can be charged back on cancellation, and unused benefits are not refundable. A separate page also refers to Gold and Silver tiers while the plan page publishes one tier at one price, which is a conflict to resolve before this is advertised.",
    dayParts: ["weekday-daytime"],
    dayPartNote:
      "Scheduled into weekday daytime because that is when a maintenance visit can be run without overtime cost. Our judgement, not a published restriction.",
    bookingNoticeDays: 5,
    lanesPerTwentyGuests: 1,
    laneFit: ["hvac", "partner-property", "electrical"],
    source: SRC.timosAdvantage,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "champ-rewards-unpriced",
    name: "CHAMP-Rewards, price not published",
    family: "youth-group",
    inclusions: [
      "24-hour repair response guaranteed, or a 500 dollar credit",
      "Spring AC tune-up and autumn furnace tune-up",
      "Annual plumbing inspection with a water heater tank flush",
      "25 per cent off repairs and a 19 dollar diagnostic fee",
      "Member drain clearing at 57 dollars",
      "Transferable to a new home or to the next owner",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "The richest set of published benefits on this shelf and no price anywhere on the page, which routes every interested household to a phone number. It is also the plan whose 57 dollar member drain clearing is undercut by our own 47 dollar public promotion. Publishing this number, with the tune-ups, the 19 dollar diagnostic and the 24-hour guarantee itemised against it, is the single unoccupied position in this market.",
    dayParts: ["after-close"],
    dayPartNote:
      "Filed against out-of-hours because the plan's headline benefit is a 24-hour response guarantee and 24/7 emergency availability, which is the part of the week the coupon brands charge for.",
    laneFit: ["hvac"],
    source: SRC.projectGrad,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },

  // -------------------------------------------------------------
  // REPLACEMENT. The big ticket, the one that consumes an install
  // day and pays for the month.
  // -------------------------------------------------------------
  {
    id: "adeedo-3500-system",
    name: "Adeedo summer campaign, 3,500 off a system",
    family: "buyout",
    inclusions: [
      "3,500 dollars off a new heating and cooling system",
      "88 dollar AC tune-up as the door opener",
      "57 dollar drain clearing with a free camera inspection",
      "Shared fine print: cannot be combined, no cash value",
      "All three offers expire 31 August 2026",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 3500,
    priceNote:
      "Thirty-five times the largest incentive ASI publishes, on a campaign with thirteen days left when it was read. Two hygiene problems sit behind it: four expired campaign pages are still live and sitemap-indexed with fine print dated 31 March 2025, 15 September 2025 and 31 December 2025, and the fine print on the live offers reads club members only while the brand publishes two different clubs with different discount rates and only one price.",
    dayParts: ["after-close"],
    dayPartNote:
      "Filed against out-of-hours because July and August replacement demand is emergency-led. AC repair runs 266 per cent above baseline at the July apex and the mix swings hardest toward full-system replacement, which arrives at night and at the weekend.",
    depositPercent: 50,
    lanesPerTwentyGuests: 1,
    laneFit: ["hvac", "partner-property", "plumbing"],
    source: SRC.adeedoSystem,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "replacement-band",
    name: "The replacement band, 500 flat against a 2,000 ceiling",
    family: "buyout",
    inclusions: [
      "One Hour Mission Viejo: 500 dollars off a full AC system replacement",
      "Service Hero: 500 dollars off replacement and installation",
      "NEXGEN: save up to 1,500 off a full system, promo code AC1500",
      "ARS: save up to 2,000 on a new HVAC system through a trade-in allowance",
      "Cool Air Technologies: 400 dollars off new equipment",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: 500,
    priceNote:
      "The figure printed is the flat, credible end of the band. Note the asymmetry rather than the size: the franchises name a flat number a buyer can rely on, the independents and the national network name an up-to ceiling most buyers will not reach. Against both, Adeedo's flat 3,500 is the largest genuine number in the market, and it expires in two weeks.",
    dayParts: ["any"],
    laneFit: ["multi-service", "plumbing", "hvac"],
    source: SRC.corpBuyout,
    provenance: {
      pricePerGuest: "public",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },

  // -------------------------------------------------------------
  // GATED. Named, itemised, and priced nowhere. Every row below is
  // a competitor's own page refusing to answer the one question a
  // homeowner asks. This is the opening.
  // -------------------------------------------------------------
  {
    id: "rival-nexgen-protection",
    name: "NEXGEN X Protection Plan, price withheld",
    family: "corporate",
    inclusions: [
      "Plan named on the homepage as X Protection Plan and X Protects",
      "No monthly or annual figure published anywhere on the site",
      "Six coupon offers around it, all with promo codes",
      "Lifetime protections on NEXGEN-branded equipment, plus a price match",
      "Financing referenced, lender not named",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "The most aggressive coupon architecture in the market, promo codes and all, wrapped around a membership with no number on it. NEXGEN has already broken the drain floor at 57 dollars, which means the next move down is unprofitable for them and for anybody following them there.",
    dayParts: ["weekday-daytime"],
    dayPartNote:
      "Their coupon codes point at daytime scheduling on a self-serve booking flow, which is where the cheap first job is won. The membership question never appears in that flow.",
    bookingNoticeDays: 5,
    lanesPerTwentyGuests: 1,
    laneFit: ["multi-service", "partner-community", "drain-sewer"],
    source: SRC.corpAllAccess,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "rival-mike-diamond-plans",
    name: "Mike Diamond protection plans, three of them, price withheld",
    family: "corporate",
    inclusions: [
      "Heating Protection Plan",
      "Air Conditioning Protection Plan",
      "Plumbing Protection Plan",
      "99 dollar drain cleaning and a 49 dollar water audit alongside them",
      "Synchrony named as the financing partner, no APR and no term published",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "Three separate plans, three names, no prices. The brand leads on identity rather than price, fifty years and the smell-good line, and it is one of only three brands in the set that names a lender at all. Naming the lender and then publishing no term is the same withholding as naming a plan and publishing no price.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    lanesPerTwentyGuests: 1,
    /*
      drain-sewer is here because the drain job is how this brand buys a
      household, at 99 dollars, and the protection plan is what it never
      says out loud afterwards. A row in that lane is a household that
      has already priced a drain and could price a plan in the same
      minute if anybody let them.
    */
    laneFit: [
      "multi-service",
      "drain-sewer",
      "partner-community",
      "partner-employer",
      "water-heater",
    ],
    source: SRC.mvp,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "rival-hero-club",
    name: "HERO CLUB and HERO CLUB Plus, benefits published, price withheld",
    family: "corporate",
    inclusions: [
      "Priority scheduling",
      "No dispatch fees",
      "10 per cent off repairs",
      "Warranty coverage on maintained equipment",
      "Two tiers named, neither priced",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "The closest any rival comes to answering the question. Service Hero itemises the benefits of both tiers and stops one line short of the number, which tells you the copy exists and the price is a policy decision rather than an oversight. The same brand publishes 4.9 stars on 2,562 reviews and a 60-minute emergency response, the most aggressive speed claim in the market, with no penalty attached to missing it.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    lanesPerTwentyGuests: 1,
    /*
      This is the row to read before writing anything about our own plan.
      Service Hero has done the itemising work already and left the price
      blank; a page that copies the itemising and fills in the blank is
      the whole recommendation in one screen.
    */
    laneFit: ["multi-service", "partner-community", "drain-sewer", "water-heater"],
    source: SRC.levelUp,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "rival-mr-rooter-advantage",
    name: "Mr. Rooter Advantage Plan, price withheld",
    family: "corporate",
    inclusions: [
      "Advantage Plan named on the location page, no figure",
      "25 dollars off any plumbing service",
      "10 per cent off for seniors, teachers, first responders and military, capped at 1,000 dollars",
      "Free camera inspection with service",
      "Upfront flat-rate pricing with no overtime charge for nights or weekends",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "The best offer hygiene in the set and still no plan price. Every coupon on the page carries an expiry of 30 September 2026, which means somebody maintains it, and 708 local reviews at 4.9 which reads as a real count rather than a national aggregate. The discipline is there. The number is not.",
    dayParts: ["any"],
    bookingNoticeDays: 5,
    lanesPerTwentyGuests: 1,
    /*
      partner-property leads this row's lanes because a flat rate with no
      overtime charge is worth more to somebody holding forty doors than
      to a household with one, and it is the only claim on the page a
      portfolio buyer would actually pay for.
    */
    laneFit: [
      "partner-community",
      "multi-service",
      "drain-sewer",
      "partner-property",
      "water-heater",
    ],
    source: SRC.fun101,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "rival-authority-club",
    name: "Club Membership at One Hour and Benjamin Franklin, price withheld",
    family: "corporate",
    inclusions: [
      "Club Membership named at both Authority Brands franchises, neither priced",
      "Always on time or you don't pay a dime, at One Hour",
      "Five dollars for every minute late, capped at 300 dollars, at Benjamin Franklin",
      "500 dollars off a full AC replacement and 50 dollars off an HVAC repair at One Hour",
      "No dollar coupon published at all at Benjamin Franklin",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "The only guarantees in this market with a named dollar mechanic attached to a named failure. Everybody else's guarantee is adjectival. What neither franchise does is attach that mechanic to a published price, and Benjamin Franklin publishes no price offer at all to pair it with, which leaves a numeric guarantee beside a published number as unoccupied ground in all five counties.",
    dayParts: ["weekday-daytime"],
    dayPartNote:
      "A punctuality mechanic only means anything in the weekday window a household takes time off for. It is worth nothing at two in the morning, when nobody is measuring the arrival against a promise.",
    bookingNoticeDays: 5,
    laneFit: ["multi-service", "partner-community", "partner-employer"],
    source: SRC.allDay,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "rival-sheldons-magnolia",
    name: "Sheldon's and Magnolia, a plan given away and never priced",
    family: "corporate",
    inclusions: [
      "Sheldon's: a free two-year maintenance plan with an AC installation",
      "Maintenance agreements referenced, no price published",
      "True same-day service, 24/7, trucks stocked for on-the-spot repair",
      "Magnolia: no price on the homepage at all, free estimates behind a click",
      "Magnolia books through a self-serve calendar, which almost nobody else does",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "Sheldon's gives two years of maintenance away with an install and never says what the third year costs, which is the same withholding running the other way round: the plan is used as a closing sweetener rather than sold as a product. Both Riverside brands lead on local proof, a Carrier President's Award and five Readers' Choice wins, rather than on any number.",
    dayParts: ["weekday-evening"],
    dayPartNote:
      "Inland valleys hold cooling demand into September, and the evening call is where the Riverside brands compete hardest on same-day availability.",
    bookingNoticeDays: 5,
    /*
      water-heater sits in this row's lanes because the free-plan-with-an-
      install mechanic transfers straight onto a water heater replacement,
      where the ticket is smaller, the decision is faster and a two-year
      maintenance sweetener costs the brand almost nothing.
    */
    laneFit: [
      "multi-service",
      "drain-sewer",
      "partner-employer",
      "water-heater",
    ],
    source: SRC.happyHour,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },

  // -------------------------------------------------------------
  // THE TWO ROWS THAT ARE NOT OFFERS AT ALL. Financing terms, and
  // the brands that lead with a credential instead of a number.
  // Both belong on a shelf because both decide whether a published
  // price converts.
  // -------------------------------------------------------------
  {
    id: "market-financing",
    name: "Financing across the market, terms withheld",
    family: "corporate",
    inclusions: [
      "Service Finance Company named at ASI, Adeedo and Timo's",
      "Wells Fargo named at Powell and at Cool Air Technologies",
      "Synchrony named at Mike Diamond and Roto-Rooter",
      "Service Champions names no lender at all",
      "ASI is the only brand in the set publishing a term: 0 per cent for six months",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "Nobody in this market publishes an APR. Eight of the thirteen rivals say financing available and name nobody. On a 3,500 dollar replacement offer, a published monthly payment beats an unpublished up-to, and it costs nothing to publish one we already have a lender for.",
    dayParts: ["any"],
    laneFit: ["multi-service", "drain-sewer", "partner-community"],
    source: SRC.holidays,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
  {
    id: "market-credential-brands",
    name: "The credential brands, no coupon at all",
    family: "corporate",
    inclusions: [
      "Benjamin Franklin leads on Forbes' top ranked plumbing company of 2024",
      "Ideal San Diego leads on 88 per cent of business coming from referrals",
      "Cool Air Technologies leads on a ten-year install labour warranty and no commissioned salespeople",
      "Magnolia leads on five Press-Enterprise Readers' Choice wins",
      "Rooter Hero and Roto-Rooter lead on never charging after-hours or weekend rates",
    ],
    minGuests: null,
    maxGuests: null,
    pricePerGuest: null,
    priceNote:
      "No published dollar figure between them on the pages that carry these claims. It is a real strategy and it is the one our own brands are closest to: 25 years, Diamond Certified for 19 consecutive years, 4.8 stars on 7,295 reviews at ASI. The risk is that a credential cannot be compared in ninety seconds on a phone, and a price can.",
    dayParts: ["any"],
    dayPartNote:
      "The only row on this shelf that gets stronger the longer a household spends reading, which is exactly the opposite of how a two in the afternoon emergency search behaves.",
    laneFit: ["multi-service", "drain-sewer", "partner-property", "partner-community"],
    source: SRC.teamBuilding,
    provenance: {
      pricePerGuest: "withheld",
      inclusions: "public",
      minGuests: "withheld",
      maxGuests: "withheld",
    },
  },
];

export const PACKAGE_BY_ID: Record<string, EventPackage> = Object.fromEntries(
  PACKAGES.map((p) => [p.id, p]),
);

/** Offers a brand publishes a price for. */
export const PRICED_PACKAGES = PACKAGES.filter((p) => p.pricePerGuest !== null);

/** Offers gated behind a phone call. The reason this console exists. */
export const GATED_PACKAGES = PACKAGES.filter((p) => p.pricePerGuest === null);
