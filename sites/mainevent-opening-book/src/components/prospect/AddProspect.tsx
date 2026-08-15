import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import type { Lane, OrgType } from "@/domain/types";
import { LANE_META, LANE_ORDER } from "@/domain/lanes";
import { PROSPECTS } from "@/data/prospects";
import { ORG_TYPE_META, ORG_TYPE_ORDER } from "@/domain/selectors/record";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import { Button } from "@/components/primitives/Button";
import {
  arr,
  enumKey,
  isRecord,
  signatureOf,
  str,
  usePersistedReducer,
  type SliceCodec,
} from "@/state/persist";
import styles from "./AddProspect.module.css";

/**
 * A BUSINESS FOUND ON THE PAVEMENT, ON THE BOARD BEFORE HE IS BACK IN
 * THE CAR.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────
 * The hundred and two organisations in data/prospects.ts were researched
 * at a desk. The job they support is not done at a desk: it is tabling,
 * networking and go-sees, and the whole point of walking a trade area is
 * that you find things the desk research missed. A prospecting tool with
 * no way to add a prospect asks the one person using it to remember the
 * unit next to the tyre shop until he gets home, which is the same as
 * asking him to lose it.
 *
 * ── THE ADDED ROWS ARE MARKED FOR LIFE, AND THAT IS THE POINT ──────
 * Every row written here carries `provenance: "user_input"` and is drawn
 * with the badge that goes with it, everywhere it appears. The hundred
 * and two researched rows each carry a source: a Google Places id, or a
 * page on the organisation's own site that somebody read. A row typed on
 * a pavement carries neither, and the credibility of the whole data set
 * rests on those two kinds of row never being confusable. So they are
 * held in a different array, drawn under a different heading, and
 * badged. Nothing here is ever written into PROSPECTS.
 *
 * The cost of that separation is real and worth naming: an added row
 * cannot be scored by the desk, plotted on the map or opened in the
 * record modal, because every one of those reads a researched field it
 * does not have. It has a name, a door and a note, which is what a rep
 * standing outside a shop actually knows, and inventing a latitude or a
 * likely group size to make it fit the other surfaces would be putting
 * made-up data on the one board that argues its numbers are real.
 *
 * ── WHAT THE RESEARCH SAYS THE FORM MUST BE ────────────────────────
 * HoneyBook's mobile add flow lands a new project in a default stage and
 * tells the user plainly that the rest can be filled in later. Badger
 * Maps logs a field interaction as it happens rather than afterwards.
 * Both point the same way: one required field, everything else optional,
 * a default stage set without asking, and three large targets for the
 * one classification that changes how the organisation is worked.
 *
 * So: the name is required and nothing else is. The organisation type is
 * three big tiles plus the honest fourth, because a chain's decision is
 * not in the building and that changes the next move. There is no status
 * picker, because a business found this afternoon has never been touched
 * and offering to say otherwise invites a lie into the fact table.
 *
 * ── ONE STORE, MOUNTED ONCE ────────────────────────────────────────
 * The trigger appears in the rail and again on the inbox, and two copies
 * of a persisted reducer would be two lists that overwrite each other in
 * the same storage slice. So the state is a provider mounted once in
 * App.tsx and both triggers dispatch into it.
 */

// ---------------------------------------------------------------
// The row
// ---------------------------------------------------------------

export interface AddedProspect {
  id: string;
  /** The only field that is required. */
  name: string;
  address: string;
  phone: string;
  website: string;
  lane: Lane;
  orgType: OrgType;
  /** A role, never a name. Held to the same rule as the researched rows. */
  decisionMakerTitle: string;
  note: string;
  /** ISO instant, stamped at save. */
  addedAt: string;
  /**
   * Carried on the row rather than assumed by the reader.
   *
   * A consumer that has an AddedProspect in hand can badge it without
   * knowing which array it came out of, which is what stops a later
   * screen rendering one of these as though it had been researched.
   */
  provenance: "user_input";
}

export interface AddedState {
  rows: AddedProspect[];
}

export type AddedAction =
  | { type: "ADD"; row: AddedProspect }
  | { type: "REMOVE"; id: string }
  | { type: "RESET" };

const SEED: AddedState = { rows: [] };

function reducer(state: AddedState, action: AddedAction): AddedState {
  switch (action.type) {
    case "ADD":
      /* Newest first. The row somebody just typed is the row they want to
         see, and appending would bury it under a morning's work. */
      return { rows: [action.row, ...state.rows] };
    case "REMOVE":
      return { rows: state.rows.filter((r) => r.id !== action.id) };
    case "RESET":
      return SEED;
    default:
      return state;
  }
}

/**
 * The storage slice.
 *
 * There is no seed to drift against, so the signature is a constant with
 * a version in it: these rows are the reader's own and no data release
 * can invalidate them. Everything else about the write, the throttle, the
 * quota failure, the reset, is inherited from state/persist.ts rather
 * than written a second time here.
 */
const CODEC: SliceCodec<AddedState> = {
  slice: "added-prospects",
  signature: signatureOf("added-prospects.v1"),
  encode: (state) => (state.rows.length > 0 ? state.rows : null),
  decode: (raw, seed) => {
    const rows: AddedProspect[] = [];
    for (const item of arr(raw)) {
      if (!isRecord(item)) continue;
      const id = str(item.id);
      const name = str(item.name);
      const lane = enumKey(item.lane, LANE_META);
      const orgType = enumKey(item.orgType, ORG_TYPE_META);
      const addedAt = str(item.addedAt);
      if (!id || !name || !lane || !orgType || !addedAt) continue;
      rows.push({
        id,
        name,
        address: str(item.address) ?? "",
        phone: str(item.phone) ?? "",
        website: str(item.website) ?? "",
        lane,
        orgType,
        decisionMakerTitle: str(item.decisionMakerTitle) ?? "",
        note: str(item.note) ?? "",
        addedAt,
        /* Forced rather than read. A payload in local storage is
           user-writable, and a row that arrived claiming to be researched
           would be the one lie this file exists to prevent. */
        provenance: "user_input",
      });
    }
    return rows.length > 0 ? { rows } : seed;
  },
};

// ---------------------------------------------------------------
// The provider
// ---------------------------------------------------------------

const StateCtx = createContext<AddedState>(SEED);
const DispatchCtx = createContext<Dispatch<AddedAction>>(() => {});

export function AddedProspectsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer(reducer, SEED, CODEC);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

/** Every organisation the reader has added, newest first. */
export function useAddedProspects(): AddedProspect[] {
  return useContext(StateCtx).rows;
}

export function useAddedProspectsDispatch(): Dispatch<AddedAction> {
  return useContext(DispatchCtx);
}

// ---------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------

/**
 * The most likely data error in a hundred and two record territory is a
 * solo rep re-adding a business he contacted in March, so the name field
 * checks itself as it is typed.
 *
 * It warns and never blocks. Two branches of the same franchise are two
 * organisations with nearly the same name and both belong on the board,
 * so a form that refused the second would be wrong more often than the
 * duplicate it caught.
 */
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(the|inc|llc|co|company|of|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function looksLikeExisting(
  name: string,
  added: AddedProspect[],
): string | null {
  const key = normalise(name);
  if (key.length < 4) return null;
  for (const p of PROSPECTS) {
    const other = normalise(p.name);
    if (other === key || other.includes(key) || key.includes(other)) {
      return p.name;
    }
  }
  for (const row of added) {
    const other = normalise(row.name);
    if (other === key) return row.name;
  }
  return null;
}

// ---------------------------------------------------------------
// The form
// ---------------------------------------------------------------

interface Draft {
  name: string;
  address: string;
  phone: string;
  website: string;
  lane: Lane;
  orgType: OrgType;
  decisionMakerTitle: string;
  note: string;
}

const EMPTY: Draft = {
  name: "",
  address: "",
  phone: "",
  website: "",
  /* Local retail and food is the lane a rep is standing in when he uses
     this form. It is a default rather than an assumption: the picker is
     one tap away and every other lane is in it. */
  lane: "local-retail-food",
  orgType: "independent",
  decisionMakerTitle: "",
  note: "",
};

function isDirty(draft: Draft): boolean {
  return (
    draft.name.trim() !== "" ||
    draft.address.trim() !== "" ||
    draft.phone.trim() !== "" ||
    draft.website.trim() !== "" ||
    draft.decisionMakerTitle.trim() !== "" ||
    draft.note.trim() !== ""
  );
}

/**
 * The button and its dialog.
 *
 * `label` lets the rail say one thing in a narrow column and the inbox
 * another above a list, without two components that drift apart.
 */
export function AddProspectButton({
  label = "Add a prospect",
  variant = "secondary",
}: {
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const added = useAddedProspects();
  const dispatch = useAddedProspectsDispatch();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<AddedProspect | null>(null);

  const titleId = useId();
  const nameId = useId();
  const laneId = useId();
  const roleId = useId();
  const addressId = useId();
  const phoneId = useId();
  const siteId = useId();
  const noteId = useId();
  const dupId = useId();

  /**
   * The trigger, reached through its wrapper rather than by a ref on the
   * button itself.
   *
   * The shared Button primitive does not forward a ref, and giving it one
   * would be an edit to a file three other screens depend on for the sake
   * of one focus call here.
   */
  const wrapRef = useRef<HTMLDivElement>(null);
  const focusTrigger = useCallback(() => {
    wrapRef.current?.querySelector("button")?.focus();
  }, []);
  const nameRef = useRef<HTMLInputElement>(null);

  const duplicate = useMemo(
    () => (draft.name.trim() ? looksLikeExisting(draft.name, added) : null),
    [draft.name, added],
  );

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
    /* Focus goes back to the control that opened the dialog. A reader who
       adds three businesses in a row is standing on the same button each
       time rather than at the top of the document. */
    focusTrigger();
  }, [focusTrigger]);

  useEffect(() => {
    if (!open) return;
    nameRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  function save() {
    const name = draft.name.trim();
    if (name === "") {
      setError("A name is the one thing this row cannot be saved without.");
      nameRef.current?.focus();
      return;
    }
    const row: AddedProspect = {
      id: `added-${Date.now()}`,
      name,
      address: draft.address.trim(),
      phone: draft.phone.trim(),
      website: draft.website.trim(),
      lane: draft.lane,
      orgType: draft.orgType,
      decisionMakerTitle: draft.decisionMakerTitle.trim(),
      note: draft.note.trim(),
      addedAt: new Date().toISOString(),
      provenance: "user_input",
    };
    dispatch({ type: "ADD", row });
    setDraft(EMPTY);
    setJustAdded(row);
    setOpen(false);
    focusTrigger();
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <Button
        variant={variant}
        glyph="+"
        onClick={() => {
          setJustAdded(null);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        className={styles.trigger}
      >
        {label}
      </Button>

      {/*
        THE CONFIRMATION IS A LINE WITH AN UNDO IN IT, NOT A DIALOG.
        A modal that says "saved" is a second press charged for nothing,
        and a person outside a shop is not going to read it. The line
        stays until the next add, because a control that disappears on a
        timer is a control somebody reaches for and finds gone.
      */}
      {justAdded ? (
        <p className={styles.saved} role="status">
          <span className={styles.savedName}>{justAdded.name}</span> added to
          the board.{" "}
          <button
            type="button"
            className={styles.undo}
            onClick={() => {
              dispatch({ type: "REMOVE", id: justAdded.id });
              setJustAdded(null);
            }}
          >
            Undo
          </button>
        </p>
      ) : null}

      {open ? (
        <div
          className={styles.scrim}
          onMouseDown={(e) => {
            /* The backdrop closes an empty form and refuses to close one
               with typing in it. Losing a name somebody walked across a
               car park to read is the worst thing this dialog could do,
               and Escape and Cancel are both still there. */
            if (e.target !== e.currentTarget) return;
            if (isDirty(draft)) return;
            close();
          }}
        >
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className={styles.head}>
              <h2 className={styles.title} id={titleId}>
                Add a prospect
              </h2>
              <ProvenanceBadge provenance="user_input" compact />
              <button
                type="button"
                className={styles.close}
                onClick={close}
                aria-label="Close without saving"
              >
                ✕
              </button>
            </div>

            <div className={styles.body}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={nameId}>
                  Name
                  <span className={styles.required}>Required</span>
                </label>
                <input
                  ref={nameRef}
                  id={nameId}
                  className={styles.input}
                  value={draft.name}
                  autoComplete="off"
                  aria-describedby={duplicate ? dupId : undefined}
                  onChange={(e) => {
                    setError(null);
                    setDraft((d) => ({ ...d, name: e.target.value }));
                  }}
                />
                {duplicate ? (
                  <p className={styles.dupe} id={dupId}>
                    <span className={styles.dupeGlyph} aria-hidden="true">
                      ◈
                    </span>
                    Close to <strong>{duplicate}</strong>, which is already on
                    the board.
                  </p>
                ) : null}
                {error ? (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              {/*
                THE ICON FILTER'S OTHER HALF. The same four marks the rail
                filters by, chosen here, so a business added as a chain is
                findable under the chain filter three minutes later.
              */}
              <fieldset className={styles.tiles}>
                <legend className={styles.label}>Who decides</legend>
                <div className={styles.tileRow}>
                  {ORG_TYPE_ORDER.map((type) => {
                    const meta = ORG_TYPE_META[type];
                    const on = draft.orgType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        className={styles.tile}
                        aria-pressed={on}
                        onClick={() => setDraft((d) => ({ ...d, orgType: type }))}
                      >
                        <span
                          className={styles.tileGlyph}
                          style={{ color: meta.cssVar }}
                          aria-hidden="true"
                        >
                          {meta.glyph}
                        </span>
                        <span className={styles.tileLabel}>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className={styles.pair}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={laneId}>
                    Lane
                  </label>
                  <select
                    id={laneId}
                    className={styles.select}
                    value={draft.lane}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, lane: e.target.value as Lane }))
                    }
                  >
                    {LANE_ORDER.map((lane) => (
                      <option key={lane} value={lane}>
                        {LANE_META[lane].glyph} {LANE_META[lane].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor={roleId}>
                    Who to ask for
                  </label>
                  <input
                    id={roleId}
                    className={styles.input}
                    value={draft.decisionMakerTitle}
                    placeholder="Store manager"
                    autoComplete="off"
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        decisionMakerTitle: e.target.value,
                      }))
                    }
                  />
                  <p className={styles.hint}>A role, not a person.</p>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={phoneId}>
                  Phone
                </label>
                <input
                  id={phoneId}
                  className={styles.input}
                  type="tel"
                  inputMode="tel"
                  value={draft.phone}
                  autoComplete="off"
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, phone: e.target.value }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={addressId}>
                  Address
                </label>
                <input
                  id={addressId}
                  className={styles.input}
                  value={draft.address}
                  autoComplete="off"
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, address: e.target.value }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={siteId}>
                  Website
                </label>
                <input
                  id={siteId}
                  className={styles.input}
                  type="url"
                  inputMode="url"
                  value={draft.website}
                  autoComplete="off"
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, website: e.target.value }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={noteId}>
                  Note
                </label>
                <textarea
                  id={noteId}
                  className={styles.textarea}
                  rows={3}
                  value={draft.note}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, note: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className={styles.foot}>
              <p className={styles.footNote}>
                Saved as never touched, marked as entered by hand, kept apart
                from the {PROSPECTS.length} researched rows.
              </p>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={save}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
