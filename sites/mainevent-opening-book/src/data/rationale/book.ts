import type { ScreenRationale } from "./types";

export const BOOK_RATIONALE: ScreenRationale[] = [
  {
    path: "/book",
    label: "Book",
    standfirst:
      "Signed contracts on the left, hours outside the building on the right, and no figure anywhere on the page that adds the two together.",
    sections: [
      {
        heading: "Two columns because a thin month has two different causes",
        body: [
          "Signed revenue is contracts with a name on them. That money exists. Outbound hours is tabling, go-sees, calls and appointments set. That work was done. Add the two together and the result sounds like progress and measures nothing, because half of it is money and half of it is effort.",
          "The reason a general manager should want them apart is what happens on a thin month. A thin revenue month with heavy hours behind it is a timing problem: the work went out, the trade area has not answered yet, and the response is patience plus a harder look at which lanes got the hours. A thin revenue month with no hours behind it is a management problem: nobody went out, and the response is a conversation on Monday morning. In a blended pipeline number those two months look identical. They need opposite answers.",
          "Blending is also how a quarter goes wrong quietly. Effort counted as revenue makes September look healthy, so nothing gets changed, and December lands short because there was never any money in the figure. Two columns with a divider between them means the bad news arrives in September, when it is still cheap to fix.",
        ],
      },
      {
        heading: "An activity line has no money field, and that absence is on purpose",
        body: [
          "There is nowhere on an activity line to write a dollar. Not a field left blank: no field at all. A pre-opening pipeline is exactly the place where hours out of the building get dressed up as results, because for twelve weeks activity is the only thing there is to report.",
          "So the hours are reported, and they are reported as hours. Twelve tabling shifts is twelve tabling shifts. If one of them turned into a booking, that booking is in the other column with an organisation and a price against it. Nothing on the activity side is allowed to look like money, however good the week was.",
        ],
      },
      {
        heading: "What the calendar has already decided, and what is still winnable",
        body: [
          "A corporate holiday catering playbook sets the season out month by month: large companies begin vendor research in July and August, shortlists are finalised from September to early October, and what is left in October and November is smaller, last-minute bookings. That is a playbook written by people who sell into the cycle rather than a measurement, and it is read here as one.",
          "Read against that season, a thin month four weeks out is already written. The decisions that would have filled it were taken by buyers who have moved on, and no amount of calling this week moves that number. A thin quarter is a different situation and it is still winnable, because most of the decisions that fill it have not been made yet. The two answers are patience and panic, and picking the wrong one costs a season.",
          "That is the whole case for keeping hours visible beside revenue rather than inside it. Hours worked today were never going to be this month's number. They are the reason next quarter has one. A page that folds them into revenue loses the ability to tell a general manager which of those two things is actually going wrong.",
        ],
      },
      {
        heading: "Two ledgers that are never added together",
        body: [
          "A pre-opening venue has no client base, no walk-in traffic and no history to mine. For twelve weeks the only thing there is to report is work: tables set up in office lobbies, mixers attended, front desks walked into. That is precisely the situation in which activity gets quietly dressed up as results, because four hundred calls is a bigger number than two contracts, and the first one is always available while the second one has to be earned.",
          "So the two things live in two columns with a divider between them. Booked revenue carries money. Outbound activity carries hours and no money at all, because an activity line has no revenue field to put any in. There are two totals functions and neither will accept the other's rows, which is a compiler rule standing in for a management rule.",
          "The specific dishonesty that prevents: a generic CRM lets a rep attach an estimated value to an activity and roll it into a pipeline total. Twelve tabling shifts at a notional two thousand dollars each becomes a twenty four thousand dollar pipeline in a slide, and not one dollar of it has been agreed by anybody. A general manager reads that number as money in progress, plans against it, and finds out in week one that it described a car park and a folding table. Here, twelve tabling shifts is twelve tabling shifts and a count of hours. If one of them turned into a booking there is a signed line in the other ledger, and that is where the dollars are.",
        ],
      },
      {
        heading: "A ratio is the only figure allowed to cross",
        body: [
          "The two columns do have a relationship and refusing to state it would be its own kind of evasion. The figure at the foot of the page is hours outside the building per thousand dollars booked. A ratio compares them without ever adding them, which is the only honest relationship the two ledgers have.",
          "It starts terrible, and it is supposed to. The first bookings in a trade area nobody has worked cost the most hours, and the number improves as referral partners begin sending people rather than being found. With nothing booked the ratio is shown as absent rather than as a large number, because hours divided by zero dollars is not a big figure, it is not a figure.",
        ],
      },
      {
        heading: "Saying how much of the book rests on a price somebody typed",
        body: [
          "Main Event publishes a price for every self-serve product and no price at all for any corporate or group package. Those pages say to ring the local sales manager. So half of any real pre-opening book is quoted by a person rather than read off a page, and every pipeline report in the world shows the total and hides that split.",
          "This one gives the split a panel of its own, with the share written out in words. Of the two seeded contracts, the Heights Christian voucher block is arithmetic anybody can check against the published $19.95, and the Team Kwon line is $24 a head that a person typed, because Bowl 'n Fun is gated. The bar is built from the provenance of each price rather than from a two-way published-or-typed shorthand, so a book that later carries a modeled or an observed price shows that honestly instead of being filed under whichever of the two buckets happens to exist today.",
          "The book is two contracts, and that is the honest number rather than a thin one. Eleven would have made a better screenshot and would have described a situation nobody has ever been in. Guests is the one editable field on the page, and changing it moves the contract value, the deposit, the guest total, the typed-price share and the ratio at the bottom together, because every figure here is a selector over the two arrays and nothing downstream is stored.",
        ],
      },
      {
        heading: "Outside the building is counted apart from work",
        body: [
          "The activity column reports two hour figures, not one: hours of all work, and hours outside the building. The job posting's first daily responsibility is outbound activity outside the building, naming tabling, networking events and go-sees, and those are the shifts the second figure counts.",
          "A call block from a desk is real outbound work, it is counted, and it is not counted as outside. Neither is a venue tour, because a tour happens at the building rather than out in the trade area. The reason for drawing the line there rather than anywhere flattering: a week that hits its hours target from a chair has not done the thing the posting asked for.",
        ],
      },
      {
        heading: "Lane hours that deliberately exceed the week",
        body: [
          "The nine bars at the foot of the page sum to more than the hours actually planned, and the panel says so on screen: sixty lane-hours against thirty one hours worked. A chamber mixer is three hours worked against corporate, auto and finance, healthcare and hospitality at once, so it counts once in the hours total and four times here. This is attention per lane, not a division of the week, and a chart that quietly normalised it to a hundred per cent would be describing a plan nobody wrote.",
          "It earns the space because a week can hit its hours target and still have a hole in it. A total cannot show a lane with nothing against it. Nine bars can, in about a second, and in the seeded plan the empty one is local retail and food. The threshold for thin is a fifth of the busiest lane, which is this application's own line and nobody else's, so it is printed on the panel rather than hidden in the code: a reader who cannot see where a line was drawn has no way to disagree with it.",
        ],
      },
    ],
  },

  {
    path: "/book/week",
    label: "Week sheet",
    standfirst:
      "One week of the outbound ledger, laid out to be printed and carried into a lobby.",
    sections: [
      {
        heading: "A week planned in hours, not in intentions",
        body: [
          "An intention has no unit. Work the healthcare lane is an intention. Three hours on the E Imperial Hwy dental and medical corridor in a named week, eight target conversations, three named organisations with addresses on the paper, is a plan. One of those can be checked on Friday and the other cannot.",
          "Every line on this sheet is hours against a place, a lane and a target number of conversations. That is what makes a week arguable before it is worked. A general manager can read Monday's sheet and say the corporate lane has nothing in it, or that four of these hours are at a desk, and move them while it still costs nothing. Nobody can do that to a list of good intentions.",
          "Hours also survive a bad week. A shift that produced no booking still happened, and it is still the reason a lane got touched at all. Revenue cannot say that, which is why the hours have a ledger of their own rather than a footnote under the money.",
        ],
      },
      {
        heading: "Printed on Monday, and on Friday it either carries completions or it does not",
        body: [
          "The job asks for progress reported against daily, weekly and monthly goals. This sheet is the weekly one, and it is deliberately a physical object. It leaves on Monday with hours planned on it. It comes back with pen on it, or it comes back clean.",
          "A sheet that comes back clean is itself an answer, and a quiet one that nobody has to accuse anybody to get. In the seeded plan exactly one shift carries a completion: the Brea Olinda High School go-see, marked done the day after it was planned. The other nine carry none, and the sheet shows that rather than averaging it away into a percentage that reads as fine.",
          "This is also the only reporting rhythm that works before a venue opens. There is no takings figure to review on a Friday. There is a plan, and there is what was done against it, and the gap between the two is the entire management conversation for twelve weeks.",
        ],
      },
      {
        heading: "Busy is not a unit",
        body: [
          "A week can be full and still be a bad week. Forty hours of anything is forty hours. The question a general manager actually has is how many of them were spent in front of somebody who can sign something.",
          "So the sheet counts hours outside the building separately from hours worked, and it names the organisation against every shift. A call block from a desk is real work and is counted, and it is not counted as outside. A week that reaches its hours target from a chair has been busy and has not done the thing the job describes first.",
        ],
      },
      {
        heading: "Built for the printer first and the screen second",
        body: [
          "Everything else here is software. This is a document. Outside the building is a school reception at 8am, a dealership floor, a clinic corridor and a chamber mixer, and nobody opens a laptop in any of those places. They carry a sheet of paper, they write on it with a pen, and they type it up afterwards if they type it up at all.",
          "The difference is not cosmetic. A screen can afford a panel the reader might scroll past. A printed sheet cannot, because there is no second page to go and fetch. That is why the objection answers are printed in full rather than linked, why every named organisation carries its address and phone number rather than an id, and why there is a ruled blank line under each one. A form a person fills in with a pen is a design decision, not a fallback.",
          "The page-break rules were made the other way first. A forced break before the objections reads well in the abstract and on real paper it left a third of a side blank and added a sheet, so it was taken out. What must never split is a single organisation, because half an address at the foot of a page is worse than no address, and that is the unit the break rules protect.",
        ],
      },
      {
        heading: "No revenue figure anywhere on the sheet",
        body: [
          "Not one. This is the outbound ledger printed, and an activity line has no revenue field to put a dollar in.",
          "A week sheet with a running total on it is the exact document where hours out of the building get quietly dressed up as results. The two ledgers live in separate arrays precisely so this page cannot do it by accident, and the sub-heading on screen says so and links to the Book where both columns are visible at once.",
        ],
      },
      {
        heading: "Named organisations, ranked by a rule that changes with the work",
        body: [
          "The plan says \"Brea dental and medical corridor, E Imperial Hwy\" and eight target conversations. Standing on E Imperial Hwy, that is not a plan, it is a street. So the sheet names organisations against every shift.",
          "The ranking rule is different for each kind of work, which is the whole reason it is declared rather than sorting everything by size. An organisation that publishes no email address is the worst prospect for an email sequence and the best one for a go-see, because turning up is the only route into it. The call list carries only organisations that publish a phone number. The write list excludes the ones with no written door. The rule is printed beside the names, because a list somebody cannot interrogate is a list they are being asked to take on faith.",
          "The lists are built for the whole week in one pass rather than per shift, so an organisation named on Tuesday is not offered again on Thursday. Doing it per block would have been less code and would have produced a sheet that sends a rep through the same reception twice in a week. An organisation the plan itself named is exempt, because a second visit somebody wrote down on purpose is a decision, not a duplicate.",
        ],
      },
      {
        heading: "Three objections, scored rather than chosen",
        body: [
          "The score is arithmetic anybody can repeat: every planned hour this week whose lane raises the objection, plus two for a structural objection and one for a high one. The bonus exists because the complaint that the website will not say what it costs is true of every conversation in every lane until somebody publishes a price, so it outranks a lane-specific objection covering the same hours.",
          "The alternative was to print all seven. Seven objections with their answers is three sides of paper and a rep who reads none of them. Three is what fits beside the plan they are actually working, and the hours behind each one are printed next to it so the choice can be argued with.",
          "The paragraph conceding why the customer is right is on screen only. That concession is the part of the method that actually works, and it is also the part a rep has to have understood before they are standing in the lobby. On paper the space goes to the answer, because the answer is the thing you glance down at with somebody watching.",
        ],
      },
      {
        heading: "The countdown is in weeks, because no date is published",
        body: [
          "Main Event publishes no opening date and no hours for Brea. The weeks-to-open figure on the masthead is this plan's own numbering, badged illustrative, and the sheet says so in words every week in the place the eye lands first.",
          "A rep who is asked when the venue opens in a school reception and guesses has created a problem no discount fixes. So the sentence on the paper is the true answer: the date is not published yet, and the ask is a place in line rather than a deposit.",
        ],
      },
    ],
  },

  {
    path: "/book/accounts",
    label: "Accounts",
    standfirst:
      "The customer after the signature, and the date the next ask is actually due.",
    sections: [
      {
        heading: "The next booking is won in the fortnight after the event, not in the pitch",
        body: [
          "The signature is the middle of the sale, not the end of it. What decides whether an organisation comes back is the run of small things around the night itself: the confirm the day before, being there when they arrive, the debrief the day after, the review ask a week later and the next date asked for a fortnight later.",
          "That is why those obligations carry dates rather than descriptions. Ask for the next placement with no day attached and it becomes a thing everybody agrees is important and nobody does, because there is always a fresh lead sitting in front of it. Plus fourteen is a day in the diary, and it falls while the customer still remembers how the night went.",
          "The job asks by name for retaining an existing client base and earning year-over-year business. Almost all of that work sits inside this window, and it is the cheapest selling anybody on this desk will ever do.",
        ],
      },
      {
        heading: "A customer with a date next year beats a new logo",
        body: [
          "A new organisation in this trade area costs hours: a table in a lobby, a go-see, three touches before anybody answers at all. The ratio at the foot of the Book exists to say how many. A customer who has already run an event here costs a phone call to somebody who knows the building, knows what it cost them and knows whether their people enjoyed it.",
          "The repeat is also the better forecast. Headcount is known rather than modeled, the price was agreed once already, and the date hangs off an occasion the organisation was going to run anyway. A new logo is a guess about all three at once. One booked account with a date next year is worth more to a general manager's December than three names nobody has spoken to.",
          "So the board is drawn around the next date rather than around last year's spend. Money already taken is a report on the past. A named occasion with a window opening on a stated day is something a person can work on Tuesday.",
        ],
      },
      {
        heading: "The loss that never appears as a loss",
        body: [
          "Nobody rings to cancel a repeat booking. The window opens, the decision gets made somewhere else, and the account simply goes quiet. There is no lost line to count and no objection to record, which is why churn in group sales is normally noticed a year late, when the December that used to be full is not.",
          "So the closing of a window is treated as the event worth watching. The first case is already on the board: Heights Christian's December programme window closes six days before the 20 November event they have bought. Run the event first and then ask for the next one, which is the natural order of work, and the December programme was lost before the first guest walked in.",
        ],
      },
      {
        heading: "An occasion, not an anniversary",
        body: [
          "The obvious model is an anniversary: they bought in November, ask them again next November. It is wrong for both of this venue's accounts on day one, before anybody has made a mistake. Heights Christian's buying window names a Christmas programme week, an end of year and a summer programme. Team Kwon's names June and December. Neither organisation is annual, and an anniversary would produce a date that appears on nobody's calendar.",
          "So the unit of rebooking is the occasion: a named thing an organisation does at a time of year, in the buyer's own words. An occasion recurs, a window opens a segment-specific lead time before it, the window closes when the decision is made with or without us, and a window that closes empty is the churn event.",
          "The parser that reads those windows is deliberately narrow, because it is the place this board could most easily start lying. An occasion is only read where a clause opens with a month, so \"their Nov-Dec being peak trading\" is recorded as ignored rather than read as two occasions. The cost is the opposite error, an occasion buried mid sentence that gets walked past, and that is the right way round: a missed occasion is a row that does not appear, and an invented one is a rep ringing a stranger about a party that was never in the diary.",
          "What that model finds on the first render is worth the whole screen. Heights Christian's December programme window closes six days before the 20 November event they have already bought, so the natural order of work, run the event and then ask for the next one, has already lost the December programme before it starts. Two dates and a subtraction.",
        ],
      },
      {
        heading: "Three figures that are honestly not measurable",
        body: [
          "Four figures sit at the top of this board and three of them have a denominator of zero. No window has closed, so there is no rebooking rate. No event has been delivered, so there is no events per account figure. No account has a prior twelve months to be compared against, so there is no revenue retained. The fourth is measured and reads two of two: both accounts are on cycle.",
          "They are modeled as a discriminated union rather than as a nullable number, because a nullable number invites a fallback to zero somewhere downstream, and a rebooking rate of nought per cent on the day the board opens is a lie with a percentage sign on it. Nought per cent would mean every window was missed, which is a much worse claim than the truth. The screen narrows on the union and prints the word, the reason, and the date the figure first has a denominator. Never a dash, never a NaN.",
        ],
      },
      {
        heading: "Retained revenue is not a third ledger",
        body: [
          "The money on this board is the same signed contract money the Book already counts, seen down a second axis. It is not a new pile.",
          "The page says so where the figure is rather than in a footnote, because an account that appeared to add money to the book simply by being looked at from the side would quietly break the one rule the whole application is built on.",
        ],
      },
      {
        heading: "Obligations the board shows and is not allowed to tick",
        body: [
          "Each event carries five dated obligations, taken from Oracle OPERA's activity trace definition, which is the only product in this category that built the clock rather than a copy button: an anchor date, a signed offset in days, a purpose and an owner. Confirm sits at minus one day, host at arrival at zero, debrief at plus one, the review ask at plus seven and the next placement at plus fourteen.",
          "Confirm belongs to operations, so this board shows it and cannot tick it. Two systems owning one task is how both of them drop it, and a sales tool that lets a sales manager mark an operational check as done is exactly that failure with a tick box on it.",
          "Every offset carries its reason on the row. Plus seven for the review ask is not a round number: people asked while the night is still recent leave reviews, and readers weight recent ones, so a review harvested six weeks late is worth materially less.",
        ],
      },
      {
        heading: "What is deliberately absent, and the clock that stands in for it",
        body: [
          "A retention board wants a back catalogue: three years of repeat bookings, a couple of lapsed accounts to win back, a lifetime value column with four figures in it. Every one of those would be invented, and Main Event Brea is publicly not open, so a populated retention board is a lie an interviewer can catch by opening a browser.",
          "So there are two accounts, they are the two signed contracts on the Book, and neither event has happened. Lifetime value, events delivered, a satisfaction score and a debrief sentence are all readings taken off events, so none of them is on the record and all of them appear the moment an event has been delivered. There is no standing negotiated rate on either account, because neither organisation has been offered one and attaching a term to make a record look complete would be inventing a commercial fact. There is no stored last contact date either, because it is derived from the conversation log, and a second copy is how two files end up disagreeing about when somebody was last spoken to.",
          "The scenario clock at the top is the alternative to seeding all of that. Every date on the board is arithmetic against an injected as-of date, so one control moves the day and the same code produces the delivered state, the open window, the missed window and the lapsed account a year out. It adds no record and invents no figure, and it is drawn as chrome so nobody mistakes it for a filter over the rows.",
        ],
      },
    ],
  },

  {
    path: "/calendar",
    label: "Dates and capacity",
    standfirst:
      "What will actually fit on a date, measured in bowling lanes rather than in optimism.",
    sections: [
      {
        heading: "Dates held and not signed are the most dangerous number in the building",
        body: [
          "Five dates are held against no deposit. Each one blocks an evening in a venue that is not open yet, and not one of them is worth a dollar. It is the only status in this application that costs the venue something while returning nothing.",
          "The danger is that it feels like progress. A held date reads like a booking in a Monday meeting, sits in the same sentence as the signed ones, and converts at a rate nobody has measured. Meanwhile the evening is off the market. If a larger group asks for it, the answer is no, and that no was given away for a date somebody has not signed.",
          "A held date with no release date on it is worse again. That is a date quietly taken off the market by your own side, and it never shows up as a loss because nothing was ever signed to lose. The offer here has the release built into it: the date converts on Main Event's published terms the day an opening date is announced, or it releases and the customer owes nothing. Either way somebody finds out, on a date, rather than in June.",
        ],
      },
      {
        heading: "Capacity has to be real before anybody promises a date",
        body: [
          "One lane per twenty guests is published in the package inclusions. The Brea page says more than 26 lanes, so every figure here computes against 26 and understates the building on purpose. Twenty guests a lane against a floor of 26 lanes is 520 guests bowling at one time.",
          "That multiplication belongs before the phone call, not after it. A 300 guest Corporate All Access Pass takes fifteen lanes, which is 58 per cent of the floor for one booking. Two of those on the same evening is the entire building. Anybody who has not had those numbers side by side will say yes to both, and then somebody has to ring one of them back and explain.",
          "Before the doors open, the promise is the product. Nothing has been built, nothing has been walked, and the only thing the customer is buying is that the date will be there and will fit them when they arrive. A capacity figure that turned out to be optimistic is not a reporting error at that point. It is a party standing in a car park.",
        ],
      },
      {
        heading: "October is when a held date has to become a yes or a released evening",
        body: [
          "A corporate holiday catering playbook puts vendor research in July and August, shortlists finalised from September to early October, and what is left in October and November as smaller, last-minute bookings. It is a playbook rather than a measurement, and it is read here as one.",
          "That gives the held list a deadline of its own, and it is not the event date. A hold still unsigned at the end of October is not waiting, it is drifting, because the weeks in which that decision normally gets made have gone. The October job on this screen is not more tabling. It is turning five held dates into signatures or into evenings the venue can sell to somebody else.",
        ],
      },
      {
        heading: "Two published figures and one judgement, declared at the top",
        body: [
          "One lane per twenty guests is printed in the inclusions list of the All Access Pass, the MVP package and Level Up. More than 26 lanes is printed on the Brea location page. Nobody has to be persuaded of either.",
          "The Brea page gives no count, only that hedge, and the hedge is load-bearing so it is kept. Everything on this screen computes against the published floor of 26, which means every figure understates the building and not one of them can oversell it. That decision is the first thing a reader meets rather than a footnote, because a capacity chart whose assumptions are hidden is one nobody can argue with, and the point of this one is that it can be checked against mainevent.com in fifteen seconds.",
        ],
      },
      {
        heading: "The physical constraint is the whole argument",
        body: [
          "Lanes are the binding thing, not floor space. Twenty guests to a lane, times a floor of 26 lanes, is 520 guests bowling at one time. The consequence is invisible until somebody does the multiplication, which is exactly why it earns a screen rather than a tooltip: a 300-guest Corporate All Access Pass, at the maximum Main Event publishes for that package, consumes fifteen lanes. That is 58 per cent of the floor for one booking. Two of them on the same evening is the building, and the second group asking has to be told no.",
          "520 and the published buyout maximum of 800 or more are both true and they measure different things. Quote 520 as the capacity of the venue and you have undersold it by most of a school. Quote 800 as a bowling number and you have oversold the lanes by fourteen of them. Both mistakes are made on the phone, in the first thirty seconds, by somebody who has never had the two figures side by side.",
          "Not every signed line eats a lane, and the page says which. Play It Forward is a voucher block rather than a reserved party, and Main Event states plainly that there are no lane reservations against it: groups turn up and use sessions as they are available. Recording three lanes there would have overstated committed capacity by three lanes, which is the quiet sort of error that makes a capacity chart useless.",
        ],
      },
      {
        heading: "A held date is a blocked evening that is worth nothing",
        body: [
          "The chart above reads signed contracts only, so a date somebody is sitting on with nothing countersigned consumes no lane in any figure on it. In the building it absolutely blocks the evening. Both of those are true at once, which is why held dates are listed underneath by name and date rather than folded quietly into how full a date looks.",
          "Leaving it unsaid would be the quiet kind of wrong: the reader would see an empty June and have no way to know a school is sitting on the twelfth of it. A hold is drawn amber everywhere in this application for the same reason, because it is worth nothing until it converts and it blocks the date meanwhile.",
          "The release is the term that makes a hold safe to give. The pre-opening offer is a date held without a deposit that converts on Main Event's published terms the day an opening date is announced, or releases and the customer owes nothing. A hold with no release attached is the same blocked evening with nothing to end it: it costs the venue an evening for as long as somebody forgets about it, and it never appears as a loss because nothing was ever signed to lose.",
        ],
      },
      {
        heading: "The month grid that was not built",
        body: [
          "The obvious build for this is twelve little calendars with dates shaded by how full they are. It was rejected for two reasons.",
          "Main Event has published no opening date for Brea, so eleven of those twelve months would be squares nobody can sell into. And a grid shaded by fullness is the exact chart that has to signal by colour alone. The list carries the same information with the figures written on it, and it degrades to a printout on a general manager's desk.",
          "That is why every bar on this screen carries its own number, its own glyph and its own word underneath. A bar with no figure on it would be asking the reader to take the multiplication on trust, which is the one thing this screen exists not to do. Where a package wants more lanes than Brea publishes, the bar runs past a labelled rule at 26 rather than being clipped or rescaled, because clipping hides the most useful fact in the row.",
        ],
      },
      {
        heading: "The stress test, labelled as one on the page",
        body: [
          "The last block takes every live conversation and converts them all at the midpoint of their modeled headcount range. That will not happen and it is not supposed to. It is a load test on the calendar: if the whole pipeline landed, would it need a bigger building or a wider spread of dates? Those are different problems with different answers, and only one of them is anybody's to solve.",
          "Signed bookings are excluded from it deliberately. A contract already sits in the dates above with its lanes counted, and adding it here as well would charge the calendar twice for the same party, which is the classic way a stress test ends up describing a busier venue than the one that exists.",
          "It is drawn as whole evenings rather than as one long bar, because one bar 121 lanes long against a floor of 26 looks like a building several times too small, when what the number actually describes is five evenings, four full and one part full. That is a spread problem, not a size one. With no live conversations the figure is shown as absent rather than as zero pressure, because zero pressure sounds like good news and an empty pipeline is not.",
        ],
      },
    ],
  },
];
