import type { BrandFamily } from "@/domain/types";
import type { LineUrgency } from "@/domain/selectors/orderDesk";

/**
 * One vocabulary for the whole app.
 *
 * The same state used to be called "Off the shelf" on the order desk,
 * "Out at multiple accounts" in the distributor portal, "empty" in the
 * account drawer and "off the shelf" on the store index. Four names for
 * one fact, on four screens a single person walks through in one
 * session. That is not a style problem, it is the reader quietly
 * concluding they are looking at four different prototypes.
 *
 * Glyph, word and colour are declared together here, deliberately. A
 * status must never arrive at a component with a colour but no glyph,
 * which is how colour-only encoding creeps back in.
 */

export interface StatusToken {
  /** Shape first. This is the signal a colourblind reader gets. */
  glyph: string;
  /** Words second. This is the signal everyone gets. */
  label: string;
  /** Colour third, and only ever as reinforcement. */
  cssVar: string;
}

export const URGENCY: Record<LineUrgency, StatusToken> = {
  critical: { glyph: "▲", label: "Off the shelf", cssVar: "var(--risk)" },
  high: { glyph: "◆", label: "Running short", cssVar: "var(--warn)" },
  new: { glyph: "＋", label: "Approved, not stocked", cssVar: "var(--accent)" },
  watch: { glyph: "○", label: "Holding", cssVar: "var(--text-3)" },
};

/** The short form, for a chip inside a dense row. Same words, trimmed. */
export const URGENCY_SHORT: Record<LineUrgency, string> = {
  critical: "empty",
  high: "short",
  new: "not carried",
  watch: "holding",
};

export const LEAD_TIME: Record<"stock" | "short" | "standard", StatusToken> = {
  stock: { glyph: "●", label: "In stock", cssVar: "var(--ok)" },
  short: { glyph: "◐", label: "Short lead, about 1 week", cssVar: "var(--accent)" },
  standard: { glyph: "○", label: "Standard lead, 2 to 3 weeks", cssVar: "var(--warn)" },
};

/**
 * Brand family, which is the one piece of colour in this app that
 * encodes data rather than status.
 *
 * It earns that because family drives the whole commercial argument:
 * core defends volume, above-premium carries margin, flavour recruits
 * new drinkers. Seeing an order that is entirely core at a glance is a
 * real read. The label ships beside the swatch everywhere, so the colour
 * is an accelerant, not the message.
 */
export const FAMILY: Record<BrandFamily, { label: string; cssVar: string; tintVar: string; note: string }> = {
  core: {
    label: "Core",
    cssVar: "var(--fam-core)",
    tintVar: "var(--fam-core-tint)",
    note: "Defends the volume base",
  },
  "above-premium": {
    label: "Whiskey",
    cssVar: "var(--fam-above-premium)",
    tintVar: "var(--fam-above-premium-tint)",
    note: "Carries the margin",
  },
  economy: {
    label: "Cream and liqueur",
    cssVar: "var(--fam-economy)",
    tintVar: "var(--fam-economy-tint)",
    note: "Holds price-point shelf",
  },
  flavor: {
    label: "Flavour",
    cssVar: "var(--fam-flavor)",
    tintVar: "var(--fam-flavor-tint)",
    note: "Recruits new drinkers",
  },
  "rtd": {
    /*
      This said "Non-alc" until now, which was a beer-era label left on a
      spirits family — and it was not a loose word, it was a false claim
      about a 4.5% ABV canned cocktail. The family id was renamed when
      the portfolio moved; the LABEL was missed, because a label is not
      an identifier and nothing breaks when it is wrong.
    */
    label: "Ready to drink",
    cssVar: "var(--fam-rtd)",
    tintVar: "var(--fam-rtd-tint)",
    note: "Fastest growing segment",
  },
};

/**
 * The order families are shown in, everywhere.
 *
 * READY TO DRINK LEADS, and that is a commercial decision rather than an
 * alphabetical accident. It used to sit last, which was the beer build's
 * ordering — the slot was `non-alc` then, and last was where it
 * belonged. For a spirits portfolio in 2026 the canned line is the
 * growth engine and the newest thing the distillery makes, so it is the
 * first thing a buyer should see and the first thing a rep should be
 * asked about. Core follows it, because core is what pays for the shelf
 * the rest of the range sits on.
 *
 * It lives here rather than in the portfolio page because the page was
 * not the only screen with an opinion about family order, and two
 * screens disagreeing about which product leads is exactly the kind of
 * incoherence this file exists to prevent.
 */
export const FAMILY_ORDER: BrandFamily[] = [
  "rtd",
  "core",
  "above-premium",
  "flavor",
  "economy",
];
