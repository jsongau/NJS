import type {
  ActivityType,
  DayPart,
  EmailConfidence,
  PackageFamily,
  PitchStatus,
  ReplyDisposition,
} from "@/domain/types";

/**
 * ONE VOCABULARY FOR THE WHOLE APPLICATION.
 *
 * WHY THIS FILE EXISTS. A reader walks through five screens of this app
 * in a single session. They see a prospect on the desk, find the same
 * prospect on the map, open the lane board, look at the week sheet and
 * then read the reply that came back. If the fact "we have spoken to
 * them and they are interested" is called "conversation" on one screen,
 * "In conversation" on the next, "Live" on a chart axis and "Talking" on
 * a chip, the reader does not conclude that four teams built four
 * screens. They conclude that the model underneath is vague, and once
 * they think that, every number on every screen is worth less.
 *
 * In the build this was forked from, that is exactly what happened, and
 * the failure was never a crash. It was a legend that said one thing and
 * a table that said another, and a filter that quietly disagreed with
 * both because whoever wrote the ternary listed the four values they
 * happened to remember.
 *
 * So every enumerable value in the domain is named exactly once, here,
 * with the three things a component needs to render it honestly:
 *
 *   GLYPH   a shape, so the value survives greyscale and colour blindness
 *   LABEL   the word, so the value survives a shape nobody recognises
 *   CSSVAR  the colour, which is the third signal and never the first
 *
 * THE THREE SIGNAL FAMILIES ARE DELIBERATELY DIFFERENT SHAPES, and that
 * is the part worth stopping on. Progress through the pipeline is drawn
 * as a FILLING CIRCLE, from an empty ring to a solid disc, because
 * progress is a quantity. A prospecting lane is drawn as a POINTED or
 * SQUARE mark, because a lane is a category with two classes in it. A
 * package family is drawn as a PATTERNED SQUARE, because family is a
 * property of the thing being sold rather than a state of the deal.
 * A reader who cannot tell green from amber can still read every one of
 * those distinctions off the page, which is the requirement.
 *
 * Nothing in here invents anything about DIME. These are names for
 * states inside this tool, not claims about the company.
 */

export interface StatusToken {
  /** Shape before hue, always. The row is readable in greyscale. */
  glyph: string;
  label: string;
  cssVar: string;
  /** One sentence a tooltip or a legend can carry. Optional by design. */
  note?: string;
}

// ---------------------------------------------------------------
// Pitch status
// ---------------------------------------------------------------

/**
 * Where a prospect stands on a package.
 *
 * THE GLYPHS ARE A FILLING CIRCLE and that is the whole design. An empty
 * ring becomes a quarter, a half, three quarters, a solid disc. Six
 * statuses drawn as six unrelated icons is six things to memorise; six
 * statuses drawn as one circle filling up is a progress bar the reader
 * already understands before anybody explains it, and it degrades
 * perfectly to black and white, to a fax, to a printout on a GM's desk.
 *
 * "lost" breaks the sequence on purpose. It is not a further stage of
 * filling, it is the sequence stopping, so it gets the one glyph in the
 * set that is not a circle at all.
 */
export const PITCH_STATUS: Record<PitchStatus, StatusToken> = {
  unworked: {
    glyph: "○",
    label: "Unworked",
    cssVar: "var(--neutral)",
    note: "Never contacted about this package. Before a venue opens, this is where most of the trade area sits, and it is the honest default rather than an embarrassment.",
  },
  "reached-out": {
    glyph: "◔",
    label: "Reached out",
    cssVar: "var(--info)",
    note: "Contacted, nothing back yet. Worth a second touch and then a visit, never a fourth email.",
  },
  conversation: {
    glyph: "◑",
    label: "In conversation",
    cssVar: "var(--info)",
    note: "They replied and they want to talk. The only state in this list where the next move belongs to us rather than to them.",
  },
  "soft-hold": {
    glyph: "◕",
    label: "Date held",
    cssVar: "var(--warn)",
    note: "A date is held and nothing is signed. Amber because a hold is worth nothing until it converts, and it blocks the date meanwhile.",
  },
  booked: {
    glyph: "●",
    label: "Booked",
    cssVar: "var(--ok)",
    note: "Signed with a deposit taken. This is the only status in this list that is revenue.",
  },
  lost: {
    glyph: "✕",
    label: "Lost",
    cssVar: "var(--risk)",
    note: "They said no, or they went elsewhere. Recorded rather than hidden, because a lane full of quiet losses is a finding.",
  },
};

/**
 * The same six, for a dense row where the full label will not fit.
 *
 * These are the words a rep would actually say out loud, not truncations
 * of the words above. "In conversation" clipped to "In conver..." tells a
 * reader nothing; "Live" tells them everything, and the full label is
 * still on the tooltip and the aria label wherever there is room for it.
 */
export const PITCH_STATUS_SHORT: Record<PitchStatus, StatusToken> = {
  unworked: { glyph: "○", label: "New", cssVar: "var(--neutral)" },
  "reached-out": { glyph: "◔", label: "Touched", cssVar: "var(--info)" },
  conversation: { glyph: "◑", label: "Live", cssVar: "var(--info)" },
  "soft-hold": { glyph: "◕", label: "Held", cssVar: "var(--warn)" },
  booked: { glyph: "●", label: "Booked", cssVar: "var(--ok)" },
  lost: { glyph: "✕", label: "Lost", cssVar: "var(--risk)" },
};

/** The order the six are shown in, everywhere. Weakest to strongest. */
export const PITCH_STATUS_ORDER: PitchStatus[] = [
  "unworked",
  "reached-out",
  "conversation",
  "soft-hold",
  "booked",
  "lost",
];

// ---------------------------------------------------------------
// Email confidence
// ---------------------------------------------------------------

/**
 * How an organisation can actually be reached in writing.
 *
 * NOTE THE COLOUR ON "none", BECAUSE IT IS A JUDGEMENT AND NOT AN
 * OVERSIGHT. The obvious thing to do is paint it red: an organisation
 * with no published email costs an hour of driving rather than two
 * minutes of typing, and the desk scores it lowest for exactly that
 * reason. But red says "something has gone wrong here", and nothing has.
 * An organisation with a front desk and no inbox is a GO-SEE, which is
 * the first activity the job posting names. Painting the core of the job
 * as a fault would be the tool arguing against its own plan.
 */
export const EMAIL_CONFIDENCE: Record<EmailConfidence, StatusToken> = {
  verified_public: {
    glyph: "◆",
    label: "Published email",
    cssVar: "var(--ok)",
    note: "Read off the organisation's own page, and the row carries the URL it was read from. A written touch costs two minutes.",
  },
  form_only: {
    glyph: "◇",
    label: "Form only",
    cssVar: "var(--warn)",
    note: "No address published. A contact form is the only written door, and it lands in a queue somebody may or may not read.",
  },
  none: {
    glyph: "▲",
    label: "No written door",
    cssVar: "var(--neutral)",
    note: "Phone or a visit, and nothing else. Not a gap in the research; this is what a go-see is for.",
  },
};

// ---------------------------------------------------------------
// Outbound activity
// ---------------------------------------------------------------

/**
 * The six kinds of outbound work.
 *
 * THE COLOURS ENCODE ONE DISTINCTION AND ONLY ONE: whether the work
 * happens outside the building. The job posting's first daily
 * responsibility is outbound activity "outside the building, including
 * tabling, networking events, and go-sees", and those four carry the
 * activity ledger's own colour. A call block and an email sequence are
 * real outbound work, they are counted honestly, and they are grey,
 * because a week that hits its hours target from a chair has not done
 * the thing the posting asked for. The Book page separates the same two
 * groups arithmetically; this is that separation made visible.
 */
export const ACTIVITY_TYPE: Record<ActivityType, StatusToken> = {
  tabling: {
    glyph: "▤",
    label: "Tabling",
    cssVar: "var(--ledger-activity)",
    note: "A table set up somewhere other than the venue. A lobby at lunchtime, a campus quad, a chamber breakfast.",
  },
  "networking-event": {
    glyph: "◉",
    label: "Networking event",
    cssVar: "var(--ledger-activity)",
    note: "A chamber mixer, an association meeting, a school board night. A room containing several lanes at once.",
  },
  "go-see": {
    glyph: "◆",
    label: "Go-see",
    cssVar: "var(--ledger-activity)",
    note: "Turning up at a prospect's place of business. The only route into an organisation that publishes no written door.",
  },
  "venue-tour": {
    glyph: "▦",
    label: "Venue tour",
    cssVar: "var(--ledger-activity)",
    note: "A walk of the building. Worth almost nothing before there is a building, and worth a great deal the week there is.",
  },
  "call-block": {
    glyph: "◐",
    label: "Call block",
    cssVar: "var(--neutral)",
    note: "An hour of cold calls. Cheap, low yield, counted honestly, and not the thing the job posting asked for first.",
  },
  "email-sequence": {
    glyph: "▭",
    label: "Email sequence",
    cssVar: "var(--neutral)",
    note: "A step in a written sequence. Scales further than anything else here and persuades less than any of it.",
  },
};

/** Reading order: the work outside the building leads, because it does. */
export const ACTIVITY_TYPE_ORDER: ActivityType[] = [
  "tabling",
  "go-see",
  "networking-event",
  "venue-tour",
  "call-block",
  "email-sequence",
];

// ---------------------------------------------------------------
// Replies
// ---------------------------------------------------------------

/**
 * What came back.
 *
 * "no-reply" is in this list deliberately. Silence is the most common
 * outcome of any cold outreach and a replies screen that only shows
 * replies is a screen that flatters the sender. Recording it as a
 * disposition means the ratio at the top of the page is honest, and it
 * means the app can say the useful thing out loud: two emails and then a
 * visit is the sequence, four emails is a spam folder.
 */
export const REPLY_DISPOSITION: Record<ReplyDisposition, StatusToken> = {
  "meeting-set": {
    glyph: "●",
    label: "Meeting set",
    cssVar: "var(--ok)",
    note: "A date in a diary with a person in it. The only reply that has moved anything.",
  },
  "asked-for-info": {
    glyph: "◑",
    label: "Asked for information",
    cssVar: "var(--info)",
    note: "Interested and not committed. This is where a gated corporate price becomes the whole conversation.",
  },
  "not-now": {
    glyph: "◔",
    label: "Not now",
    cssVar: "var(--warn)",
    note: "A real answer with a date attached to it. Diary the window, not the follow-up.",
  },
  "wrong-person": {
    glyph: "◈",
    label: "Wrong person",
    cssVar: "var(--neutral)",
    note: "Useful. It costs a touch and it buys the name of the door that actually opens.",
  },
  no: {
    glyph: "✕",
    label: "No",
    cssVar: "var(--risk)",
    note: "A no to this occasion is rarely a no to the organisation. Read what they left open.",
  },
  "no-reply": {
    glyph: "○",
    label: "No reply",
    cssVar: "var(--text-3)",
    note: "The most common outcome of cold outreach anywhere. Counted, because a replies page that hides silence is a page that flatters the sender.",
  },
};

// ---------------------------------------------------------------
// Package families
// ---------------------------------------------------------------

export interface FamilyToken {
  label: string;
  /**
   * Family carries a glyph for the same reason status does. The rule in
   * this codebase has no exceptions: colour is never the only signal,
   * and a legend keyed only by swatch is a bug.
   */
  glyph: string;
  cssVar: string;
  tintVar: string;
  /** What this family means commercially, in one sentence. */
  note: string;
}

/**
 * The five package families.
 *
 * THIS IS THE ONE PIECE OF COLOUR IN THE APP THAT ENCODES DATA RATHER
 * THAN STATUS, and it earns that because family drives the commercial
 * argument rather than describing progress. A week's book that is
 * entirely youth group at a glance is a real read: the rooms are full and
 * the revenue is not.
 *
 * The glyphs are PATTERNED SQUARES, distinct from the pointed and solid
 * lane marks and from the filling circles of pitch status. A reader
 * scanning a dense row can tell at a glance which system a mark belongs
 * to before they work out which value it is, which is the difference
 * between a legend you have to consult and one you do not.
 *
 * The notes below describe published behaviour and nothing more. The
 * corporate family is unpriced because dimeindustries.com publishes no price
 * for it, not because this app decided to withhold one.
 */
export const PACKAGE_FAMILY: Record<PackageFamily, FamilyToken> = {
  corporate: {
    label: "Corporate",
    glyph: "▣",
    cssVar: "var(--fam-corporate)",
    tintVar: "var(--fam-corporate-tint)",
    note: "Unpriced on dimeindustries.com and gated behind a person at the venue. This family holds the one package DIME publishes, and it is the reason the role exists.",
  },
  "youth-group": {
    label: "Youth group",
    glyph: "▥",
    cssVar: "var(--fam-youth-group)",
    tintVar: "var(--fam-youth-group-tint)",
    note: "School and youth programmes. Daytime, high volume, low margin, and loyal for as long as the school exists.",
  },
  "self-serve": {
    label: "Self-serve",
    glyph: "▨",
    cssVar: "var(--fam-self-serve)",
    tintVar: "var(--fam-self-serve-tint)",
    note: "Priced and published, so it books itself on a phone at night without anybody's help. Grad packs, birthdays, vouchers.",
  },
  buyout: {
    label: "Buyout",
    glyph: "▩",
    cssVar: "var(--fam-buyout)",
    tintVar: "var(--fam-buyout-tint)",
    note: "The whole building, or a locked-in wing of it. The largest single bookings there are and the ones that consume a date entirely.",
  },
  fundraiser: {
    label: "Fundraiser",
    glyph: "▧",
    cssVar: "var(--fam-fundraiser)",
    tintVar: "var(--fam-fundraiser-tint)",
    note: "A community door-opener before it is a sale, and the group brings its own crowd. DIME publishes no fundraiser programme, so this family currently holds nothing, and the empty family is itself the finding.",
  },
};

/**
 * The order families are shown in, everywhere.
 *
 * CORPORATE LEADS, and that is commercial rather than alphabetical. The
 * gated, unpriced family is the one a sales manager exists to sell, so it
 * sits first on every board. Self-serve sits third because it needs
 * nobody: those packages sell themselves off the website whether this
 * app exists or not.
 *
 * data/packages.ts re-exports this rather than declaring its own. Two
 * files with an opinion about the order of five values is exactly the
 * drift this vocabulary file was written to stop.
 */
export const PACKAGE_FAMILY_ORDER: PackageFamily[] = [
  "corporate",
  "youth-group",
  "self-serve",
  "buyout",
  "fundraiser",
];

// ---------------------------------------------------------------
// Day parts
// ---------------------------------------------------------------

/**
 * When a package is allowed to run, in words.
 *
 * THIS IS THE CASE THIS FILE OPENS BY DESCRIBING, caught in the act. The
 * map lived in the prospect drawer with a comment saying it belonged
 * here the moment a second screen needed it. A second screen then needed
 * it, the detail pane on the expanded map, and rather than move it the
 * pane took a copy and left a comment of its own explaining that it was
 * a copy. Two files, one fact, and both of them honest about it, which
 * is how the same thing ends up with four names across four screens
 * without anybody ever making a bad decision.
 *
 * So it moves. It is keyed by the `DayPart` union rather than by string,
 * which means a sixth day part cannot be added to the domain without the
 * build stopping here and asking what it is called.
 *
 * These are the operator's words, for a chip or a table cell beside a
 * package. `QuotePage` deliberately keeps a longer set of its own
 * because a customer-facing quote says "Weekdays, during the day" rather
 * than "Weekday daytime", and that is a different job from this one
 * rather than a third copy of it. The published restriction itself is
 * never paraphrased anywhere: it comes through verbatim from the
 * package's own `dayPartNote`.
 */
export const DAY_PART_LABEL: Record<DayPart, string> = {
  "weekday-daytime": "Weekday daytime",
  "weekday-evening": "Weekday evening",
  weekend: "Weekend",
  "after-close": "After close",
  any: "Any day part",
};

// ---------------------------------------------------------------
// Ledgers
// ---------------------------------------------------------------

/**
 * The two ledgers, named once.
 *
 * They are never summed, never charted on one axis and never given the
 * same colour, because a young pipeline report is precisely where hours
 * out of the building get quietly dressed up as results.
 */
export const LEDGER = {
  "booked-revenue": {
    glyph: "●",
    label: "Booked revenue",
    cssVar: "var(--ledger-revenue)",
    note: "Signed contracts with deposits against them. This ledger carries money.",
  },
  "outbound-activity": {
    glyph: "▤",
    label: "Outbound activity",
    cssVar: "var(--ledger-activity)",
    note: "Tabling, go-sees, networking and calls. This ledger carries hours and no money at all.",
  },
} as const satisfies Record<string, StatusToken>;
