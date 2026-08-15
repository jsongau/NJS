# RESEARCH: tournament formats, advancement, brackets and build up

For the quarterly Cup in `CONTRACT_cup.md`. Sixteen teams, five bowlers, weekly, at a bowling
centre that has not opened.

Everything below was read on **14 August 2026**. Every non obvious claim carries the URL it came
from. Where sources disagree I say so. Where a number is my arithmetic rather than a cited figure I
label it **derived**.

House rules observed: no em dashes, no en dashes, no arrows, British-ish spelling.

**What this file is for.** A builder should be able to pick a format, generate a schedule, draw a
bracket, and know which parts of the hype layer are honest, without opening a single one of these
sources. The recommendation is at the bottom and it is argued, not asserted.

---

## 0. THE COMMERCIAL TEST THAT DECIDES EVERYTHING

Before any format is judged on fairness or drama, it gets judged on this: **how many of the eighty
bowlers are in the building on the last night.**

A bowling centre does not sell tournaments. It sells lane hours, and it sells them alongside food,
drink and arcade spend from the same eighty people. A format that eliminates half the field on night
one has removed forty paying customers from every subsequent night, and it has done so by design.

Two figures make the stakes concrete.

- League bowling used to generate **about 70 per cent** of a bowling centre's business and by the
  time this was written generated **about 40 per cent** and falling.
  [whitehutchinson.com](https://www.whitehutchinson.com/leisure/articles/whats-happening-to-bowling.shtml)
  (read 14 Aug 2026). The article is dated in its underlying data, which runs to 2007-08, so treat
  the direction as reliable and the exact percentage as historic.
- USBC membership: **4.1 million** in 1997-98, **2.6 million** by 2006-07 (same source), and
  **1,075,194** in 2024-25 with membership described as flat for 2025-26.
  [bowl.com 2026 State of the Association](https://bowl.com/a-future-for-the-sport/2026-state-of-the-association)
  (read 14 Aug 2026).

So the recurring product is shrinking and the sport's own governing body is now pushing turnkey
short formats at centres (it names "The Forty Frame Game" as a new tournament side event and a
"Youth Jersey League" programme, same source). A quarterly cup at a new venue is not competing with
a healthy league culture. It is the thing that has to create one.

**Consequence for the model:** the unit that matters is **lane nights**, which
`src/domain/leagues.ts` already defines as lanes multiplied by weeks (`laneNights: lanesPerNight *
league.seasonWeeks`). Every format below is costed in the same unit so the Cup can sit next to a
league season without a conversion.

Existing constants to stay consistent with: `FIELD_SIZE = 16`, `LANES_PER_MATCH = 2`, so a full
field is 8 matches and **16 lanes** on one night, against a published floor of 26 lanes. A 16 week
season is **256 lane nights**.

---

## 1. FORMATS FOR SIXTEEN TEAMS PLAYING WEEKLY

### 1.1 The comparison table

Matches, nights and lane nights are derived from the format definitions. "Dead after night one" is
the number of the 80 bowlers with no reason to return the following week.

| Format | Matches | Nights | Lane nights | Teams bowling on the last night | Dead after night 1 |
|---|---|---|---|---|---|
| Single elimination | 15 | 4 | 30 | 2 | 8 teams, 40 bowlers |
| Double elimination | 30, or 31 with a reset | 6 if winners and losers rounds share nights | 60 to 62 | 2 | 0 |
| Full round robin | 120 | 15 | 240 | 16 | 0 |
| Swiss, 4 rounds | 32 | 4 | 64 | 16 | 0 |
| Groups of four into knockout | 24 group + 7 knockout = 31 | 6 | 62 | 2 | 0 |
| Groups of four into cup and plate | 24 group + 14 bracket = 38 | 6 | 76 | 4 | 0 |
| Ladder or challenge | indefinite | indefinite | uneven | undefined | 0 |
| Stepladder final only | 4 | 1 | 8 | 5 | n/a, it is a finale not a tournament |

Working for the two that need it:

- **Single elimination.** 15 matches (N minus 1). Night one 8 matches on 16 lanes, night two 4 on 8,
  night three 2 on 4, the final 1 match on 2 lanes. Total lane occupancy 16 + 8 + 4 + 2 = **30 lane
  nights**. The final night uses **2 of 26 lanes**. That is the commercial disaster in one number.
- **Double elimination.** Maximum matches is **(2 x N) minus 1** and minimum is **(2 x N) minus 2**,
  so 31 or 30 for sixteen.
  [hostatourney.com](https://hostatourney.com/en/blog/double-elimination-bracket-guide) (read 14 Aug
  2026). Round structure for 16: winners bracket has 4 rounds, losers bracket has 6, plus the grand
  final and the optional reset, which is 11 or 12 round slots. Winners and losers rounds can share a
  night because they use different lanes, which is how six nights is reachable (**derived**).

### 1.2 What each format does to a team knocked out early

- **Single elimination.** Nothing. They go home. Half the field on night one. Every source that
  recommends it does so for time, not for experience.
- **Double elimination.** A first loss costs you the winners bracket, not the cup. You bowl again
  the following week in the losers bracket, and the losers bracket champion still reaches the grand
  final. The minimum any team bowls is **two matches**, guaranteed.
- **Swiss.** Nobody is eliminated at all. "A player who enters a Swiss-system tournament knows that
  they can play in all the rounds, regardless of results."
  [Wikipedia, Swiss-system tournament](https://en.wikipedia.org/wiki/Swiss-system_tournament) (read
  14 Aug 2026). Its stated cost is the opposite problem: "a Swiss-system tournament does not always
  end with the climax of a knockout final", and leaders can clinch before the last round, which
  creates dead rubbers.
- **Groups into knockout.** Every team gets **at least 3 matches** before anything is decided, and
  group stage gives you real seeding data for the bracket.
  [bracketsninja.com group stage](https://www.bracketsninja.com/types/group-stage-bracket) (read 14
  Aug 2026). Its stated costs are duration, dead rubbers in the last group round, and scheduling
  load.
- **Cup and plate.** The whole field splits into two knockouts after the group stage, so "everyone
  gets a real competition to play through" and there are "two trophies, two celebrations".
  [score7.io cup and consolation](https://kb.score7.io/blog/guides/cup-and-consolation-brackets/)
  (read 14 Aug 2026). This is the closest thing to a purpose built answer to the commercial test.
- **Ladder.** Wrong shape for a weekly cup. Challenges are player initiated, "not all players may
  play the same number of matches", it "can go on indefinitely", and it does not reliably produce a
  champion. [Wikipedia, ladder tournament](https://en.wikipedia.org/wiki/Ladder_tournament) (read 14
  Aug 2026). It is a good model for something else in this product, an ongoing house ranking between
  cups, and a bad model for the cup itself.

### 1.3 WHAT BOWLING ACTUALLY DOES

This is the section that changes the answer, because bowling has already solved the "half the field
goes home" problem and it solved it differently from every bracket product on the internet.

#### 1.3.1 A bowling bracket is side action riding on top of games you were bowling anyway

This is the single most important finding in this file.

A bowling "bracket" is a small elimination pool, commonly **8 bowlers over 3 games**, entered for a
fee, and it is described as "the only form of legal gambling sanctioned by the United States Bowling
Congress". Bowlers can enter multiple brackets at once. Crucially it "function[s] as a parallel
wagering system within existing league or tournament nights".
[bowlingball.com, what are bowling brackets](https://www.bowlingball.com/BowlVersity/what-are-bowling-brackets)
(read 14 Aug 2026).

Read that again in commercial terms. **Losing your bracket does not stop you bowling.** You were
already bowling three games. The bracket decided what those three games were worth, not whether you
turned up. Elimination costs you a prize, not a night out.

USBC and the specialist software both treat this as normal furniture: CDE Software sells a product
whose entire job is "handling all your side action needs in bowling leagues and tournaments", in a
professional edition and an autoscoring edition that integrates with the centre's scoring system.
[shop.cdesoftware.com](https://shop.cdesoftware.com/bracket-and-sidepots) (read 14 Aug 2026). The
page is marketing level and does not publish bracket sizes or handicap methods, so do not cite it
for detail.

**Design consequence:** the Cup bracket should be a layer over a fixed weekly bowling commitment,
not a gate on it. Every team bowls every cup night. The bracket decides what tonight's pins count
towards.

#### 1.3.2 The stepladder final, which is what bowling uses instead of a semi final

The PBA's televised finish is a stepladder: the **top five** advance, the fifth seed bowls the
fourth, the winner bowls the third, then the second, then the top seed for the title.
[plaay.com](https://plaay.com/blog/pro-bowling-tournament-and-playoff-processes-explained) (read 14
Aug 2026).

Properties worth stealing:

- The top seed bowls **one** match all night and it is the last one. Seeding is a real, visible,
  earned prize rather than a bracket position.
- It is 4 matches on **one pair of lanes**, so it is a spectator event. Everyone else watches.
- It escalates. Each match is bigger than the last, which is the natural shape of an evening.
- It is not fixed at five. The PBA has run variants: the 2026 AMF PBA World Championship advanced
  **nine** players to a stepladder
  ([pba.com](https://www.pba.com/2026/may/nine-players-advance-stepladder-finals-amf-pba-world-championship),
  read 14 Aug 2026) and the 2025 U.S. Open ran an "extended" stepladder
  ([pba.com](https://www.pba.com/2025/february/extended-stepladder-finals-set-us-open), read 14 Aug
  2026).

The same source describes the qualifying that feeds it: typically 18 games in three blocks of six,
top 24 to match play, then each of the 24 bowls a single game against each of the other 23 with **30
bonus pins for a win, 15 each for a tie**, added to total pinfall. Note the mechanic: match play in
bowling is usually **pinfall plus a win bonus**, not win or lose.

A working amateur example uses the same shape at centre scale: a handicap 6 game sweeper that cuts
"to the top 10. Places 1-4 will have automatic place in stepladder. Places 5-10 will bowl a one game
roll off for 5th seed."
[tournamentbowl.com](https://www.tournamentbowl.com/Open/TournamentHome.cfm?id_tournament=9328)
(read 14 Aug 2026).

#### 1.3.3 The Baker format, which is why a whole cup night fits in a league slot

In a five person Baker game the team bowls **one ten frame game between them**: "the first bowler
bowls frames 1 and 6, the second bowler bowls frames 2 and 7 and so forth, with the fifth bowler
bowling frames 5 and 10."
[liveabout.com, Baker format](https://www.liveabout.com/baker-team-competition-format-420911) (read
14 Aug 2026). It is used in high school, college, USA Bowling and PBA team events.

The arithmetic that matters (**derived**):

- A standard 3 game night for a five person team is **150 frames per team**, 300 frames on a pair
  for two teams.
- A Baker game is **10 frames per team**, 20 frames on a pair.
- A **best of five Baker match** is at most 50 frames per team, 100 on a pair. A **best of seven** is
  at most 70 per team, 140 on a pair.
- So a best of seven Baker match is roughly **half** the frames of a standard three game league
  night, and a best of five is roughly a third.

Cross check on wall clock: one bowler needs "roughly 10 to 15 minutes to complete a full ten-frame
game" and a four person group runs "40 to 60 minute[s]".
[gametimehero.com](https://www.gametimehero.com/blog/how-long-does-one-game-of-bowling-take) (read
14 Aug 2026). No source found gives a published Baker match duration; the NFHS bowling workshop
document covers Baker format and explicitly gives no timings
([NFHS](https://assets.nfhs.org/umbraco/media/865785/WKSP%2033%20-%20Requested%20Bowling%20Topics.pdf),
read 14 Aug 2026). **Treat the frame count as the reliable figure and the minutes as an estimate.**

**Design consequence:** a Baker best of five, or best of seven, match fits comfortably inside the
same evening slot a league night already uses. The Cup can occupy the same 6.45pm and 7.00pm slots
`data/leagues.ts` already establishes, on a different night or between league seasons.

#### 1.3.4 NCAA bowling: sixteen teams, double elimination, Baker. This already exists.

The NCAA bowling championship is **a sixteen team double elimination tournament**, with eight
automatic bids and eight at large.
[Wikipedia, 2022 NCAA Bowling Championship](https://en.wikipedia.org/wiki/2022_NCAA_Bowling_Championship)
(read 14 Aug 2026).

A match is a best of three "Mega Match": one traditional five person game for total pinfall, then
five Baker games for total pinfall, and if the teams split those two, a **best of seven Baker
series** decides it. The championship final is best of seven Baker only.
[goshockers.com championship preview](https://goshockers.com/news/2026/4/9/womens-bowling-bowling-preview-ncaa-championship.aspx)
(read 14 Aug 2026).

Note the seeding oddity: in the 2022 event only the **top four teams were seeded**, one to each
region, and the remaining twelve were unseeded (Wikipedia, above). And note the schedule proof that
double elimination fills a day: "the Shockers will bowl twice on Friday regardless of the first
match's outcome" (goshockers, above).

**This is the closest real world precedent to the Cup and it validates double elimination at exactly
sixteen teams with exactly this sport.** The difference is that NCAA compresses it into a weekend
with travelling teams, and the Cup has to stretch it over weeks with local teams who can simply not
come back.

#### 1.3.5 The eliminator, the sweeper, and the other centre level formats

- **Sweeper.** "A one-day competition that consists of a few games, with each entrant paying a fee to
  participate, which goes into the prize fund", games and rules vary widely.
  [liveabout.com, sweeper](https://www.liveabout.com/sweeper-420594) (read 14 Aug 2026). Described
  elsewhere as "a shorter, often same-day tournament, a fast, fun format frequently run alongside
  bigger events".
  [bowlrevolution.com](https://bowlrevolution.com/events/tournament-types/) (read 14 Aug 2026).
  Neither source states the centre's commercial rationale, which is a gap.
- **Eliminator.** Drops the lowest scorers each round until one remains (bowlrevolution, above). A
  worked example: 3 qualifying games at **85 per cent of 220** handicap, "1 in 5 bowlers cash" into
  bracket play, opening round with 4 bowlers on a pair then 2 on a pair thereafter, and in bracket
  play only "the max score including handicap shall not exceed 300", with a "9th and 10th frame
  roll-off" tiebreak capped at 60 pins.
  [tbebowling.com rules](https://www.tbebowling.com/rules) (read 14 Aug 2026).
- **Position round.** Bowling's own re-seeding device. In "the final week before roll-offs", first
  place bowls second, third bowls fourth, and so on down the standings, giving lower teams a last
  chance to "knock someone out and jump in themselves".
  [liveabout.com, position round](https://www.liveabout.com/position-round-in-bowling-420579) (read
  14 Aug 2026). `domain/leagues.ts` already models `positionNights`, so the vocabulary is in the
  codebase.
- **Split season.** USBC sanctions dividing a season into segments: "The league may choose to bowl
  halves, thirds, quarters or define a number of weeks in a segment", each segment declares a winner
  and "the standings start over", and "at the end of the season all segment winners compete in a
  playoff". A first place tie at the end of a segment **must** be broken by a roll off of no fewer
  than one frame, and "total pins cannot break a tie".
  [USBC Split Season Leagues PDF](https://images.bowl.com/bowl/media/legacy/internap/bowl/rules/pdfs/SplitSeasonLeagues.pdf)
  (read 14 Aug 2026). **This is the sanctioned precedent for "one special cup per quarter".** A
  quarterly cup is a split season segment with a trophy.
- **The top 16 cut is a real high school pattern.** Individual match play games decide which teams
  qualify: "the top 16 teams with the most pins or points make the cut to the Baker elimination
  round" (NFHS, above).

#### 1.3.6 Handicap, so a mixed ability field can actually compete

Formula: **(basis score minus bowler's average) x percentage factor = handicap**. Basis is typically
200, 210 or 220. Factor is typically 80, 90 or 100 per cent. Worked example given: average 150,
basis 200, factor 90 per cent gives 45 pins, so a 160 game scores 205.
[gobowling.com handicap guide](https://gobowling.com/blog/guides-tips/bowling-handicap-system-guide/)
(read 14 Aug 2026).

The same source characterises the three common settings: **100 per cent of 200** for maximum
inclusivity in beginner and youth leagues, **90 per cent of 210** as the balanced adult default,
**80 per cent of 220** as the more competitive setting that rewards higher averages. The eliminator
above uses 85 per cent of 220, so real events sit between the named triples.

Team play: individual handicaps are added to individual scores and team totals are the sum of
adjusted scores (same source).

USBC publishes the machinery but not the numbers on the page: tournament manager's manual, sample
adult handicap and scratch rules, one game and three game handicap charts, a sport and challenge
average conversion chart, and re-rate forms and sample re-rate letters.
[bowl.com tournament resources](https://bowl.com/rules/tournament-resources) (read 14 Aug 2026). The
percentages live in the downloadable PDFs, not in the HTML.

**Design consequence and a hard constraint for this codebase.** Handicap requires an **average**, and
an average requires games bowled. The building has not opened. `domain/leagues.ts` deliberately has
no field that can hold a score. So a real handicap cannot exist yet, and the Cup must model handicap
as a **declared rule** (basis, factor, and how a first season bowler is rated) rather than as a
computed number, exactly as `handicapNote` already does on `League`.

#### 1.3.7 Peterson points: bowling's own answer to "why come back if you cannot win"

Peterson points award points for wins **and** points for raw pinfall, commonly one point per 50 or
per 100 pins, or 0.02 points per pin. The decisive property: "pinfall points are awarded win, lose
or draw". The stated reason is equity, because without them "the gap between the haves and have-nots
would resemble a canyon within a few weeks".
[totalbowling.com.au forum](https://www.totalbowling.com.au/community/threads/peterson-points-system.8619/)
(read 14 Aug 2026). This is a forum thread, so treat it as documentation of common practice rather
than a governing rule, and the same thread notes many variations exist.

The PBA does the same thing at professional level with its 30 bonus pins for a match play win added
to total pinfall (plaay.com, above).

**Design consequence:** a team that loses tonight should still have banked something visible. Total
pinfall is the natural currency, it is genuinely earned, and it gives the losers bracket and the
plate a real ladder rather than a wooden spoon.

---

## 2. SEEDING, ADVANCEMENT AND SCHEDULING

### 2.1 Seeding a sixteen team bracket

Standard first round pairings, in bracket order:

- Top quarter: **1 v 16**, **8 v 9**
- Second quarter: **4 v 13**, **5 v 12**
- Third quarter: **2 v 15**, **7 v 10**
- Bottom quarter: **3 v 14**, **6 v 11**

The rule underneath: "First-round matchups always add up to **N + 1**", so every pair sums to 17 for
a sixteen team field. If your generated pairs do not sum to 17, the seeding is wrong.
[scorekeeper.co](https://www.scorekeeper.co/blog/how-to-seed-teams-in-a-tournament) (read 14 Aug
2026).

Same source on the other two questions:

- **Re-seeding between rounds** "is rare in bracket play" and is more common on the transition from
  pool play to bracket. If you do it, announce it beforehand.
- **Blind draw** is legitimate, "as long as teams know the rules". The seeded bracket's advantage is
  that stronger teams meet later, which is what produces a compelling final.

Note the disagreement with practice: NCAA bowling seeded only its top four in 2022 and left twelve
unseeded (section 1.3.4). So "seed everyone" is a convention, not a law, and a partial seeding is
defensible when you have thin data. **For a first cup at a venue with no bowled games, this matters:
seeding will have to come from something other than results.**

### 2.2 Byes

Formula: **byes = next power of two minus actual entrant count**. Five teams needs 3 byes, six needs
2. [score7.io, what is a bye](https://kb.score7.io/blog/guides/what-is-a-bye-in-a-tournament/) (read
14 Aug 2026). Twelve teams needs 4, fourteen needs 2.
[printyourbrackets.com](https://www.printyourbrackets.com/how-byes-work-in-a-tournament.html) (read
14 Aug 2026).

Rules on placement:

- Byes go to the **top seeds**, described as "the standard approach across virtually all sports"
  (score7.io, above).
- Byes are "always awarded in just the first round" and their positions follow the seeding, not the
  organiser's preference (printyourbrackets, above). Neither source publishes the exact slot by slot
  bye placement algorithm; printyourbrackets openly says they ship pre-designed layouts instead.
  **That is a genuine gap in the public sources.** The safe implementation is: build the full
  bracket at the next power of two, place seeds by the sum rule, then mark the phantom entrants as
  byes; the top seeds get them automatically.

**Sixteen is a power of two, so the Cup needs no byes at all.** This is a real argument for holding
the field at sixteen, and it is the same argument `domain/leagues.ts` already makes for a fifteen
week round robin. If a cup runs short, the honest options are a play in night or a smaller bracket,
not a hand placed bye.

Toornament's data model treats a bye as a **match type**, alongside `duel` and `ffa`, rather than as
an absence of a match.
[Toornament viewer matches API](https://developer.toornament.com/v2/doc/viewer_matches) (read 14 Aug
2026). Copy that. A bye is a node in the tree, it just resolves without pins.

### 2.3 The loser bracket, and the one rule that is easy to get wrong

When a team drops from the winners bracket it must be **cross-seeded**: "If you simply drop a loser
straight down on the same side of the bracket, they will immediately rematch the exact same team
that just defeated them." The fix "swaps the dropping teams to opposite sides of the losers'
bracket". [hostatourney.com](https://hostatourney.com/en/blog/double-elimination-bracket-guide)
(read 14 Aug 2026).

For a weekly cup this is not a nicety. An immediate rematch on the following Tuesday is the least
interesting possible fixture and it will be the first thing a captain notices.

Loser bracket shape for sixteen (**derived** from the standard structure, and consistent with the
30 match total):

| Round | Matches | Who is in it |
|---|---|---|
| Winners R1 | 8 | all 16 |
| Losers R1 | 4 | the 8 R1 losers |
| Winners R2 | 4 | the 8 R1 winners |
| Losers R2 | 4 | 4 losers bracket survivors v 4 winners bracket droppers, cross seeded |
| Losers R3 | 2 | the 4 survivors |
| Winners R3 | 2 | the 4 winners bracket survivors |
| Losers R4 | 2 | 2 survivors v 2 droppers, cross seeded |
| Losers R5 | 1 | the 2 survivors |
| Winners final | 1 | the 2 unbeaten teams |
| Losers final | 1 | losers bracket survivor v the winners final loser |
| Grand final | 1, plus 1 if reset | the two bracket champions |

Total: 30 matches, 31 with the reset.

### 2.4 Bracket reset

If the losers bracket champion beats the winners bracket champion in the grand final, that is the
winners champion's **first** loss, so a second decider is played. This is the "bracket reset", also
called the "if necessary" match (hostatourney, above).

Two things a builder must handle:

1. The grand final is **one match node that can spawn a second**. The tree is not fixed at the start.
2. The advantage is real and must be shown, because a team that has not lost is not in the same
   position as a team that has. Label it in the UI. "One loss and out" against "must be beaten
   twice" is the whole story of the night and it is invisible if you only draw lines.

Toornament models this with a `branch` field taking `wb`, `lb` and `gf`, plus `depth` for the round
and `source_node_id` with a `source_type` of `winner` or `loser` for the edges.
[Toornament bracket nodes API](https://developer.toornament.com/v2/doc/viewer_bracket_nodes) (read
14 Aug 2026). That is a clean, small model and it is worth copying almost verbatim: **branch, depth,
number, and a source node with a winner or loser edge** describes any bracket in this file.

### 2.5 Generating a round robin or a Swiss schedule

**Round robin, circle method.** Fix one team. Arrange the rest in a circle. Each round pairs the
fixed team with one rotating team and pairs the others off from opposite halves. Rotate one position
and repeat. Even field gives **N minus 1 rounds**; odd field adds a phantom "bye" team so one side
sits out each round.
[medium.com rotation algorithm](https://medium.com/coinmonks/sports-scheduling-simplified-the-power-of-the-rotation-algorithm-in-round-robin-tournament-eedfbd3fee8e)
(read 14 Aug 2026).

Sixteen teams gives **15 rounds**, which is exactly the `roundRobinWeeks` already derived in
`seasonShape()`. The league and the cup can therefore share one scheduler.

**Swiss.** Sort by cumulative score, pair within score groups, top of a group against bottom of that
group, and never repeat a pairing. Minimum rounds is **ceiling of log2(N)**, so "three rounds can
handle up to eight players, four rounds can handle up to sixteen". Maximum useful rounds is about
half the field. Tiebreaks are Buchholz (sum of opponents' scores) or Sonneborn-Berger. The pairing
rules "are quite complicated" and organisers normally use software.
[Wikipedia, Swiss-system tournament](https://en.wikipedia.org/wiki/Swiss-system_tournament) (read 14
Aug 2026).

**Group stage seeding.** Snake seeding for four groups of four: Group A takes seeds 1, 8, 9, 16;
Group B takes 2, 7, 10, 15; Group C takes 3, 6, 11, 14; Group D takes 4, 5, 12, 13. This "ensures
each group contains one top seed, one middle-upper seed, one middle-lower seed, and one bottom
seed". Each group of four plays 6 matches. Group winners are cross drawn against runners up from
another group to prevent immediate rematches. Tiebreak order in common use: head to head, then goal
difference (pinfall difference here), then goals scored (total pinfall), then discipline, then lots.
[bracketsninja.com](https://www.bracketsninja.com/types/group-stage-bracket) (read 14 Aug 2026).

Note that USBC forbids the equivalent of the third tiebreak in league play: "Total pins cannot break
a tie at the conclusion of the season, or at the end of any segment", a roll off is required (USBC
Split Season PDF, above). **The sources disagree**, because they come from different sports. If the
Cup wants to feel like bowling, use a roll off of one or two frames, not total pinfall.

### 2.6 Lanes and hours a schedule consumes

The existing model is right and should not be re-derived: a match is bowled across a **pair** of
lanes with teams alternating, so 8 matches is **16 lanes**, not 8. The comment in
`domain/leagues.ts` about getting this wrong by a factor of two is correct and load bearing.

Per night, for a full sixteen team field:

- 8 matches
- 16 lanes of a published 26
- 80 bowlers
- One evening slot, which the two existing leagues place at 6.45pm and 7.00pm

Frames per pair, for costing an evening (**derived**, per section 1.3.3): 3 game five person team
night is 300 frames on a pair; Baker best of seven is at most 140; Baker best of five is at most
100; one traditional team game plus five Baker games, the NCAA "Mega Match" first two legs, is 100
plus 100 equals 200 frames on a pair.

---

## 3. THE ULTIMATE FIGHTER, SPECIFICALLY

The owner named this, so it gets read properly rather than gestured at.

### 3.1 How the show is actually organised

Source for this section unless stated:
[Wikipedia, The Ultimate Fighter](https://en.wikipedia.org/wiki/The_Ultimate_Fighter) (read 14 Aug
2026), with supporting detail from
[martialartsunleashed.com](https://martialartsunleashed.com/ufc/how-does-the-ultimate-fighter-show-work/)
(read 14 Aug 2026).

- **Seasons 1 to 3.** Sixteen fighters, split into two teams, each coached by a UFC headliner. Teams
  competed in challenges as well as fights, and losing fighters were removed from the house.
- **Season 4 onward.** Losing fighters were **no longer removed from the house** and stayed as team
  members. This is the show discovering the same problem this file opened with, and fixing it the
  same way.
- **Season 7 onward.** Field expanded to 32 with a preliminary round deciding who got into the house
  at all, prompted by Dana White saying he was tired of fighters coming on the show for airtime.
- **Seasons 11 to 13.** 28 fighters in the preliminary round, 14 into the house, and after the round
  of 14 a **wildcard bout** between two losing fighters put one of them into the quarter finals.
- **Structure.** Preliminary round, quarter finals, semi finals, then a **single elimination final at
  a live Ultimate Fighter Finale event**, with a UFC contract as the prize.
- **The pick.** The winning team "gain[ed] the right for their team to select the next matchup, in
  order to pick off fighters from the opposing team by selecting favourable matchups".
- **The coaches' fight.** Nearly every season ended with the two coaches fighting each other after
  filming, which is the promotional payload of the whole exercise.
- **Cadence.** One fight per episode, one episode per week, so the season is a slow reveal of a
  bracket rather than a bracket published up front.

The martialartsunleashed piece describes the general shape (16 fighters, two teams, usually red and
blue, coaches as mentors) but explicitly does not document draft order, who controls the first pick,
or how control passes. **That detail did not turn up in a citable source.** Treat "winner picks
next" as the documented mechanic and the finer draft rules as unverified.

### 3.2 What transfers to a bowling cup

**Transfers well:**

1. **Two teams, two coaches, one bracket.** Split the sixteen into two halves of eight with a named
   captain figurehead over each. The final is then automatically Side A champion against Side B
   champion, which is a story the moment the draw is made rather than in week six. This is free: it
   is a naming layer over a standard bracket.
2. **Control of the matchup as the prize for winning.** This is the actual innovation of the show and
   it is what makes a win worth more than a line on a bracket. See 3.3 for the safe version.
3. **The wildcard.** One team that lost gets a route back in. It is a named, scheduled, promotable
   fixture, it is honest, and it exists precisely to keep beaten people in the building.
4. **The reveal cadence.** The bracket does not have to be fully drawn on day one. One fixture
   announced per week, with build up, is more promotable than a static tree, and it matches how a
   weekly league night already runs.
5. **The finale as a separate event.** The show's final is not another episode, it is a live event at
   a different venue with the coaches' fight on it. For a bowling centre that is **finals night**:
   the stepladder on a single pair with everyone watching, and the two captains bowling a singles
   match as the undercard.

**Does not transfer:**

1. **The house.** Isolation and manufactured conflict. Not applicable and not desirable.
2. **A rival choosing your opponent.** On the show the fighters are competing for a contract and have
   no say. In a cup, a team has **paid a registration fee**, and letting a rival captain pick who
   they bowl is a customer service problem waiting to happen. See the softened version below.
3. **Elimination as removal.** The show learned by season 4 that this was wrong. Do not import the
   thing they fixed.
4. **32 entrants with a preliminary cull.** The field is sixteen and sixteen is a power of two.

### 3.3 The safe version of "the winner picks"

Give the winning team a **choice that costs the loser nothing they paid for**:

- Choose the lane pair for the next round.
- Choose to bowl first or second in the Baker rotation.
- Choose which of **two** already determined opponents it takes, where both are entitled to a match
  either way.
- Choose the finals night bowling order.

All four are real advantages, all are visible, none of them lets a rival decide whether a paying
customer bowls. The last one is closest to the show's mechanic and is the one worth building.

---

## 4. BRACKET AND TOURNAMENT UI, STUDIED PROPERLY

### 4.1 The headline finding: the phone bracket is not a solved problem

Two pieces of evidence, both of them uncomfortable for anyone about to build one.

**Challonge's answer is to shrink it.** Its embed module offers a `multiplier` from 0.3 to 3.0 which
"scales the entire bracket", a separate match width multiplier from 0.5 to 2.0 for name spacing, and
a `scale_to_fit` option that "scales the bracket to fit its container's width" and "automatically
adjusts for window resizes". The documentation describes no dedicated mobile treatment.
[Challonge module instructions](https://challonge.com/module/instructions) (read 14 Aug 2026).

Scaling a 31 node double elimination tree to a 380px viewport is not responsive design. It is
producing four pixel type and calling it a feature.

**start.gg's community mobile app ships without a bracket view.** Pocket Bracket lists tournament
search, filtering, history and profiles. A reviewer states plainly: "I don't see any way to actually
view a bracket", and another calls the official site "laggy". The app also bounces users into an
embedded web view where they must log in again.
[Google Play, Pocket Bracket](https://play.google.com/store/apps/details?id=com.ichen.pocketbracket&hl=en_US)
(read 14 Aug 2026).

A mobile client for the largest bracket platform in esports, whose core object is a bracket, does not
render brackets. That is not laziness. That is how hard it is.

**Actionable:** at 380px the primary Cup view must not be a scaled tree. Build the list first and
the tree second. See 4.7.

### 4.2 The mobile pattern that does work: focused column

The only concrete, implementable mobile bracket technique found:

- Scale cell heights by proximity to the focused round. "Multiply that height by 2 for each column to
  the right" and "divide the cell height by 2 for each column to the left", implemented as
  `100 * pow(2, heightScalingExponent)`.
- Connector direction follows parity: "even number cells will have the right line pointing down"
  while "odd number cells will have the right line pointing up".
- Snap horizontally between rounds rather than free scroll, triggering the transition once the user
  has dragged "half of the column width".
- The author's conclusion is that this beats the alternative of "a WebView and endlessly scrolling on
  all axes".

[arsfutura.com, tournament brackets in SwiftUI](https://arsfutura.com/blog/tournament-brackets-in-swiftui)
(read 14 Aug 2026).

Adapt for web: one round in focus at full type size, neighbouring rounds compressed to a rail of
score chips, CSS scroll snap on the round columns, and the round name in a sticky header so the user
always knows which round they are looking at.

**Reduced motion:** the snap and the compression must both degrade to instant under
`prefers-reduced-motion`, per the contract.

### 4.3 The single best interaction found: path highlight

An interaction designer compared Yahoo, ESPN, CBS Sports and Fox Sports bracket products and named
the standout as **SeatGeek's ticket buying bracket**, where hovering a team name highlights that
team's whole tournament path, "maintaining engagement throughout the tournament rather than just
selection".
[Fast Company](https://www.fastcompany.com/3058375/the-best-march-madness-bracket-according-to-a-ux-designer)
(read 14 Aug 2026).

This is the "path to the final" the brief asks for and it is cheap: it is a derived list of node ids
plus a class. On touch there is no hover, so make it **tap a team to pin its path**, tap again to
release, and give it a keyboard equivalent (focus a team, path highlights, Escape clears). Announce
the pinned team through the existing `aria-live` region.

### 4.4 What failed in the same comparison, and why

From the same Fast Company piece:

- **Yahoo.** A dark basketball court background plus **five different text colours**. "The key is
  lost, which makes identifying each team's status difficult." Losing teams crossed out with winners
  in red above them read as redundant and messy.
- **Fox Sports.** No hierarchy at all. Point totals identical in weight and size, so users could not
  find their own score, and "National Champion" got no visual emphasis despite being the point of
  the whole graphic.
- **CBS Sports.** Worked, because it distinguished **the user's pick** from **the actual result**
  using "puzzle-like boxes" around user choices.
- **ESPN.** Worked, because of the stat summary at the top and a "Bracketcast" feature that lists
  every game with win and loss indicators. Note that ESPN's most useful feature is **a list, not a
  tree**.

The Yahoo failure is the exact failure mode the Cup contract already legislates against: colour
carrying status on its own. Five colours with a lost key is unreadable for anyone, and unusable for
a colourblind reader. Glyph plus word plus colour, always.

### 4.5 Match state vocabulary, and why three states is not enough

Toornament's viewer API exposes exactly three status values: **`pending`** (not started),
**`running`** (in progress), **`completed`** (finished). Match `type` is `duel`, `ffa` or `bye`. Each
opponent carries `participant`, `number` (seeding based), `score`, `result` as `win`/`draw`/`loss`,
`rank`, `position` and a `forfeit` boolean. Temporal fields are `scheduled_datetime` in RFC 3339 and
`played_at`. [Toornament viewer matches API](https://developer.toornament.com/v2/doc/viewer_matches)
(read 14 Aug 2026).

Three states is right for an esports event run in a single afternoon. It is wrong for a cup where
matches are scheduled a week or more apart. A weekly cup match is one of:

| State | What it means | Why it is distinct |
|---|---|---|
| Awaiting opponent | Node exists, one or both sides unknown | This is most of the bracket for most of the cup, and it is the thing a "path to the final" view is made of |
| Scheduled | Both teams known, date and lane pair fixed | This is the promotable object. It carries the countdown |
| Live | Being bowled now | Needs `aria-live`, needs a glyph, must not be colour only |
| Final | Result recorded | Carries the score and the advancement |
| Bye | Resolves without pins | Toornament is right to model it as a match type, not an absence |
| Forfeit or withdrawn | Team did not appear | A real thing in a league and it must not look like a loss |

Six states, each with a `StatusToken` carrying glyph, label, cssVar and note, exactly as
`SLOT_STATE` and `LEAGUE_OPENNESS` already do in `domain/leagues.ts`. That existing pattern is the
right home for this and it already satisfies the colourblindness constraint.

Challonge exposes a `show_live_status` parameter that "displays a live badge by default" (Challonge
module instructions, above), which confirms the live badge is table stakes and tells you nothing
about how to make it accessible.

### 4.6 Long team names

The team behind the MediaWiki bracket system lists three persistent hard problems, and the first is:
"**Line height variability**: Teams with long names must wrap completely rather than truncate." The
other two are format flexibility across single and double elimination and various seedings, and
letting non technical editors define new layouts.
[river.me, tournament brackets](https://river.me/blog/tournament-brackets/) (read 14 Aug 2026).

Their rendering technique is worth copying wholesale:

- **CSS Grid with alternating columns**: content columns holding matches, empty columns holding
  connectors, with `grid-auto-flow: column` so the grid builds downward through columns rather than
  across rows.
- **Connectors drawn with pseudo-elements**: each connector's `::before` and `::after` split 50/50
  horizontally to give five border areas, and classes like `z-down` and `l-up` activate the borders
  needed for Z, L and T shapes. No extra DOM.
- The stated reason: it avoids "HTML bloat" and prevents "columns getting out of sync".

Their reason for rejecting tables is worth quoting because it is the root of the whole problem:
"HTML tables are constructed row-by-row, while the connecting lines serve an entire purpose to
connect cells vertically across columns."

**Actionable:** the team names in `data/leagues.ts` are long by design ("The Pinfall Protocol", "Last
Frame Standing") because real league teams name themselves badly on purpose. So do not ellipsis
them. Allow a two line wrap in the bracket cell, size the cell to the two line case so the grid does
not jump, and keep the full name in the accessible name. If a name is genuinely too long for two
lines at 380px, the fallback is a **short name field on the team**, chosen by the captain, not an
automatic truncation.

### 4.7 Accessibility, which is where the pretty tree loses

A practitioner walkthrough of building an accessible bracket in HTML and CSS reaches a
straightforwardly negative conclusion.

- With a **list** structure, "the user has to go through the entire list in the first round before
  they can move on to the next round". A screen reader user cannot follow one team's progression
  without hearing every intervening match.
- With a **table** structure, rounds as columns, arrow key navigation between rounds improves, but
  `rowspan` breaks it: "users can only navigate the first row of merged cells". And merged rows are
  exactly how a bracket represents two matches feeding one.
- Link elements inside cells are not reliably announced in full.
- The author's own conclusion is that HTML and CSS alone may not be enough and JavaScript enhanced
  navigation may be required.

[dev.to, can tournament brackets be accessible](https://dev.to/yuridevat/can-tournament-brackets-be-accessible-34og)
(read 14 Aug 2026).

**Actionable, and this is the second finding that should change the build:** do not try to make the
tree accessible. Ship a **Fixtures list** as a first class, equally prominent view, not a
"accessible alternative" hidden behind a link. Rounds as headed sections, one row per match, seed,
name, score, state, and a link to the matchup card. It is better on a phone, better with a screen
reader, better for a rep scanning for what to promote, and ESPN's own most praised feature
("Bracketcast", section 4.4) is exactly this. The tree is then a **visualisation of the same data**
that some people prefer, which is the correct status for it.

### 4.8 What a bracket that only shows who won gets wrong

A data visualisation critique of bracket design argues traditional brackets present information "in
binary format, simply showing who won or lost", without matchup context, performance, or the story
of how a team advanced, and that this "leaves much to be desired when researching teams, predicting
outcomes, and analyzing results".

It surveys three alternatives: statistics embedded in the bracket (a radial design whose author
conceded it was "weak in its principal functionality: to display team advancement"), win
probabilities added for the prediction phase, and game by game performance detail for the evaluation
phase.
[Nightingale, bracket carousel](https://nightingaledvs.com/bracket-carousel-discovering-the-next-generation-of-bracket-design/)
(read 14 Aug 2026).

Note the honest failure in the middle of that: the radial bracket looked impressive and stopped
communicating advancement. **That is precisely the trap the Cup contract names.** The article also
makes no mention of screen size or mobile at all, which is telling about the genre.

**Actionable:** every bracket cell carries **seed, name, score**. The seed is the cheapest of the
three and it is the one that creates the story, because it is what makes an upset legible.

### 4.9 How a bowling tournament site actually presents an event

For contrast with the esports platforms, a working bowling tournament page uses plain labels and a
nav of **Home, Squads, Roster, Standings**, with the event described in text: entry fee, optional
scratch entry, "6 games of qualifying across 12 lanes" with lane rotation rules, and the cut
structure written out as prose. Results live under "Standings".
[tournamentbowl.com](https://www.tournamentbowl.com/Open/TournamentHome.cfm?id_tournament=9328)
(read 14 Aug 2026).

There is no bracket graphic anywhere on it. The sport's own tooling communicates a tournament as
**squads, rosters and standings**, and it works. That is a strong vote for the list first approach in
4.7, and it means the vocabulary a bowler already expects is closer to `data/leagues.ts` than to
Challonge.

Battlefy's generator supports "single elimination, double elimination, round robin, or swiss"
([medium.com/battlefy](https://medium.com/battlefy/bracket-generator-565280a8ebf7), read 14 Aug
2026), which is the standard set and confirms nothing exotic is expected.

### 4.10 UI findings summary, in build order

1. Fixtures list is the primary view. Tree is secondary. (4.7, 4.9)
2. At 380px, tree renders one round in focus with neighbours compressed and scroll snap. Never a
   scaled whole tree. (4.1, 4.2)
3. Six match states, each glyph plus word plus colour. (4.5)
4. Team names wrap to two lines, never ellipsis. Optional captain chosen short name as the escape
   hatch. (4.6)
5. Tap or focus a team to pin its path through the bracket. (4.3)
6. Every cell carries seed, name, score. (4.8)
7. CSS Grid, alternating content and connector columns, connectors as pseudo-element borders. (4.6)
8. Never five colours and a legend. (4.4)

---

## 5. ANTICIPATION AND BUILD UP

### 5.1 The test for whether urgency is honest

Genuine urgency exists where the constraint is real, such as a finite number of seats. Deceptive
urgency is where the constraint is manufactured. The two named patterns are the **fake countdown
timer**, which reaches zero and resets forever, and the **fake limited time message**, static text
claiming an offer expires when it persists for months. The worked example is the Shopify app
Hurrify, whose configuration defaulted to "Run the campaign allover again (Evergreen)", making the
countdown "just a lie". A second example: Samsung listed a vacuum as "limited time only" across
November and December 2022.
[deceptive.design, chapter 15 urgency](https://www.deceptive.design/book/contents/chapter-15) (read
14 Aug 2026).

**The test:** does the deadline actually expire, and is the scarcity actually scarce.

Applied to the Cup, this is unusually easy, because bowling constraints are physically real:

| Device | Honest here? | Why |
|---|---|---|
| Countdown to the next cup night | **Yes** | The night is a fixed date and time on a fixed lane pair. It genuinely arrives and genuinely passes |
| Countdown to the enrollment deadline | **Yes, if the deadline is real** | It must actually close, and the next cup must actually be the next opportunity. If enrollment reopens quietly, it is a lie |
| "Four slots free in the field of sixteen" | **Yes** | The field is sixteen because 26 lanes and 2 lanes per match make it sixteen. The scarcity is a physical property of the building. `data/leagues.ts` already states it this way |
| "Six people are viewing this league" | **No** | Unverifiable, irrelevant, and it is the pattern the chapter above exists to name |
| A timer that resets | **No** | The definitional deceptive pattern |
| "Prices rise soon" without a date | **No** | And in any case Main Event publishes no league price, so no price claim of any kind belongs on this surface |

### 5.2 The pre match card, and what to put on it

FotMob's pre match page for a fixture presents, in order: **team form** (each side's last five
results), **head to head record** stated as a sentence, **insights** derived from the data ("have not
drawn any of their last 3 matches against each other", "haven't won a match in 5 attempts", "have
scored 6 goals in their last 5 matches"), and **team news**. Notably it shows **no league table
position, no confirmed lineups and no prediction or poll**; the prediction game is a separate opt in
product.
[fotmob.com match page](https://www.fotmob.com/en-GB/matches/van-vs-noravank/wd39a9c7) (read 14 Aug
2026).

That separation is the model. **The fixture page states facts. The prediction game is a different,
opted in thing.** The facts are checkable and the guessing is clearly labelled as guessing.

The bowling equivalents, all of which are honest because they are counts of things that happened:

- Form, last five cup matches, as a row of result glyphs.
- Head to head in this cup and in previous cups.
- Team high game and team high series.
- Position in the bracket and how many losses each side is carrying (the double elimination detail
  from 2.4, which is the single most decisive fact about a grand final and is usually not shown).
- Total pinfall banked, which is the Peterson points idea from 1.3.7 and gives the losing side
  something true to talk about.

**A hard constraint from the contract:** the current cup is a **declared exhibition**. Every one of
these figures is simulated and must be labelled as such wherever it appears, with `illustrative`
provenance and the word simulated or exhibition visible. Form guides are exactly the kind of thing a
reader will assume is real, so this is where the labelling matters most.

### 5.3 The tale of the tape, and the reason to be careful with it

The owner asked for boxing conventions, and the boxing convention has a well documented flaw.

The UFC's tale of the tape derives from boxing and shows nationality, age, height, weight and arm
reach. The criticism is that this "does not belong to MMA" because it ignores the kick; the UFC
responded by adding a leg reach measurement.
[Fightland](http://fightland.vice.com/blog/the-ufc-tweaks-its-tale-of-the-tape) (read 14 Aug 2026).

A longer critique argues the standard measures are actively misleading. Reach without technique
predicts nothing: Stefan Struve was a foot taller with ten inches more reach than Mark Hunt and lost.
Weight at weigh in ignores rehydration. Age is used as a proxy for decline when style matters more.
The author's summary of the predictive value of any of it: "MMA math never adds up".
[medium.com, a detailed look at MMA's flawed tale of the tape](https://medium.com/@AkaashSharma/a-detailed-look-at-mmas-flawed-tale-of-the-tape-c9b8949df461)
(read 14 Aug 2026).

**The lesson is not "do not build a tale of the tape". It is "do not put decorative statistics on
it".** Height and reach are on the boxing graphic because they are easy to measure, not because they
decide fights. The bowling equivalent of a decorative stat is ball weight. It is fun, it belongs on
a bowler profile, and it does not belong on a matchup card as though it predicts the match.

Boxing does have one genuinely good idea worth stealing: **quality of opposition**. Record notation
runs `34-9` or `34-9-1-2` for wins, losses, draws and no contests, and analysts add a "SumRecord",
the combined records of everyone a fighter has faced, plus a "resume" that counts only meaningful
opponents.
[heavyweightblog.com definitions](https://www.heavyweightblog.com/definitions) (read 14 Aug 2026).
Note that site's definitions are its own coinages, not a governing body's, so cite it as one
analyst's framework rather than as boxing's official vocabulary.

Translated: **a team's 3-0 record means nothing without the seeds it beat.** A cup card should say
"three wins, average opponent seed 12" next to "two wins, average opponent seed 4". That is a real
number, it is cheap to compute, and it does the work the tale of the tape only pretends to do.

### 5.4 Upset probability, which is where honesty gets difficult

**After the fact, an upset is honest and definable.** The NCAA defines one as "a victory by a team
seeded five or more lines below the opponent that it defeats", and the historic round of 64 record
by matchup, 1985 to 2026, is:

| Matchup | Games | Lower seed wins | Rate |
|---|---|---|---|
| 1 v 16 | 164 | 2 | 1.22% |
| 2 v 15 | 164 | 11 | 6.71% |
| 3 v 14 | 164 | 23 | 14.02% |
| 4 v 13 | 164 | 33 | 20.12% |
| 5 v 12 | 164 | 58 | 34.76% |
| 6 v 11 | 164 | 64 | 37.80% |

[Wikipedia, NCAA Division I men's basketball tournament upsets](https://en.wikipedia.org/wiki/NCAA_Division_I_men%27s_basketball_tournament_upsets)
(read 14 Aug 2026). The 7 v 10 and 8 v 9 rows are not tabulated in that source.

That is a stated rule plus a published record. A cup can do the same thing: define an upset as a
win over a team seeded N or more places above you, state the definition on the page, and count them.

**Before the fact, a win probability is a much weaker object.** During a single Super Bowl, gaps
between the lowest and highest published models reached **10 percentage points**; across 125 plays,
fewer than half (**46 per cent**) saw all five models agree on whether a play helped or hurt one
team; pairwise correlations between models ranged from **0.45 to 0.85**. Even with 40,000 plays of
training data, precision is around plus or minus 0.2 per cent. The author's recommendations: "avoid
over-precision" by rounding hard, use language like "about a 2% chance" or "1 in 50", be careful
when presenting surprising results, validate models publicly, and update them.
[statsbylopez.com](https://statsbylopez.com/2017/03/08/all-win-probability-models-are-wrong-some-are-useful/)
(read 14 Aug 2026).

**Recommendation for this product: do not show a pre match win probability at all.** Three reasons,
in order of strength.

1. Nothing has been bowled. There is no data to build a model on, and a model fitted to a simulated
   exhibition is a number about a simulation presented as a number about a team.
2. A precise looking percentage next to a hundred and two real verified organisations is exactly the
   kind of unearned precision that makes a reader doubt the real rows, which is the argument
   `data/leagues.ts` already makes about invented names and invented prices.
3. It is not needed. **Seed difference does the same job honestly.** "Seed 14 against seed 3" tells
   the reader everything a percentage would, carries its own uncertainty, and cannot be wrong.

If a probability is ever wanted later, the honest form is the rounded frequency ("about 1 in 7 teams
seeded this far below have won this round in this cup"), computed from this cup's own record, shown
only once there is a record, and never with a decimal point.

### 5.5 Storylines, which are the honest version of hype

The UFC's build up machinery is content, not pressure. **Embedded** is a vlog series giving "a raw,
unvarnished glimpse into their training, preparation, and personal lives". **Countdown** "highlights
the journey of fighters leading up to a big event, delving deep into their training, rivalries, and
personal lives", with the stated purpose of building "anticipation, excitement, and emotional
engagement". Fighter vlogs extend it across platforms.
[fwcontent.com](https://fwcontent.com/ufc-content-marketing-strategy) (read 14 Aug 2026). This is a
marketing agency's analysis rather than a UFC source, so treat the framing as interpretation.

None of that is manipulative. It is a schedule of true things released in an order. The bowling
translations are all cheap and all honest:

- **The draw.** Publish the bracket on a named day. The draw is itself an event.
- **The fixture card.** One matchup promoted per week, per the TUF cadence in 3.2.
- **Captain's line.** A captain writes one sentence about the next opponent. Real words from a real
  handle, opted in.
- **The path to the final.** The tap to pin interaction from 4.3, framed as "who you would have to
  beat".
- **The number that decides it.** One stat, named, with its basis stated. Not six stats.
- **The run.** Each team's route through the cup so far, which is a list of true results.

### 5.6 What is out

- Fake or resetting countdowns. (5.1)
- Scarcity claims not backed by lanes or slots. (5.1)
- Viewer counts, "popular right now", social proof of any kind that cannot be verified.
- Pre match win probabilities. (5.4)
- Decorative statistics dressed as predictive ones. (5.3)
- Any dollar figure presented as a Main Event price. Not a hype question, a truth question, and
  `CONTRACT_cup.md` and `data/leagues.ts` already settle it.

---

## 6. RECOMMENDATION

### 6.1 The format

**A six night quarterly cup. Sixteen teams. Two seeding nights, then a four night double elimination
Cup bracket with a mirrored Plate bracket for teams carrying two losses, finishing with a stepladder
grand final on night six. Every team bowls on all six nights. Matches are Baker best of five during
the seeding and bracket rounds, best of seven for the semi finals and the grand final. Handicap
declared as a rule, at 90 per cent of 210, until there are averages to compute one from.**

Name for the losers bracket in this context: it is a **Plate**, and it is promoted as a competition
with its own trophy, not as a consolation. Score7's phrasing is exactly right: "two trophies, two
celebrations".

### 6.2 The night by night schedule and the lane arithmetic

All figures **derived** from `FIELD_SIZE = 16` and `LANES_PER_MATCH = 2`.

| Night | What is bowled | Matches | Lanes | Teams bowling | Bowlers in the building |
|---|---|---|---|---|---|
| 1 | Seeding round 1, random draw | 8 | 16 | 16 | 80 |
| 2 | Seeding round 2, Swiss paired, winners v winners | 8 | 16 | 16 | 80 |
| 3 | Cup round of 16, seeded 1 v 16 to 8 v 9 | 8 | 16 | 16 | 80 |
| 4 | Cup quarter finals, 4. Plate round 1, 4 | 8 | 16 | 16 | 80 |
| 5 | Cup semi finals, 2. Plate rounds, 4. Plate final, 1. Wildcard, 1 | 8 | 16 | 16 | 80 |
| 6 | Finals night: stepladder, 3 matches on one pair. Handicap sweeper for the rest | 3 + sweeper | 16 | 16 | 80 |
| **Total** | | **43 plus the sweeper** | **16 every night** | | |

**Lane nights: 16 lanes x 6 nights = 96 lane nights.**

Context, from the existing model: a 16 week league season is `16 x 16 = 256` lane nights. So one
quarterly cup is **96 lane nights, about 38 per cent of a full league season, delivered in six
weeks**, on a night the leagues are not using or in the gap between league seasons.

### 6.3 Why this and not the obvious answer

**The obvious answer is single elimination.** It is what the word "cup" means to most people, it is
four nights, and it is the thing that looks best as a picture. It is wrong here and the arithmetic
says why:

- 15 matches, **30 lane nights**, against 96.
- **40 of the 80 bowlers have no reason to return after night one.** That is the whole commercial
  argument against it and there is no version of it that is fixed by better UI.
- The final occupies **2 of 26 lanes**. The building is emptier on the biggest night of the cup than
  on any other night of the quarter. For a venue whose entire pitch is that leagues fill the midweek
  evenings that are hardest to sell, that is the wrong shape.

**The second obvious answer is straight double elimination, because that is exactly what NCAA bowling
runs at exactly sixteen teams** (section 1.3.4). It is a large improvement: nobody goes out before
their second match, and it doubles the match count to 30. But NCAA compresses it into a weekend with
teams who have travelled and are not going home early. Stretched over weeks, straight double
elimination still ends with a night on which two teams bowl, and it still sheds the field steadily
from night three onward. It is the right **spine** and the wrong **whole**.

**What the recommendation adds to that spine, and why each piece earns its place:**

1. **Two seeding nights instead of a draw.** The building has not opened, so there is no basis on
   which to seed anything (section 2.1, and the NCAA precedent of seeding only its top four when
   data is thin). Two nights of Swiss paired match play produce a real, earned seed 1 to 16 from
   record then pinfall, and they put all sixteen teams on the lanes twice before anyone can lose
   anything. It also solves the problem that a cup at a new venue has no history: **after night two
   it has one.**
2. **The Plate.** This is the piece that fixes the tail. A second loss moves you into a competition,
   not out of one, and the Plate final is bowled on night five while the Cup semi finals are on the
   next pair. Score7 is explicit that the benefit is that "everyone gets a real competition to play
   through".
3. **The wildcard.** One fixture on night five that returns a beaten team to the Cup. It is straight
   from The Ultimate Fighter (section 3.1), it is a promotable named event, and its entire purpose is
   to keep a beaten roster in the building.
4. **The stepladder finale plus a sweeper.** This is the piece that saves finals night, and it is
   pure bowling. The stepladder is 3 matches on one pair with everyone watching, and the top seed
   bowls once, last, for the cup, which makes the seeding earned on nights one and two genuinely
   valuable. The other twelve teams bowl a handicap sweeper on the remaining lanes, which is a
   format the sport already runs "alongside bigger events" for exactly this reason. **Sixteen lanes
   are occupied on finals night rather than two.**
5. **Baker scoring.** A Baker best of five is at most 100 frames on a pair against 300 for a standard
   three game night (section 1.3.3), which is what makes eight simultaneous matches fit in one
   evening slot. It is also the format the NCAA uses for exactly this field size, so it is not an
   invention.
6. **Pinfall carried alongside wins.** Peterson style, PBA style. A team that loses banks something
   visible, and total pinfall is the tiebreak that seeds nights three onward.

### 6.4 The thing that makes all of it work, stated once

**Bowling already solved this and the answer is not a format at all.**

A bowling bracket is side action that rides on top of games the bowler was bowling anyway (section
1.3.1). Losing does not stop you bowling. It changes what your pins are worth.

So the Cup should be built as **a layer over a fixed weekly bowling commitment**. Every team has the
same slot on the same night for six weeks. The bracket decides what tonight's games count towards:
the Cup, the Plate, the wildcard, or the sweeper. There is never a night on which a registered team
has nothing to bowl.

Get that right and the format debate mostly evaporates, because the failure mode the whole debate
exists to avoid, the field going home, has been designed out at the level below the bracket.

### 6.5 Open decisions for the builder

Flagged rather than decided, because each depends on the venue rather than the research:

1. **Which night.** The two proposed leagues take Tuesday and Thursday, which are two of the three
   nights the published brand-wide programme actually runs. The Cup is a third night, or it runs on
   Tuesday and Thursday in the gap between league seasons. Both are defensible and the research does
   not settle it.
2. **Six consecutive weeks, or fortnightly across the quarter.** Six consecutive weeks then a seven
   week gap gives the build up a run and gives enrollment for the next cup a clean window. Fortnightly
   spreads the lane demand. Recommend consecutive.
3. **Handicap basis and factor.** 90 per cent of 210 is the balanced adult default. It is a
   `handicapNote` on the model, not a computed figure, until averages exist.
4. **Whether the Plate winner can re-enter the Cup.** The wildcard already does this once. Doing it
   twice makes the Cup bracket meaningless.

### 6.6 What I could not find

- **No public bye placement algorithm.** Every source gives the count formula and says byes go to top
  seeds in round one, then defers to pre-designed layouts. Moot for a field of sixteen, and a real
  gap if the field is ever not a power of two.
- **No published timing for a Baker match.** The frame arithmetic is solid and cited; the minutes are
  an estimate from general bowling pace figures. If the venue publishes lane turn times, use those.
- **No documented TUF draft order or first pick rule.** "Winning team picks the next matchup" is
  documented. Who picks first, and how the draft runs, is not, in any source found.
- **No commercial rationale published for sweepers.** Every source describes the format and the prize
  fund; none states what the centre gets from it.
- **No bowling specific bracket UI to study.** The sport's own tooling presents tournaments as squads,
  rosters and standings, with no bracket graphic. That is itself a finding, and it points the same
  way as the accessibility research: list first.

---

## SOURCES

All read 14 August 2026.

Formats and bowling rules

- [plaay.com, pro bowling tournament and playoff processes explained](https://plaay.com/blog/pro-bowling-tournament-and-playoff-processes-explained)
- [bowlingball.com, what are bowling brackets](https://www.bowlingball.com/BowlVersity/what-are-bowling-brackets)
- [bowl.com, tournament resources](https://bowl.com/rules/tournament-resources)
- [bowl.com, 2026 state of the association](https://bowl.com/a-future-for-the-sport/2026-state-of-the-association)
- [USBC, split season leagues PDF](https://images.bowl.com/bowl/media/legacy/internap/bowl/rules/pdfs/SplitSeasonLeagues.pdf)
- [tbebowling.com, eliminator tournament rules](https://www.tbebowling.com/rules)
- [liveabout.com, Baker team competition format](https://www.liveabout.com/baker-team-competition-format-420911)
- [liveabout.com, sweeper](https://www.liveabout.com/sweeper-420594)
- [liveabout.com, position round](https://www.liveabout.com/position-round-in-bowling-420579)
- [bowlrevolution.com, types of bowling tournaments](https://bowlrevolution.com/events/tournament-types/)
- [gobowling.com, how the bowling handicap system works](https://gobowling.com/blog/guides-tips/bowling-handicap-system-guide/)
- [totalbowling.com.au, Peterson points system](https://www.totalbowling.com.au/community/threads/peterson-points-system.8619/)
- [Wikipedia, 2022 NCAA bowling championship](https://en.wikipedia.org/wiki/2022_NCAA_Bowling_Championship)
- [goshockers.com, NCAA championship preview](https://goshockers.com/news/2026/4/9/womens-bowling-bowling-preview-ncaa-championship.aspx)
- [NFHS, requested bowling topics PDF](https://assets.nfhs.org/umbraco/media/865785/WKSP%2033%20-%20Requested%20Bowling%20Topics.pdf)
- [pba.com, nine players advance to stepladder finals](https://www.pba.com/2026/may/nine-players-advance-stepladder-finals-amf-pba-world-championship)
- [pba.com, extended stepladder finals set in U.S. Open](https://www.pba.com/2025/february/extended-stepladder-finals-set-us-open)
- [tournamentbowl.com, handicap 6-game sweeper](https://www.tournamentbowl.com/Open/TournamentHome.cfm?id_tournament=9328)
- [gametimehero.com, how long does one game of bowling take](https://www.gametimehero.com/blog/how-long-does-one-game-of-bowling-take)
- [shop.cdesoftware.com, bracket and sidepots](https://shop.cdesoftware.com/bracket-and-sidepots)
- [whitehutchinson.com, what's happening to bowling](https://www.whitehutchinson.com/leisure/articles/whats-happening-to-bowling.shtml)

Seeding, brackets and scheduling

- [hostatourney.com, double elimination bracket guide](https://hostatourney.com/en/blog/double-elimination-bracket-guide)
- [scorekeeper.co, how to seed teams in a tournament](https://www.scorekeeper.co/blog/how-to-seed-teams-in-a-tournament)
- [score7.io, what is a bye in a tournament](https://kb.score7.io/blog/guides/what-is-a-bye-in-a-tournament/)
- [score7.io, cup and consolation brackets](https://kb.score7.io/blog/guides/cup-and-consolation-brackets/)
- [printyourbrackets.com, how byes work in a tournament](https://www.printyourbrackets.com/how-byes-work-in-a-tournament.html)
- [bracketsninja.com, group stage brackets](https://www.bracketsninja.com/types/group-stage-bracket)
- [Wikipedia, Swiss-system tournament](https://en.wikipedia.org/wiki/Swiss-system_tournament)
- [Wikipedia, ladder tournament](https://en.wikipedia.org/wiki/Ladder_tournament)
- [medium.com, rotation algorithm in round robin tournaments](https://medium.com/coinmonks/sports-scheduling-simplified-the-power-of-the-rotation-algorithm-in-round-robin-tournament-eedfbd3fee8e)

The Ultimate Fighter

- [Wikipedia, The Ultimate Fighter](https://en.wikipedia.org/wiki/The_Ultimate_Fighter)
- [martialartsunleashed.com, how does The Ultimate Fighter work](https://martialartsunleashed.com/ufc/how-does-the-ultimate-fighter-show-work/)

Bracket and tournament UI

- [Challonge, bracket module instructions](https://challonge.com/module/instructions)
- [Google Play, Pocket Bracket for start.gg](https://play.google.com/store/apps/details?id=com.ichen.pocketbracket&hl=en_US)
- [arsfutura.com, tournament brackets in SwiftUI](https://arsfutura.com/blog/tournament-brackets-in-swiftui)
- [river.me, tournament brackets part 1](https://river.me/blog/tournament-brackets/)
- [dev.to, can tournament brackets be accessible](https://dev.to/yuridevat/can-tournament-brackets-be-accessible-34og)
- [Fast Company, the best March Madness bracket according to a UX designer](https://www.fastcompany.com/3058375/the-best-march-madness-bracket-according-to-a-ux-designer)
- [Nightingale, bracket carousel](https://nightingaledvs.com/bracket-carousel-discovering-the-next-generation-of-bracket-design/)
- [Toornament, viewer matches API](https://developer.toornament.com/v2/doc/viewer_matches)
- [Toornament, viewer bracket nodes API](https://developer.toornament.com/v2/doc/viewer_bracket_nodes)
- [medium.com/battlefy, bracket generator](https://medium.com/battlefy/bracket-generator-565280a8ebf7)

Anticipation, build up and honesty

- [deceptive.design, chapter 15, urgency](https://www.deceptive.design/book/contents/chapter-15)
- [fotmob.com, a match page](https://www.fotmob.com/en-GB/matches/van-vs-noravank/wd39a9c7)
- [statsbylopez.com, all win probability models are wrong](https://statsbylopez.com/2017/03/08/all-win-probability-models-are-wrong-some-are-useful/)
- [Wikipedia, NCAA Division I men's basketball tournament upsets](https://en.wikipedia.org/wiki/NCAA_Division_I_men%27s_basketball_tournament_upsets)
- [Fightland, the UFC tweaks its tale of the tape](http://fightland.vice.com/blog/the-ufc-tweaks-its-tale-of-the-tape)
- [medium.com, a detailed look at MMA's flawed tale of the tape](https://medium.com/@AkaashSharma/a-detailed-look-at-mmas-flawed-tale-of-the-tape-c9b8949df461)
- [heavyweightblog.com, definitions](https://www.heavyweightblog.com/definitions)
- [fwcontent.com, UFC content marketing strategy](https://fwcontent.com/ufc-content-marketing-strategy)
