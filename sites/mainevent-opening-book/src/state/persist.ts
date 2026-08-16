import {
  useEffect,
  useReducer,
  useRef,
  useSyncExternalStore,
  type Dispatch,
  type Reducer,
} from "react";

/**
 * PERSISTENCE. One mechanism, four providers, one key.
 *
 * ── THE FAILURE THIS FILE PREVENTS ────────────────────────────────
 * Every provider in this application used to hold its state in a React
 * reducer and nowhere else. Advance a school from unworked to
 * conversation, correct a guest count on a signed line, disposition an
 * objection, send a quote, then close the tab, and all of it was gone.
 * A tool whose entire promise is the word TRACK cannot forget the moment
 * the laptop lid shuts. A dashboard that forgets is a screenshot.
 *
 * So this file exists to make yesterday a thing this app has. It wraps
 * useReducer, hydrates from local storage on the first render, and writes
 * back on change, and it does that ONCE rather than four times, because
 * four hand-rolled copies of a storage effect is four places for a schema
 * to drift and four different answers to what happens when storage
 * throws.
 *
 * ── WHAT IS PERSISTED, AND WHY IT IS ONLY THE DELTAS ──────────────
 * The two hundred and eleven prospects, the packages, the venue, the
 * nine lanes and the seeded objection register are CODE. They ship in the
 * bundle. They are not state and they are never written here.
 *
 * What is written is what a person did on top of them: statuses they
 * advanced, touches they recorded, book lines they added or edited,
 * activity they planned or completed, objections they dispositioned, and
 * outbox rows they sent. Deltas, keyed against the seed.
 *
 * This is the decision most likely to be undone by somebody later, so it
 * is worth being blunt about the cost of undoing it. If this file wrote
 * whole provider states instead, then the first visitor to open the app
 * would freeze the seed data in their browser permanently. A corrected
 * price, a new prospect, a rewritten objection, a fixed typo in a seeded
 * quote: none of it would ever reach them again, because their copy would
 * win on every load, forever, and the only fix would be asking a hiring
 * manager to clear their site data. Writing deltas means a data release
 * flows straight through to a returning reader for every row they never
 * touched.
 *
 * ── SEED CHANGES WIN ──────────────────────────────────────────────
 * Deltas handle rows nobody touched. The remaining case is a row the
 * reader DID change that the seed later changes underneath them, where a
 * merge would silently reapply an edit to a fact that no longer exists.
 *
 * Each slice therefore carries a SIGNATURE: a hash over the seed arrays
 * that slice was built from, computed at module load and stored beside
 * the delta. On hydration the signatures must match or the delta is
 * dropped and the reader gets the new seed clean. A data release resets
 * that ledger's edits and nothing else.
 *
 * The finer alternative, a signature per row so an unrelated seed edit
 * keeps the reader's other work, was considered and rejected: it doubles
 * the payload to defend a case that arrives once per deploy, and it
 * pretends a row identity survives a rewrite when quite often it does
 * not. Losing a session of demo edits at a data release is the cheap
 * outcome. Silently reviving an edit against a figure that has been
 * corrected is the expensive one.
 */

/**
 * ONE NAMESPACED, VERSIONED KEY.
 *
 * Namespaced because a browser's local storage for a domain is shared by
 * every app served from it, and nathanjsong.com serves several. Versioned
 * because the shape below is going to change and a stale shape read as if
 * it were the current one is exactly how a work sample greets its reader
 * with a white screen.
 */
export const STORAGE_KEY = "opening-book.v1";

/** Mirrors the suffix on the key. Both move together, deliberately. */
const SCHEMA_VERSION = 1;

/**
 * Keys written by earlier builds of this app, removed on the first
 * successful write.
 *
 * The outbox used to persist itself, alone, under its own key with its
 * own shape. Leaving that behind would mean every reader who saw the
 * older build carries a dead payload in their browser until they clear
 * it by hand, and the next person to grep for a storage key would find
 * two and have to guess which one is live.
 */
const LEGACY_KEYS = ["meb:outbox:v1"];

/**
 * How long a burst of changes is allowed to collect before it is written.
 *
 * Dragging a guest count from 40 to 60 fires twenty reducer actions in
 * under a second and each one serialises the whole envelope. Writing per
 * action is a synchronous JSON encode plus a synchronous storage write on
 * every keystroke, on the main thread, which is felt.
 *
 * Note the shape of the timer below: it is a throttle with a trailing
 * write rather than a debounce that restarts. A restarting debounce can
 * be starved indefinitely by a reader who keeps typing, which is the one
 * reader most worth not losing. This way nothing is ever more than
 * WRITE_DELAY_MS away from disk, however fast the changes arrive.
 */
const WRITE_DELAY_MS = 400;

// ---------------------------------------------------------------
// The envelope
// ---------------------------------------------------------------

interface StoredSlice {
  /** Signature of the seed this delta was computed against. */
  sig: string;
  /** The delta itself. Shape is the slice's business, not this file's. */
  data: unknown;
}

interface Envelope {
  v: number;
  /** ISO stamp, so a person reading their own storage can date it. */
  at: string;
  slices: Record<string, StoredSlice>;
}

/**
 * THE MIGRATION SEAM.
 *
 * There is exactly one version today, so this function has nothing to
 * step through, and writing it anyway looks like ceremony. It is not.
 * The moment a second version exists, the question "what do we do with a
 * v1 payload" has to be answered somewhere, and the two places it tends
 * to get answered are inside a hydration function that already has four
 * other jobs, or not at all. Having the seam sitting here, named, empty
 * and commented, is what makes the answer a two-line addition rather
 * than a refactor.
 *
 * The rule for filling it in: step a payload forward one version at a
 * time, and where a step cannot be made honestly, return null. Returning
 * null is not a failure. It means the reader gets the seeded defaults,
 * which is a state this app is always able to render.
 */
function migrate(version: number, slices: Record<string, StoredSlice>): Envelope | null {
  if (version === SCHEMA_VERSION) {
    return { v: SCHEMA_VERSION, at: "", slices };
  }
  /* A payload from a NEWER build than this one. Somebody has two tabs
     open across a deploy. The new shape cannot be understood by old
     code, so it is left alone rather than trampled. */
  if (version > SCHEMA_VERSION) return null;
  /* v0 and anything else older. Nothing to step forward from yet. */
  return null;
}

// ---------------------------------------------------------------
// Where the writes actually go, and what happens when they cannot
// ---------------------------------------------------------------

export type StorageMode = "browser" | "memory";

export interface PersistenceStatus {
  mode: StorageMode;
  /** Plain sentence, safe to show a person. Null while all is well. */
  reason: string | null;
}

/**
 * STORAGE IS ALLOWED TO FAIL, AND THE UI IS TOLD WHEN IT DOES.
 *
 * Safari in private browsing throws on setItem. Chrome throws when the
 * origin's quota is exhausted. An embedded frame with third-party
 * storage blocked throws on the very first property access, before any
 * key is read. All three are ordinary conditions on a public portfolio
 * URL, none of them should take the app down, and none of them should be
 * swallowed either: a person tracking real bookings who is quietly not
 * being saved has been actively misled, which is worse than being told
 * plainly that this browser will not keep anything.
 *
 * So a failure downgrades the whole mechanism to memory for the session,
 * logs once, and publishes the fact through this store so the reset
 * controls can say it out loud.
 */
const OK: PersistenceStatus = { mode: "browser", reason: null };
let status: PersistenceStatus = OK;

const listeners = new Set<() => void>();

function publish(next: PersistenceStatus): void {
  status = next;
  for (const fn of listeners) fn();
}

function degrade(reason: string, cause: unknown): void {
  if (status.mode === "memory") return;
  /* Once, not per write. A quota failure repeats on every keystroke and
     a console with four hundred identical warnings in it is a console
     nobody reads. */
  console.warn(`[opening-book] ${reason}`, cause);
  publish({ mode: "memory", reason });
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch (err) {
    degrade(
      "This browser is not allowing local storage, so changes will last until the tab closes.",
      err,
    );
    return null;
  }
}

/** Subscribe to the storage mode. Used by the reset controls. */
export function usePersistenceStatus(): PersistenceStatus {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => status,
    () => OK,
  );
}

// ---------------------------------------------------------------
// Reading
// ---------------------------------------------------------------

/**
 * The parsed envelope, read once and then held.
 *
 * `undefined` means not read yet; `null` means read and there was
 * nothing usable there. Four providers hydrate in the same render pass
 * and parsing the same string four times is work nobody asked for.
 */
let cache: Envelope | null | undefined;

/**
 * DEFENSIVE TO THE POINT OF PARANOIA, ON PURPOSE.
 *
 * The value behind this key is user-writable. It survives deploys, it
 * can be truncated by a browser reclaiming space, it can be hand-edited
 * by a curious reader, and it can have been written by a build that no
 * longer exists. Every one of those has to end at the seeded defaults
 * rather than at a thrown exception, because the reader who hits it is a
 * hiring manager who will not open dev tools and clear site data for
 * you. They will close the tab.
 */
function readEnvelope(): Envelope | null {
  if (cache !== undefined) return cache;
  cache = null;
  const store = storage();
  if (!store) return cache;
  let raw: string | null = null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch (err) {
    degrade(
      "This browser would not let the app read what it saved, so this session starts fresh.",
      err,
    );
    return cache;
  }
  if (!raw) return cache;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return cache;
    const version = num(parsed.v);
    const slices = parsed.slices;
    if (version === null || !isRecord(slices)) return cache;
    const cleaned: Record<string, StoredSlice> = {};
    for (const [name, entry] of Object.entries(slices)) {
      if (!isRecord(entry)) continue;
      const sig = str(entry.sig);
      if (sig === null) continue;
      cleaned[name] = { sig, data: entry.data };
    }
    cache = migrate(version, cleaned);
  } catch {
    /* Malformed JSON. Silently the seed, which is always renderable. The
       corrupt value is deliberately not deleted here: a read should not
       be a write. The first real change overwrites it. */
    cache = null;
  }
  return cache;
}

// ---------------------------------------------------------------
// Writing
// ---------------------------------------------------------------

/**
 * Staged writes, by slice name.
 *
 * The value is a THUNK rather than an encoded payload. Encoding a delta
 * means diffing arrays against the seed, and doing that on every one of
 * twenty rapid reducer actions is nineteen diffs whose results are
 * thrown away. Staging the closure and encoding once at flush time makes
 * a burst cost one encode.
 */
const pending = new Map<string, { sig: string; encode: () => unknown }>();

let timer: number | null = null;
let bound = false;

function stage(slice: string, sig: string, encode: () => unknown): void {
  pending.set(slice, { sig, encode });
  bindFlushListeners();
  if (timer !== null) return;
  timer = window.setTimeout(() => {
    timer = null;
    writeNow();
  }, WRITE_DELAY_MS);
}

/**
 * THE UNLOAD FLUSH IS NOT OPTIONAL.
 *
 * A four hundred millisecond window is a small thing to lose and it is
 * also exactly the window a person's last action of the day lands in:
 * they change a status and immediately close the laptop. So the timer is
 * flushed the moment the page is hidden or unloaded.
 *
 * visibilitychange covers a tab switch, a tab close and a phone being
 * locked. pagehide covers a reload and an in-page navigation away.
 * beforeunload is deliberately NOT used: it disqualifies the page from
 * the back-forward cache in every modern browser, which is a real cost
 * to every reader in exchange for a case the two listeners already cover.
 */
function bindFlushListeners(): void {
  if (bound || typeof window === "undefined") return;
  bound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPersisted();
  });
  window.addEventListener("pagehide", () => flushPersisted());
}

/** Write anything staged, right now. Safe to call when nothing is. */
export function flushPersisted(): void {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  writeNow();
}

function writeNow(): void {
  if (pending.size === 0) return;

  const slices: Record<string, StoredSlice> = { ...(readEnvelope()?.slices ?? {}) };
  for (const [name, entry] of pending) {
    let data: unknown;
    try {
      data = entry.encode();
    } catch (err) {
      /* An encoder that throws must not take the other three slices with
         it, and must not take the app down either. */
      console.warn(`[opening-book] could not encode the ${name} slice`, err);
      continue;
    }
    /* A slice with nothing user-made in it is REMOVED rather than
       written as an empty object. That is what lets a reset leave the
       key genuinely absent instead of leaving a hollow envelope behind
       that looks, to anyone inspecting storage, like saved work. */
    if (data === null || data === undefined) delete slices[name];
    else slices[name] = { sig: entry.sig, data };
  }
  pending.clear();

  const store = storage();
  const empty = Object.keys(slices).length === 0;
  cache = empty ? null : { v: SCHEMA_VERSION, at: new Date().toISOString(), slices };
  if (!store) return;

  try {
    if (empty) store.removeItem(STORAGE_KEY);
    else store.setItem(STORAGE_KEY, JSON.stringify(cache));
    for (const key of LEGACY_KEYS) store.removeItem(key);
  } catch (err) {
    degrade(
      "This browser refused to save, most likely private browsing or a full storage quota. Changes will last until the tab closes.",
      err,
    );
  }
}

/**
 * Throw away everything this app has stored.
 *
 * Called by the reset controls, which are the only place in the app that
 * may do this, and only behind a confirmation that names what goes.
 */
export function clearPersisted(): void {
  pending.clear();
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  cache = null;
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
    for (const key of LEGACY_KEYS) store.removeItem(key);
  } catch (err) {
    degrade(
      "This browser refused to clear what was saved. Nothing is being written from here on.",
      err,
    );
  }
}

// ---------------------------------------------------------------
// The hook
// ---------------------------------------------------------------

export interface SliceCodec<S> {
  /** Key inside the envelope. One per provider, stable forever. */
  slice: string;
  /** Hash of the seed this slice merges onto. See signatureOf. */
  signature: string;
  /**
   * The user's deltas, or null when the reader has changed nothing.
   * Returning null removes the slice, which is how a reset ends with an
   * empty storage key rather than a hollow one.
   */
  encode: (state: S) => unknown;
  /**
   * Rebuild state from the seed plus an untrusted payload. Must never
   * throw and must drop anything it cannot vouch for.
   */
  decode: (raw: unknown, seed: S) => S;
}

/**
 * useReducer, with the reader's work kept across a reload.
 *
 * Drop-in for useReducer at the call site, which matters: fourteen pages
 * consume these providers through hooks whose signatures cannot move, so
 * the persistence had to fit INSIDE the providers rather than around
 * them.
 */
export function usePersistedReducer<S, A>(
  reducer: Reducer<S, A>,
  seed: S,
  codec: SliceCodec<S>,
): [S, Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, seed, (initial) =>
    hydrate(codec, initial),
  );

  /* The codec closes over module constants and is rebuilt every render.
     A ref keeps the effect below depending on the state alone, so a
     render that changed nothing does not schedule a write. */
  const codecRef = useRef(codec);
  codecRef.current = codec;

  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      /* A LOAD IS NOT A WRITE. Hydrating and then immediately writing
         the same thing back would touch storage on every visit,
         including visits where the reader only read, and would rewrite
         a payload whose signature we just decided to ignore. */
      first.current = false;
      return;
    }
    const c = codecRef.current;
    stage(c.slice, c.signature, () => c.encode(state));
  }, [state]);

  return [state, dispatch];
}

function hydrate<S>(codec: SliceCodec<S>, seed: S): S {
  try {
    const entry = readEnvelope()?.slices[codec.slice];
    if (!entry) return seed;
    /* SEED CHANGES WIN. A delta computed against a seed that has since
       been rewritten is not information, it is a ghost. */
    if (entry.sig !== codec.signature) return seed;
    return codec.decode(entry.data, seed);
  } catch (err) {
    /* A decoder is meant to be total. If one is not, the seed is still a
       state this app can render, and a white screen is not. */
    console.warn(`[opening-book] could not restore the ${codec.slice} slice`, err);
    return seed;
  }
}

// ---------------------------------------------------------------
// Signatures
// ---------------------------------------------------------------

/**
 * A stable hash over whatever seed arrays a slice was built from.
 *
 * Key order in an object literal is not guaranteed to survive a
 * refactor, so the stringify below sorts keys before hashing. Without
 * that, moving a field up a line in a data file would invalidate every
 * reader's saved work for no reason at all.
 *
 * FNV-1a, thirty-two bits, base thirty-six. Not cryptographic and it does
 * not need to be: the question it answers is "is this the same seed I
 * saw last time", and the cost of a collision is that one reader keeps a
 * stale edit.
 */
export function signatureOf(...seeds: unknown[]): string {
  const text = stableStringify(seeds);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val: unknown) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const source = val as Record<string, unknown>;
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(source).sort()) sorted[key] = source[key];
      return sorted;
    }
    return val;
  });
}

// ---------------------------------------------------------------
// Diffing and merging rows
// ---------------------------------------------------------------

export interface RowDelta<T> {
  /** Rows that differ from their seed, plus rows with no seed at all. */
  changed: T[];
  /** Keys present in the seed and gone from the current state. */
  removed: string[];
}

/**
 * What the reader did to a seeded list.
 *
 * Returns null when they did nothing, which the encoders use to drop
 * their slice entirely.
 */
export function diffRows<T>(
  seed: T[],
  current: T[],
  keyOf: (row: T) => string,
): RowDelta<T> | null {
  const seeded = new Map(seed.map((row) => [keyOf(row), stableStringify(row)]));
  const changed: T[] = [];
  const seen = new Set<string>();
  for (const row of current) {
    const key = keyOf(row);
    seen.add(key);
    const before = seeded.get(key);
    if (before === undefined || before !== stableStringify(row)) changed.push(row);
  }
  const removed = [...seeded.keys()].filter((key) => !seen.has(key));
  if (changed.length === 0 && removed.length === 0) return null;
  return { changed, removed };
}

/**
 * The seed with the reader's work laid back over it.
 *
 * Seed order is kept, because it is the order somebody chose in a data
 * file; rows the seed has never heard of are appended in the order they
 * were saved. Anything the reader deleted stays deleted, which is the
 * whole reason `removed` is carried separately: a merge that only knows
 * about additions quietly resurrects every line a person threw away.
 */
export function mergeRows<T>(
  seed: T[],
  changed: T[],
  removed: string[],
  keyOf: (row: T) => string,
): T[] {
  const gone = new Set(removed);
  const overrides = new Map(changed.map((row) => [keyOf(row), row]));
  const out: T[] = [];
  for (const row of seed) {
    const key = keyOf(row);
    if (gone.has(key)) continue;
    out.push(overrides.get(key) ?? row);
    overrides.delete(key);
  }
  for (const row of changed) {
    const key = keyOf(row);
    if (overrides.has(key)) {
      out.push(row);
      overrides.delete(key);
    }
  }
  return out;
}

/**
 * The highest number on a set of generated ids, for restarting a counter.
 *
 * The providers mint ids by incrementing a module counter: "book-1",
 * "act-2". That counter resets to zero on every page load while the ids
 * it already minted come BACK from storage, so without this a returning
 * reader's next booking is handed an id a persisted line is already
 * using, and REMOVE_BOOKING then deletes two lines with one click. This
 * is the sharpest edge in the whole file and it is invisible until
 * somebody has actually come back to a saved session.
 */
export function highestIdSuffix(ids: string[], prefix: string): number {
  let top = 0;
  for (const id of ids) {
    if (!id.startsWith(`${prefix}-`)) continue;
    const n = Number.parseInt(id.slice(prefix.length + 1), 10);
    if (Number.isFinite(n) && n > top) top = n;
  }
  return top;
}

// ---------------------------------------------------------------
// Small validators, shared by the four decoders
// ---------------------------------------------------------------

/*
  These exist so a decoder reads as a list of claims about a row rather
  than as a wall of typeof checks, and so that every provider makes the
  SAME claims. The rule they enforce: a value that will be used as a key
  into a lookup table must be checked against that table here, at the
  boundary. A hand-edited status of "definitely-booked" that reaches
  PITCH_STATUS[status].label is a white screen on the busiest page in the
  app, and it is the single most likely way a stale or tampered payload
  takes this build down.
*/

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function optionalStr(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function optionalNum(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** A string that is a key of the given lookup table, or null. */
export function enumKey<K extends string>(
  v: unknown,
  table: Record<K, unknown>,
): K | null {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(table, v)
    ? (v as K)
    : null;
}

/** A list of keys of the given table, with anything unrecognised dropped. */
export function enumKeys<K extends string>(
  v: unknown,
  table: Record<K, unknown>,
): K[] {
  return arr(v)
    .map((item) => enumKey(item, table))
    .filter((item): item is K => item !== null);
}
