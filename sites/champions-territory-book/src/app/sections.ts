/**
 * THE SECTIONS, AND THE ONE PLACE A PATH BECOMES ONE.
 *
 * tokens.css publishes three tokens for every navigation section:
 * --sec-<id> for the mark, --sec-<id>-ink for anything that carries
 * words, and --sec-<id>-glow for the wash behind them. Twenty three
 * sections, sixty nine tokens, and before this file almost nothing read
 * any of them.
 *
 * SOME OF THE KEYS BELOW OUTLIVED THEIR SCREENS. This console was copied
 * from one built around a single site, and the surfaces that were only
 * about that site came out with it. Their section ids stayed, because
 * tokens.css publishes their tokens, the chrome joins on them by string,
 * and a key deleted here does not tidy anything up: it silently drops a
 * colour, a breadcrumb and a rail row for anybody who still holds the
 * URL. The names are inherited join keys. What each one means to a
 * division marketer is written beside it.
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
 * while standing on a different one. Same attribute, same rule set, two
 * jobs. A module that wants in writes var(--sec-ink) and is done.
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
  | "plans"
  | "accounts"
  | "team"
  | "rivals";

/**
 * THE ONE FEATURED KEY, DECLARED ONCE SO THE TWO NAVIGATIONS AGREE.
 *
 * ── WHY THERE IS A RANK ABOVE THE SECTIONS AT ALL ─────────────────
 * The ids above name places, and none of them outranks another. The
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
 * a backlog and "329 organisations" reads as what is behind the door.
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
  /* The vendor statement wears the Budget identity rather than a twenty
     fourth hue. Same reasoning as /pay under Team and /segments under
     Lanes: it is an OUTPUT of the buying side rather than a place of its
     own, it sits beside Budget in the rail, and a separate colour would
     have drawn one trade as two. It is still named in the rail, in the
     breadcrumb and in the page title, which is where a section is
     actually told apart. */
  "/sellthrough": "spend",
  "/book/accounts": "accounts",
  "/team": "team",
  /* Commission and the division report wear the Team identity rather
     than one each. Twenty five sections do not clear the adjacency
     minimum on a single hue wheel, measured in theme_cabinet.py, and both
     of these are outputs of the crew's week rather than places of their
     own. Same reasoning that puts the retention board under the
     membership colour. */
  "/pay": "team",
  "/report": "team",
  "/rivals": "rivals",
  /* Segments wears the Lanes identity rather than a twenty fourth
     section of its own, and the reason is measured rather than tidy:
     theme_cabinet.py solves section hues around one wheel, and at
     twenty four the adjacency minimum of 7.5 fails on both grounds. It
     is also the right answer regardless. Lanes and Segments are two cuts
     of one board, how you reach an organisation and what industry it is
     in, and drawing them in two colours would say they were two places.
     Same precedent as /cup and /pay, each of which wears a
     neighbour's identity for the same reason. It is
     still named in the rail, the breadcrumb and the title, which is
     where a section is actually told apart. */
  "/segments": "lanes",
  /* This one takes the membership identity rather than a section of its
     own. It is not a second product: it is what a membership programme
     is measured by once people are in it, it sits beside the programmes
     in the rail, and a separate hue would draw one thing as two. It is
     still named in the rail, in the breadcrumb and in the page title,
     which is where a section is actually told apart. */
};

/**
 * The section a path belongs to, or null where none does.
 *
 * The prefix pass exists for routes with an id in the child segment:
 * /leagues/:programmeId is still the membership section, and a reader
 * who has opened one programme has not left it. The check is written as
 * a segment comparison rather than a startsWith so a future
 * /leagues-archive cannot inherit a colour by accident.
 */
/**
 * A path with its trailing slash taken off, and it is load bearing.
 *
 * Every route in this application is served as a prerendered directory,
 * so a reader who lands on /rationale/ rather than /rationale gets the
 * same screen from a different string. React Router hands that string
 * through unchanged, which means every `pathname === "/thing"` in the
 * chrome is false for half the ways a person can arrive at it, and the
 * failure is silent: the page renders, the section colour falls back,
 * and the mode switch marks the wrong mode. It cost an hour to find once
 * and it is not costing it twice.
 *
 * The root is left alone, because "/" with its slash removed is "".
 */
export function normalisePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function sectionFor(rawPathname: string): SectionId | null {
  /*
    AN EXPLANATION WEARS THE COLOUR OF THE SCREEN IT EXPLAINS.

    /rationale/lanes resolves to Lanes and /rationale resolves to the
    desk, because Rationale is a second reading of the same places rather
    than a place of its own. Giving the whole mode one identity would
    have drawn twenty seven different rooms in one colour and said they
    were the same room.

    The prefix comes off here, at the one function that turns a path into
    an identity, rather than in the twenty places that ask for one. There
    used to be a "/rationale": "method" row in the table above instead,
    and it was worse than useless: the exact match caught the desk's
    explanation and the prefix pass caught all twenty six others, so the
    entire mode rendered in one colour and looked deliberate.
  */
  const stripped = rawPathname.replace(/^\/rationale(?=\/|$)/, "") || "/";
  const pathname = normalisePath(stripped);
  const exact = BY_PATH[pathname];
  if (exact) return exact;

  const head = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  const parent = BY_PATH[head];
  return parent ?? null;
}
