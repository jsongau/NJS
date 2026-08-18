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
 * ── ON BY DEFAULT, WHICH IS THE OWNER'S CALL AND NOT A DEFAULT I
 *    WOULD HAVE PICKED ─────────────────────────────────────────────
 * It shipped silent until armed, on the argument that a hiring manager
 * may be opening this at a desk with other people around them or in an
 * interview with the screen shared, and audio nobody asked for closes a
 * tab. That argument was made twice and the owner has decided the other
 * way. It is his application and the cabinet is louder for it. The
 * argument is left here rather than deleted, because a decision with its
 * reasoning still attached can be reversed by one word in SEED, and one
 * that has been tidied away has to be rediscovered.
 *
 * ── AND WHAT "ON BY DEFAULT" CAN ACTUALLY MEAN ────────────────────
 * Not "plays on load", because no browser permits that. Every one of
 * them refuses to start an AudioContext outside a user gesture, and one
 * created on load starts suspended and stays that way.
 *
 * So the honest reading, and the one implemented here: the cabinet
 * arrives ARMED, and the first sound is the first press. Nothing plays
 * while a reader is looking at the front door, nothing plays while a page
 * is loading, and the moment they touch anything it answers. The
 * AudioContext is created lazily inside whatever click happens first,
 * which is exactly where a browser will allow it, so the arrangement that
 * satisfies the platform and the arrangement that satisfies the owner are
 * the same arrangement.
 *
 * The control still exists and it now works the other way round: it is
 * how a reader in a quiet office turns the thing OFF, in one press, and
 * that choice is what gets written down.
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
 *   refuse  a low flat thud for a send the guards would not let through
 *   pin     the map only: a struck bell with air around it
 *   sweep   the map only: a low rise under a cluster opening
 *
 * ── THE MAP IS A DIFFERENT ROOM AND IT SOUNDS LIKE ONE ────────────
 * Every other screen in this application is a desk: paper, keys, a
 * drawer. The map is the only screen that is a PLACE, drawn as a trade
 * area with distance rings on it, and a wooden desk click over the top of
 * a map is the sound of the furniture rather than the sound of the thing
 * you just touched.
 *
 * So the map has its own two voices and they are built to be recognisable
 * as not-the-desk in the first fifty milliseconds. Where `press` is a
 * triangle wave falling from 210 to 150 in 42ms, dry and short, `pin` is
 * a sine an octave and a half above it that rings for 260ms and is
 * allowed to hang. That is the difference between a key bottoming out and
 * something being struck in a room with air in it, and it is carried by
 * three separate properties rather than by pitch alone: the waveform, the
 * length, and whether it decays or stops.
 *
 * They are routed by ZONE and not by call site. The map surface carries
 * data-sound-zone="map" and the delegated listener reads the nearest zone
 * above whatever was clicked, so every marker, every cluster, every popup
 * control and every filter chip inside that surface speaks in the map's
 * voice without a single component knowing that sound exists. The rail
 * and the strip are outside the zone, so pressing Maps to GET there is a
 * desk click and everything you do once you are there is not.
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
 * ── WHAT IS PERSISTED, AND IT IS NOW THE SILENCE ──────────────────
 * The absent slice always means the default, and the default is now on,
 * so what gets written down is a reader choosing to SILENCE it. That
 * inversion is deliberate and it is the same rule the ground follows:
 * store the departure from the default, never the default itself. A
 * first visit, a blocked storage and a cleared browser all resolve to the
 * same place, and there is only ever one way to say each state.
 */

export type SoundCue =
  | "press"
  | "throw"
  | "send"
  | "land"
  | "refuse"
  | "pin"
  | "sweep";

interface SoundState {
  /** Armed on arrival. The first press is the first sound. */
  on: boolean;
}

type SoundAction = { type: "SET"; on: boolean } | { type: "TOGGLE" };

const SEED: SoundState = { on: true };

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
 * `encode` returns null while sound is ON, because on is the default and
 * the absence of a slice is how this codebase says "still at the
 * default". What is stored is the silence: a reader who pressed the
 * control to shut the cabinet up, whose choice must survive every later
 * visit rather than being undone by the default they already rejected.
 *
 * THE SIGNATURE IS BUMPED TO v2 ON PURPOSE. The v1 slice meant "armed"
 * and stored true; this one means "silenced" and stores false, so a v1
 * payload read under v2 rules would say the opposite of what its writer
 * meant. Bumping the version drops those cleanly, which costs an early
 * reader their stored preference exactly once and never says the wrong
 * thing about it.
 */
const SOUND_CODEC: SliceCodec<SoundState> = {
  slice: "sound",
  signature: signatureOf("sound.silenced.v2"),
  encode: (state) => (state.on ? null : { armed: false }),
  decode: (raw, seed) => {
    if (!isRecord(raw)) return seed;
    /* Only the literal false silences it. Anything else, a corrupt
       payload, a hand edited "no", a number, resolves to the default,
       because a broken value should land a reader where a new one lands
       and not somewhere only a bug can reach. */
    return raw.armed === false ? { on: false } : seed;
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
  /* Struck rather than pressed, and left to ring. The second note is a
     fifth above and a third of the gain, which is the overtone a small
     bell would have given for free and a single oscillator will not. */
  pin: [
    { wave: "sine", from: 880, to: 872, ms: 260, gain: 0.34 },
    { wave: "sine", from: 1320, to: 1310, ms: 190, gain: 0.11, delay: 8 },
  ],
  /* A cluster opening is several things arriving at once, so it rises
     rather than lands, and it sits low enough that it never competes with
     the pin that usually follows it. */
  sweep: [{ wave: "triangle", from: 180, to: 320, ms: 200, gain: 0.3 }],
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

      /*
        THE ZONE DECIDES THE VOICE. One attribute on the map surface, read
        from whatever was clicked upwards, rather than a prop threaded
        through MapBoard, MapCanvas, ClusterLayer, the popup and the
        legend. A screen that wants its own sound announces itself in the
        markup and this listener does the rest.
      */
      const zone = target.closest("[data-sound-zone]");
      const inMap = zone?.getAttribute("data-sound-zone") === "map";

      /*
        Inside the map the hit set is wider, because a Leaflet marker is a
        div with a click handler rather than a button, and refusing to
        make a sound for the single most touched object on the screen
        would be the strictness winning over the point.
      */
      const hit = inMap
        ? target.closest(
            "button, a[href], [role='button'], .leaflet-marker-icon, .leaflet-interactive",
          )
        : target.closest("button, a[href], [role='button']");
      if (!hit) return;

      if (!inMap) {
        play("press");
        return;
      }
      /* A cluster is several organisations under one mark, so it gets the
         rise. A single organisation is one thing, struck once. */
      const cluster = hit.classList.contains("ob-marker--cluster");
      play(cluster ? "sweep" : "pin");
    };
    document.addEventListener("click", listener, { capture: true });
    return () =>
      document.removeEventListener("click", listener, { capture: true });
  }, [play]);

  const toggle = useCallback(() => {
    const next = !onRef.current;
    dispatch({ type: "TOGGLE" });
    /* Turning it back ON plays the chord, inside the gesture that did it,
       which is both the only moment a browser will let the context start
       and the moment the reader most wants to hear what they just chose.
       Silencing it makes no sound, obviously, because the point of
       silencing it is silence. */
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
