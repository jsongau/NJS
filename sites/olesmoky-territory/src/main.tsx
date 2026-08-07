import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/print.css";

import { App } from "@/app/App";

/**
 * basename pairs with `base` in vite.config.ts. The build is committed
 * into njs-site/olesmoky/ and served from nathanjsong.com/olesmoky,
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router basename={isPreview ? undefined : "/olesmoky/distribution"}>
      <App />
    </Router>
  </StrictMode>,
);
