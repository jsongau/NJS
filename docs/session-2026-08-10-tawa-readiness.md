# Session 2026-08-10, Readiness at /tawa

Work sample for the HR Manager, Training and Operations Support role at TAWA
Services and 99 Ranch Market. Built in a cloud session; the source project lives
outside this repo and only the built artefact ships here.

Files changed in `njs-site`:

```
tawa/index.html      new, 880 KB, the whole app in one file
vercel.json          headers block added, scoped to /tawa
docs/CHANGELOG.md    entry under 2026-08-10
docs/session-2026-08-10-tawa-readiness.md   this file
```

## The decision the whole build rests on

**A notification is not a work item. It is a per person pointer at a work item
the organisation shares.**

The failure this prevents: HR acknowledges an incident, and legal counsel's
console still says "awaiting acknowledgement" because legal's notification row
was never marked read. Two people hold different beliefs about the same fact and
the one who is wrong is the lawyer.

So the model is two tables.

| | tasks | notifications |
|---|---|---|
| grain | one row per unit of work | one row per person per task |
| owner | the organisation | the individual |
| state | open, done, void | read_at, cleared_at |
| who changes it | anyone competent to act | only that person |
| effect | everybody sees it | nobody else sees it |

The badge counts **open tasks in your scope**, never unread notification rows.
A task you have read is still outstanding. A task a colleague finished is not
outstanding whether or not you ever opened it.

Second axis: tasks are actionable or informational. Actionable closes for
everyone. Informational clears per person, and `taskClear` throws if pointed at
an actionable task, because "dismiss this for everyone" is not a thing an
informational item can mean.

549 tasks across nine kinds, all derived from the incident, drill and training
records the app already holds. `taskLive()` re-derives from those records on
every read rather than caching, which is why acknowledging an incident through
the console's own button retires the matching inbox row with no wiring between
the two surfaces.

## Why noindex

The page carries real 99 Ranch and 168 Market store addresses and reads as an
operational compliance system. It should open for anyone sent the link and it
should not appear in a search for "99 Ranch training". The banner marks are
drawn from the site palette rather than the trademark files for the same reason.

**The trap worth recording.** The source project shipped its own `vercel.json`
containing `{"source": "/(.*)", "X-Robots-Tag": "noindex"}`. Copying that file
into this repo would have deindexed nathanjsong.com in full: the portfolio, the
405 rewrite, every case study, with a recovery measured in weeks and not in our
hands. A `vercel.json` from a standalone project is almost never safe to copy
into a multi page site without rescoping every `source` pattern first. What
landed here is that rule narrowed to `/tawa` and `/tawa/:path*` and merged into
the existing config rather than replacing it.

## How it was built, and the one process rule that earned its keep

Five agents building five layers of one 550 KB file at once. Editing that file
concurrently is last write wins, and an earlier session in this project lost
work exactly that way. So: one written contract fixing the state shape, every
DOM id, one z-index scale and the task API; each agent writes only its own part
files; one deterministic merge assembles them.

The merge refuses to write when the assembled script does not parse, when a part
carries a dash or arrow glyph, or when a CSS part has unbalanced comment
delimiters. That last gate was added mid session after an unbalanced `/* */`
silently shipped a media query the browser never parsed. Unbalanced CSS comments
do not raise anywhere; they swallow whatever follows and the next rule simply
stops applying.

Six defects appeared only on assembly, each layer being correct alone: the hero
at 328px against its budget, truncated rail labels, printed zero badges, mega
nav rows running two inline spans together, an inbox block laying out a two
column grid inside a 420px drawer because its breakpoint asked about the
viewport rather than the container, and breadcrumb separators outliving the
crumbs they belonged to on a phone.

Worst of them: at 390px two of the four personas were clipped off the right edge
of the top bar with no scrollbar and no sign they existed. A demo about four
personas, shipping with half of them unreachable on a phone. Fixed by dropping
the Ctrl-K trigger below 480px, collapsing the language control to a single
button showing the language you are not in, and letting the bar scroll as a
backstop.

One selector note for anyone patching this chrome later: the top bar carries
both `id="topbar"` and `class="topbar"`, and the shell styles it through the id.
A class selector loses to an id no matter how many classes it carries. The first
version of that mobile fix was correct CSS that never applied.

## Verify after deploy

1. `nathanjsong.com/tawa` loads, top bar shows four personas.
2. Click the bell, complete a task, switch persona, confirm the count fell in
   the other console too. The panel at the foot of the full task list shows all
   four counts at once.
3. `curl -sI https://nathanjsong.com/tawa | grep -i robots` returns
   `x-robots-tag: noindex, nofollow`.
4. `curl -sI https://nathanjsong.com/ | grep -i robots` returns **nothing**.

Step 4 is the one that matters. If the root returns that header, the scoping did
not take and the whole site is exposed to deindexing.

## Next

The prototype computes eligibility and open obligations in the browser. The
schema, row level security policies, views and workflow functions are written
and the reference data is loaded to Supabase; the 2,747 row roster and the
repoint of the app onto PostgREST are the outstanding work. Until then a
modified request could read anything, which is fine for a work sample and is not
fine for anything real.
