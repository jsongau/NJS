import { Routes, Route, Navigate } from "react-router-dom";
import { PipelineProvider } from "@/state/PipelineProvider";
import { BookProvider } from "@/state/BookProvider";
import { OutboxProvider } from "@/state/OutboxProvider";
import { ObjectionProvider } from "@/state/ObjectionProvider";
import { RecordProvider } from "@/state/RecordProvider";
import { QuotePreviewProvider } from "@/state/QuotePreviewProvider";
import { CupSurfaceProvider } from "@/state/CupSurfaceProvider";
import { AddedProspectsProvider } from "@/components/prospect/AddProspect";
import { ScenarioProvider } from "@/state/ScenarioProvider";
import { AppShell } from "./AppShell";
import { DeskPage } from "@/pages/DeskPage";
import { TradeAreaPage } from "@/pages/TradeAreaPage";
import { LaneBoardPage } from "@/pages/LaneBoardPage";
import { BookPage } from "@/pages/BookPage";
import { WeekSheetPage } from "@/pages/WeekSheetPage";
import { RepliesPage } from "@/pages/RepliesPage";
import { FieldPage } from "@/pages/FieldPage";
import { CapacityPage } from "@/pages/CapacityPage";
import { PackagesPage } from "@/pages/PackagesPage";
import { ObjectionsPage } from "@/pages/ObjectionsPage";
import { SentPage } from "@/pages/SentPage";
import { CoachingPage } from "@/pages/CoachingPage";
import { MethodPage } from "@/pages/MethodPage";
import { QuotePage } from "@/pages/QuotePage";
import { StartPage } from "@/pages/StartPage";
import { TodayPage } from "@/pages/TodayPage";
import { RequestsPage } from "@/pages/RequestsPage";
import { InboxPage } from "@/pages/InboxPage";
import { LeaguesPage } from "@/pages/LeaguesPage";
import { LeagueDetailPage } from "@/pages/LeagueDetailPage";
import { CupPage } from "@/pages/CupPage";
import { AccountsPage } from "@/pages/AccountsPage";
import { TeamPage } from "@/pages/TeamPage";
import { PayPage } from "@/pages/PayPage";
import { DistrictPage } from "@/pages/DistrictPage";
import { RivalsPage } from "@/pages/RivalsPage";
import { SegmentsPage } from "@/pages/SegmentsPage";
import { PartnersPage } from "@/pages/PartnersPage";
import { PromoPage } from "@/pages/PromoPage";
import { SpendPage } from "@/pages/SpendPage";
import { SellThroughPage } from "@/pages/SellThroughPage";

/**
 * Routes. Two shells, deliberately.
 *
 * Everything the promotion planner uses sits inside AppShell, with the lane
 * filter, the period selector and the live counts in the nav.
 *
 * The group quote sits OUTSIDE it. A school activities director arrives
 * from an email and has no business seeing the venue's internal
 * navigation: the desk, the score that ranked them, the capacity chart
 * showing which dates are nearly gone. Showing it would be the digital
 * equivalent of handing a customer your call sheet. That page carries
 * its own frame, its own disclaimer and its own demo badge.
 *
 *   /quote/:prospectId    one organisation, its own event, one decision
 *
 * There is no /forecast route and no nav link to one. A navigation item
 * leading to "building next" tells a reader the thing is unfinished
 * before they have seen what is finished.
 *
 * ── WHY TWO MORE PROVIDERS SIT HERE ───────────────────────────────
 * RecordProvider mounts the record modal exactly once and addresses the
 * open organisation in the URL. Every business name in the application is
 * a button that asks it to open one, on eleven surfaces, so without it
 * wrapping the shell every one of those names is a control that does
 * nothing. It wraps the shell route element and not the quote route: a
 * school activities director opening a quote from an email has no
 * business being one press away from the venue's own call sheet.
 *
 * QuotePreviewProvider mounts the quote preview once, above the record
 * provider, and addresses it in the URL the same way. It exists because
 * the internal controls that said "Group quote" navigated to the route
 * above, which is outside the shell, so pressing one took the strip, the
 * rail and the working set off the screen and left the back button as
 * the only way home. The route is right and the controls were wrong: a
 * rep looking at a customer's letter is previewing it, and a preview
 * belongs over the board rather than instead of it. It sits above
 * RecordProvider so that the record modal can read it and stand its own
 * focus trap down while the preview is over the top, which is what it
 * already does for the compose window.
 *
 * CupSurfaceProvider mounts the team surface, the bowler profile and the
 * tale of the tape once each, and addresses the open one in the URL the
 * same way, with ?team=, ?bowler= and ?tape=. It sits UNDER
 * RecordProvider deliberately: a team surface and a bowler profile both
 * carry the organisation the team came off the prospecting board from,
 * as a live name that opens that organisation's record, and the record
 * modal renders after its children so it lands above these. These three
 * therefore stand their own focus trap down while a record or a quote
 * preview is over them, which is the same rule the record modal already
 * follows for the compose window. One layer owns the keyboard at a time.
 *
 * AddedProspectsProvider holds the organisations the reader typed in
 * while scouting. It is a provider rather than state inside the form
 * because the form appears twice, in the rail and on the inbox, and two
 * copies of a persisted reducer would be two lists overwriting each other
 * in one storage slice.
 */
export function App() {
  return (
    <PipelineProvider>
      <BookProvider>
        <OutboxProvider>
          <ObjectionProvider>
            <AddedProspectsProvider>
              <Routes>
                {/* Prospect facing. No internal chrome. */}
                <Route path="/quote/:prospectId" element={<QuotePage />} />

                {/*
                  Visitor facing, and outside the shell for the same
                  reason the quote is: it is addressed to somebody who did
                  not come here to work a desk. This is the address that
                  goes in a job application, so a person arriving cold
                  gets a sentence about what they are looking at before
                  they get a rail of twenty destinations. StartPage.tsx
                  has the full argument.
                */}
                <Route path="/start" element={<StartPage />} />


                {/* Everything the promotion planner uses. */}
                <Route
                  path="*"
                  element={
                    <QuotePreviewProvider>
                      <ScenarioProvider>
                      <RecordProvider>
                        <CupSurfaceProvider>
                        <AppShell>
                          <Routes>
                            {/* The desk is the front door. The map is the
                            evidence behind it, one click away, not the
                            thing a stranger has to decode before they see
                            the point. */}
                            <Route path="/" element={<DeskPage />} />

                            {/* Today is stage one of the nav and it is still not
                            the index route, on purpose. Every existing link
                            that says "/" in this codebase means "the desk",
                            including the one on Today itself and the one on
                            the brand lockup, so re-pointing the index would
                            quietly send a dozen of them somewhere else and
                            make Today's own link to the desk a loop back to
                            itself. The desk stays the front door for a
                            stranger; Today is the front door for the person
                            who works here every morning. */}
                            <Route path="/today" element={<TodayPage />} />
                            <Route path="/requests" element={<RequestsPage />} />

                            {/* Both directions, threaded per organisation. The
                            rail's status, type, stale and awaiting filters
                            all land here as query parameters, so a working
                            set is a link rather than a piece of state. */}
                            <Route path="/inbox" element={<InboxPage />} />

                            <Route path="/map" element={<TradeAreaPage />} />
                            <Route path="/lanes" element={<LaneBoardPage />} />

                            {/* The only recurring product the building
                            sells. The board lists the leagues that are
                            forming and the field of sixteen behind each;
                            the detail route is one league, its schedule
                            arithmetic, its rosters and the way in.

                            The detail route is a child path rather than a
                            query parameter because a league is a thing with
                            a name that people send each other, and a URL
                            that reads /leagues/last-frame-standing survives
                            being pasted into a message in a way that
                            ?league=2 does not. An unknown id redirects to
                            the board rather than rendering an apology. */}
                            <Route path="/leagues" element={<LeaguesPage />} />
                            <Route
                              path="/leagues/:leagueId"
                              element={<LeagueDetailPage />}
                            />

                            {/* The quarterly cup. It is its own route
                            rather than a section of the leagues board
                            because it is a different object with a
                            different clock on it: a league is sixteen
                            weeks of the same night, a cup is six nights
                            four times a year, and the one running now is
                            a declared exhibition while the next one is
                            taking teams. Two states of two different
                            products on one screen would make the reader
                            work out which figures were simulated.

                            It is a flat route with no child. The team,
                            the bowler profile and the tale of the tape
                            are modals addressed by search parameter over
                            whichever screen raised them, in the same
                            shape as ?record= and ?quote=, so that a card
                            can be opened from this board, from the
                            leagues board or from a pasted link without
                            three copies of the same surface. */}
                            <Route path="/cup" element={<CupPage />} />

                            <Route path="/book" element={<BookPage />} />
                            <Route
                              path="/book/week"
                              element={<WeekSheetPage />}
                            />

                            {/* The other half of the book. Everything else
                            in this application happens before somebody
                            signs; this is what happens after. */}
                            <Route
                              path="/book/accounts"
                              element={<AccountsPage />}
                            />

                            {/* The floor, and the two things it produces:
                            what the work is worth, and the page that goes
                            up the line. */}
                            <Route path="/team" element={<TeamPage />} />
                            <Route path="/pay" element={<PayPage />} />
                            <Route path="/report" element={<DistrictPage />} />

                            <Route path="/rivals" element={<RivalsPage />} />
                            {/* The board cut by industry rather than by
                            channel. The posting asks for target customer
                            segments and industries by name; Lanes answers
                            how you reach people and this answers which
                            industries are worth reaching first. */}
                            <Route path="/segments" element={<SegmentsPage />} />
                            <Route path="/replies" element={<RepliesPage />} />
                            <Route path="/field" element={<FieldPage />} />
                            <Route path="/calendar" element={<CapacityPage />} />
                            <Route path="/packages" element={<PackagesPage />} />
                            <Route
                              path="/objections"
                              element={<ObjectionsPage />}
                            />
                            {/* The supply side. Four screens answering a
                            second posting, at DIME in Irvine, which asks
                            for licensor relationships, sell-through reporting
                            and budget control rather than group bookings.
                            They sit together because they share one data
                            layer and because a reader who opens one of them
                            will want the other two: a partner has an
                            agreement, an agreement has terms, and terms are
                            only interesting next to what the product
                            actually did.

                            The money on /promo is a THIRD ledger. It is not
                            booked event revenue and it is not outbound
                            hours, and nothing in this application ever adds
                            it to either. */}
                            <Route path="/partners" element={<PartnersPage />} />
                            <Route path="/promo" element={<PromoPage />} />
                            <Route path="/spend" element={<SpendPage />} />
                            {/* The fourth is the only one of them addressed
                            to somebody outside the building. /promo is the
                            internal stock table; this is the statement that
                            goes to the party who owns the property, set to
                            print on letter paper, carrying what was bought,
                            what moved, what is left, at what margin, and what
                            that implies for the next order. It reads the same
                            counts as /promo so the two documents can never
                            contradict each other. */}
                            <Route
                              path="/sellthrough"
                              element={<SellThroughPage />}
                            />

                            <Route path="/sent" element={<SentPage />} />
                            <Route path="/coaching" element={<CoachingPage />} />
                            <Route path="/method" element={<MethodPage />} />
                            <Route
                              path="*"
                              element={<Navigate to="/" replace />}
                            />
                          </Routes>
                        </AppShell>
                        </CupSurfaceProvider>
                        </RecordProvider>
                    </ScenarioProvider>
                    </QuotePreviewProvider>
                  }
                />
              </Routes>
            </AddedProspectsProvider>
          </ObjectionProvider>
        </OutboxProvider>
      </BookProvider>
    </PipelineProvider>
  );
}
