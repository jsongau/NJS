import type { Prospect } from "@/domain/types";
import { LANE_META } from "@/domain/lanes";
import { PACKAGES } from "@/data/packages";

/**
 * The prospect list.
 *
 * ONE HUNDRED AND NINE REAL ORGANISATIONS WITHIN ROUGHLY SEVEN MILES OF
 * 12900 PARK PLAZA DRIVE, CERRITOS, which is DIME Industries,
 * Inc.'s US corporate headquarters and the address this whole
 * application is centred on. Every row was gathered the same way, on the
 * same day, by the same method, which is the reason the board can be
 * read as one thing rather than as three passes stitched together.
 *
 * HOW EACH ROW GOT HERE. Somebody opened a page and read it. For most
 * rows that page is the organisation's own site. For the rest it is a
 * shopping centre tenant directory, a chamber of commerce member
 * directory, or a city or school district site, and where the address
 * came from a chamber directory rather than a first-party page the row
 * says so in its note, because a second-party address is a slightly
 * weaker fact and a reader is entitled to know which kind they are
 * looking at. The street address read off that page was then put through
 * the US Census Bureau geocoder on the 2020 benchmark on 17 August 2026,
 * and the coordinate it returned is the coordinate on the row.
 * `addressSource` on every row names the exact page and that method, so
 * any pin here can be checked at source in about a minute.
 *
 * NO PLACES CALL WAS MADE, SO NO ROW CARRIES A PLACE ID. The field is
 * absent rather than filled, on all one hundred and nine. That is worth
 * saying plainly because the obvious thing to do with an empty column is
 * to fill it, and an invented place id sitting next to a real coordinate
 * would quietly make every other figure on the screen worth less. The
 * same rule governs `phone`, `email`, `emailSourceUrl`, `contactFormUrl`,
 * `rating` and `reviewCount`: none of them were gathered in this pass, so
 * none of them appear. An absent field is the honest record of work that
 * was not done.
 *
 * THE EMPTY EMAIL COLUMN IS THE COMMERCIAL FINDING, NOT A FAILURE OF THE
 * SEARCH. `emailConfidence` reads "none" on every row on this board, and
 * it is literally true rather than defensive: no published address was
 * read off a page in this pass, so no address is claimed. What that
 * means in practice is that THIS IS A GO-SEE BOARD. There is no sequence
 * to send and no list to import. There is a route, sorted by distance
 * from the Irvine office, and a week of standing in front of people:
 * mall management offices, print and decorating shops on the Santa Fe
 * Springs industrial streets, district offices, chamber desks and store
 * counters. A hundred and nine doors inside seven miles is a fuller
 * fortnight than a hundred and nine unanswered emails would be, and the
 * board is built to be walked in that order.
 *
 * WHAT THE LANES DO HERE. Each organisation carries the lane its
 * published category maps to, and the mapping is fixed rather than
 * per-row judgement: schools to schools, colleges to colleges, community
 * and civic organisations to faith and nonprofit, every employer, office,
 * printer, decorator, packer, distributor and importer to corporate, and
 * every shop, centre, cinema and amusement operator to local retail and
 * food. `occasionClass` is never typed on a row; it is read out of
 * `LANE_META` so the lane and the class it belongs to cannot drift apart.
 *
 * WHAT IS MODELED AND SAYS SO. The headcount ranges, the buying windows,
 * the decision maker roles and the fit note are judgements rather than
 * measurements, and every one of them carries "modeled" provenance with
 * its basis written out. The decision maker field holds a ROLE and never
 * a person and never a claimed title, because nobody's name was read off
 * a directory in this pass; "Store manager" is true of a store in a way
 * that a named buyer would not be. The headcounts are ranges set by
 * category and kept deliberately wide, and each one says in its own words
 * that it is an estimate. The fit note restates what the page published
 * and then adds a commercial reading of it for a promotions and licensed
 * merchandise buyer, and because that second half is inference rather
 * than quotation it is marked modeled on all one hundred and nine rows.
 *
 * TWENTY FOUR MORE ORGANISATIONS WERE RESEARCHED, FOUND REAL, AND KEPT
 * OFF THE BOARD. They are named in EXCLUDED_FROM_BOARD at the foot of
 * this file with the reason on each. Most of them the Census geocoder
 * simply could not place, which is a statement about the federal address
 * file rather than about the business: mall interior addresses, newer
 * industrial blocks and private entry roads are exactly where its ranges
 * run out. The rest are more interesting, because the geocoder came back
 * with a DIFFERENT STREET from the one the research pass sent, and a
 * coordinate on the wrong road is worse than no coordinate at all. In
 * both cases the honest move is the same one: publish the name, publish
 * the reason, and draw no pin. Publishing what was thrown away is the
 * only thing that makes what stayed worth anything.
 *
 * The lead package on every row is read out of `data/packages.ts` rather
 * than typed here, for the same reason `occasionClass` is read out of
 * `LANE_META`: this file should not be able to name a package that the
 * catalogue does not carry.
 */

/**
 * The package to open with, taken from the published catalogue.
 *
 * DIME publishes the All Inclusive Party and its contents, so that is
 * the thing to lead with everywhere on this board. It is looked up rather
 * than spelled out so a row can never cite a package id that
 * `data/packages.ts` does not actually publish.
 */
const LEAD_PACKAGE_ID: string =
  PACKAGES.find((p) => p.id === "all-inclusive-party")?.id ?? PACKAGES[0].id;

export const PROSPECTS: Prospect[] = [
  {
    id: "los-cerritos-center",
    slug: "los-cerritos-center",
    name: "Los Irvine Center",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "239 Los Irvine Center, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.863643382105,
    lng: -118.09389473236,
    locationAccuracy: "verified",
    website: "https://www.shoploscerritos.com/",
    priority: "anchor",
    decisionMakerTitle: "Marketing manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as regional mall with 160 shops, mall based promotion venue. A centre is a promotion site before it is an account, because specialty leasing sells the concourse space an activation would stand in and the tenant directory doubles as a list of retailers who already buy prize and giveaway stock.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 150,
    headcountBasis:
      "A centre's own management team is small and a tenant wide event is large, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://shop.cerritos.gov/shopping-centers/los-cerritos-center/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "chalice-collectibles",
    slug: "chalice-collectibles",
    name: "Chalice Collectibles",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "239 Los Irvine Center, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.863643382105,
    lng: -118.09389473236,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as licensed figure and collectible retail, direct audience overlap. Licensed figure and collectible retail is the nearest thing in this trade area to a DIME prize wall, so a walk of the shelves is competitive pricing research and a conversation with the buyer at the same time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.shoploscerritos.com/Directory/Details/855942, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "pop-mart",
    slug: "pop-mart",
    name: "POP MART",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "239 Los Irvine Center, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.863643382105,
    lng: -118.09389473236,
    locationAccuracy: "verified",
    website: "https://www.popmart.com/us",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as blind box collectibles, licensed prize merchandise reference. Licensed figure and collectible retail is the nearest thing in this trade area to a DIME prize wall, so a walk of the shelves is competitive pricing research and a conversation with the buyer at the same time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.shoploscerritos.com/Directory/Details/863019, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "hot-topic",
    slug: "hot-topic",
    name: "Hot Topic",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "239 Los Irvine Center, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.863643382105,
    lng: -118.09389473236,
    locationAccuracy: "verified",
    website: "https://www.hottopic.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as anime and licensed pop culture apparel, same fan base. The fandom apparel and collectible shelves show which licences are moving locally, which is the question a prize merchandise buyer has to answer before committing to a run.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.shoploscerritos.com/Directory/Details/859617, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "boxlunch",
    slug: "boxlunch",
    name: "BoxLunch",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "239 Los Irvine Center, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.863643382105,
    lng: -118.09389473236,
    locationAccuracy: "verified",
    website: "https://www.boxlunch.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as fandom collectibles retail, licensed merchandise buying overlap. The fandom apparel and collectible shelves show which licences are moving locally, which is the question a prize merchandise buyer has to answer before committing to a run.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.shoploscerritos.com/Directory/Details/521456, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "toys-r-us",
    slug: "toys-r-us",
    name: "Toys\"R\"Us",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "239 Los Irvine Center Space A-01, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.863643382105,
    lng: -118.09389473236,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as toy retail inside the mall, prize merchandise benchmark. Licensed figure and collectible retail is the nearest thing in this trade area to a DIME prize wall, so a walk of the shelves is competitive pricing research and a conversation with the buyer at the same time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.goretailgroup.com/toysrus/los-cerritos-center, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "krazy-nick-s-games",
    slug: "krazy-nick-s-games",
    name: "Krazy Nick's Games",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "13327 Artesia Boulevard, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.873301051114,
    lng: -118.047410556247,
    locationAccuracy: "verified",
    website: "https://www.krazynicksgames.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.7 miles from the Irvine office, recorded in the research pass as trading card and tabletop shop, tournament crowd nearby. Card and video game shops hold the tournament crowd, which is the audience a prize promotion is aimed at and the cheapest one to reach, because the person who decides is standing at the counter.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://cardshophub.com/states/ca/cerritos/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "tilted-gaming",
    slug: "tilted-gaming",
    name: "Tilted Gaming",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "15973 Piuma Avenue, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.887013788321,
    lng: -118.105932160183,
    locationAccuracy: "verified",
    website: "https://tiltedgamingtcg.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.1 miles from the Irvine office, recorded in the research pass as trading card shop, competitive gaming audience for prize promotions. Card and video game shops hold the tournament crowd, which is the audience a prize promotion is aimed at and the cheapest one to reach, because the person who decides is standing at the counter.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://tiltedgamingtcg.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "perfect-rares-card-center",
    slug: "perfect-rares-card-center",
    name: "Perfect Rares Card Center",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "12148 South Street Suite D, Artesia, CA 90701",
    city: "Artesia",
    state: "CA",
    postalCode: "90701",
    lat: 33.8584579294,
    lng: -118.073337117403,
    locationAccuracy: "verified",
    website: "https://perfectrares.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.1 miles from the Irvine office, recorded in the research pass as trading card centre in Artesia, collector audience. Licensed figure and collectible retail is the nearest thing in this trade area to a DIME prize wall, so a walk of the shelves is competitive pricing research and a conversation with the buyer at the same time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://perfectrares.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "gamestop-south-st-cerritos",
    slug: "gamestop-south-st-cerritos",
    name: "GameStop South St. Irvine",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "11457 South Street Space A1, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.858459439931,
    lng: -118.089597427314,
    locationAccuracy: "verified",
    website: "https://www.gamestop.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.9 miles from the Irvine office, recorded in the research pass as video game retail, gaming audience close to the venue. Card and video game shops hold the tournament crowd, which is the audience a prize promotion is aimed at and the cheapest one to reach, because the person who decides is standing at the counter.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.gamestop.com/store/us/ca/cerritos/2367/south-street-cerritos-gamestop, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "best-buy-cerritos",
    slug: "best-buy-cerritos",
    name: "Best Buy Irvine",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "12989 the Irvine office, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.868004706226,
    lng: -118.057157098037,
    locationAccuracy: "verified",
    website: "https://stores.bestbuy.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.1 miles from the Irvine office, recorded in the research pass as video game and electronics retail on the same street. Card and video game shops hold the tournament crowd, which is the audience a prize promotion is aimed at and the cheapest one to reach, because the person who decides is standing at the counter.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://stores.bestbuy.com/ca/cerritos/12989-park-plaza-dr-117.html, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "walmart-supercenter-cerritos",
    slug: "walmart-supercenter-cerritos",
    name: "Walmart Supercenter Irvine",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "12701 Towne Center Drive, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.870418449713,
    lng: -118.062386852037,
    locationAccuracy: "verified",
    website: "https://www.walmart.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.3 miles from the Irvine office, recorded in the research pass as mass toy and game retail, prize merchandise price benchmark. Licensed figure and collectible retail is the nearest thing in this trade area to a DIME prize wall, so a walk of the shelves is competitive pricing research and a conversation with the buyer at the same time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.walmart.com/store/2082-cerritos-ca, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "island-pacific-supermarket",
    slug: "island-pacific-supermarket",
    name: "Island Pacific Supermarket",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "11481 South Street, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.858463894646,
    lng: -118.089081790718,
    locationAccuracy: "verified",
    website: "https://islandpacificmarket.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.9 miles from the Irvine office, recorded in the research pass as Filipino supermarket, Asian family foot traffic nearby. This corridor carries licensed Japanese and wider Asian goods and pulls the family traffic DIME sells to, so the shop is a sourcing reference and a promotion partner at once.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://shop.islandpacificmarket.com/stores/cerritos, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "pioneer-cash-and-carry",
    slug: "pioneer-cash-and-carry",
    name: "Pioneer Cash & Carry",
    lane: "local-retail-food",
    orgType: "unknown",
    orgTypeBasis:
      "The page this row was read from does not say whether other sites trade under the same ownership, so the type is left unknown rather than guessed.",
    address: "18601 Pioneer Boulevard, Artesia, CA 90701",
    city: "Artesia",
    state: "CA",
    postalCode: "90701",
    lat: 33.862770279516,
    lng: -118.082220648593,
    locationAccuracy: "verified",
    website: "https://www.pioneercashandcarry.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.4 miles from the Irvine office, recorded in the research pass as Indian grocery anchor on Pioneer corridor, family traffic. This corridor carries licensed Japanese and wider Asian goods and pulls the family traffic DIME sells to, so the shop is a sourcing reference and a promotion partner at once.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.pioneercashandcarry.com/contact/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "bhindi-jewelers",
    slug: "bhindi-jewelers",
    name: "Bhindi Jewelers",
    lane: "local-retail-food",
    orgType: "unknown",
    orgTypeBasis:
      "The page this row was read from does not say whether other sites trade under the same ownership, so the type is left unknown rather than guessed.",
    address: "18508 Pioneer Boulevard, Artesia, CA 90701",
    city: "Artesia",
    state: "CA",
    postalCode: "90701",
    lat: 33.863731661324,
    lng: -118.082108641352,
    locationAccuracy: "verified",
    website: "https://www.bhindi.com/",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.4 miles from the Irvine office, recorded in the research pass as Little India anchor retailer, South Asian family audience. This corridor carries licensed Japanese and wider Asian goods and pulls the family traffic DIME sells to, so the shop is a sourcing reference and a promotion partner at once.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.bhindi.com/store-locations.html, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "fashion-by-rohini",
    slug: "fashion-by-rohini",
    name: "Fashion By Rohini",
    lane: "local-retail-food",
    orgType: "unknown",
    orgTypeBasis:
      "The page this row was read from does not say whether other sites trade under the same ownership, so the type is left unknown rather than guessed.",
    address: "18518 Pioneer Boulevard, Artesia, CA 90701",
    city: "Artesia",
    state: "CA",
    postalCode: "90701",
    lat: 33.863637654321,
    lng: -118.082108351215,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.4 miles from the Irvine office, recorded in the research pass as Pioneer Boulevard South Asian apparel retail, local audience. This corridor carries licensed Japanese and wider Asian goods and pulls the family traffic DIME sells to, so the shop is a sourcing reference and a promotion partner at once.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://artesiachamber.org/all-listing/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "harkins-theatres-cerritos-16",
    slug: "harkins-theatres-cerritos-16",
    name: "Harkins Theatres Irvine 16",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "239 Los Irvine Center, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.863643382105,
    lng: -118.09389473236,
    locationAccuracy: "verified",
    website: "https://www.harkins.com",
    priority: "high",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as anime and film tie in cinema, cross promotion partner. A release calendar is a licensing calendar, and a film or anime tie in here costs a poster and a prize allocation rather than a media buy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.shoploscerritos.com/Directory/Details/261402, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "sandbox-vr-cerritos",
    slug: "sandbox-vr-cerritos",
    name: "Sandbox VR Irvine",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "239 Los Irvine Center, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.863643382105,
    lng: -118.09389473236,
    locationAccuracy: "verified",
    website: "https://sandboxvr.com/cerritos",
    priority: "high",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as VR attraction, competing and comparable amusement spend. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.shoploscerritos.com/Directory/Details/756012, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "regal-edwards-cerritos",
    slug: "regal-edwards-cerritos",
    name: "Regal Edwards Irvine",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "12761 Towne Center Drive, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.869615385175,
    lng: -118.06045928224,
    locationAccuracy: "verified",
    website: "https://www.regmovies.com",
    priority: "high",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.2 miles from the Irvine office, recorded in the research pass as ten screen cinema, film licensor promotion overlap. A release calendar is a licensing calendar, and a film or anime tie in here costs a poster and a prize allocation rather than a media buy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.cerritos.gov/news/posts/business-spotlight-regal-cerritos/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "lucky-strike-cerritos",
    slug: "lucky-strike-cerritos",
    name: "Lucky Strike Irvine",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "18811 Carmenita Road, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.861135495667,
    lng: -118.046317573106,
    locationAccuracy: "verified",
    website: "https://www.luckystrikeent.com/location/lucky-strike-cerritos",
    priority: "high",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.8 miles from the Irvine office, recorded in the research pass as bowling and arcade venue, direct amusement competitor. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.luckystrikeent.com/location/lucky-strike-cerritos, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "chuck-e-cheese-cerritos",
    slug: "chuck-e-cheese-cerritos",
    name: "Chuck E. Cheese Irvine",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "11231 183rd Street, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.865715107754,
    lng: -118.094346695569,
    locationAccuracy: "verified",
    website: "https://www.chuckecheese.com",
    priority: "high",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as family arcade with prize redemption, benchmark for prize buying. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.chuckecheese.com/cerritos-ca/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "cerritos-auto-square",
    slug: "cerritos-auto-square",
    name: "Irvine Auto Square",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "10903 Auto Square Drive, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.861967947759,
    lng: -118.101424623491,
    locationAccuracy: "verified",
    website: "https://www.cerritosautosquare.com",
    priority: "anchor",
    decisionMakerTitle: "Marketing manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.5 miles from the Irvine office, recorded in the research pass as 17 dealer association, local co promotion and sponsorship budget. A centre is a promotion site before it is an account, because specialty leasing sells the concourse space an activation would stand in and the tenant directory doubles as a list of retailers who already buy prize and giveaway stock.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 150,
    headcountBasis:
      "A centre's own management team is small and a tenant wide event is large, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://shop.cerritos.gov/shopping-centers/cerritos-auto-square/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "norm-reeves-honda-superstore-cerritos",
    slug: "norm-reeves-honda-superstore-cerritos",
    name: "Norm Reeves Honda Superstore Irvine",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "18500 Studebaker Road, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.864121629094,
    lng: -118.099565746266,
    locationAccuracy: "verified",
    website: "https://www.normreeveshondacerritos.com",
    priority: "anchor",
    decisionMakerTitle: "Human resources manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.4 miles from the Irvine office, recorded in the research pass as large dealership, giveaway and event sponsorship prospect. A workforce of this size buys staff appreciation nights and incentive prizes in volume, which is the largest single line a local promotions programme can win.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 50,
    headcountHigh: 300,
    headcountBasis:
      "A large employer splits a staff event across shifts and departments rather than closing for a day, so the range covers one shift up to a full appreciation night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.normreeveshondacerritos.com/contact-us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "lexus-of-cerritos",
    slug: "lexus-of-cerritos",
    name: "Lexus of Irvine",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "18800 Studebaker Road, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.861862163255,
    lng: -118.099551991612,
    locationAccuracy: "verified",
    website: "https://www.cerritoslexus.com",
    priority: "anchor",
    decisionMakerTitle: "Human resources manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.4 miles from the Irvine office, recorded in the research pass as auto dealer group, staff outings and joint promotions. A workforce of this size buys staff appreciation nights and incentive prizes in volume, which is the largest single line a local promotions programme can win.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 50,
    headcountHigh: 300,
    headcountBasis:
      "A large employer splits a staff event across shifts and departments rather than closing for a day, so the range covers one shift up to a full appreciation night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.cerritoslexus.com/contact/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "sheraton-cerritos-hotel",
    slug: "sheraton-cerritos-hotel",
    name: "Sheraton Irvine Hotel",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "12725 Center Court Drive South, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.867984362457,
    lng: -118.06066845092,
    locationAccuracy: "verified",
    website:
      "https://www.marriott.com/en-us/hotels/lgbsi-sheraton-cerritos-hotel/overview/",
    priority: "high",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.2 miles from the Irvine office, recorded in the research pass as hotel and banquet venue, conventions and fan event overflow. Group event space nearby is both an overflow room for a fan event and a referral partner whose enquiries land in the same diary as ours.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Enquiries run two to six months ahead of the date, heaviest from September for the holiday season.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 30,
    headcountHigh: 200,
    headcountBasis:
      "An events and hospitality operator books at whatever size the group in front of it happens to be, so the range is set wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.marriott.com/en-us/hotels/lgbsi-sheraton-cerritos-hotel/overview/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "gen-restaurant-group-inc",
    slug: "gen-restaurant-group-inc",
    name: "GEN Restaurant Group, Inc.",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A head office, so the approval chain for anything agreed here tops out on the premises.",
    address: "11472 South Street, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.858347824533,
    lng: -118.089252234054,
    locationAccuracy: "verified",
    website: "https://www.genkoreanbbq.com",
    priority: "high",
    decisionMakerTitle: "Office manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.9 miles from the Irvine office, recorded in the research pass as listed company head office in Irvine, corporate group business. A head office this close is a corporate group booking and a vendor relationship at the same time, and the front office is the way into both.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 25,
    headcountHigh: 150,
    headcountBasis:
      "An office of this kind buys a department night more often than an all staff one, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://investor.genkoreanbbq.com/resources/investor-faq/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "inbody-usa",
    slug: "inbody-usa",
    name: "InBody USA",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A head office, so the approval chain for anything agreed here tops out on the premises.",
    address: "13850 Irvine Corporate Drive Unit C, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.884558788975,
    lng: -118.037213339432,
    locationAccuracy: "verified",
    website: "https://inbodyusa.com",
    priority: "high",
    decisionMakerTitle: "Office manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.7 miles from the Irvine office, recorded in the research pass as US head office in Irvine, corporate staff outings. A head office this close is a corporate group booking and a vendor relationship at the same time, and the front office is the way into both.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 25,
    headcountHigh: 150,
    headcountBasis:
      "An office of this kind buys a department night more often than an all staff one, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://inbodybwa.com/contact-us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "premier-workspaces-cerritos-tower",
    slug: "premier-workspaces-cerritos-tower",
    name: "Premier Workspaces Irvine Tower",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "18000 Studebaker Road Suite 700, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.868075775076,
    lng: -118.099040023918,
    locationAccuracy: "verified",
    website: "https://premierworkspaces.com",
    priority: "high",
    decisionMakerTitle: "Office manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.4 miles from the Irvine office, recorded in the research pass as office tower hub, many small corporate tenants nearby. A head office this close is a corporate group booking and a vendor relationship at the same time, and the front office is the way into both.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 25,
    headcountHigh: 150,
    headcountBasis:
      "An office of this kind buys a department night more often than an all staff one, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://premierworkspaces.com/locations/california/cerritos/cerritos/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "abc-unified-school-district",
    slug: "abc-unified-school-district",
    name: "ABC Unified School District",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school district office. The dates come off a published district calendar and the money moves on a purchase order.",
    address: "16700 Norwalk Boulevard, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.879702210235,
    lng: -118.072624225578,
    locationAccuracy: "verified",
    website: "https://www.abcusd.us",
    priority: "anchor",
    decisionMakerTitle: "Superintendent's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.2 miles from the Irvine office, recorded in the research pass as district office in Irvine, large youth and family audience. A district office is one conversation that reaches every campus behind it, and it is where a youth promotion gets permission rather than sympathy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 30,
    headcountHigh: 150,
    headcountBasis:
      "A district office books staff and programme nights rather than whole schools, so the range runs from a single department up to a district wide appreciation evening. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.abcusd.us/apps/pages/index.jsp?uREC_ID=1558840&type=d&pREC_ID=1684747, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "cerritos-library",
    slug: "cerritos-library",
    name: "Irvine Library",
    lane: "faith-nonprofit",
    orgType: "independent",
    orgTypeBasis:
      "A municipal or civic body operating from its own single site, so the approval sits in the building even where a council signs it.",
    address: "18025 Bloomfield Avenue, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.867397299762,
    lng: -118.063825852512,
    locationAccuracy: "verified",
    website: "https://library.cerritos.gov",
    priority: "high",
    decisionMakerTitle: "Programme coordinator",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.3 miles from the Irvine office, recorded in the research pass as city library running anime and manga youth programming. A library runs free youth and manga programming that already gathers exactly the audience a licensed promotion is aimed at, and the programming desk is used to partners turning up with materials.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://library.cerritos.gov/about-the-library/hours-and-location/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "city-of-cerritos-city-hall",
    slug: "city-of-cerritos-city-hall",
    name: "City of Irvine City Hall",
    lane: "faith-nonprofit",
    orgType: "independent",
    orgTypeBasis:
      "A municipal or civic body operating from its own single site, so the approval sits in the building even where a council signs it.",
    address: "18125 Bloomfield Avenue, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.866853977938,
    lng: -118.063816188729,
    locationAccuracy: "verified",
    website: "https://www.cerritos.gov",
    priority: "high",
    decisionMakerTitle: "Community services manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.3 miles from the Irvine office, recorded in the research pass as city hall, permits and civic event partnership route. A city hall is the permit route and the sponsorship route for anything that happens outdoors here, and it employs enough people to be a staff night in its own right.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.cerritos.gov/city-government/contact-us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "polydot-print-specialists",
    slug: "polydot-print-specialists",
    name: "Polydot Print Specialists",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "12155 Mora Drive Ste 13, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.940005143983,
    lng: -118.073884273181,
    locationAccuracy: "verified",
    website: "https://polydotprint.com/",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.1 miles from the Irvine office, recorded in the research pass as same day printing, quick turnaround for promotion collateral. Print is the cheapest part of a promotion and the part that decides whether it launches on time, so a printer inside the trade area is worth having quoted before a campaign needs one.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://polydotprint.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "steven-label-corporation",
    slug: "steven-label-corporation",
    name: "Steven Label Corporation",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "11926 Burke Street, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.962490313088,
    lng: -118.062647213504,
    locationAccuracy: "verified",
    website: "https://www.stevenlabel.com/",
    priority: "low",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 6.6 miles from the Irvine office, recorded in the research pass as label manufacturer, sticker and decal capacity for licensed campaigns. Print is the cheapest part of a promotion and the part that decides whether it launches on time, so a printer inside the trade area is worth having quoted before a campaign needs one.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.stevenlabel.com/contact, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "sign-it",
    slug: "sign-it",
    name: "Sign It",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "8724 Millergrove Drive, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.963696456911,
    lng: -118.080115048076,
    locationAccuracy: "verified",
    website: "https://www.mysignit.com/",
    priority: "low",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 6.8 miles from the Irvine office, recorded in the research pass as signs and banners, in store promotion display vendor. In store signage carries the offer, and a local sign and banner shop is the vendor who can hang a promotion in a week rather than a quarter.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.mysignit.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "packaging-corporation-of-america-santa-fe-springs-hexacomb-plant",
    slug: "packaging-corporation-of-america-santa-fe-springs-hexacomb-plant",
    name: "Packaging Corporation of America, Santa Fe Springs Hexacomb Plant",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "9700 Bell Ranch Drive, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.950023440996,
    lng: -118.06540628064,
    locationAccuracy: "verified",
    website: "https://www.packagingcorp.com/",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.7 miles from the Irvine office, recorded in the research pass as large packaging plant, bulk corrugated supply and local employer. Prize and giveaway stock has to be packed and shipped, and a packaging supplier this close shortens the line between a merchandise order and a store floor.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.packagingcorp.com/location/santa-fe-springs-hexacomb-plant/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "quality-packaging-and-supplies",
    slug: "quality-packaging-and-supplies",
    name: "Quality Packaging & Supplies",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "12866 Ann Street Unit 2, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.952717436039,
    lng: -118.051329628861,
    locationAccuracy: "verified",
    website: "https://qualityps.com/",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.9 miles from the Irvine office, recorded in the research pass as packaging distributor, shipping supply for merchandise programmes. Prize and giveaway stock has to be packed and shipped, and a packaging supplier this close shortens the line between a merchandise order and a store floor.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://qualityps.com/contact, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "norwalk-printing-and-graphics",
    slug: "norwalk-printing-and-graphics",
    name: "Norwalk Printing & Graphics",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "12014 East Rosecrans Avenue, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.902123359578,
    lng: -118.077554791526,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.6 miles from the Irvine office, recorded in the research pass as local commercial printer, flyers and in store promotion collateral. Print is the cheapest part of a promotion and the part that decides whether it launches on time, so a printer inside the trade area is worth having quoted before a campaign needs one.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://norwalkchamber.com/business/norwalk-printing-graphics/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "press-print-color-media",
    slug: "press-print-color-media",
    name: "Press Print Color Media",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "12025 Florence Avenue #108, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.935431392516,
    lng: -118.075082666586,
    locationAccuracy: "verified",
    website: "https://pressprintcolor.com/",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.8 miles from the Irvine office, recorded in the research pass as full service printing and marketing, campaign print partner. Print is the cheapest part of a promotion and the part that decides whether it launches on time, so a printer inside the trade area is worth having quoted before a campaign needs one.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://pressprintcolor.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "socal-flexographic",
    slug: "socal-flexographic",
    name: "SoCal Flexographic",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "11839 Smith Avenue, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.949436711664,
    lng: -118.078537312679,
    locationAccuracy: "verified",
    website: "https://socalflexo.com/",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.8 miles from the Irvine office, recorded in the research pass as flexographic label printer, roll sticker capacity for giveaways. Print is the cheapest part of a promotion and the part that decides whether it launches on time, so a printer inside the trade area is worth having quoted before a campaign needs one.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://socalflexo.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "martin-ez-stick-labels-inc",
    slug: "martin-ez-stick-labels-inc",
    name: "Martin EZ Stick Labels Inc",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "12921 Sunnyside Place, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.929132080833,
    lng: -118.055517507978,
    locationAccuracy: "verified",
    website: "https://martinezsticklabels.com/",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.3 miles from the Irvine office, recorded in the research pass as label and sticker manufacturer, low cost premium item source. Print is the cheapest part of a promotion and the part that decides whether it launches on time, so a printer inside the trade area is worth having quoted before a campaign needs one.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://martinezsticklabels.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "french-press-custom-apparel-printing-and-design",
    slug: "french-press-custom-apparel-printing-and-design",
    name: "French Press Custom Apparel Printing & Design",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "14130 Rosecrans Avenue, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.902438272485,
    lng: -118.032165326123,
    locationAccuracy: "verified",
    website: "https://www.frenchpresscustom.com/",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.8 miles from the Irvine office, recorded in the research pass as screen printing and custom apparel, staff and prize tees. Screen print and embroidery capacity inside the trade area is what turns a licensed design into staff and prize apparel without a long lead time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.frenchpresscustom.com/about-us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "vertex-packaging-supplies",
    slug: "vertex-packaging-supplies",
    name: "Vertex Packaging Supplies",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "15505 Cornet Street, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.889662597644,
    lng: -118.049161900042,
    locationAccuracy: "verified",
    website: "https://vpsupplies.com/",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.6 miles from the Irvine office, recorded in the research pass as packaging supply wholesaler, potential vendor for prize logistics. Prize and giveaway stock has to be packed and shipped, and a packaging supplier this close shortens the line between a merchandise order and a store floor.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://vpsupplies.com/contacts/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "the-ups-store-norwalk",
    slug: "the-ups-store-norwalk",
    name: "The UPS Store Norwalk",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "13330 Bloomfield Avenue Ste 102, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.910185842033,
    lng: -118.064405958627,
    locationAccuracy: "verified",
    website:
      "https://locations.theupsstore.com/ca/norwalk/13330-bloomfield-ave",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.0 miles from the Irvine office, recorded in the research pass as print and sign services, walk in overflow print capacity. Print is the cheapest part of a promotion and the part that decides whether it launches on time, so a printer inside the trade area is worth having quoted before a campaign needs one.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://locations.theupsstore.com/ca/norwalk/13330-bloomfield-ave/all-printing-services, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "wismettac-asian-foods-inc",
    slug: "wismettac-asian-foods-inc",
    name: "Wismettac Asian Foods, Inc.",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "13409 Orden Drive Building J, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.911829255283,
    lng: -118.046474658098,
    locationAccuracy: "verified",
    website: "https://wismettacusa.com",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.1 miles from the Irvine office, recorded in the research pass as Asian food importer, Japanese vendor and licensor network overlap. An importer sits at the front of the licensed merchandise supply chain, and the sourcing and freight lanes it already runs are the ones a merchandise programme would use.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://wismettacusa.com/locations/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "santa-fe-footwear-corp",
    slug: "santa-fe-footwear-corp",
    name: "Santa Fe Footwear Corp.",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "9988 Santa Fe Springs Road, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.94684147552,
    lng: -118.06260419023,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.5 miles from the Irvine office, recorded in the research pass as footwear importer, overseas sourcing and container import capability. An importer sits at the front of the licensed merchandise supply chain, and the sourcing and freight lanes it already runs are the ones a merchandise programme would use.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/member/santa-fe-footwear-corp-4391, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "windsor-fashions",
    slug: "windsor-fashions",
    name: "Windsor Fashions",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "9603 John Street, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.953073092084,
    lng: -118.062624348588,
    locationAccuracy: "verified",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.9 miles from the Irvine office, recorded in the research pass as apparel distribution centre, young shopper audience overlap. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/ql/logistics-warehousing-1039, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "unfi",
    slug: "unfi",
    name: "UNFI",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "15015 Valley View Avenue, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.895659054074,
    lng: -118.029122770002,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.6 miles from the Irvine office, recorded in the research pass as national grocery distributor, snack and beverage prize sourcing. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/ql/logistics-warehousing-1039, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "weber-logistics",
    slug: "weber-logistics",
    name: "Weber Logistics",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "13530 Rosecrans Avenue, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.902383429541,
    lng: -118.043719072897,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.5 miles from the Irvine office, recorded in the research pass as consumer goods warehousing, fulfilment partner for promotions. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/ql/logistics-warehousing-1039, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "rim-logistics-ltd",
    slug: "rim-logistics-ltd",
    name: "RIM Logistics, Ltd.",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "12418 Florence Avenue, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.935220851397,
    lng: -118.068027784691,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.7 miles from the Irvine office, recorded in the research pass as freight forwarder, import lane for licensed merchandise. An importer sits at the front of the licensed merchandise supply chain, and the sourcing and freight lanes it already runs are the ones a merchandise programme would use.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/ql/logistics-warehousing-1039, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "mcmaster-carr-supply-co",
    slug: "mcmaster-carr-supply-co",
    name: "McMaster-Carr Supply Co.",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "9630 Norwalk Boulevard, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.951628395825,
    lng: -118.072373472771,
    locationAccuracy: "verified",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.9 miles from the Irvine office, recorded in the research pass as large distribution employer, corporate group and gifting prospect. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/member/mcmaster-carr-supply-co-3456, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "day-lee-foods-inc",
    slug: "day-lee-foods-inc",
    name: "Day-Lee Foods, Inc.",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A head office, so the approval chain for anything agreed here tops out on the premises.",
    address: "13055 East Molette Street, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.891514446882,
    lng: -118.053898457349,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.7 miles from the Irvine office, recorded in the research pass as Japanese food maker, cultural promotion tie in potential. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/ql/manufacturing-1030, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "otafuku-foods-inc",
    slug: "otafuku-foods-inc",
    name: "Otafuku Foods, Inc.",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A head office, so the approval chain for anything agreed here tops out on the premises.",
    address: "13117 Molette Street, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.891549647987,
    lng: -118.052340464854,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.7 miles from the Irvine office, recorded in the research pass as Japanese sauce brand, co promotion and sampling partner. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/ql/manufacturing-1030, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "natrol-llc",
    slug: "natrol-llc",
    name: "Natrol, LLC",
    lane: "corporate",
    orgType: "unknown",
    orgTypeBasis:
      "The page this row was read from does not say whether other sites trade under the same ownership, so the type is left unknown rather than guessed.",
    address: "12246 Hawkins Street, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.944459090857,
    lng: -118.071523137785,
    locationAccuracy: "verified",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.4 miles from the Irvine office, recorded in the research pass as consumer packaged goods supplier, premium and sampling stock. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/ql/manufacturing-1030, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "patchmade-llc",
    slug: "patchmade-llc",
    name: "Patchmade LLC",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "9830 Norwalk Boulevard Ste 174, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.94866272671,
    lng: -118.072609552117,
    locationAccuracy: "verified",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.7 miles from the Irvine office, recorded in the research pass as patch and emblem maker, custom merchandise decoration. Screen print and embroidery capacity inside the trade area is what turns a licensed design into staff and prize apparel without a long lead time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://business.sfschamber.com/list/ql/manufacturing-1030, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "silver-spur-corporation",
    slug: "silver-spur-corporation",
    name: "Silver Spur Corporation",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "16010 Shoemaker Avenue, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.886529580493,
    lng: -118.055296459318,
    locationAccuracy: "verified",
    website: "https://silverspurcorp.com",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.3 miles from the Irvine office, recorded in the research pass as packaging distributor, premium and gift packing supply. Prize and giveaway stock has to be packed and shipped, and a packaging supplier this close shortens the line between a merchandise order and a store floor.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://silverspurcorp.com/contact-us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "atlas-commercial-products",
    slug: "atlas-commercial-products",
    name: "Atlas Commercial Products",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "16200 Commerce Way, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.887804687999,
    lng: -118.042946839747,
    locationAccuracy: "verified",
    website: "https://www.atlaschairs.com",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.6 miles from the Irvine office, recorded in the research pass as event furniture distributor, event production supply nearby. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.atlaschairs.com/contact-us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "cal-panel",
    slug: "cal-panel",
    name: "Cal Panel",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "14055 Artesia Boulevard, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.873366368553,
    lng: -118.031891077724,
    locationAccuracy: "verified",
    website: "https://www.calpanel.com",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 1.5 miles from the Irvine office, recorded in the research pass as materials distributor, fixture and display build supply. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.calpanel.com/Contact-Us.html, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "full-factory-distribution",
    slug: "full-factory-distribution",
    name: "Full Factory Distribution",
    lane: "corporate",
    orgType: "unknown",
    orgTypeBasis:
      "The page this row was read from does not say whether other sites trade under the same ownership, so the type is left unknown rather than guessed.",
    address: "13502 Pumice Street, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.897555854267,
    lng: -118.04418933681,
    locationAccuracy: "verified",
    website: "https://fullfactorydistro.com",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.2 miles from the Irvine office, recorded in the research pass as action sports distributor, apparel and sticker merchandise supply. A distribution operation is two prospects in one building: a sourcing route for prize and premium stock, and a local employer whose staff nights are worth asking about.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://fullfactorydistro.com/pages/contact, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "manhattan-stitching-company",
    slug: "manhattan-stitching-company",
    name: "Manhattan Stitching Company",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "8362 Artesia Blvd Ste E, Buena Park, CA 90621",
    city: "Buena Park",
    state: "CA",
    postalCode: "90621",
    lat: 33.87351685371,
    lng: -117.986045897738,
    locationAccuracy: "verified",
    website: "https://manhattanstitching.com/",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.1 miles from the Irvine office, recorded in the research pass as screen printing and embroidery, collegiate licensed decorator. Screen print and embroidery capacity inside the trade area is what turns a licensed design into staff and prize apparel without a long lead time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://manhattanstitching.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "365-custom-printing",
    slug: "365-custom-printing",
    name: "365 Custom Printing",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "8475 Artesia Blvd Suite 104, Buena Park, CA 90621",
    city: "Buena Park",
    state: "CA",
    postalCode: "90621",
    lat: 33.873631445063,
    lng: -117.985476426113,
    locationAccuracy: "verified",
    website: "https://www.365customprinting.com/",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.2 miles from the Irvine office, recorded in the research pass as screen print, digital and sublimation, prize apparel capability. Screen print and embroidery capacity inside the trade area is what turns a licensed design into staff and prize apparel without a long lead time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.365customprinting.com/pages/contact-us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "studio-credit",
    slug: "studio-credit",
    name: "Studio Credit",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "6870 Oran Circle Unit C/D, Buena Park, CA 90621",
    city: "Buena Park",
    state: "CA",
    postalCode: "90621",
    lat: 33.85990664908,
    lng: -118.005936873272,
    locationAccuracy: "verified",
    website: "https://studiocredit.co/",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.0 miles from the Irvine office, recorded in the research pass as garment decorating with warehouse and shipping, merch fulfilment. Screen print and embroidery capacity inside the trade area is what turns a licensed design into staff and prize apparel without a long lead time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://studiocredit.co/pages/contact, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "superior-signs-and-graphics",
    slug: "superior-signs-and-graphics",
    name: "Superior Signs and Graphics",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "6061 Dale Street Suite G, Buena Park, CA 90621",
    city: "Buena Park",
    state: "CA",
    postalCode: "90621",
    lat: 33.872426525422,
    lng: -117.985880620485,
    locationAccuracy: "verified",
    website: "https://superiorsignsandgraphics.com/",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.1 miles from the Irvine office, recorded in the research pass as banners, window graphics and wraps for in store promotions. In store signage carries the offer, and a local sign and banner shop is the vendor who can hang a promotion in a week rather than a quarter.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://superiorsignsandgraphics.com/contact-us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "nettrophy-buena-park-plaque-and-trophy",
    slug: "nettrophy-buena-park-plaque-and-trophy",
    name: "netTrophy, Buena Park Plaque and Trophy",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "6122 Beach Blvd, Buena Park, CA 90621",
    city: "Buena Park",
    state: "CA",
    postalCode: "90621",
    lat: 33.871636710294,
    lng: -117.998080846269,
    locationAccuracy: "verified",
    website: "http://www.nettrophy.com/",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.4 miles from the Irvine office, recorded in the research pass as custom awards and medals, tournament prize supplier. Custom awards, medals and branded stock are exactly what a tournament or a giveaway consumes, so this is a vendor quote worth holding before a season starts rather than after.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from http://www.nettrophy.com/awards/212/Contact-Us.html, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "anderson-printco-cypress-printing-and-silkscreen",
    slug: "anderson-printco-cypress-printing-and-silkscreen",
    name: "Anderson Printco, Cypress Printing and Silkscreen",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "10603 Progress Way, Cypress, CA 90630",
    city: "Cypress",
    state: "CA",
    postalCode: "90630",
    lat: 33.808238711082,
    lng: -118.035668823356,
    locationAccuracy: "verified",
    website: "https://www.cypressprinting.com/",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.3 miles from the Irvine office, recorded in the research pass as silkscreen and custom apparel since 1970, promotional programmes. Screen print and embroidery capacity inside the trade area is what turns a licensed design into staff and prize apparel without a long lead time.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://www.cypresschamber.org/list/member/anderson-printco-49, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "calcomp-graphic-solutions-llc",
    slug: "calcomp-graphic-solutions-llc",
    name: "CalComp Graphic Solutions, LLC",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "6703 International Ave, Cypress, CA 90630",
    city: "Cypress",
    state: "CA",
    postalCode: "90630",
    lat: 33.804887768943,
    lng: -118.016051082898,
    locationAccuracy: "verified",
    website: "http://www.calcompgs.com",
    priority: "medium",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.0 miles from the Irvine office, recorded in the research pass as large format graphics, signage vendor for promotion rollouts. In store signage carries the offer, and a local sign and banner shop is the vendor who can hang a promotion in a week rather than a quarter.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://www.cypresschamber.org/list/member/calcomp-graphic-solutions-llc-26, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "eno-brands",
    slug: "eno-brands",
    name: "ENO Brands",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "6481 Global Dr, Cypress, CA 90630",
    city: "Cypress",
    state: "CA",
    postalCode: "90630",
    lat: 33.805915663564,
    lng: -118.019863198893,
    locationAccuracy: "verified",
    website: "http://www.enobrands.com",
    priority: "high",
    decisionMakerTitle: "Sales manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.8 miles from the Irvine office, recorded in the research pass as jewellery manufacturing, potential custom collectible merchandise maker. Custom awards, medals and branded stock are exactly what a tournament or a giveaway consumes, so this is a vendor quote worth holding before a season starts rather than after.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Quoted all year, with the heaviest merchandise and print runs placed from late summer for the fourth quarter.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 15,
    headcountHigh: 80,
    headcountBasis:
      "A single site trade supplier runs a small workforce and books accordingly, so the range is kept low and wide. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://www.cypresschamber.org/list/member/eno-brands-283, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "knott-s-berry-farm-hotel",
    slug: "knott-s-berry-farm-hotel",
    name: "Knott's Berry Farm Hotel",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "7675 Crescent Ave, Buena Park, CA 90620",
    city: "Buena Park",
    state: "CA",
    postalCode: "90620",
    lat: 33.839400723852,
    lng: -117.998517290253,
    locationAccuracy: "verified",
    website: "https://www.sixflags.com/knotts/knotts-hotel",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.9 miles from the Irvine office, recorded in the research pass as resort hotel with meeting space, group promotion tie ins. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.visitbuenapark.com/business/knotts-berry-farm-hotel, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "medieval-times-dinner-and-tournament",
    slug: "medieval-times-dinner-and-tournament",
    name: "Medieval Times Dinner and Tournament",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "7662 Beach Blvd, Buena Park, CA 90620",
    city: "Buena Park",
    state: "CA",
    postalCode: "90620",
    lat: 33.853257444796,
    lng: -117.997837499062,
    locationAccuracy: "verified",
    website: "https://www.medievaltimes.com/buena-park",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.6 miles from the Irvine office, recorded in the research pass as dinner show venue, cross promotion and group ticket audience. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.medievaltimes.com/buena-park, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "pirates-dinner-adventure",
    slug: "pirates-dinner-adventure",
    name: "Pirates Dinner Adventure",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "7600 Beach Blvd, Buena Park, CA 90620",
    city: "Buena Park",
    state: "CA",
    postalCode: "90620",
    lat: 33.853787735095,
    lng: -117.997831255005,
    locationAccuracy: "verified",
    website: "https://piratesdinneradventure.com/ca",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.6 miles from the Irvine office, recorded in the research pass as interactive dinner show, family entertainment district neighbour. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.bbb.org/us/ca/buena-park/profile/restaurants/pirates-dinner-adventure-1126-100039456, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "john-s-incredible-pizza-company",
    slug: "john-s-incredible-pizza-company",
    name: "John's Incredible Pizza Company",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "8601 On the Mall, Buena Park, CA 90620",
    city: "Buena Park",
    state: "CA",
    postalCode: "90620",
    lat: 33.843184448914,
    lng: -117.993348518242,
    locationAccuracy: "verified",
    website: "https://johnspizza.com/buena-park",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.1 miles from the Irvine office, recorded in the research pass as arcade and ticket redemption venue, direct prize merchandise buyer. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.visitbuenapark.com/business/johns-incredible-pizza-company, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "big-air-trampoline-park-buena-park",
    slug: "big-air-trampoline-park-buena-park",
    name: "Big Air Trampoline Park Buena Park",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "8320 On the Mall, Buena Park, CA 90620",
    city: "Buena Park",
    state: "CA",
    postalCode: "90620",
    lat: 33.843069857533,
    lng: -117.993406125231,
    locationAccuracy: "verified",
    website: "https://www.bigairusa.com/buena-park",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.1 miles from the Irvine office, recorded in the research pass as trampoline park, youth and birthday party audience overlap. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.bigairusa.com/hours-and-information/buena-park, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "buena-park-downtown",
    slug: "buena-park-downtown",
    name: "Buena Park Downtown",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "8308 On the Mall, Buena Park, CA 90620",
    city: "Buena Park",
    state: "CA",
    postalCode: "90620",
    lat: 33.843069857533,
    lng: -117.993408594102,
    locationAccuracy: "verified",
    website: "https://visitbpd.com/",
    priority: "medium",
    decisionMakerTitle: "Marketing manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.1 miles from the Irvine office, recorded in the research pass as 1.2 million square foot mall, Sanrio cafe and entertainment tenants. A centre is a promotion site before it is an account, because specialty leasing sells the concourse space an activation would stand in and the tenant directory doubles as a list of retailers who already buy prize and giveaway stock.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 150,
    headcountBasis:
      "A centre's own management team is small and a tenant wide event is large, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.visitbuenapark.com/business/buena-park-downtown, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "the-source-oc",
    slug: "the-source-oc",
    name: "The Source OC",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "6940 Beach Blvd, Buena Park, CA 90621",
    city: "Buena Park",
    state: "CA",
    postalCode: "90621",
    lat: 33.859815126619,
    lng: -117.99796037204,
    locationAccuracy: "verified",
    website: "https://www.thesourceoc.com/",
    priority: "anchor",
    decisionMakerTitle: "Marketing manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.5 miles from the Irvine office, recorded in the research pass as Korean lifestyle centre with CGV cinemas, Asian pop culture footfall. A centre is a promotion site before it is an account, because specialty leasing sells the concourse space an activation would stand in and the tenant directory doubles as a list of retailers who already buy prize and giveaway stock.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 150,
    headcountBasis:
      "A centre's own management team is small and a tenant wide event is large, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.visitbuenapark.com/business/the-source, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "starlight-cinemas-lakewood-center",
    slug: "starlight-cinemas-lakewood-center",
    name: "Starlight Cinemas Lakewood Center",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "5200 Faculty Ave, Lakewood, CA 90712",
    city: "Lakewood",
    state: "CA",
    postalCode: "90712",
    lat: 33.852463044216,
    lng: -118.136829863302,
    locationAccuracy: "verified",
    website: "https://www.starlightcinemas.com",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.6 miles from the Irvine office, recorded in the research pass as 16 screen cinema, film and anime tie in partner. A release calendar is a licensing calendar, and a film or anime tie in here costs a poster and a prize allocation rather than a media buy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.starlightcinemas.com/locations/g01vg-starlight-lakewood-center/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "the-gardens-casino",
    slug: "the-gardens-casino",
    name: "The Gardens Casino",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "11871 Carson St, Hawaiian Gardens, CA 90716",
    city: "Hawaiian Gardens",
    state: "CA",
    postalCode: "90716",
    lat: 33.831511455143,
    lng: -118.081787857848,
    locationAccuracy: "verified",
    website: "https://www.thegardenscasino.com",
    priority: "high",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.8 miles from the Irvine office, recorded in the research pass as large entertainment employer, comparable player rewards programmes. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.thegardenscasino.com/contact-us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "24-hour-fitness-lakewood-super-sport",
    slug: "24-hour-fitness-lakewood-super-sport",
    name: "24 Hour Fitness Lakewood Super Sport",
    lane: "local-retail-food",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "4821 Del Amo Blvd, Lakewood, CA 90712",
    city: "Lakewood",
    state: "CA",
    postalCode: "90712",
    lat: 33.847152100729,
    lng: -118.136753402461,
    locationAccuracy: "verified",
    website: "https://www.24hourfitness.com",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.7 miles from the Irvine office, recorded in the research pass as high traffic leisure anchor, cross promotion audience. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.24hourfitness.com/gyms/lakewood-ca/lakewood-super-sport, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "lakewood-equestrian-center",
    slug: "lakewood-equestrian-center",
    name: "Lakewood Equestrian Center",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "11369 E Carson St, Lakewood, CA 90715",
    city: "Lakewood",
    state: "CA",
    postalCode: "90715",
    lat: 33.831526249376,
    lng: -118.091160471853,
    locationAccuracy: "verified",
    website: "https://www.lakewoodequestriancenter.com",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.1 miles from the Irvine office, recorded in the research pass as recreation venue, family leisure audience overlap. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.lakewoodequestriancenter.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "uci-health-lakewood",
    slug: "uci-health-lakewood",
    name: "UCI Health Lakewood",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "3700 E South St, Lakewood, CA 90712",
    city: "Lakewood",
    state: "CA",
    postalCode: "90712",
    lat: 33.860160864307,
    lng: -118.149254636184,
    locationAccuracy: "verified",
    website: "https://www.ucihealth.org",
    priority: "medium",
    decisionMakerTitle: "Human resources manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.3 miles from the Irvine office, recorded in the research pass as hospital employer, staff outing and group prize prospect. A workforce of this size buys staff appreciation nights and incentive prizes in volume, which is the largest single line a local promotions programme can win.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 50,
    headcountHigh: 300,
    headcountBasis:
      "A large employer splits a staff event across shifts and departments rather than closing for a day, so the range covers one shift up to a full appreciation night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.ucihealth.org/locations/lakewood/uci-health-lakewood, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "kaiser-permanente-bellflower-medical-offices",
    slug: "kaiser-permanente-bellflower-medical-offices",
    name: "Kaiser Permanente Bellflower Medical Offices",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A plant or facility of a national operator rather than the company itself, so the site runs the work and the spend is approved above it.",
    address: "9400 Rosecrans Ave, Bellflower, CA 90706",
    city: "Bellflower",
    state: "CA",
    postalCode: "90706",
    lat: 33.904054686195,
    lng: -118.133985326987,
    locationAccuracy: "verified",
    website: "https://healthy.kaiserpermanente.org",
    priority: "medium",
    decisionMakerTitle: "Human resources manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.0 miles from the Irvine office, recorded in the research pass as major medical employer, staff event and incentive buyer. A workforce of this size buys staff appreciation nights and incentive prizes in volume, which is the largest single line a local promotions programme can win.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 50,
    headcountHigh: 300,
    headcountBasis:
      "A large employer splits a staff event across shifts and departments rather than closing for a day, so the range covers one shift up to a full appreciation night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://healthy.kaiserpermanente.org/southern-california/facilities/Bellflower-Medical-Offices-MOB-1-100165, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "bellflower-chamber-of-commerce",
    slug: "bellflower-chamber-of-commerce",
    name: "Bellflower Chamber of Commerce",
    lane: "faith-nonprofit",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "16730 Bellflower Blvd, Bellflower, CA 90706",
    city: "Bellflower",
    state: "CA",
    postalCode: "90706",
    lat: 33.882665428081,
    lng: -118.125143830304,
    locationAccuracy: "verified",
    website: "https://bellflowerchamber.org",
    priority: "medium",
    decisionMakerTitle: "Membership director",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.0 miles from the Irvine office, recorded in the research pass as local business network, vendor and sponsor introductions. A chamber is not a booking, it is a directory of every other organisation on this board standing in one room once a month, which is the cheapest introduction a promotions programme can buy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://locator.lacounty.gov/lac/Location/3174930/bellflower-chamber-of-commerce, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "lakewood-bellflower-elks-lodge-no-888",
    slug: "lakewood-bellflower-elks-lodge-no-888",
    name: "Lakewood Bellflower Elks Lodge No. 888",
    lane: "faith-nonprofit",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "12507 E Carson St, Hawaiian Gardens, CA 90716",
    city: "Hawaiian Gardens",
    state: "CA",
    postalCode: "90716",
    lat: 33.831703936393,
    lng: -118.065427407986,
    locationAccuracy: "verified",
    website: "https://www.elks.org",
    priority: "high",
    decisionMakerTitle: "Programme coordinator",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.5 miles from the Irvine office, recorded in the research pass as fraternal group, bulk event and prize merchandise buyer. A fraternal lodge buys bulk event and prize stock on a repeating social calendar, and the decision is made by a committee that meets on a known night.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.elks.org/lodges/home.cfm?LodgeNumber=888, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "hawaiian-gardens-library",
    slug: "hawaiian-gardens-library",
    name: "Hawaiian Gardens Library",
    lane: "faith-nonprofit",
    orgType: "chain",
    orgTypeBasis:
      "A branch of a county library system, so programming partnerships are agreed above the branch even where the branch runs them.",
    address: "11940 Carson St, Hawaiian Gardens, CA 90716",
    city: "Hawaiian Gardens",
    state: "CA",
    postalCode: "90716",
    lat: 33.831351863561,
    lng: -118.078132383969,
    locationAccuracy: "verified",
    website: "https://lacountylibrary.org",
    priority: "high",
    decisionMakerTitle: "Programme coordinator",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.8 miles from the Irvine office, recorded in the research pass as community programming venue, youth audience for promotions. A library runs free youth and manga programming that already gathers exactly the audience a licensed promotion is aimed at, and the programming desk is used to partners turning up with materials.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://lacountylibrary.org/hawaiian-gardens-library/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "clifton-m-brakensiek-library",
    slug: "clifton-m-brakensiek-library",
    name: "Clifton M. Brakensiek Library",
    lane: "faith-nonprofit",
    orgType: "chain",
    orgTypeBasis:
      "A branch of a county library system, so programming partnerships are agreed above the branch even where the branch runs them.",
    address: "9945 E Flower St, Bellflower, CA 90706",
    city: "Bellflower",
    state: "CA",
    postalCode: "90706",
    lat: 33.882172451663,
    lng: -118.120814831749,
    locationAccuracy: "verified",
    website: "https://lacountylibrary.org",
    priority: "medium",
    decisionMakerTitle: "Programme coordinator",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.7 miles from the Irvine office, recorded in the research pass as community programming venue, teen and family audience. A library runs free youth and manga programming that already gathers exactly the audience a licensed promotion is aimed at, and the programming desk is used to partners turning up with materials.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://lacountylibrary.org/clifton-m-brakensiek-library/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "the-centre-at-lakewood",
    slug: "the-centre-at-lakewood",
    name: "The Centre at Lakewood",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "5000 Clark Ave, Lakewood, CA 90712",
    city: "Lakewood",
    state: "CA",
    postalCode: "90712",
    lat: 33.84878180557,
    lng: -118.133701750541,
    locationAccuracy: "verified",
    website: "https://www.lakewoodca.gov",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.5 miles from the Irvine office, recorded in the research pass as city banquet venue, group booking and promotion crossover. Group event space nearby is both an overflow room for a fan event and a referral partner whose enquiries land in the same diary as ours.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Enquiries run two to six months ahead of the date, heaviest from September for the holiday season.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 30,
    headcountHigh: 200,
    headcountBasis:
      "An events and hospitality operator books at whatever size the group in front of it happens to be, so the range is set wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.lakewoodca.gov/Things-to-Do/Reserve-a-Facility/The-Centre, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "railmaster-hobbies",
    slug: "railmaster-hobbies",
    name: "RailMaster Hobbies",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "9812 Belmont St, Bellflower, CA 90706",
    city: "Bellflower",
    state: "CA",
    postalCode: "90706",
    lat: 33.883508986157,
    lng: -118.124804530893,
    locationAccuracy: "verified",
    website: "http://railmasterhobbies.com",
    priority: "high",
    decisionMakerTitle: "Store manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.0 miles from the Irvine office, recorded in the research pass as hobby retail, collector audience overlaps prize merchandise. The fandom apparel and collectible shelves show which licences are moving locally, which is the question a prize merchandise buyer has to answer before committing to a run.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 8,
    headcountHigh: 40,
    headcountBasis:
      "A single store team is small and a store led promotion draws its guests from a shift rather than a payroll. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://railmasterhobbies.com/store_info.html, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "bellflower-unified-school-district",
    slug: "bellflower-unified-school-district",
    name: "Bellflower Unified School District",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school district office. The dates come off a published district calendar and the money moves on a purchase order.",
    address: "16703 South Clark Ave, Bellflower, CA 90706",
    city: "Bellflower",
    state: "CA",
    postalCode: "90706",
    lat: 33.882887831921,
    lng: -118.134007361099,
    locationAccuracy: "verified",
    priority: "medium",
    decisionMakerTitle: "Superintendent's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.5 miles from the Irvine office, recorded in the research pass as district office, youth and family group audience. A district office is one conversation that reaches every campus behind it, and it is where a youth promotion gets permission rather than sympathy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 30,
    headcountHigh: 150,
    headcountBasis:
      "A district office books staff and programme nights rather than whole schools, so the range runs from a single department up to a district wide appreciation evening. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.cde.ca.gov/schooldirectory/details?cdscode=19643030000000, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "city-of-lakewood",
    slug: "city-of-lakewood",
    name: "City of Lakewood",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A municipal or civic body operating from its own single site, so the approval sits in the building even where a council signs it.",
    address: "5050 Clark Ave, Lakewood, CA 90712",
    city: "Lakewood",
    state: "CA",
    postalCode: "90712",
    lat: 33.849600598185,
    lng: -118.133697863802,
    locationAccuracy: "verified",
    website: "https://www.lakewoodca.gov",
    priority: "medium",
    decisionMakerTitle: "Human resources manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.5 miles from the Irvine office, recorded in the research pass as municipal employer, city event sponsorship prospect. A workforce of this size buys staff appreciation nights and incentive prizes in volume, which is the largest single line a local promotions programme can win.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 50,
    headcountHigh: 300,
    headcountBasis:
      "A large employer splits a staff event across shifts and departments rather than closing for a day, so the range covers one shift up to a full appreciation night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.lakewoodca.gov/Site-Footer/Footer-Widgets/Contact-Us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "cerritos-college",
    slug: "cerritos-college",
    name: "Irvine College",
    lane: "colleges",
    orgType: "school",
    orgTypeBasis:
      "A degree granting campus, which buys on an academic calendar through student life and activities budgets.",
    address: "11110 Alondra Blvd, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.887485554048,
    lng: -118.098698800757,
    locationAccuracy: "verified",
    website: "https://www.cerritos.edu",
    priority: "anchor",
    decisionMakerTitle: "Student activities manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.7 miles from the Irvine office, recorded in the research pass as large community college campus, core young adult audience. A campus of this size is not one customer but hundreds of student organisations, and the student activities office is the door to all of them at once.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "September for the autumn term and January for the spring, when student organisation budgets are set.",
    occasionClass: LANE_META["colleges"].occasionClass,
    headcountLow: 40,
    headcountHigh: 250,
    headcountBasis:
      "One campus holds many student organisations, chapters and teams, and they book at very different sizes, so the range is deliberately wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.cerritos.edu/campus-guide/directions-to-campus.htm, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "biola-university",
    slug: "biola-university",
    name: "Biola University",
    lane: "colleges",
    orgType: "school",
    orgTypeBasis:
      "A degree granting campus, which buys on an academic calendar through student life and activities budgets.",
    address: "13800 Biola Ave, La Mirada, CA 90639",
    city: "La Mirada",
    state: "CA",
    postalCode: "90639",
    lat: 33.904315343735,
    lng: -118.017777535175,
    locationAccuracy: "verified",
    website: "https://www.biola.edu",
    priority: "anchor",
    decisionMakerTitle: "Student activities manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.4 miles from the Irvine office, recorded in the research pass as residential university, student group outings and campus promotions. A campus of this size is not one customer but hundreds of student organisations, and the student activities office is the door to all of them at once.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "September for the autumn term and January for the spring, when student organisation budgets are set.",
    occasionClass: LANE_META["colleges"].occasionClass,
    headcountLow: 40,
    headcountHigh: 250,
    headcountBasis:
      "One campus holds many student organisations, chapters and teams, and they book at very different sizes, so the range is deliberately wide. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.biola.edu/contact, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "norwalk-la-mirada-unified-school-district",
    slug: "norwalk-la-mirada-unified-school-district",
    name: "Norwalk-La Mirada Unified School District",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school district office. The dates come off a published district calendar and the money moves on a purchase order.",
    address: "12820 Pioneer Blvd, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.913688293718,
    lng: -118.081621931147,
    locationAccuracy: "verified",
    website: "https://www.nlmusd.org",
    priority: "anchor",
    decisionMakerTitle: "Superintendent's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.5 miles from the Irvine office, recorded in the research pass as 29 school district office, gateway for group bookings. A district office is one conversation that reaches every campus behind it, and it is where a youth promotion gets permission rather than sympathy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 30,
    headcountHigh: 150,
    headcountBasis:
      "A district office books staff and programme nights rather than whole schools, so the range runs from a single department up to a district wide appreciation evening. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.cde.ca.gov/schooldirectory/details?cdscode=19648400000000, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "la-mirada-high-school",
    slug: "la-mirada-high-school",
    name: "La Mirada High School",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school campus. The dates come off a published calendar and the money moves on a purchase order rather than a card.",
    address: "13520 Adelfa Dr, La Mirada, CA 90638",
    city: "La Mirada",
    state: "CA",
    postalCode: "90638",
    lat: 33.90853190634,
    lng: -118.004193933935,
    locationAccuracy: "verified",
    website: "https://lamirada.nlmusd.org",
    priority: "medium",
    decisionMakerTitle: "Principal's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.2 miles from the Irvine office, recorded in the research pass as comprehensive high school, teen audience for prize promotions. A comprehensive campus is a standing youth audience with a fixed calendar behind it, and one conversation at the office reaches clubs, teams and the graduating year together.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 40,
    headcountHigh: 200,
    headcountBasis:
      "A comprehensive campus draws a group booking from clubs, teams and a graduating year rather than from the whole roll, so the range is set wide on that pattern. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://lamirada.nlmusd.org/contact-us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "norwalk-high-school",
    slug: "norwalk-high-school",
    name: "Norwalk High School",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school campus. The dates come off a published calendar and the money moves on a purchase order rather than a card.",
    address: "11356 E Leffingwell Rd, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.908512666345,
    lng: -118.09083617511,
    locationAccuracy: "verified",
    website: "https://norwalk.nlmusd.org",
    priority: "medium",
    decisionMakerTitle: "Principal's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.4 miles from the Irvine office, recorded in the research pass as comprehensive high school near store, teen group traffic. A comprehensive campus is a standing youth audience with a fixed calendar behind it, and one conversation at the office reaches clubs, teams and the graduating year together.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 40,
    headcountHigh: 200,
    headcountBasis:
      "A comprehensive campus draws a group booking from clubs, teams and a graduating year rather than from the whole roll, so the range is set wide on that pattern. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://norwalk.nlmusd.org/contact-us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "john-glenn-high-school",
    slug: "john-glenn-high-school",
    name: "John Glenn High School",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school campus. The dates come off a published calendar and the money moves on a purchase order rather than a card.",
    address: "13520 Shoemaker Ave, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.908535016195,
    lng: -118.055264601132,
    locationAccuracy: "verified",
    website: "https://johnglenn.nlmusd.org",
    priority: "high",
    decisionMakerTitle: "Principal's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.8 miles from the Irvine office, recorded in the research pass as high school campus, grad night and club fundraising. A comprehensive campus is a standing youth audience with a fixed calendar behind it, and one conversation at the office reaches clubs, teams and the graduating year together.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 40,
    headcountHigh: 200,
    headcountBasis:
      "A comprehensive campus draws a group booking from clubs, teams and a graduating year rather than from the whole roll, so the range is set wide on that pattern. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://johnglenn.nlmusd.org/contact-us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "cerritos-high-school",
    slug: "cerritos-high-school",
    name: "Irvine High School",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school campus. The dates come off a published calendar and the money moves on a purchase order rather than a card.",
    address: "12500 E 183rd St, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.865781492669,
    lng: -118.06590113429,
    locationAccuracy: "verified",
    website: "https://www.cerritoshs.us",
    priority: "high",
    decisionMakerTitle: "Principal's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.5 miles from the Irvine office, recorded in the research pass as high school minutes from store, teen audience. A comprehensive campus is a standing youth audience with a fixed calendar behind it, and one conversation at the office reaches clubs, teams and the graduating year together.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 40,
    headcountHigh: 200,
    headcountBasis:
      "A comprehensive campus draws a group booking from clubs, teams and a graduating year rather than from the whole roll, so the range is set wide on that pattern. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.cerritoshs.us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "whitney-high-school",
    slug: "whitney-high-school",
    name: "Whitney High School",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school campus. The dates come off a published calendar and the money moves on a purchase order rather than a card.",
    address: "16800 Shoemaker Ave, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.877990376426,
    lng: -118.055159226489,
    locationAccuracy: "verified",
    website: "https://www.whitneyhs.us",
    priority: "high",
    decisionMakerTitle: "Principal's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 0.7 miles from the Irvine office, recorded in the research pass as selective secondary school, club and anime society audience. A comprehensive campus is a standing youth audience with a fixed calendar behind it, and one conversation at the office reaches clubs, teams and the graduating year together.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 40,
    headcountHigh: 200,
    headcountBasis:
      "A comprehensive campus draws a group booking from clubs, teams and a graduating year rather than from the whole roll, so the range is set wide on that pattern. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.whitneyhs.us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "gahr-high-school",
    slug: "gahr-high-school",
    name: "Gahr High School",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school campus. The dates come off a published calendar and the money moves on a purchase order rather than a card.",
    address: "11111 Artesia Blvd, Irvine, CA 90703",
    city: "Irvine",
    state: "CA",
    postalCode: "90703",
    lat: 33.873004239338,
    lng: -118.098498046389,
    locationAccuracy: "verified",
    website: "https://www.gahrhs.us",
    priority: "high",
    decisionMakerTitle: "Principal's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.4 miles from the Irvine office, recorded in the research pass as large Irvine high school, team and club outings. A comprehensive campus is a standing youth audience with a fixed calendar behind it, and one conversation at the office reaches clubs, teams and the graduating year together.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 40,
    headcountHigh: 200,
    headcountBasis:
      "A comprehensive campus draws a group booking from clubs, teams and a graduating year rather than from the whole roll, so the range is set wide on that pattern. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.gahrhs.us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "oak-middle-school",
    slug: "oak-middle-school",
    name: "Oak Middle School",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school campus. The dates come off a published calendar and the money moves on a purchase order rather than a card.",
    address: "10821 Oak St, Los Alamitos, CA 90720",
    city: "Los Alamitos",
    state: "CA",
    postalCode: "90720",
    lat: 33.806897981672,
    lng: -118.07580188409,
    locationAccuracy: "verified",
    website: "https://www.losal.org",
    priority: "medium",
    decisionMakerTitle: "Principal's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.3 miles from the Irvine office, recorded in the research pass as middle school campus, family and youth promotion audience. A comprehensive campus is a standing youth audience with a fixed calendar behind it, and one conversation at the office reaches clubs, teams and the graduating year together.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 40,
    headcountHigh: 200,
    headcountBasis:
      "A comprehensive campus draws a group booking from clubs, teams and a graduating year rather than from the whole roll, so the range is set wide on that pattern. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.losal.org/schools, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "mcauliffe-middle-school",
    slug: "mcauliffe-middle-school",
    name: "McAuliffe Middle School",
    lane: "schools",
    orgType: "school",
    orgTypeBasis:
      "A public school campus. The dates come off a published calendar and the money moves on a purchase order rather than a card.",
    address: "4112 Irvine Ave, Los Alamitos, CA 90720",
    city: "Los Alamitos",
    state: "CA",
    postalCode: "90720",
    lat: 33.810282865004,
    lng: -118.061699134169,
    locationAccuracy: "verified",
    website: "https://www.losal.org",
    priority: "medium",
    decisionMakerTitle: "Principal's office",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.0 miles from the Irvine office, recorded in the research pass as middle school campus, youth reward programme audience. A comprehensive campus is a standing youth audience with a fixed calendar behind it, and one conversation at the office reaches clubs, teams and the graduating year together.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Autumn for the following spring and summer, with end of year and grad night dates settled long before April.",
    occasionClass: LANE_META["schools"].occasionClass,
    headcountLow: 40,
    headcountHigh: 200,
    headcountBasis:
      "A comprehensive campus draws a group booking from clubs, teams and a graduating year rather than from the whole roll, so the range is set wide on that pattern. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.losal.org/schools, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "la-mirada-theatre-for-the-performing-arts",
    slug: "la-mirada-theatre-for-the-performing-arts",
    name: "La Mirada Theatre for the Performing Arts",
    lane: "local-retail-food",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "14900 La Mirada Blvd, La Mirada, CA 90638",
    city: "La Mirada",
    state: "CA",
    postalCode: "90638",
    lat: 33.896153810175,
    lng: -118.009843819222,
    locationAccuracy: "verified",
    website: "https://www.lamiradatheatre.com",
    priority: "medium",
    decisionMakerTitle: "General manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.4 miles from the Irvine office, recorded in the research pass as ticketed venue, cross promotion and event audience overlap. A neighbouring amusement operator is a competitor for the same evening spend and a benchmark for prize and redemption buying, and one visit answers both questions.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Summer and the fourth quarter, when footfall and promotion budgets are both at their highest.",
    occasionClass: LANE_META["local-retail-food"].occasionClass,
    headcountLow: 20,
    headcountHigh: 120,
    headcountBasis:
      "A leisure operator's own team night is small even where its audience is large, and this range covers the staff side only. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.lamiradatheatre.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "norwalk-chamber-of-commerce",
    slug: "norwalk-chamber-of-commerce",
    name: "Norwalk Chamber of Commerce",
    lane: "faith-nonprofit",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "14783 Carmenita Rd, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.897041080612,
    lng: -118.046644386102,
    locationAccuracy: "verified",
    website: "https://www.norwalkchamber.com",
    priority: "high",
    decisionMakerTitle: "Membership director",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.1 miles from the Irvine office, recorded in the research pass as member events, route to local vendors and sponsors. A chamber is not a booking, it is a directory of every other organisation on this board standing in one room once a month, which is the cheapest introduction a promotions programme can buy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://www.norwalkchamber.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "los-alamitos-area-chamber-of-commerce",
    slug: "los-alamitos-area-chamber-of-commerce",
    name: "Los Alamitos Area Chamber of Commerce",
    lane: "faith-nonprofit",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "3231 Katella Ave, Los Alamitos, CA 90720",
    city: "Los Alamitos",
    state: "CA",
    postalCode: "90720",
    lat: 33.803251457951,
    lng: -118.075441364187,
    locationAccuracy: "verified",
    website: "https://www.losalchamber.org",
    priority: "medium",
    decisionMakerTitle: "Membership director",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.6 miles from the Irvine office, recorded in the research pass as member directory and events, local vendor sourcing channel. A chamber is not a booking, it is a directory of every other organisation on this board standing in one room once a month, which is the cheapest introduction a promotions programme can buy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://www.losalchamber.org/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "city-of-norwalk",
    slug: "city-of-norwalk",
    name: "City of Norwalk",
    lane: "faith-nonprofit",
    orgType: "independent",
    orgTypeBasis:
      "A municipal or civic body operating from its own single site, so the approval sits in the building even where a council signs it.",
    address: "12700 Norwalk Blvd, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.916092755191,
    lng: -118.07242208747,
    locationAccuracy: "verified",
    website: "https://www.norwalk.org",
    priority: "medium",
    decisionMakerTitle: "Community services manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.5 miles from the Irvine office, recorded in the research pass as city runs public events, sponsorship and permit contact. A city hall is the permit route and the sponsorship route for anything that happens outdoors here, and it employs enough people to be a staff night in its own right.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.norwalk.org/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "yamaha-corporation-of-america",
    slug: "yamaha-corporation-of-america",
    name: "Yamaha Corporation of America",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A head office, so the approval chain for anything agreed here tops out on the premises.",
    address: "6600 Orangethorpe Ave, Buena Park, CA 90620",
    city: "Buena Park",
    state: "CA",
    postalCode: "90620",
    lat: 33.858816558747,
    lng: -118.018025219013,
    locationAccuracy: "verified",
    website: "https://usa.yamaha.com",
    priority: "high",
    decisionMakerTitle: "Office manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 2.4 miles from the Irvine office, recorded in the research pass as music and audio brand headquarters, licensed merchandise vendor contacts. A head office this close is a corporate group booking and a vendor relationship at the same time, and the front office is the way into both.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 25,
    headcountHigh: 150,
    headcountBasis:
      "An office of this kind buys a department night more often than an all staff one, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://usa.yamaha.com/support/contact/index.html, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "epson-america-inc",
    slug: "epson-america-inc",
    name: "Epson America, Inc.",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A head office, so the approval chain for anything agreed here tops out on the premises.",
    address: "3131 Katella Ave, Los Alamitos, CA 90720",
    city: "Los Alamitos",
    state: "CA",
    postalCode: "90720",
    lat: 33.803251458042,
    lng: -118.0770776603,
    locationAccuracy: "verified",
    website: "https://epson.com",
    priority: "medium",
    decisionMakerTitle: "Office manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.6 miles from the Irvine office, recorded in the research pass as consumer electronics headquarters, printing and prize hardware vendor. A head office this close is a corporate group booking and a vendor relationship at the same time, and the front office is the way into both.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 25,
    headcountHigh: 150,
    headcountBasis:
      "An office of this kind buys a department night more often than an all staff one, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://epson.com/contact-us, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "trojan-battery-company",
    slug: "trojan-battery-company",
    name: "Trojan Battery Company",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A head office, so the approval chain for anything agreed here tops out on the premises.",
    address: "12380 Clark St, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.93890185104,
    lng: -118.068977640479,
    locationAccuracy: "verified",
    website: "https://www.trojanbattery.com",
    priority: "medium",
    decisionMakerTitle: "Office manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.0 miles from the Irvine office, recorded in the research pass as manufacturer headquarters, local workforce for corporate group outings. A head office this close is a corporate group booking and a vendor relationship at the same time, and the front office is the way into both.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 25,
    headcountHigh: 150,
    headcountBasis:
      "An office of this kind buys a department night more often than an all staff one, so the range spans both. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.trojanbattery.com/contact-us/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "dsh-metropolitan-state-hospital",
    slug: "dsh-metropolitan-state-hospital",
    name: "DSH Metropolitan State Hospital",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A municipal or civic body operating from its own single site, so the approval sits in the building even where a council signs it.",
    address: "11401 S Bloomfield Ave, Norwalk, CA 90650",
    city: "Norwalk",
    state: "CA",
    postalCode: "90650",
    lat: 33.927353304893,
    lng: -118.064014464752,
    locationAccuracy: "verified",
    website: "https://www.dsh.ca.gov",
    priority: "medium",
    decisionMakerTitle: "Human resources manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.1 miles from the Irvine office, recorded in the research pass as 1,530 employees, staff reward and group outing potential. A workforce of this size buys staff appreciation nights and incentive prizes in volume, which is the largest single line a local promotions programme can win.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 50,
    headcountHigh: 300,
    headcountBasis:
      "A large employer splits a staff event across shifts and departments rather than closing for a day, so the range covers one shift up to a full appreciation night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.dsh.ca.gov/About_Us/Contact_Us.html, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "porto-s-bakery-and-cafe",
    slug: "porto-s-bakery-and-cafe",
    name: "Porto's Bakery and Cafe",
    lane: "corporate",
    orgType: "chain",
    orgTypeBasis:
      "A branded unit of a multi site operator, so the yes for a promotion sits above the building and the useful outcome of a first visit is the name of the desk that holds it.",
    address: "7640 Beach Blvd, Buena Park, CA 90620",
    city: "Buena Park",
    state: "CA",
    postalCode: "90620",
    lat: 33.853445890489,
    lng: -117.997836026815,
    locationAccuracy: "verified",
    website: "https://www.portosbakery.com",
    priority: "anchor",
    decisionMakerTitle: "Human resources manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 3.6 miles from the Irvine office, recorded in the research pass as high volume bakery employer, cross promotion and footfall. A workforce of this size buys staff appreciation nights and incentive prizes in volume, which is the largest single line a local promotions programme can win.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 50,
    headcountHigh: 300,
    headcountBasis:
      "A large employer splits a staff event across shifts and departments rather than closing for a day, so the range covers one shift up to a full appreciation night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://www.portosbakery.com/pages/locations, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "city-of-los-alamitos",
    slug: "city-of-los-alamitos",
    name: "City of Los Alamitos",
    lane: "corporate",
    orgType: "independent",
    orgTypeBasis:
      "A municipal or civic body operating from its own single site, so the approval sits in the building even where a council signs it.",
    address: "3191 Katella Ave, Los Alamitos, CA 90720",
    city: "Los Alamitos",
    state: "CA",
    postalCode: "90720",
    lat: 33.803251457981,
    lng: -118.075973971387,
    locationAccuracy: "verified",
    website: "https://cityoflosalamitos.org",
    priority: "medium",
    decisionMakerTitle: "Human resources manager",
    emailConfidence: "none",
    whyTheyFit:
      "About 4.6 miles from the Irvine office, recorded in the research pass as municipal employer, community events and sponsorship contacts. A workforce of this size buys staff appreciation nights and incentive prizes in volume, which is the largest single line a local promotions programme can win.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "October to December for the holiday season, with a second window in January and February for kickoffs and staff appreciation.",
    occasionClass: LANE_META["corporate"].occasionClass,
    headcountLow: 50,
    headcountHigh: 300,
    headcountBasis:
      "A large employer splits a staff event across shifts and departments rather than closing for a day, so the range covers one shift up to a full appreciation night. An estimate by category, not a published figure.",
    addressSource:
      "Read from https://cityoflosalamitos.org/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
  {
    id: "santa-fe-springs-chamber-of-commerce",
    slug: "santa-fe-springs-chamber-of-commerce",
    name: "Santa Fe Springs Chamber of Commerce",
    lane: "faith-nonprofit",
    orgType: "independent",
    orgTypeBasis:
      "A single site organisation whose decision maker works in the building, which is why the door is the route rather than a head office.",
    address: "12016 Telegraph Rd Suite 100, Santa Fe Springs, CA 90670",
    city: "Santa Fe Springs",
    state: "CA",
    postalCode: "90670",
    lat: 33.94346645277,
    lng: -118.076967865636,
    locationAccuracy: "verified",
    website: "https://sfschamber.com",
    priority: "medium",
    decisionMakerTitle: "Membership director",
    emailConfidence: "none",
    whyTheyFit:
      "About 5.4 miles from the Irvine office, recorded in the research pass as gateway to Santa Fe Springs industrial employer base. A chamber is not a booking, it is a directory of every other organisation on this board standing in one room once a month, which is the cheapest introduction a promotions programme can buy.",
    leadPackageId: LEAD_PACKAGE_ID,
    buyingWindow:
      "Spring and early summer for community programming, with budgets set as the municipal year turns over in July.",
    occasionClass: LANE_META["faith-nonprofit"].occasionClass,
    headcountLow: 20,
    headcountHigh: 100,
    headcountBasis:
      "Civic, library and membership groups gather in tens rather than hundreds outside their one big annual night. An estimate by category, not a published figure.",
    note:
      "The address on this row was read from a chamber member directory rather than from the organisation's own page, so it is second party. Worth confirming at the door before anything is posted to it.",
    addressSource:
      "Read from https://sfschamber.com/, then geocoded through the US Census Bureau geocoder, benchmark 2020, on 17 August 2026",
    provenance: {
      address: "public",
      coordinate: "public",
      decisionMakerTitle: "modeled",
      orgType: "modeled",
      whyTheyFit: "modeled",
      headcount: "modeled",
      buyingWindow: "modeled",
    },
  },
];

export const PROSPECT_BY_ID: Record<string, Prospect> = Object.fromEntries(
  PROSPECTS.map((p) => [p.id, p]),
);

/**
 * Organisations that publish an email we actually read off their site.
 *
 * IT IS EMPTY, AND THE EXPORT STAYS. No email was gathered anywhere on
 * this board, so nothing can qualify, and a screen that filters on it
 * should show a clean nothing rather than break. An empty list here is
 * the same finding the head comment opens with, expressed as data.
 */
export const EMAILABLE = PROSPECTS.filter(
  (p) => p.emailConfidence === "verified_public",
);

/**
 * Organisations with no written door at all.
 *
 * On this board that is every single one of them. This is not a leftover
 * list, it is the route, and it is sorted by distance from Park Plaza
 * Drive on the field board for exactly that reason.
 */
export const DOOR_ONLY = PROSPECTS.filter((p) => p.emailConfidence === "none");

/**
 * RESEARCHED, FOUND REAL, AND NOT ON THE BOARD.
 *
 * Twenty four organisations that appear on no map in this application,
 * and the reason for each. Every one of them exists, every one was read
 * off a page that is named in its reason, and not one of them carries a
 * coordinate, because the US Census geocoder either returned nothing for
 * the address after a simplified retry or came back with a different
 * street from the one it was sent.
 *
 * The alternative was to nudge a nearby pin onto the map, and that is the
 * one thing that would discredit the other hundred and nine. An unmatched
 * address is a fact a rep can act on: the door is still there, the row
 * just cannot be drawn. A borrowed coordinate is a quiet lie that looks
 * exactly like a fact.
 *
 * The Method page renders this list, so the removals are visible rather
 * than silent.
 */
/**
 * WHY A REMOVAL CARRIES ITS OWN KIND.
 *
 * The Method page groups these, because the two groups make completely
 * different arguments. An address the federal file has never heard of
 * says something about the federal file, and its ranges genuinely do run
 * out at mall interiors, newer industrial blocks and private entry roads.
 * An address two sources disagree about says something about the address,
 * and Bloomfield Street against Bloomfield Avenue is a different street
 * rather than an abbreviation of the same one.
 *
 * So the row says what kind of removal it is, and the screen groups on
 * that rather than guessing from prose it does not control.
 */
export type ExclusionKind =
  /** The geocoder holds no address range for the number. A TIGER gap. */
  | "unmatched"
  /** Two sources name different streets. Nobody has established this yet. */
  | "disagreement"
  /** Real, but nothing loadable proves the address or that it still trades. */
  | "unverifiable";

export const EXCLUDED_FROM_BOARD: {
  name: string;
  address: string;
  kind: ExclusionKind;
  reason: string;
}[] = [
  {
    name: "MINISO",
    kind: "disagreement",
    address: "326 Los Irvine Center, Irvine, CA 90703",
    reason:
      "Real, researched, and carrying no coordinate because the Census geocoder came back with a different street from the one it was sent, so the coordinate was withheld rather than guessed. Census returned '326 LOS CERRITOS MALL, CERRITOS, CA, 90703' (1 match, x -118.092269713832, y 33.859997519002). Street name sent was 'Los Irvine Center'; 'MALL' is a different street name, not a standard suffix normalisation of 'CENTER' (which would be 'CTR'). No coordinate recorded. The organisation itself is not in doubt, it was read from https://www.miniso-us.com/locations/los-cerritos-center. A pin on the wrong road is worse than no pin, so this one is published as removed rather than quietly nudged onto a nearby corner.",
  },
  {
    name: "Irvine Center for the Performing Arts",
    kind: "unmatched",
    address: "18000 the Irvine office, Irvine, CA 90703",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried simplified as '18000 the Irvine office, Irvine, CA 90703' and still zero matches. The organisation itself is not in doubt, it was read from https://ccpa.cerritos.gov/plan-your-visit/directions/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Atkinson, Andelson, Loya, Ruud & Romo",
    kind: "unmatched",
    address: "12800 Center Court Drive Suite 300, Irvine, CA 90703",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried simplified as '12800 Center Court Dr, Irvine, CA 90703' and still zero matches. The organisation itself is not in doubt, it was read from https://www.aalrr.com/contact-cerritos. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Irvine Sports Complex and Skate Park",
    kind: "unmatched",
    address: "19900 Bloomfield Avenue, Irvine, CA 90703",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried simplified as '19900 Bloomfield Ave, Irvine, CA 90703' and still zero matches. No coordinate recorded. The organisation itself is not in doubt, it was read from https://www.cerritos.gov/recreation-culture/cerritos-sports-complex-and-skate-park/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "PIP Santa Fe Springs",
    kind: "unmatched",
    address: "13517 Alondra Boulevard, Santa Fe Springs, CA 90670",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches on the full form and zero matches on the retry with the street type abbreviated to 13517 Alondra Blvd, Santa Fe Springs, CA 90670. The organisation itself is not in doubt, it was read from https://www.pip.com/santafespringsca200. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "APABrandU",
    kind: "unmatched",
    address: "11807 Slauson Avenue 7/8, Santa Fe Springs, CA 90670",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried once as '11807 Slauson Ave, Santa Fe Springs, CA 90670' and still zero matches. The organisation itself is not in doubt, it was read from https://www.apabrandu.com/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "FASTSIGNS Santa Fe Springs",
    kind: "unmatched",
    address: "11875 Telegraph Road, Santa Fe Springs, CA 90670",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Census returned 0 matches. Retried once as '11875 Telegraph Rd, Santa Fe Springs, CA 90670' and still 0 matches. The organisation itself is not in doubt, it was read from https://www.fastsigns.com/santa-fe-springs-ca/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Associated Packaging Inc.",
    kind: "unmatched",
    address: "12441 Florence Avenue, Santa Fe Springs, CA 90670",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Census returned zero matches. Retried once with simplified form '12441 Florence Ave, Santa Fe Springs, CA 90670' and still zero matches. The organisation itself is not in doubt, it was read from https://www.associatedpackaging.com/locations/santa-fe-springs-ca. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "El Clasificado / EC Hispanic Media",
    kind: "unmatched",
    address: "11205 Imperial Highway, Norwalk, CA 90650",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried once as '11205 Imperial Hwy, Norwalk, CA 90650' and still zero matches. The organisation itself is not in doubt, it was read from https://norwalkchamber.com/business_category/advertising/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "BXS Printing",
    kind: "unmatched",
    address: "11823 Slauson Avenue # 32, Santa Fe Springs, CA 90670",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Census returned 0 matches. Retried once as '11823 Slauson Ave, Santa Fe Springs, CA 90670' and still 0 matches. The organisation itself is not in doubt, it was read from https://business.sfschamber.com/list/member/bxs-printing-15406. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Chu's Packaging Supplies, Inc.",
    kind: "unmatched",
    address: "10011 Santa Fe Springs Road, Santa Fe Springs, CA 90670",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Census returned zero matches. Retried once with simplified form '10011 Santa Fe Springs Rd, Santa Fe Springs, CA 90670' and still zero matches. The organisation itself is not in doubt, it was read from https://chuspkg.com/contact-us/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Santa Fe Springs Swap Meet",
    kind: "unmatched",
    address: "13963 Alondra Boulevard, Santa Fe Springs, CA 90670",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried simplified as '13963 Alondra Blvd, Santa Fe Springs, CA 90670' and still zero matches. The organisation itself is not in doubt, it was read from https://business.sfschamber.com/list/ql/shopping-specialty-retail-1032. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Minuteman Press La Palma",
    kind: "unmatched",
    address: "7871 Valley View Street, La Palma, CA 90623",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches. Retried once as \"7871 Valley View St, La Palma, CA 90623\" and still zero matches. The organisation itself is not in doubt, it was read from https://minuteman.com/us/locations/ca/la-palma/news/ad-specialties-65490. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Knott's Berry Farm",
    kind: "unmatched",
    address: "8039 Beach Blvd, Buena Park, CA 90620",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried as '8039 Beach Boulevard, Buena Park, CA 90620' and still zero matches. No coordinate recorded. The organisation itself is not in doubt, it was read from https://www.sixflags.com/knotts/park-map-and-directions. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "North Orange County Chamber",
    kind: "unmatched",
    address: "6601 Beach Blvd, Buena Park, CA 90621",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches. Retried once without the ZIP as \"6601 Beach Blvd, Buena Park, CA\" and still zero matches. The organisation itself is not in doubt, it was read from https://business.nocchamber.com/list. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Lakewood Center",
    kind: "unmatched",
    address: "500 Lakewood Center Mall, Lakewood, CA 90712",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried as '500 Lakewood Center Mall, Lakewood, CA' and still zero matches. No coordinate recorded. The organisation itself is not in doubt, it was read from https://pacificretail.com/property-assets/lakewood-center/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Macy's Lakewood Center",
    kind: "unmatched",
    address: "98 Lakewood Center Mall, Lakewood, CA 90712",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches on the full form and zero matches on the simplified retry 98 Lakewood Center, Lakewood, CA 90712. The organisation itself is not in doubt, it was read from https://www.macys.com/stores/ca/lakewood/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "JCPenney Lakewood Center",
    kind: "unmatched",
    address: "67 Lakewood Ctr Mall, Lakewood, CA 90712",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried once as '67 Lakewood Ctr, Lakewood, CA 90712' and still zero matches. The organisation itself is not in doubt, it was read from https://www.jcpenney.com/locations/ca/lakewood. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Greater Lakewood Chamber of Commerce",
    kind: "unmatched",
    address: "24 Lakewood Center Mall, Lakewood, CA 90712",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches from Census. Retried as '24 Lakewood Center Mall, Lakewood, CA' and still zero matches. No coordinate recorded. The organisation itself is not in doubt, it was read from https://lakewoodchamber.com/index.php/about-us/. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "City of Bellflower",
    kind: "disagreement",
    address: "16600 Civic Center Dr, Bellflower, CA 90706",
    reason:
      "Real, researched, and carrying no coordinate because the Census geocoder came back with a different street from the one it was sent, so the coordinate was withheld rather than guessed. Census returned '16600 CIVIC CENTER PLZ, BELLFLOWER, CA, 90706' (x -118.122178001792, y 33.883453134213). Sent street type Drive, Census matched a Plaza, which is a different street name rather than an abbreviation of the one sent. No coordinate recorded. The organisation itself is not in doubt, it was read from https://bellflower.ca.gov/how_do_i/contact_us/index.php. A pin on the wrong road is worse than no pin, so this one is published as removed rather than quietly nudged onto a nearby corner.",
  },
  {
    name: "City of Hawaiian Gardens",
    kind: "unmatched",
    address: "21815 Pioneer Blvd, Hawaiian Gardens, CA 90716",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches on the abbreviated form and zero matches on the retry using 21815 Pioneer Boulevard, Hawaiian Gardens, CA 90716. The organisation itself is not in doubt, it was read from https://www.hgcity.org/our-city/city-hall-information. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Los Alamitos Unified School District",
    kind: "disagreement",
    address: "10293 Bloomfield St, Los Alamitos, CA 90720",
    reason:
      "Real, researched, and carrying no coordinate because the Census geocoder came back with a different street from the one it was sent, so the coordinate was withheld rather than guessed. Census returned '10293 BLOOMFIELD AVE, LOS ALAMITOS, CA, 90720' (1 match, x -118.063145049522, y 33.819052549167). Sent street was Bloomfield ST; Bloomfield AVE is a separate street in Los Alamitos, so the suffix change is not a normalisation. No coordinate recorded. The organisation itself is not in doubt, it was read from https://www.losal.org/. A pin on the wrong road is worse than no pin, so this one is published as removed rather than quietly nudged onto a nearby corner.",
  },
  {
    name: "Los Alamitos High School",
    kind: "unmatched",
    address: "3591 Irvine Ave, Los Alamitos, CA 90720",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Zero matches on first attempt. Retried once simplified without ZIP (3591 Irvine Ave, Los Alamitos, CA) and still zero matches. No coordinate recorded. The organisation itself is not in doubt, it was read from https://www.losal.org/schools. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
  {
    name: "Coast Plaza Hospital",
    kind: "unmatched",
    address: "13100 Studebaker Rd, Norwalk, CA 90650",
    reason:
      "Real, researched, and carrying no coordinate because the US Census geocoder could not place the address. Census returned 0 matches. Retried once as '13100 Studebaker Road, Norwalk, CA 90650' and still 0 matches. The organisation itself is not in doubt, it was read from https://www.coastplazahospital.com/contact-us. The door is still there and the row is a drive-past; only the pin is missing, and a borrowed one would be worse than none.",
  },
];
