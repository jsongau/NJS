import type { ScreenRationale } from "./types";

export const BOARD_RATIONALE: ScreenRationale[] = [
  {
    path: "/",
    label: "Desk",
    standfirst:
      "The front door: who to contact today, and why that one rather than any of the others in the trade area.",
    sections: [
      {
        heading: "The page selling Brea was describing Arizona",
        body: [
          "Main Event's own Brea location page was running Tempe, Arizona body copy. It described a venue \"off I 10 and Warner Road\", put it \"20 minutes from downtown Phoenix\", and invited the reader to \"take a break from the desert heat\". Brea is in north Orange County. The building at 245 W Birch St is the former Regal cinema, approved in May 2025, and it is not open yet. An office manager in Fullerton reading that page was being asked to book a party in a state she does not live in.",
          "The enquiry form on that page captured nine fields. Not one of them was the event date, the headcount or the event type. Those three are the only things that have to exist before a quote can exist. Everything else the form collected is a way to ring somebody back and ask for them.",
          "That is the argument for putting a person in this job. A form that does not ask the date cannot qualify anybody, and a page that names the wrong desert cannot sell a room. What follows on this screen is what one person does about that between now and opening: a named list, in the order a week can actually work it, with the reason for each name written on the row.",
        ],
      },
      {
        heading: "A booked group is a room full of first time guests with a purchase order attached",
        body: [
          "Dave and Buster's states in its own 10-K that special events matter because a significant percentage of the attendees are first time guests, and puts special events at 9.8 per cent of revenue in FY2018. That is two returns on one invoice. The party pays on the day, and the people in the room who had never been inside the building are the reason a general manager cares about the category in November.",
          "A venue that has not opened has no regulars at all. Every group booked before the doors open is the first visit of everybody on that guest list, and somebody else signs for it. There is no cheaper introduction available to a new building, and it is the case for working this board hard in the months before there is a floor to walk.",
          "Nothing here forecasts what those first visits are worth later. Main Event publishes no such figure and this application does not invent one. The claim is only that a group booking earns twice, and that the second earning never appears on the contract, so a desk that is judged on contracts alone will under-work the thing that fills the building.",
        ],
      },
      {
        heading: "The trade area is 211 records, not an adjective",
        body: [
          "Anybody can say there is business in north Orange County. This board holds 211 organisations across nine lanes and nine cities: 112 in Brea, 52 in Fullerton, 18 in Placentia, nine in La Habra, seven in Yorba Linda, six in Buena Park, five in Anaheim, one in La Mirada and one in La Habra Heights. Each one is a row with an address, a lane and a door.",
          "The doors were counted rather than assumed. 93 have a named contact with a published source URL. 50 have a contact form and nothing else. 68 have no email door at all. That last group is the finding rather than the gap: they cannot be worked by writing, so they are worked by walking in, and the plan for them is a route and a time of day rather than a template.",
          "54 of the 211 are calendar-locked and 157 are discretionary. That split decides the month more than the industry does. A graduating class already has a date and is only choosing a venue. A discretionary buyer has no event at all and is being asked to create one, which is a different call made to a different person in a different season.",
          "Every figure on this screen carries its provenance class: public, observed, modeled, illustrative or withheld. The research behind the build also carries a 38 item list of things that could not be verified, and the opening date and every drive time are on that list. A board that states what it does not know is a board a general manager can plan against.",
        ],
      },
      {
        heading: "The order is what a week can actually reach",
        body: [
          "A week holds a fixed number of calls and this desk is one person. The expensive mistake is not picking the wrong industry. It is spending Tuesday on the largest name on the board and finding out on Thursday that there was never a written way in. So the order asks four questions in this sequence: can I reach them, does their event already exist, is the window open now, and only then how many people are coming.",
          "Headcount is last because it is the softest thing on the row. Every headcount here is a modeled range and none of them is a measurement, while a published email address read off the organisation's own page is a fact somebody can check. Sorting a week by the weakest number on the row is how a list of big unreachable names outranks the school two miles away that answers its phone.",
          "The season says the same thing. Executive assistants and HR start researching holiday venues in July and August, decisions land August to early October, and October is the highest inquiry month. Median booking to event is 36 days and 48 per cent lock inside 30 days. A smaller buyer whose window is open now beats a larger one whose window opens in March, because by March somebody else has already been in the room.",
        ],
      },
      {
        heading: "The order is the product, so reachability outranks size",
        body: [
          "A pre-opening trade area holds a hundred-odd organisations and one person working them. Sorting alphabetically, by distance, or by Google rating all produce a list that looks organised and wastes the week, so none of those is the sort here. The ranking lives in domain/selectors/desk.ts and weighs four things in a fixed order: can I reach them at all, does their event exist without me, is the buying window open, and only then how big it is.",
          "The weights say the same thing in numbers. A published email address that was read off the organisation's own page is worth 40 points, a contact form 15, and no written door at all 8, because a written touch costs two minutes and a go-see costs an hour of the week. A calendar-locked lane scores 25 against a discretionary lane's 8, since a graduating class graduates whether or not anyone calls and only the venue is in question. A window inside the next four months is 20 against 4.",
          "Size is last and capped at 15 points, which is the decision most likely to be argued with. Headcount is the figure everybody sorts by and it is the softest thing on the row: every headcount in this data set is a modeled range rather than a measurement, so a criterion built on it is not allowed to outweigh one built on a published address. There is also a penalty rather than only rewards. Three touches or more takes 10 points off, because a fifth email is a spam complaint and that row wants a visit or a rest.",
        ],
      },
      {
        heading: "Every row can open its own score",
        body: [
          "A ranking a reader cannot interrogate is a ranking they are being asked to take on faith. So each row expands into a table of its components, the points each one carried, and a sentence saying what that component is actually measuring. It is the most persuasive thing on the page and it would also be the most embarrassing thing to show if the ranking were arbitrary, which is the reason it is there.",
          "The bars beside the points are drawn against a fixed ceiling, MAX_COMPONENT_POINTS, which is 40: the largest single component the scorer can award. Normalising each bar to the biggest component on its own row would look tidier and would make two rows impossible to compare, which defeats the point of drawing bars at all. The bars are also marked aria-hidden, because the signed number carries the value and the sign carries the direction, so the bar can be lost entirely without losing meaning.",
          "The foot of the table names the file the arithmetic came from and states that no part of the order is stored. Booked and lost rows say something different there: they sort to the bottom whatever they score, because a desk that keeps showing you the party you already sold is a desk people stop reading.",
        ],
      },
      {
        heading: "The month comes from the period selector, not the clock",
        body: [
          "Whether a buying window is open is the third heaviest criterion, and it needs a now. Reading the system clock would mean the board ranks differently depending on the month somebody happens to open the portfolio, and a screenshot taken in March would not match the screen a reader sees in September. The period selector in the chrome is a real control with a real meaning, so nowMonth is derived from period.startDate instead. That makes the ranking reproducible and gives the selector something visible to do.",
          "The month is cut off the ISO string with slice rather than parsed through a Date. A date string like the start of a period is parsed as UTC midnight, which shifts a day backwards anywhere west of Greenwich, and Brea is west of Greenwich. A period starting in September would have been read as August.",
          "One value on the page does belong to the real clock, and only one. TODAY is the date stamped on a recorded touch, and it is read once at module load rather than on each click, so a page left open across an afternoon cannot stamp two touches in two different ways.",
        ],
      },
      {
        heading: "Advancing a row stops at a held date",
        body: [
          "The advance button walks a row along the pitch statuses, and nextStatus deliberately refuses to hand back booked or lost. The step from a held date to a booking is a signature and a deposit, and the money lives in BookProvider, where a booking cannot exist without a line to carry it.",
          "Letting the desk mark something booked would put a contract in the pipeline with no revenue attached to it, which is the single failure the two-ledger model exists to prevent. So the button disables itself, renames itself to point at the Book page, and its tooltip says why rather than leaving a dead control on the row.",
        ],
      },
      {
        heading: "The figures above the board narrow, the ones below it do not",
        body: [
          "The strip of five standing figures used to sit above the filters, and three of the five counted the whole trade area rather than the filtered board. Choosing Schools left the top of the screen reading one set of totals while the rows underneath showed a much smaller set. The figures were true and they were in the position a reader looks to for the consequence of the thing they just pressed.",
          "The strip did not change; it moved under the rows it describes. The position above the board now belongs to the working set lead, whose four figures are computed off lines, the same array the board draws, so they cannot disagree with what is on screen. The count is a polite live region, because typing in the search box or toggling a lane changes that sentence and nothing else on the screen announces it.",
          "The prose in the header had the same class of bug in a different form. The totals used to be written out as words, so when a ninth lane landed and a research pass grew the board, the first sentence on the front door disagreed with the stat card directly beneath it. Reading the length of the array removes the class of bug rather than this instance of it.",
          "One honest limitation, written down rather than left to be discovered: the lane filter is state in PipelineProvider and not a URL parameter. That is what lets the rail, the desk, the map and the packages board narrow together in the same render, and it is also why the filter does not survive a reload and cannot be shared in a link.",
        ],
      },
    ],
  },
  {
    path: "/today",
    label: "Today",
    standfirst:
      "The one screen that answers what to do next, across both halves of the job, and shows its working.",
    sections: [
      {
        heading: "What a sales manager is on the hook for at eight on a Monday",
        body: [
          "Somebody sent an enquiry over the weekend and the clock on it is already running. A held date has no deposit against it. A grad night window opened this month at a school nobody has ever written to. None of that arrives as a calendar invitation, and all of it is somebody's fault by Friday. This screen answers the only question worth asking at that hour, which is what to do next.",
          "So one piece of work sits at the top at the size of a headline, with its clock, its organisation, the reason it is there and the action in plain words. A reader can act on it without opening anything else. Everything under it exists to say what else is waiting and what is quietly going cold while the top item gets done.",
          "The reason line is the part that matters. A queue that says call Brea Olinda High School is a list. A queue that says call Brea Olinda High School because the grad night window is open this month and nobody has written to them yet is a briefing, and that is the difference between a rep who dials and a rep who sells.",
        ],
      },
      {
        heading: "Revenue and hours out of the building are both the job",
        body: [
          "A sales manager is measured on booked revenue. A sales manager is also measured on being out of the building, because 68 organisations on this board have no email door at all and the only way in is the lobby at lunchtime. Both halves are on this page because a day spent only answering inbound books whoever happened to write in, and that is a phone being answered rather than a territory being worked.",
          "The two halves are counted in different units and that is deliberate. Inbound work has a person on the other end and a clock. Outbound work has neither, because nobody is waiting on it. Summing them into one number would hide the half that has nobody chasing it, and that is precisely the half that goes missing first in a busy week.",
          "The outbound half is capped at three organisations because it is a morning, not a plan for the quarter. Three go-sees is a real afternoon in this trade area. A list of ten is something a person reads and then does none of.",
        ],
      },
      {
        heading: "The month you are standing in changes what the queue should say",
        body: [
          "Holiday buying does not start in December. Executive assistants and HR start researching venues in July and August, decisions land August to early October, and October is the highest inquiry month. A Monday in August and a Monday in November are different jobs. A queue that ranks the same way in both is sending somebody at the wrong half of the board.",
          "That is why an open buying window is one of the things the queue ranks on, and why the period selector in the chrome rather than the machine's clock decides what now means. A reader can move the period and watch the order change, which states the argument as a control instead of as a paragraph.",
          "The urgency under it is short. Median booking to event is 36 days and 48 per cent lock inside 30 days. A window that is open this month is a conversation already happening somewhere, with or without this desk in it.",
        ],
      },
      {
        heading: "The next thing is the page, not a row in a table",
        body: [
          "This screen inherits a lesson from an earlier prototype by the same author. That codebase carries a function whose own comment calls it the next thing you are on the hook for, and it is called in exactly one place: the empty state. The best idea in the codebase is visible only when there is nothing to do. That is the failure of dashboards in one line, and it is what this page is built against.",
          "So the next piece of work is the first thing on the screen, at the size of a headline, with its clock, its organisation, its reason and the action in plain words. Everything below it exists to say what else is waiting and what is quietly rotting while the top item gets done.",
          "The score table under the card is the same table the desk uses, so a reader who has opened one has opened both. Its label is deliberately rank-neutral. The pager can put any record in that card, and a button insisting it is explaining the top of the queue while showing number nine is a small lie that would cost the table its credibility.",
        ],
      },
      {
        heading: "Two ledgers, and no total of the two anywhere",
        body: [
          "Inbound work is counted in pieces of work, each with a clock on it. Outbound work is counted in hours and in organisations, and it has no clock at all because nobody is waiting. Nine things today, made from four enquiries and five go-sees, is a number that means nothing: four of them have a person on the other end and five do not.",
          "So the two halves sit side by side, each with its own unit named in its own heading, and there is no total of the two anywhere on the page. The same discipline governs money: signed contracts carry revenue, hours outside the building carry none, and a today screen is exactly where somebody would be tempted to add them because one number is easier to put in a heading than two.",
          "The outbound half shows three organisations rather than ten. It is the outbound half of a morning, not the outbound board, and a list long enough to plan a week from would quietly turn this page into a second desk.",
        ],
      },
      {
        heading: "The bucket from the rail narrows one section, and says so",
        body: [
          "The rail links into this screen with a bucket on the end of the URL, and readBucket is what makes that parameter mean something. The four buckets are the queue's own partition, so a bucket is the one filter that means the same thing here, on the requests queue and in the rail.",
          "What it narrows is deliberately one section rather than the page. The two halves, the risk panel and the response record are readings of the whole week. A today screen whose weekly figures silently described a quarter of the queue would be the most dangerous kind of wrong: quietly plausible. So the bucket scopes the ranked queue at the top, which is the part a person works through, and everything below keeps counting everything and says so in words.",
          "queueBuckets ranks before it partitions, which means a bucket's tasks come out in the order the whole queue would have put them in, and the pager walks the four buckets in the same sequence it walks the board. Changing the bucket resets the pager to the top of the new queue, because carrying a position across a filter change would leave a reader standing on record nine of a queue that now holds four.",
          "An empty bucket and an empty board are opposite readings and they do not share a sentence. Nothing is waiting, printed under a filter that is hiding twenty-two live pieces of work, is the most flattering wrong answer this screen could give.",
        ],
      },
      {
        heading: "The clock is fixed, and it is labelled as this desk's own",
        body: [
          "NOW is REQUESTS_AS_OF, injected rather than read off the machine. A work sample opened on somebody else's computer in another state, six months after it was written, has to show the same overdue count it showed the day it was built. The fixed reading moment is printed at the top of the page and its tooltip says plainly that it is not the clock on this machine.",
          "Dates are split rather than parsed. Passing a bare date string to Date gives midnight UTC, and rendering that through a locale formatter in California prints the previous day. A held date shown one day early is not a rounding error on a screen somebody is working a phone call from. The time of day is read straight off the string by wallClock for the same reason: every stamp in the seed already carries the venue's own offset, so converting it again could only disagree with the first conversion.",
          "Lateness is counted in working hours rather than elapsed ones, because the commitment is stated in working hours and a clock that measures one thing while the target measures another is how a service level quietly becomes decorative.",
          "The commitment itself is four working hours, and it renders with the disclosure attached every time it appears. Main Event publishes no response time anywhere: not on the Brea page, not on the events pages, not on the contact page. The four hours are this desk's own target, invented for the prototype, and a countdown implying a published service level would be exactly the sort of invented figure this application exists to avoid.",
        ],
      },
      {
        heading: "Five named ways work goes missing, each with a denominator",
        body: [
          "The risk panel does not ask what is overdue. It asks the five separate ways a live piece of work stops being worked: never answered past the commitment, a live conversation with nothing agreed next, a date held against no signature or deposit, a buying window open this month against an organisation nobody has ever written to, and a win recorded on one ledger and missing on the other.",
          "Every group carries the population it is counted out of, printed beside it, so nine is never shown without saying nine of what. Every group carries two sentences, one for the full case and one for the empty case, because an empty group here is a real result and deserves to say what it means rather than showing a blank list.",
          "Every item links to the thing itself rather than to a page that merely contains it. A count that lands a reader on a screen where they have to find the row again is a count that gets ignored twice.",
          "The chosen group lives in the URL, so the reading is linkable, survives a reload and gives the back button something sensible to do. When no group is named it falls back to the first group that actually has something in it, so the panel opens on work rather than on a congratulation.",
          "The reset control at the foot of the page deletes only the risk parameter. It used to write an empty parameter set, which also threw away the bucket the reader had arrived on from the rail. A control named for one thing that quietly resets another is the cheapest way to make a reader stop trusting the rest of the buttons on a page.",
        ],
      },
    ],
  },
  {
    path: "/requests",
    label: "Requests",
    standfirst:
      "Everything that arrived on its own, the clock running on each one, and the next move in plain words.",
    sections: [
      {
        heading: "Every one of these needs a call before it is a lead",
        body: [
          "The enquiry form on Main Event's own Brea page captured nine fields, and none of them was the event date, the headcount or the event type. Those three are the only things that have to exist before a quote can. So an enquiry through that route arrives as a name, an email, a phone number, a company and some free text, and nothing on it can be priced.",
          "That is not a note about a form, it is the shape of the working day. The first move on most rows here is a qualifying call, and this screen is built to say which rows need one rather than pretending a queue of names is a queue of deals. The gap panel ends on the figure a Monday actually turns on: how many open requests can be quoted without ringing somebody first.",
          "It also keeps apart two failures that look identical in a spreadsheet. A field the sender left blank is a buyer who did not bother. A field the route never asked for is the venue's own doing. Only the second is fixed by changing a form, and knowing which is which is the difference between coaching a rep and fixing a page.",
        ],
      },
      {
        heading: "What a response clock is actually for",
        body: [
          "A group buyer sends the same enquiry to three or four venues in one sitting. The first venue back with a person and a number usually gets the walkthrough, and everybody else quotes against a decision that has already been made. Answering fast is not manners, it is the cheapest advantage a venue has over the one down the road, and it costs nothing to hold.",
          "So every piece of derived work here carries a clock, lateness is counted in working hours rather than elapsed ones, and the queue is cut into past the commitment, due today, due this week and later. A queue sorted by arrival tells a reader what came in. A queue sorted by what is late tells them what is being lost, which is the only sort worth opening on a Monday.",
          "The commitment on this page is four working hours and it is this desk's own. Main Event publishes no response time on the Brea page, on the events pages or on the contact page, so the figure travels with that disclosure everywhere it appears. A countdown implying a service level nobody advertised would be exactly the sort of invented number this application exists to avoid.",
        ],
      },
      {
        heading: "Nothing falls out of the arithmetic",
        body: [
          "Inbound is the half of the job that loses money without leaving a mark. Nobody writes down that the youth pastor went unanswered for four days; the enquiry simply stops mattering to the person who sent it. So the brief for this screen was one sentence, easily attend to everyone, and the first thing that follows from it is that the counts have to add up in public.",
          "The four buckets partition every piece of derived work: past the commitment, due today, due this week, later. Under the working set lead the page prints the four counts, their sum and the total on one line, so a reader can hold the screen to its own arithmetic in about two seconds. If the sum ever disagrees with the total, the line says so in words rather than leaving it to be noticed.",
          "Everything counts rows and the four buckets count pieces of work, and the two figures differ on purpose: a closed enquiry is still a row on this table and it has no clock, so it belongs to no bucket. The sum line states that difference in figures rather than letting a reader discover it as a discrepancy. Every segment counts exactly the rows pressing it will put on the table, which is the only figure a reader can check.",
        ],
      },
      {
        heading: "Every filter reads off the URL, and that is a repair",
        body: [
          "The bucket used to live in component state. The rail's second level links to this page with a bucket parameter on it, so the parameter arrived, nothing read it, and the page rendered every row under a rail item that had just promised six. A filter that appears to narrow a screen and does not is worse than no filter at all: the first time a reader notices, they stop believing every other count in the application, and they are right to.",
          "All five filters now read off the URL and are written by one function, so the address bar cannot end up holding four of them and dropping the fifth. A filter set to all or to an empty string is removed rather than written, because two URLs that mean the same reading should not both exist and only one of them is worth sending to somebody.",
          "The history entry is the interesting part. Choosing a bucket or a lane pushes, because that is a decision a person makes once and may want to take back, and taking it back is what the back button is for. Typing in the search box replaces, because pushing per keystroke would bury the previous screen under eleven entries and turn one press of back into eleven. A value the page does not recognise is treated as no filter rather than as an error, so an old link cannot produce an empty table with no explanation on it.",
          "The pager's position deliberately stays out of the URL. A place in a queue changes on every press of Next, and putting each of those in the address bar would put nineteen entries behind one pass through the queue. The filter is the shareable thing; the place inside it is something you are doing right now. It is also read back through the visible ids each render, so a row a filter has just removed stops being the current record instead of staying marked off screen.",
        ],
      },
      {
        heading: "The finding this screen is built around is a published form",
        body: [
          "Main Event's Brea page carries an enquiry form asking for a name, an email, a phone number, a company and 256 characters of free text. It asks for no date, no headcount and no event type. The brand-wide events form asks for all three. Both field sets were read off the published pages on 11 August 2026.",
          "That is not a design quibble, it is a commercial hole. A venue cannot quote what its own form did not collect, so every enquiry through the Brea route arrives missing all three of the answers needed before anything can be priced. The gap panel counts what that costs across the live queue and ends on the figure that matters: how many open requests can be quoted without a phone call first.",
          "The panel keeps two columns apart that most tools would merge. A field the sender left blank and a field the route never asked for are different failures, and only the second one is fixable by changing a form. The bar is drawn in two segments to match, and it is never the only reading: every bar on this page carries its own figure beside it, and the two segments are told apart by fill as well as by colour.",
        ],
      },
      {
        heading: "The commitment moved under the queue rather than being deleted",
        body: [
          "This screen used to open with the response commitment: a heading, the four hour figure, the disclosure and four record figures, roughly a third of the first screenful. It is true and it is necessary, and it is identical on every bucket. So a reader pressed Due this week and the top of the screen changed by one breadcrumb word and one number inside a select. Measured pair by pair, three tenths of one per cent of the pixels above the fold moved. The filter had been told in the plainest possible way that it did not matter.",
          "It was moved rather than dropped. It now sits one line below the legend that explains how to read a clock cell, which is the moment a reader actually wants to know whose clock they have just been shown. The provenance badge, the disclosure and all four record figures travelled with it intact, and the disclosure still sits in the same block as the number rather than in a footnote nobody scrolls to. The qualifying gap moved for the same reason: it is a standing fact about two published forms, not a fact about the bucket on screen.",
          "What took the space is the working set lead, and it earns it by carrying figures that are true of one reading and of no other. Past the commitment answers how bad it has got, so it names the worst row in working hours and how many were never answered at all. The other buckets answer how soon and how far out, so they name the soonest and the last of them. A block printing the same three labels for every bucket would have been the old panel in a smaller box.",
          "Where the kinds of work tie, the block says they tie. Naming one of three equal kinds as most of it would be the page inventing a shape its own data does not have.",
        ],
      },
      {
        heading: "What is on this table, and what is deliberately absent",
        body: [
          "League asks sit on the same table as enquiries rather than in a sidebar, and for one reason: they generate derived tasks, those tasks are counted in the buckets, and a bucket button promising six rows and delivering five because one of them was filed elsewhere would break the only promise this page makes. They carry no channel and no pipeline status because they genuinely have neither, and the filters say so out loud. When a channel or status filter is on, the count line reports how many league asks that filter cannot describe rather than dropping them silently.",
          "There is no tournament anywhere on this screen, and that is a decision rather than an omission. Main Event publishes no tournament programme: no format, no entry fee, no bracket, no eligibility, no dates. A tournament registration screen would be invented end to end, and an invented product sitting beside real published packages is how a reader stops believing the real ones.",
          "Leagues are here because Open Lane Socials is a real published brand-wide programme. What is shown about it is exactly what is published plus an explicit record of what is not: the programme names three locations, all of them in Colorado, and Brea is not one of them. So a league ask on this board is answered honestly and logged as midweek demand rather than sold.",
          "The selection checkboxes exist because there is a verb behind them. Selecting rows and pressing the bulk action opens a compose window on the first, and closing it opens the next until the run is done. A queue that renders a checkbox and then offers nothing to do with a selection is a dead end, and an independent audit of the author's earlier prototype called exactly that out.",
        ],
      },
    ],
  },
  {
    path: "/inbox",
    label: "Inbox",
    standfirst:
      "Both directions of every conversation, threaded per organisation, sorted by what is waiting on this desk.",
    sections: [
      {
        heading: "Next year's booking lives in the thread, not in the contract",
        body: [
          "A grad night, a holiday party and a sales kickoff all happen again next year. The contract is finished the day the party ends. What produces the second booking is the thread: who replied, what they objected to, who actually signs, and the date they said to come back on. A tool that stores deals and not conversations throws all of that away at the moment of closing, and the following July the desk starts the same call from nothing.",
          "So this screen is threaded per organisation rather than per enquiry, and it carries both directions. The reply sits next to the message that caused it. A year later that thread is the whole briefing, and it is the difference between opening with a stranger's introduction and opening with the sentence they used on you last September.",
          "54 organisations on this board are calendar-locked, which means their event recurs on a schedule somebody else already keeps. Those are the threads worth carrying across a year. Nobody has to be persuaded that the event should happen. Only the venue is in question, and that question is reopened every single year.",
        ],
      },
      {
        heading: "Nurturing is a dated next move against somebody who has not said no",
        body: [
          "Most of what comes back is neither yes nor no. It is an automatic absence reply, a wrong person, a decision that sits at a head office, or come back in February. None of those is a rejection, and all of them get filed as one in a tool that only knows won and lost. That is how a pipeline shrinks on paper while the territory is still perfectly live.",
          "Each of them has a different next move, which is why each has a category here. An absence reply means nobody has read it, so it goes again. A wrong person means it reached a human who cannot sign, so the next move is a name rather than another email. A decision off site means the conversation continues one level above the building. Come back in February means a date in the diary and nothing else until then.",
          "That last one is the whole practice in a single row. Fairway Ford said their holiday party has been contracted at a hotel for three years and to come back in February for the summer sales push, so the next step against them is dated February 2027. They are not a loss and they are not a task this month. They are a conversation with a date on it, and a desk that cannot hold that will ring them in December every year and hear the same answer.",
        ],
      },
      {
        heading: "The category is read off the last message, never stored",
        body: [
          "The application could already say where every organisation stood and what had gone out of the outbox. What it could not do was show a message that came back next to the message that caused it. An outbox is a record of effort; an inbox is a record of the conversation, and a prospecting tool with only the first half can tell you how hard you worked but not who is waiting on you.",
          "Every thread lands in exactly one of seven categories, computed by categoriseThread from the last message and the requeue reason it carries. Nothing is stored, nothing is set by hand, and the same thread cannot appear in two places. Booked and lost win first, because a signed event and a recorded no are both finished whatever the last message happened to be. After that the last message decides, since the state of a conversation is who spoke last and what they said.",
          "A come back later reply lands in waiting on them rather than in a category of its own. It is the one requeue reason that is a real answer with a date attached, so the ball genuinely is theirs, and the reason is still drawn on the row, so nothing is lost by not giving it a bucket.",
          "An organisation that has never exchanged a message returns null and is not a thread. With no filter on, those rows are left out entirely, so the resting state of this screen is an inbox and not a directory. They are one rail filter away and the filter states how many there are before it is pressed.",
        ],
      },
      {
        heading: "Out of office and wrong person are not rejections",
        body: [
          "Both are first class categories here, and that follows a pattern good outreach tools already use. Neither is a no. An automatic absence reply means nobody has read the message yet. A wrong person reply means the message reached a real human who does not own the decision. Filing either as a rejection would delete live records, and in this territory it would delete a lot of them: a school front office goes dark for a fortnight at a time, and at a chain the person you can reach very often cannot sign.",
          "Decision off site earns its own category for the same reason a chain is a different organisation type from an independent. Somebody in the building wants it and cannot approve it, so the useful next move is a role above the site rather than another conversation inside it.",
          "No reply yet is a category rather than a status, which is the honest structural answer. Silence is not a stage. It is the absence of an event plus elapsed time, so it belongs beside the stale filter, which measures the same silence against a per stage threshold.",
        ],
      },
      {
        heading: "The requeue reason is read on outbound rows too",
        body: [
          "It would be natural to read a requeue reason only off inbound messages, since a requeue is something the other side triggers. That reading is wrong here, and it is wrong by a measurable amount: ten messages in the seed carry a requeue reason on an outbound row.",
          "They carry it because a go-see and a phone call are written up afterwards by the person who made them. The general manager who said the region decides put that on the visit summary, not in an email. Reading the reason only off inbound rows would file every one of those threads under no reply yet, which is the one reading that is definitely wrong.",
          "The same care applies to messages sent from this build during a session: they join the thread they belong to, but the seeded outbox rows are excluded by an id check, because those are already the correspondence log on the sent page and threading them here as well would show one message twice under one organisation.",
        ],
      },
      {
        heading: "The category tiles count inside whatever else is filtering",
        body: [
          "The shared count function computes category tallies over every record, because the rail draws the same figures and the rail is drawn for all screens at once. On this screen that made the tiles lie in a quiet way. With a status filter on, the working set read twenty-eight while the seven tiles above the list still added up to sixty, so a tile promising nine threads produced two when it was pressed.",
          "A facet count that does not respect the other facets is the same class of defect as a summary panel that does not respect the filter beneath it. So the tiles are recomputed on this screen with the box facet itself removed from the filter set. Each tile then says what selecting it would show, and selecting a second one adds rather than subtracts, which is what makes a multi select facet usable as a set.",
          "The facet is multi select on purpose. A reader who wants out of office and wrong person together is asking one question about requeues, not two questions about categories.",
          "Rows a reader typed in by hand answer only the filters they can honestly answer. A row typed on a pavement has no thread, so it cannot be stale, it cannot be awaiting a reply and it cannot belong to a message category; answering one of those filters with it would be inventing history. It does count as never touched and it does count under its organisation type, because both of those are true of it.",
        ],
      },
      {
        heading: "It cannot send anything, and it says so exactly once",
        body: [
          "There is no mail transport in this build's dependency tree, and the outbox reducer rewrites every recipient to a reserved address that can never resolve, on a domain RFC 2606 sets aside for exactly that. That is a real limitation and this screen states it.",
          "It states it in one place: beside the Reply control, which is the one moment a reader is about to press something that looks like it might send. A banner on every screen would be an apology. A line beside the control is a fact about the control, and it names what a live desk would change, which is one transport adapter behind that reducer and an unlocked recipient field.",
          "The row and the name are two controls rather than one, and that is a markup fix as much as a product one. The whole row used to be a single link with the organisation's name printed inside it; an interactive element inside an anchor is markup a browser rearranges without telling anybody. The link is now stretched behind the content with its own spoken name, and the organisation sits above it, so pressing the row still opens the conversation and pressing the words opens the profile.",
          "The threads themselves carry an illustrative provenance badge once, at the top of the conversation, rather than on every message inside it. They are written to be representative, and saying so twenty times in one column would be noise rather than disclosure.",
        ],
      },
    ],
  },
];
