/**
 * THE TWENTY SECTIONS, AND THE ONE PLACE A PATH BECOMES ONE.
 *
 * tokens.css publishes three tokens for every navigation section:
 * --sec-<id> for the mark, --sec-<id>-ink for anything that carries
 * words, and --sec-<id>-glow for the wash behind them. Twenty sections,
 * sixty tokens, and before this file almost nothing read any of them.
 *
 * ── WHY AN ATTRIBUTE AND NOT A PROP ───────────────────────────────
 * The obvious way to spend those tokens is to pass a colour down: the
 * rail hands its row a colour, the header hands its rule a colour, the
 * page hands its furniture a colour. That is twenty special cases the
 * first week and forty the second, every one of them a place where a
 * later screen can be added and quietly get no identity at all.
 *
 * So identity is carried by ONE attribute, `data-sec`, and resolved by
 * ONE stylesheet. sections.css turns `data-sec="maps"` into three local
 * custom properties, --sec, --sec-ink and --sec-glow, on the element
 * that carries it. Custom properties inherit, so every descendant reads
 * the section it is standing in through var() and nothing has to be told
 * which section that is.
 *
 * The shell puts the attribute on its own root from the current path, so
 * the whole screen inherits the section it is on. The rail and the mega
 * nav put it on each of their rows, so a row can wear its own section
 * while standing on a different one. Same attribute, same twenty rules,
 * two jobs. A module that wants in writes var(--sec-ink) and is done.
 *
 * ── COLOUR IS THE THIRD SIGNAL, ALWAYS ────────────────────────────
 * The owner is colourblind. Every section is named in the rail, named in
 * the breadcrumb, named in the page title, and carries its own drawn
 * mark. The colour is a reinforcement of a label that is already there
 * and it never carries a state. Two sections may look alike; no two are
 * ever spelled alike.
 */
export type SectionId =
  | "today"
  | "requests"
  | "desk"
  | "maps"
  | "lanes"
  | "field"
  | "inbox"
  | "sent"
  | "replies"
  | "objections"
  | "book"
  | "week"
  | "capacity"
  | "packages"
  | "coaching"
  | "method"
  | "partners"
  | "promo"
  | "spend"
  | "leagues"
  | "accounts"
  | "team"
  | "rivals";

/**
 * THE ONE FEATURED KEY, DECLARED ONCE SO THE TWO NAVIGATIONS AGREE.
 *
 * ── WHY THERE IS A RANK ABOVE THE SECTIONS AT ALL ─────────────────
 * The twenty above name places, and none of them outranks another. The
 * strip and the rail then carry queues: a label and a count of work
 * waiting behind it. The trade area board is not a queue. It is a place,
 * its figure is the size of the territory rather than a backlog, and
 * pressing it takes the entire screen, which is the property that makes
 * it wrong as the seventh key in a row of six and right as the one key
 * that stands outside the row.
 *
 * So it is declared here rather than twice, next to the section table it
 * is drawn from, and both navigations build their featured control off
 * this record. Two chrome elements claiming to feature different things
 * is not expressible.
 *
 * THE UNIT IS THE ONLY WORD IN THE APPLICATION THAT TURNS A COUNT INTO A
 * PROMISE. Every other figure in the chrome is spoken rather than shown,
 * because "18" beside Today is work waiting and the word for it belongs
 * to a listener. This one is printed, because 211 next to Maps reads as
 * a backlog and "211 organisations" reads as what is behind the door.
 */
export const FEATURED_KEY = {
  to: "/map",
  label: "Maps",
  sec: "maps" as SectionId,
  figureUnit: "organisations",
} as const;

/**
 * Route to section, exact paths first.
 *
 * The keys are the routes as App.tsx spells them, not as a person reads
 * them. /map is the maps section and /calendar is capacity, because a
 * deployed URL is a promise and a label is not.
 */
const BY_PATH: Record<string, SectionId> = {
  "/today": "today",
  "/requests": "requests",
  "/": "desk",
  "/map": "maps",
  "/lanes": "lanes",
  "/field": "field",
  "/inbox": "inbox",
  "/sent": "sent",
  "/replies": "replies",
  "/objections": "objections",
  "/book": "book",
  "/book/week": "week",
  "/calendar": "capacity",
  "/packages": "packages",
  "/coaching": "coaching",
  "/method": "method",
  "/partners": "partners",
  "/promo": "promo",
  "/spend": "spend",
  /* The sell-through statement wears the Budget identity rather than a
     twenty fourth hue. Same reasoning as /pay under the floor and
     /segments under lanes: it is an OUTPUT of the supply side rather
     than a place of its own, it sits beside Budget in the rail, and a
     separate colour would have drawn one trade as two. It is still named
     in the rail, in the breadcrumb and in the page title, which is where
     a section is actually told apart. */
  "/sellthrough": "spend",
  "/leagues": "leagues",
  "/book/accounts": "accounts",
  "/team": "team",
  /* Pay and the district report wear the floor's identity rather than
     one each. Twenty five sections do not clear the adjacency floor on a
     single hue wheel, measured in theme_cabinet.py, and both of these are
     outputs of the floor rather than places of their own. Same reasoning
     that puts the cup under the leagues colour. */
  "/pay": "team",
  "/report": "team",
  "/rivals": "rivals",
  /* Segments wears the lanes identity rather than a twenty fourth
     section of its own, and the reason is measured rather than tidy:
     theme_cabinet.py solves section hues around one wheel, and at
     twenty four the adjacency floor of 7.5 fails on both grounds. It is
     also the right answer regardless. Lanes and Segments are two cuts
     of one board, how you reach an organisation and what industry it
     is in, and drawing them in two colours would say they were two
     places. Same precedent as /cup under leagues and /pay under the
     floor. It is still named in the rail, the breadcrumb and the title,
     which is where a section is actually told apart. */
  "/segments": "lanes",
  /* The cup takes the leagues identity rather than a twenty first
     section of its own. It is not a second product: a cup is what the
     leagues play for, it sits beside Leagues in the rail, and a separate
     hue would draw one thing as two. It is still named in the rail, in
     the breadcrumb and in the page title, which is where a section is
     actually told apart. */
  "/cup": "leagues",
};

/**
 * The section a path belongs to, or null where none does.
 *
 * The prefix pass exists for the one route in the application that has a
 * child with an id in it: /leagues/:leagueId is still the leagues
 * section, and a reader who has opened one league has not left it. The
 * check is written as a segment comparison rather than a startsWith so a
 * future /leagues-archive cannot inherit a colour by accident.
 */
/**
 * A path with its trailing slash taken off, and it is load bearing.
 *
 * Every route in this application is served as a prerendered directory,
 * so a reader who lands on /lanes/ rather than /lanes gets the same
 * screen from a different string. React Router hands that string through
 * unchanged, which means every `pathname === "/thing"` in the chrome is
 * false for half the ways a person can arrive at it, and the failure is
 * silent: the page renders and the section colour falls back. It cost an
 * hour to find once and it is not costing it twice.
 *
 * The root is left alone, because "/" with its slash removed is "".
 */
export function normalisePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function sectionFor(rawPathname: string): SectionId | null {
  const pathname = normalisePath(rawPathname);
  const exact = BY_PATH[pathname];
  if (exact) return exact;

  const head = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  const parent = BY_PATH[head];
  return parent ?? null;
}
