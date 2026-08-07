/**
 * What I would train Southern Glazer's sales team on.
 *
 * WHY THIS PAGE EXISTS. A Distributor Sales Executive does not sell
 * twenty seven doors. They sell one wholesaler, and that wholesaler's
 * sales force sells the doors. Southern Glazer's calls on roughly 13,960 retail
 * accounts with 1,510-plus people; Territory 12 is twenty seven of those
 * accounts. Anything I do with my own hands caps out at twenty seven. Anything
 * a Southern Glazer's rep learns to do carries across their whole route, every week,
 * whether or not I am standing there.
 *
 * That is the entire argument for training being part of the job rather
 * than a nice-to-have, and it is why the posting lists it as a bullet.
 *
 * WHAT THIS ROSTER IS, BECAUSE IT DECIDES WHAT THE HOUR CONTAINS. Twelve
 * retail doors and fifteen bars and restaurants. The retail half is eight
 * owner-operated liquor stores, a neighbourhood market, a convenience
 * store, a fuel forecourt and one beverage specialist. The on-premise
 * half is casual dining, sports bars, two steakhouses, a bowling centre
 * and three pubs. Fifteen of the twenty seven are independents, which
 * means most of the decisions in this territory are made by the person
 * standing in front of the rep.
 *
 * WHAT A SPIRITS BRIEF HAS TO CARRY THAT A BEER BRIEF DID NOT. Beer is
 * sold on occasion and pack size. Spirits are sold on proof, format and
 * shelf adjacency, and a rep who gets any of the three wrong is not
 * slightly off, they are in the wrong aisle. Blue Flame at 128 proof and
 * Blackberry at 40 proof are not two versions of one pitch; the 750ml
 * mason jar and the 50ml mini are not two sizes of one decision. So every
 * brief below names the proof or the format it turns on, because that is
 * the sentence a rep will be asked to defend in front of a buyer.
 *
 * AND ONE MORE THING ON THE ON-PREMISE HALF: THE UNIT CHANGES. A bottle
 * shop buys cases and sells bottles. A bar buys cases and sells POURS,
 * and a 750ml bottle is about sixteen of them, so a case is close to two
 * hundred drinks. Every ask made at a bar in this file has had that
 * arithmetic done to it first, because a rep who has not done it will ask
 * a pub for a year of stock and never get the call answered again.
 *
 * WHAT IS SOURCED AND WHAT IS NOT. Every brand position below traces to
 * Ole Smoky's own published commercial posture, carried through from
 * brands.ts with its source. The objections are ordinary trade objections
 * and are labelled illustrative. The session plan is mine. Nothing here
 * claims to be an Ole Smoky training document.
 */

export interface Competency {
  id: string;
  name: string;
  /** What a rep can do afterwards that they could not do before. */
  outcome: string;
  /** How it is taught. Hands-on, in a store, not a slide. */
  method: string;
  /** How you know it landed. A number, not a feeling. */
  evidence: string;
}

/**
 * Five skills, and the order matters: read the set, then argue from it,
 * then pick the right format, then know what you may lawfully say, then
 * close. A rep who closes before they can read a shelf run or a back bar
 * is guessing.
 */
export const COMPETENCIES: Competency[] = [
  {
    id: "read-the-shelf",
    name: "Read a shelf run, or a back bar, in sixty seconds",
    outcome:
      "Walk a spirits set and name, without a scanner, which facings are earning nothing, which jar has been sitting long enough to gather dust on the shoulder, and which item goes empty over a weekend and gets reordered a week late. In a convenience store or on a forecourt, read the counter and the shelf behind the register the same way — that is a set, not storage. At a bar the same minute buys three separate facts: how many faces the back bar actually has, what is in the well, and whether we appear anywhere on the printed drinks menu.",
    method:
      "In the account, on their own route. Count facings, read the shelf tag against what is behind it, and divide by what the door moves in a week. Two facings of a 750ml jar turning six units is a shelf about to go short. Three accounts together, then they lead the fourth and I say nothing. On the on-premise half the count is bottles rather than cases, because a bar orders in bottles and thinks in drinks.",
    evidence:
      "Days of back-shelf cover on the accounts they called. It moves because they are ordering ahead of the gap instead of behind it.",
  },
  {
    id: "the-void",
    name: "Open a void without asking for space",
    outcome:
      "Turn an item the account already knows into an order without asking anyone for new space. At the independents there is no banner and no listing to chase — the owner is behind the counter, and a yes takes one conversation rather than one quarter. At a bar the void is usually a placement rather than a brand: we are on the back bar and not in the well, or on the back bar and not on the menu, and those are three different asks with three different answers.",
    method:
      "Pull what the account has actually bought over the last quarter against what is physically on the shelf or the back bar. In spirits the void hides in the second format more often than in the brand — the 750 is there and the 1L or the 375 was bought once and never repeated. At the chain doors the item is already approved centrally, so there is still nothing to list; there is a manager nobody has asked. The gap is the script. Practise the opening line out loud before we walk in, and carry the number with you, because an owner who can decide in a minute will decide in a minute and a rep still reaching for a figure has wasted it.",
    evidence:
      "Points of distribution added, and the share of them that were voids reopened rather than genuinely new placements. Voids are the cheap half and most reps never work them.",
  },
  {
    id: "package-first",
    name: "Sell the format, not the flavour",
    outcome:
      "Recommend the format the channel actually turns — a 50ml mini on a forecourt counter, a 375ml on the shelf behind a convenience register, a 750ml jar in a liquor-store shelf run, a 1.75L handle onto a specialist floor or into a sports-bar well — instead of leading with whichever flavour they like drinking. On-premise the same decision is about who sees the bottle: the jar earns a back-bar face because a guest reads it from the stool, and the handle belongs in the well precisely because nobody does.",
    method:
      "One brand, four formats, four kinds of door. Salty Caramel is the only item that exists in all of them, which is why it is the teaching brand. Have them place each format and defend it. Putting the handle on a forecourt counter teaches faster than getting it right first time.",
    evidence:
      "Rate of sale on newly placed items after four weeks. A format that fits the channel turns; one that does not comes back as a credit.",
  },
  {
    id: "three-tier-line",
    name: "Know which sentence belongs to whom",
    outcome:
      "Say the things a wholesaler's rep may lawfully say to a retailer, and recognise the things a supplier may not — price, discount, anything that reads as payment for shelf space or for a back-bar face. And know the merchandising half: under 27 CFR 6.84 you may hand an owner a case card or a bar manager a table tent, and you may not pay them, or credit them, for putting it up. A bar is a retailer for this purpose, which is the part reps get wrong first.",
    method:
      "Fifteen minutes, no slides. Real sentences sorted into allowed and not allowed. Section 6.84 gets read out once in full, because it is short and because everybody in the room assumes it says something more generous than it does. The uncomfortable ones are the point.",
    evidence:
      "Nothing to measure, and that is the intent. This one exists so a good quarter does not turn into a tied-house problem.",
  },
  {
    id: "the-close",
    name: "Ask for the order in one sentence",
    outcome:
      "End a call with a decision rather than a maybe: a number, a delivery date, and a question the manager can answer in one word. The number has to be in the unit the account thinks in — cases at a bottle shop, bottles and pours at a bar.",
    method:
      "Write the sentence before the visit. Do the arithmetic before you write it: about sixteen pours to a 750ml bottle, so a case is close to two hundred drinks, and four cases into a pub is eight hundred. Say the sentence. Then stop talking, which is the part everybody fails.",
    evidence:
      "Share of calls that end in a committed case count rather than a follow-up. Tracked per rep, before and after.",
  },
];

export interface BrandBrief {
  brandId: string;
  /** The one line a rep says walking in. Not a pitch, a reason. */
  hook: string;
  /** Channel and package where it actually wins. */
  wins: string;
  /** What the manager says back. Ordinary, not a strawman. */
  objection: string;
  /** The answer, and it has to be true. */
  answer: string;
  /** What to ask for. Specific, small enough to say yes to. */
  ask: string;
}

/**
 * Seven briefs, which is what an hour actually supports. The rest of the
 * range is on the portfolio page and a rep can read it; a brief is for the
 * brands they will be argued with about.
 *
 * TWO ARE DELIBERATELY ABSENT. Cookies & Cream is a 35 proof cream
 * liqueur that does most of its year in the fourth quarter, and this
 * session sits in August — an hour spent on it is an hour not spent on
 * the items carrying the current gap, and it will need its own briefing
 * in October anyway. Sparkling Lemonade is absent for a harder reason:
 * the channel rights for a spirits-based can are set state by state and
 * are not the same as for a malt-based one, so a rep who repeats what I
 * say about it may be wrong in a way that lands on the buyer. Training a
 * team on a thing you are not certain of is how you lose them permanently.
 */
export const BRAND_BRIEFS: BrandBrief[] = [
  {
    brandId: "original-shine",
    hook: "The unflavoured 100 proof in the mason jar. This is the item that makes the rest of the shelf read as a brand rather than a flavour rack, so if it is out, everything next to it is worth less.",
    wins: "The beverage specialist and the deeper liquor stores, 750ml jar. Shelf position first, floor stack second. On a back bar the same jar does a different job — it is the one a guest recognises from the stool, so it earns its face by being looked at as much as by being poured. The 50ml mini works where the jar will never get a facing.",
    objection: "The flavours are what sell. The plain one just sits there.",
    answer:
      "It turns slower and it is bought differently. Nobody buys the unflavoured jar by accident — they came for the brand. Drop it and the set stops being a distillery and starts being seven sweet whiskies, which is a set your shopper can find anywhere. The flavours ride on this one being present.",
    ask: "Two facings of the 750 jar held through the reset. No new space, just do not let it be the one that goes.",
  },
  {
    brandId: "apple-pie",
    hook: "The highest-velocity single item in the range and the flavour a first-time buyer names without being prompted. Sold at 70 and 40 proof, so an account can carry the approachable version without giving up the tag.",
    wins: "Everywhere. 750ml jar through the liquor stores, the neighbourhood market and the specialist, 1L where the shelf takes it, 50ml mini on a convenience or forecourt counter. On-premise it is a menu ask before it is a back-bar ask, because it is the one a guest will order by name off a printed line without being sold it. The 250th Birthday Edition at 100 proof is the specialist's version of the same conversation.",
    objection: "I already carry one Ole Smoky flavour. That covers the brand.",
    answer:
      "It covers the brand for the shopper who already knows it. Apple Pie is the item that recruits the one who does not, which is why it is the fastest thing in the range and why every trade-up in this portfolio starts here. Carrying the range without the gateway is stocking the ending.",
    ask: "The 50ml mini onto the counter unit. Twelve units, four weeks, and I will come back with the movement. At a bar, one printed line instead.",
  },
  {
    brandId: "moonshine-cherries",
    hook: "Maraschino cherries steeped in 100 proof White Lightnin'. It is the most photographed thing the distillery makes, and it is bought on sight — which means it belongs at the register, not filed alphabetically in the set.",
    wins: "The liquor stores and the specialist, 750ml jar, on a counter or a secondary display near the till. In the set it is a slow SKU; in front of the register it is an impulse and gifting item. A back bar works for the same reason a counter does — it is the jar a guest points at, so it wants a lit face rather than a place in the well.",
    objection: "That is a novelty. It will sit on my shelf for a year.",
    answer:
      "On the shelf, probably. That is the point of the ask — it is not a shelf item, it is a counter item, and the difference is not decoration. Nobody walks in for cherries and everybody picks them up. Judge it on four weeks at the front of the store, not on twelve months in the middle of it.",
    ask: "Six jars on a branded counter unit for four weeks. Our rep builds it and refills it.",
  },
  {
    brandId: "tn-bourbon",
    hook: "Four years in barrel, 80 proof, and the credibility item. It is what lets a moonshine brand hold a conversation with a bourbon shopper without changing its voice.",
    wins: "The specialist and the deeper liquor stores, 750ml, in the bourbon set and not next to the jars — a rep who merchandises it with the flavoured range has thrown away the only thing it does. Its best on-premise home is the two steakhouses, where the check is higher, the turn is slower and the pour is expected to be brown. The flavoured range does not belong on that back bar at all.",
    objection: "My bourbon shelf is full and I do not need another Tennessee whiskey.",
    answer:
      "It is not asking to beat the two big Tennessee names and it will not. It is asking for one facing so that the shopper who takes moonshine seriously has somewhere to go, and so the rest of the range stops looking like confectionery. Accounts that carry it sell more of everything else we have.",
    ask: "One facing in the bourbon set at the autumn reset. Not in the flavour run. At a steakhouse, one back-bar face.",
  },
  {
    brandId: "salty-caramel",
    hook: "Sixty proof, and the widest format spread in the portfolio — the 50ml, the 375, the 750 and a 1.75L handle. Nobody buys a handle of something they tried once, so that breadth is a repeat-purchase number wearing a disguise.",
    wins: "375ml behind a convenience register, 750ml through the liquor stores and the neighbourhood market, the handle on the specialist floor and in a sports-bar or bowling-centre well where the pour is high volume and nobody ever sees the bottle. The 50ml mini is the trial device that feeds all of it.",
    objection: "Flavoured whiskey is a fad and I am not extending it.",
    answer:
      "Then look at the format spread rather than the flavour. A fad sells 750s to people trying it and never sells a handle. This one moves handles, which only happens when the same household buys it again, and the 375 is how a shopper who will not spend thirty dollars finds that out.",
    ask: "The 375ml onto the shelf behind the register. One facing at eye level, not the bottom rail.",
  },
  {
    brandId: "blackberry",
    hook: "Forty proof and fruit-forward. The lowest-proof item in the moonshine range, which is exactly why it has the broadest audience and the shortest walk to a ready-to-drink shopper.",
    wins: "The neighbourhood market and the flavour run in the liquor stores, 750ml jar, plus the 50ml mini on a convenience or forecourt counter. It sits in the set rather than on a stack — this is a shelf brand. On-premise it is the one a bartender reaches for when a guest says they do not really drink whiskey, which is why it earns a well position more easily than a menu line.",
    objection: "Forty proof is not really moonshine. My shoppers want the strong one.",
    answer:
      "Some of them do, and Blue Flame is there for them. This is the other half of the shelf: the shopper who is put off by 100 proof buys this or buys nothing from us. Carrying only the high end is choosing a smaller audience on purpose.",
    ask: "One facing in the flavour run, next to Apple Pie rather than at the end of it.",
  },
  {
    brandId: "blue-flame",
    hook: "128 proof, the strongest thing the distillery makes, and the smallest audience for it. It earns its facing by being the reason a particular shopper walks past three other stores to reach yours.",
    wins: "The specialist and the two or three liquor stores with the deepest set, 750ml jar. Destination item on a shelf, not a stack, and not a counter impulse. On a sports-bar or pub back bar it belongs in the lit row rather than the well: it is always a call and never a substitute, so hiding it costs the sale. The 50ml mini is how a curious shopper says yes without spending thirty dollars to find out.",
    objection: "That proof scares people off. It is not going to turn.",
    answer:
      "It is not meant to turn like Apple Pie, and if it did I would be worried about who was buying it. It is a traffic item — the shopper who wants it will not accept a substitute and will buy three other things while they are in. Losing them costs more than the facing does.",
    ask: "Hold the single facing and add the minis at the counter. The minis pay for the facing.",
  },
];

export interface SessionBlock {
  minutes: number;
  title: string;
  detail: string;
  /** Where it happens. A training session that never leaves a room fails. */
  place: "room" | "store" | "truck";
}

/**
 * Ninety minutes, and two thirds of it is not in a room.
 *
 * A wholesaler's team gives you one morning, once. Spending it on slides
 * is the single most common way suppliers waste the access they fought
 * for. The room is for the compliance block only, because that one has to
 * be precise and nobody should be distracted while it is said.
 *
 * The field hour is retail, for the ordinary reason that bars are shut at
 * nine in the morning. So the on-premise half is taught at the truck, with
 * the arithmetic and the three asks written down before the reps go and
 * make them on their afternoon calls.
 */
export const SESSION_PLAN: SessionBlock[] = [
  {
    minutes: 10,
    title: "The number and the gap",
    detail:
      "Period goal, where the territory sits against it, and the three brands carrying the difference. Then the split, because it changes every call on the list: twelve retail doors and fifteen bars and restaurants, and the second half is not a smaller version of the first. No history of the distillery, no slides about the company. Ten minutes.",
    place: "room",
  },
  {
    minutes: 15,
    title: "Which sentence belongs to whom",
    detail:
      "The three-tier block. Real sentences sorted into what a wholesaler's rep may say and what a supplier may not, plus 27 CFR 6.84 read out in full: material may be furnished, the retailer may not be paid or credited for using it — and a bar is a retailer for this purpose, table tent included. Done early, while everyone is still sharp.",
    place: "room",
  },
  {
    minutes: 35,
    title: "Walk two bottle shops",
    detail:
      "Their route, not mine. Read the shelf run, find the item the owner bought once and never repeated, and pick the format that fits the door — the mini and the 375 on a counter or a forecourt, the jar and the handle where there is floor. At an owner-operated store the person we are talking to is the person who decides, so the ask gets made standing there rather than written up for later. I lead the first, they lead the second.",
    place: "store",
  },
  {
    minutes: 20,
    title: "Write the close, both kinds",
    detail:
      "Each rep writes two sentences, for two real accounts, with real numbers in them: a case ask for a bottle shop, and one of the three on-premise asks — a back-bar face, a well position, or a printed menu line — for a bar on their afternoon list. Before the second one they do the arithmetic out loud: about sixteen pours to a 750ml bottle, so a case is near two hundred drinks. Said out loud. Corrected here, not in front of a customer.",
    place: "truck",
  },
  {
    minutes: 10,
    title: "What I owe you",
    detail:
      "What I will have ready before the next visit: the gap list per account, the format recommendation, the point-of-sale kit in the truck, a one-page back-bar card a bartender will actually read, and the order already cut. On-premise that briefing does more work than any point-of-sale material, and it is the cheapest thing on the list — a bartender who can describe the range sells it, and a table tent nobody reads does not. Training a team and then handing them nothing is how the second session gets cancelled.",
    place: "truck",
  },
];
