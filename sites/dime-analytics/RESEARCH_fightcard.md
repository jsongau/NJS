# RESEARCH: the fight card, the tale of the tape, and what bowling actually keeps

Read date for every source in this file: **14 August 2026**. Where a source is quoted, the quote is
verbatim, including American spelling in proper stat names, because a stat name is a name.

House rules observed: no em dashes, no en dashes, no arrows.

Who this is for: the person building the Cup surface under `CONTRACT_cup.md`. The three constraints
in that file bind everything below. Nobody in this cup has a competitive record, nobody has a name,
and no price is published. Every recommendation here is written for that world, not for a world where
sixteen teams have bowled a season.

---

## 0. The one sentence that matters

The fight card is a **costume**. Bowling is the **body**. Sections 1 to 4 are the costume and they are
mostly presentation grammar. Section 5 is the body and it is the part that has to be right, because a
bowling centre's sales manager will read the bowling and skim the boxing.

---

## 1. THE TALE OF THE TAPE

### 1.1 What it originally was

The phrase comes from boxing weigh-ins and originally meant only what a tape measure could take:
reach and height. It has since expanded "not just to include weight, but also other semi-objective
measurements like a fighter's previous record, what championship belts they possess, as well as
biographical information like where they are from."
Source: https://dearsportsfan.com/2015/08/31/what-does-tale-of-the-tape-mean/

That expansion is the whole point for this product. The tale of the tape has always been a mix of
**measured facts, career record and biography**, and it has never pretended the measured facts predict
the result. That is exactly the licence a cup with no played history needs.

### 1.2 The full classic boxing field list

The maximal old-school version, as published on a Mike Tyson tale of the tape, in this exact order:

1. Height
2. Weight
3. Reach
4. Chest (normal)
5. Chest (expanded)
6. Waist
7. Bicep
8. Neck
9. Wrist
10. Calf
11. Ankle
12. Thigh
13. Fist
14. Forearm

Source: https://brevheart.tripod.com/taleofthetape.htm

Fourteen rows, all anthropometric, and most of them useless. This is the version that reads as period
kitsch. It is worth knowing because the **rhythm** of it is the thing worth stealing: a long single
column of paired numbers, one row per attribute, no prose. Not the attributes themselves.

Note for honesty: BoxRec's own forum has long-running threads arguing that broadcast tale of the tape
measurements are frequently invented or inflated by promoters
(https://boxrec.com/forum/viewtopic.php?t=235670, thread title "Are 'tale of the tape' measurements
made up?"). I could not open the thread body, only the title and search listing. Treat that as
suggestive, not established. It does however match the wider point that the tale of the tape is a
promotional object first and a data object second.

### 1.3 The modern boxing event version

The Hall vs Bjornsson tale of the tape on Wikipedia, which is a good example of the modern
event-page form, carries:

- Boxer (name)
- Nickname
- Hometown
- Pre-fight record (shown as "1-0-2")
- Height (imperial and metric)
- Weight (metric and imperial)
- Recognition (honours and titles, free text)

Source: https://en.wikipedia.org/wiki/Eddie_Hall_vs._Haf%C3%BE%C3%B3r_Bj%C3%B6rnsson

Two things to notice. **Nickname and hometown are rows on the tape**, sitting between the biography
and the measurements. And **"Recognition" is an unbounded free-text row** for honours. Both are
directly transferable to a bowling team: a team has a handle, an origin, and a thing it is known for.

### 1.4 The modern UFC broadcast version

The televised UFC tale of the tape graphic is much shorter than boxing's:

- Fighter image
- Record
- Championship status (is this a title fight)
- Age
- Height
- Weight
- Reach
- Betting odds

Source: https://martialartsinsider.com/blogs/mma/tale-of-the-tape-ufc

The UFC later added **leg reach** to the graphic, which is now a standard bio field on ufc.com athlete
pages (confirmed in section 3 below). Coverage of the change:
https://mixedmartialarts.com/news/ufc-to-add-leg-reach-to-tale-of-the-tape/ (search listing read;
I could not open the article body, the mirror at fightland.vice.com returns a robots error).

A well argued critique of the MMA tape lists the shown fields as **age, height, weight, reach** and
attacks each one:

- Age is misleading because it ignores experience.
- Weight is distorted by weigh-in timing, since "the effect that a weight cut and rehydration has on a
  fighter is often the difference between winning and losing a fight."
- Reach is measured with "arms out to their sides with their fingertips extended, despite the fact
  that they would never strike like that."
- The biggest omission is leg reach.

Source: https://medium.com/@AkaashSharma/a-detailed-look-at-mmas-flawed-tale-of-the-tape-c9b8949df461

The transferable lesson: **a tale of the tape row that does not change the fight is decoration**, and
readers notice. A bowling tape should carry rows a bowler would actually argue about.

### 1.5 How the two sides are laid out, and how an edge is marked

The best live example I could open is Combat Edge's fighter comparison page.

Layout: symmetrical side by side, one fighter left, one right, each with photograph, flag, nickname
and an Elo rating. The comparison rows in order:

1. Record (shown "30-10-0" and "17-1-0")
2. Division
3. Height
4. Reach
5. Weight
6. Team (gym)

Then a stats block with paired numbers per row.

How an edge is marked: **numeric superiority in bold**, with the larger number on the side that holds
the advantage, plus an explicit inline note where the direction is not obvious. The page carries the
literal words "Lower is better" against significant strikes absorbed per minute.

Source: https://combat-edge.com/compare/dustin-poirier-212-vs-ilia-topuria-1165/

This is the single most useful finding in section 1 and it is directly usable under the colourblind
constraint. **Bold weight plus a written direction-of-good label is a complete non-colour encoding for
"who wins this row".** No colour is required at all. Add a glyph and it is belt and braces.

Other comparison tools of the same shape, listed for completeness, all found by search and all built
on the same left/right paired-row grammar:
https://blueprintmma.com/compare , https://honestelo.com/compare , https://fight-edge.com/

### 1.6 Recommended tale of the tape grammar for this product

Steal: the paired-row column, one row per attribute, no prose. The nickname row. The origin row. The
free-text honours row. Bold plus a direction label to mark the edge.

Do not steal: fourteen anthropometric rows, betting odds, and any row whose value nobody could argue
with.

---

## 2. RECORDS AND HOW THEY ARE NOTATED

### 2.1 The format

Boxing and MMA both use **W-L-D**, wins-losses-draws, sometimes with "No Contests appended". The same
source gives the arithmetic:

- Win percentage = Wins / (Wins + Losses + Draws) x 100
- No contests are excluded, because "they are not competitive results"
- KO percentage "shows how often a fighter wins by knockout or TKO relative to total wins"

Source: https://www.athletepath.com/combat-fight-record-calculator/

So KO percentage is a **share of wins**, not a share of fights. That is a real trap and worth writing
down, because the intuitive reading is wrong.

UFC's own record display, on ufc.com, is written as **"28-1-0 (W-L-D)"**, with the legend printed
inline next to the number. Source: https://www.ufc.com/athlete/jon-jones

That inline legend is a small thing and it is the right instinct. A record notation with no key is a
puzzle for anyone who does not already follow the sport, which in a family entertainment centre is
most of the audience.

### 2.2 How a record is compressed into a small space

Three levels of compression, in increasing order of density:

1. **Full**: "28-1-0 (W-L-D)" with method breakdown alongside.
2. **Tape row**: "30-10-0" bare, as on the Combat Edge comparison.
3. **Inline with name**: the boxing convention of the record in parentheses after the name.

Underneath the record, UFC breaks wins down by method as a **donut chart with both count and
percentage on each segment**: KO/TKO 11 (39%), DEC 10 (36%), SUB 7 (25%).
Source: https://www.ufc.com/athlete/jon-jones

The count-and-percentage-both pattern is worth copying. A percentage alone hides a tiny denominator,
which matters enormously in a first season.

### 2.3 Form, last five, and streaks

The near-universal convention outside combat sports is a **W/D/L strip of the last five or six
results**, described as "the green/grey/red W-D-L strip showing the last 5 or 6 matches".
Source: https://tactix.football/form/

Note what that description contains: **a letter and a colour**, together. The letter is the primary
signal and the colour is redundant reinforcement. That is already compliant with the colourblind rule
and it is the reason the pattern has survived on every scoreboard on earth. Do not remove the letter.

I could not confirm from a primary source whether the canonical strip runs oldest-first or
newest-first; the sources describe the strip without stating the order. Both orders exist in the wild.
**Pick one, label it, and never change it.** Newest last, reading left to right into the present, is
the more common broadcast habit and it matches the way a bracket reads.

For combat sports specifically, the equivalent of "form" is the **streak**, phrased as a sentence
rather than a strip: a win streak or a losing streak, stated in words. UFC rankings coverage confirms
that matchmaking weighs "recent victories (especially over ranked opponents)" and penalises
inactivity. Source: https://worldinsport.com/ufc-ranking-system-explained/

### 2.4 Amateur versus professional, and the debut with no record

This is the part that matters most for a cup where nobody has bowled.

**The distinction is structural, not cosmetic.** Sherdog's own submission guidance for regulators and
promoters requires every submitted bout to specify "whether the fight is professional or amateur".
Source: https://www.sherdog.com/news/articles/Sherdog-Fight-Finder-A-Guide-For-Regulators-Promoters-Managers-Coaches-and-Fighters-158515

Amateur and professional records are kept as **two separate records**, never summed. A fighter is
"12-2 as a professional, 34-5 as an amateur" and the two numbers live in different places. Combat
sports never merges an unofficial history into an official one.

**The debut.** A professional debutant is 0-0. The record is not hidden, it is not filled with a
placeholder, and it is not replaced with a projection. The card sells the debut **as a debut**, and
combat sports carries a whole vocabulary for a fighter with no record: prospect, debut, newcomer. UFC
card structure puts exactly these people in the early prelims, which are described as featuring
"newer fighters and prospects", specifically so they get "experience under the bright lights" without
the pressure. Sources: https://maincardmedia.com/2026/04/26/how-a-ufc-event-works-main-card-prelims-early-prelims-explained/
and https://worldinsport.com/ufc-main-card-explained/

There is also an established phrase for the moment a record starts: a fighter's first appearance for
the promotion is given its own dated bio field, **"Octagon Debut"**, on ufc.com.
Source: https://www.ufc.com/athlete/jon-jones

**This is the whole answer for the Cup.** Every team in this cup is a debutant. The honest combat
sports move is not to invent a record, it is to run a **debut card** where the absence of a record is
the story. "First professional bout" is a selling line, not an embarrassment. A dated debut field is a
real fact about a real enrollment: the date a slot was claimed already exists in `data/leagues.ts` as
`claimedAt`.

---

## 3. STAT CARDS AND STRENGTH DISPLAY

### 3.1 The actual UFC stat list, verbatim

From the live ufc.com athlete page. Labels reproduced exactly as printed, with the visual encoding
used for each. Source: https://www.ufc.com/athlete/jon-jones

**Bio fields:** Status, Place of Birth, Trains at, Age, Height, Weight, Octagon Debut, Reach, Leg reach.

**Record block:** record as "28-1-0 (W-L-D)"; Wins by Knockout; Wins by Submission; and a **donut
chart** of win method with count and percentage per segment.

**Striking:**
- Striking accuracy, 59%, shown as a **percentage with a bar**
- Sig. Strikes Landed, 1564 (raw count)
- Sig. Strikes Attempted, 2655 (raw count)
- Sig. Str. Landed Per Min, 4.38
- Sig. Str. Absorbed Per Min, 2.24
- Sig. Str. Defense, 64%
- Sig. Str. By Position, shown as a **stacked bar**: Standing 1012 (65%), Clinch 250 (16%), Ground 302 (19%)
- Sig. Str. by target, shown as a **donut**: Head 49% (759), Body 24% (375), Leg 27% (430)

**Grappling:**
- Takedown Accuracy, 37%, **percentage with a bar**
- Takedowns Landed, 36
- Takedowns Attempted, 98
- Takedown avg Per 15 Min, 1.89
- Takedown Defense, 95%
- Submission avg Per 15 Min, 0.46

**Other:** Knockdown Avg 0.25; Average fight time 14:52.

### 3.2 What the stats mean and what a normal value is

Definitions and medians, which are what make a bar readable:

- **Striking Accuracy** (`str_acc`): "the percentage of significant strikes attempted that land".
  Median 45%, 55%+ excellent.
- **Significant Strikes Landed Per Minute** (SLPM): median 3.42.
- **Significant Strikes Absorbed Per Minute** (SAPM): median 3.33. Lower is better.
- **Striking Defense** (`str_def`): "the percentage of opponent significant strike attempts a fighter
  avoids". Median 54%, 60%+ strong.
- **Takedown Average** (`td_avg`): takedowns landed per 15 minutes. Median 1.38.
- **Takedown Accuracy** (`td_acc`): median 40%.
- **Takedown Defense** (`td_def`): median 63%, 80%+ elite.
- **Submission Average** (`sub_avg`): attempts per 15 minutes. Median 0.6.

Source: https://www.cagequant.com/learn/ufc-fighter-stats-explained

**The structural lesson, and it is the important one for this build.** Every single one of those is a
**rate or a percentage, normalised by time or by attempts**, not a raw total. That is deliberate. It is
what lets a fighter with four fights be compared to a fighter with thirty. Raw counts are shown
alongside (Sig. Strikes Landed 1564) but they are never the headline.

A cup where every team has bowled between zero and three matches needs exactly this property. **Per
frame, per game, per attempt.** Never per season.

### 3.3 Which visual encodings work and which are decoration

The evidence is unusually clear here.

**Bars work.** Radar charts do not. Two independent critiques:

Observable names two fatal problems. Axis order dependency: "The order of data dimensions around the
circle matters. One order might create a smooth and symmetrical shape, while another will produce
something irregular and spiky." And meaningless connecting lines: "radar charts use lines to represent
categorical data, which means that the lines connecting the points between the axes are inherently
meaningless." Recommended instead: bar charts, faceted charts.
Source: https://observablehq.com/blog/avoid-radar-charts

Scott Logic adds the perceptual mechanism. Comparing values across axes "requires conscious thought to
mentally project a sort of arc of rotation", which human vision handles badly. The spider-web
gridlines create labelling ambiguity. The connecting lines between unrelated nominal variables are
"grossly misleading" because reordering the categories would change the perceived relationship.
Recommended instead: bar charts, small multiples, tables, and designs that show the **difference**
rather than the raw values.
Source: https://blog.scottlogic.com/2011/09/23/a-critique-of-radar-charts.html

That last recommendation is the sharpest one. **Show the difference, not the two raw values**, when the
question is "who is stronger here".

Ranked list of encodings for this product, best first:

1. **Paired horizontal bars against a shared axis, growing outward from a centre line.** This is the
   tale of the tape as a chart. Length is the primary encoding, length is the encoding human vision
   reads most accurately, and it needs no colour at all. The two sides are distinguished by
   **direction**, which is a geometric signal, not a colour one.
2. **A number, bold on the favoured side, with a printed direction-of-good label.** Proven in the wild
   on Combat Edge. Cheapest possible thing that works. Compliant by construction.
3. **A stacked bar with count and percentage printed on each segment.** UFC uses this for strike
   position. The printed values are what save it; a stacked bar without labels is unreadable.
4. **A W/D/L strip of letters.** Letter first, colour second.
5. **A donut with the count and the percentage written on the segment.** Acceptable for a
   three-category breakdown, and only because the labels do the work. The donut itself is decoration.
6. **Radar or spider.** Do not use. It is the single most tempting chart for a "fighter strength" panel
   and it is the one the literature is most united against.

**On percentiles.** UFC does not publish percentile bars; it publishes raw rates. Percentile framing
("better than 70% of the field") is genuinely useful for a stat card because it makes an unfamiliar
number interpretable. It also **requires a field to compute against**, and in a first exhibition
season the field is sixteen simulated teams. A percentile computed off a simulated field is a
simulated percentile and would need the same `illustrative` badge as everything else. My
recommendation: use a **median marker on the bar** instead. It gives the same interpretability with a
weaker and more honest claim, and it is one tick mark.

**The one rule that separates a stat card from decoration.** Every number on a good stat card answers
"compared to what". Striking accuracy 59% means nothing until you know the median is 45%. A bar with
no reference point is a coloured rectangle. **Put the comparison on the card**, whether that is the
opponent's value, the league median, or both.

---

## 4. CARD STRUCTURE AND BUILD UP

### 4.1 How a card is organised

Three broadcast segments, in running order:

1. **Early prelims**, from around 5 to 6pm ET. "Newer fighters and prospects."
2. **Prelims**, from around 8pm ET. "Established competitors", sometimes ranked fighters.
3. **Main card**, from around 10pm ET. Typically **five fights**: an opener, three supporting bouts,
   the **co-main event**, and the **main event**.

Sources: https://maincardmedia.com/2026/04/26/how-a-ufc-event-works-main-card-prelims-early-prelims-explained/
and https://worldinsport.com/ufc-main-card-explained/

Three points of grammar worth stealing:

- **The card runs from least to most significant.** The best thing is last. This is the opposite of how
  a software dashboard is usually built, and it is why a fight card feels like an evening rather than a
  list.
- **Placement is not the same as quality.** "The final prelim is often placed there on purpose. It acts
  as a lead-in" to the main card. The card is curated, not sorted.
- **The main event is structurally different**, not just bigger: it is scheduled for five rounds where
  the rest are three. The headline gets more of the thing everyone came for.

### 4.2 The week of build up

Fight week has a fixed published shape: "fight week begins on Tuesday with media appearances and open
workouts, followed by Wednesday and Thursday press conferences", official weigh-ins on Friday, then
"ceremonial weigh-ins, a public event with a face-off between opponents", and Saturday is fight day.
Source: https://maincardmedia.com/2026/04/26/how-a-ufc-event-works-main-card-prelims-early-prelims-explained/

The transferable insight is not the theatre. It is that **the promotion publishes a countdown with
named, dated stages**, and each stage is a reason to talk about the same event again. A quarterly cup
needs exactly that: a small number of named dates between enrollment and the first ball, each one a
legitimate reason for a rep to contact a captain.

### 4.3 What the face off actually does

The staredown began in boxing in the 1930s and 40s, and its modern form was engineered for the
camera: "If fighters are staring at each other from two feet away, you get this big dead space" in
photographs, so promoters moved them closer. The UFC then turned weigh-ins from a press-only
formality into an arena event. Dana White has called the staredown his "second favourite thing" after
the fights.
Source: https://www.atlasobscura.com/articles/why-fighters-stare-at-each-other-so-intensely-at-the-prebout-weighin

So structurally the face off is: **a scheduled, photographable moment where two named opponents are
placed side by side before the contest**. That is its whole function. It generates the image that
promotes the matchup.

It is also easy to overdo, and the audience notices when you do. When the UFC added extra produced
face-offs to fight week after the Paramount deal, the objection was that they were "unnecessary and
overly produced" and that the promotion was "trying to make everything theatrical like it's some kind
of a movie". Max Holloway called the concept "absolutely ridiculous".
Source: https://sports.yahoo.com/articles/ufc-fans-slam-fight-week-133513059.html

That is a useful warning for a work sample. **One face off per matchup is a device. Three is a
costume.**

### 4.4 The Ultimate Fighter, and the one mechanic worth stealing

Format: sixteen fighters of one weight class, split into two teams by two coaches conducting a
"schoolyard pick". Single elimination, in stages: preliminary round, quarter-finals, semi-finals, and
a grand finale held at a real UFC event. Winners advance, losers are out with no route back.
Sources: https://martialartsunleashed.com/ufc/how-does-the-ultimate-fighter-show-work/
and https://grokipedia.com/page/The_Ultimate_Fighter_1

**Sixteen. Two teams of eight. That is the format the owner named, and it is already the field size in
`domain/leagues.ts` (`FIELD_SIZE = 16`).** That is a genuine gift and it should be used explicitly.

The mechanic worth stealing is **matchup control**. Winning a weekly challenge granted "advantages
such as the ability to select opponents or secure additional private training time", and after each
episode's fights "the coaches selected matchups for the next round from the remaining pool."
Source: https://grokipedia.com/page/The_Ultimate_Fighter_1

I could not pin down from a primary source whether control passes on winning the fight or on winning
the separate challenge; the sources are vague on the exact transition rule and I am not going to state
it as fact. What is certain is that **the matchup is a prize, and a captain gets to choose it.** That
is a genuinely great mechanic for a bowling cup: a captain who wins picks who they play next. It
creates a decision, a story, and a reason for two captains to talk to each other, and none of it
requires anyone to be aggressive.

For comparison, the Road to UFC tournament runs the same shape as a regional qualifier feeding a main
promotion (https://fightomic.com/road-to-ufc-what-it-is/ returned a 403 and I could not read it; the
search listing describes a bracket across multiple events, which I am not treating as confirmed).

### 4.5 Ranking and the walk to a title

UFC rankings: a media panel votes, each division shows a champion plus a numbered top fifteen, and
there is a separate pound-for-pound list across divisions. Movement is driven by results, opponent
quality and visibility, with no published formula. The top contender theoretically gets the next title
shot, but "rankings indicate status, but matchmaking determines opportunity."
Sources: https://worldinsport.com/ufc-ranking-system-explained/ and, by search listing only,
https://cupzone.org/articles/ufc-rankings-explained-p4p-title-shots (robots disallowed, not read).

The transferable part is the **numbered position with a movement indicator**, and the honest part is
that the UFC's own ranking is subjective and it says so. A bowling cup can do better than that,
because a bowling ladder can be derived from real counts. `domain/leagues.ts` already does exactly
this with `StandingsBasis` set to `"form-up"`, and the comment there is right.

### 4.6 Transferable, and ridiculous, side by side

**Transferable to a family entertainment centre:**

| Combat sports device | Bowling cup version |
| --- | --- |
| Card running order, least to most significant | Match order on a cup night, opener through to the decider |
| Main event and co-main | The two matchups the venue promotes that week |
| Prelims featuring debutants | New teams and first-timers, framed as the debut card |
| Tale of the tape, paired rows | Two teams compared row by row |
| Numbered ranking with movement | The form-up ladder, already in the domain model |
| Fight week countdown with named dates | Enrollment close, draw, roster lock, first ball |
| The face off, once, as one image | Two captains, side by side, one promotional card |
| Sixteen-fighter bracket in named rounds | Sixteen teams, named rounds, exactly as TUF runs it |
| Matchup control as a prize | Winning captain picks the next opponent |
| Rate-based stats so newcomers compare | Per-frame and per-game bowling stats, not season totals |
| Nickname and hometown as tape rows | Handle and origin, which the contract already requires |

**Ridiculous in a family entertainment centre:**

| Combat sports device | Why it is wrong here |
| --- | --- |
| Trash talk, callouts, beef | The customer is a church group and an office team |
| Nose-to-nose staredown imagery | Physical intimidation in a room with a toddler play area |
| Betting odds on the tape | Publicly quoted odds on a family venue's own product |
| Weigh-ins and any body measurement | Weighing customers. Non-negotiable, see section 6 |
| Blood, damage, "absorbed", "punishment" language | Wrong register for a bowling league |
| "Kill", "destroy", "murderers' row" | Never |
| Pound-for-pound mythology | Requires a history nobody has |
| Fighter hype packages and villain edits | Manufactured conflict between actual customers |
| Championship belt iconography as the only reward | Fine as a graphic, wrong as the sole story |
| Titles won by matchmaker fiat | A bowling ladder can be honest, so it should be |

---

## 5. WHAT BOWLING ACTUALLY KEEPS

This is the section that has to be right.

### 5.1 The official definitions, from USBC

Verbatim from USBC's own definitions document, with rule numbers:

- **Average (Rule 108):** "Dividing the total number of pins credited to a bowler in one league by the
  number of games bowled"
- **Absentee Score (Rule 112):** "A score used when a regular member is absent, and a substitute is not
  available"
- **Vacancy Score (Rule 112):** "A score used when a team has an incomplete roster"
- **Pre-bowl (Rule 117):** "An individual/team who bowls prior to the scheduled league date"
- **Substitute (Rule 110c):** "Bowls in place of a regular member or a vacancy. Generally, does not pay
  league fees and not eligible for individual league prizes unless league rules allow."

Source: https://bowl.com/getattachment/d07894d8-e76e-43b8-b068-d04de4db27db/Definitions-08-01-2022.pdf

Note that **the average is truncated to a whole number**, not rounded: "truncated down to an integer
(whole-number) value". Source: https://en.wikipedia.org/wiki/Glossary_of_bowling

Also from that glossary, verbatim, and all of them directly relevant to the Cup:

- **Clean game:** "A game with a mark (spare or strike) in all ten frames."
- **Open frame:** "A frame in which neither a strike nor spare is achieved."
- **Spare conversion:** "In the second ball roll of a frame, the knocking down of all pins that
  remained standing after the first roll."
- **Double:** "Two consecutive strikes within a single game."
- **Pocket:** "The ideal place for the ball to hit the pins in order to maximize strike probability."
- **Anchor:** "In league play, the person bowling last on a team: usually the bowler with the highest
  average."
- **Position round:** "A league session in which teams that are adjacent each other in the standings
  are paired to bowl against each other."
- **Baker format:** "A team game scoring format in which a team's members bowl frames in a repetitive
  order."
- **Handicap:** "An integer (whole number, with no fraction) added to a 'scratch score' to form a
  'handicap score'...to make matches more evenly competitive."

The `anchor` and `position round` definitions both corroborate what is already written in
`domain/leagues.ts`. That file's comment about a position night in week sixteen is correct bowling.

### 5.2 The handicap, and how it is calculated

The formula:

**(Base score minus bowler's average) x percentage factor = handicap**

- The base score is "a fixed number chosen by your league, usually 200, 210, or 220."
- The percentage factor is commonly "80%, 90%, or 100%."
- Worked example given: "If your average is 150, the base score is 200, and the percentage factor is
  90%, your handicap would be: (200 - 150) x 0.90 = 45"

Source: https://gobowling.com/blog/guides-tips/bowling-handicap-system-guide/

USBC's own guidance to league officers adds the constraint that makes it correct: **the base must
exceed the highest average in the league.** Their example: "if the highest entering individual average
is 218, handicap should be 100% of 220." They also note leagues may run negative handicaps: "100%
handicap of 200, average is 220, bowler receives -20 handicap." The default percentage is 100%, and
USBC recommends higher percentages for more equalised matches. Leagues must also choose between
**individual or team handicapping.**
Source: https://bowl.com/getmedia/999a2a03-9fde-4382-b949-c9ab3729a5ea/060624_Rules-to-Consider-LOH-06-01-2024.pdf

Same source, the defaults a league has to set:

- **Absentee score:** "the absent member's current average minus 10 pins, unless otherwise provided by
  league rule."
- **Vacancy score, adult leagues:** default **120** unless the league specifies otherwise.
- **Match play options:** "A point for each game, but none for series", "Total pins of a three-game
  playoff series", "Best-of-three games", "Stepladder finals", "Single or double elimination",
  "Round Robin".

That last list is worth reading twice. **USBC's own league rulebook already offers single elimination,
double elimination, round robin and stepladder finals as sanctioned league playoff formats.** The
bracket this cup wants is not a boxing import at all. It is standard bowling.

### 5.3 The bit that decides everything: how a bowler with no average is handled

This is the exact problem the Cup has, and bowling has a mature, boring, correct answer for it.

- The USBC benchmark for a usable prior average is the "highest USBC average of 21 or more games".
- If a bowler has no prior average, "the bowler will establish an average the first league session".
- Per **USBC Rule 108c**, if they bowl fewer games than required on the first night, the average is
  computed by "dividing the total number of pins by the total number of games bowled the first night".
- Once the required games are complete, "the bowler's average and handicap would be recalculated per
  the league rule".
- Some leagues assign a flat entering average, which the document explicitly says "isn't considered an
  accurate representation of ability".

Source: https://images.bowl.com/bowl/media/legacy/internap/bowl/rules/pdfs/EnteringAverages.pdf

Two further rules confirm the same philosophy:

- **Rule 118b item 4:** a league board may raise a player's average mid-season by a two-thirds vote if
  the bowler performs significantly above their established average.
- **Rule 319a item 1:** for tournaments, use "the highest of either their composite average of all
  leagues or the highest single-league average of 21 games or more".

Source: https://bowl.com/welcome/recent-rule-changes

**The lesson for the Cup, stated plainly.** Bowling's own governing body does not invent a number for a
bowler with no record. It marks the average as **not yet established**, uses the first night's actual
pins as the provisional figure, and **re-rates once there is enough evidence**. It also explicitly
warns that assigned flat averages are inaccurate.

That is a ready-made, citable, real-world justification for the exact thing `CONTRACT_cup.md` requires:
a profile with an empty record field, a visible "not yet established" state, and a stated threshold at
which it becomes real. This is not a workaround. **It is how the sport does it.**

### 5.4 The individual statistics bowling actually tracks

**On a standings sheet.** USBC's own printed league standings form carries, for teams: TEAM STANDINGS,
HANDICAP, WON, LOST, %, TOTAL PINS, AVERAGE. For individuals: NAME, TOTAL PINS, TOTAL GAMES, AVERAGE.
Plus separate blocks for 1st, 2nd and 3rd High Game and 1st, 2nd and 3rd High Series, each tracked in
both **scratch** and **handicap** versions.
Source: https://images.bowl.com/bowl/media/legacy/internap/bowl/rules/pdfs/League%20Standings%208%20Teams%20or%20Less.pdf

A real league software standings sheet carries a slightly richer set: Pos, No, Team Name, Won, Lost
(twice, for the week and the season), Pct, PinsS (scratch pins), PinsH (handicap pins), Gms, Avg,
HiGS (high game scratch), HiSS (high series scratch). Individual rows are: Bowler's Name, Handicap,
Pins, Gms, Avg.
Source: https://www.ssec.wisc.edu/~beckys/bowl/0708/11standings.htm

**Everything on both of those is derived from pins and games.** There is no ball-by-ball data on a
standing sheet at all.

**Beyond the standing sheet.** A commercial bowling analytics product tracks, for each bowler:

- Average, Handicap, handicap total
- Individual game scores (Game 1, 2, 3), Series total, "Series w/hdcp"
- "# of Wins (overall)", "# of Undefeated (overall)"
- "Weekly Record (league night)", "Weekly Win%"
- "Season Record (overall)", "Season Win%"
- "Average Differential" (that night's average against the field average)
- "Finishes" rankings (Top 1, 5, 10, 20 series)
- "Over Average" (games above average, with a percentage)
- "High Games & Series" (season records)
- "Most Improvement" (across 21 games)

Source: https://bowlerstats.com/bowlerstats/

**"Average Differential" and "Over Average" are the two most valuable finds in this whole section.**
Both are relative measures. Both work in a short season. And both are exactly the bowling equivalent
of a rate-based UFC stat: they compare a bowler to the field or to themselves rather than to an
absolute score, which means a first-timer can appear on a leaderboard honestly.

**Ball-by-ball statistics.** These are the ones a serious bowler keeps and the ones the owner is
gesturing at with "boxing stats":

- **Pocket percentage:** how often the ball hits the pocket. "The absolute best players out there are
  masters of hitting the pocket consistently."
- **Strike percentage:** defined on this source as "The percent that we struck when hitting the
  pocket", described as "one of the biggest predictors of success".
- **Single pin spare percentage:** "The best single pin spare shooters at the league bowling level will
  shoot 96-98% at single pin spares." The article notes that one extra single pin conversion every
  three weeks across a hundred-game season adds a full pin to average.

Source: https://www.bowlersmart.com/2014/11/12/bowling-stats-for-success/

**A caution the builder needs.** "Strike percentage" is ambiguous in the wild. That source defines it
as strikes as a share of **pocket hits**. Common casual usage is strikes as a share of **frames**. They
are different numbers and they are both called the same thing. **Label whichever one you compute.**
I could not find an authoritative USBC definition that settles it; USBC's published documents cover
averages, handicap and league administration, not ball-by-ball analytics.

I attempted to read the bowlingboards.com threads on benchmark strike and spare percentages and first
ball average (http://www.bowlingboards.com/threads/18183-Good-Strike-Spare-Percentages-amp-First-Ball-Average
and http://www.bowlingboards.com/threads/19460-Pinpal-stats-What-to-strive-for) and both are blocked
by robots. **I therefore have no sourced benchmark for first ball average, split conversion percentage
or clean game percentage.** They are real, widely tracked stats; I did not find a citable number for
what a good one looks like. Flagged rather than guessed.

Definitions I can give with confidence from the glossary and general use:

- **First ball average:** the average number of pins knocked down with the first ball of a frame. Out
  of ten. A pure measure of how well you throw the first ball, with spare shooting removed.
- **Clean game percentage:** the share of games with a mark in every frame, per the glossary
  definition of a clean game above. It is a **consistency** measure, not a scoring one, and it is the
  single most encouraging stat for a beginner because a clean game is achievable without a strike.
- **Split conversion percentage:** the share of splits converted. Low for everyone. Best treated as a
  highlight, not a ranking stat.

### 5.5 What a good average is

- Beginner: "scoring between 100-130 is perfectly respectable"
- Intermediate, with regular practice or league play: 130 to 170
- Advanced amateur: "170-200+"
- Professional: "220 or higher"
- A 150 "puts you above many recreational bowlers"

Source: https://efx.co/blogs/news/what-is-a-good-bowling-score-understanding-averages-skill-levels-and-age-comparisons

I could not find a citable figure for the national USBC league average; the source explicitly does not
give one and I did not find another that does. Do not put a national average on a screen.

### 5.6 Formats a bowling tournament actually runs

**Baker format.** Five bowlers share one ten-frame game. Bowler one takes frames 1 and 6, bowler two
takes 2 and 7, bowler three takes 3 and 8, bowler four takes 4 and 9, bowler five takes 5 and 10. The
team score is "the total of the ten frames". Invented by Frank K. Baker in the 1950s because "he
thought switching bowlers for each frame might be more appealing to spectators". It "decreases
internal competition, builds trust in one another", each bowler only bowls two frames, and lineup
construction matters because the anchor takes the tenth.
Source: https://www.liveabout.com/baker-team-competition-format-420911

**Baker is the single best format finding in this research.** It was invented for spectators. It is
fast. It makes a five-person team into one score, which is exactly what a head-to-head cup matchup
needs. It puts the anchor in the tenth frame, which is a genuine drama beat that needs no manufactured
aggression. And it is dramatically more inclusive than a full team game, because a nervous first-timer
bowls two frames rather than ten.

**Bracket formats supported by real bowling league software:** round robin match play with cuts to 8,
12 or 16 bowlers and bonus pins for wins; single elimination brackets at 4, 6, 8, 12, 16, 32, 64 or
128 with optional byes; quad bracket redemption; eliminator with progressive cuts; stepladder finals;
Baker event; Baker finals; traditional doubles. Plus qualifying rounds, advancer rounds and position
round configuration.
Source: https://help.leaguepals.com/support/solutions/articles/44002580793-supported-tournament-formats-guide

**Sixteen is a first-class bracket size in bowling software.** The cup's field of sixteen needs no
justification from UFC at all.

---

## 6. BALL PREFERENCES

The owner asked for this by name. Keeping it short and real.

### 6.1 Weight

USBC maximum is **16 pounds**. There is no minimum. Balls of 13 pounds or more must have a
circumference between 26.7 and 27.002 inches and a diameter between 8.5 and 8.595 inches. Surface
hardness must be "not be less than 72 Durometer D at room temperature (68 - 78 degrees F)".
Source: https://www.bowlingball.com/BowlVersity/bowling-ball-specifications

**Caution on that source:** its section on balance holes is out of date. Effective **1 August 2020**
USBC **banned weight holes** and simultaneously raised the allowable static weight tolerance from 1
ounce to 3 ounces. Anyone with a drilled weight hole had to have it plugged to stay legal.
Source: https://www.bowlersmart.com/2020/03/19/2020-usbc-rule-changes-on-bowling-ball-weight-holes-by-mdm-coaching/
Corroborating coverage: https://www.flobowling.com/articles/6762074-starting-today-your-bowling-ball-may-be-illegal

None of that matters for a profile field. It matters because if the product prints a spec it should
print a current one.

In plain language, weight is the field every bowler knows without thinking. **"14 pound" is a thing
someone says about themselves.** It is the single best ball preference field in the whole set.

### 6.2 Coverstock, in plain language

The outer shell. In rough order of how much it grips the lane:

- **Plastic (polyester):** "Goes very straight with minimal hook". For beginners and for spare
  shooting, especially corner pins like the 7 and the 10. The source says outright that for a spare
  ball, "A basic Plastic ball is all you need."
- **Urethane:** moderate grip, smooth and early. "Hooks earlier than reactive but with less dramatic
  backend snap." For people who want predictability.
- **Reactive resin, solid:** matte, grips in the mid-lane. "Earlier hook, strong mid-lane read, and
  smooth arc." For heavy oil.
- **Reactive resin, pearl:** shiny, skids then snaps. "Longer skid through the front and mid-lane, then
  a sharper, more angular backend reaction." For drier lanes.
- **Reactive resin, hybrid:** a blend. "Combines the best of both", named specifically as the house
  league bowler's option on transitioning lanes.

Source: https://www.bowling.com/knowledge-hub/bowling-balls/simple-guide-to-understanding-bowling-ball-coverstocks

### 6.3 Surface grit, in plain language

Grit is how rough the surface is, and the rule is counter-intuitive: **the lower the number, the
earlier the ball hooks**, because rougher surface bites into the oil sooner.

- **500 to 1000, dull:** "ideal for heavy oil conditions or for bowlers with high ball speed"
- **2000 to 3000, benchmark:** "Most modern reactive balls come from the factory somewhere in this
  neighborhood"
- **4000 and above, polished:** "perfect for medium-to-light oil or when the lanes have 'broken down'";
  the ball "skids long through the oil and then makes a sharp, violent turn when it hits the dry part
  of the lane"

And the figure that explains why bowlers care: "up to 70% of a ball's hook potential comes from its
surface."
Source: https://www.bowling.com/knowledge-hub/bowling-accessories/should-my-bowling-ball-have-a-clean-or-a-dull-surface

### 6.4 Core, briefly

The weight block inside. **Symmetric** cores are more predictable and forgiving; **asymmetric** cores
create a stronger, more angular reaction. Source, general framing:
https://www.bowling.com/knowledge-hub/bowling-balls/simple-guide-to-understanding-bowling-ball-cores

This is a field a serious bowler knows and a casual one does not. Optional, never required.

### 6.5 Drilling layout, and why it should not be a required field

The modern standard is the **dual angle layout**, written as three numbers such as "50 x 4 x 35":

1. Drilling angle in degrees, controlling when the ball starts rolling. Low (10 to 30) is early, high
   (70 to 90) is late, 50 is balanced.
2. Pin to PAP distance in inches, controlling flare and traction. Longer (4 to 5+ inches) hooks more.
3. VAL angle in degrees, shaping the transition at the breakpoint.

PAP is the "positive axis point", the spot on the ball your hand naturally spins it around, measured
by a pro shop from your track marks.

The source is blunt about the audience: "You pick up your new ball, look at the drill sheet, and there
it is: something like 50 x 4 x 35. Three numbers. No explanation. Most of us just nod, pay, and go
bowl."
Source: https://www.bowlingaddicts.com/dual-angle-layout-explained/

**Conclusion: layout is a real field, and it is the wrong field for this product.** A casual league
bowler in a family entertainment centre will not know it, and asking for it in an enrollment form
signals that the league is for serious bowlers. Put it behind an "advanced" disclosure or leave it out
entirely. This is the single easiest place for this feature to make the venue feel unwelcoming.

### 6.6 The spare ball

The one piece of genuine bowling texture that is both cheap and universally understood. A spare ball
is a plastic ball thrown straight at corner pins. Confirmed above: "A basic Plastic ball is all you
need." Whether someone carries one is a **yes or no that says a lot about a bowler** and takes one
checkbox. The owner's instinct here is good.

### 6.7 The plain language version a casual league bowler would recognise

Ranked by how many people can answer without looking anything up:

1. **Ball weight.** Everyone. "I throw a 14."
2. **House ball or my own ball.** Everyone. This is the real dividing line in a league.
3. **Do you carry a spare ball.** Most regulars.
4. **Hand: right, left, two-handed.** Everyone, and it is genuinely useful for lane assignment.
5. **Ball name / nickname for the ball.** Everyone who owns one, and it is fun.
6. **Coverstock, as a plain choice: plastic, urethane, reactive.** Most regulars.
7. **Surface: shiny or dull.** Some regulars. Better than asking for a grit number.
8. **Grit number.** Serious bowlers only.
9. **Core, symmetric or asymmetric.** Serious bowlers only.
10. **Drilling layout.** Almost nobody. Leave it out.

---

## 7. RECOMMENDED FIELD LIST

Written for this product, this quarter, with nobody holding a competitive record.

### 7.1 A bowler profile

**Identity. All real, none invented.**
- Handle (required, and the contract's disclosure line goes near it)
- Positions played, from the existing `BowlingPosition` union: lead-off, second, third, fourth, anchor,
  substitute
- Captain flag
- Team, and route in: venue-formed, captain-formed, or organisation-formed
- Organisation, only where a real one exists on the prospecting board

**Debut, which replaces the record.**
- Enrolled on (date). This is `claimedAt` and it already exists.
- Cup debut (date or "not yet"). Borrowed from ufc.com's "Octagon Debut", and it is a real fact.
- Record: **"Not yet established"** as an explicit state, never 0-0-0 and never a blank. Cite USBC's
  own entering average practice for why.
- Games bowled toward an established average, as a count against a stated threshold. USBC's benchmark
  is 21 games; a sixteen-week cup will use a smaller one, and it should print whichever it uses.
- Average: **not yet established**, with the same treatment.
- Handicap: **not yet established**. State the basis and percentage that will be used when it is, and
  badge that basis `illustrative`, because Main Event publishes no handicap system.

**Exhibition figures, every one labelled simulated on the same line as the number.**
- Exhibition average
- Exhibition high game and high series
- Over average: games above their own average, count and percentage
- Average differential: their night's average against the field's
- Clean game percentage
- Spare conversion percentage
- Strike percentage, **with the definition printed**, since the term is ambiguous
- Form: a strip of the last five exhibition results as letters, W and L, letters first and colour
  second

**Ball preferences. The fun part, and the enrollment hook.**
- Ball weight (required if they own one)
- House ball or own ball (the real question)
- Hand: right, left, two-handed
- Carries a spare ball: yes or no
- Ball nickname (free text, optional, and this is the one people will actually enjoy)
- Coverstock: plastic, urethane, reactive, not sure
- Surface: shiny, dull, not sure
- Grit number (optional, advanced)
- Core: symmetric, asymmetric, not sure (optional, advanced)
- Layout (omit, or hide behind an advanced disclosure)

**Voice, which is cheap and does more for enrollment than any stat.**
- Walk-up line or entrance track, one short free text field
- Why they are here: for the social night, for the competition, brought by work, brought by a friend

Every one of those ball fields is a real thing about a real object. None of them is a claim about a
person. That distinction is what makes them safe under constraint 1.

### 7.2 A team tale of the tape

Twelve rows, in this order. The first six are facts that exist today. The last six only exist in the
declared exhibition and every one of them carries the simulated label.

| # | Row | Where it comes from | Direction of good |
| --- | --- | --- | --- |
| 1 | Team handle | `LeagueTeam.name` | none, identity |
| 2 | Seed | slot in the field of sixteen | lower |
| 3 | Formed | venue, captain, or organisation | none, identity |
| 4 | From | organisation where one exists, otherwise "unaffiliated" | none, identity |
| 5 | Captain | handle plus position | none, identity |
| 6 | Roster | bowlers committed out of team size, plus full or seats open | higher |
| 7 | Claimed | `claimedAt`, the debut date | earlier |
| 8 | Cup record | "Not yet established" or the exhibition record, labelled | higher |
| 9 | Team average | exhibition, labelled simulated | higher |
| 10 | Handicap | derived from average, basis printed, badged illustrative | context only |
| 11 | Form | last five as letters, labelled simulated | higher |
| 12 | The stat that decides it | one named stat, chosen per matchup, with its direction printed | printed |

Row 12 is the one that earns the whole design. The contract asks for "the stat that decides it", and
the Combat Edge pattern is the answer: **one named row, promoted to the top of the card, with the
favoured side in bold and its direction of good written out.**

Rows 1 to 7 are the honest core. **A tale of the tape built only from rows 1 to 7 would still work**,
and it would be defensible in a room where somebody asks how a venue that has not opened has a
scoreboard. That is the version to build first.

**Encoding, applied.** Paired horizontal bars growing outward from a centre line for rows 6, 9, 11 and
12. Bold on the favoured value. A printed direction label on every numeric row. A glyph on the
favoured side, from the existing `StatusToken` vocabulary rather than a new one. Colour last, and
carrying nothing that the length, the weight, the glyph and the word do not already carry.

---

## 8. WHAT NOT TO BORROW

Honest section. These are the things that would make a work sample read as a teenager's project, or
worse, would make a real venue unsellable to the customers it needs.

**Do not weigh anybody.** The weigh-in is the origin of the entire tale of the tape and it is the one
device that cannot cross over. A family entertainment centre selling league nights to schools, church
groups and office teams cannot put a customer's body weight on a screen. Not as a joke, not as an
opt-in, not as "fun stats". Ball weight is the substitute and it is a better field anyway, because it
is a fact about equipment.

**Do not use any body measurement at all.** No height, no reach, no anything from the fourteen-row
classic tape. The moment a customer profile carries a body measurement, the product has a
safeguarding problem and a harassment problem, and the venue has a policy problem. There is no version
of this that is fine.

**Do not manufacture beef.** The callout, the trash talk, the villain edit and the rivalry package are
the parts of combat sports that get the most engagement and they work because the participants
consented to a combat career. Two office teams from Brea did not. A cup that nudges customers to
antagonise each other creates incidents in the building, and the person who deals with those incidents
is the duty manager on a Tuesday night.

**Do not do the staredown.** The face off is structurally just "two opponents photographed side by
side", and that part is fine and should be kept. Nose-to-nose intimidation imagery is not. Even the
UFC's own audience pushed back when face-offs were over-produced, calling them "unnecessary and overly
produced" (https://sports.yahoo.com/articles/ufc-fans-slam-fight-week-133513059.html). If the UFC can
overdo it for UFC fans, a bowling alley can certainly overdo it for a church group.

**Do not put odds on anything.** UFC's tale of the tape carries betting odds. A family entertainment
centre publishing odds on its own customers' league matches is a licensing question, a gambling
question and a safeguarding question all at once. Not worth one row.

**Do not import the damage vocabulary.** "Absorbed", "punishment", "knockdown", "finished", "killed
it", "murderers' row", "destroyed". The register is wrong and it will read as borrowed. Bowling has
its own excellent violent-sounding vocabulary that is already family safe: strike, split, turkey,
pocket, anchor, sweeper, clean game. Use bowling's.

**Do not fake a history.** The most tempting thing in this entire brief is a career record on a bowler
profile. Every combat sports convention in section 2 assumes a record exists, and the moment one is
invented, the whole application's credibility about the hundred and two real organisations goes with
it. Bowling's own governing body handles this exact case by declaring the average **not yet
established** and re-rating later. Do that.

**Do not let the belt be the whole story.** Championship iconography is fine as a graphic. A cup whose
only reward is a trophy for the best team is a cup that fifteen of sixteen teams lose. Bowling's
handicap system exists precisely so a team of first-timers can beat a team of regulars, and that is
the thing to promote. The most-improved team, the cleanest game, the team that recruited the most new
bowlers: those are rewards a family entertainment centre can actually sell.

**Do not make the matchmaking subjective.** UFC's rankings are a media panel vote with "no transparent
scoring formula" (https://worldinsport.com/ufc-ranking-system-explained/). A bowling ladder does not
need to be. `domain/leagues.ts` already orders by countable readiness and names the basis on the page.
Keep that. It is the better product and it is the honest one.

**Do not build a bracket that is only a tree.** The contract already says this and the research
supports it. The UFC's card is curated, not sorted: "the final prelim is often placed there on
purpose." A bracket that shows sixteen names and no answer to "who is one conversation away from
bringing four more people into the building" has failed the test in `CONTRACT_cup.md`.

---

## 9. GAPS, STATED RATHER THAN GUESSED

- **First ball average, split conversion and clean game percentage benchmarks.** Definitions are solid;
  I found no citable number for what a good one looks like. The two forum threads that discuss it
  (bowlingboards.com threads 18183 and 19460) are blocked by robots.
- **Whether the last-five form strip conventionally reads oldest-first or newest-first.** Sources
  describe the strip without stating the order. Both exist. Pick one and label it.
- **The exact TUF matchup-control transition rule.** Confirmed that matchup selection is a prize and
  that coaches pick from the remaining pool; not confirmed whether control passes on a fight win or a
  challenge win.
- **BoxRec profile field list.** boxrec.com serves a login wall to fetchers; I could not read a live
  profile. The record notation and its components are well covered by the other sources.
- **ufcstats.com field list.** The site is behind a JavaScript browser check. The ufc.com athlete page
  gave a fuller list anyway and is cited in full in section 3.1.
- **A national USBC league average figure.** Not found in a citable form. Do not print one.
- **Whether broadcast tale of the tape measurements are systematically inflated.** BoxRec forum threads
  assert it; I could only read thread titles. Suggestive, not established.
- **Road to UFC bracket details** (https://fightomic.com/road-to-ufc-what-it-is/ returned 403) and two
  cupzone.org articles (robots disallowed). Their content is covered by other sources cited above.

---

## SOURCES

Every URL below was read on **14 August 2026** unless marked otherwise.

**Tale of the tape and records**
- https://dearsportsfan.com/2015/08/31/what-does-tale-of-the-tape-mean/
- https://brevheart.tripod.com/taleofthetape.htm
- https://en.wikipedia.org/wiki/Eddie_Hall_vs._Haf%C3%BE%C3%B3r_Bj%C3%B6rnsson
- https://martialartsinsider.com/blogs/mma/tale-of-the-tape-ufc
- https://medium.com/@AkaashSharma/a-detailed-look-at-mmas-flawed-tale-of-the-tape-c9b8949df461
- https://combat-edge.com/compare/dustin-poirier-212-vs-ilia-topuria-1165/
- https://www.athletepath.com/combat-fight-record-calculator/
- https://www.sherdog.com/news/articles/Sherdog-Fight-Finder-A-Guide-For-Regulators-Promoters-Managers-Coaches-and-Fighters-158515
- https://tactix.football/form/
- https://mixedmartialarts.com/news/ufc-to-add-leg-reach-to-tale-of-the-tape/ (search listing only)
- https://boxrec.com/forum/viewtopic.php?t=235670 (title only)

**Stat cards and visualisation**
- https://www.ufc.com/athlete/jon-jones
- https://www.cagequant.com/learn/ufc-fighter-stats-explained
- https://observablehq.com/blog/avoid-radar-charts
- https://blog.scottlogic.com/2011/09/23/a-critique-of-radar-charts.html

**Card structure and build up**
- https://maincardmedia.com/2026/04/26/how-a-ufc-event-works-main-card-prelims-early-prelims-explained/
- https://worldinsport.com/ufc-main-card-explained/
- https://worldinsport.com/ufc-ranking-system-explained/
- https://martialartsunleashed.com/ufc/how-does-the-ultimate-fighter-show-work/
- https://grokipedia.com/page/The_Ultimate_Fighter_1
- https://www.atlasobscura.com/articles/why-fighters-stare-at-each-other-so-intensely-at-the-prebout-weighin
- https://sports.yahoo.com/articles/ufc-fans-slam-fight-week-133513059.html

**Bowling, official**
- https://bowl.com/getattachment/d07894d8-e76e-43b8-b068-d04de4db27db/Definitions-08-01-2022.pdf
- https://images.bowl.com/bowl/media/legacy/internap/bowl/rules/pdfs/EnteringAverages.pdf
- https://bowl.com/getmedia/999a2a03-9fde-4382-b949-c9ab3729a5ea/060624_Rules-to-Consider-LOH-06-01-2024.pdf
- https://bowl.com/welcome/recent-rule-changes
- https://images.bowl.com/bowl/media/legacy/internap/bowl/rules/pdfs/League%20Standings%208%20Teams%20or%20Less.pdf
- https://en.wikipedia.org/wiki/Glossary_of_bowling

**Bowling, practice and product**
- https://gobowling.com/blog/guides-tips/bowling-handicap-system-guide/
- https://www.bowlersmart.com/2014/11/12/bowling-stats-for-success/
- https://bowlerstats.com/bowlerstats/
- https://www.ssec.wisc.edu/~beckys/bowl/0708/11standings.htm
- https://www.liveabout.com/baker-team-competition-format-420911
- https://help.leaguepals.com/support/solutions/articles/44002580793-supported-tournament-formats-guide
- https://efx.co/blogs/news/what-is-a-good-bowling-score-understanding-averages-skill-levels-and-age-comparisons

**Equipment**
- https://www.bowling.com/knowledge-hub/bowling-balls/simple-guide-to-understanding-bowling-ball-coverstocks
- https://www.bowling.com/knowledge-hub/bowling-accessories/should-my-bowling-ball-have-a-clean-or-a-dull-surface
- https://www.bowling.com/knowledge-hub/bowling-balls/simple-guide-to-understanding-bowling-ball-cores
- https://www.bowlingaddicts.com/dual-angle-layout-explained/
- https://www.bowlingball.com/BowlVersity/bowling-ball-specifications (balance hole section is out of date)
- https://www.bowlersmart.com/2020/03/19/2020-usbc-rule-changes-on-bowling-ball-weight-holes-by-mdm-coaching/
- https://www.flobowling.com/articles/6762074-starting-today-your-bowling-ball-may-be-illegal
