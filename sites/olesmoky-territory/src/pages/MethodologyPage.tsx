import { Link } from "react-router-dom";
import { COORDINATES_APPROXIMATE } from "@/data/coordinates";
import styles from "./MethodologyPage.module.css";

/**
 * Methodology and limitations.
 *
 * This page is not an appendix. In a prototype full of modeled numbers it
 * is the thing that makes the real parts believable: a reader who can see
 * exactly which figures are invented has no reason to doubt the ones that
 * are not. It is written to be read by someone looking for the seams.
 */
export function MethodologyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Nathan&rsquo;s Territory Planning</p>
        <h1>Methodology and limitations</h1>
        <p className={styles.lede}>
          An independent prototype built to think through the Distributor
          Sales Executive role. Everything below states where a number came
          from, and where it did not come from.
        </p>
      </header>

      <section className={styles.section}>
        <h2>What this is not</h2>
        <p>
          This application has no connection to Ole Smoky Distillery, Southern Glazer's Wine & Spirits
          Group, Southern Glazer's, or any retailer named in it. There is
          no access to inventory, shipment, depletion, authorization,
          pricing, or trade-spend data of any kind, and none is implied. No
          order is transmitted, no inventory is reserved, and no email is
          sent: there is no email transport in this application{"'"}s
          dependency tree, and demo recipients are constrained to reserved{" "}
          <code>.local</code> addresses that cannot route.
        </p>
      </section>

      <section className={styles.section}>
        <h2>The commercial model, and why it has two ledgers</h2>
        <p>
          California is a three-tier state. Ole Smoky is the supplier,
          Southern Glazer's is the wholesaler, and the accounts in this
          territory are retail. A Distributor Sales Executive does not write retailer
          orders; they build a plan and sell it into the distributor, whose
          sales force executes it at retail.
        </p>
        <p>
          That is why the commitment plan is split. The sell-in ledger runs
          from Ole Smoky to Southern Glazer's and carries money: case price and
          depletion allowance. The retail execution ledger runs from Southern Glazer's
          to retail and deliberately carries no money at all, only PODs,
          placements and display commitments.
        </p>
        <p>
          The distinction is legal, not stylistic. California ABC has stated
          there is no exception permitting cash payments from a supplier to a
          retailer, sometimes called pay-to-play or slotting. A screen
          showing a promotional allowance attached to a retailer line would
          be describing a tied-house violation rather than a plan.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Vocabulary</h2>
        <dl className={styles.terms}>
          <div>
            <dt>POD</dt>
            <dd>
              Point of distribution. One SKU, authorized and physically
              present, in one store.
            </dd>
          </div>
          <div>
            <dt>Void</dt>
            <dd>
              Authorized but not on the shelf. The addressable gap, and the
              reason the map exists.
            </dd>
          </div>
          <div>
            <dt>Not authorized</dt>
            <dd>
              The chain has not listed the item for that store. Excluded from
              the gap, because counting it would inflate the opportunity.
            </dd>
          </div>
          <div>
            <dt>Depletions vs shipments</dt>
            <dd>
              Depletions move from distributor to retail; shipments move from
              supplier to distributor. Different numbers, and this prototype
              models depletions only.
            </dd>
          </div>
          <div>
            <dt>Fair share</dt>
            <dd>
              A stated assumption here, not a measurement. Real fair share
              would be indexed to category volume from a syndicated source,
              which this prototype does not have.
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.section}>
        <h2>Every formula on screen</h2>

        <h3>Back-shelf position</h3>
        <p>
          Counted in facings, then converted to doors once at the account
          level, at twelve facings per door. Fair share is modeled at 33% of
          the account{"'"}s accounts. An earlier version stored doors per SKU
          and summed them, which double-counted badly and made every account
          appear to already hold more than its fair share.
        </p>

        <h3>Opportunity score</h3>
        <p>
          A weighted blend of five normalized inputs: void cases at 0.35,
          back-shelf gap at 0.25, display upside at 0.20, traffic tier at 0.10,
          and route efficiency at 0.10. Each input is normalized against an
          anchor drawn from this territory{"'"}s actual range. The weights
          are adjustable on any account record, and the arithmetic is printed
          under the score.
        </p>

        <h3>Suggested cases</h3>
        <p>
          Modeled weekly velocity multiplied by two weeks of cover, rounded
          to an order increment of six cases for large packs and four for
          small. Replenishment on an out-of-stock adds a shelf refill on top
          of the cover.
        </p>

        <h3>Incremental volume and ROI</h3>
        <p>
          Promotional weekly cases are base multiplied by the promotion{"'"}s
          modeled lift. Incremental is the difference between the two, never
          the promotional figure on its own. ROI is incremental gross over
          the period divided by allowance spent. It is deliberately not a
          margin calculation: margin is not knowable from public information,
          and inventing it would be false precision.
        </p>

        <h3>Distance</h3>
        <p>
          Straight-line haversine from the distributor facility, labeled as
          such everywhere it appears. Not drive time.
        </p>

        <h3>Weekly velocity, and a correction</h3>
        <p>
          Every case figure in the app descends from one number: modeled
          weekly cases for a tier-one core SKU in one store, adjusted by
          traffic tier, brand family, venue class, channel and package fit,
          then jittered.
        </p>
        <p className={styles.correction}>
          <strong>That anchor was wrong and has been changed.</strong> It was
          26 cases a week, which is 312 bottles — about forty five a day of a
          single item in one store. It compounded downstream, because an
          out-of-stock line orders two weeks of cover, so a single empty
          facing produced a fifty-case line and one store{"'"}s suggested
          order came out at 136 cases. The anchor is now{" "}
          <strong className="num">11</strong>, which puts the lead 750ml jar
          at eleven to thirteen cases a week in the territory{"'"}s biggest
          off-premise account and a whole store order in the twenty to fifty
          case range. Facings rescaled with it.
        </p>

        <h3>A case means two different things</h3>
        <p className={styles.correction}>
          <strong>The second correction is larger than the first.</strong> The
          rate above was stored as a whole number of cases with a floor of
          one, which is fine for a shop and structurally wrong for a bar. A
          750ml bottle is about sixteen 1.5oz pours, so a case is roughly two
          hundred drinks — and a model that cannot represent a rate below one
          case a week will tell a forty-cover pub to take the same order as a
          Buffalo Wild Wings. The rate is now fractional, and every figure on
          screen is formatted through one function that renders it as{" "}
          <em>cases</em> off-premise and as <em>bottles and pours</em>{" "}
          on-premise. One stored fact, two units, and the unit is the
          reader{"'"}s rather than the database{"'"}s.
        </p>

        <h3>Case pack against consumer pack</h3>
        <p>
          A package carries two counts and they are not the same number.
          <span className="num"> unitsPerCase</span> is the shipper: what
          moves on a pallet, and what a case means everywhere in this app.
          <span className="num"> packUnits</span> is what a shopper picks up.
          A 19.2oz single ships twelve to a case but is bought one can at a
          time, so a case of it is twelve cans in a tray rather than a twelve
          pack. Conflating them is a real trade error, and it surfaced here
          as a drawn package: the glyph rendered a case of singles as a
          multipack until the model learned the difference.
        </p>

        <h3>The period goal</h3>
        <p>
          Each fiscal period carries a case goal and the same period last
          year, so growth reads as a percentage rather than a wish. The
          year-over-year figure compares the <em>goal</em> to last year, never
          the plan so far — a half-built plan measured against a completed
          period reads as a catastrophe and teaches a reader to distrust the
          number rather than the plan. Illustrative: a goal for twenty seven
          accounts is not derivable from anything published.
        </p>

        <h3>Required sell-in</h3>
        <p>
          Cases promised at retail are cases the distributor has to buy, so
          committing a store order writes both ledgers: the retail promise
          and the sell-in it requires, priced at list. It is reported as a
          requirement and never folded into booked revenue, because booking a
          requirement as revenue is precisely the error two ledgers exist to
          prevent. Where Southern Glazer's accepts fewer cases than a store was
          promised, the gap surfaces on the issue register as an unfunded
          promise.
        </p>

        <h3>The issue register</h3>
        <p>
          Nothing on <span className="num">/issues</span> is entered by hand.
          Each issue is derived from the plan, the sent log and the account
          record, and it stops appearing when the condition causing it stops
          being true — which is why there is no resolved button. Severity is
          cases at stake, and the unit travels with the figure: a void leaks
          cases every week, an unanswered order is a one-time number, and the
          summary reports them separately rather than adding two different
          units together. Ranking puts kind before size, so an unfunded
          promise sits above a larger missed opportunity.
        </p>

        <h3>Programme allowances and what may be furnished</h3>
        <p>
          A promotion carries one lawful payment: a depletion allowance per
          case, supplier to wholesaler. Everything else in a kit is a
          physical object with advertising on it. Under{" "}
          <a
            href="https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-6/subpart-D/section-6.84"
            target="_blank"
            rel="noreferrer noopener"
          >
            27 CFR 6.84
          </a>{" "}
          a supplier may furnish point of sale advertising material and
          consumer advertising specialties where the advertising is
          permanently inscribed or securely affixed, and may not pay or
          credit the retailer for using or distributing them or for any
          expense incidental to their use. So every kit item records who
          places it, and the type does not permit that to be the store.
          California layers its own rules on top; none of this is legal
          advice.
        </p>

        <h3>Email drafts</h3>
        <p>
          The message structure follows measured behaviour rather than
          taste. A phone reply runs a median of twenty words against sixty on
          a desktop, so approval is one word and cutting a line is three.
          Average attention on a message is about eleven seconds, so the ask
          sits in the subject and the first two lines and the item list sits
          below it. The deadline is a load cutoff, which is a real
          operational constraint rather than a manufactured one. And the
          close de-risks rather than urges, because piling urgency on an
          undecided buyer makes them freeze.
        </p>
        <p>
          Nothing a retailer reads claims knowledge of their shelf. A
          supplier does not know what is on a given store{"'"}s shelf today,
          so every retailer-facing line is a claim about how a SKU is moving
          across comparable stores and lands on &ldquo;you may be low&rdquo; —
          a suggestion the manager is free to check, which is the only form
          of the claim that survives being checked.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Where the data comes from</h2>
        <dl className={styles.sources}>
          <div>
            <dt>The account roster</dt>
            <dd>
              All twenty seven accounts — name, street address, city, ZIP,
              phone and the quoted distance — are published by Ole Smoky{"'"}s
              own store locator for the search{" "}
              <em>City of Industry, CA 91748</em>. Nothing on the roster is
              invented, and anyone can run the same search and check it. The
              quoted distance is carried as the locator reported it and is
              never recomputed here: the locator does not document whether it
              is straight-line or driving distance, and these coordinates do
              not reproduce it, which is itself evidence it is a road
              distance. The app{"'"}s own mileage is computed separately from
              the wholesaler and is labelled as such — two distances, two
              names, two sources.{" "}
              {COORDINATES_APPROXIMATE ? (
                <strong>
                  Coordinates are street-corridor approximations, not
                  verified geocoder output. They place each account on the
                  correct road in the correct city and are not precise enough
                  to identify a specific storefront. The intended Census
                  geocoder run was unreachable from the environment this was
                  built in, and the choice was a hand placement stamped
                  approximate or a fabricated one stamped verified.
                </strong>
              ) : (
                "Coordinates verified via the US Census Bureau geocoder."
              )}
            </dd>
          </div>
          <div>
            <dt>Distributor</dt>
            <dd>
              Southern Glazer's, part of Southern Glazer's Wine & Spirits. Facility and
              territory description from the company{"'"}s own public site,
              which states a footprint from Malibu in Los Angeles County to
              San Clemente in Orange County.
            </dd>
          </div>
          <div>
            <dt>Brands and strategic roles</dt>
            <dd>
              Ole Smoky{"'"} own published commercial communications,
              including the designation of Blue Flame and Tennessee Straight Bourbon as
              above-premium power brands and the 2026 innovation slate.
            </dd>
          </div>
          <div>
            <dt>Package configurations</dt>
            <dd>
              Ordinary industry case and pallet configurations, marked
              illustrative. Real configurations vary by distiller and wholesaler.
            </dd>
          </div>
          <div>
            <dt>Distribution, velocity, priority, back-shelf doors</dt>
            <dd>
              All illustrative. Generated from explicit, legible rules rather
              than hand-authored, so the territory is internally consistent
              and identical on every load. It is a plausible territory, not a
              claim about what these stores carry.
            </dd>
          </div>
          <div>
            <dt>Inventory state</dt>
            <dd>
              Labeled by how it was learned: observed on a simulated store
              visit, reported by a distributor rep, or modeled from depletion
              velocity. A supplier cannot see a retailer{"'"}s inventory
              system, so there is no live feed and none is implied.
            </dd>
          </div>
          <div>
            <dt>Fiscal periods</dt>
            <dd>
              Invented. Ole Smoky{"'"} real period calendar is not public.
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.section}>
        <h2>Known limitations</h2>
        <ol className={styles.limits}>
          <li>
            No retailer logos or storefront photography appear anywhere.
            There are no rights to those marks, and the obvious source for
            storefront imagery prohibits the use. Typographic wordmarks are
            the design, not a fallback.
          </li>
          <li>
            The training session plan, the five competencies and the brand
            briefs on <span className="num">/training</span> are mine, not a
            Ole Smoky training document. Each brand position traces to the
            company{"'"}s own published commercial posture; the objections are
            ordinary trade objections and are illustrative.
          </li>
          <li>
            Programme windows use real dates — the heritage window runs
            September 15 to October 15, and the football window is the busiest
            on-premise stretch of the autumn — with modeled allowances and
            lifts. UFC 330 on August 15 2026 is a published event date and
            nothing more; Ole Smoky has no announced relationship with it.
            Southern Glazer's does not publish a load schedule, so the Thursday
            4pm cutoff is modeled too.
          </li>
          <li>
            Sparkling Lemonade Hard Seltzer is held in the record but not offered for
            planning. Its current status could not be verified, and it is
            absent from the published 2026 innovation slate.
          </li>
          <li>
            One distributor is selectable. Southern Glazer{"'"}s is a wine
            and spirits house and is the only tier-two partner offered for
            these accounts; Gate City Beverage is a beer house serving the
            Inland Empire, recorded but not offered here.
          </li>
          <li>
            Competitive share is not modeled. Inventing competitor volume
            would be the kind of precision that cannot be defended.
          </li>
          <li>
            No backend. The plan lives in browser storage and in a shareable
            link. Nothing is transmitted anywhere.
          </li>
        </ol>
      </section>

      <p className={styles.foot}>
        Built by Nathan J. Song. <Link to="/">Back to the order desk</Link>
      </p>
    </div>
  );
}
