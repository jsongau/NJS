# RESEARCH: completion, progress and reward in a tool somebody uses for eight hours

Read 14 August 2026. Every source below carries the URL and the date it was read. Where a claim is
not obvious, the sentence that supports it is quoted rather than paraphrased.

This file sits beside `RESEARCH_saas_patterns.md`, which already argued the daily loop from Apple
rings, Todoist Karma, Duolingo streaks and Bogost. That argument is not repeated here. This file does
the thing that file did not: it goes at the **completion moment itself**, the mechanics of finishing
one unit of work, the criticism of celebration, the encodings that survive greyscale and a screen
reader, and the machinery for showing five screens in ten states each.

---

## VERDICT, IN ONE PARAGRAPH

The mechanic that survives eight hours is **an instantaneous state change with a redundant mark, no
sound, no character, and an undo**. Celebration is earned exactly once per real closure, at the
moment a **set** empties rather than each time a **row** completes, and it takes the form of the
space the work vacated rather than an overlay on top of it. Everything else in this space is either
a toy or a liability. The two products this codebase should be measured against are Superhuman, for
the reward at the end of a set, and Linear, for the refusal to animate anything a person does two
hundred times a day. Asana is the reference the owner named, and the single most useful thing Asana
does is not the unicorn. It is that the unicorn is **occasional** and has an **off switch** in
Display settings next to the colour blind mode.

---

## 1. ASANA, SPECIFICALLY

### 1.1 What actually happens

Five creatures: unicorn, yeti, narwhal, phoenix, otter. They fly across the screen when a task is
marked complete. The unicorn came first, and it came from a joke: "Over a decade ago, an engineer at
Asana introduced a unicorn as an April Fool's joke."
([Asana Design on Medium](https://medium.com/asana-design/cause-for-celebration-dd4cfbb01fa0), read
14 Aug 2026)

Asana's own design writing about the 2024 refresh gives each creature a personality ("Unicorn: The
leader and dreamer. Serious about celebration. Adventurer." "Narwhal: Makes a splash. Always keeps it
real. Ships results.") and frames the purpose as loyalty: Asana "creates lasting connections with
users to build a magically loyal customer base".
([Asana Design on Medium](https://medium.com/asana-design/cause-for-celebration-dd4cfbb01fa0), read
14 Aug 2026)

**What that piece does not contain is the interesting part.** It says nothing about frequency rules,
probability, restraint, reduced motion, or how to switch the thing off. The published design writing
is about the characters. The design decision that actually matters was never written up.

### 1.2 The frequency rule, which is the whole design

It is not every task. "It doesn't happen every time, but whenever you complete a task within Asana,
one of five celebration creatures might just pay you a visit."
([Zapier](https://zapier.com/blog/asana-celebrations/), read 14 Aug 2026)

The setting is literally named for the restraint. In My Settings, Display, the checkbox reads **"Show
occasional celebrations upon task completion"**, and Asana's own help centre describes it as "a
mythical creature will appear at random when you complete a task".
([Asana help centre, display settings](https://help.asana.com/s/article/display-settings), read 14
Aug 2026)

The word doing the work is **occasional**. Asana shipped the restraint into the label of the control.

The mechanism is a **variable ratio schedule**, the same reinforcement schedule that makes slot
machines work: unpredictable reward at an unpredictable interval.
([Zapier](https://zapier.com/blog/asana-celebrations/), read 14 Aug 2026) A user on Asana's own forum
states the design rationale better than Asana's blog does: "If it's *always*, then where's the hopeful
expectation? It just becomes...oh, there goes another unicorn."
([Zapier](https://zapier.com/blog/asana-celebrations/), read 14 Aug 2026)

Users have asked Asana to make it fire every time: "Can we please have the option to change the
setting so the animal can be congratulating us on completing our tasks every time?" Asana has not
shipped it, and there is no staff explanation in the thread. Notably, a reply pushes back on the
variable ratio logic on neurodiversity grounds, arguing it "only works for neurotypical brains" and
that some people benefit from consistent reinforcement.
([Asana forum](https://forum.asana.com/t/ability-to-see-asana-animal-celebrations-when-completing-every-task/170032),
read 14 Aug 2026)

**Read that as: Asana has held the line on restraint against direct user requests to remove it, for
over a decade, and has never published why.**

### 1.3 The off switch, and what it says

There is one, and it is the same class of control as the accessibility settings. The Display panel
carries "Show row numbers", "Enable compact mode", "Enable color blind friendly mode (protanopia and
deuteranopia)" and "Show occasional celebrations", all in the same list.
([Asana help centre](https://help.asana.com/s/article/display-settings), read 14 Aug 2026)

That adjacency is a design statement. Asana treats "I do not want the creature" as the same kind of
preference as "I am colourblind": not a taste, a configuration of the person using the tool. The
"occasional celebrations" toggle is also **the only motion related setting in the entire Display
panel**. There is no in-app reduced motion control. Asana relies on the operating system for
everything else and gives a bespoke switch only to the creature, which tells you they knew the
creature was the thing people would want stopped.

### 1.4 The complaints, verbatim, because they are the risk to this project

A thread titled **"How to turn off childish unicorns"**. The poster: "I've asked customer service over
and over on how to turn off these silly animals dashing across my screen, and they have not been able
to help." He calls the feature "silly, unprofessional, and downright childish". Another user calls
them "infantilizing". A third reports it blocks work: "It causes my screen to freeze until the animals
go across and I can't move to another screen to continue working."
([Asana forum](https://forum.asana.com/t/how-to-turn-off-childish-unicorns/578094), read 14 Aug 2026)

Four separate failure modes in one thread, and every one applies to this project:

1. **Register.** "Unprofessional", "childish", "infantilizing". This application is a work sample. A
   hiring manager reading it as a toy is a total failure of the work sample, not a taste difference.
2. **Discoverability of the off switch.** The user could not find it and support could not tell him.
   A mechanic with a hidden off switch is a mechanic with no off switch.
3. **It blocked input.** The celebration took the main thread and the person could not work. This is
   the single worst thing a reward can do and it happens routinely.
4. **The off switch did not always work.** Other users in the thread report celebrations continuing
   after disabling. A moderator had to test it in their own account to confirm the setting functions.

Related threads exist for removing the rainbow on completion and for removing the creatures entirely,
going back years.
([Asana forum, option to remove](https://forum.asana.com/t/option-to-remove-unicorn-and-monsters-etc/27462),
read 14 Aug 2026)

### 1.5 What to take from Asana

- Take the **occasional** rule. Not the creature.
- Take the **off switch sitting beside the accessibility settings**. This codebase already does this
  better than Asana: `DailyRings` removes the strip from the document rather than hiding it, and
  leaves one plain control to bring it back.
- Take the **word in the label**. "Show occasional celebrations" is honest about its own frequency.
- Reject the **flying character**, the **screen-wide overlay**, and the **rainbow**. All three are
  the specific things professionals filed tickets to remove.

---

## 2. COMPLETION MECHANICS THAT HOLD UP IN A TOOL USED FOR EIGHT HOURS

### 2.1 Superhuman, the most cited example, and what it actually does

Rahul Vohra's framing is the sharpest sentence in this whole research file:

> "Game design is not gamification. It is not simply taking your product and adding points, levels,
> trophies, and badges."

His reason is that extrinsic rewards "massively undermine intrinsic motivation".
([Superhuman blog, seven principles](https://blog.superhuman.com/game-design-not-gamification/), read
14 Aug 2026)

The seven principles, as published:

1. Create goals that are concrete, achievable and rewarding.
2. Design for nuanced emotion.
3. Create rapid and robust controls.
4. Make fun toys and combine them into games.
5. Make the next action obvious.
6. Give clear and immediate feedback with no distractions.
7. Balance high perceived skill with high perceived challenge.

([Superhuman blog](https://blog.superhuman.com/game-design-not-gamification/), read 14 Aug 2026)

Principle five is the one that matters most for a queue: "When I archive the same email, I immediately
see the next one. I don't have to make any decisions at all." **The reward for finishing a row is
that the next row is already in front of you.** That is free, it is instant, and it is the mechanic
this application's queues should be built on before anything decorative is considered.

Principle six carries the constraint in its own name: feedback with **no distractions**. Superhuman's
single conversation view exists so that "You can only see one conversation at a time".

The Inbox Zero image is the celebration, and its properties are worth listing precisely because they
are the opposite of confetti:

- It is **aesthetic, not numeric**. There is no score, no points, no level.
- It **occupies the space the work vacated**. It is the empty state, not an overlay.
- It **costs nothing to dismiss** because there is nothing to dismiss.
- It fires **when a set is empty**, not when a row completes.
- Superhuman's stated definition of fun is "pleasant surprise", and they add seasonal images (Earth
  Day, Pride, National Dog Day) to keep the surprise alive.
  ([Superhuman blog, inbox zero images](https://blog.superhuman.com/how-superhuman-chooses-inbox-zero-images/),
  read 14 Aug 2026)

Their image selection criteria are also instructive for a dark arcade theme: "Novelty of viewpoint",
"Rarity of color", "Original compositions", avoiding clichés, and **minimising human subjects**.
([Superhuman blog](https://blog.superhuman.com/how-superhuman-chooses-inbox-zero-images/), read 14 Aug
2026)

**The unstated cost:** Superhuman's own post says nothing about whether the image can be turned off,
how often it rotates, or what a screen reader gets. Nobody in this space has published the
accessibility of their celebration.

### 2.2 Linear, and the argument for doing nothing

Linear's published philosophy is about **recession, not celebration**:

> "Not every element of the interface should carry equal visual weight. While the parts central to
> the user's task should stay in focus, ones that support orientation and navigation should recede."

> "Structure should be felt not seen."

> "If most people don't immediately notice what changed, that's probably a good sign."

([Linear, behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh),
read 14 Aug 2026)

The design refresh piece **does not discuss motion or animation at all**. For a tool whose entire
brand is craft and speed, the absence is the position.

Linear's engineering writing makes the reason explicit. On the submenu safe area:

> "Some product and engineering managers take hundreds of interactions a day on Linear. Add in the
> time required to recoup after a menu disappears on you and the related frustration and it starts to
> feel like an important interaction to improve."

([Linear on Medium, Invisible details](https://medium.com/linear-app/invisible-details-2ca718b41a44),
read 14 Aug 2026)

**Hundreds of interactions a day** is the number that kills celebration on a per-row basis. Multiply
any animation, however tasteful, by three hundred.

Emil Kowalski, who builds motion libraries for a living, states the rule bluntly for
keyboard-initiated actions: "you should *never* animate them", because animations make these
interactions "feel slow, delayed, and disconnected from the user's actions". His frequency test is
the right one: "Used multiple times a day, this component would quickly become irritating." And his
duration ceiling: "UI animations should generally stay under `300ms`", with "A `180ms` dropdown
animation feels more responsive than a `400ms` one."
([Emil Kowalski, You Don't Need Animations](https://emilkowal.ski/ui/you-dont-need-animations), read
14 Aug 2026)

NN/g agrees on the numbers and adds the failure direction: simple feedback animations "roughly 100 ms
(0.10 seconds) in total duration"; substantial screen changes "200 to 300 ms"; "At 500ms, animations
start to feel like a real drag for users"; and the diagnosis, "It is far more common for animations
to be too long than too short." Ease-out is recommended because it "makes the animation feel
responsive, but allows the eye time to focus on the element as it comes to rest".
([NN/g, Executing UX Animations](https://www.nngroup.com/articles/animation-duration/), read 14 Aug
2026)

This codebase's `--dur-1: 120ms`, `--dur-2: 200ms`, `--dur-3: 320ms` are already inside that
envelope, and `useRollingNumber` in `WorkingSetLead.tsx` already runs at 200ms with an ease-out. No
change needed. **The tokens are correct; the discipline is about how many things use them.**

### 2.3 Things 3, and the case for haptics over animation

The most-praised task app of its generation gets its completion feel from **touch, not motion**. The
MacStories review: "the pop of the interface forms a perfect marriage with haptic feedback. It makes
every interaction with the app feel that much more real." The overall assessment is that "the common
acts of creating new tasks, reorganizing them, checking them off, and engaging a search box all feel
fundamentally designed for personal interaction; they give a sense of depth, of meaningful tactile
engagement."
([MacStories](https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/), read
14 Aug 2026)

The review, notably, **never describes a completion animation**. The delight is in the Magic Plus
button and the haptics. On the web, with no haptics available, the lesson transfers as: put the craft
into the **input**, the target size and the immediacy, not into a flourish after the fact.

### 2.4 Sound, which is the first thing professionals turn off

Todoist plays a completion tone. The complaint pattern is entirely predictable: sounds "can be
annoying, especially when they happen when you're on your morning commute or in a meeting", and are
framed as "unnecessary noise" that "doesn't always contribute to planning out your day and week". The
setting is Settings, General, "Sound & appearance", with a separate "Task Complete Tone" toggle on
mobile.
([MakeUseOf on Todoist sound](https://www.makeuseof.com/how-to-remove-sound-effects-todoist/), read 14
Aug 2026)

Microsoft To Do and Microsoft Planner both carry documented "how do I turn off the completion sound"
questions in their official support channels.
([Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5309162/turn-off-task-completion-sound-in-planner),
read 14 Aug 2026)

**Every major task tool that ships a completion sound also ships an off switch and a support article
about the off switch.** A prospecting console used at a desk in an open venue office should not ship
sound at all. The venue is loud enough.

### 2.5 The strike-through, which people also turn off

Notion fades and strikes through completed to-do items. There is a userscript with the sole purpose of
removing it: "This script prevents notion from adding a strikethrough and fading checked off items in
a todo list." The author's reasoning is the important part: removing the effects "makes it much easier
to read and the checkbox is enough for anyone to know that that item has been completed."
([Greasy Fork](https://greasyfork.org/en/scripts/379011-notion-so-clean-todo-lists-no-strikethrough-or-fading),
read 14 Aug 2026)

**A completed row that is struck through and faded is a row that is now harder to read than an
incomplete one, and it is still taking up space.** For a prospecting queue, where the completed
touches are evidence and the reader will want to scan them, this is the wrong direction. Either the
row leaves the working set (and appears in a "done today" count) or it stays fully legible with a
mark. Never faded.

### 2.6 monday.com, the counter-example, and what it proves

monday.com fires confetti and fireworks on a status column moving to Done. The forum record is
instructive because it runs both directions at once:

- Users lose the confetti and file tickets to get it back: "I've lost my confetti on my Status
  column!"
  ([monday community](https://community.monday.com/t/ive-lost-my-confetti-on-my-status-column/59595),
  read 14 Aug 2026)
- Users file to make it bigger: "Confetti on Completed Task Animation to go full screen"
  ([monday community](https://community.monday.com/t/domapine-fiends-confetti-on-completed-task-animation-to-go-full-screen/101681),
  read 14 Aug 2026)
- Users file to turn all animation off: "Button to turn off all animations"
  ([monday community](https://community.monday.com/t/button-to-turn-off-all-animations/64338), read 14
  Aug 2026, thread returned 404 on fetch, title recorded from search index)
- And there is a thread of users objecting to a seasonal celebration entirely, "Pride Balloons,
  Really?!?"
  ([monday community](https://community.monday.com/t/pride-balloons-really/89057), read 14 Aug 2026)

**The lesson is not that celebration is bad. It is that celebration is polarising, and a polarising
feature in a work sample is a coin flip in front of the one person whose opinion decides the
outcome.** A hiring manager who dislikes confetti does not file a ticket. They close the tab.

### 2.7 The professional daily loop with no game layer at all

Already covered in `RESEARCH_saas_patterns.md`: Apollo ships a Tasks queue grouped by due date, a
Recommended subset, and a one at a time runner with Mark as Complete. Same loop as a daily quest,
none of the costume. That remains the baseline and it is the thing this application already matches.

---

## 3. THE DARK SIDE, HONESTLY

### 3.1 The named academic failure modes

**The overjustification effect.** Deci's 1971 work: "Extrinsic rewards, such as money, can actually
diminish a person's intrinsic motivation to perform a task."
([Growth Engineering](https://www.growthengineering.co.uk/dark-side-of-gamification/), read 14 Aug
2026) Vohra reaches the same conclusion from the product side: extrinsic rewards "massively undermine
intrinsic motivation".
([Superhuman](https://blog.superhuman.com/game-design-not-gamification/), read 14 Aug 2026)

Applied here: a rep who prospects because closing events is his job should not be given a second,
weaker reason to prospect. The ring is legitimate only because the ring counts the job.

**The leaderboard loser effect.** "If a user sees themselves in 20th, 100th, or even 1000th place on
the scoreboard with no hope of catching up, a rational response would be to stop playing."
([Growth Engineering](https://www.growthengineering.co.uk/dark-side-of-gamification/), read 14 Aug
2026) This application is single player. **There must never be a leaderboard, a percentile, a
comparison to "top reps", or a benchmark presented as a peer.** There is nobody to compare to and any
comparison would be invented, which also breaks the no-invented-facts rule in the contract.

**Pointless pointification.** "When a learner gets a badge for a trivial task like logging in to their
learning management system or downloading a PDF, it devalues the entire approach."
([Growth Engineering](https://www.growthengineering.co.uk/dark-side-of-gamification/), read 14 Aug
2026) The consequence named is that users "perceive gamification as manipulative tactics". Note the
direction of the damage: it is not that the badge fails to motivate, it is that the badge **retro
actively discredits everything else in the product**. One cheap celebration on a trivial action makes
the reader distrust the serious figures beside it. In an application whose entire claim is provenance
on every commercial figure, that is the most expensive possible mistake.

### 3.2 Streaks that punish

Covered in `RESEARCH_saas_patterns.md` via Chou. The additions here are the concrete mechanics and one
number.

Named shame patterns: **confirmshaming** ("Are you really going to give up now?", "Winners don't quit
on day 47"), **paid streak repair** which "monetise[s] user anxiety" by "extracting money from
emotionally vulnerable moments", and **perfectionism-driven design** where "missing one day feels like
complete failure, leading to abandonment rather than recovery".
([UX Magazine, hot streak game design](https://uxmag.com/articles/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame),
read 14 Aug 2026)

The fix that actually has data behind it is **separating the streak from the goal**: Duolingo found
learners with freezes were "4% more likely to return a week later and 5% less likely to lose their
streak", and separating streaks from goals increased learners maintaining seven day plus streaks by
"over 40%".
([UX Magazine](https://uxmag.com/articles/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame),
read 14 Aug 2026)

Applied here: the existing "Weeks closed" figure in `DailyRings.tsx` is already the correct shape. It
is weekly, not daily; it is a secondary figure in a small slot; it has a title attribute explaining
its basis; and nothing in the product notifies about it or threatens it. **Do not add a daily streak.
Do not add a "streak at risk" state. Do not add a repair purchase, a repair action, or a repair
prompt.** There is nothing to repair because nothing is being taken away.

### 3.3 Confetti, specifically

Two good pieces, and they converge.

Peter Ramsey's rule set. "Celebrations only work **when they align with what the user wanted to do**."
The mechanism: "Humans are wired to crave completion. Reaching a clear outcome gives us a sense of
closure, and *that's* the point at which a celebration can amplify the experience." The failure: "if
you celebrate too early, **you distort the user's ability to predict what comes next**." His fourth
rule is the one to write on the wall: "Confetti works best when layered *on top of real progress* not
as a substitute for it." And the closing line: "Confetti is optional. Meaning is not."
([UX Planet](https://uxplanet.org/why-confetti-celebrations-backfire-and-how-to-make-them-work-be838a6e7b8b),
read 14 Aug 2026)

His diagnostic example is a product celebrating **the company's milestone rather than the user's**: an
account created, a signup completed. Translated into this application, the banned cases are exactly
the ones a naive build would ship: a celebration for **adding a prospect**, for **saving a note**, for
**opening a record**, for **applying a filter**. None of those is a completion. They are the tool
being used.

Rowdy Vass on devaluation: "after years of being pummeled with confetti on every screen we look at, a
confetti burst at special moment is neither surprising nor delightful anymore." His proportionality
test: "Confetti for depositing a check seems like overkill. Confetti for buying a house is a different
story." His F-E-A-T criteria are Frequency ("How often does this moment happen for your customer?
Users don't want to be inundated with animations"), Emotion (will most users actually feel
celebratory, and what about the edge cases where they will not), Animation (match intensity to
significance) and Transition (guide the user forward). And the line that applies hardest to a work
sample: "if your experience isn't great, an animation may only emphasize how not magical the
experience was."
([UX Collective](https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19), read
14 Aug 2026)

The Emotion criterion has a specific application in this domain. **A prospecting outcome is not
always good news.** Marking a school as "lost" is a completion. Clearing a stale record by deciding it
is dead is a completion. A celebration that cannot distinguish "booked a birthday package for forty"
from "wrote off the district after eight months" is a celebration that will fire at a funeral. This is
the Zoom layoff case Vass names, in this domain.

### 3.4 The line, named

A completion mechanic is **legitimate** when all five hold:

1. The thing counted is the thing the person came to do, in the unit they already think in.
2. The mechanic returns work, not just a figure. Pressing it does something.
3. It fires at a closure the person chose, not at a step the product wanted.
4. It cannot be earned by using the tool rather than doing the job.
5. It can be switched off, findably, and off means gone.

It is **exploitationware**, in Bogost's term already cited in `RESEARCH_saas_patterns.md`, the moment
any one of those fails.

And there is a sixth for this project specifically, because it is a work sample:

6. **Nothing on the screen would embarrass the owner if a general manager were reading over his
   shoulder.** No character, no mascot, no rainbow, no "Nice work!", no exclamation mark.

---

## 4. PROGRESS AND COMPLETION THAT IS NOT A PROGRESS BAR

### 4.1 The perceptual ranking, which decides the encoding

Cleveland and McGill's ordering of elementary perceptual tasks, most accurate first:

1. Position along a common scale (scatter plot)
2. Position on identical but nonaligned scales
3. Length (bar chart)
4. Angle and slope, tied (pie chart)
5. Area (bubbles)
6. Volume, density and colour saturation, tied (heatmap)
7. Colour hue (newsmap)

([FlowingData summary of Cleveland and McGill 1984](https://flowingdata.com/2010/03/20/graphical-perception-learn-the-fundamentals-first/),
read 14 Aug 2026)

**A progress ring is angle, which is fourth. A progress bar is length, which is third. A count of
discrete filled marks is neither: it is counting, which is exact.** This is the formal justification
for what `DailyRings.tsx` already does with countable segments, and it should be stated in the spec
rather than left as taste. Above roughly a dozen units, counting stops being possible at a glance and
the segments become a texture, which is why the existing `MAX_SEGMENTS = 12` fallback to a single arc
is correct.

Note the honest caveat from the same source: "the decoding error for all encoding types isn't wildly
bad". The ranking is a framework, not a prohibition. The reason to prefer counted marks here is not
that arcs are unreadable; it is that **this reader is colourblind and the segment encoding survives
greyscale while a hue-graded arc does not**.

### 4.2 The government pattern, which is the most-researched checklist in existence

The GOV.UK task list pattern has run across dozens of services since 2017. Two research findings
matter here.

**Status tags get clicked.** "teams observed users attempting to click on the status tag (for example
'not yet started') instead of the link text." The fix was to make the whole row clickable.
([GOV.UK design notes](https://designnotes.blog.gov.uk/2023/12/15/working-as-a-community-to-iterate-the-task-list-pattern/),
read 14 Aug 2026)

Applied here: **every status chip in a list must either be a control or must not look like one.**
`LaneChip` inside `DailyRings`' `RingList` rows is decorative beside a `RecordName` that is the
control. That is a live risk. Either the whole row opens the record or the chip filters. Half is
worse than either.

**Uppercase status text was removed.** "the uppercase text on status tags may be harder to read than
regular text, particularly for certain user groups", and the tags moved to "darker text colour on a
lighter coloured background, and no longer uses uppercase text".
([GOV.UK design notes](https://designnotes.blog.gov.uk/2023/12/15/working-as-a-community-to-iterate-the-task-list-pattern/),
read 14 Aug 2026)

This is a direct conflict with an arcade marquee aesthetic, which wants uppercase everywhere. The
resolution: uppercase is fine for **display type, headings and marquees**, which are read once as
shapes. It is wrong for **status tags and lane chips**, which are read as words at small size, and
which are the exact thing carrying the redundancy the colourblind rule depends on.

The same source restates the rule the contract already holds: "WCAG criterion 1.4.1: Use of Color
recommends that you don't rely on colour when conveying information."

### 4.3 Partial completion, and progress toward something not started

The relevant finding is the **endowed progress effect** (Nunes and Drèze, "The Endowed Progress
Effect: How Artificial Advancement Increases Effort"). The car wash study gave one group a ten stamp
card with two stamps already applied and another an eight stamp card with none. Both required eight
purchases. The group given the artificial head start completed at a substantially higher rate.
([SSRN abstract](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=991962), read 14 Aug 2026;
summary at [Coglode](https://www.coglode.com/nuggets/endowed-progress-effect), read 14 Aug 2026)

**This is a technique to name and then refuse.** Giving a ring a fake head start would be inventing a
figure, which violates the provenance rule that is the entire spine of this application. A ring that
says "2 of 8" when nothing has been done is a lie in the one place this product cannot afford one.

What the effect legitimately licenses is **framing an untouched thing as a start rather than a
void**. The honest version, and the one already present in the codebase, is `reading.fresh` printing
the basis sentence instead of letting a default target look earned. That is the same psychological
work done truthfully: it tells the reader where the number came from rather than pretending they are
already ahead.

For a not-yet-started state, the correct encodings are:

- **Zero, stated, in the same slot the figure will occupy.** "0 of 8", not an absent figure. The
  fixed-width slot in `DailyRings.module.css` already guarantees nothing shifts when it becomes 1.
- **The pool count beside it.** "0 of 8. 34 waiting." The reader's question is not "how far am I", it
  is "is there anything to do". `ring.poolCount` already answers this.
- **A distinct word, not a dimmed version of the done word.** "Not started" is a state, not a lesser
  degree of "closed". `RING_STATE_META` already carries a glyph and a label per state.

For **partial** completion, the readable encodings in order of reliability are: the count of units
("3 of 7"), the count of filled marks, and only then the swept arc. Never a percentage. A percentage
on a target of eight forces the reader to do arithmetic to recover the fact they actually wanted,
which is how many more calls to make.

### 4.4 The checklist that collapses

The pattern worth adopting from the government task list is that a completed group **stops competing
for attention** without disappearing. The row remains, legible, with a status word, and the reader can
still see what was done. Contrast the Notion approach in section 2.5, where completion makes a row
harder to read.

In this codebase the equivalent already exists and is well built: `RingList` swaps the list of closers
for a small `ClearedBoard` when the ring closes. The list of things to do is replaced by the mark and
the figures that earned it. **The reward occupies the space the work vacated**, which is the
Superhuman model applied at the level of one ring rather than one inbox.

---

## 5. ACCESSIBILITY, WHICH IS WHERE MOST DELIGHT BREAKS

### 5.1 What the standard actually requires

WCAG 2.2 Success Criterion **2.3.3 Animation from Interactions**, Level AAA: "Motion animation
triggered by interaction can be disabled, unless the animation is essential to the functionality or
the information being conveyed."
([W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), read 14 Aug
2026)

The stated harm is not mild. "People can get sick from motion effects." "Vestibular (inner ear)
disorder reactions include dizziness, nausea and headaches." "The impact of animation on people with
vestibular disorders can be quite severe. Triggered reactions include nausea, migraine headaches, and
potentially needing bed rest to recover."
([W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), read 14 Aug
2026)

**A celebration animation is motion animation triggered by interaction, and it is by definition not
essential to the information being conveyed, because if it were essential it would not be a
celebration.** 2.3.3 therefore applies to it with no exception available. It is AAA, so it is not
strictly required at AA, but a work sample that fails the one criterion aimed squarely at the feature
it is showing off is a work sample arguing against itself.

Also relevant: flashing "more than three times in any one second" violates the guidelines, and
non-essential automatic motion lasting "more than five seconds" needs a pause, stop or hide control.
([web.dev, Animation and motion](https://web.dev/learn/accessibility/motion), read 14 Aug 2026)

### 5.2 Reduce does not mean remove, except when it does

web.dev's guidance is that the preference should give the user control rather than have the designer
guess: "empower users who have indicated a preference for reduced motion by providing them with
exclusive control over animations, allowing them to initiate and halt", and "consider still allowing
users to choose for themselves, rather than guessing how much animation is too much".
([web.dev](https://web.dev/learn/accessibility/motion), read 14 Aug 2026)

It also notes the OS wording is inconsistent: macOS and Android say "reduce motion" (on means less),
Windows says "show animations" (off means less). A build agent should never expose a UI control
labelled to mirror the OS setting, because the polarity will be wrong for half the readers.

The practical rule for this codebase, which is already implemented and should be preserved rather than
redesigned:

- `tokens.css` zeroes `--dur-1`, `--dur-2`, `--dur-3`, `--op-dur-slide`, `--op-dur-settle` and
  `--op-stagger` under `prefers-reduced-motion: reduce`. Any animation whose duration and delay come
  from tokens collapses to nothing automatically.
- `DailyRings.module.css` additionally sets `transition: none !important; animation: none !important`
  across the whole strip. The comment in that file calls it "the second line of defence rather than
  the only one", which is exactly right, because a stagger delay written in literal milliseconds would
  survive the token zeroing and strand a segment at its start weight.
- `useRollingNumber` in `WorkingSetLead.tsx` reads the media query **in script**, because a counted
  animation has no duration token for CSS to zero. It also subscribes live, so a reader who changes
  the OS setting mid-session gets the new behaviour without reloading.

**That three layer approach is the specification.** Any new mechanic must state which of the three
layers switches it off, and if the answer is "none", it does not ship.

### 5.3 What a screen reader actually gets, and the rule that matters most

The live region must already exist before the change: "place the live region container in the DOM as
early as possible and then populate it with the contents of the message using JavaScript when the
notification needs to be announced. This ensures that the live region is monitored for updates before
they happen."
([Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/),
read 14 Aug 2026)

**Re-mounting the region removes its monitoring capability.** This is the single most common way a
completion announcement silently fails, and it is exactly the trap a re-keyed celebration element
sets. `WorkingSetLead.tsx` already documents and avoids it: the live region sits **outside** the keyed
`<section>`, with the comment "A live region that is removed and re-added in the same commit is a
region assistive technology has no reason to read, so the announcement would be exactly the thing lost
to the mechanism that makes the change visible." That comment is the correct rule and every new screen
must follow it.

Role choice: `role="alert"` and `aria-live="assertive"` interrupt, and are for "when users need to
immediately know something and act on it, like when there's an error in submitting information in a
form, or something more serious like a session timeout or a security alert". `role="status"` is for
"advisory information for the user but is not important enough to justify an alert".
([Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/),
read 14 Aug 2026)

**A completion is advisory. It is `role="status"` with `aria-live="polite"`, always. A celebration
that interrupts a screen reader user mid-sentence is the audio equivalent of the Asana user whose
screen froze while the animals crossed it.**

Two further constraints from the same source: frequent updates overwhelm, and "Once an announcement is
made, it disappears forever", so the announcement must be self-sufficient and the visible state must
carry the same information for anyone who missed it.

### 5.4 Rings and screen readers, from the only shipped example worth citing

Apple's Activity rings announce "the (visually hidden) label of each bar, followed by the percentage
that's visualized". The author's broader praise is for redundant encoding: "I'm personally a big fan of
visualizing the same data in different formats", noting Apple also ships text summaries ("During your
last walk, your heart rate was 114 to 158 beats") and audio feedback for ECG and blood oxygen.
([Sarah Fossheim, What we can learn from Apple's dataviz accessibility](https://dev.to/fossheim/what-we-can-learn-from-apple-s-dataviz-accessibility-6fa),
read 14 Aug 2026)

The criticisms are as useful as the praise: the Activity app announces activity **twice**, the
watchface fails to announce ring values on first focus, and a grouped bar chart reports values that do
not match the visual.
([Fossheim](https://dev.to/fossheim/what-we-can-learn-from-apple-s-dataviz-accessibility-6fa), read 14
Aug 2026)

**Percentage is the wrong unit here.** "Move ring, 62 percent" is worse than "Touches, 5 of 8, 3 to
go". The existing accessible name in `RingButton` is already better than Apple's: "`${ring.label},
${ring.done} of ${ring.target} ${ring.unit}, ${ring.remaining} to go. Shows the ${closers.length} that
would close it.`" That name states the unit, the remainder and what pressing it does. Keep it.

Double announcement is the specific bug to guard against, and this codebase has already designed
against it in two places: one live region rather than three in `DailyRings.tsx`, and the rolled figure
marked `aria-hidden` with the settled figure exposed in `WorkingSetLead.tsx`, "because a number
counting up in a live tree is a number announced eleven times".

### 5.5 Do not reach for role="progressbar"

MDN recommends the native element over the role: "It is recommended to use a native `<progress>` or
`<input type="range">` elements rather than the `progressbar` role", because with non-semantic elements
"all features of the native semantic element need to be recreated with ARIA attributes, JavaScript and
CSS". Assistive technology "often present[s] the value of `aria-valuenow` as a percentage", and
`aria-valuetext` exists precisely for when that would be inaccurate.
([MDN, progressbar role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role),
read 14 Aug 2026)

For these rings the correct answer is **neither**. The ring is a button whose accessible name already
contains the count, the target, the unit and the remainder. Adding `role="progressbar"` would give a
percentage nobody asked for and would fight the button role. The SVG stays `aria-hidden="true"`, which
is what `Arc` already does.

### 5.6 The rule this section exists to establish

**A celebration that is invisible to a screen reader user is a feature that excludes them, and a
celebration that is only announced is a feature that interrupts them.** The resolution is that the
celebration must not be a separate thing from the state change at all. If the completion is announced
as a fact in words ("Touches closed, 8 of 8"), and the visible mark is a redundant encoding of that
same fact, then there is nothing extra to announce and nothing extra to miss. Any design where the
question "what does the screen reader get for the celebration" has a separate answer from "what does
it get for the state change" has already failed.

---

## 6. MULTI-SCENARIO PROTOTYPES: TEN STATES WITHOUT TEN SETS OF FAKE DATA

### 6.1 The options, honestly compared

**Storybook.** The industry standard. Managing state in stories is a solved problem with named
addons: Mock Service Worker for network, decorators and React Context addon for providers, args and
controls for props, Pseudo States for hover and focus, Query Params for URL state. The stated
principle is "Use mock data to simulate hard-to-reach states (empty, loading, etc). This saves time
and helps you verify that UIs work in different scenarios."
([Storybook blog](https://storybook.js.org/blog/storybook-addons-to-manage-data-state/), read 14 Aug
2026)

**Why it is wrong for this project.** `package.json` has no Storybook and no test runner beyond a
bare `playwright` dependency. Adding Storybook means a second build pipeline, a second set of CSS
module resolution rules, a second place for the arcade tokens to be loaded, and a second thing that
can be broken at the moment a hiring manager opens the repository. It also produces a **separate
artefact**: a hiring manager who opens the deployed site does not see the stories. The states would be
demonstrated somewhere nobody looks.

**Seeded demo data per scenario.** Ten scenarios means ten fixture sets to write, keep consistent with
102 organisations, and keep in agreement with the provenance rules. This is the approach the brief
correctly worries about.

**Time travel.** This is the one, and this codebase has already paid for it.

### 6.2 Why time travel is nearly free here, with the receipts

- `src/domain/selectors/daily.ts` takes `now?: string` and `systemNow?: string`. `src/domain/selectors/record.ts`
  takes `now?: string`.
- The board is frozen at a constant. The comment in `daily.ts` states it plainly: "The board is frozen
  at 23 September 2026 so that every figure in a screenshot survives the six months between it being
  written and a hiring manager opening it."
- The two clock design is already handled: a stamp counts as today if it falls on the day being read,
  on the reader's own day, or after the last day of seeded history, and the third clause is anchored
  to `HISTORY_ENDS` rather than to the day being read, specifically so that "asking these rings about
  a Monday three weeks ago" does not count everything since as this morning's work.
- `DailyRings` already accepts `now` and `systemNow` as props and threads them into the selector.
- `useSearchParams` is already in use across eleven files including `TodayPage`, `RepliesPage`,
  `RequestsPage`, `InboxPage`, `CupPage` and `QuotePage`.

**Every ingredient for a scenario switcher already exists. What is missing is one shared reader for
the parameter and one registry naming the interesting dates.**

### 6.3 Why the URL and not component state

The case for URL state is short and it is decisive for a work sample: "Send someone a link, and they
see exactly what you see". "Save a URL, and you've saved a moment in time". "The back button just
works". The test given for what belongs there: "If someone else clicking this URL should see the same
state? If yes, it belongs in the URL."
([Ahmad Alfy, Your URL Is Your State](https://alfy.blog/2025/10/31/your-url-is-your-state.html), read
14 Aug 2026)

Named pitfalls to respect: do not put sensitive data in the URL, do not put transient UI state such as
modal open or closed in it, use clear parameter names rather than base64 blobs, and mind
`replaceState` versus `pushState`.
([Alfy](https://alfy.blog/2025/10/31/your-url-is-your-state.html), read 14 Aug 2026)

For this application the practical consequences are large. A scenario URL can go in the covering
letter. A screenshot pass can drive ten states from ten URLs with no application code. A build agent
can hand a reviewer the exact broken state. And nothing extra ships: the parameter simply defaults to
the frozen board date when absent, so the deployed default is unchanged.

### 6.4 What a date alone can produce, per screen

A single `as-of` date, run through selectors that were already date driven, produces most of the
interesting states with no fixture writing at all:

- Nothing done yet (early on a working day).
- Partly done (mid morning).
- One ring closed, two open.
- All three closed, so `ClearedBoard` renders.
- A quiet inbox, so the replies ring closes at zero.
- A backlog day, so the stale ring has a large pool.
- A non-working day, so the strip says "not a working day".
- First run, so `reading.fresh` prints the basis rather than a target that looks earned.
- A date before any history, so every queue is genuinely empty.
- A date after history ends, so the third clock clause is exercised.

What a date **cannot** produce is anything not driven by the clock: an error state, a slow network, a
permission refusal, a 380px viewport. Those need their own switch or their own harness. Viewport is
already covered by the existing contrast walk at two widths.

### 6.5 The shape to build

One provider, one hook, one registry, one control. Roughly:

- A `ScenarioProvider` that reads `as-of` from the search params, validates it as an ISO date, falls
  back to the frozen board constant, and exposes `{ now, systemNow, scenarioId }`.
- A `SCENARIOS` registry: an ordered array of `{ id, label, asOf, note }`, where `note` is one short
  clause saying what the reader is meant to notice. Names are working names, not game names: "Fresh
  Monday", "Mid morning", "Day cleared", "Quiet inbox", "Backlog", "Closed day".
- A single `ScenarioBar`, rendered only when the parameter is present or a build flag is on, so the
  default deployed experience never shows it. It is a row of buttons that set the parameter. It is
  chrome, not a data surface, so a `Readout` tick is allowed on it and nothing else.
- Every page that reads a date reads it from the hook rather than from a module constant, so one
  parameter moves every screen at once.

The invariant that makes this safe: **the switcher only ever changes the clock.** It never injects
records, never fabricates a figure, never overrides a provenance badge. If a state cannot be reached
by moving the clock, that state is a genuine fixture and gets written once, honestly, in the data
files where every other record lives.

---

## 7. THE SPECIFICATION

Five build agents follow this. Where it conflicts with a personal preference, this wins. Where it
conflicts with `CONTRACT_arcade.md` or `CONTRACT_saas.md`, those win.

### 7.1 The completion mechanic

**A completed unit of work changes state instantly, in place, with three redundant signals and no
motion of its own.**

The three signals, in this order of importance:

1. **A mark.** The strike box from `ClearedBoard.tsx`, at the size the surface calls for. It is the
   bowling scoresheet's symbol for a cleared rack, it is a shape rather than a colour, and it is
   already the completion vocabulary of this codebase. Do not invent a second completion glyph.
2. **A word.** "Cleared", "Closed", "Done today", "Handled". One word or two. Never "Nice work",
   never an exclamation mark, never a second person sentence.
3. **A figure.** The count that moved, in tabular mono, in a slot pre-sized for its largest value so
   nothing on the page shifts.

Colour is the fourth thing and never carries a reading on its own. Put the surface through greyscale;
every reading must survive.

**Timing.** The state change is immediate. If anything animates, it uses `--dur-1` (120ms) or
`--dur-2` (200ms) with an ease-out, per NN/g's 100 to 300ms envelope and Kowalski's sub-300ms rule.
Nothing on a completion path is allowed a duration above `--dur-2`.

**Undo.** Anything that removes a row from the working set must be reversible for as long as the row's
absence is visible, and the undo must be reachable by keyboard without leaving the queue. This is the
professional reward: not a flourish, but the confidence to work fast. Superhuman's principle three,
"rapid and robust controls", and principle five, "make the next action obvious", are the two that
actually make finishing feel good.

**The next row.** When a row leaves a queue, focus moves to the row that took its place, not to the
document body and not into a celebration. If the queue is now empty, focus moves to the `ClearedBoard`
heading. Superhuman's "I immediately see the next one. I don't have to make any decisions at all."

### 7.2 When a celebration fires, exactly

**A celebration fires when a set empties, and never when a row completes.**

There are exactly three earned closures in this application:

1. **A ring closes.** The ring stamps, the state word changes, the segments settle. Already built in
   `DailyRings.tsx`. Fires at most three times a day and each is a real target the reader set or
   accepted.
2. **All three rings close.** The `ClearedBoard` replaces the ring list with "Day cleared" and the
   three figures that earned it. Fires at most once a day.
3. **A working queue empties.** A `ClearedBoard` occupies the space the rows vacated. Fires when there
   is genuinely nothing left in that bucket.

Each is a completion the reader chose, each occupies space that the work vacated, and each costs
nothing to dismiss because there is nothing to dismiss. This is Ramsey's rule that celebration must
be "layered on top of real progress, not as a substitute for it" and Vass's frequency criterion.

**A closure that has already happened is not news.** The `useAnnouncement` rule in `DailyRings.tsx` is
the pattern: record what is already closed on first pass without announcing it, announce only
transitions after that, and never re-announce an unchanged state. A ring that was closed when the page
loaded gets no mark animation and no announcement. Every new surface implements this rule or does not
ship the mechanic.

**Once per state change, per session.** Navigating away and back does not re-fire.

### 7.3 What must NOT fire. This list is not negotiable.

- **No confetti.** Not canvas, not CSS, not SVG, not on any surface, not on any event, not at any
  size, not seasonally. The one animation in this space that is universally recognised as cheap.
- **No character, mascot, creature, or anything that crosses the viewport.** The specific thing Asana
  users called "childish", "unprofessional" and "infantilizing", and the specific thing that froze one
  of them out of his own screen.
- **No sound.** No completion tone, no click, no chime. Every tool that ships one also ships a support
  article about switching it off, and this one is used at a desk in a venue office.
- **No modal, dialog, overlay, toast or anything that takes focus on completion.** A completion is
  advisory. Nothing about it justifies interrupting.
- **No celebration on: adding a prospect, saving a note, opening a record, applying a filter, sending
  a single message, changing a target, or loading a page.** These are the tool being used, not work
  being finished. Rewarding them is Todoist's "Karma for adding tasks" error, which pays the reader to
  inflate his own board.
- **No celebration on a negative outcome.** Marking an organisation lost, writing off a stale record,
  or recording a declined quote are completions and must not be celebrated. They get the same instant
  state change, the same mark, and no closure treatment. A tool that cheers when a district says no is
  a tool that is not paying attention.
- **No points, XP, coins, levels, badges, trophies, achievements, ranks or titles.** If a figure has a
  unit that is not a real work unit, it has already failed. Touches, replies, stale cleared, holds,
  bookings.
- **No leaderboard, percentile, peer benchmark or "top rep" comparison.** Single player, and any
  comparison would be invented, which breaks the provenance rule.
- **No daily streak counter, no "streak at risk" state, no streak repair, no notification about a
  streak.** The weekly "Weeks closed" figure already in `DailyRings.tsx` stays as it is: secondary,
  small, weekly, with a stated basis, and nothing hanging on it.
- **No animation on any data surface.** Rows, cells, map markers, table bodies. Motion is confined to
  chrome, per the existing rule in `Readout.tsx`. A hundred and two rows shimmering as a filter lands
  are a hundred and two rows nobody can read.
- **No animation on mount.** Zero is the load and the load never animates. Both `useChangeCount`
  implementations already encode this and both should be reused rather than rewritten.
- **No strike-through plus fade on a completed row.** It makes evidence harder to read than the work
  still outstanding. Mark it, or remove it from the set and count it.
- **No uppercase status tags or lane chips.** Display type and marquees may be uppercase. The words
  carrying the colourblind redundancy may not.

### 7.4 What it announces

**One polite live region per surface, mounted before anything changes, never re-keyed.**

- `role="status"` with `aria-live="polite"`. Never `assertive`, never `role="alert"`, for any
  completion or celebration on any screen in this application.
- The region lives **outside** any element that is re-keyed to restart a CSS animation. This is the
  documented trap in `WorkingSetLead.tsx` and it is the most common silent failure in this space.
- The sentence is the fact, in words, in work units. Never a percentage. Pattern:
  **"`{Label}` closed, `{done}` of `{target}` `{unit}`."** followed by the plain figures for the rest
  of the group. For a queue: **"`{Set}` cleared. `{n}` `{unit}` today."**
- The rolled or animating copy of a figure is `aria-hidden`; the settled value is the one exposed. A
  counting number inside a live region is announced once per frame.
- Nothing is announced twice. First pass records existing closed state silently; only transitions
  speak. This is the Apple Activity bug, avoided by design.
- The visible surface carries the same information in text, because "Once an announcement is made, it
  disappears forever".
- Interactive rings keep their button role and their existing accessible name, which already states
  count, target, unit, remainder and what pressing does. Do not add `role="progressbar"`. Do not add
  `aria-valuenow`. The decorative SVG stays `aria-hidden="true"`.

### 7.5 What it does under reduced motion

Three layers, all of which must be in place for any new mechanic:

1. **Tokens.** Every duration and every stagger delay comes from `--dur-*` or `--op-*` tokens, which
   `tokens.css` zeroes under `prefers-reduced-motion: reduce`. A delay written in literal milliseconds
   is a defect, because it survives the query and strands the animated property at its start value.
2. **A blanket rule per component.** A `@media (prefers-reduced-motion: reduce)` block killing
   `transition` and `animation` across the component subtree, as `DailyRings.module.css` already does.
   The second line of defence, not the only one.
3. **Script, for anything arithmetic.** A counted or interpolated value has no duration for CSS to
   zero, so the hook reads `matchMedia("(prefers-reduced-motion: reduce)")` itself and lands on the
   final value on the first frame. Subscribe to changes rather than reading once, so a reader who
   changes the setting mid-session gets the new behaviour and so a screenshot pass that sets the
   preference measures what that reader actually gets. `useRollingNumber` is the reference
   implementation; reuse it.

**Under reduced motion, nothing is lost except movement.** The figure still changes, the mark still
appears, the word still changes, the state still changes, the announcement still fires. If any reading
is only available through motion, the mechanic is wrong, not the preference.

**Do not offer an in-app motion toggle** that mirrors the OS setting. The OS wording is inconsistent
across platforms (macOS and Android say "reduce motion", Windows says "show animations"), so a
mirrored control will have the wrong polarity for a large share of readers. The mechanic's own off
switch is a different thing and it stays.

### 7.6 The off switch

The existing `DailyRings` behaviour is the standard and every new mechanic matches it:

- Off removes the element from the document. Not hidden, not collapsed, not counting quietly behind a
  `display` property.
- What remains is one plain control that says what it does in a full sentence of plain verbs.
- The control to switch off lives in the same panel as the targets, which is one press from the strip
  itself. Not buried in a settings page. The Asana thread where a user "asked customer service over
  and over" is what a buried off switch produces.
- The preference persists.

### 7.7 The scenario switcher

**Build a URL-driven scenario registry. Do not add Storybook.**

- One search parameter, `as-of`, holding an ISO date. Absent means the frozen board constant, so the
  deployed default is unchanged and no reviewer sees the switcher unless they ask for it.
- One `ScenarioProvider` reading and validating it, exposing `{ now, systemNow, scenarioId }`. Every
  page that needs a date takes it from the hook, not from a module constant.
- One `SCENARIOS` array of `{ id, label, asOf, note }` with working names, not game names. Suggested
  first set: Fresh Monday, Mid morning, Day cleared, Quiet inbox, Backlog, Closed day, Before history,
  After history.
- One `ScenarioBar`, chrome only, rendered only when the parameter is present or a build flag is set.
  It is a row of buttons that set the parameter, with the `note` for the active scenario beside it.
  This is chrome, so a `Readout` tick is permitted here and nowhere else.
- Use `pushState` when a person presses a scenario button, so the back button steps back through
  states, and `replaceState` for programmatic normalisation of a malformed date.
- **The switcher only changes the clock.** It never injects records, never fabricates a figure, never
  overrides a provenance badge, never forces a ring closed. A state that cannot be reached by moving
  the clock is a genuine fixture and is written once, honestly, in the data files.
- Each of the five new screens ships a short list in its own source comment naming which scenario
  dates exercise which of its states. That is the demo script, it costs a comment, and it means a
  reviewer can be handed eight URLs.

### 7.8 The single test to apply before shipping any of this

Two questions, both of which have to pass:

1. **Would a competent rep still be using this at four in the afternoon on the two hundredth
   repetition?** Multiply everything by three hundred, per Linear's "hundreds of interactions a day".
2. **Would the owner be comfortable if a general manager were reading over his shoulder at the exact
   moment it fired?**

If a mechanic passes the first and fails the second, it is a toy. If it passes the second and fails
the first, it is a novelty that will be switched off in week two. The mechanics specified above pass
both because they are the work being finished, drawn as a finished thing.

---

## SOURCES

All read 14 August 2026.

**Asana**
- Asana Design, Cause for celebration: https://medium.com/asana-design/cause-for-celebration-dd4cfbb01fa0
- Asana help centre, display settings: https://help.asana.com/s/article/display-settings
- Asana forum, How to turn off childish unicorns: https://forum.asana.com/t/how-to-turn-off-childish-unicorns/578094
- Asana forum, celebrations on every task: https://forum.asana.com/t/ability-to-see-asana-animal-celebrations-when-completing-every-task/170032
- Asana forum, option to remove: https://forum.asana.com/t/option-to-remove-unicorn-and-monsters-etc/27462
- Zapier, Asana celebration creatures: https://zapier.com/blog/asana-celebrations/

**Professional tools**
- Superhuman, Game design not gamification: https://blog.superhuman.com/game-design-not-gamification/
- Superhuman, How Superhuman chooses inbox zero images: https://blog.superhuman.com/how-superhuman-chooses-inbox-zero-images/
- Linear, Behind the latest design refresh: https://linear.app/now/behind-the-latest-design-refresh
- Linear, Invisible details: https://medium.com/linear-app/invisible-details-2ca718b41a44
- Emil Kowalski, You don't need animations: https://emilkowal.ski/ui/you-dont-need-animations
- NN/g, Executing UX animations, duration and motion characteristics: https://www.nngroup.com/articles/animation-duration/
- MacStories, Things 3 review: https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/
- MakeUseOf, remove sound effects on Todoist: https://www.makeuseof.com/how-to-remove-sound-effects-todoist/
- Microsoft Q&A, turn off task completion sound in Planner: https://learn.microsoft.com/en-us/answers/questions/5309162/turn-off-task-completion-sound-in-planner
- Greasy Fork, Notion clean todo lists: https://greasyfork.org/en/scripts/379011-notion-so-clean-todo-lists-no-strikethrough-or-fading
- monday community, lost my confetti: https://community.monday.com/t/ive-lost-my-confetti-on-my-status-column/59595
- monday community, full screen confetti: https://community.monday.com/t/domapine-fiends-confetti-on-completed-task-animation-to-go-full-screen/101681
- monday community, button to turn off all animations: https://community.monday.com/t/button-to-turn-off-all-animations/64338
- monday community, Pride balloons: https://community.monday.com/t/pride-balloons-really/89057

**Criticism**
- Growth Engineering, The dark side of gamification: https://www.growthengineering.co.uk/dark-side-of-gamification/
- UX Magazine, The psychology of hot streak game design: https://uxmag.com/articles/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame
- Peter Ramsey, Why confetti celebrations backfire: https://uxplanet.org/why-confetti-celebrations-backfire-and-how-to-make-them-work-be838a6e7b8b
- Rowdy Vass, The over-confetti-ing of digital experiences: https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19

**Progress and perception**
- FlowingData on Cleveland and McGill: https://flowingdata.com/2010/03/20/graphical-perception-learn-the-fundamentals-first/
- GOV.UK design notes, iterating the task list pattern: https://designnotes.blog.gov.uk/2023/12/15/working-as-a-community-to-iterate-the-task-list-pattern/
- Nunes and Drèze, The endowed progress effect: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=991962
- Coglode summary of the endowed progress effect: https://www.coglode.com/nuggets/endowed-progress-effect

**Accessibility**
- W3C WAI, Understanding SC 2.3.3 Animation from Interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- web.dev, Animation and motion: https://web.dev/learn/accessibility/motion
- Sara Soueidan, Accessible notifications with ARIA live regions, part 1: https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/
- Sarah Fossheim, What we can learn from Apple's dataviz accessibility: https://dev.to/fossheim/what-we-can-learn-from-apple-s-dataviz-accessibility-6fa
- MDN, progressbar role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role

**Scenarios and demo state**
- Storybook, addons to manage data and state: https://storybook.js.org/blog/storybook-addons-to-manage-data-state/
- Ahmad Alfy, Your URL is your state: https://alfy.blog/2025/10/31/your-url-is-your-state.html

**Read in the codebase**
- `CONTRACT_arcade.md`, `CONTRACT_saas.md`
- `src/components/play/ClearedBoard.tsx`, `src/components/play/Readout.tsx`
- `src/components/rings/DailyRings.tsx`, `src/components/rings/DailyRings.module.css`
- `src/components/queue/WorkingSetLead.tsx`
- `src/domain/selectors/daily.ts`, `src/styles/tokens.css`, `package.json`
