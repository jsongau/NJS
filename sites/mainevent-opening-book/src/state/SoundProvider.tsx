import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  isRecord,
  signatureOf,
  usePersistedReducer,
  type SliceCodec,
} from "./persist";

/**
 * THE CABINET MAKES A NOISE, AND ONLY AFTER SOMEBODY ASKS IT TO.
 *
 * An arcade cabinet is a thing you hear before you reach it, and this
 * application has been drawn as one since the theme changed: a housing, a
 * marquee, keys with a real press and a two pixel edge under them. What
 * was missing was the half of that experience your hands do not do. This
 * file is that half.
 *
 * ── SILENT UNTIL ARMED, AND THAT IS NOT TIMIDITY ──────────────────
 * The reader this is built for is a hiring manager opening a link, quite
 * possibly at a desk with other people around them, quite possibly in an
 * interview with the screen shared. Sound that arrives unasked at that
 * moment does not read as craft, it reads as a person who has never
 * watched somebody else open their work. So the default is off, the
 * choice is theirs, and the control that makes it says so in a word.
 *
 * Browsers agree, for their own reasons. Every one of them refuses to
 * start an AudioContext that was not created inside a user gesture, so a
 * design that played on load would be silent on the first screen and
 * loud on the second, which is worse than either.
 *
 * The upside of arming is real, though, and it is why this exists rather
 * than being talked about: the reader has to press something to turn it
 * on, and a press is exactly when the first sound should happen. The
 * control demonstrates itself.
 *
 * ── NOTHING IS A FILE ─────────────────────────────────────────────
 * Every sound here is synthesised in the Web Audio API from an
 * oscillator, a gain envelope and nothing else. No audio assets, no new
 * dependency, no bytes added to the bundle and nothing that can 404 on a
 * slow connection or a locked down network. The whole palette is the
 * table below, and it is short on purpose.
 *
 * ── FIVE CUES, AND EVERY ONE OF THEM IS SHORT ─────────────────────
 * The rule that keeps an interface from becoming a toy: a sound reports
 * something that happened, it never decorates something that is merely
 * present. Nothing here loops, nothing plays on hover, nothing plays on
 * scroll, nothing plays on load, and nothing plays while a reader is
 * typing. The longest cue is a fifth of a second.
 *
 *   press   a soft wooden click under any key or link on the chrome
 *   throw   the ground switch, two notes because it is a two state thing
 *   send    a rising pair, because something has left the building
 *   land    a small major third, the only cue that is allowed to be nice
 *   refuse  a low flat thud for a control that would not do the thing
 *
 * ── THE REPEAT GUARD IS NOT AN OPTIMISATION ───────────────────────
 * A reader who double presses a key gets one click, not two, because two
 * identical transients 40ms apart is not a click, it is a buzz. Same cue
 * inside 60ms is dropped.
 *
 * ── VOLUME ────────────────────────────────────────────────────────
 * The master gain is 0.05. That is quiet enough that a laptop at a
 * conversational volume produces something you notice with headphones and
 * barely register without them, which is the correct side to err on. It
 * is not exposed as a slider: a control nobody moves is a control that
 * should have been a decision.
 *
 * ── WHAT IS PERSISTED ─────────────────────────────────────────────
 * The armed state, and only when it is on, as a slice inside the one
 * storage key state/persist.ts already owns, the same shape the ground
 * uses. An absent slice means off, which is the default, which is what a
 * first visit and a blocked storage both resolve to.
 */

export type SoundCue = "press" | "throw" | "send" | "land" | "refuse";

interface SoundState {
  /** Off until the reader arms it. Never on by default, in any path. */
  on: boolean;
}

type SoundAction = { type: "SET"; on: boolean } | { type: "TOGGLE" };

const SEED: SoundState = { on: false };

function reducer(state: SoundState, action: SoundAction): SoundState {
  switch (action.type) {
    case "SET":
      return state.on === action.on ? state : { on: action.on };
    case "TOGGLE":
      return { on: !state.on };
    default:
      return state;
  }
}

/**
 * `encode` returns null while sound is off, which removes the slice
 * rather than storing a false. Same reasoning as the theme's: the absence
 * IS the default state, and writing it down would only create a second
 * way to say the same thing.
 */
const SOUND_CODEC: SliceCodec<SoundState> = {
  slice: "sound",
  signature: signatureOf("sound.armed.v1"),
  encode: (state) => (state.on ? { armed: true } : null),
  decode: (raw, seed) => {
    if (!isRecord(raw)) return seed;
    /* Only the literal true arms it. A corrupt payload, a hand edited
       "yes", a number, all resolve to silence, because the failure mode
       of guessing wrong here is noise in somebody's open plan office. */
    return raw.armed === true ? { on: true } : seed;
  },
};

// ---------------------------------------------------------------
// The instrument
// ---------------------------------------------------------------

/**
 * One note. Frequency in hertz, length in milliseconds, and a gain
 * envelope that always ends at zero rather than being cut, because an
 * oscillator stopped at full amplitude is a click on top of the click.
 */
interface Note {
  wave: OscillatorType;
  from: number;
  to: number;
  ms: number;
  gain: number;
  /** Milliseconds to wait before this note starts, for two note cues. */
  delay?: number;
}

/**
 * THE PALETTE. Every number here was chosen by ear against the two
 * grounds and then trimmed until it stopped being noticeable as a sound
 * and started being noticeable as a surface.
 *
 * The triangle wave does most of the work because a sine is too pure to
 * read as an object and a square is a 1980s alarm. The press cue drops in
 * pitch, which is what a physical key does; the send cue rises, which is
 * what leaving does.
 */
const PALETTE: Record<SoundCue, Note[]> = {
  press: [{ wave: "triangle", from: 210, to: 150, ms: 42, gain: 0.5 }],
  throw: [
    { wave: "triangle", from: 320, to: 300, ms: 38, gain: 0.42 },
    { wave: "triangle", from: 440, to: 430, ms: 52, gain: 0.34, delay: 46 },
  ],
  send: [
    { wave: "triangle", from: 392, to: 396, ms: 60, gain: 0.36 },
    { wave: "triangle", from: 587, to: 592, ms: 90, gain: 0.3, delay: 62 },
  ],
  land: [
    { wave: "triangle", from: 523, to: 523, ms: 130, gain: 0.3 },
    { wave: "triangle", from: 659, to: 659, ms: 150, gain: 0.26, delay: 40 },
    { wave: "triangle", from: 784, to: 784, ms: 190, gain: 0.22, delay: 80 },
  ],
  refuse: [{ wave: "sine", from: 150, to: 96, ms: 150, gain: 0.4 }],
};

const MASTER_GAIN = 0.05;
const REPEAT_GUARD_MS = 60;

/**
 * The context is created lazily and ONCE, inside the gesture that arms
 * the sound, and it is never closed. Creating one per cue exhausts the
 * browser's limit of them within a minute of ordinary clicking, which
 * fails silently and looks exactly like the feature not working.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      /* A browser that refuses to make one is a browser that gets a
         silent application, which is a working application. */
      return null;
    }
  }
  /* Suspended is the normal state after a tab has been in the background,
     and a resume that fails is not worth a thrown error on a click. */
  if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
  return ctx;
}

function strike(note: Note, at: number, ac: AudioContext): void {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  const start = at + (note.delay ?? 0) / 1000;
  const end = start + note.ms / 1000;

  osc.type = note.wave;
  osc.frequency.setValueAtTime(note.from, start);
  if (note.to !== note.from) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(note.to, 1), end);
  }

  /* Attack of four milliseconds, then a curve down to silence. The tiny
     attack is what stops the envelope itself from clicking. */
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(
    note.gain * MASTER_GAIN,
    start + 0.004,
  );
  amp.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

// ---------------------------------------------------------------
// The provider
// ---------------------------------------------------------------

export interface SoundControl {
  /** Whether the cabinet is currently allowed to make a noise. */
  on: boolean;
  /** Arms or silences it, and plays the arming cue when it goes on. */
  toggle: () => void;
  /** Plays a cue. A no-op while off, so callers never have to ask. */
  play: (cue: SoundCue) => void;
}

const SoundCtx = createContext<SoundControl>({
  on: false,
  toggle: () => undefined,
  play: () => undefined,
});

export function SoundProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(reducer, SEED, SOUND_CODEC);
  const on = state.on;

  /* Read through a ref inside the delegated listener below, so the
     listener is attached once for the life of the application rather than
     being torn down and rebuilt every time the state changes. */
  const onRef = useRef(on);
  onRef.current = on;
  const lastRef = useRef<{ cue: SoundCue | null; at: number }>({
    cue: null,
    at: 0,
  });

  const play = useCallback((cue: SoundCue) => {
    if (!onRef.current) return;
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    const last = lastRef.current;
    if (last.cue === cue && now - last.at < REPEAT_GUARD_MS) return;
    lastRef.current = { cue, at: now };

    const ac = audio();
    if (!ac) return;
    const at = ac.currentTime;
    for (const note of PALETTE[cue]) strike(note, at, ac);
  }, []);

  /**
   * ONE DELEGATED LISTENER, NOT A PROP ON FORTY CONTROLS.
   *
   * Every pressable thing in this application would otherwise need an
   * onClick that remembers to make a noise, which is forty places to
   * forget and forty diffs on a feature that is off by default. A single
   * listener on the document, in the capture phase so it still fires when
   * a handler stops propagation, does the whole of it.
   *
   * WHAT IS DELIBERATELY EXCLUDED, and each exclusion is a real
   * annoyance somebody would otherwise have hit:
   *   inputs, textareas and selects, because a person choosing a period
   *     from a list is not pressing a key, and typing is not a percussion
   *     instrument;
   *   anything carrying data-sound="off", the opt out for a control that
   *     plays its own cue instead, like the ground switch;
   *   a click with no button or link behind it, which is a click on the
   *     page rather than on a control.
   */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const listener = (event: Event) => {
      if (!onRef.current) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("input, textarea, select, [data-sound='off']")) return;
      const hit = target.closest("button, a[href], [role='button']");
      if (!hit) return;
      play("press");
    };
    document.addEventListener("click", listener, { capture: true });
    return () =>
      document.removeEventListener("click", listener, { capture: true });
  }, [play]);

  const toggle = useCallback(() => {
    const next = !onRef.current;
    dispatch({ type: "TOGGLE" });
    /* The arming press is inside a user gesture, which is the only moment
       a browser will let the context start, and it is also the moment the
       reader most wants to hear what they just switched on. Silencing it
       makes no sound, obviously, because the point of silencing it is
       silence. */
    if (next) {
      onRef.current = true;
      const ac = audio();
      if (ac) for (const note of PALETTE.land) strike(note, ac.currentTime, ac);
    } else {
      onRef.current = false;
    }
  }, [dispatch]);

  const value = useMemo<SoundControl>(
    () => ({ on, toggle, play }),
    [on, toggle, play],
  );

  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}

export function useSound(): SoundControl {
  return useContext(SoundCtx);
}
