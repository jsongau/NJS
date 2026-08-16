import type { ScreenRationale } from "./types";

/**
 * The board screens: the nine lanes, the same board cut by industry, the
 * work that happens outside the building, and the map underneath all of
 * it. Every claim below is read off the source it describes.
 */
export const LANES_RATIONALE: ScreenRationale[] = [
  {
    path: "/lanes",
    label: "Lanes",
    standfirst:
      "Every channel of outbound work in the trade area, grouped by who owns the date rather than by industry.",
    sections: [
      {
        heading: "Nine channels, because an industry list does not say who to ask for",
        body: [
          "There are 211 organisations in this trade area and an industry list would sort them by what they sell. That is the wrong sort for a sales manager. Two organisations in the same industry can need two different titles asked for at two different times of day, and two organisations in completely different industries can be worked with the same sentence at the same kind of door.",
          "So the board is cut by the door instead. Schools through the published staff directory, colleges through the student life office, fitness and youth sports through the front desk, corporate through the front office, auto and finance through the showroom floor, hospitality and civic through the membership desk, faith and nonprofit through the church office, healthcare through the practice manager, local retail and food through the counter. Nine lanes, nine doors.",
          "What that buys is a morning that runs. A rep working one lane asks for the same title all morning, opens with the same sentence and hears the same three objections, so the fourth conversation is better than the first. A rep working down an industry list changes script on every row and gets better at nothing.",
        ],
      },
      {
        heading: "Fifty four of the 211 are bought by the calendar, the other 157 by a person",
        body: [
          "Schools, colleges, and fitness and youth sports are the calendar-locked lanes: 22, 11 and 21 organisations, 54 in all. Their occasion happens whether or not anybody calls. A class graduates, a season ends, a term finishes. The only open question is the venue.",
          "The remaining 157 are discretionary. A holiday party, a client appreciation night, a staff thank you. These exist because a person decided to have one, and they can be asked for in any week of the year.",
          "That split is not a taxonomy, it is a deadline. A grad night in June is decided the previous autumn, so a calendar-locked lane worked in April has already lost the year and nothing done in May gets it back. A discretionary lane worked in April will still answer in May.",
        ],
      },
      {
        heading: "The sequencing argument: calendar-locked on their calendar, discretionary in the gaps",
        body: [
          "The plan this board is built to support is short enough to say out loud. Work the 54 calendar-locked organisations backwards from their fixed dates, and fill every remaining hour of the week with the 157 discretionary ones, because the discretionary ones do not punish you for the wait.",
          "The discretionary side has a season of its own and it is worth naming. A corporate holiday catering playbook puts vendor research in July and August, shortlists finalised from September to early October, and what is left in October and November as smaller last-minute bookings. That is a playbook written by people who sell into the cycle rather than a measurement, and it is read here as one. So the corporate ask is made in summer, ahead of the weeks in which the decision normally gets made.",
          "Autumn is the one stretch where both classes are live at once: grad night for the following June and the holiday season are decided in the same few weeks. That is why this screen matters before the doors open rather than after. An autumn planned in spring covers both. An autumn improvised covers whichever one rang first.",
        ],
      },
      {
        heading: "Everything a lane means is declared in one record",
        body: [
          "In the build this was forked from, a channel's label lived in one component, its glyph next to the label, its behaviour in a chain of ternaries, and whether it was a bar or a shop was something each call site worked out for itself by pattern matching on a string. Five files knew four different amounts about the same nine values.",
          "The failure that produces is not a crash. It is a screen that says \"Youth sports\" in one place and \"Sports\" in another, and a filter that quietly treats a dojang as a corporate account because whoever wrote the ternary listed the four lanes they happened to remember. So LANE_META declares the lane once, with the label, the short form, the glyph, the occasion class, the CSS tokens and the prose all on the same object.",
          "Two of those fields exist because of how a sentence reads. doorName is a heading: Published staff directory. doorNoun is the same fact in one word for the middle of a sentence, because \"Nothing through the published staff directory\" is a real phrase and a terrible clause, and a sentence that reads as though a program assembled it is a sentence a reader can tell was assembled by a program.",
        ],
      },
      {
        heading: "The split runs on who owns the date, not on what they sell",
        body: [
          "A graduating class graduates whether or not anybody calls it. A holiday party exists only because a person decided it should. Those are two different sales calls made in two different months, and confusing them is how a pre-opening venue spends October on discretionary buyers and finds out in June that every grad night in the trade area went somewhere else.",
          "So the board is grouped by occasion class before it is grouped by anything else, and the same ordering is enforced in LANE_ORDER rather than on the page, because the lane board was not the only screen with an opinion about which lane leads. Schools first, local retail and food last. Retail last is not a demotion: it is the smallest ticket on the board and the only lane worked as a walking route, so putting it higher would tell somebody to spend a Tuesday morning on a twelve person boba counter while a graduating class went unclaimed.",
          "The tab for the discretionary class reads Chosen rather than Discretionary. Discretionary is the correct term and it is what the class is called everywhere else in the app, but on a narrow tab it ellipses to \"Discre...\", which tells a reader nothing. The full name stays on the tooltip, the aria label and every heading with room for it.",
        ],
      },
      {
        heading: "The page counts its own lanes, including in the heading",
        body: [
          "\"The eight lanes\" was typed into the h1 when there were eight, and a ninth lane made the biggest text on the page the only wrong thing on it. The heading now spells the length of LANE_ORDER, with the numeral as the fallback for a count nobody has a word ready for. A page whose title disagrees with its own contents is the first thing a careful reader notices and the last thing they forgive.",
          "Nothing else on the screen counts to nine by hand either. The cards come off LANE_ORDER, the grouping comes off each lane's own occasion class, and the package list per lane is filtered from PACKAGES at module scope, once, because both inputs are static and recomputing a filter per card on every status change is work done to produce an answer that cannot have changed. A tenth lane lands here as one more card in the right group.",
          "The one thing a new lane still has to be checked against is package fit. A lane with nothing matching renders an empty package block, and an empty block reads as a fault in the page rather than as a fact about the lane.",
        ],
      },
      {
        heading: "Every figure on a card is a selector, and one of them moves",
        body: [
          "Organisations, published emails, untouched rows and the summed headcount range are computed in a single pass over the prospect list per render rather than three passes per lane inside every card. Untouched is the only figure here that depends on state a reader can change, and it is the reason the pass is memoised on the pipeline rather than run once at module load: advance one school anywhere in the app and the schools card drops by one immediately.",
          "The group summary carries a figure that is not on any card, and it is deliberately at group level. The top of every modelled headcount range in a class, summed and converted at Main Event's own published rate of one bowling lane per twenty guests, is compared against a published floor of twenty six lanes at Brea. The interesting comparison is between the two classes, not between two lanes, and the arithmetic runs against the floor rather than the true lane count so the number understates the building and never oversells it.",
          "Each figure carries the class of thing it is: counted organisations are public, the summed range is modelled, and the untouched count is illustrative because it moves with a reader's own clicks.",
        ],
      },
      {
        heading: "A lane click filters the desk instead of opening its own page",
        body: [
          "The obvious build is a drilldown page per lane. That would have meant a second ranked list of prospects with its own sort order, quietly disagreeing with the desk about which school to call first. There is one ranked list in this application, and this screen is a filter onto it.",
          "The click clears the lane filter before setting it rather than adding to it, because a reader who presses Schools expects the desk to show schools, not schools plus whatever was ticked twenty minutes ago on another screen.",
          "The whole card is the hit area, but the control is the heading button with a stretched pseudo element, not a click handler on the list item. A handler on an li gives a keyboard reader nothing to focus and a screen reader nothing to announce.",
        ],
      },
    ],
  },

  {
    path: "/segments",
    label: "Segments",
    standfirst:
      "The same board cut by NAICS sector and ranked, with the ranking's one judgement handed to the reader as a control.",
    sections: [
      {
        heading: "The posting asks for target segments and industries by name",
        body: [
          "The job description asks the sales manager to identify \"high-potential target customer segments and industries\". That is a deliverable rather than a mood, and the honest form of it is a ranked list with the rule printed beside it.",
          "Lanes and Segments cut the same 211 organisations twice, and the two cuts answer two different questions. Lanes answers how you reach a person: which door, which title, which opening sentence. Segments answers which industries are worth the hours first.",
          "Neither one is sufficient on its own. A lane tells you nothing about whether the morning was worth spending. An industry ranking tells you nothing about who to ask for once you are standing there.",
        ],
      },
      {
        heading: "What the second cut buys a sales manager",
        body: [
          "Lanes plans a day. Segments plans a quarter. A rep goes out on a lane, because a lane is what a route is made of, and a manager decides which lanes get the routes, which is an industry question and a different job.",
          "It also settles arguments before they start. The ranking runs on three counts anybody can open: seats, the share whose occasion happens whether or not anybody calls, and the share with any written door at all. A manager who thinks the order is wrong does not have to argue with whoever built it. They press a different weighting and watch the board reorder.",
          "And it makes the plan defensible upward. \"We are working this sector first\" is an opinion. \"We are working this sector first because it scores here on seats and here on reach, under this weighting, and here is exactly what changes if you weight certainty higher\" is a plan a general manager can sign or send back with a correction.",
        ],
      },
      {
        heading: "Before a venue opens, certainty is worth more than it will ever be again",
        body: [
          "A venue that is not open yet has no client base and no repeat business. Every booking in the first year has to come off somebody else's calendar. That is the reason certainty is a component of the score at all, and the reason the pre-opening preset exists rather than one fixed ranking.",
          "54 of the 211 already have their occasion on the calendar. Those are the bookings that do not need the building proven, only a date held. The 157 discretionary ones are worth more per booking and most of them want the one thing 245 W Birch Street cannot give yet, which is a walk through the room.",
          "So the ranking is not permanent and the screen does not pretend it is. The weighting that is right for a pre-opening quarter is the wrong one a year later, when there is a floor to walk a buyer across and the tour closes the sale by itself.",
        ],
      },
      {
        heading: "The expected build was a donut, and a donut cannot be argued with",
        body: [
          "The easy version of this screen is a pie of the board by industry with the biggest wedge called the opportunity. It answers \"what did I collect\", which nobody asked, and it is unfalsifiable in the way a picture is: there is no rule in it to disagree with.",
          "The question the posting actually asks is which industries to work first, and that is a ranking, and a ranking with no stated rule is an opinion with a number typed next to it. So each sector scores out of one hundred on three components: volume, which is seats summed from headcount midpoints; certainty, which is the share whose occasion happens whether or not anybody calls; and reach, which is the share with any written door at all.",
          "Volume leads the default weighting because guests are the closest thing to revenue that can be computed without inventing a price, and group prices are the one thing Main Event deliberately does not publish.",
        ],
      },
      {
        heading: "The weighting is a control on the page, not a constant in the data",
        body: [
          "The three weights are a judgement. Fifty, thirty and twenty are not derived from anything and presenting them as though they were would be a lie. The three inputs are not a judgement: every one is a count over rows a reader can open. So the page ships four presets, prints their numbers beside the answer they produce, and lets a reader who thinks certainty matters more than volume before a venue opens press Pre-opening and watch the board move.",
          "The re-score is computed in the page rather than by passing a weights argument into the segment selector. Pushing it down would have looked tidier and would have cost the thing that makes the selector trustworthy: every other surface reading that table would inherit an argument it has no opinion about, and the published weighting would stop being the answer the rest of the application agrees on. The selector stays the single source of the three components; the page owns the opinion.",
          "The Balanced preset reads its numbers from the selector rather than retyping them, because a second copy of three numbers in a component is exactly how a screen ends up disagreeing with its own data layer.",
        ],
      },
      {
        heading: "A control that silently reorders a long list reads as broken",
        body: [
          "Sixteen rows are taller than a viewport. Pressing Reach changes the place of twelve of them while the top three sit still, and a reader watching the top three sees a page that did nothing. So every row carries how far it moved against the default weighting as an arrow and a word and a number, and a polite status region under the presets says how many rows changed place and names the biggest mover before anybody has to scroll to find it.",
          "The movement marker is deliberately not green up and red down. A sector rising under a different weighting is not good news, it is a consequence of a judgement the reader just made, and painting it as a win would be the page arguing for its own control.",
          "The tiebreak inside the re-rank is copied from the selector on purpose: score, then seats, then label. Two orderings of the same board that disagree only when two scores tie is the worst kind of bug, because it looks like the control did something and it did nothing.",
        ],
      },
      {
        heading: "The reading lives in the address bar",
        body: [
          "The active weighting is a query parameter and so is the open row. The reason is not deep linking for its own sake: the proof scripts that screenshot this build cannot press a control, so a state that can only be reached by pressing is a state nobody ever captures.",
          "Both parameters are narrowed to values this board actually has. A pasted weighting nobody defined falls back to the default rather than drawing an unranked board with no explanation of why it is unranked, and an open row that no longer has anything in it simply does not open.",
          "Setting either one replaces the history entry rather than pushing a new one. Changing a weighting is re-reading the same board, not going somewhere, and a back button that had to walk back through four presets to leave the screen would be a control stealing the browser's own verb.",
        ],
      },
      {
        heading: "The empty sector is rendered rather than dropped",
        body: [
          "NAICS 51, Information, has nothing on this board. Three candidates were researched and every one rested on a single directory line with a generic switchboard number, so none of them shipped. A row that cannot be checked is worth less than an empty sector that says so.",
          "It is drawn with the visual language this build already uses for a fact somebody withheld: the same withheld glyph, a dashed edge, no rank and no score, so a reader who has seen a withheld price on the packages screen recognises what it is before reading a word. It carries its own friction text and the occasion that would make one buy when one is found, because a segmentation that only lists what was found cannot tell you where to look next.",
          "The gap list is read off the board's own totals rather than hard-coded to sector 51, so a sector that empties later lands in this section instead of silently vanishing from the ranking.",
        ],
      },
    ],
  },

  {
    path: "/field",
    label: "Field",
    standfirst:
      "The go-see run, the tabling plan and the hours ledger: the half of the job that happens outside the building, which is the first responsibility the posting names.",
    sections: [
      {
        heading: "68 organisations have no written door, so the door is a lobby at lunchtime",
        body: [
          "Of the 211 organisations on this board, 93 publish an email address and carry the page it was read off, 50 have a contact form and nothing else, and 68 have no email door at all. Not a hard one to find. None. Twenty six of those 93 are an info@ mailbox, and the buyer on every row is recorded as a title rather than a name.",
          "Those 68 are not a hole in the research. They are close to a third of the trade area, and the only way to work them is to walk in. A franchise counter, a clinic front desk and a showroom floor each have a decision maker standing in them during working hours, and not one of them will ever answer a sequence.",
          "The posting names this work first and names it exactly: \"tabling, networking events, and go-sees with prospective and current customers\". This screen is that sentence turned into a list of stops, a plan for the tables and a record of the hours it took.",
        ],
      },
      {
        heading: "The visit is a channel here, not what you do after the email fails",
        body: [
          "A rep who treats the go-see as the fallback will do it last, do it rarely, and drop it entirely in a busy week. The organisations on this run were never reachable any other way, so the trip is the first move rather than the consolation.",
          "The lanes already say where the buyer stands. Corporate is the front office, healthcare is the practice manager, local retail and food is the counter. Those are places, not inboxes, and a person who is almost impossible to get on the phone is often easy to meet.",
          "Timing is part of the plan and it is not the same in every lane. An office lobby is worth a lunch hour, which is why one table on the right block reaches more decision makers in an hour than a morning of calls. A retail crew with the owner on it is on shift in the evening, which is the one time of day a rep at a desk is not.",
        ],
      },
      {
        heading: "Hours out of the building are their own ledger and never added to revenue",
        body: [
          "The field ledger counts hours and stops. The book counts bookings and money. They are two separate arrays and there is no total of the two anywhere in this application, and that is a management decision before it is a data one.",
          "The reason is that effort and outcome fail differently, and a manager needs to tell the two failures apart. A quarter with plenty of hours and no bookings means the targeting is wrong. A quarter with bookings and almost no hours means the pipeline was inherited rather than built and it will run dry. Add the two numbers together and neither diagnosis is available, which is how a slow month gets reported as a busy one.",
          "So this page reports effort plainly and refuses to flatter it. Twelve go-sees is twelve go-sees. What it does hold itself to is the share of the period spent outside the building rather than the raw total, because the total only ever goes up while the share is the thing a manager can actually direct.",
        ],
      },
      {
        heading: "Which work counts as outside is asked, never restated",
        body: [
          "This page could simply list the activity types that happen outside the building. It deliberately does not, because a second copy of that list is a second opinion: the day somebody adds a seventh activity type, one copy learns about it and the other does not, and this ledger quietly stops agreeing with the book page about the same period. That class of bug never crashes. It just makes two screens disagree in front of the one reader who was checking.",
          "So the question is asked of the ledger provider instead. One probe line of one hour per activity type goes through the same totals function the book page uses, and whatever comes back counted as outside hours is the answer. It costs six objects at module load and it cannot drift.",
          "The result is worth knowing before reading the table: a venue tour does not count. It is real outbound work and it happens at 245 W Birch Street, which is the one address in this application that is not outside the building.",
        ],
      },
      {
        heading: "The run is sorted by distance and by nothing else",
        body: [
          "The go-see run is every organisation publishing no email address anywhere on their own site. Not a hard one to find, none at all. They cannot be reached by a sequence and cannot be reached by anything a person does sitting down, so the visit is the channel rather than a fallback.",
          "The list is ordered by straight-line distance from the venue, which is the order somebody actually drives them. Not by size and not by priority: every organisation in this list costs the same trip, so the only sensible ordering is the cheap one. The distance is on every row and it is called straight line everywhere it appears, because there is no routing engine in this dependency tree.",
          "The run states its own price in hours rather than implying it is free: the number of stops multiplied by a modelled three quarters of an hour per stop, with both halves on the screen. The furthest distance in the supporting sentence is derived from the data rather than typed, because the board grew in one research pass and every written-out number in that prose went stale the same afternoon.",
        ],
      },
      {
        heading: "The tabling argument is built from two rows a reader can check",
        body: [
          "The clearest geographic case in the data set is a single block of Kraemer Boulevard where two of Brea's largest single-site employers sit a few hundred feet apart and name the same job title as the buyer. One table, one lunch hour, both of them.",
          "The two organisations are looked up by id rather than written into the prose, so if either row ever leaves the prospect file the whole section disappears instead of quietly asserting an address nobody can check. The gap between them is computed with a haversine over the two published coordinates and printed in feet, so a reader who doubts it can find both rows on the map.",
          "The section also carries the evidence against the alternative. One of the pair publishes an email address and the other publishes a support form, and the reply already on the replies board under wrong person is the reason this is a tabling shift rather than a second email.",
        ],
      },
      {
        heading: "There is no money anywhere on this page",
        body: [
          "An activity line has no revenue field. The two ledgers live in separate arrays, and the hours ledger here is the one that cannot carry a dollar figure even if somebody wanted it to.",
          "That is the point rather than an omission. A field report with a revenue total on it is the exact document where hours out of the building get dressed up as results. Twelve go-sees is twelve go-sees. If one of them turned into a party there is a booked line, and the money is on the book.",
          "The ledger does not congratulate anybody for the total either. It splits the period into hours outside the building and hours at a desk and holds the plan to spending seventy percent or better outside. That floor is this application's own and it is marked illustrative on the screen: Main Event publishes no such figure and the page says so beside the verdict.",
        ],
      },
      {
        heading: "ISO dates are split, never parsed",
        body: [
          "Passing a date-only string to the Date constructor gives midnight UTC, and formatting that in California prints the day before. A field plan that names the wrong Monday sends somebody to a lobby on the wrong day, so these strings are treated as the calendar labels they are and split on the hyphen rather than routed through a timezone.",
          "The week list for a period is built by adding seven days at a time in UTC only. A loop that adds seven days to a local Date walks straight into the November clock change and produces a Sunday, which would file a week's work against a week that does not exist in the plan.",
          "The week a shift is filed against is validated against the period rather than trusted, because the period selector lives in the chrome and can move underneath the form. A shift filed against a week outside the period would land in the ledger and vanish from the table above it, which looks exactly like the application losing the entry. For the same reason each stop is keyed on the organisation and the period together, so changing the period remounts the row and its week selector defaults to a week that is actually in view.",
        ],
      },
    ],
  },

  {
    path: "/map",
    label: "Maps",
    standfirst:
      "The geographic board, and the one question the desk cannot answer: how much of a week does each of these organisations cost.",
    sections: [
      {
        heading: "A map answers the question a ranked list cannot",
        body: [
          "A ranked list answers who to work first, which is a good question and not the only one. It cannot answer the question a rep asks every single time they pick up the keys: what else can I do while I am over there.",
          "The board covers nine cities and it is nowhere near evenly spread. Brea holds 112 of the 211, Fullerton 52, Placentia 18, then La Habra 9, Yorba Linda 7, Buena Park 6, Anaheim 5, La Mirada 1 and La Habra Heights 1. Sorted by score those nine cities interleave down a long page, and two stops on the same street can end up far apart in the order with no way to notice.",
          "On the map they sit next to each other. That is the whole argument. Geography is not decoration on this screen, it is the input to a route.",
        ],
      },
      {
        heading: "How a go-see run is actually planned on this screen",
        body: [
          "The method is to pick a cluster rather than a row. Filter to a lane, find where the marks bunch, and take the bunch. Three stops on one street is a morning. The same three conversations spread across three cities is a day, for identical output.",
          "The lane chips write to the same shared state the desk reads, so a lane chosen here is still chosen when the reader goes back to the ranked list. That is the working handover: the map picks the neighbourhood, the desk says which door in it to knock on first.",
          "The one thing this screen will not do is tell anybody how long a drive takes. The rings are straight lines and are labelled as straight lines everywhere they appear, because no drive time in this research was verified and a run planned on an invented number is a run that arrives late and blames the map. A rep drives it once and writes the real number down.",
        ],
      },
      {
        heading: "The clusters decide which lanes can be worked as a route at all",
        body: [
          "Some lanes are a route by nature and some are a set of appointments, and the map is where the difference is visible. Fourteen of the fifteen local retail and food rows sit within a mile of the venue and the furthest is just over three, which is the tightest spread of any lane on the board and the reason those fifteen are worked as a walking line rather than as fifteen accounts with fifteen diary entries.",
          "Others are thin and spread out and have to be batched by city instead of by street. The single organisations in La Mirada and in La Habra Heights are not a trip on their own, and this screen makes that obvious in a second no matter how well either one scores on the desk.",
          "That is the working use of the map for a sales manager. It is where the shape of a week is decided, before any of it goes in the diary and before anybody is sent anywhere.",
        ],
      },
      {
        heading: "The route takes the whole screen, and the rail is unmounted",
        body: [
          "Every other screen here is a document in a column beside a rail. This one is a working surface and it was being asked to be both at once. The arithmetic was plain enough to measure: the rail took 252 pixels, the page header another 105, and what was left for a list of a hundred organisations, a map and a detail panel was a strip. Three panes in a column that is already 252 pixels short is not three panes, it is three things that do not fit.",
          "So the route declares itself full bleed and the shell unmounts the rail entirely. Not hidden, not collapsed to zero width: either of those leaves a strip of screen that looks like the page and belongs to something else.",
          "A takeover has to be leavable by every reader rather than by the ones who know about Escape, so the Back control the board draws and the Escape key the shell binds call the same exit function. They cannot drift, and it restores the screen the reader came from, that screen's scroll offset and the control they left focus on. The long argument about the rings used to sit in a header band above the board, four hundred words of it, which on a takeover is four hundred words of map. It is not cut. It is behind a details element in the chrome band that costs one control's width when shut and opens over the board rather than pushing it down.",
        ],
      },
      {
        heading: "The venue gets a broken ring instead of a pin",
        body: [
          "Main Event Brea is an address, a phone number, a coming soon form and no published opening date. A solid pin says \"here is a business\", and a reader who accepts that reads every other mark on the screen as a customer instead of as an organisation nobody has spoken to yet.",
          "So the venue carries its own mark rather than a lane glyph: a dashed ring with the words \"Not open yet\" on a plate beneath it. Neither the dash nor the words depend on the colour, which is the house rule everywhere in this build. The mark is 104 pixels wide because it has to carry that sentence legibly, and the ring labels are sized against it so a label never lands under the plate.",
          "That single mark is the premise of the whole application stated without a paragraph. There is no client base, and the map is the one screen where a reader can see it.",
        ],
      },
      {
        heading: "The rings are straight lines and say so on the map itself",
        body: [
          "A circle drawn from a venue is the oldest trick on a territory map and it is almost always sold as a drive time. It is not one. Two organisations the same distance from the building can cost very different amounts of a morning: one sits on a road that runs straight back to Birch Street, the other has a freeway, a rail line or a hillside between the two and a twenty minute detour to the nearest crossing.",
          "One, three and five miles are not round numbers picked for the look of them. Each changes how a visit is planned rather than how far it is. A mile is walkable and fits in a gap. Three miles is a twenty minute round trip, so a morning holds three or four. Five is the edge past which a single visit costs a half day unless it is run with two or three others.",
          "Only one ring is labelled at a time, and it is the innermost one whose label can clear the venue plate at the current zoom. As a reader zooms in the rings leave the screen from the outside, so the innermost readable ring is always the one still fully drawn. The other two are named with their distances in a note that is permanently on screen. Labelling on hover was rejected because a ring is not hoverable on a touch screen and these rings are deliberately not interactive, and moving the key into the legend was rejected because the legend is collapsed by default and a claim in a closed drawer is a claim nobody reads.",
        ],
      },
      {
        heading: "Where the coordinates came from, and which rows never got a pin",
        body: [
          "Sixty nine rows came out of the Google Places API on 11 August 2026 and every one of them carries the place id it came from, so any pin can be checked at source in about fifteen seconds. Thirty three more, local retail, food, auto service and small employers, were researched by reading each organisation's own published page or its landlord's tenant directory and then geocoded with the US Census Bureau geocoder, benchmark 2020, on the same day. A third pass of 109 was added by industry rather than by map, and every one of those rows was geocoded the same way, through the same Census benchmark. That leaves 142 rows carrying no place id at all: the field is absent rather than filled, because there was no Places call in either of those two passes and a fabricated id on a row a reader might click is worse than a missing one.",
          "Twenty five researched organisations are real and have no mark on this map. Fifteen could not be matched by the Census geocoder at all, whose address ranges lag new construction and hold nothing for a short industrial cul-de-sac or a private drive up to a clubhouse. Eight are worse and more interesting: the geocoder came back with a different street, or the opposite directional on the same street, from the one the research pass had read. Two more are unverifiable rather than unmatched, including a mall food court unit whose landlord publishes the level and the entrance and no street number, so there is no address to geocode in the first place. The alternative was to nudge a nearby pin, and a fabricated pin is the one thing that would discredit every other mark on the screen. An unmatched row is a fact somebody can act on, so those names are published as removed, with the reason, rather than plotted.",
          "The same standard took the most entertaining prospect off the board. Round One Entertainment appeared in an early pass as a Brea headquartered corporate prospect on the strength of a directory listing, and Google Places puts it in Cerritos, thirteen miles away and outside this trade area. Two sources disagreed, so the row came out.",
        ],
      },
      {
        heading: "A filtered out organisation is not drawn at all",
        body: [
          "The marker contract carries a muted flag for exactly this decision and this pane never sets it. The first reason is arithmetic: the strip says how many of the board are showing and the list shows that many cards, so a map drawing every organisation with most of them greyed is a third pane disagreeing with the other two about what the reader is looking at.",
          "The second is that a muted mark is still a mark. It takes room in the cluster grid, it can be clicked, and clicking it would open a panel for an organisation the board has just said is not on the board. Muting earns its place where the rest of the territory is genuine context for a chosen few; here the filter is the reader's own question, and the honest answer to a question is the rows that answer it.",
          "The same discipline governs what the pane owns. It holds no filter state and no selection state, only the rows it was handed, because a map that owns a filter is a map that disagrees with the list beside it the first time somebody changes the filter from the list. The lane chips write to the same shared state the desk reads, so filtering to schools here leaves the desk filtered to schools when the reader gets back to it.",
        ],
      },
    ],
  },
];
