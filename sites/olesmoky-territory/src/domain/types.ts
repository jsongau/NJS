/**
 * Territory planning domain model.
 *
 * The shape here encodes the single most important thing about this
 * product: California is a three-tier state, so the supplier tier and
 * the retail tier are separated by law, and the data model separates
 * them too.
 *
 *   Ole Smoky (supplier)  ->  Southern Glazer's (wholesaler)  ->  retail
 *
 * A Distributor Sales Executive does not write retailer orders. They
 * build a plan and sell it INTO the distributor, whose sales force
 * executes it at retail. So money (allowances, trade investment) lives
 * on the SELL-IN ledger, and the retail ledger carries execution
 * commitments only. Putting promotional dollars against a retailer line
 * would describe a tied-house violation under CA B&P Code 25500/25502,
 * not merely an inaccuracy.
 *
 * See docs/METHODOLOGY.md for every formula and source.
 */

// ---------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------

/**
 * Every commercial figure in this app carries one of these. The UI
 * enforces it: number components require a provenance prop, so a
 * figure without a stated origin cannot render. That constraint is
 * the whole reason a viewer can trust the parts that ARE real.
 */
export type Provenance =
  /** A published address, a public brand fact, a cited company statement. */
  | "public"
  /** Plausible and invented for the prototype. Not a claim about reality. */
  | "illustrative"
  /** Calculated from stated assumptions. The assumptions are shown. */
  | "modeled"
  /** Recorded during a simulated store visit inside the prototype. */
  | "observed"
  /** Typed by the user in this session. */
  | "user_input";

export type Confidence = "high" | "medium" | "low";

// ---------------------------------------------------------------
// Trade structure
// ---------------------------------------------------------------

/**
 * `tier` exists to prevent a specific domain error. Southern Glazer's is
 * a wine and spirits house; it is not the spirits wholesaler and must never
 * appear as an alternative for spirits accounts. Typing the tier makes that
 * mistake impossible rather than merely discouraged.
 */
export type DistributorTier = "beer" | "wine-spirits" | "beyond-beer";

export interface Distributor {
  id: string;
  name: string;
  parent?: string;
  tier: DistributorTier;
  facilityAddress: string;
  city: string;
  state: "CA";
  postalCode: string;
  lat: number;
  lng: number;
  locationAccuracy: "verified" | "approximate" | "city-center";
  /**
   * The order desk on file. A demo address on a reserved, unroutable TLD,
   * so a Send action has a real recipient to address without any chance
   * of reaching a person.
   */
  contactEmail: DemoRecipient;
  contactRole: string;
  /** Plain-language footprint, quoted from the distributor's own site. */
  territoryDescription: string;
  /** Published scale figures, from the distributor's own site. */
  scale?: {
    employees: string;
    annualCases: string;
    retailAccounts: string;
    skus: string;
    joinedRbg: number;
    hq: string;
  };
  servesTerritoryIds: string[];
  source: string;
  provenance: Provenance;
}

export interface Territory {
  id: string;
  name: string;
  distributorId: string;
  hubCity: string;
  centroid: LatLng;
  accountIds: string[];
}

export interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  /** Ole Smoky' real fiscal calendar is not public. This one is invented. */
  provenance: Provenance;
}

export interface LatLng {
  lat: number;
  lng: number;
}

// ---------------------------------------------------------------
// Product structure
// ---------------------------------------------------------------

export type BrandFamily =
  | "core"
  | "above-premium"
  | "economy"
  | "flavor"
  | "rtd";

export interface Brand {
  id: string;
  name: string;
  family: BrandFamily;
  assetPath?: string;
  /**
   * Some supplied marks are drawn in light ink for a dark ground. Blue Flame
   * is silver-grey and disappears on white. Rather than recolour someone
   * else's logo, which is the one thing you must not do to a trademark,
   * the tile gets a dark ground for those.
   */
  markGround?: "light" | "dark";
  /**
   * Why this brand matters commercially right now, in Ole Smoky'
   * own published terms. This is what lets the app argue a
   * recommendation instead of just listing SKUs.
   */
  strategicRole: string;
  strategicRoleSource?: string;
  provenance: Provenance;
}

export type ContainerType = "can" | "bottle" | "keg";

export type PlacementType =
  // --- Off-premise: where the bottle sits ---------------------------
  | "back-shelf"
  | "endcap"
  | "secondary-display"
  | "shelf"
  | "checkout"
  | "floor-stack"
  // --- On-premise: where the pour comes from ------------------------
  /** The lit shelf behind the bar. Visibility, and the guest can see it. */
  | "back-bar"
  /** The speed rail. Volume, no visibility, and the call is the bartender's. */
  | "well"
  /** A printed line on the drinks menu. The only placement a guest reads. */
  | "menu-feature";

/**
 * OFF-PREMISE versus ON-PREMISE is the first fork in any spirits
 * territory, and it is a bigger fork than any two channels inside either
 * side of it.
 *
 * Off-premise sells a BOTTLE to a shopper who drinks it somewhere else.
 * The unit is a case, the ask is shelf space, the promotion is a price
 * feature and a display, and the account's question is "will it turn?".
 *
 * On-premise sells a POUR to a guest who drinks it here. The unit is
 * still a case, but the economics are per-serve: one 750ml bottle is
 * about sixteen 1.5oz pours, so a bar buying two cases is committing to
 * moving nearly four hundred drinks. The ask is a back-bar face and a
 * menu line, the promotion is a feature cocktail or an event, and the
 * account's question is "will my staff pour it?".
 *
 * Those are different sales calls, different emails, and different legal
 * footing — which is why this is a type and not a tag. A function that
 * takes a VenueClass cannot silently be handed the wrong kind of account.
 */
export type VenueClass = "off-premise" | "on-premise";

export type Channel =
  // --- Off-premise: a shopper carries the bottle out ---------------
  /** The independent bottle shop. The backbone of this territory. */
  | "liquor-store"
  /** A neighbourhood market with a licensed set, not a supermarket. */
  | "neighborhood-market"
  /** Corner and forecourt convenience, walk-in trade. */
  | "convenience"
  /** Fuel forecourt. A small set, and minis do the work. */
  | "fuel-convenience"
  /** The category specialist. Deepest set, most discovery. */
  | "beverage-specialty"
  // --- On-premise: a guest drinks it here ---------------------------
  /** Full-service casual chain dining. Menu-led, high cover count. */
  | "casual-dining"
  /** Sports bar. Event-led, and the reason a fight night matters. */
  | "sports-bar"
  /** Steakhouse. Brown spirits, higher check, slower turn. */
  | "steakhouse"
  /** Bowling and entertainment. Long dwell, group occasions. */
  | "bowling-entertainment"
  /** Neighbourhood pub. Regulars, bartender recommendation drives it. */
  | "pub";

/**
 * Package was a free-text string in the original spec. In beer the
 * package IS the sale: a 24pk of cans, a 19.2oz single, and a half
 * barrel have different velocities, placements, channels, and margins.
 * Making it an entity also means pallet counts calculate from
 * casesPerPallet instead of being typed in by hand and drifting.
 */
export interface PackageFormat {
  id: string;
  label: string;
  shortLabel: string;
  container: ContainerType;
  unitSizeOz: number;
  /**
   * Units in a CASE. This is the shipper: what moves on the pallet and
   * what a case count means everywhere in this app.
   */
  unitsPerCase: number;
  /**
   * Units in the thing a SHOPPER picks up. Not the same number, and
   * conflating the two is a real trade error: a 19.2oz single ships 12 to
   * a case but a shopper buys one can, so a case of it is twelve cans in
   * a tray, not a twelve pack. `unitsPerCase / packUnits` is how many
   * sellable packs are in a case.
   */
  packUnits: number;
  casesPerPallet: number;
  /** Where this package actually sells. Drives placement recommendations. */
  channelFit: Channel[];
  placementFit: PlacementType[];
  provenance: Provenance;
}

export interface Sku {
  id: string;
  brandId: string;
  packageFormatId: string;
  label: string;
  /** false keeps a SKU in the record without offering it. Used for Sparkling Lemonade,
   *  whose current status could not be verified. */
  active: boolean;
  /** Set when a SKU is part of Ole Smoky' published 2026 innovation slate. */
  innovation2026?: boolean;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Accounts and the fact table
// ---------------------------------------------------------------

export type AccountPriority = "high" | "medium" | "low";

export interface Account {
  id: string;
  slug: string;
  chainName: string;
  channel: Channel;
  /** Chains are called on by Chain Sales Executives; independents by the
   *  distributor's own reps. Different selling motion, so it is typed. */
  chainType: "chain" | "independent";
  address: string;
  city: string;
  state: "CA";
  postalCode: string;
  /** As published by the locator. Present on every account in this set. */
  phone?: string;
  lat: number;
  lng: number;
  locationAccuracy: "verified" | "approximate";
  territoryId: string;
  priority: AccountPriority;
  /** 1 is highest. A proxy for store traffic, not a measured figure. */
  trafficTier: 1 | 2 | 3;
  /**
   * Facing positions in the licensed set — the back bar at an on-premise
   * account, the spirits shelf run at an off-premise one.
   *
   * The field kept its old name through the beer build and that was a
   * mistake worth correcting: a `coldBoxDoorsTotal` on a bourbon shelf is
   * a field describing something that does not exist at these accounts.
   */
  shelfSectionsTotal?: number;
  lastVisitDate?: string;
  /**
   * Distance in miles as PUBLISHED by Ole Smoky's own store locator for
   * the search "City of Industry, CA 91748".
   *
   * IT IS NOT RECOMPUTED HERE, AND THAT IS DELIBERATE. The locator does
   * not document whether it reports straight-line or driving distance,
   * and reconstructing it from these coordinates does not reproduce the
   * published figures — which is itself evidence it is a road distance.
   * So the number is carried as a quotation from the source, named as
   * such on screen, and never mixed with the haversine miles this app
   * computes from the wholesaler. Two distances, two names, two sources.
   * Averaging them or letting one overwrite the other is how a map ends
   * up confidently wrong.
   */
  locatorMiles?: number;
  addressSource: string;
  provenance: Record<string, Provenance>;
}

export type DistributionStatus =
  /** Authorized and physically present. This is a POD. */
  | "distributed"
  /** Authorized but not on the shelf. This is where the money is. */
  | "void"
  /** Not authorized by the chain for this store. Not a gap, a different problem. */
  | "not-authorized"
  /** Was carried, has been delisted. */
  | "discontinued";

export type InventoryState = "in-stock" | "low" | "out-of-stock" | "unknown";

/**
 * How an inventory state was learned. A supplier cannot see a retailer's
 * inventory system, so a live feed would be a lie. A real DSE learns
 * about an out-of-stock from a store walk, from a distributor rep, or by
 * inferring it from depletion velocity against the expected reorder
 * cycle. Naming the source is more credible than faking the feed.
 */
export type InventorySource =
  | "observed"
  | "distributor-reported"
  | "modeled"
  | "unknown";

/**
 * THE FACT TABLE. One row per (account, sku, period).
 *
 * PODs, voids, shelf share, opportunity, and every generated issue are
 * selectors over this. Nothing downstream is stored: change one row here
 * and the map, the Action Center, and the plan all recalculate. That
 * property is demonstrable live, and it is the difference between a
 * prototype with a data model and a prototype with hardcoded screens.
 */
export interface AccountSkuStatus {
  accountId: string;
  skuId: string;
  periodId: string;
  status: DistributionStatus;
  facings?: number;
  coldBoxDoors?: number;
  shelfPricePoint?: number;
  inventoryState: InventoryState;
  inventorySource: InventorySource;
  inventoryObservedAt?: string;
  /** Modeled weekly depletion at this account for this SKU. */
  baseWeeklyCases: number;
  confidence: Confidence;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Promotion and execution
// ---------------------------------------------------------------

/**
 * Note what is NOT here: there is no discount paid to a retailer.
 * `distributorAllowancePerCase` is a supplier-to-wholesaler depletion
 * allowance, which is the tier where it is lawful. The retail side of a
 * promotion is an execution requirement the distributor's reps pursue,
 * not money changing hands with a store.
 */
export interface Promotion {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  distributorAllowancePerCase: number;
  retailExecutionRequirement?: string;
  expectedLiftPercent: number;
  investment: number;
  modeledROI: number;
  provenance: Provenance;
}

export interface ExecutionCommitment {
  placement: PlacementType;
  recommendedLocation: string;
  facings?: number;
  displayCount?: number;
  posMaterials: string[];
  adFeature?: string;
  /** A role, never a person. No invented names anywhere in this app. */
  ownerRole: string;
  executionNotes?: string;
  confirmedAt?: string;
}

export interface VolumeEstimate {
  baseWeeklyCases: number;
  promotionalWeeklyCases: number;
  incrementalCases: number;
  confidence: Confidence;
  /** The arithmetic, shown to the user rather than hidden behind a number. */
  calculation: string[];
  provenance: Provenance;
}

export interface VolumeGoal {
  brandId: string;
  periodId: string;
  goalCases: number;
  provenance: Provenance;
}

// ---------------------------------------------------------------
// Notes and activity  (removed)
// ---------------------------------------------------------------

/**
 * AccountNote, NoteType, ActivityEvent and ActivityEventType lived here
 * and described an activity feed that was never built. They also held the
 * last reference to the deleted `IssueStatus`, which is how a dead block
 * keeps another dead block alive: nothing imported either of them, but
 * each made the other look load-bearing.
 *
 * The app does record what happened — the sent log at /sent is an
 * activity feed, and the issue register carries dispositions. Both store
 * exactly what they need where they need it, rather than through a
 * general-purpose event type nobody instantiated.
 */

// ---------------------------------------------------------------
// The plan: two ledgers
// ---------------------------------------------------------------

export type Ledger = "sell-in" | "retail-execution";

/**
 * A sell-in line is what Ole Smoky commits to ship to Southern Glazer's. It has
 * money on it because that transaction is between supplier and
 * wholesaler.
 */
export interface SellInLine {
  id: string;
  ledger: "sell-in";
  /**
   * Which action put this line here. Lines committed by sending an order
   * carry the same source, so re-sending a revised order REPLACES the old
   * commitment instead of stacking a second one beside it. A rep who
   * emails Southern Glazer's a corrected order has superseded the first, not ordered
   * twice, and the ledger has to agree with that.
   */
  source?: string;
  skuId: string;
  cases: number;
  /** Derived from PackageFormat.casesPerPallet. Never typed. */
  pallets: number;
  illustrativePricePerCase: number;
  promotionId?: string;
  deliveryWeek: string;
  notes?: string;
  sortOrder: number;
}

/**
 * A retail line is what the distributor's reps will pursue in a store.
 * It carries cases and execution, and deliberately carries no money.
 */
export interface RetailExecutionLine {
  id: string;
  ledger: "retail-execution";
  /** See SellInLine.source. Same replace-on-resend rule. */
  source?: string;
  accountId: string;
  skuId: string;
  cases: number;
  pallets: number;
  commitment: ExecutionCommitment;
  promotionId?: string;
  deliveryWeek: string;
  /** Set when this line closes a known void. Drives the POD math. */
  closesVoid: boolean;
  notes?: string;
  sortOrder: number;
}

export type PlanLine = SellInLine | RetailExecutionLine;

export type PlanGrouping = "account" | "sku" | "delivery-week" | "none";

/**
 * `Scenario` lived here — a named, saveable what-if. The territory state
 * carries a `scenarioName` and nothing ever saved a second one, so the
 * type described an intention rather than a feature. Dropped; if scenarios
 * come back they will come back with storage behind them.
 */


export interface PlanTotals {
  accounts: number;
  uniqueSkus: number;
  totalCases: number;
  totalPallets: number;
  podsAdded: number;
  voidsClosed: number;
  illustrativeGross: number;
  allowanceTotal: number;
  illustrativeNet: number;
  /**
   * What the sell-in has to be to cover the retail promises, priced at
   * list. A requirement, deliberately not folded into the booked figures.
   */
  requiredSellInValue: number;
  requiredAllowance: number;
  requiredNet: number;
  baseWeeklyCases: number;
  incrementalWeeklyCases: number;
  modeledROI: number;
  displayCount: number;
  coldBoxCount: number;
  endcapCount: number;
}

// ---------------------------------------------------------------
// Communication (Demo Mode only)
// ---------------------------------------------------------------

/**
 * Recipients are constrained by the type system rather than validated at
 * runtime. Every mailbox in this app has to match `*@demo-*.local`, and
 * `.local` is a reserved, unroutable TLD, so a real address will not
 * compile into a recipient field. There is also no email transport
 * anywhere in the dependency tree. Demo Mode is structural, not a promise.
 *
 * This started as a five-member union. Once every retail account got its
 * own order desk on file, an enumeration would have meant hand-editing
 * this file for every store added, and the thing worth constraining was
 * never the local part of the address. It was the domain.
 */
export type DemoRecipient = `${string}@demo-${string}.local`;

/**
 * A retail order desk. A role, never a person, and never a real mailbox.
 * Store buyers are real people with real jobs, so the app addresses the
 * function rather than inventing someone to address.
 */
export interface RetailContact {
  email: DemoRecipient;
  role: string;
}

/**
 * EmailTemplateId, EmailDraft, PortalRequest and PortalResponse were the
 * first design of the messaging layer, and every one of them was
 * superseded by something narrower that actually shipped.
 *
 *   Drafts now live in lib/email/templates.ts, computed from the order
 *   rather than stored as records.
 *   The built message is `BuiltEmail`, which knows the difference between
 *   a body and an attachment.
 *   A store's reply is a `SentMessage` outcome in the outbox.
 *
 * The old `EmailTemplate` interface here also collided by name with the
 * live one in templates.ts, which is the same hazard the Action Center
 * types created: two shapes, one word, nothing saying which is real.
 */

// ---------------------------------------------------------------
// Store visit  (removed)
// ---------------------------------------------------------------

/**
 * StoreVisit and VisitChecklistItem described a visit-logging screen that
 * was never built. What shipped instead treats a visit as its OUTPUT — an
 * order on the desk, a message in the sent log, a disposition on an issue
 * — rather than as a form somebody fills in afterwards. That is the better
 * model for this job: nobody has ever enjoyed writing up a call report,
 * and a tool whose record only exists if a tired person types it is a tool
 * with no record.
 */
