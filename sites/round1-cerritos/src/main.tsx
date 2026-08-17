import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/print.css";

import { App } from "@/app/App";
import { ThemeProvider } from "@/state/ThemeProvider";

/**
 * basename pairs with `base` in vite.config.ts. The build is committed
 * into njs-site/me/ and served from nathanjsong.com/me,
 * and njs-site is a zero-build static repo, so both have to be correct at
 * build time. Change one and you must change the other.
 */
/**
 * The preview build is a different animal. It is opened from a Downloads
 * folder over file://, where there is no server to answer a path, so
 * BrowserRouter cannot work and every asset URL has to be relative.
 * VITE_PREVIEW=1 swaps in a hash router and vite.config drops `base`.
 * Nothing about the deployed build changes.
 */
const isPreview = import.meta.env.VITE_PREVIEW === "1";
const Router = isPreview ? HashRouter : BrowserRouter;

/**
 * The ground sits ABOVE the router, outside every screen.
 *
 * Which palette the application is painted on is not a fact about a
 * route, and the one page that renders outside the shell entirely, the
 * prospect facing quote, is painted out of the same tokens as everything
 * else. Mounting it here rather than inside App keeps the pipeline stack
 * to the things a screen actually reads.
 *
 * The attribute it manages is already on the document by this point. The
 * blocking script in index.html put it there before this bundle was
 * fetched, which is the whole of the no flash guarantee; see the comment
 * beside that script and the head of state/ThemeProvider.tsx.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Router basename={isPreview ? undefined : "/r1"}>
        <App />
      </Router>
    </ThemeProvider>
  </StrictMode>,
);
