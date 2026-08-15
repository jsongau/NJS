# Ole Smoky territory planner — source

The React source for the app deployed at `/olesmoky/distribution`.

Built for a Nathan J. Song application to the Ole Smoky Distillery
**CRM Director** role. Independent work sample. Not affiliated with, endorsed
by, or commissioned by Ole Smoky Distillery.

## Run it

```
npm install
npm run dev
```

## Deploy it

```
npm run build
```

`npm run build` emits into `dist/`, with `base` set to `/olesmoky/distribution/`
in `vite.config.ts`. Copy the contents of `dist/` over
`njs-site/olesmoky/distribution/` and commit — the site publishes through
Vercel's GitHub integration, so pushing `main` is the deploy.

`scripts/emit-route-stubs.mjs` runs as part of the build and writes a real
`index.html` at every route, because `vercel.json` has no SPA rewrite for this
path. Deep links work because the files exist, not because a rewrite catches
them.

## Where the thinking lives

The comments are the documentation, and they are unusually long on purpose:
each one records *why* a number or a rule is what it is, and what went wrong
when it was something else. Start here.

| File | What it decides |
|---|---|
| `src/domain/types.ts` | `Channel`, `VenueClass`, the account and fact-table shapes |
| `src/domain/channels.ts` | One home for what every channel means |
| `src/domain/rate.ts` | Turns one stored case rate into the reader's unit |
| `src/data/accounts.ts` | The 27 published find-a-jar accounts |
| `src/data/accountSkuStatus.ts` | The fact table and every velocity rule |
| `src/data/events.ts` | UFC 330, and the 27 CFR 6.84 constraint |
| `src/lib/email/templates.ts` | The three email voices |
| `docs/` | Dated session notes: decisions made, decisions rejected, traps |

## Standing constraints

- **Demo mode.** No mail is sent. Every address is an unroutable `.local`
  mailbox (RFC 6762). No real person is ever named.
- **Provenance is typed.** `public` means published and checkable. `modeled`
  and `illustrative` mean invented, and the badge says so on screen.
- **Nothing signals state by colour alone.** Shape and glyph first.
- **Tied-house rules are load-bearing.** A supplier may furnish point-of-sale
  material (27 CFR 6.84) and may not pay a retailer (CA B&P 25500 / 25502).
  No template may generate an offer to fund anything.
