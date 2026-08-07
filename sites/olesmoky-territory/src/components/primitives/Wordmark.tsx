import type { Channel } from "@/domain/types";
import { CHANNEL_META, VENUE_CLASS_META } from "@/domain/channels";
import styles from "./Wordmark.module.css";

/**
 * Retailer identity, set in type.
 *
 * This is the design, not a fallback. There are no rights to the Ralphs,
 * Costco, Target, or 7-Eleven marks, and the obvious source for
 * storefront photography (Street View) prohibits this use. A well-set
 * wordmark on a channel-keyed card looks deliberate; scraped logos at
 * mismatched resolutions look scraped. The legally safe option here is
 * also the better-looking one.
 */

/*
  Label and glyph are READ from CHANNEL_META rather than declared here.

  They used to be declared here, in two separate Records, and the cost of
  that showed up the moment a channel was added: the union told me about
  the two maps in this file and said nothing about the four other places
  that also had an opinion about what a channel is called. Everything a
  channel means now lives in domain/channels.ts, and this file renders it.
*/

function initials(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9 &]/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function Wordmark({
  name,
  channel,
  size = "md",
}: {
  name: string;
  channel: Channel;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={[styles.mark, styles[size], styles[`ch-${channel}`]].join(" ")}
      aria-hidden="true"
      data-channel={channel}
      data-venue={CHANNEL_META[channel].venueClass}
    >
      <span className={styles.initials}>{initials(name)}</span>
      <span className={styles.glyph}>{CHANNEL_META[channel].glyph}</span>
    </span>
  );
}

export function ChannelLabel({ channel }: { channel: Channel }) {
  return (
    <span className={[styles.chip, styles[`ch-${channel}`]].join(" ")}>
      <span aria-hidden="true">{CHANNEL_META[channel].glyph}</span>
      {CHANNEL_META[channel].label}
    </span>
  );
}

/**
 * The venue class, said out loud.
 *
 * It is the coarsest fact about an account and the one that changes the
 * most: whether this place sells a sealed bottle or a pour. It sits
 * beside the channel chip rather than replacing it, quieter, because it
 * qualifies the channel rather than competing with it — which is exactly
 * the role the banner label used to play before this roster made banners
 * irrelevant.
 */
export function VenueClassLabel({ channel }: { channel: Channel }) {
  const vc = CHANNEL_META[channel].venueClass;
  return (
    <span className={styles.focus}>
      <span aria-hidden="true">{VENUE_CLASS_META[vc].glyph}</span>{" "}
      {VENUE_CLASS_META[vc].short}
    </span>
  );
}
