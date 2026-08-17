import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { PartnerKind, RelationshipState } from "@/domain/licensing";
import {
  APPROVAL_STATE,
  PARTNER_KIND,
  PARTNER_KIND_ORDER,
  RELATIONSHIP_STATE,
  RELATIONSHIP_STATE_ORDER,
  formatDate,
} from "@/domain/licensing";
import {
  ANIME_GAP,
  LICENCES,
  LICENCE_BY_ID,
  NATURES_MARK_RETAIL_PARTNERS,
  NATURES_MARK_ROOT,
  NATURES_MARK_SOURCE,
  PARTNERS_AS_OF,
} from "@/data/partners";
import {
  STALENESS_DAYS,
  STALENESS_META,
  coldRows,
  idleAgreements,
  licenceCoverage,
  partnerCountsByKind,
  partnerCountsByState,
  partnerRows,
} from "@/domain/selectors/partners";
import { ProvenanceBadge } from "@/components/primitives/ProvenanceBadge";
import {
  Bar,
  FilterChip,
  SectionHead,
  Stat,
  StatStrip,
  TokenMark,
} from "@/components/licensing/Panels";
import styles from "./PartnersPage.module.css";

/**
 * THE RELATIONSHIP REGISTER.
 *
 * A second posting, at Round1 in Cerritos, files three sentences under
 * "Vendor, Licensor & Budget Management". This screen is the first of
 * them: "Maintain strong relationships with suppliers and licensors while
 * scouting new vendor opportunities."
 *
 * ── WHY A REGISTER RATHER THAN A CONTACT LIST ─────────────────────
 * A contact list answers "who do we buy from". Nobody has ever lost money
 * on that question. What costs money is the question a contact list
 * cannot answer: which of these relationships is quietly dying. Supplier
 * relationships do not end with a letter. Four months pass, the person
 * who knew you leaves, and the next quote comes back at list price from a
 * stranger who has no reason to hold a press slot for you.
 *
 * So every row carries days since last worked, computed at render, and
 * the table opens sorted by it. The coldest relationship is the first
 * thing on the screen whether or not anybody asked to see it.
 *
 * ── THE ONE LINE THAT STOPS A READER MISREADING THE PAGE ──────────
 * Nature's Mark is a real company and it publishes a real list of
 * licensed properties. That is a fact about Nature's Mark. It is not a
 * fact about Round1, and a table of Disney, Sanrio and Warner Bros.
 * sitting inside an application about an arcade and bowling business
 * would be read as a deal by anybody scanning it in ten seconds.
 *
 * The page therefore says, above the table and in one line, that this is
 * reachable capability rather than an existing venue agreement. That
 * sentence is not instructional prose about how to use a control. It is a
 * fact about the data, which is the only kind of sentence this
 * application allows on a working surface.
 *
 * ── WHAT IS PUBLIC AND WHAT IS INVENTED ───────────────────────────
 * Exactly two things on this screen are public: the licence names and the
 * retailer names, both read off natures-mark.com on 13 August 2026, both
 * carrying the URL. Every lead time, every minimum order quantity, every
 * date and every other company name is invented for this prototype and
 * badged illustrative. That includes the figures on the Nature's Mark row
 * itself, which is the most important badge on the page: a real company
 * with invented commercial terms is the one shape of row that could
 * mislead somebody.
 *
 * ── WHY A GAP BLOCK SITS SECOND AND NOT LAST ──────────────────────
 * The Round1 posting asks for anime and game properties and this
 * register holds none. That is a hole in the middle of the one screen
 * that posting would be read against, and a hole has exactly three
 * possible treatments: fill it with a claim, leave it silent, or answer
 * it.
 *
 * Filling it was rejected in `data/partners.ts` and the reasoning is
 * there. Silence was rejected here. A reader who knows the trade will
 * notice the absence within seconds of seeing nine Western family
 * licences offered to an arcade led by anime, and an absence somebody
 * else notices first is worth less than nothing: it reads either as not
 * knowing the floor or as hoping nobody checked.
 *
 * So the block sits directly under the licence list, while the nine are
 * still on screen, and it argues the one honest bridge that exists
 * before it states the gap that remains. Putting it last would have made
 * it a footnote, and a gap disclosed in a footnote is a gap somebody was
 * hoping you would read late.
 *
 * The block prints no anime or game property name, deliberately, and
 * says on screen that it is doing so. That sentence is the only form of
 * the claim a reader can check on the spot: they can look, and there are
 * none.
 */

/** Injected rather than read off the clock, so the arithmetic is checkable. */
const NOW = PARTNERS_AS_OF;

/**
 * A span that is built on one side and not on the other.
 *
 * Drawn here rather than pulled from an icon set, and drawn as a
 * diagram rather than as decoration: the solid deck with piers under it
 * is the part of the catalogue that exists, the break is the gap, and
 * the dashed deck is a crossing nobody has built. It carries no meaning
 * that the words beside it do not already carry, which is why it is
 * hidden from assistive technology instead of being given a label that
 * would make a reader listen to a picture of an argument.
 */
function BridgeMark() {
  return (
    <svg
      className={styles.gapMark}
      viewBox="0 0 76 20"
      width="76"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {/* Built: a deck and the two piers holding it up. */}
        <path d="M3 7 H34" />
        <path d="M9 7 V17" />
        <path d="M28 7 V17" />
        <path d="M3 17 H34" strokeWidth="1" opacity="0.5" />

        {/* Not built: the same deck, drawn as an intention. */}
        <path d="M42 7 H73" strokeDasharray="3 4" opacity="0.75" />
        <path d="M67 7 V17" strokeDasharray="3 4" opacity="0.75" />
      </g>
    </svg>
  );
}

type StateFilter = RelationshipState | "all";
type KindFilter = PartnerKind | "all";

export function PartnersPage() {
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => partnerRows(NOW), []);
  const byState = useMemo(() => partnerCountsByState(rows), [rows]);
  const byKind = useMemo(() => partnerCountsByKind(rows), [rows]);
  const cold = useMemo(() => coldRows(rows), [rows]);
  const idle = useMemo(() => idleAgreements(rows), [rows]);
  const coverage = useMemo(() => licenceCoverage(), []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (stateFilter !== "all" && r.partner.state !== stateFilter) return false;
      if (kindFilter !== "all" && r.partner.kind !== kindFilter) return false;
      if (q) {
        const hay =
          `${r.partner.name} ${r.partner.supplies} ${r.partner.region} ${r.licences
            .map((l) => l.name)
            .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, stateFilter, kindFilter, query]);

  const onPartnersPage = LICENCES.filter((l) => l.onPartnersPage).length;

  /* Both counts are read off the gap record rather than written into the
     markup, so the zero on screen stays a zero because the data says so
     and not because a digit was typed here once and never revisited. */
  const bridge = LICENCE_BY_ID[ANIME_GAP.bridgeLicenceId];
  const japaneseOnList = ANIME_GAP.japaneseLicenceIds.length;
  const animeOrGameOnList = ANIME_GAP.animeOrGameLicenceIds.length;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Supply side, as at {formatDate(NOW)}</p>
          <h1 className={styles.h1}>Partners</h1>

          <blockquote className={styles.posting}>
            <p>
              "Maintain strong relationships with suppliers and licensors while
              scouting new vendor opportunities."
            </p>
            <cite>
              Round1, Cerritos. New Business Development Promotion Planner
              Manager
            </cite>
          </blockquote>

          {/* THE FRAMING LINE. One sentence, and it is a fact about the
              data rather than a lesson about the screen. */}
          <p className={styles.framing}>
            <span aria-hidden="true" className={styles.framingGlyph}>
              ◆
            </span>
            <span>
              Capability, not a venue deal. Nature's Mark publishes these
              licences; Round1 holds no agreement with any of them.
            </span>
          </p>
        </header>

        <StatStrip label="The register at a glance">
          <Stat
            value={rows.length}
            label="Partners on the register"
            note="Suppliers, manufacturers and licensor routes, in every state from prospect to lapsed."
            provenance="illustrative"
          />
          <Stat
            value={byState.active}
            label="Active and trading"
            note="Signed and with orders flowing. The rest are prospects, talks, samples, holds or lapses."
            provenance="illustrative"
            tone="var(--ok)"
          />
          <Stat
            value={cold.length}
            label={`Cold, over ${STALENESS_DAYS.cold} days`}
            note="Not worked in sixty days or more. The count this register exists to keep visible."
            provenance="modeled"
            tone="var(--warn)"
            live
          />
          <Stat
            value={idle.length}
            label="Signed, nothing ordered"
            note="Terms agreed and no purchase order raised against them. A signature doing no work."
            provenance="illustrative"
            tone="var(--warn)"
          />
          <Stat
            value={onPartnersPage}
            label="Licences published"
            note="Named under License Partners on natures-mark.com/partners, read 13 August 2026."
            provenance="public"
          />
          <Stat
            value={NATURES_MARK_RETAIL_PARTNERS.length}
            label="Retailers published"
            note="Named under Retail Partners on the same page. Evidence of compliance at scale rather than a claim."
            provenance="public"
          />
        </StatStrip>

        {/* ===========================================================
            1. THE MANUFACTURING ROUTE
            =========================================================== */}
        <section className={styles.section} aria-labelledby="nm-h">
          <SectionHead
            eyebrow="One"
            id="nm-h"
            title="The manufacturing route"
            lede="One supplier connection, with a published licence list and a published retailer list behind it."
            meta={
              <>
                <ProvenanceBadge provenance="public" compact />
                <span>
                  Both lists read off{" "}
                  <a
                    className={styles.link}
                    href={NATURES_MARK_SOURCE}
                    target="_blank"
                    rel="noreferrer"
                  >
                    natures-mark.com/partners
                  </a>{" "}
                  on 13 August 2026.
                </span>
              </>
            }
          />

          <div className={styles.nmGrid}>
            <div className={styles.nmCard}>
              <h3 className={styles.nmTitle}>Licences the page names</h3>
              <ul className={styles.licenceList}>
                {LICENCES.map((l) => (
                  <li key={l.id} className={styles.licenceItem}>
                    <div className={styles.licenceTop}>
                      <span className={styles.licenceName}>{l.name}</span>
                      <ProvenanceBadge provenance={l.provenance} compact />
                      {!l.onPartnersPage ? (
                        <span className={styles.rootOnly}>
                          <span aria-hidden="true">◇</span> Root page only
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.licenceFit}>{l.fitNote}</p>
                  </li>
                ))}
              </ul>
              <p className={styles.nmFoot}>
                Harry Potter appears on{" "}
                <a
                  className={styles.link}
                  href={NATURES_MARK_ROOT}
                  target="_blank"
                  rel="noreferrer"
                >
                  the root page
                </a>{" "}
                and not on the partners page. Recorded as read, not merged.
              </p>
            </div>

            <div className={styles.nmCard}>
              <h3 className={styles.nmTitle}>
                Retailers the same page names{" "}
                <span className={`${styles.nmCount} num`}>
                  {NATURES_MARK_RETAIL_PARTNERS.length}
                </span>
              </h3>
              <ul className={styles.retailList}>
                {NATURES_MARK_RETAIL_PARTNERS.map((r) => (
                  <li key={r} className={styles.retailItem}>
                    {r}
                  </li>
                ))}
              </ul>
              <p className={styles.nmFoot}>
                No factory, country of manufacture or sourcing route is named
                on either page. None is claimed here.
              </p>
            </div>
          </div>
        </section>

        {/* ===========================================================
            2. THE GAP, AND THE ONE BRIDGE ACROSS PART OF IT
            =========================================================== */}
        <section className={styles.section} aria-labelledby="gap-h">
          <SectionHead
            eyebrow="Two"
            id="gap-h"
            title="The anime gap, and the one bridge on the list"
            lede="The posting asks for a category this register does not hold. Both halves of that are on this screen."
            meta={
              <>
                <ProvenanceBadge provenance="modeled" compact />
                <span>
                  Everything in this block is an argument built on the nine
                  published names above. An argument is not a source, and
                  nothing here is badged as one.
                </span>
              </>
            }
          />

          <blockquote className={styles.posting}>
            <p>{ANIME_GAP.postingLine}</p>
            <cite>{ANIME_GAP.postingCite}</cite>
          </blockquote>

          <StatStrip label="The gap in two figures">
            <Stat
              value={japaneseOnList}
              unit={`of ${onPartnersPage}`}
              label="Japanese properties on the published list"
              note="Sanrio, and only Sanrio. Counted off the register rather than typed in."
              provenance="modeled"
            />
            <Stat
              value={animeOrGameOnList}
              unit={`of ${onPartnersPage}`}
              label="Anime or game properties on the register"
              note="No source read for this application publishes one. The figure is stated rather than filled."
              provenance="modeled"
              tone="var(--warn)"
            />
          </StatStrip>

          <div className={styles.gapGrid}>
            <div className={styles.gapCol}>
              <h3 className={styles.gapColTitle}>
                <BridgeMark />
                <span>What the list does reach</span>
              </h3>

              {/* The bridge names itself, and the name wears the public
                  badge while the argument around it wears modeled. Those
                  are two different kinds of fact sitting one line apart,
                  so they are badged one line apart. */}
              <p className={styles.gapBridge}>
                <span className={styles.gapBridgeName}>{bridge.name}</span>
                <ProvenanceBadge provenance={bridge.provenance} compact />
                <span className={styles.gapBridgeSrc}>
                  Named under License Partners on{" "}
                  <a
                    className={styles.link}
                    href={bridge.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    natures-mark.com/partners
                  </a>
                </span>
              </p>

              <ul className={styles.gapList}>
                {ANIME_GAP.reach.map((p) => (
                  <li key={p.id} className={styles.gapItem}>
                    <h4 className={styles.gapHeading}>
                      <span>{p.heading}</span>
                      <ProvenanceBadge provenance={p.provenance} compact />
                    </h4>
                    <p className={styles.gapBody}>{p.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${styles.gapCol} ${styles.gapColShort}`}>
              <h3 className={styles.gapColTitle}>
                <span>What it does not reach</span>
              </h3>
              <ul className={styles.gapList}>
                {ANIME_GAP.shortfall.map((p) => (
                  <li key={p.id} className={styles.gapItem}>
                    <h4 className={styles.gapHeading}>
                      <span>{p.heading}</span>
                      <ProvenanceBadge provenance={p.provenance} compact />
                    </h4>
                    <p className={styles.gapBody}>{p.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.gapCol}>
              <h3 className={styles.gapColTitle}>
                <span>What closing it would take</span>
              </h3>
              <ul className={styles.gapList}>
                {ANIME_GAP.route.map((p) => (
                  <li key={p.id} className={styles.gapItem}>
                    <h4 className={styles.gapHeading}>
                      <span>{p.heading}</span>
                      <ProvenanceBadge provenance={p.provenance} compact />
                    </h4>
                    <p className={styles.gapBody}>{p.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.gapRefuse}>
            <h3 className={styles.gapColTitle}>
              <span>What this block does not claim</span>
            </h3>
            <ul className={styles.refuseList}>
              {ANIME_GAP.notClaimed.map((line) => (
                <li key={line} className={styles.refuseItem}>
                  <span aria-hidden="true" className={styles.refuseGlyph}>
                    ○
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===========================================================
            3. THE REGISTER
            =========================================================== */}
        <section className={styles.section} aria-labelledby="reg-h">
          <SectionHead
            eyebrow="Three"
            id="reg-h"
            title="The register"
            lede="Coldest relationship first."
            meta={
              <>
                <ProvenanceBadge provenance="illustrative" compact />
                <span>
                  Every lead time, minimum and date below is invented for this
                  prototype.
                </span>
              </>
            }
          />

          <div className={styles.filters}>
            <div className={styles.filterRow} role="group" aria-label="Relationship state">
              <FilterChip
                token={{
                  glyph: "▣",
                  label: "All states",
                  cssVar: "var(--text-2)",
                  note: "Every relationship state on the register.",
                }}
                count={rows.length}
                pressed={stateFilter === "all"}
                onClick={() => setStateFilter("all")}
              />
              {RELATIONSHIP_STATE_ORDER.map((s) => (
                <FilterChip
                  key={s}
                  token={RELATIONSHIP_STATE[s]}
                  count={byState[s]}
                  pressed={stateFilter === s}
                  onClick={() => setStateFilter(stateFilter === s ? "all" : s)}
                />
              ))}
            </div>

            <div className={styles.filterRow} role="group" aria-label="What they supply">
              <FilterChip
                token={{
                  glyph: "▤",
                  label: "All kinds",
                  cssVar: "var(--text-2)",
                  note: "Every category of supplier on the register.",
                }}
                count={rows.length}
                pressed={kindFilter === "all"}
                onClick={() => setKindFilter("all")}
              />
              {PARTNER_KIND_ORDER.map((k) => (
                <FilterChip
                  key={k}
                  token={PARTNER_KIND[k]}
                  count={byKind[k]}
                  pressed={kindFilter === k}
                  onClick={() => setKindFilter(kindFilter === k ? "all" : k)}
                />
              ))}
            </div>

            <div className={styles.searchRow}>
              <label className={styles.searchLabel} htmlFor="partner-search">
                Search partners
              </label>
              <input
                id="partner-search"
                className={styles.search}
                type="search"
                value={query}
                placeholder="Name, supply, region, licence"
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className={styles.searchCount} aria-live="polite">
                <strong className="num">{visible.length}</strong> of{" "}
                <span className="num">{rows.length}</span> shown
              </span>
            </div>
          </div>

          <ul className={styles.register}>
            {visible.map((r) => (
              <li key={r.partner.id} className={styles.row}>
                <div className={styles.rowHead}>
                  <h3 className={styles.rowName}>{r.partner.name}</h3>
                  <TokenMark token={PARTNER_KIND[r.partner.kind]} small />
                  <TokenMark token={RELATIONSHIP_STATE[r.partner.state]} />
                  <ProvenanceBadge provenance={r.partner.provenance} compact />
                </div>

                <p className={styles.rowSupplies}>{r.partner.supplies}</p>

                {r.licences.length > 0 ? (
                  <ul className={styles.rowLicences}>
                    {r.licences.map((l) => (
                      <li key={l.id} className={styles.rowLicence}>
                        {l.name}
                      </li>
                    ))}
                    <li className={styles.rowApproval}>
                      <TokenMark
                        token={APPROVAL_STATE[r.partner.approval]}
                        small
                      />
                    </li>
                  </ul>
                ) : null}

                <dl className={styles.rowFacts}>
                  <div className={styles.fact}>
                    <dt>Lead time</dt>
                    <dd>
                      <span className="num">{r.partner.leadTimeDays}</span>{" "}
                      working days
                      <span className={styles.factSub}>
                        <span className="num">{r.leadTimeWeeks}</span> weeks
                      </span>
                    </dd>
                  </div>
                  <div className={styles.fact}>
                    <dt>Minimum order</dt>
                    <dd>
                      <span className="num">
                        {r.partner.minimumOrderQty.toLocaleString("en-US")}
                      </span>{" "}
                      <span className={styles.factSub}>
                        {r.partner.minimumOrderUnit}
                      </span>
                    </dd>
                  </div>
                  <div className={styles.fact}>
                    <dt>Last worked</dt>
                    <dd>
                      {formatDate(r.partner.lastWorked)}
                      <span className={styles.factSub}>
                        <span className="num">{r.daysSinceWorked}</span> days
                        ago
                      </span>
                    </dd>
                  </div>
                  <div className={styles.fact}>
                    <dt>Region</dt>
                    <dd className={styles.factRegion}>{r.partner.region}</dd>
                  </div>
                </dl>

                <div className={styles.rowStale}>
                  <TokenMark token={STALENESS_META[r.staleness]} small />
                  <Bar
                    pct={Math.min(
                      100,
                      (r.daysSinceWorked / STALENESS_DAYS.goneQuiet) * 100,
                    )}
                    value={`${r.daysSinceWorked}d`}
                    label={`Days since ${r.partner.name} was last worked`}
                    tone={STALENESS_META[r.staleness].cssVar}
                  />
                </div>

                <p className={styles.rowNext}>
                  <span className={styles.rowNextLabel}>Next</span>
                  <span>{r.partner.nextAction}</span>
                </p>

                {r.partner.note ? (
                  <p className={styles.rowNote}>
                    <span aria-hidden="true">◆</span> {r.partner.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          {visible.length === 0 ? (
            <p className={styles.empty} role="status">
              <span aria-hidden="true">○</span> No partner matches these
              filters.
            </p>
          ) : null}
        </section>

        {/* ===========================================================
            4. LICENCE COVERAGE
            =========================================================== */}
        <section className={styles.section} aria-labelledby="cov-h">
          <SectionHead
            eyebrow="Four"
            id="cov-h"
            title="Which route could carry which property"
            lede="A capability map. No property here is under an approved promotion."
          />

          <table className={styles.covTable}>
            <caption className="visually-hidden">
              Each published property and the partners on this register able to
              manufacture against it.
            </caption>
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Named on</th>
                <th scope="col">Route</th>
                <th scope="col">Approval</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map(({ licence, partners }) => (
                <tr key={licence.id}>
                  <th scope="row" className={styles.covName}>
                    {licence.name}
                  </th>
                  <td data-label="Named on">
                    <a
                      className={styles.link}
                      href={licence.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {licence.onPartnersPage ? "Partners page" : "Root page"}
                    </a>{" "}
                    <ProvenanceBadge provenance={licence.provenance} compact />
                  </td>
                  <td data-label="Route">
                    {partners.length > 0
                      ? partners.map((p) => p.name).join(", ")
                      : "No route on the register"}
                  </td>
                  <td data-label="Approval">
                    {partners.length > 0 ? (
                      <TokenMark
                        token={APPROVAL_STATE[partners[0].approval]}
                        small
                      />
                    ) : (
                      <TokenMark token={APPROVAL_STATE["not-submitted"]} small />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className={styles.sectionFoot}>
            Sell-through by property is on{" "}
            <Link to="/promo">promo stock</Link>. Terms and money are on{" "}
            <Link to="/spend">budget</Link>. Sources and formulas are on{" "}
            <Link to="/method">method</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
