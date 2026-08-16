import type { ScreenRationale } from "./types";

/**
 * The reference half of Rationale mode: the screens that carry published
 * research, the method behind it, and the supply side of the programme.
 *
 * Everything below is drawn from the source of the screen it describes.
 * Nothing here asserts a decision the code does not actually make.
 */
export const REFERENCE_RATIONALE: ScreenRationale[] = [
  // =================================================================
  {
    path: "/packages",
    label: "Packages",
    standfirst:
      "Every package Main Event publishes, with the price where there is one and the sentence that replaces it where there is not.",
    sections: [
      {
        heading: "Nobody in this category publishes a group price, and that is the opening",
        body: [
          "Main Event publishes no group price anywhere. Birthdays are published up to $29.99 a guest, the All-Access Grad Pack is $29.99, the MVP Grad Pack is $52 and the Play It Forward voucher is $19.95. Every corporate and school package on this screen ends with the same instruction, which is to contact the local sales manager. Fourteen of the eighteen rows are gated that way, and the only fully priced programme set on the site, team building, prints its two figures with a decimal fault and carries a 20 per cent facilitator fee on top.",
          "The competition sells the same way. Six venues were opened and read one at a time on 14 August 2026: Lucky Strike Fullerton, Lucky Strike Orange, Round1, Dave and Buster's Orange, The Phoenix Club and La Habra 300 Bowl. Six out of six publish no group price. Every one of them routes a group enquiry to a planner, a form or a telephone. A parent, a PTA treasurer or an office manager with one afternoon to arrange something cannot price any of them, and cannot price this venue either.",
          "That is a conversion gap, not a filing quirk. Every buyer who wanted a number, could not find one and did not want to make a phone call is a buyer nobody at the venue ever hears from. When the whole category gates the price, what decides the booking is who answers first and what they can say when they do. The gate is where this role earns its salary. It is also where the money leaks on every day nobody is standing at it.",
        ],
      },
      {
        heading: "A rate a rep can quote beats a rate a rep has to ask for",
        body: [
          "Whether Main Event publishes its corporate rates is not this application's decision and this screen does not propose it. What a venue decides for itself is how fast the person holding the phone can answer the question. Today the answer to what does it cost is a form, a call back, and two days of a buyer's enthusiasm, and enthusiasm is the part that does not survive the wait.",
          "So the argument here is one page a rep can quote from live, in the call, without opening anything else: what each package includes, which hours it is allowed on, the published five day notice and 50 per cent deposit, the $14 per person banquet floor that Main Event does publish and publishes twice, and the guest minimum and maximum on every row. That is enough to give a buyer a shape, a date and a set of hours on the first call, so the price arrives on the second call rather than the fourth.",
          "A comparison a rep can hold up is revenue, not decoration. Every step taken out between the question and the answer is a group that stays booked.",
        ],
      },
      {
        heading: "Two rows can be quoted today, and the stronger one is argued on the promo screen",
        body: [
          "Two rows carry commercial terms Main Event has already published to the world. Play It Forward is $19.95 a voucher. Spirit Night donates 20 per cent of sales on the night to the nonprofit. Neither needs a rate approved by anybody, and both can be said out loud on a first call to a school before the building is open.",
          "That makes the fundraiser family the opening move for the whole schools, faith and youth sport half of the board, and it is the reason it is argued in full on the promo screen rather than here. The short version: it is the only call this venue makes in which it offers an organisation money instead of asking for some.",
          "Play It Forward's fence is quoted with it, because a rep who leaves it off sells a night the building cannot deliver. Minimum ten vouchers, bought through the sales office at least three business days ahead, redeemable only at the issuing location, Monday to Thursday and Friday 11am to 5pm, youth 17 and under.",
        ],
      },
      {
        heading: "Quote only, rather than a number a reader could check",
        body: [
          "Fourteen of the eighteen packages on this screen carry no published price. Main Event prices the products a parent buys alone at night on a phone: birthdays, the All-Access Grad Pack at $29.99, the MVP Grad Pack at $52, the Play It Forward voucher at $19.95. Every corporate and group page ends with the same instruction instead, which is to contact the local sales manager.",
          "The easy version of this screen fills those gaps. A range, an average of the priced four, a plausible figure per head. Every one of those would have been a Main Event price that Main Event never published, sitting on a page whose whole claim is that a reader can open mainevent.com and check any row in about fifteen seconds. The first row they checked would have been the one that was invented.",
          "So a gated row prints a sentence, not a placeholder. Not a dash, not POA, not $--, because all three read as a number the app failed to fetch. What is true is shorter and stronger: Main Event does not publish this, the price comes from a person, and that person is the role this whole prototype was built for. The pattern in the gaps is the finding, and filling them in would have destroyed it.",
        ],
      },
      {
        heading: "The one price on the site that is refused as well",
        body: [
          "The team-building programmes are the only fully priced set Main Event publishes, and the page prints them as \"$1995 / Person\" and \"$4295 / Person\". Read literally that is nineteen hundred and ninety-five dollars a head for a video game relay. It is almost certainly a decimal stripped in a template, and $19.95 and $42.95 sit exactly where you would expect them against every other figure on the site.",
          "Restoring the decimal would have been defensible and would have been a guess. Almost certainly is not certainly. Both programmes render as not published, the fault is named on screen with both quoted strings, and the rule is stated beside them: a figure this app cannot read cleanly is treated exactly like a figure Main Event chose not to publish.",
        ],
      },
      {
        heading: "The day-part fence gets a block, not a footnote",
        body: [
          "The obvious layout puts price first and everything else in small type underneath. That would have buried the field that decides more than the price does. Corporate All Access is valid Monday before 4pm, Tuesday to Thursday all day, and Friday only before 5pm. Bowl 'n Fun runs Monday to Friday before 5pm, Saturday before 11am and Sunday after 6pm. All Day Meeting is eight to five on a weekday.",
          "Main Event has already decided which hours it wants groups to fill, so the fence sits in its own block on every card with a glyph set that reads in greyscale: a solid square where there is no restriction, a partial fill where there is. A rep who reads that fence correctly is selling the hours the company is trying to sell rather than arguing for the ones it is not.",
        ],
      },
      {
        heading: "The collision check is computed, never asserted",
        body: [
          "Several package pages promise billiards, mini golf and rock climbing. Brea's own location page does not name them. That gap is the most useful thing on the screen for anybody about to stand in a school office, so it is derived: one published list from the package data, checked against another from the venue data, at render. Change either file and the table changes with it.",
          "The check needs a phrase map because the two vocabularies do not match. The brand-wide list says \"Indoor mini golf\"; the package pages say \"mini golf\", and two of them say \"glow golf\", which is the same holes with the lights off. Searching for the brand-wide phrase would have found nothing and reported a clean bill of health, which is the worst possible result for a check whose only job is to catch a promise the venue cannot keep.",
        ],
      },
      {
        heading: "The promo picker is an address, not a piece of state",
        body: [
          "Opening the picker writes ?send= into the URL rather than flipping a boolean. That makes an open picker a link somebody can send, it survives a reload, and the back button closes it because closing it is what going back means. It is also reachable by the proof scripts, which matters because the contrast walk cannot press a control.",
          "Opening pushes a history entry and closing replaces one, so opening and closing three pickers does not bury the page under six entries. A package id nobody publishes is dropped out of the address rather than rendered as a broken dialog. Both dialogs are owned by the page and rendered once: eighteen cards rendering eighteen compose windows would trap focus in whichever one the browser reached first.",
        ],
      },
    ],
  },

  // =================================================================
  {
    path: "/coaching",
    label: "Coaching",
    standfirst:
      "How this week would be run, and the reason each step sits where it does rather than one place earlier.",
    sections: [
      {
        heading: "The week has a shape, and the shape is other people's calendars",
        body: [
          "A calendar-locked buyer has the event already and decides in a month you do not choose. A school books a grad night in the spring it happens, not in the October somebody felt like calling. So the week starts by reading which buying windows are open in the next four months, and the hours go there. That is why the one activity target on this page is calendar-locked organisations touched inside an open window rather than touches, because the denominator is fixed by other people's diaries and cannot be inflated by working the easy names.",
          "The hours a rep sells matter as much as the month they call in. Main Event has already fenced its own group packages into weekday daytime and after close: Corporate All Access is Monday before 4pm, Tuesday to Thursday all day and Friday before 5pm; Bowl 'n Fun runs Monday to Friday before 5pm, Saturday before 11am and Sunday after 6pm; All Day Meeting is eight to five on a weekday; the lock-ins start half an hour after the building closes. A rep working those hours is selling inventory the company is trying to fill and is arguing with nobody.",
          "Forty calls placed in the right month against the right hours are a different business from forty calls spread evenly across the board. Order beats effort, and effort spent in the wrong month looks identical on an activity report right up to the quarter it does not close.",
        ],
      },
      {
        heading: "Thirty minutes on a Monday, run off five real screens",
        body: [
          "The one to one is five items and thirty minutes, and each one opens a working screen rather than a document: the week that just went, read off the sheet; what came back, including the silence; dates held with nothing signed; one objection worked out loud; and next week's hours in the diary before anybody leaves the room.",
          "Every item also carries the answer a rep gives when the work was not done. \"It was a busy week\" against a sheet that was printed on Monday and either carries completions or does not. \"They are all still live\" against a held date with no release date on it, which is a date our own side has quietly taken off the market. Naming the weak answer in advance is what keeps the meeting to half an hour and stops it turning into a conversation about attitude.",
          "The last item is the one that decides the following week: which lobby, which day, what time, and what the ask is when you are standing there. An hour outside the building that is not in a diary by the end of that meeting is an hour that will be spent at a desk.",
        ],
      },
      {
        heading: "Repeat sales are a diary discipline, not a slogan",
        body: [
          "The posting asks by name for a sales campaign focused on communicating and nurturing customer relationships and driving repeat sales. A signed event is not the end of that campaign. It is the first date in it. A school that ran a fundraiser night in October has an athletic banquet in the spring and a grad night in June, and all three are the same relationship worked three times.",
          "So what gets coached weekly is the follow-up with a date attached rather than the good intention: the next touch, the window it belongs in, and the release date on anything being held. The partners screen already runs this discipline on the supply side, sorting by days since last worked so the coldest relationship is on screen whether or not anybody asked to see it. A repeat sales campaign is that same clock pointed at customers, and it is cheaper than any call to a stranger.",
        ],
      },
      {
        heading: "The ramp opens at the price line, not at the packages",
        body: [
          "The ordinary shape of venue sales training is: here are the packages, here is what is in them, here is the deck, go. That order teaches a new rep to be fluent in the half of the range that does not need them. The priced four sell themselves off a phone at eleven at night to somebody who has never spoken to anybody.",
          "So step one is the line through the price list, before a single package is opened. A rep who does not know where the line falls will lead with the grad pack, because a published price is the easiest thing in the world to say out loud, and the venue will have paid a salary to close a sale the website closes for nothing.",
        ],
      },
      {
        heading: "Every step carries the reason it sits where it does",
        body: [
          "The seven steps could have been a numbered list and nothing else. They carry a stated reason each instead, and the reason is always the same kind of thing: what a rep can get wrong before they have been taught the step below.",
          "A numbered list with no reasons attached is a curriculum. A numbered list with reasons is a decision somebody can disagree with, which is the only kind worth publishing in a work sample. The go-see is last because it spends the scarce resource and cannot be taken back. The capacity arithmetic sits before anybody may hold a date, because it is the only error on the list that costs a customer rather than a call.",
        ],
      },
      {
        heading: "Two call frames with identical fields, read across",
        body: [
          "A calendar-locked buyer already has the event and you are competing for the venue. A discretionary buyer has no event at all and you are competing against nothing happening. Those are different calls in different months, and a rep running the wrong one has lost inside ninety seconds while being perfectly pleasant, which makes it the hardest failure on a floor to spot from across the room.",
          "The two frames could have been two bulleted lists with headings that suited each. They carry the same five fields in the same order instead: the opening question, what you are competing against, what closes it, the failure mode, what to lead with. A reader comparing \"what closes it\" in both columns gets the whole argument in one movement of the eye. The columns run cool and warm exactly as they do on the lane board, so temperature learned once is read here for free.",
        ],
      },
      {
        heading: "Activity is coached, revenue is managed, never in one sentence",
        body: [
          "A rep controls whether they were standing in a lobby at noon on Tuesday. They do not control whether a school district signs. Coaching somebody weekly on an outcome they cannot move teaches them that effort and result are unrelated, and a floor that believes that stops trying by about week six.",
          "So the leading indicators carry targets and the lagging ones carry provenance badges, and the page never prints them in the same sentence. The one activity number given a target is not touches: it is calendar-locked organisations touched inside a buying window that is open in the next four months. That denominator is fixed by other people's calendars rather than by anybody's effort, which is precisely why it cannot be inflated by working the easiest names on the board.",
          "The only place the two ledgers are allowed to meet is a ratio, hours outside the building per thousand dollars booked, and it is a ratio because a ratio compares without adding.",
        ],
      },
      {
        heading: "No invented people, and the figures move while you watch",
        body: [
          "Every person named on this screen is a role: Sales Manager, event sales representative, Assistant Principal for Activities, practice manager, youth pastor. There is no invented human being anywhere in the application, because a work sample that invents a person has invented the one kind of fact a reader has no way to check.",
          "The measurement figures are read live off this session's state rather than typed into the prose. Advance a prospect on the desk or complete a shift on the field page and they move. The counts on both ledgers are badged illustrative, because there is no real team and no real week behind them. The dollar figures on the lagging side, contract value and deposits collected, are badged modeled instead, because each is computed from the per-guest price and the deposit percentage carried on the lines it adds up. What is being shown either way is the shape of the measurement, not a claim about a result.",
        ],
      },
    ],
  },

  // =================================================================
  {
    path: "/method",
    label: "Method",
    standfirst:
      "Every formula, every source, every assumption and every invention, in the order a sceptical reader would ask for them.",
    sections: [
      {
        heading: "A number a buyer can check is a number that survives the second meeting",
        body: [
          "Provenance reads like an academic habit. It is a commercial one. Proposals do not fail in the first meeting, because in the first meeting nobody checks anything. They fail in the second, after the buyer has forwarded the document to somebody whose job is to find the weak line. One figure that does not stand up takes the credit of every figure around it, including the true ones.",
          "So every number in this application carries one of six classes: public, observed, modeled, user input, illustrative, withheld. Nothing unsourced is presented as measured. A rep working off these screens can say where any figure came from without leaving the room, and can say plainly which ones are the venue's own estimate rather than a published fact. Buyers do not punish an estimate that is labelled. They punish one that was not.",
          "The rule protects the venue in the other direction too. A price this application refuses to print is a price nobody can later be held to, and a group buyer holding a number a rep should never have said is the most expensive kind of misunderstanding a venue has.",
        ],
      },
      {
        heading: "Nine things nobody could verify, printed rather than smoothed over",
        body: [
          "The local business research ends on a could-not-verify list of nine numbered items, headed with the sentence that this section is the point. Every item on it was found, opened, looked at and then refused, with the reason written down: two sources disagreeing about the name on the door, a company whose own store locator would not return an address for its own branch, a page the operator disallows in robots.txt against a single second-party listing.",
          "Every one of those rows would have been easy to keep. A directory address reads exactly like a first-party one once it is sitting in a table, and nobody checking a work sample would have caught any of them. Publishing the refusals instead is what tells a buyer, in one place, which parts of a proposal they can lean their own decision on.",
          "The same rule is why no drive time appears anywhere in this application. There is no routing engine in it, so the map rings are straight line miles from 245 W Birch Street and say so on the ring label, in the map legend, in the map popup and in the prospect panel. A ring drawn as a drive time would be the easiest unearned figure on any territory map to print.",
          "It matters more here than it would anywhere else, because the building at 245 W Birch St is not open. Almost every operating figure a venue would normally quote does not exist yet. Naming which parts are invented is exactly what makes the rest of it usable.",
        ],
      },
      {
        heading: "Metrics and market trends, in the posting's own words",
        body: [
          "The posting asks for monitoring key performance metrics and market trends to stay ahead of competitors. A metric nobody defined is a metric two people report differently and a manager reconciles by hand every month. So the definitions sit here in one place: the desk weights, the capacity arithmetic, the two ledgers, and the rule that promotional money is never added to booked revenue or to outbound hours.",
          "Trend work has the same requirement. The competitor reading was done by opening six venues' pages on a stated date and writing down what each one publishes and what it does not. That is a reading somebody can repeat next quarter and compare like for like. An impression of the market cannot be compared with anything, which is why it always agrees with whoever is describing it.",
        ],
      },
      {
        heading: "Why a page like this is the difference between a demo and a claim",
        body: [
          "Every other screen here asks a hiring manager to believe something. The desk asks them to believe an ordering. The capacity chart asks them to believe a lane count. The book asks them to believe a dollar figure. None of that is worth anything on its own, because a prototype can print any number it likes and most of them do. Confidence is free. A demo and a fabrication look identical from the outside.",
          "What makes a figure believable is not the tone it is written in. It is the reader being able to check it, and being told plainly which figures they cannot check because nobody published them. So this page carries the desk weights, the capacity arithmetic, the six provenance values, the two ledgers, the invented half named as invented, and links out to the actual pages the real numbers were read off on 11 August 2026.",
          "It is long prose on purpose, so the section index is pinned down the side on wide screens and tracks the reader's position, and the measure is held at 68 characters because that is where prose stops being work to read. A reader who cannot see the shape of a long page bounces off it, and a page nobody reaches proves nothing.",
        ],
      },
      {
        heading: "Every count on it is derived, not typed",
        body: [
          "The organisation counts, the emailable counts, the package counts, the seed counts and the lane arithmetic are all read off the data at render time.",
          "A method page that hardcodes a number is one data change away from being the least trustworthy page in an application whose entire argument is about trust. There is no figure on it that a reader can catch disagreeing with the screen it describes.",
        ],
      },
      {
        heading: "The section that does the most work is about rows that are not here",
        body: [
          "Round One Entertainment would have been the most entertaining row on the board. Two sources disagreed about where its office is, so the row came out. Nothing on any other screen demonstrates the standard this data was held to as economically as one deleted row.",
          "One deleted row is an anecdote, though, and an anecdote is the easiest thing in the world to pick because it flatters the person telling it. So the section renders the full exclusion list underneath it: every organisation the second research pass found, verified as real, and still refused. A rule applied once is a story. A rule applied every time it fired is a standard.",
          "The removals are split by kind, and the kind is a field on the row rather than a pattern matched against the reason prose. It used to be two names matched with startsWith. That was correct for the nine rows that existed when it was written and quietly mislabelled six of the sixteen added afterwards, because a removal's kind is a property of the removal and was being inferred from its name.",
        ],
      },
      {
        heading: "The invented half is named, and so is the day it stops being invented",
        body: [
          "Naming exactly which parts of the application are invented, and why each one had to exist, costs less than being caught by a reader who worked it out for themselves. The periods, the seeded book, the seeded activity and the seeded replies are all listed with their counts and badged illustrative.",
          "The section after it names the four figures that arrive with real access and replace a stated assumption with a fact, starting with the opening date every period in the application is currently counted backwards from. None of them changes the model. They change the inputs, which is the test of whether a model was built properly in the first place.",
        ],
      },
      {
        heading: "Two duplications, both deliberate, both with a self-check attached",
        body: [
          "The desk weights are retyped into this page rather than imported. The constants are private to the scoring function, and exporting them so a documentation screen could render a table would widen a domain module's public surface for the benefit of prose. The honest cost is drift, so the table prints the maximum it computes from its own rows, and that maximum is 100. Anything other than 100 means the page has fallen out of step with the file it describes.",
          "The contrast table is transcribed rather than measured in the browser for the opposite reason. A live figure measures whatever happens to be on screen at the moment it runs, so it can only report the pairs this page itself paints, and it reports them to a reader who cannot check the working. The transcribed table carries the measured ratio for every pair the theme defines, against all fourteen backgrounds each ink is painted on, and prints the worst of them, because the worst number is the only one that decides anything.",
        ],
      },
    ],
  },

  // =================================================================
  {
    path: "/partners",
    label: "Partners",
    standfirst:
      "The supply side, held as a register of relationships rather than as a list of contacts.",
    sections: [
      {
        heading: "The partner a sales manager needs most is deliberately not on this screen",
        body: [
          "This register answers who we buy from. There is a second kind of partner, the organisation whose audience is already the audience this venue wants, and it is kept off this screen on purpose. The Brea Chamber of Commerce is a route into dozens of member companies rather than a single buyer, and it runs a standing calendar of mixers and ribbon-cuttings. Embassy Suites Brea holds multi-day corporate groups who need an off-property evening. The Chase Suite Hotel holds long-stay project crews with nothing to do after six.",
          "All three sit in the prospect data instead, because they have signed nothing. A supplier register is a record of agreements, and a hotel listed as a partner would be claiming a relationship the venue does not have. That is the same error the licence table at the foot of this screen is fenced against, applied to the other side of the building.",
        ],
      },
      {
        heading: "A referral is a different sale from a booking",
        body: [
          "A booking closes once. It has a date, a deposit and an end. A referral closes once and then produces bookings nobody had to call for, which makes it worth more and take longer. The two are sold differently and a rep who runs one call as the other gets neither.",
          "A referral also converts in a different place. A hotel sales director will not recommend a building they have not walked, which is why the hard hat tour is offered to hospitality and civic, schools, corporate and colleges, and is not offered to a twelve person shop half a mile away that will see the finished building from the pavement. The tour costs no cash and costs the sales manager an hour, and before opening those hours are the scarcest thing the role has.",
          "The trap is measurement. A referral produces nothing in the week it is made, so a floor measured only on this month's signed revenue stops making them by about week six. That is why activity is coached and revenue is managed and the two only ever meet as a ratio.",
        ],
      },
      {
        heading: "Days since last worked is the repeat sales discipline, already built",
        body: [
          "The column that opens this table sorted is the same instrument a repeat sales campaign runs on. The posting asks for communicating and nurturing customer relationships and driving repeat sales. This is what that request looks like when somebody has built it rather than promised it: the coldest relationship on screen first, computed at render, whether or not anybody thought to ask.",
          "The failure is identical on both sides of the building. Four months pass, the person who knew you leaves, and the next conversation starts from nothing with a stranger who has no reason to do you a favour. A school that ran a night last October is exactly as easy to lose as a printer is, and exactly as cheap to keep.",
        ],
      },
      {
        heading: "A register, because a contact list cannot answer the expensive question",
        body: [
          "A contact list answers who we buy from. Nobody has ever lost money on that question. What costs money is the question a contact list cannot answer: which of these relationships is quietly dying.",
          "Supplier relationships do not end with a letter. Four months pass, the person who knew you leaves, and the next quote comes back at list price from a stranger with no reason to hold a press slot for you. So every row carries days since last worked, computed at render against a fixed as-at date rather than the reader's clock, and the table opens sorted by it. The coldest relationship is the first thing on screen whether or not anybody asked to see it.",
        ],
      },
      {
        heading: "One real company, and the one row where the badge does not do enough",
        body: [
          "Nature's Mark is a real company and it publishes a real list of licensed properties. Three things on this screen are badged public: the licence names, the count of twenty four published retailers, and the Nature's Mark row on the register itself. The lists were read off natures-mark.com on 13 August 2026 and carry the URL.",
          "Every lead time, every minimum order quantity, every date and every dollar figure in the supply data is invented, including the ones on the Nature's Mark row. That row is the weak point in this screen and it is worth stating plainly rather than claiming credit for. It carries one badge, on the row head, and that badge reads public, because what is public is the company and its published licence list. The 120 working day lead time and the 2,400 unit minimum print underneath it with no badge of their own, so a reader scanning the row inherits the public badge over two figures Nature's Mark has never published.",
          "A real company with invented commercial terms under a public badge is the most dangerous shape of row in the application and the easiest one for a reader to take at face value. What holds it today is prose. The note printed on the row says there is no agreement between Main Event and Nature's Mark and none with any licensor on the list, and the framing line in the page header says the same thing in one sentence. That is prose doing a badge's job, and a per-field badge on the lead time and the minimum order is the fix.",
        ],
      },
      {
        heading: "One line above the table, so nobody reads it as a deal",
        body: [
          "A table of Disney, Sanrio and Warner Bros. sitting inside an application about a bowling venue would be read as a deal by anybody scanning it in ten seconds. That Nature's Mark holds those licences is a fact about Nature's Mark. It is not a fact about Main Event.",
          "So the page says, above the table and in one line, that this is reachable capability rather than an existing venue agreement, and that Main Event holds no agreement with any of them. That sentence is not instructional prose about how to use a control. It is a fact about the data, which is the only kind of sentence this application allows on a working surface.",
        ],
      },
      {
        heading: "Harry Potter is recorded as read, not merged",
        body: [
          "Nine properties are named under License Partners on the partners page. Harry Potter is named on the Nature's Mark root page and not on the partners page.",
          "Flattening the two readings into one list of ten would have been tidier and would have made a claim neither page makes. The row is flagged as root page only, its fit note calls it a lead to confirm rather than a licence to plan against, and the coverage table below names which page each property came from.",
        ],
      },
      {
        heading: "Every other supplier is a trade name, and nothing is claimed about manufacture",
        body: [
          "The remaining twelve rows carry descriptive trade names rather than the names of real Brea businesses. A real local printer appearing in a work sample with an invented invoice against it would be a claim about that printer's business. Real local organisations live in the prospect data, and they are there because they are prospects rather than because somebody owes them money.",
          "Nature's Mark names no factory, no country of manufacture and no sourcing route on either page it publishes, so none is named here. Its region field says so in those words rather than being left blank, because a blank field reads as an oversight and a sentence reads as a decision.",
        ],
      },
    ],
  },

  // =================================================================
  {
    path: "/promo",
    label: "Promo stock",
    standfirst:
      "What the promotional programme carries, how much of it has gone out, how much is left, and the statement a licensor would receive.",
    sections: [
      {
        heading: "The fundraiser inverts the cold call",
        body: [
          "Main Event publishes a Spirit Night rate of 20 per cent of sales on the night, donated back to the nonprofit. That figure is on the company's own page, it is badged public on the package and on the offer, and it is the only donation rate in this application a rep can quote to a school without asking anybody. No rate any other operator pays is stated here, because none was read.",
          "So the rate is not what wins these nights. What wins them is who calls first and what the call sounds like. Every other call this venue makes asks an organisation to spend money it has already committed elsewhere. This one offers a school money for a night its families were going to spend at home.",
          "That inversion is the argument. A school office that will not take a call about a group package will take a call about its own fundraising target, because the person answering the phone has that target written down in front of them and no easy way to hit it.",
        ],
      },
      {
        heading: "What one night actually buys",
        body: [
          "The school does the distribution. Flyers go into every backpack, signage goes up in the pickup zone, and the message arrives from the school rather than from an advertiser. There is no line on the spend screen that buys that, at any price.",
          "One night puts the PTA chair, the athletic director and two hundred families inside the building. Every one of those families now knows where the car park is and what the place looks like on a busy evening. The grad night, the team banquet and the birthdays that follow are calls to people who have already been in, which is a different call from the one that starts by explaining where the venue is.",
          "And the venue keeps the other 80 per cent of revenue it would otherwise not have had. Twenty per cent of a night that was not going to happen is not a discount off anything. It is the cost of an audience, paid only if the audience turns up.",
        ],
      },
      {
        heading: "It is the one opening offer that is already true",
        body: [
          "Four opening offers are modelled in this application and exactly one is marked public. The held date, the hard hat tour and the midweek rate lock are proposals and each row says so. Spirit Night is Main Event's own published programme, which means a rep can quote the 20 per cent to a school or a nonprofit today, with no approval from anybody, against a building that has not opened.",
          "It is also worth more now than it will ever be worth again. The calendar at 245 W Birch St is empty, so the school gets the pick of the nights instead of whatever is left in November, and the venue gets its first two hundred families through the door before there is a single competing booking to argue with over the date.",
        ],
      },
      {
        heading: "The print lines are what outbound work actually spends",
        body: [
          "Voucher books and table tents report as given rather than sold, and print is the one category on this screen that outbound selling consumes directly. A fundraiser night is carried on paper: something that goes home in a bag, something that sits on a table, something a family hands over at the door.",
          "The fundraiser voucher itself is published with a price and a set of terms, and both are on the packages screen: the group buys Play It Forward at $19.95 and resells it at whatever it likes, and the margin is the fundraiser. The sales office needs three business days, which is the same fact this screen makes in units: paper has a lead time, and a night the school has already announced cannot wait for a reprint.",
          "That is why the zero retail lines still carry a cost, a sell-through and a weeks of cover reading. Running out of print in September is what kills a night in November, and it is the same arithmetic that leaves a prize wall empty at half term.",
        ],
      },
      {
        heading: "The report is built on the page, not hidden behind a button",
        body: [
          "Tracking sell-through is a table, and every inventory tool has one. What a licensed programme actually requires is harder: a document that goes to somebody outside your company, states what sold of their property, and states what you owe them for it. That document is the thing a licensor relationship is audited on.",
          "So the statement is generated on the screen, per property and per period, from the same selectors as the table above it, with the royalty-relevant figures set apart. It is not a control labelled export sitting over a function nobody wrote. A work sample whose central artefact is a button is a work sample about buttons.",
        ],
      },
      {
        heading: "This is a third ledger, and nothing ever adds it up with the others",
        body: [
          "Booked revenue is signed event contracts. Outbound activity is hours and carries no money at all. Merchandise money is a third thing, and it is the dangerous one, because it is in dollars and will therefore add up if anybody lets it.",
          "It must not. An eighty dollar plush sell-through and a four thousand dollar grad night are not comparable quantities, and a total of the two would inflate the single figure a hiring manager reads first. Nothing in the application ever adds promotional money to booked revenue or to outbound hours.",
          "The separation is structural rather than a matter of anyone remembering. The promo selectors import nothing from the book provider, this screen shows no booked event revenue anywhere, and the strip at the top says which ledger it is in its own words rather than leaving it to be inferred from the absence of a link.",
        ],
      },
      {
        heading: "No rate is borrowed from the one agreement that has one",
        body: [
          "Only one agreement in the seed schedules any property, and it is a draft that has not been executed. Every property outside it reports no rate on record.",
          "Applying that draft's twelve per cent to a property nobody has agreed twelve per cent for would produce a fabricated royalty statement, which is the worst thing this screen could generate and the easiest one to generate by accident. So the royalty earned line reads not computable without a rate, not estimated, and the gap is left open on the face of the document. This is the part of the programme that is deliberately unfinished, and it is unfinished because finishing it would mean inventing a commercial term between two real companies.",
        ],
      },
      {
        heading: "Nothing is stored that can be derived",
        body: [
          "Each line carries five counted things and nothing else: units in, units out, units on hand, landed cost per unit, and what a guest pays. Sell-through, revenue, margin and weeks of cover are all computed at render.",
          "That is not tidiness. A stored sell-through is a number that was true once. The first time somebody edits a unit count without editing it, the table starts lying, and nobody notices for a month because the figure still looks like arithmetic.",
          "The period a line sits in is separated from the line itself for the same reason: identity does not change between quarters, only the counts do, so a product cannot be filed under one licence in Q2 and a different one in Q3. Q3 is carried as six weeks rather than thirteen because it is the period in progress, and dividing six weeks of sales by a thirteen week denominator would understate every weeks-of-cover reading by more than half, which is exactly the arithmetic that leaves a prize wall empty in September.",
        ],
      },
      {
        heading: "Lines that sell for nothing are reported as given, not sold",
        body: [
          "Voucher books and table tents carry a retail of zero. That is a fact rather than a gap: they are bought with real money and handed out, so they have a cost, a sell-through and a weeks-of-cover reading, and no revenue and no margin at all.",
          "The straightforward arithmetic would have shown them at a negative margin equal to their cost. That is technically right and commercially meaningless, and it would have dragged the programme margin down with a number nobody could act on. They report as given rather than sold, with the cost printed beside them so the money is still visible.",
        ],
      },
    ],
  },

  // =================================================================
  {
    path: "/spend",
    label: "Budget",
    standfirst:
      "What the promotional work costs, against what was set aside for it, and the three things a manager opens a spend screen to find.",
    sections: [
      {
        heading: "What outbound work costs, next to what it is set beside",
        body: [
          "On this budget, the lines that put a person in a school office are the small ones: print, vouchers and table media, and signage and installation. The large lines are merchandise, royalties, freight and catering, and not one of them makes a phone call or stands in a lobby. Every figure here is illustrative, because no operator publishes a promotional budget. The ratio between the lines is the claim, not the digits.",
          "A fundraiser night costs a print run, a table tent and the hours of the person who set it up. Set that against one school lock-in, which Main Event publishes at a 150 guest minimum, or a corporate buyout at a 200 guest minimum, and the arithmetic is not close. The cheapest category on this screen is the one that fills the calendar.",
        ],
      },
      {
        heading: "The scarcest budget in the building has no line on this page",
        body: [
          "Nothing here budgets the sales manager's hours, and before opening those hours are the only real constraint. The hard hat tour costs zero cash. The go-see costs zero cash. Both spend the one thing the venue has least of, and a spend screen that counts only dollars reports them as free, which is how a diary fills up with work that was never chosen.",
          "So the hours are counted on the other side of the application, on the field page and on the book, and the only figure that ever puts the two together is a ratio: hours outside the building per thousand dollars booked. It is a ratio because a ratio compares without adding, and because a manager needs to know whether the hours are working while there is still a quarter left to change them.",
        ],
      },
      {
        heading: "Print has a lead time, so the calendar decides when money is committed",
        body: [
          "An order raised in August against goods expected in December is the ordinary shape of this work, and it is on this screen. For outbound selling that has one consequence worth saying plainly: material for a November night is ordered in September or it does not exist, and no amount of urgency in October produces it.",
          "That is why committed money is the version of the budget question this screen answers. Unpaid invoices plus the uninvoiced part of every open order is the money a manager can still do something about. Money already spent is history and reads well. Money committed is a decision that is still available, and it is the only one worth a meeting.",
        ],
      },
      {
        heading: "Three exceptions first, then the ledger",
        body: [
          "Nobody opens a spend screen to read a ledger. They open it to find out three things, so those three are the top of the page: what is over budget, what is past due, and what renews next.",
          "Everything below them is the evidence for them, in the order the money hardens: budget, then purchase orders, then invoices, then the terms all of it was agreed under. The four are separate types with four different failure modes. A budget fails by being exceeded quietly. An order fails by sitting in draft while everybody believes it was sent. An invoice fails by ageing past its terms while nobody owns it. A contract fails by renewing itself on a date nobody diarised. One flat table of transactions cannot answer any of the four.",
        ],
      },
      {
        heading: "Over budget counts money that has not been spent yet",
        body: [
          "The simpler reading is spend against ceiling. Read that way, both of the lines that are actually over would have looked comfortably inside. Print, vouchers and table media has paid $3,060 against a $3,600 budget. Apparel and uniform has paid $7,680 against $14,000. Neither has spent its ceiling and both are over it, by $390 and by $108, and every dollar of the difference is money that has been committed and not yet paid.",
          "So committed money counts: unpaid invoices plus the uninvoiced part of every open purchase order. Across the eight lines that is $76,831 committed, of which $19,025 sits in open orders nobody has invoiced yet, the largest single piece of it PO-2026-104 at $18,400 raised, $9,200 invoiced and $9,200 still to come. That is the money a manager can still act on, and it is the only version of the question worth asking before the invoice arrives. Draft and cancelled orders commit nothing, which is what makes a draft order a real state rather than a formality: the two largest orders on the register, PO-2026-101 at $46,200 and PO-2026-102 at $25,000, are both drafts and neither one moves a budget line.",
        ],
      },
      {
        heading: "Invoices age from the due date, not the issue date",
        body: [
          "Ageing from the issue date is the common default and it punishes suppliers for terms you agreed to. An invoice on sixty day terms is not late on day thirty one, and a screen that says it is will have somebody chasing a payment that is not owed.",
          "Terms are the entire reason a due date exists, so the buckets are measured from it. A disputed invoice ages anyway, because the argument being unsettled is not the same as the money not being owed, and an invoice that stops ageing the moment somebody disputes it is an invoice nobody ever comes back to.",
        ],
      },
      {
        heading: "The notice date is derived, because no contract carries it",
        body: [
          "An auto-renewing agreement has a start date, an end date and a notice period, and none of those is the date that decides anything. The date that decides is the last day notice can be served, which appears on no contract as a field.",
          "It is computed from the end date and the notice period, printed on every row, and flagged when it is close. The nearest renewal on the register is the Ticket Wall Supply master terms, which end on 30 September 2026 and renew themselves automatically on thirty days' notice. That puts the date that decides it at 31 August, eighteen days out from the as-at date, and it is the only row on the register the screen flags. A reader looking at the end date alone would think there was a month and a half to think about it.",
          "The one licensed agreement in the set is titled as a draft and is not executed, and both purchase orders against it sit in draft and commit nothing. That matches the register on the partners screen, which shows that relationship as in talks. Anything else here would be a claim about two real companies.",
        ],
      },
      {
        heading: "This money is never totalled with the book",
        body: [
          "This screen shows costs. The promo screen shows the merchandise revenue those costs produced. The book shows booked event revenue and outbound hours, and touches neither of the other two.",
          "Promotional money is a third ledger and nothing in the application ever adds it to booked revenue or to outbound hours. A single grand total across the three would be arithmetic that runs cleanly and describes nothing anybody could manage.",
          "Every figure on this screen is invented for the prototype and badged as such. Neither Main Event nor Round1 nor Nature's Mark publishes a promotional budget, a unit cost, a royalty rate or a payment term. The model is the claim being made here. The numbers are furniture.",
        ],
      },
      {
        heading: "The interesting row on a match desk is the mismatch, not the clean one",
        body: [
          "Cost control is not cost reporting. An order, a goods receipt and an invoice agreeing in pairs is the normal case, and it is also how a supplier gets paid for goods that never arrived. Three documents make three comparisons and each catches something the other two cannot. Order against receipt catches a short delivery, and nothing on the invoice will ever reveal one. Receipt against invoice catches billing for goods that did not turn up, and it is the comparison that gets skipped, because the invoice usually agrees with the order and agreeing with the order looks like agreement. Order against invoice catches a price that moved after the order was placed.",
          "Fifteen goods orders sit on the desk and the argument is in four of them. PO-2026-105 arrived forty eight pieces short of nine hundred and sixty, was billed for all nine hundred and sixty and was paid on 11 June, so the money has left and the only remedy is a credit note against the next order. PO-2026-112 is the right quantity from the right supplier in the right week at twenty cents a unit above the order, which is $660 nobody agreed to, and nothing about the total looks wrong until it is divided by three thousand three hundred. PO-2026-109 is billed in full for forty pieces that have not shipped. PO-2026-114 delivered a hundred and twenty pieces more than were ordered and billed only for the three thousand, which is free stock and still a variance, because it was not ordered, it was not budgeted, and next time it may be billed.",
          "Four grades rather than pass and fail, because a desk that paints every unmatched order red teaches its reader to ignore red. Matched, not yet matchable, query, and fails the match. A failure needs two things at once: the documents disagree, and the money is moving, meaning an invoice against that order is approved for payment or already paid. The same disagreement on an invoice still sitting in received is a query, because it is still catchable. Grading on the disagreement alone would have painted a problem and a loss in the same colour.",
          "The desk sits under a second reading of the same orders, which is where the goods physically are. The accounting state answers how much money can still be pulled back, and it cannot tell an order in production from a purchase order nobody at the far end ever read. So seven goods and money milestones run beside the accounting state and are never merged into it. There is no stored stage: there are milestone dates, and the stage is the furthest milestone reached, worked out at render. A stored stage next to stored dates is two facts that can disagree, and the first person to set a shipped date without touching the stage gets a rail saying acknowledged about a container already at sea. The rail is also not a progress bar, because a bar that fills from the left would draw an order invoiced before it shipped as though it had shipped, and the hole in the middle is the entire finding.",
        ],
      },
      {
        heading: "Compliance splits into what arithmetic can settle and what needs a person",
        body: [
          "The posting puts compliance with contract terms in the same sentence as budgets, purchase orders and invoices. Almost every screen that claims to do it shows a green tick per agreement, which is one person's opinion rendered as a control. A term can be checked mechanically when it is a number or a date on one document against a number or a date on another. That is a small set. Nine of them run on this screen, and the value of the nine is entirely in the reader knowing they are the only nine.",
          "Three outcomes, never two: pass, fail, and cannot check. The third is the one that gets dropped, and dropping it is how a screen reports a hundred per cent pass rate on a supplier with no agreement on file at all. Three suppliers here are being invoiced with nothing on the register behind them, Grad Night Print Bureau, Freeway Sign Works and Crew Uniform Supply, and their invoices are being paid on terms nobody wrote down. A payment terms check that quietly skipped them would have hidden the most useful thing on the page. Where the agreement does exist, the check has something to catch: INV-2026-3339 is billed on seven days against the fourteen the freight terms carry, and a supplier who shortens their own terms on the invoice gets paid early by any process that reads the invoice instead of the agreement.",
          "The other half is longer and it is listed as work rather than as status. Eight terms, each with why arithmetic cannot settle it, what would settle it, and the live example on this register where there is one. Product quality and safety, licensor artwork approval for the promotion, brand and audience fit, factory standards and country of manufacture, territory and window, over-run and under-run allowances, the deposit share on a pilot, and current insurance certificates. PO-2026-110 is the whole argument in one row: four hundred ordered, four hundred received, four hundred billed at the agreed price, on time, and disputed anyway, because what is wrong with the delivery is colourfastness. Every arithmetic check on the page passes it and no machine on the page can see it.",
          "Modelling those eight anyway, giving each a field and a green tick, would have been the most dishonest thing in the application, because failing to notice that difference is the exact failure a buyer is hired to prevent. The insurance row states what would move it across the line: certificates on file with expiry dates, which would make it the tenth mechanical check rather than the eighth judgement. The line between the two lists is the point of the section, and the second list is the longer one.",
        ],
      },
      {
        heading: "The two licensed orders fail the licence checks by construction",
        body: [
          "Two of the fifteen goods orders carry a licensed property, and both fail both licence checks. PO-2026-105 carries Sanrio through an apparel supplier that holds no licence on the register. PO-2026-119 carries Coca-Cola through a prize redemption supplier that holds none either. The only agreement on the register that schedules either property is the Nature's Mark licence schedule, and that row is titled as a draft and is not executed.",
          "That is a decision rather than an oversight, and it is worth arguing rather than hiding. Seeding an order that passed would have required an executed agreement between Main Event and a real licensor, and there is no such agreement. Inventing one would have been the easiest fabrication in the whole application to get away with, because a green tick on a licence check is the most reassuring thing a compliance screen can print and nobody checks a tick.",
          "So the checks run, they fail, and both failures are named on the face of the page with the order reference against them. The rest of the application agrees: the partner register shows that relationship as in talks, and the two purchase orders raised against the draft sit in draft state and commit nothing. A reader who wants to know what a passing licensed order would look like can read the two clauses and the two tests, which is worth more than a tick they would have had to take on trust.",
          "One weakness in this is written down rather than buried. A draft is detected from the word DRAFT in the contract title, because the contract type carries no executed flag and this screen will not add a field to a type it does not own. The day that type grows the field, the check reads it and the title marker goes.",
        ],
      },
      {
        heading: "Every reliability rate prints what it was divided by",
        body: [
          "The posting asks for supplier reliability to be evaluated before purchase, and for costs, terms and delivery schedules to be negotiated with vendors and licensors. Neither is answerable with a dollar total. What answers both is a record of what each supplier actually did, and the whole worth of a record is in its denominator. A supplier who is one from one and a supplier who is eighty from eighty are both at a hundred per cent, and only one of them is worth saying out loud in a negotiation. So every rate on the table prints its count over its base.",
          "On time runs over orders the buyer has closed, and that is the line worth defending. Counting an order that has not arrived as a miss punishes a supplier for a date that has not come. Counting it as a hit lets a supplier improve their score by never delivering. So the rate runs over orders that finished, the count of open orders sitting past their promise is reported beside it as its own number, and neither is folded into the other.",
          "A supplier with no closed order is not scored zero. Zero is a claim about performance, and the truthful statement is that there is nothing to score yet, so the cell reads not yet rated and names the denominator it is missing. Freight, catering and the print bureau are invoiced without any goods receipt, so they carry no delivery record here and no rate is invented for them.",
          "The table carries no row tint, deliberately. Five of the seven suppliers have something against them, and a table where five rows are red teaches its reader that red means nothing, so the cells that are wrong carry the emphasis and the row carries the record. What the table is for is the next conversation: a supplier who is three of four on time and one of four on price has handed a buyer two specific things to ask for, and asking for those two is worth more than asking for a discount. None of it is a judgement about product quality, which is the other list and a sample nobody on this page has held.",
        ],
      },
    ],
  },

  // =================================================================
  {
    path: "/sellthrough",
    label: "Sell-through",
    standfirst:
      "The document that leaves the building: what was bought, what moved, where the units went, and what that implies for the next order, written for the party who owns the property.",
    sections: [
      {
        heading: "The statement is the document that earns the next order",
        body: [
          "The posting says it twice, and both times the word is external. \"Track sales performance of promotional products and create detailed internal and external sales reports for licensors.\" \"Provide accurate and timely reports to both internal stakeholders and external licensors.\" Three surfaces in this application already answer the supply side from the inside. Partners is the register of who can make what, promo stock is the internal table, budget is the money that bought it. All three are read by somebody who works here. This one is read by somebody who does not.",
          "A licensor renews on the quality of what they receive as much as on the units in it. A statement that arrives on time, states its window, names every divisor and says which figures are derived is a licensee who can be trusted with a bigger assortment next season. A statement that arrives late, as a rate with no denominator, is a licensee who gets asked for an audit. The units can be identical in both cases. The reporting is the part that is under the licensee's control, and it is cheap.",
          "So the screen is a document first. Everything below the control strip is set to print black on white on letter paper, because the artefact is a thing a licensor receives rather than a thing a manager scrolls. The ranking above it is internal, says so in its own words, and is marked to stay off the sheet. The statement carries a reference a person can quote back on the phone, the window it covers, the date it was prepared, and a line saying whether the window is closed or still running, because six weeks of sales read as a quarter of sales unless somebody says otherwise.",
        ],
      },
      {
        heading: "The licensor's own brand name is read off the register, never typed",
        body: [
          "The public facts on this screen are the nine property names and the five retailers cited at the foot, and the provenance block puts both under one public badge and one URL. The property names are not typed on the screen. They are read off the licence register the partners screen uses, which was read off the Nature's Mark partners page on 13 August 2026, filtered to the properties that page actually names. Copying a brand into a second file is how a full stop goes missing from a document addressed to the party who owns the trademark.",
          "It is a small thing and it is entirely the job. A misspelled property on an internal table is a typo. The same misspelling on an outward statement is what the licensor reads first, and it is read as carelessness about their asset rather than about the file. Harry Potter is excluded by the same flag the register uses, because it is named on the Nature's Mark root page and not on the partners page, and a statement is not the place to resolve a discrepancy between two readings of two pages.",
          "The five retailers cited at the foot of the statement come off the same published page, which names twenty four. They are there because they are the part of that page a reader takes as evidence rather than as a claim: a supplier already shipping licensed product into named doors has passed those retailers' own compliance. The full list is not copied here either, and the check below refuses any name the published list does not carry.",
        ],
      },
      {
        heading: "Where the units went, because a unit count is not a read",
        body: [
          "Promo stock counts units out. A licensor asks where they went, and the buyer negotiating the next agreement needs to know, because a thousand units off the prize wall and a thousand units over the counter are the same number and a completely different fact about the property.",
          "Four channels, and the statement prints what each one is evidence of. A counter sale is a guest choosing the property and paying retail for it, which is the strongest evidence of demand on the sheet. A prize wall redemption is tickets already earned, so it says the property is chosen and says nothing at all about price. A package inclusion is the venue choosing on the guest's behalf, so it is movement rather than demand. An event giveaway is bought with real money and handed over, which is a cost with no revenue against it. A flat sell-through figure cannot tell those four apart, and only the first two are evidence anybody should reorder on.",
          "Rudolph carries two channel rows at zero rather than no rows at all. Fifteen hundred units landed in the closed quarter and none of them moved, and by the quarter in progress there are two thousand four hundred on hand and still nothing sold. That is correct in August and would be a disaster in January. A statement that silently dropped the property would let a reader assume it was never stocked, and a property that moved nothing is a finding rather than an absence.",
        ],
      },
      {
        heading: "The recommendation is judged against this venue's horizon, not against somebody's factory",
        body: [
          "The statement ends on a decision, because a report that stops at a percentage leaves the reader to do the work and then argues about the answer. Four bands: nothing moved, order before the next window, holds to the next window, do not reorder. Each prints its own test and what it means for the next order, and the whole rule table is printed under the recommendation so it can be checked rather than believed.",
          "The obvious test is cover against the manufacturer's lead time, and that is exactly the test the internal table on promo stock runs, against the illustrative lead times the register carries. This document will not run it. No source read for this application publishes a lead time for any manufacturer of these nine properties, and printing that cover is under the lead time on an outward document would put an invented figure about a real company into a sentence that reads as fact.",
          "So the test is cover against a declared eight week horizon, which is this venue's own replanning cycle and is a statement about the venue rather than about anybody's factory. The horizon is printed next to every band it produces, in those words. Twenty six weeks is the overstocked threshold, and it is the same twenty six promo stock uses, because two surfaces disagreeing about what too much stock means would be a worse defect than either threshold being wrong.",
          "Nothing else is on the sheet either. No factory, no country of manufacture, no minimum order quantity, no unit cost attributed to any real company, and no property Nature's Mark does not name. The provenance block at the foot lists those absences by name, so a reader can see they were decided rather than forgotten.",
        ],
      },
      {
        heading: "Three things this screen refuses to ship quietly",
        body: [
          "All three would look like working software. A statement raised against a licence list that has moved. A retailer cited that nobody published. A channel split that adds up to a different sales figure than the stock report it was taken from. All three throw at module load instead, where a person sees them, rather than on paper in front of a licensor.",
          "The first counts the register: if the published page stops carrying nine names, no statement is raised at all until somebody looks at why. The second refuses any cited retailer the published list of twenty four does not hold, so a statement cannot cite a door into existence. The third is the one that matters most: for every property in every window, the channel split is summed and compared with the units out already seeded on promo stock, and any difference stops the application with both numbers in the message.",
          "A report that quietly disagrees with the operator's own numbers is worse than no report. It is the defect in this trade that ends a relationship rather than costing a phone call, and it is exactly the defect that survives review, because both figures look like arithmetic and neither is obviously the wrong one. Failing at load is the cheapest place to put it.",
        ],
      },
      {
        heading: "Two sell-through figures, on purpose, and both print their divisor",
        body: [
          "This statement divides units moved by units available, where available is opening stock plus units received and is also units moved plus closing stock. The line table on promo stock divides by units received plus units on hand, which is the reconstruction that table can support from what it stores. The two agree wherever a window opened and closed on the same stock level, and differ everywhere else.",
          "Neither is hidden. Both surfaces print the divisor beside the percentage, which is the standing rule here and the only reason two honest figures can sit in one application without one of them being a bug. The alternative was to force one definition onto both surfaces, which would have quietly changed what the internal table means in order to make a document tidier.",
          "The same rule governs the window. The quarter in progress is six weeks, not thirteen, and every per week figure divides by the six. Dividing six weeks of sales by a thirteen week denominator would understate every cover reading by more than half, which is the arithmetic that leaves a prize wall empty in September. The comparison against the window before says the two windows are different lengths, so the points move and the volumes are not comparable.",
          "Opening stock is reconstructed as closing plus moved less received, and the statement then checks that figure against the closing stock reported for the window before and prints the result on its own face. For all nine properties it lands exactly. That is a check a reader can see, rather than a reconciliation the writer says they did.",
        ],
      },
      {
        heading: "Nothing derived is stored, and the one drawn mark is drawn for a mono printer",
        body: [
          "There is no sell-through figure, no margin, no weekly rate and no cover figure stored anywhere in the seed. All four are computed at render and printed beside the number they were divided by. A stored rate is a number that was true once, and the first edit that misses it starts a quiet lie that still looks like arithmetic.",
          "Where a rate has no divisor, the statement says so instead of printing a zero. Nothing moved means there is no weekly rate to divide closing stock by, so weeks of cover reads not computable and is not estimated. Nothing sold means there is no gross sales figure to take a margin over, so the landed cost of what was received is printed in its place. A zero in either cell would read as a measurement.",
          "The one figure on the page is inline SVG written for this page: no icon set, no chart library, nothing that animates. Available stock is one length split into what moved and what is left, and the remainder is hatched rather than tinted, because the destination is a mono laser printer on somebody else's desk and two solid blocks in two hues come out as one grey block on that sheet. Shape carries the meaning and colour is the second signal, which is the rule everywhere else in this application.",
          "The arithmetic lives in the page rather than in a selector file, because nothing else reads it. The moment a second surface needs one of these figures it moves there whole, and until then a selector with one caller is a file somebody has to open to find out it does nothing surprising.",
        ],
      },
    ],
  },
];
