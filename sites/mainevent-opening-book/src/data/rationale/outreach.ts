import type { ScreenRationale } from "./types";

/**
 * The four outreach screens, explained.
 *
 * Every claim below is taken from the code and the comments in
 * SentPage.tsx, RepliesPage.tsx, ObjectionsPage.tsx, RivalsPage.tsx and
 * the data files they read. Nothing here describes behaviour the build
 * does not have.
 */
export const OUTREACH_RATIONALE: ScreenRationale[] = [
  {
    path: "/sent",
    label: "Sent",
    standfirst:
      "Everything that has left the outbox, in full, on a screen that also has to prove nothing actually left the browser.",
    sections: [
      {
        heading: "An outbox is a list of promises, not a log of activity",
        body: [
          "A log answers what did I do this week. That question is worth about a minute. The question this page has to answer is what did I say I would do, to whom, and has it happened yet, because every one of these letters ends in a small ask and most of them end in a commitment as well. Brea Olinda High School was told to give me a day and I will put it in writing this week. Silverado came back asking for the second option in writing with the dates. Those are debts. The outbox is where they are kept.",
          "That is why the full body is held rather than a subject line and a status chip. A subject line cannot tell you what you promised. When a buyer says on the phone that you told them the hold releases on its own, the sentence has to be findable word for word in about ten seconds, because the credibility of the next twelve things you say rests on that one. A summary is a paraphrase of your own commitment, and a paraphrase is exactly what gets argued about four months later.",
          "It is also why nothing is deleted once sent. A message that produced silence is still a promise made and a door tried, and the only honest read on whether the writing works is the pattern across all of them rather than the ones that got a reply.",
        ],
      },
      {
        heading: "What a sales manager does with this on a Monday",
        body: [
          "Three passes, oldest first. Pass one is promises owed: every row where something was promised in writing and has not gone out. Pass two is silence past its date: sent-0001 went to Troy High School on 3 September and nothing came back, so that row is not waiting for a better email, it is waiting for a phone call and a visit. Pass three is new sends. The order matters because pass one is revenue already half sold and pass three is revenue that does not exist yet, and a week worked in the other direction feels busier and books less.",
          "The five seeded rows are what a real week looks like: one meeting set, two asked for information, one declined, one silence. One good outcome in five is the honest ratio for cold outreach from a building nobody has heard of, and a manager who expects better than that from a pre-opening list will spend the season disappointed in the wrong things. The number worth managing here is not the yes rate. It is whether the promises got kept inside the week they were made.",
          "An outreach letter and a quote are not the same act, which is why every row prints the kind it is and the page tallies the kinds it holds. A quote carries a package and a headcount, and it is a number a buyer may carry into a meeting with somebody who controls the money. Quotes get chased first, and a quote that has sat quiet for a week is a phone call, not a resend.",
        ],
      },
      {
        heading: "The written half of the job, counted where it can be seen",
        body: [
          "Email is the cheapest touch available and the least persuasive thing in the ledger. The activity vocabulary in this build says so directly: an email sequence scales further than anything else and persuades less than any of it. So this page exists to be read against the rest of the work, not on its own, and a week that hit its touch count from a chair has not done the thing the job posting asked for first.",
          "It is also a brake. Two emails and then a visit is the sequence in this application, and four emails is a spam folder. The moment this page shows a third letter to the same activities director, it has told you to stop typing and drive over. That instruction is worth more than any of the sends above it, and it is only available because every send is kept.",
          "The posting asks by name for cold calling expertise. The outbox is the half of that work that leaves a paper trail, which makes it the half most likely to be mistaken for the whole job. Naming what it is, a record of written promises, keeps it in its place.",
        ],
      },
      {
        heading: "The guarantee is a property, not a promise",
        body: [
          "The first question a careful reader has about a prototype with a Send button in it is whether the button sends. The usual answer is a promise: a banner saying nothing will really be emailed, a disabled switch, a mode you could presumably leave. A promise is only as good as the code behind it, and the reader cannot see the code.",
          "So this screen answers with a property instead. There is no email transport anywhere in the dependency tree: no mail client, no API key, no server function, no queue, not a disabled one and not one behind a flag. The send path in OutboxProvider appends an object to an array. Every recipient is forced to DEMO_RECIPIENT inside the reducer rather than taken from the calling screen, and that address sits on .invalid, which RFC 2606 reserves so it can never resolve anywhere.",
          "The difference matters for a job that involves holding a real prospect list. A demo that promises not to send is trusting itself. A demo that cannot send is a fact about its dependency tree, checkable by anybody who opens package.json. The page states it in three parts at the top rather than burying it in a footnote.",
        ],
      },
      {
        heading: "Two lists, kept apart on purpose",
        body: [
          "Five messages arrived with the build so the log has a pattern in it: four lanes, two kinds of message, four different outcomes across the five rows and only one of them good, which is the honest ratio for cold outreach from a building nobody has heard of.",
          "A seeded log and a log the reader wrote are not the same evidence, and merging them would quietly take credit for work the reader did not do. So everything sent from this browser sits above, everything that arrived with the build sits below, and the seeded section carries an illustrative badge.",
          "The two are told apart by the shape of the id rather than by a flag on the row. Seeded rows run from sent-0001 to sent-0005, live rows are stamped with Date.now() and carry thirteen digits, and one regular expression separates them. Adding a boolean would have meant editing the shared state file for a field only this page reads.",
        ],
      },
      {
        heading: "The empty state is treated as the page",
        body: [
          "Nobody arrives here having sent anything, so the empty state is the state most readers see first. A grey line reading no messages would make the first impression of the outbox an absence, with no way of knowing whether the feature works or what it produces.",
          "It does three things a placeholder cannot. It shows the shape of a row that is not there yet, field by field. It names the exact two places in the application that write to this log, because send an email somewhere is not an instruction. And it carries a working link to each of them.",
          "The sample quote link looks its organisation up in the prospect list rather than hard coding a name, and falls back to the first row if that id ever moves, because a dead link inside an empty state is worse than no link at all: it is the one control the reader has been invited to press. It carries a package and the headcount from Brea Olinda High School's seeded reply, so the two screens agree with each other.",
        ],
      },
      {
        heading: "The body is kept whole, and copying is allowed to fail",
        body: [
          "The message body is the reason to be here, so hiding every one of them behind a click would be a strange thing for an outbox to do, and showing forty at full length would be worse. A section of three or fewer reads in full, a longer one opens its newest row and previews the rest, and an explicit toggle beats both. A reader who has just sent something finds it open, because they have.",
          "Bodies render in a pre element at a capped measure of roughly seventy characters. The templates write real line breaks into some of these messages and a paragraph would eat them, which would show a reader a message the sender never wrote.",
          "The useful thing to do with a drafted email in a tool that cannot send email is to paste it into a mail client that can, so there is a copy control. It has to survive the case where it cannot work: the clipboard API is undefined on an insecure origin and rejects outright when the document is not focused or the permission was denied. The failure branch opens the body, selects it so the reader's own shortcut finishes the job, and says so in words. The feedback is a word change rather than a colour change, so it is legible in greyscale and to the colourblind owner of this site.",
        ],
      },
      {
        heading: "Dates are split, never parsed",
        body: [
          "A date string is cut apart on the hyphen and the month named from a small table. Handing new Date(\"2026-09-18\") to a locale formatter in California prints the seventeenth, because the string is read as midnight UTC. A send that shows a day early on a screen somebody is working from is not a rounding error, it is a wrong answer.",
          "A live send may stamp a full instant with a time on it, so the time half is printed when it is there and dropped when it is not. A seeded row inventing a plausible 09:14 would be a fact nobody put in the data.",
        ],
      },
    ],
  },

  {
    path: "/replies",
    label: "Replies",
    standfirst:
      "Every answer that came back, plus every organisation that answered nothing, because silence is an outcome and not a gap in the record.",
    sections: [
      {
        heading: "Silence is the answer most outreach gets, so it is written down like any other",
        body: [
          "No reply is not a hole in the record. It is the most common outcome of cold outreach anywhere, which means a replies page that only shows replies is describing a week that did not happen. A seat that deletes its silences is left with five conversations and a good mood, and no idea which doors are shut.",
          "Written down, a silence gives you the one thing that makes it workable: a date. Troy High School was written to on 3 September at the published activities director address and nothing came back after nine days. That is not a feeling about Troy. It is a nine day old written door that did not open, sitting in a list, with a next step against it. A blank row cannot be counted, filtered, diarised or handed to anybody.",
          "It also protects the figures. Once silence is a value rather than an absence, it can be kept out of the response rate by name instead of by accident, so the number at the top of the page is one a general manager can push on rather than one that flatters the person who produced it.",
        ],
      },
      {
        heading: "A written door that failed is an instruction to change channel, not to rewrite the letter",
        body: [
          "The cheap response to silence is a fourth email with a better subject line. It costs two minutes, it feels like work, and it is the main reason a list stays quiet. Two emails and then a visit is the sequence here. Four emails is a spam complaint, and a spam complaint takes the address away permanently.",
          "The expensive response is the correct one: the phone, then the lobby. A go-see is the only route into an organisation that publishes no written door, and the posting asks by name for cold calling expertise. Silence is the thing that tells you which organisations have earned an hour of the week rather than another two minutes of typing, which is the only useful way to spend a week with one seat in it.",
          "Two kinds of quiet are kept apart for the same practical reason. An organisation still sitting at reached out with nothing back has not answered. An organisation at in conversation with no written reply on file has answered somewhere this page cannot see, on a phone or at a front desk. Chasing the second one as though it had ignored you is how a live buyer gets annoyed, so they are counted separately and named.",
        ],
      },
      {
        heading: "A no is not a refusal. It is a date, and usually a second occasion",
        body: [
          "Fairway Ford said the holiday party is contracted at a hotel and has been for three years, and to come back in February for the summer sales push. Read as a refusal that is a dead row. Read properly it contains two facts and one of them is a gift: December is closed for three years, and February is open because the buyer opened it themselves. The register makes the same point about the rows it rates medium, which come up often, are rarely fatal, and usually contain the next occasion inside the refusal.",
          "So the next step against them is dated February 2027 and the discipline written beside it is to leave it alone until then. That is most of what client nurturing actually is, and the posting asks for it by name: it is mostly not writing to somebody during the eleven months you told them you would not, then arriving on the day you said you would with the thing they asked for.",
          "The larger question is not this year's party at all. It is when the hotel contract ends, because that date is worth more than one December. A no with a date on it is a booking with a long lead time, and working those dates is how a venue earns year over year business rather than one good opening season. Wrong person is the same shape of answer: it costs one touch and it buys the name of the door that actually opens.",
        ],
      },
      {
        heading: "A silence is recorded as a disposition, not as an absence",
        body: [
          "The vocabulary has six reply dispositions and this page shows all six as groups: meeting set, asked for information, not now, wrong person, no, and no reply. The last two are the ones most tools quietly drop. Here, no is a group with organisations in it, and no reply is a group at all.",
          "That is the decision that could have gone the other way. Silence could have been modelled as the absence of a row, which is what most pipelines do and which is easy: no reply, no record, nothing to show. The vocabulary's own note on the value says why it is not: no reply is the most common outcome of cold outreach anywhere, and a replies page that hides silence is a page flattering the sender rather than informing the reader. So a silence is written down like anything else. Troy High School has a reply row saying a first email went to the published activities director address and nothing came back after nine days, dated, with a next step on it: second touch, then a go-see, because two emails and a visit is the sequence and four emails is a spam folder.",
          "Making silence a value rather than a hole has consequences the rest of the page depends on. It can be counted, it can be filtered to, it can carry a diarised next step, and it can be excluded from the response rate by name rather than by accident. An absence can do none of those things.",
          "Empty groups are drawn too, because an empty group says which answer this trade area is not producing. One is empty today: no dated not now is on file yet, and the group says exactly that instead of disappearing. The disposition filter is written into the URL rather than kept in component state, even though nothing in the application links here with a filter on it yet. Show me the losses is the most useful link anybody will ever send from this page, and a filter held in component state cannot be sent to anybody.",
        ],
      },
      {
        heading: "The silence nobody wrote down is computed",
        body: [
          "One recorded silence is not the whole silence. Any organisation that has been written to and has no reply row against it is unanswered, so the page derives that set from the status table rather than waiting for somebody to seed it, and says on screen that it is not seeded.",
          "There are two kinds of quiet in that set and they are not the same fact. An organisation still sitting at reached out with nothing back is silent. An organisation sitting at in conversation or date held with no reply row answered somewhere this page cannot see: on a phone, at a front desk, across a table at a mixer. Counting those as silence would overstate how badly the outreach is going, and folding them into the response rate would overstate how well. They are separated, named as moved without a written reply on file, and left out of both figures.",
          "The silent list is the one block on the page that can be worked to nothing by doing the job, so it gets a cleared state when it empties. The six disposition groups deliberately do not, because an empty group there is a shape in the answers coming back and not a queue anybody cleared.",
        ],
      },
      {
        heading: "The response rate names both halves of itself",
        body: [
          "The numerator is organisations that came back with words. A recorded no reply is not a response, which sounds obvious and is the exact place these figures usually go wrong.",
          "The denominator is organisations touched at least once in the selected period, not every organisation in the trade area. Dividing by the whole list would produce a much smaller and completely meaningless number, because an organisation nobody has written to has not declined to answer anything. The page prints both halves in a sentence so the figure can be argued with.",
          "Two guards sit behind it. The status table has a row per prospect, per package, per period, so a school pitched two packages would count as two organisations; the rows are collapsed to one per organisation first, which is the direction that makes the rate look worse rather than better. And the numerator is intersected with the touched set, because the replies array is not scoped to a period while the status table is, and without that a reader switching periods could see a response rate above one hundred per cent. Any reply left outside the rate by that rule is counted and named on screen rather than dropped.",
        ],
      },
      {
        heading: "Today is read off the data, not off the clock",
        body: [
          "The day this page sorts against is the date of the most recent reply, falling back to the latest recorded touch, then to the start of the selected period. It is labelled on screen as the desk date so nobody has to guess which clock is running.",
          "A live clock would have been the obvious choice and it degrades badly. A dated seed read through the wall clock means that six weeks after publication every next step on the page is overdue, and a year later the whole screen reads as abandoned work. Deriving the date from the data keeps the overdue counts true in any month, and it moves on its own the moment a reply is added.",
          "The objections page does use the wall clock, and that is not an inconsistency. It stamps an action the reader just performed, which happened today whenever today is.",
        ],
      },
      {
        heading: "Four buckets for next steps, not three",
        body: [
          "The obvious grouping is overdue, this week, later. It loses the most interesting entry on the page. Fairway Ford said the holiday party is contracted at a hotel and has been for three years, and to come back in February for the summer sales push, so the next step against them is dated February 2027.",
          "A follow-up diarised four months out is not later. It is a deliberate decision to stop selling into a closed door and return when the buyer said to, and filing it under the same heading as a call due next Thursday would hide the judgement that produced it. So there is a fourth bucket for steps diarised beyond the period, with the discipline written next to it: leave it alone until then.",
          "There is a fifth bucket for steps with no date, and its note is blunt about what those are. A next step with no date on it is a wish, and every one of them should be given a day or dropped.",
        ],
      },
    ],
  },

  {
    path: "/objections",
    label: "Objections",
    standfirst:
      "The seven sentences a buyer actually says to a venue that has not opened, each with the answer that works and what the answer costs.",
    sections: [
      {
        heading: "Written in the buyer's own words, because a category cannot be answered",
        body: [
          "Most objection documents record a heading: pricing, timing, competitor, risk. Nobody has ever rehearsed against a heading. The pricing row here is not pricing. It is a person saying your website will not tell me what it costs, I cannot take a number I do not have to my finance committee, and every other venue I looked at this morning had a per person price on the page.",
          "Three separate facts sit in that one sentence and each needs a different part of the answer. They are not asking for a discount, they are asking for a document they can hand to somebody else. They have already shopped the trade area this morning. And they have a committee, which means the real buyer is not on the phone. An answer written against the heading misses all three.",
          "The tour row works the same way: I am not signing for a venue I have not walked, I have three hundred people and a board that will ask me whether I have seen the room. That is a person protecting themselves, not a person evaluating a venue, which is why the answer is a hard hat tour rather than a better description of Gravity Ropes. Keeping the voice means a new hire can read this file once and hear the room, which is the only form of objection training that survives contact with a real buyer.",
        ],
      },
      {
        heading: "Concede the point before answering it, every time",
        body: [
          "Every row carries a why before it carries an answer, and the why is always the case for the buyer. That order is the technique, not a courtesy. These are correct observations about a building that is not open, not excuses somebody invented to get off the phone, and a rep who starts talking the moment the objection lands is telling the buyer that their reasonable question was an obstacle.",
          "The pricing answer opens by saying the true thing first: we do not publish group pricing, and I am the reason. The objection is now a fact both people agree on rather than an accusation one of them is defending, and the conversation moves to the quote. The competitor row goes further and volunteers the awkward fact before the buyer can find it, that Dave and Buster's and Main Event have shared a parent company since 2022. The cost line on that row is the argument for the whole method: a rep who volunteers the awkward fact is a rep the buyer believes on the next twelve things.",
          "Conceding also stops the two answers that lose rooms. Never guess at an opening date, and never invent a figure to get off the phone, because a number a buyer carries into a finance committee and then has to withdraw costs more than the booking was worth. Arguing with a school district's fiscal calendar is arguing with a law, and the register says so rather than leaving it to be learned on a live call.",
        ],
      },
      {
        heading: "An answer that costs the venue nothing beats a discount",
        body: [
          "Every row prices its own answer, and that is the line to read first. Only two of the seven cost the venue anything tangible. A place in line is a hold at no cost that converts or releases the day a date is published, and what it spends is optionality on a calendar that is currently empty. A hard hat tour spends an hour and a conversation with the general contractor. The answer on the competitor row spends nothing whatsoever and buys the buyer's trust for the rest of the relationship.",
          "The ones that do cost are named honestly rather than hidden. A Spirit Night gives away twenty per cent of a night that would otherwise have been empty, on Main Event's own published terms, and the venue keeps the other eighty per cent of revenue it would not have had. A rate held across a fiscal boundary commits the venue to a number before it knows what its own opening demand looks like, which is a real risk and belongs in front of a general manager before it is offered.",
          "None of that is a discount, and there is nothing to discount from. Main Event publishes birthdays and the team building programmes and the Play It Forward voucher at $19.95, and publishes no group price at all. A rate a rep invents to win a room is not a concession, it is a promise the venue then has to honour, on every renewal, to that buyer and to whoever they tell. The free answers are better for a plainer reason as well: a hold costs the buyer nothing, which is exactly why they can say yes to it on the first call, before there is a date, a photograph or a review.",
        ],
      },
      {
        heading: "Most of these expire when the doors open, which decides who you hire now",
        body: [
          "Four of the seven are the venue's own silence: no published price, no opening date, nothing finished to walk through, no track record. Three of those four die on their own. The day the building opens there is a date, there is a room to walk, and there are nights that already happened with photographs of them. The two rated structural are not solved, they are answered well for a season and then they stop existing.",
          "What survives opening day is ordinary selling: somebody else's three year hotel contract, somebody else's fiscal year, and a competitor under the same parent company. Any competent seller handles those in a building with a front door. The hard version of this job exists only in the months before that, which is the window this register was written for.",
          "So the pre-opening period is not a holding pattern to be staffed thinly and fixed later. It is the only time these seven conversations are difficult, and the person who works them arrives on opening day with holds already in the calendar, quotes already sitting in finance committees, and organisations that have already run one small thing with the venue. The register says why that last one matters: the organisation that has already run one small thing with you is the organisation that books the three hundred person night the following year. Hire after the doors open and those conversations are easier, the first season's calendar is already spent somewhere else, and the year over year business the posting asks for starts a year late.",
        ],
      },
      {
        heading: "A register, not a script",
        body: [
          "An objection heard once is a conversation. An objection heard three times is a product problem, and the two want completely different work: the first is answered by a better sentence on the next call, the second by changing what the venue offers, or by spending a season on hard hat tours, or by accepting that a lane is unsellable until a date is published. Nothing tells those apart except writing them down.",
          "So each of the seven rows carries the objection in the buyer's own voice, why the buyer is right to raise it, the answer that works, what that answer costs the venue, and a disposition the reader can set. The buyer's sentence is set in the operator serif, which everywhere else in this build marks somebody stepping outside the product to speak, so it is obvious at a glance which line is not the venue talking to itself.",
          "The cost line is the part most objection-handling documents leave out and the one a general manager reads first, because every answer on this page gives something away. A held date gives away optionality on the calendar. A hard hat tour gives away an hour and a conversation with the general contractor. A Spirit Night gives away twenty per cent of a night's sales, on Main Event's own published terms.",
        ],
      },
      {
        heading: "Most of these exist only because the building is not open",
        body: [
          "Sorted by what is actually beating the venue, four of the seven are its own silence: no published price, no opening date, nothing finished to walk through, no track record. Two are somebody else's calendar: a three year hotel contract, and a budget that does not open until the next fiscal year. One names a competitor, and that competitor has shared a parent company with Main Event since June 2022, which the recommended answer says out loud rather than hiding.",
          "The two rated structural are the ones true of every conversation in every lane until the doors open, and the severity note is honest about what that means: they do not get solved, they get answered well. The largest card on the page is the pricing one, because Main Event publishes a price for every product a parent buys alone at night on a phone and publishes none for any corporate or group package. Those pages say to contact the local sales manager, and Brea does not have that person yet.",
          "Ranking by severity alone would have left that one as the first of seven identical cards, and a layout that gives all seven the same size has quietly decided they are the same size of problem. So it is lifted out, given the page's only amber rule and the largest pull quote in the application, and the group price beside it is rendered as a sentence saying Main Event does not publish this rather than as a placeholder or a guess.",
        ],
      },
      {
        heading: "Three dispositions, and the third is the point",
        body: [
          "Every row can be marked open, answered, or lost to it. An objection list that cannot be marked off is a document, and documents are where sales knowledge goes to be forgotten.",
          "Lost to it exists so that a register cannot quietly become a list of wins. If four corporate conversations died on I am not signing for a venue I have not walked, that is not a coaching note about objection handling, it is an argument for spending the autumn on hard hat tours, and the evidence for that argument is exactly the part a wins-only register throws away.",
          "Every row starts open, which is the honest opening state. The alternative was seeding three as answered so the screen looks worked, and twelve weeks before a building opens, with two contracts in the book, nothing has been answered often enough to call it settled. A register that opens half ticked is describing a week that did not happen.",
          "The page never pretends to have an answer it does not have. Where the honest answer is not a solution it says so and offers what is real instead: for the missing opening date, the instruction is to never guess at a date, and the ask is a place in line rather than a deposit, a hold at no cost that converts or releases the day a date is published. For the missing price, the instruction is to never invent a figure to get off the phone, because a number a buyer takes to a finance committee and then withdraws costs more than the booking was worth. Writing a note on a row deliberately does not change its disposition: recording what a buyer said is not the same as deciding the objection is handled, and a control doing both quietly would make the register's own counts untrustworthy.",
        ],
      },
      {
        heading: "Exposure is modelled, replies on file are evidence",
        body: [
          "Nothing here counts how often somebody said a sentence, because nobody has been standing in the trade area with a tally counter. What is countable is exposure: the organisations in the lanes an objection covers that are neither booked nor already recorded as lost. Booked and lost both drop out, since a signed contract cannot be blocked and a dead row is not being held up by anything. Leaving them in would have made the figure bigger and meaningless.",
          "Beside it sits a smaller and harder number: replies on file that actually named the objection by id. Two of the seven have one. That gap between what the register models and what the record proves is shown rather than smoothed over, both figures appear on every card, and the line under them says plainly that the two are never summed.",
          "The figure at the top of the page, organisations sitting behind at least one open objection, is a union rather than a sum. Every row covers the corporate lane, so adding the card figures together would count the same employer seven times and produce a number several times larger than the trade area contains. The page says a union, not a sum, on screen.",
        ],
      },
      {
        heading: "The register hands the reader the work",
        body: [
          "Each card can filter the desk to the lanes that raise it, and it sets those lanes rather than adding them, so a reader who asks to work the lanes behind one objection gets exactly those and not those plus whatever was ticked twenty minutes ago.",
          "Where a reply on file named the objection, the card links to it. Where none has, the card says so in words: no reply on file has named this one yet. Borrowing a nearby reply would have made the register look better evidenced than it is.",
          "Lanes are assigned one row at a time rather than by ticking every box. A school is never told to go and use Dave and Buster's instead, and a memory care community is not worried about its holiday party contract. The reasoning for the awkward cases is written down in the data file, including which of the seven a small owner-operator actually raises and why the other four are left off.",
        ],
      },
    ],
  },

  {
    path: "/rivals",
    label: "Rivals",
    standfirst:
      "What competing venues actually publish, and what really killed the deals that died, which turns out not to be a competitor.",
    sections: [
      {
        heading: "A list of rivals decides nothing. A dated loss with a reason on it decides the next season",
        body: [
          "The comfortable version of this screen is a page of competitors: who they are, how many lanes they have, what their packages are called. It reads well and it changes no decision. A register that logs only the nights this venue won is the same problem wearing a better mood, because a book of wins cannot tell a general manager to do anything differently. The row that can is the one that says a deal died, on what day, and for what stated reason.",
          "There are three of those on the record and they are worth more than the six venue rows below them. Fairway Ford went because the holiday party is contracted at a hotel and has been for three years, with the buyer asking to be called back in February for the summer sales push. The Phoenix Club went because it owns a hall and its members expect events at the club, which is a refusal that does not change. Sell My Home Real Estate went because the client event was booked and paid for in July, two months before this venue had anybody to ask them. Three losses, three different instructions: find the renewal date, stop selling into a closed door, and be in the conversation earlier next year.",
          "The reasons are read out of the threads rather than typed beside them, and each row says whether the buyer wrote the reason or the seat wrote it afterwards, because a reason summarised by the person who lost the deal is worth keeping and worth discounting. The ninety day recall window is on the page for the same reason. Inside ninety days a phone call still produces a real answer. Past that, what is on the row is all there will ever be, and the only fix is catching the next one faster.",
        ],
      },
      {
        heading: "The number already in the buyer's head is a walk in price, and it is the one to answer",
        body: [
          "Six operators were opened and read on 14 August 2026 and not one publishes a group price. Main Event publishes none either. So the figure a buyer carries into the call is not a rival's group rate, because no such rate exists anywhere to be carried. It is a walk in price they saw on a marketing page, or a discount code with a date on it, and a rep who does not know which is being told a number they cannot place.",
          "Those numbers are on this screen because they are real and checkable. Lucky Strike Fullerton and Lucky Strike Orange both print Endless Summer Nights at $24.99 a person with shoes included, Family Unlimited at $22.99 and After Party at $32.99. Fullerton alone carries a standing daily offer, The Special, buy two games and get the third half off. Both carry PARTY15, 15 per cent off parties and events, printed as valid through 8/31 for events held by 9/30. Orange also prints a Summer Season Pass at 25 per cent off through 9/1. La Habra 300 Bowl claims some of the cheapest prices around and states no figure at all, which is a claim rather than a price and is not answered as one.",
          "Knowing the published number is what lets a rep answer instead of flinch. A buyer saying it is $22.99 down the road is quoting a weekend daytime unlimited bowl for one person, not a hundred head night with food and a room, and a rep who has read the page can say so in one sentence and move to what the night actually needs. A buyer holding PARTY15 is holding an offer that books by 31 August and has to be held by 30 September, which is a deadline a rep can work with rather than be surprised by. What this venue answers with is not an invented rate, because there is nothing to invent from. It is the terms Main Event has already published to the world: Play It Forward at $19.95 a voucher, and Spirit Night at 20 per cent of sales on the night.",
        ],
      },
      {
        heading: "A room is not a rival venue, and it is a completely different sale",
        body: [
          "Not one of the three losses on this record went to another entertainment venue. Fairway Ford went to a hotel the buyer did not name. The Phoenix Club went to its own Grand Ballroom. Sell My Home Real Estate went to a date that was already booked and paid for. All three are classed as somebody else's calendar, and the register says so on the row rather than letting them sit in a bucket marked competitor because that is the bucket most tools have.",
          "The distinction is operational, not tidy. Losing to a bowling house is a sale you can work with a better room, a better package or a better date. Losing to a ballroom, a club with its own hall, or a night already spent is not a pitch problem at all, and the answers are different in kind. The hotel one is a supplier contract with a renewal date on it, so the useful question is when the contract ends rather than what it costs, and the buyer already handed over the next date by asking for February. The club one is permanent, and the correct spend is nothing. The third is a lead time problem, and the fix is a call in May instead of a better letter in September.",
          "So the register carries that class of rival on purpose. The Phoenix Club is on the screen as a banquet room, a building in Brea with a calendar and no lanes in it, and it appears twice because it is both a prospect that said no and a venue that competes. Round1 is marked category only, in the register to mark the edge of the trade area rather than to be watched. The one objection in the file that names a competitor names Dave and Buster's, which has shared a parent company with Main Event since June 2022. Nothing on this record was lost to a rival's price, and a screen built only around rival venues would have shown a general manager none of that.",
        ],
      },
      {
        heading: "The price grid that could not honestly be built",
        body: [
          "The expected screen here is a grid: rival venues down the side, a per head price in every cell, a tick where Brea is cheaper. That grid cannot be built. Six venues were opened and read on 14 August 2026, three national chains, one single site independent, one sibling brand and one members' club, and not one of them publishes a group price. Every one routes the question to a form, a planner or a telephone. The same silence is already recorded for league fees and for Main Event's own group packages.",
          "So every number in that grid would have been invented, on the one screen in this application whose entire job is factual accuracy about other people's businesses. It is the worst possible place to make something up and it is exactly what the naive version does.",
          "Instead each venue carries two fields that do the work the price column would have done, truthfully: what its pages do not publish, and where a group enquiry actually lands. A rep who knows every rival routes group enquiries to a form knows something useful. A rep holding an invented price knows something false.",
          "The missing figure is written as a sentence, but not with the component the rest of the app uses for withheld numbers. That component prints that Main Event does not publish this, which is right everywhere else and wrong here: the silence belongs to six other companies, and putting Main Event's name over it would misattribute it. Same glyph, same discipline, different sentence.",
        ],
      },
      {
        heading: "Every claim carries its address and its read date",
        body: [
          "The house rule is that every figure carries a provenance badge. A fact about another company needs one thing more, because a rival's marketing page is a moving target in a way a static seed is not: the address it was read from and the day it was read.",
          "Both are printed on screen rather than hidden in a tooltip, and the link opens the page, so a sceptical reader can check any single claim in about fifteen seconds. The dated rival promotion is read against the same clock as everything else and moves from claimable to closed to expired on its own dates, with the part of its year that is a reading labelled as a reading.",
          "The rebrand from Bowlero to Lucky Strike Entertainment is cited three times over, because the wire release carries the date, the filed copy carries the names and the scale, and a live redirect carries the evidence. No source is asked to support a claim it does not make. That note is on the page because half the search results for the Fullerton house still say Bowlero, and knowing why saves a confused conversation.",
        ],
      },
      {
        heading: "The losses are derived from the threads, not typed beside them",
        body: [
          "A loss row could have been a seed file: organisation, date, reason, done. It is read out of the message history instead. A typed loss reason is a claim; a derived one is a reading of a thread somebody can open and check. The register says Fairway Ford was lost to a three year hotel contract, and the message that says so, in the buyer's own words and with a date on it, is in the record. It also means the register cannot drift, and a fourth loss added to the record appears here without anybody remembering to write it down twice.",
          "The reason is found as the last inbound message carrying a no signal, searched separately from the message that moved the status to lost, because in this record those are genuinely different events: the seat closed Fairway Ford as lost at eleven in the morning and the buyer's own sentence arrived at half past four the same afternoon.",
          "Two things do not derive, so they sit in the data file with their reasoning attached rather than being computed out of thin air. What kind of loss it is, because only one of the three losses has a reply pinning an objection and a default bucket dressed up as analysis would be worse than a judgement somebody can argue with. And who the buyer named, expressed as a class and never as a business: the Fairway Ford thread says a hotel and names no hotel, and inventing one would drop a real local business into this application as the winner of a deal that never happened.",
        ],
      },
      {
        heading: "The bias is graded rather than denied, and nothing celebrates",
        body: [
          "Win and loss practice says the reason should not be collected by the person who lost the deal, because a seller leading the interview hears what they want, and that it should be collected inside three months, because after that the buyer's memory of the evaluation has been overwritten. A venue with one manager and two seats has no independent interviewer and is not going to get one.",
          "So the register grades the evidence instead of pretending the problem is absent. A reason that arrived inbound and unsummarised is the buyer's own words; a reason summarised after a phone call is the seat's recollection; a loss with neither says no reason on file. All three are kept, all three are labelled, and the page never adds them together as though they were the same kind of fact.",
          "The three month rule is enforced as a ninety day clock read against the date being viewed, which is why this screen genuinely reads differently on different days rather than printing a different date at the top. On the board day all three losses are still worth ringing about. By the end of December none of them is, and the page says so.",
          "When the askable filter empties, nothing celebrates. That state is three conversations nobody had in time, and the empty line says exactly that. There is no confetti, no sound, no character and no modal anywhere in this file, and no code path that could produce one.",
        ],
      },
      {
        heading: "What the screen cannot know, named rather than fudged",
        body: [
          "Nine things a competitor grid would happily have contained are listed as absent, each with the reason it is absent. Distances and drive times, because the venue coordinate is geocoded and none of the six rivals is, so a mileage produced by eye would be the one number here nobody could check. Room capacities for The Phoenix Club, because its banquet page names the ballroom and states no capacity. Share of local group business, competitor booking pace and win rates, because no data source exists for party bookings in a four mile trade area and the figure would be invented outright. Anything about a competitor's customers, staff or operations, which is out of bounds by rule rather than by difficulty.",
          "The same standard drew the boundary of the comp set. Round1 is the venue everybody names, and its own locations list has no Brea entry, so it is marked category only: in the register to mark the edge rather than to be watched. That is the second time this application has reached that conclusion about the same company, since Round One Entertainment came off the prospecting board in the first research pass when two sources disagreed about where its office was.",
          "One organisation appears twice on the screen, as a prospect that said no and as a venue with its own ballroom. That is not a duplicate. It is what a club with its own hall actually is in a town this size, and the page says so at the foot rather than hiding one of the two rows.",
        ],
      },
    ],
  },
];
