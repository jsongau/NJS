import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PipelineProvider } from "@/state/PipelineProvider";
import { BookProvider } from "@/state/BookProvider";
import { OutboxProvider } from "@/state/OutboxProvider";
import { ObjectionProvider } from "@/state/ObjectionProvider";
import { RecordProvider } from "@/state/RecordProvider";
import { QuotePreviewProvider } from "@/state/QuotePreviewProvider";
import { AddedProspectsProvider } from "@/components/prospect/AddProspect";
import { ScenarioProvider } from "@/state/ScenarioProvider";
import { AppShell } from "./AppShell";
import { DeskPage } from "@/pages/DeskPage";
import { TradeAreaPage } from "@/pages/TradeAreaPage";
import { LaneBoardPage } from "@/pages/LaneBoardPage";
import { RepliesPage } from "@/pages/RepliesPage";
import { FieldPage } from "@/pages/FieldPage";
import { ObjectionsPage } from "@/pages/ObjectionsPage";
import { SentPage } from "@/pages/SentPage";
import { CoachingPage } from "@/pages/CoachingPage";
import { MethodPage } from "@/pages/MethodPage";
import { QuotePage } from "@/pages/QuotePage";
import { CapacityPage } from "@/pages/CapacityPage";
import { StartPage } from "@/pages/StartPage";
import { RationalePage } from "@/pages/RationalePage";
import { RATIONALE_AVAILABLE, toConsole } from "@/data/rationale";
import { normalisePath } from "./sections";
import { TodayPage } from "@/pages/TodayPage";
import { RequestsPage } from "@/pages/RequestsPage";
import { InboxPage } from "@/pages/InboxPage";
import { TeamPage } from "@/pages/TeamPage";
import { DistrictPage } from "@/pages/DistrictPage";
import { RivalsPage } from "@/pages/RivalsPage";
import { SegmentsPage } from "@/pages/SegmentsPage";

/**
 * Routes. Two shells, deliberately.
 *
 * Everything the Marketing Manager uses sits inside AppShell, with the
 * service line filter, the period selector and the live counts in the
 * nav.
 *
 * The proposal sits OUTSIDE it. A property manager arrives from an email
 * and has no business seeing the division's internal navigation: the
 * desk, the score that ranked their portfolio, the capacity chart
 * showing which weeks the crew is already full. Showing it would be the
 * digital equivalent of handing a customer your call sheet. That page
 * carries its own frame, its own disclaimer and its own demo badge.
 *
 *   /quote/:prospectId    one organisation, its own proposal, one
 *                         decision
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
 * property manager opening a proposal from an email has no business
 * being one press away from the division's own call sheet.
 *
 * QuotePreviewProvider mounts the quote preview once, above the record
 * provider, and addresses it in the URL the same way. It exists because
 * the internal controls that said "Group quote" navigated to the route
 * above, which is outside the shell, so pressing one took the strip, the
 * rail and the working set off the screen and left the back button as
 * the only way home. The route is right and the controls were wrong: a
 * marketer looking at a customer's letter is previewing it, and a
 * preview belongs over the board rather than instead of it. It sits above
 * RecordProvider so that the record modal can read it and stand its own
 * focus trap down while the preview is over the top, which is what it
 * already does for the compose window.
 *
 * A fourth provider stood here in the console this was copied from. It
 * mounted three surfaces that were only ever about a single site and
 * have no equivalent in a division marketing console, and it came out
 * with them, along with every module that only it reached. The layering
 * rule it was an example of survives and is still worth reading: ONE
 * LAYER OWNS THE KEYBOARD AT A TIME, and a surface mounted under
 * RecordProvider stands its own focus trap down while a record or a
 * proposal preview is over the top of it.
 *
 * AddedProspectsProvider holds the organisations the reader typed in
 * while scouting. It is a provider rather than state inside the form
 * because the form appears twice, in the rail and on the inbox, and two
 * copies of a persisted reducer would be two lists overwriting each other
 * in one storage slice.
 */
/**
 * WHERE A RATIONALE URL GOES WHILE THE SECOND READING IS CLOSED.
 *
 * To the console screen at the same address, replacing the history entry
 * rather than pushing one, because a reader who presses back after an
 * automatic redirect and lands on the thing that just redirected them is
 * in a loop they did not ask for.
 *
 * The stubs for all 28 rationale routes are still emitted, so these URLs
 * are real files that load the app and resolve here. Deleting the stubs
 * instead would turn every link somebody already holds into a 404, and a
 * closed door is not the same as a missing building.
 */
function RationaleClosed() {
  const { pathname } = useLocation();
  return <Navigate to={toConsole(normalisePath(pathname))} replace />;
}

export function App() {
  return (
    <PipelineProvider>
      <BookProvider>
        <OutboxProvider>
          <ObjectionProvider>
            <AddedProspectsProvider>
              <Routes>
                {/* Customer facing. No internal chrome. */}
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


                {/* Everything the marketing manager uses. */}
                <Route
                  path="*"
                  element={
                    <QuotePreviewProvider>
                      <ScenarioProvider>
                      <RecordProvider>
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

                            {/* WHAT IS NOT ROUTED HERE, AND WHY THE GAPS
                            ARE LEFT RATHER THAN PAPERED OVER.

                            Several section ids in sections.ts have no
                            route in this file. They belonged to surfaces
                            that were only ever about a single site, and
                            they came out when this console was pointed at
                            a division and a territory instead. Their ids
                            stayed, because tokens.css publishes their
                            colours and the chrome joins on them by
                            string.

                            Nothing is stubbed in their place. A route
                            that renders an apology is worse than a route
                            that does not exist: the catch-all at the
                            bottom of this list sends an unknown path back
                            to the desk, which is a working screen rather
                            than a notice about one. */}


                            {/* The crew, and what goes up the line. The
                            division report is the weekly the posting asks
                            for by name: what the local budget bought this
                            week, read by somebody who is not in the
                            territory. */}
                            <Route path="/team" element={<TeamPage />} />

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

                            <Route
                              path="/objections"
                              element={<ObjectionsPage />}
                            />
                            {/* The vendor and budget side is modelled in
                            domain/licensing.ts and has no route mounted
                            here yet. Its money is a THIRD ledger: it is
                            not booked revenue and it is not outbound
                            hours, and nothing in this application ever
                            adds it to either. */}

                            <Route path="/sent" element={<SentPage />} />
                            <Route path="/coaching" element={<CoachingPage />} />
                            <Route path="/method" element={<MethodPage />} />
                            {/*
                              THE WHOLE OF RATIONALE, IN ONE ROUTE.

                              Every console screen has an explanation at
                              the same address with /rationale in front of
                              it, so this is a prefix match rather than
                              twenty seven declarations that could fall
                              out of step with the rail. The page reads
                              the rest of the path and looks the screen up
                              by its CONSOLE path, which is the only key
                              either mode uses.
                            */}
                            <Route
                              path="/rationale/*"
                              element={
                                RATIONALE_AVAILABLE ? (
                                  <RationalePage />
                                ) : (
                                  <RationaleClosed />
                                )
                              }
                            />
                            {/* Method settles whether a figure is right.
                            This settles why the thing is shaped this way
                            at all, which makes them siblings and puts
                            this route beside that one.

                            IT IS IN THE SHELL, and the first attempt had
                            it outside beside the proposal. That was
                            wrong. The proposal is outside because a
                            customer must never see the desk's own call
                            sheet. Nobody
                            reading this is a customer: they are looking
                            at the instrument and asking why it is built
                            like this, and answering that on a bare page
                            with no rail and no nav strips the reader of
                            the thing being explained. The argument and
                            the evidence belong on one screen. */}
                            <Route
                              path="/rationale"
                              element={
                                RATIONALE_AVAILABLE ? (
                                  <RationalePage />
                                ) : (
                                  <RationaleClosed />
                                )
                              }
                            />
                            <Route
                              path="*"
                              element={<Navigate to="/" replace />}
                            />
                          </Routes>
                        </AppShell>
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
