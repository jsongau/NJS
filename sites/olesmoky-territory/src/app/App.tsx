import { Routes, Route, Navigate } from "react-router-dom";
import { TerritoryProvider } from "@/state/TerritoryProvider";
import { PlanProvider } from "@/state/PlanProvider";
import { OutboxProvider } from "@/state/OutboxProvider";
import { IssueProvider } from "@/state/IssueProvider";
import { AppShell } from "./AppShell";
import { TerritoryBoardPage } from "@/pages/TerritoryBoardPage";
import { PlanPage } from "@/pages/PlanPage";
import { CommitmentSheetPage } from "@/pages/CommitmentSheetPage";
import { MethodologyPage } from "@/pages/MethodologyPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { SupplyPage } from "@/pages/SupplyPage";
import { DistributorPage } from "@/pages/DistributorPage";
import { OrderPortalPage } from "@/pages/OrderPortalPage";
import { RetailerOrderPage } from "@/pages/RetailerOrderPage";
import { OrderDeskPage } from "@/pages/OrderDeskPage";
import { SentPage } from "@/pages/SentPage";
import { FieldPage } from "@/pages/FieldPage";
import { TrainingPage } from "@/pages/TrainingPage";
import { ProgramsPage } from "@/pages/ProgramsPage";
import { IssuesPage } from "@/pages/IssuesPage";

/**
 * Routes. Two shells, deliberately.
 *
 * Everything a Distributor Sales Executive uses sits inside AppShell,
 * with the territory nav, the period selector, and the plan counter.
 *
 * The two order portals sit OUTSIDE it. A distributor's order desk and a
 * store's spirits buyer both arrive from an email, and neither has any
 * business seeing the supplier's internal navigation: the territory
 * board, the portfolio, a plan they have not agreed to. Showing it would
 * be the digital equivalent of handing a customer your call sheet. Each
 * portal carries its own frame, its own disclaimer, and its own demo
 * badge.
 *
 *   /order/:distributorId    Southern Glazer's ordering for the whole territory
 *   /store-order/:accountId  one store reordering its own shelf
 *
 * There is also no /actions route yet and no nav link to one. A
 * navigation item leading to "building next" tells a reader the thing is
 * unfinished before they have seen what is finished.
 */
export function App() {
  return (
    <TerritoryProvider>
      <PlanProvider>
      <OutboxProvider>
      <IssueProvider>
        <Routes>
          {/* Distributor facing. No internal chrome. */}
          <Route path="/order/:distributorId" element={<OrderPortalPage />} />

          {/* Retailer facing. Same rule. */}
          <Route path="/store-order/:accountId" element={<RetailerOrderPage />} />

          {/* Everything the sales executive uses. */}
          <Route
            path="*"
            element={
              <AppShell>
                <Routes>
                  {/* The order is the front door. The map is the evidence
                      behind it, one click away, not the thing a stranger
                      has to decode before they see the point. */}
                  <Route path="/" element={<OrderDeskPage />} />
                  <Route path="/maps" element={<TerritoryBoardPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/supply" element={<SupplyPage />} />
                  <Route path="/plan" element={<PlanPage />} />
                  <Route path="/plan/sheet" element={<CommitmentSheetPage />} />
                  <Route path="/distributor" element={<DistributorPage />} />
                  <Route path="/sent" element={<SentPage />} />
                  <Route path="/field" element={<FieldPage />} />
        <Route path="/training" element={<TrainingPage />} />
                  <Route path="/programs" element={<ProgramsPage />} />
                  <Route path="/issues" element={<IssuesPage />} />
                  <Route path="/method" element={<MethodologyPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            }
          />
        </Routes>
      </IssueProvider>
      </OutboxProvider>
      </PlanProvider>
    </TerritoryProvider>
  );
}
