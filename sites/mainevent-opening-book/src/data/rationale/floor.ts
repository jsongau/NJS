import type { ScreenRationale } from "./types";

/**
 * THE FLOOR SCREENS, EXPLAINED.
 *
 * Five screens, each one a set of decisions that could have gone the
 * other way. Nothing in this file is new argument. Every line is read off
 * the block comments and the code on the screen it describes, which is
 * the only way this mode can be trusted: if the reader checks the source
 * they should find the same reason, in the same words.
 */
export const FLOOR_RATIONALE: ScreenRationale[] = [
  {
    path: "/leagues",
    label: "Leagues",
    standfirst:
      "The only recurring product the building sells, drawn as two nights forming and a field of sixteen behind each.",
    sections: [
      {
        heading: "No standings, because nothing has bowled a frame",
        body: [
          "Every league board a reader has ever seen opens with wins and losses, and that was the obvious thing to build. It was refused. Main Event Brea has not opened. A season of results would be a season that did not happen, rendered next to two hundred and eleven real organisations and a licence table that is careful about what it does and does not claim. One invented scoreboard costs more credibility than the whole leagues surface is worth.",
          "What is on the board instead is the field of sixteen ranked by readiness to play: slot state first, then bodies on the roster, then the date the slot was claimed. All three are columns on the same table, so a reader can check the order by eye rather than trust it. The league record carries a standings basis of form-up and the ladder head says so in words above its own first row.",
          "The refusal is held by the type rather than by discipline. The league types in the domain layer carry no result field, so there is nowhere to put a score. The quarterly cup does have scores, they are a declared exhibition, they sit on types whose simulated label is a required field, and not one of them reaches a league type.",
        ],
      },
      {
        heading: "A proposal, and it says so above the fold",
        body: [
          "Main Event publishes a real brand-wide league product called Open Lane Socials. It runs at select locations, the three it names are in Colorado, and no California venue publishes a league at all. The Brea page links to the programme and makes no league claim of its own.",
          "So the two leagues on this board could not be presented as the venue's programme. They are this application's own proposal for an opening season, the page says that in the second line, and the published programme is reproduced in full at the bottom of the screen with the five things its own page does not state. A reader can see exactly where the line between the two sits without leaving the screen.",
          "The one thing borrowed from the published product is the play nights. Tuesday and Thursday are two of the three nights the brand-wide programme actually runs, and they are the two midweek evenings a venue finds hardest to sell.",
        ],
      },
      {
        heading: "There is no season price and there is not going to be",
        body: [
          "A price would have made the board feel finished. Main Event publishes no dollar amount for a league anywhere, and neither does Bowlero or Lucky Strike. All three route the question to a form, which makes the missing figure a habit of the category rather than a gap in the research, and makes any number invented here a number a reader could check against mainevent.com and find nowhere.",
          "The price therefore renders as the withheld sentence, with the reason attached to it. What the board reports instead is lane nights: lanes multiplied by weeks across both leagues. That is inventory rather than money, so it cannot be added to the booked revenue ledger or the outbound activity ledger by accident.",
        ],
      },
      {
        heading: "The rosters are handles, and the counts come off them",
        body: [
          "A hundred and twenty six bowlers appear on this surface and not one of them is a person. Every one is a handle, which is what a bowler is called on the lanes, plus a position and some preferences about a ball. There is no first name, no surname and nowhere to put one, because the bowler type has no field for it. The captain keeps a job title, because a title is a role and a role is not a person.",
          "The reason is the same one that put twenty five real organisations on an exclusion list rather than on the board. A plausible invented name sitting next to two hundred and eleven real organisations is the fastest way to make a reader doubt the real rows. Nobody reads a handle and believes a specific human is being described.",
          "The bowler count and the filled positions on a team are not typed anywhere. They are computed from the roster, once, so the number on the ladder and the list of handles on the team sheet are one fact rather than two that have to be kept in step. Add a bowler and the ladder reorders, the seats count drops and the league's openness reading can change, with nobody editing a second number.",
        ],
      },
      {
        heading: "One compose window for the whole surface",
        body: [
          "There are four league actions across two routes and nine places to press them. Each of those call sites could have opened its own compose window. Instead they all raise one request through a single bridge, which is the only thing in the folder that knows email exists, and both routes mount one shared component rather than the modal itself. Two copies of the modal would trap focus in whichever the browser reached first, and rewiring the surface to a different compose API is now a change to one function.",
          "The bridge hands the draft the number of team places free, never the number of seats open on a roster. A league whose field is claimed but whose rosters are short has eleven of the second and none of the first, and handing over the seat count would put a sentence in a rep's mail that is wrong in the one way a reader can check. Zero is falsy, so the draft writes about welcoming joiners instead, which is the accurate sentence.",
        ],
      },
    ],
  },

  {
    path: "/cup",
    label: "The Cup",
    standfirst:
      "One cup a quarter: an exhibition being bowled tonight, and a January field still taking teams.",
    sections: [
      {
        heading: "A flat route with modals, not child routes",
        body: [
          "The cup has no child routes. The team surface, the bowler profile and the tale of the tape are dialogs addressed by search parameter, with a team, bowler or tape key over whichever screen raised them, in the same shape the record modal and the quote preview already use.",
          "Child routes were the obvious shape and they were wrong for this data. A team name appears on the cup lead, the fixture list, the bracket, the field ladder, the enrollment panel, the leagues board and the league detail page. A handle appears on three of those. Child routes would mean either three copies of the same surface or four layers of callback plumbing per board, and the plumbing is where the divergence starts. Each surface is mounted exactly once by a provider and every name in the application is a button that asks it to open one.",
          "Putting the open surface in the address buys four things that component state cannot: a card is a link, it survives a reload, the back button closes it because closing it is what going back means, and a screenshot pass can reach it without learning which control to press. The three dialogs can also stack, so the provider keeps the order they were opened in and hands the keyboard to the top one only.",
          "The contrast is the leagues detail route, which is a real child path. A league is a thing with a name that people send each other, and an address reading /leagues/last-frame-standing survives being pasted into a message in a way that a query parameter does not.",
        ],
      },
      {
        heading: "The four readings of this board live in the address",
        body: [
          "Which view, which bracket, which night and which state are all search parameters. Held in component state each of them would have the same four defects: a reload loses the reading, a pasted address gives somebody else a different screen, the back button does nothing because nothing moved, and a shot pass cannot reach the second view at all.",
          "They are deliberately not the same keys the team, bowler and tape surfaces use, so a reader can have a filter set and a card open at once, and closing one does not clear the other.",
          "Every reading is narrowed to a value this board actually has, because the address bar is an input like any other. A pasted night that does not exist, or a misspelled state, falls back to the whole cup rather than drawing an empty board with no explanation of why it is empty.",
        ],
      },
      {
        heading: "It wears the Leagues colour rather than one of its own",
        body: [
          "The cup could have taken a section identity and a hue of its own. It does not. A cup is what the leagues play for, it sits beside Leagues in the rail, and a separate colour would draw one thing as two. The section hues are solved around a single wheel by a script in this repository, and at that count the adjacency floor does not survive another entry, so the tidy answer was also the unavailable one. It is still named in the rail, in the breadcrumb and in the page title, which is where a section is actually told apart. The same precedent puts Segments under Lanes, and Pay and the district report under the floor.",
          "It is a separate route all the same, and that is the other half of the decision. A league is sixteen weeks of the same night. A cup is six nights, four times a year. The one running now is a declared exhibition and the next one is taking teams. Two states of two different products on one screen would leave the reader working out which figures were simulated.",
        ],
      },
      {
        heading: "The list is the view, and the tree is a second drawing",
        body: [
          "A bracket is the easiest thing in software to make look impressive and the hardest to make useful, so the board does not open on it. The fixtures list is the primary view and the tree sits behind a two segment switch, with the list first.",
          "Three reasons, none of them taste. A screen reader cannot traverse a bracket tree. The sport's own tournament software ships no bracket graphic at all. And the most praised feature of the most studied consumer bracket product is a list of every game.",
          "There is no win probability anywhere on the board either. Nothing has been bowled in this building, so seed difference does the job honestly, carries its own uncertainty and cannot be wrong. Upsets are counted after the fact, against a rule printed beside the count.",
        ],
      },
      {
        heading: "The offer is above the demo, not under it",
        body: [
          "The test this screen is held to is whether a rep can open it and know what to do on Monday. So what is live tonight comes first, and beside it the only three counts on the board a person can act on: slots free in the January field, rosters a seat short, and slots held rather than confirmed. Every one of those belongs to the cup that is taking teams, because nothing about a simulated bracket is actionable.",
          "Enrollment is second rather than fifth for the same reason. It is the only real product on the page. Everything carrying a score is a declared exhibition, while putting a team down for January is something a person can genuinely do today, and burying that under a bracket would be building the demo and hiding the offer.",
          "Two of the six fixture states, a bye and a withdrawal, are modelled and neither has happened. Both stay on the legend at zero rather than being dropped, because a state that exists in the model and not on the screen is a state a reader cannot check.",
        ],
      },
    ],
  },

  {
    path: "/team",
    label: "The floor",
    standfirst:
      "Three seats, one of them filled, and what the two empty ones are not getting worked.",
    sections: [
      {
        heading: "Two of the three seats are empty and the screen says so",
        body: [
          "Three staffed desks would have cost nothing to type and would have looked like a product. It would also have been the only fact on this site a reader cannot check, sitting on the screen that argues the floor is run honestly. The venue has not opened. There is one Sales Manager and there is no team.",
          "So the screen names the cost instead of planning around it. The first line under the title says how many of the trade area's organisations the two empty seats carry between them. The team row carries a figure for organisations carried for a seat nobody sits in, and beside it how many of those have a buying window open with no touch against them. That is the posting's own responsibility read honestly: building a team starts before anybody is hired.",
          "The work in an empty seat's lanes does not stop because nobody has been hired. It falls to the filled seat, which is what covering means on any floor, and every seeded activity line in this prototype belongs to that one seat. The permission to hold a date follows the seat doing the work rather than the lane, because whether a person may hold a date is a fact about what they have been signed off on.",
        ],
      },
      {
        heading: "A seat, not a person",
        body: [
          "No name appears anywhere on this screen and there is nowhere to store one. A seat is an id, a published job title, an ordinal, filled or open, a start date, the lanes it carries and the ramp steps somebody has signed off. Everything else is derived at render: the slice of the board comes from the lanes, the coverage comes from the organisation table and the touch table, the hours come from the activity ledger.",
          "Both titles are published in the Brea posting itself, which names the role as Sales Manager and opens with the words event sales manager. Two of the three seats share the second title, which is exactly why a seat carries an ordinal: two identical titles have to be told apart without anybody being given a name. Every buyer in this application is a title on a published staff directory, and a seat is held to the same rule.",
          "Ramping is deliberately not a third seat state. Whether a seat is ramping is a fact about the clock and the signoff ledger rather than a flag somebody has to remember to change, and a stored flag that disagrees with the dates is worse than no flag at all.",
        ],
      },
      {
        heading: "It names what is not being worked",
        body: [
          "The first block is not a strip of percentages. It is what to do on Monday about a person: an open seat with a count of organisations whose window is open and untouched, a lane with no hour planned into it, a permission withheld because a ramp step is unsigned. Each one names a seat, carries a figure derived from the same tables the desk ranks on, and links to the screen it is done from.",
          "They are ranked by what goes wrong first if nobody does anything. A withheld permission stops work outright. A buying window shuts on somebody else's calendar and cannot be worked later. A lane with no hours in it can be fixed on any day of the period. Carrying two open seats is a standing condition rather than an event, so it ranks last.",
          "Under the seat on screen the untouched organisations are listed by name, with a control that opens each record. A seat reading with no rows under it is a statistic about a person. The rows are the point.",
          "The training half of the posting's responsibility is not rebuilt here. The ramp, the two call frames and the split between what is coached and what is managed are argued on the coaching page, which owns them. What lives here is the part that page cannot carry: an id, a clock and a signature. A ramp with no clock is a curriculum.",
        ],
      },
      {
        heading: "The one permission is enforced rather than warned about",
        body: [
          "A seat not signed off on ramp step five may not set a status to date held, which is the one act on this floor that takes a date off the market before anything is signed. The gate is stated in prose on the coaching page. Stated and nowhere enforced, it would be a paragraph.",
          "So the refusal happens in the reducer that writes the status table, at the one place that table is written, rather than on the three controls that offer the status. This screen prints who holds the permission, who does not, and the date it was granted. It refuses nothing today, because the one filled seat was signed off on 20 August 2026 and covers the whole board, and that is the honest reading rather than a demonstration staged to fail.",
          "The reason the gate is step five and not step one is arithmetic. A held date that cannot physically be delivered becomes a refund, an apology from a general manager, and a school that tells every other school in the district.",
        ],
      },
      {
        heading: "The team goal has no dollar in it",
        body: [
          "The easy team goal is the sum of the seats' revenue. There is none here and there never will be. The individual goal is the leading indicator until the venue opens and collected contract value after it, and the team goal is the sum of the leading indicators only.",
          "It is a real shared goal rather than an arithmetic convenience. Coverage of the in-window population has a denominator set by other organisations' calendars, so two seats covering four fifths of it between them is an outcome neither of them owns alone.",
          "The book is the other ledger. It is managed monthly rather than coached weekly, and the two are never summed on this screen or anywhere else.",
        ],
      },
    ],
  },

  {
    path: "/pay",
    label: "Pay",
    standfirst:
      "What the work is worth, expressed as percentages of the one published number, with the quarter gated on work a person controls.",
    sections: [
      {
        heading: "The live quarter first, the plan after it",
        body: [
          "The test is whether a person knows what to do this week to be paid more, and whether the answer is honest work rather than gaming the measure. So the screen opens on the quarter that is running, the figures in it and the dated actions that would move them. The plan that produces those figures comes afterwards. A compensation page that opens with a plan document has answered a different question.",
          "There was no quarter anywhere in this application before this screen, and the cheap way to get one is a fifth period type. A quarter here is instead a grouping of four consecutive periods that already exist in the data. A grouping cannot disagree with the thing it groups; a fifth value in the period enum eventually would, and the disagreement would surface as a bonus paid on a quarter the period selector has never heard of.",
          "Past the pre-opening calendar the grouping has nothing to group, because Main Event publishes no opening date and this application publishes no trading calendar. Those later quarters keep the same sixteen week rhythm, carry no periods, and say so where they are drawn.",
        ],
      },
      {
        heading: "Every figure is a percentage of the one published number",
        body: [
          "Main Event publishes a salary band and two phrases about variable pay. It publishes no rate, no quota, no threshold, no accelerator and no mechanic, and neither does Dave and Buster's. So every figure on this screen is either that published band or a percentage of it, each percentage carrying the illustrative badge and the sentence that goes with it. Nothing here is a claim about how Main Event pays anybody.",
          "Expressing the plan as percentages is what makes the band control possible. Pick a point in the published band and the whole plan recomputes, because the arithmetic is base independent. A percentage of a published number invents nothing.",
          "The salary sites carry self reported total compensation for these titles. They are not quoted here as a plan, because they report pay levels rather than plan design and they are unverifiable individual submissions. The percentages were shaped instead against a published incentive plan report, and that benchmark is printed in the column beside each proposal so a reader sees both.",
        ],
      },
      {
        heading: "The quota is implied, and the division is on screen",
        body: [
          "Asserting a quarterly quota would have been simpler and it would have been a number that arrived from nowhere. Nobody publishes one for this job.",
          "So the application asserts a rate instead. Fix the commission rate and the commission at plan as a share of base, and the quarterly quota falls out by division. The formula is printed, and the same division is shown at three points in the published band with only the base moving.",
          "The property that makes this worth doing is what happens in an argument. A general manager can disagree with the rate, which is a thing that can be disagreed with, and every quota on the page moves with it.",
        ],
      },
      {
        heading: "The bonus is gated on the leading indicator, and the threshold is below the benchmark",
        body: [
          "The entry gate on the quarterly bonus is the window coverage figure the coaching page already computes, taken over the quarter rather than over one period. Its denominator is set by other organisations' calendars, so it cannot be inflated by working the easiest names on the board. That is the whole argument of the screen: the bonus is earned on work a person controls rather than on a school district's budget cycle.",
          "The threshold sits below the benchmark band, and the departure is named rather than hidden. The best public dataset on actual attainment reports a median well under plan and a large share of sellers below half of quota. A threshold at ninety five per cent of a quota nobody has a history to set is a bonus designed not to pay the median performer, on a book lumpy enough that one large party moves a whole quarter, against a posting whose own words ask for somebody driven by their bonus.",
          "In a trading quarter there is also a contract floor, counted in contracts rather than in dollars, so that one large booking cannot carry a quarter on its own. It is a floor rather than a score: crossing it pays nothing beyond itself, which is what stops the count being worth inflating. Revenue alone rewards chasing one whale, and a scored event count rewards splitting one booking into three.",
          "A pre-opening quarter pays on two leading gates only, half each, all or nothing, and commission runs normally on anything that collects. This is the one place the plan pays for activity rather than for revenue, and the alternative is a person carrying a zero bonus for four consecutive quarters, which is how a venue loses the person the posting describes.",
        ],
      },
      {
        heading: "Nothing celebrates and nothing is projected",
        body: [
          "Other screens in this application mark a cleared board. This one has no cleared board, no mark, no closure treatment and no announcement when a figure moves. A celebration fires when a set empties, and money is not a set that empties. It is an outcome, and a tool that throws a party when a number moves is the first thing a professional switches off.",
          "The only live region is a polite one at the foot of the page. It speaks when a reader moves a control and never when a figure changes on its own.",
          "There is no projection anywhere either. Elapsed days are printed as a count rather than drawn as a pace line, and there is no projected finish, because a contract book of this size moves by one booking and a projected finish is a prediction wearing the clothes of a fact.",
        ],
      },
    ],
  },

  {
    path: "/report",
    label: "The district report",
    standfirst:
      "One period on one page, addressed to a District Sales Manager, and laid out for paper before it is laid out for a screen.",
    sections: [
      {
        heading: "A document rather than a dashboard",
        body: [
          "The posting asks the Sales Manager to partner closely with a District Sales Manager, and until this page existed the application had no upward surface at all. It also had no month: daily was the rings, weekly was the week sheet, and the third word in daily, weekly and monthly had nowhere to live.",
          "A District Sales Manager reads this between two venues, often at the same time as four other venues' versions of it. A dashboard they have to log into and configure is a worse artefact than a page they can print, hold and write on. So everything below the control strip is laid out for paper first, and what appears on a monitor is that layout as it happens to look on a screen.",
          "The write-in rules at the foot follow from the same reading. The last block is filled in on the call rather than afterwards: what changed that the district did not already know, what they are taking away to decide, and who returned it on what date.",
        ],
      },
      {
        heading: "What paper changes about the drawing",
        body: [
          "Three rules, inherited from the week sheet, which already proved this codebase can produce a real printable. No filled panels: every tinted block becomes white with a hairline rule, because a report that lays toner behind a quarter of its own surface costs money and jams a shared office printer. Nothing signalled by colour alone, so the sheet means the same thing out of a mono laser. And nothing breaks across a page that a person reads as one thing, so every row, every ledger and every exception carries the shared avoid-break class.",
          "The disclaimer is a paragraph at the end of the article, so it prints once at the end of the document rather than at the foot of every page. Repeating it would take a running element the print stylesheet does not have. Links lose their printed URL suffix, because a URL after every link is noise in a document somebody is going to write on.",
          "Export is the browser's own print to PDF driven by a stylesheet, not a JavaScript PDF library. For a page this table dense that is a quality decision rather than a shortcut: native print keeps real typography and handles pagination, while a library would reimplement the layout and produce something visibly worse than the screen. It also costs no dependencies.",
          "The print palette is not in the print stylesheet. Paper is neither of the two grounds this application has, so the token layer hands the whole palette the light ground's values under print, and a report exported from the dark theme comes out as ink on paper rather than as near black cards on white.",
        ],
      },
      {
        heading: "The chrome comes off by a body class, not by a shared rule",
        body: [
          "The application's own header, footer and status region have no business on a document addressed to a district manager. The straightforward fix is a rule in the shared print stylesheet, and it is the wrong one: it would fire on every other screen, including the ones that want their header printed.",
          "So this page adds a class to the body for as long as it is mounted and takes it off again on unmount, and the print rules are scoped to that class. The shell's chrome is not this page's to edit.",
          "The breadcrumb band is handled the same way. The shared stylesheet hides the navigation landmark inside it, which would leave an empty tinted strip with a rule under it at the top of the first side. The band is wrapped in the shared no-print class rather than with a selector reaching into another module's stylesheet, which is the mechanism this codebase already has for exactly this.",
        ],
      },
      {
        heading: "The exceptions are the reason it is sent",
        body: [
          "Five fields go up the line: the two ledgers, the board, the held dates with their release dates, the losses with their reasons, and the exceptions the venue wants a decision on. The last of those is the difference between partnering with a District Sales Manager and reporting to one.",
          "A weekly page with no ask in it is a status update, and a manager receiving five status updates a week reads none of them. So every exception names what is true, the decision being asked for, and the date the answer is wanted by, and every one of those dates comes off the row itself rather than out of the air. Each one is followed by a ruled line for the decision and who made it.",
          "The same principle decides what is left off. Enquiries answered inside the response commitment are a single count at the foot rather than nine rows of good news, because a page read on a phone between two venues spends its space on what is unresolved.",
        ],
      },
      {
        heading: "What this page refuses to do",
        body: [
          "It never adds the two ledgers together. Booked revenue carries money and outbound activity carries hours with no revenue field on it at all, and they live in separate arrays for this exact reason: a pre-opening report is where hours quietly get dressed up as results. The only place they touch is one printed ratio of outside hours per thousand dollars booked, which starts terrible in every pre-opening book because the first contracts cost the most work.",
          "It never puts a contract figure pro rata, because a signature is an event and not a rate. The leading ledger is paced against a straight line across elapsed working days, and the mark is labelled as where a straight line would put you today rather than as a target. The lagging ledger is paced against the previous band instead.",
          "It prints no projected finish at any elapsed day, only the run rate the rest of the period would need, and it prints nothing at all until the period has enough of itself behind it. A tool that says it is too early to say on the second of the month earns more trust than any figure it could have shown instead.",
          "There is no same period last year anywhere in this model and there cannot be one, because the building has not opened. Every pace figure in the hospitality literature is defined against a prior year this venue does not have, so the comparison is drawn against the previous band and labelled as that.",
          "And it names no person. The recipient is a role, the author is a seat with an ordinal, and nothing on the page could be mistaken for either. Nothing here celebrates anything either: a report is not a set that empties, and the one live region speaks when a reader moves the clock and at no other time.",
        ],
      },
    ],
  },
];
