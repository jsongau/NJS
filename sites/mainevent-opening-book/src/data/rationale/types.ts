/**
 * ONE EXPLANATION PER CONSOLE SCREEN.
 *
 * Rationale is not a page. It is a second reading of the whole
 * application: the rail is identical in both modes, and the switch on the
 * bar decides whether a destination shows you the instrument or the
 * argument for why that instrument is shaped the way it is. Standing on
 * Lanes and pressing Rationale gets you how Lanes was built, not a
 * general essay you then have to search.
 *
 * That is why these records are keyed by the CONSOLE path rather than by
 * a slug of their own. A screen and its explanation are the same thing
 * addressed twice, and a second naming scheme would be a second thing to
 * keep in step.
 */
export interface ScreenRationale {
  /** The console path this explains. The key, and the only key. */
  path: string;
  /** The screen's name, spelled exactly as the rail spells it. */
  label: string;
  /** One sentence: what the screen is for. */
  standfirst: string;
  /** The decisions. Each could have gone the other way. */
  sections: { heading: string; body: string[] }[];
}
