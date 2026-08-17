import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/**
 * base is "/r1/" because the built output is committed into
 * njs-site/me/ and served from nathanjsong.com/me.
 * njs-site is a zero-build static repo, so every asset URL has to be
 * correct at build time. Changing this path means changing the router
 * basename in main.tsx too — they are a pair.
 */
export default defineConfig({
  base: process.env.VITE_PREVIEW === "1" ? "./" : "/r1/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        /**
         * Leaflet is split out of the deployed build because most visitors
         * land on the desk and never open the map, so 90 KB of
         * mapping code should not sit in the critical path.
         *
         * The preview build is the opposite case: it has to collapse into
         * ONE file that opens from a Downloads folder with no server, so
         * splitting is switched off there.
         */
        manualChunks:
          process.env.VITE_PREVIEW === "1"
            ? undefined
            : { leaflet: ["leaflet", "react-leaflet"] },
      },
    },
  },
});
