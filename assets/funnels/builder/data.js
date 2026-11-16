/* Landing page builder data: wording angles (each with a sourced reason), sections, templates, palettes, fonts.
   All wording is original. Patterns come from research in docs/research/2026-11-16-memorial-preneed-industry.md, section 10.
   {name}, {phone}, {area}, {license} are filled from the brand panel. Square brackets mark text the client must supply. */
(function (G) {
  var FB = G.FB = G.FB || {};

  FB.ANGLES = {
    gift:      { name: 'A gift to your family', why: 'Dignity Memorial ranks "your loved ones can focus on remembering and healing" as the top reason families give for planning. Leading with what the family gets, not what the plan costs.', src: ['Dignity Memorial', 'https://www.dignitymemorial.com/pre-planning/funeral-costs/prepaid-funeral-plans-make-the-best-gift'] },
    choice:    { name: 'Your choices, your way', why: 'Control is the second big motive: "you get to choose exactly what you want" is Dignity Memorial\'s first reason, and Leading Response hears "I get to decide this" from planners.', src: ['Leading Response playbook', 'https://leadingresponse.com/?p=27398356'] },
    noguess:   { name: 'No guessing, no rush', why: 'Families without a plan make every choice in the first few days. Dignity Memorial lists "won\'t need to worry about getting it wrong" and "won\'t have to face quick decisions".', src: ['Dignity Memorial', 'https://www.dignitymemorial.com/pre-planning/funeral-costs/prepaid-funeral-plans-make-the-best-gift'] },
    price:     { name: 'Price up front', why: 'Tulip Cremation puts a price on the page and links the full price list. In California, a funeral home with a website must post its general price list online anyway (B&P 7685).', src: ['California B&P 7685', 'https://california.public.law/codes/business_and_professions_code_section_7685'] },
    guide:     { name: 'Free guide first', why: 'Neptune Society and Dignity Memorial both lead with a free planning guide. It asks for an email, not a meeting, which suits people who are not ready to talk.', src: ['Neptune Society', 'https://neptunesociety.com/resources/cremation-planning/plan-now'] },
    talk:      { name: 'Start the conversation', why: 'A free conversation card giveaway brought two funeral homes 10 and 12 leads, spending under 50 dollars combined, with 57 to 71 percent of clicks turning into leads.', src: ['Funeral Innovations', 'https://funeralinnovations.com/old/converting-have-the-talk-of-a-lifetime-message-into-10-leads-in-5-days'] },
    event:     { name: 'Free lunch talk', why: 'Seminars at libraries and senior centers ("getting your affairs in order") are a standard pre-need offer, promoted as a Facebook event.', src: ['FrontRunner', 'https://blog.frontrunnerpro.com/funeral-preneed-leads-facebook'] },
    eligible:  { name: 'Plain eligibility facts', why: 'For insurance-funded plans, plain facts (state, age band, no medical exam, fixed rate) clear Meta\'s quality filter. Fear hooks get throttled as sensational and pull worse leads. Every fact must be true for the carrier.', src: ['Elevarus', 'https://elevarus.com/final-expense-ad-hooks-that-convert/'] },
    lifestyle: { name: 'Daily life first', why: 'Senior living ads that lead with daily life tend to test better; care details belong on the page. A testimonial video beat a static image by 4 percent in Brookdale\'s test.', src: ['WebTonic', 'https://www.webtonic.io/blog/senior-living-ad-creative-statistics'] },
    caregiver: { name: 'For the adult child deciding', why: 'The person deciding is usually an adult daughter. Speak to her worries: cost, safety, and whether staff will know her parent.', src: ['WebTonic', 'https://www.webtonic.io/blog/senior-living-ad-creative-statistics'] },
    veteran:   { name: 'Benefits they earned', why: 'VA burial benefits are real money and honors that many families never claim. Veteran pre-need marketing is a proven niche.', src: ['Funeral Innovations, veterans', 'https://funeralinnovations.com/home/success-profile-marketing-preneed-to-a-niche-market-veterans'] },
    now:       { name: 'Calm help now', why: 'Someone who just lost a person needs a phone number and a calm voice, not marketing. Tulip splits "I need to arrange a service now" from "I\'m planning ahead" at the top of the page.', src: ['Tulip Cremation', 'https://www.altogetherfuneral.com/funeral-cremation/locations/tulip-northern-california'] }
  };

  var PLAN_STEPS = { h: 'Three steps, at your own pace.', s1t: 'Read the guide', s1: 'Every choice explained in plain words, with the full price list.', s2t: 'Talk if you want to', s2: 'Book a call with a planner, or don\'t. Both are fine.', s3t: 'Put it in writing', s3: 'Your wishes on file, shared with the people you choose.' };

  FB.SECTIONS = {
    hero: {
      name: 'Hero', group: 'Top of the page', desc: 'Headline, one line under it, and the main button.',
      layouts: [['split', 'Text and picture'], ['center', 'Centered'], ['band', 'Dark band']],
      fields: [['eyebrow', 'Small line above'], ['h', 'Headline'], ['sub', 'Line under the headline', 1], ['cta', 'Button'], ['note', 'Small print under the button']],
      variants: {
        gift: { eyebrow: 'Planning ahead', h: 'Give them time to remember, not decisions to make.', sub: 'Write down your wishes and settle the plan now, so the week your family needs it is about you, not paperwork.', cta: 'Get the free planning guide', note: 'No call unless you ask for one.' },
        choice: { eyebrow: 'Planning ahead', h: 'Your service, the way you would want it.', sub: 'Burial or cremation, a big gathering or a quiet one. Choose it yourself, on paper, with every price listed.', cta: 'Start my plan', note: 'Change your mind any time before it is needed.' },
        noguess: { eyebrow: 'Planning ahead', h: 'Plan it once, so your family never has to guess.', sub: 'Without a plan, a family makes every choice in the first few days, while grieving. A written plan turns that into one phone call.', cta: 'Get the free planning guide', note: 'Free. About a minute.' },
        price: { eyebrow: 'Cremation and funeral plans', h: 'Plans with the price on the page.', sub: 'See what is included and what it costs before you talk to anyone. Our full price list is one tap away.', cta: 'See plans and prices', note: 'Prices in writing before you sign anything.' },
        guide: { eyebrow: 'Free planning guide', h: 'The planning guide families ask us for.', sub: 'What things cost, what to decide first, and how to bring it up with your family. Free to download.', cta: 'Email me the guide', note: 'No call unless you ask.' },
        talk: { eyebrow: 'Free conversation cards', h: 'The talk nobody wants to start, made easier.', sub: 'A free set of question cards to help your family talk about wishes over dinner, not in a hospital hallway.', cta: 'Send me the cards', note: 'Mailed or printable. Free.' },
        event: { eyebrow: 'Free lunch talk', h: 'Getting your affairs in order, over lunch.', sub: 'An hour on wills, funeral choices and benefits, with time for questions. Lunch is on us, and nothing is sold at the table.', cta: 'Save my seat', note: '[Date] at [library or senior center].' },
        eligible: { eyebrow: 'Funeral plans funded by insurance', h: 'California residents 50 to 85: a funeral plan with a fixed monthly rate.', sub: '[Confirm with the carrier] No medical exam on most plans, and the rate is set the day you start. A licensed agent confirms what fits.', cta: 'Check my options', note: 'Not a quote. Coverage depends on the carrier.' },
        lifestyle: { eyebrow: 'Senior living', h: 'Mornings with friends. Help whenever they want it.', sub: 'Independent, assisted and memory care in one community. Come for lunch and see an ordinary day.', cta: 'Book a tour', note: 'No deposit to visit.' },
        caregiver: { eyebrow: 'Care for a parent', h: 'Find the right care for Mom or Dad, and see it in person.', sub: 'A two-minute care check suggests a level of care. Then visit, meet the staff and ask everything you want to ask.', cta: 'Start the care check', note: 'Nothing to sign.' },
        veteran: { eyebrow: 'Veteran families', h: 'They served. Their benefits belong in the plan.', sub: 'Burial in a national cemetery where space allows, a headstone, a flag and an allowance may apply. We help you file.', cta: 'Check veteran benefits', note: 'Eligibility applies. We check it with you.' },
        now: { eyebrow: 'Help now, day or night', h: 'We are here. Call, and we will take it from there.', sub: 'A director answers, day or night. Nothing has to be decided tonight.', cta: 'Call {phone}', note: 'Or leave your number and we will call you.' }
      }
    },
    picker: {
      name: 'Situation picker', group: 'Top of the page', desc: 'Sends each visitor down the right path first.',
      fields: [['h', 'Question'], ['a', 'Choice one'], ['b', 'Choice two'], ['c', 'Choice three']],
      variants: { base: { h: 'What brings you here today?', a: 'I am planning ahead', b: 'I need help now', c: 'Care for a parent' } }
    },
    trust: {
      name: 'Trust line', group: 'Trust', desc: 'Three short promises, each one true for the business.',
      fields: [['t1', 'Promise one'], ['t2', 'Promise two'], ['t3', 'Promise three']],
      variants: {
        base: { t1: 'Every price online', t2: 'A named planner, not a call center', t3: 'No pressure, ever' },
        price: { t1: 'Full price list online', t2: 'Prices in writing before you sign', t3: 'Licensed: {license}' },
        veteran: { t1: 'We file the VA paperwork with you', t2: 'Flag and honors arranged', t3: 'Every price listed' },
        lifestyle: { t1: 'Independent, assisted and memory care', t2: 'Tours led by a care guide', t3: 'No deposit to visit' },
        caregiver: { t1: 'A nurse confirms the care plan', t2: 'Meet the staff before any move', t3: 'No deposit to visit' },
        eligible: { t1: 'A licensed agent, not a call center', t2: 'Rates in writing first', t3: 'Cancel within the free-look period' },
        now: { t1: 'A person answers, day or night', t2: 'Prices given in writing', t3: 'Nothing to sign tonight' }
      }
    },
    steps: {
      name: 'How it works', group: 'Explain', desc: 'Three steps so nobody wonders what happens next.',
      fields: [['h', 'Heading'], ['s1t', 'Step one'], ['s1', 'Step one detail', 1], ['s2t', 'Step two'], ['s2', 'Step two detail', 1], ['s3t', 'Step three'], ['s3', 'Step three detail', 1]],
      variants: {
        base: PLAN_STEPS,
        lifestyle: { h: 'From not sure to a visit, in a week.', s1t: 'Check the fit', s1: 'Tell us where they need a hand, and we suggest a level of care.', s2t: 'Visit in person', s2: 'Tour with a care guide, meet the staff, stay for a meal.', s3t: 'Assessment', s3: 'A nurse visits to confirm the care plan before any move.' },
        caregiver: { h: 'What happens after the care check.', s1t: 'You get a suggestion', s1: 'A level of care that fits how they live now, in plain words.', s2t: 'You visit', s2: 'Bring your questions, and your parent if they want to come.', s3t: 'A nurse confirms', s3: 'Nothing is decided until the care plan is checked in person.' },
        eligible: { h: 'How it works.', s1t: 'Answer a few questions', s1: 'Age, state and a few health questions, depending on the plan.', s2t: 'Pick an amount', s2: 'Enough to cover the funeral you want, and see the monthly rate.', s3t: 'Name who it pays', s3: 'The money goes to the funeral home or a person you choose.' },
        now: { h: 'What happens when you call.', s1t: 'We talk', s1: 'A director listens, answers your questions and explains the next few hours.', s2t: 'We bring them into our care', s2: 'At a time that is right for your family.', s3t: 'We meet when you are ready', s3: 'Choices and prices, in person, in writing.' },
        event: { h: 'What the hour covers.', s1t: 'Wills and trusts', s1: 'What each one does, and what happens without either.', s2t: 'Funeral choices', s2: 'Burial and cremation, and what each one costs.', s3t: 'Benefits', s3: 'What the VA and Social Security may pay.' }
      }
    },
    prices: {
      name: 'Plans and prices', group: 'Offer', desc: 'Three plans with prices and what each includes.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1], ['p1n', 'Plan one'], ['p1d', 'Plan one includes', 1], ['p1p', 'Plan one price'], ['p2n', 'Plan two'], ['p2d', 'Plan two includes', 1], ['p2p', 'Plan two price'], ['p3n', 'Plan three'], ['p3d', 'Plan three includes', 1], ['p3p', 'Plan three price']],
      variants: { base: { h: 'Plans and prices.', sub: 'Every plan in writing, with the full general price list linked below.', p1n: 'Direct cremation', p1d: 'Transfer, cremation, a simple urn and the paperwork.', p1p: '[Price]', p2n: 'Cremation with a service', p2d: 'Everything in direct cremation, plus a memorial service with our staff.', p2p: '[Price]', p3n: 'Funeral with burial', p3d: 'Viewing, ceremony, casket and transport to the cemetery.', p3p: '[Price]' } }
    },
    guide: {
      name: 'Free guide offer', group: 'Offer', desc: 'A lead magnet with a short form.',
      fields: [['h', 'Heading'], ['b1', 'Point one'], ['b2', 'Point two'], ['b3', 'Point three'], ['cta', 'Button'], ['fine', 'Small print']],
      variants: {
        base: { h: 'Get the free planning guide.', b1: 'What each choice costs, line by line', b2: 'The questions to ask before you sign anything', b3: 'A page to fill in and share with family', cta: 'Email me the guide', fine: 'No call unless you ask. Unsubscribe any time.' },
        talk: { h: 'Get the conversation cards.', b1: 'Questions that make the talk easier', b2: 'Works over dinner or on a phone call', b3: 'Mailed to you, or printable today', cta: 'Send me the cards', fine: 'Free. No call unless you ask.' },
        veteran: { h: 'Get the veteran family checklist.', b1: 'What the VA may cover, and how to apply', b2: 'The papers to find, including the DD-214', b3: 'How to request military honors', cta: 'Email me the checklist', fine: 'Eligibility applies. No call unless you ask.' },
        eligible: { h: 'See sample rates for your age.', b1: 'Monthly rates for a few coverage amounts', b2: 'Which plans ask health questions', b3: 'How the first two years work', cta: 'Check my options', fine: 'Not a quote. A licensed agent confirms rates.' },
        caregiver: { h: 'Get the family guide to choosing care.', b1: 'Independent, assisted and memory care, explained', b2: 'Questions to ask on every tour', b3: 'What care costs, and what may help pay', cta: 'Email me the guide', fine: 'No call unless you ask.' }
      }
    },
    seminar: {
      name: 'Lunch talk sign-up', group: 'Offer', desc: 'An event card with date, place and a seat button.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1], ['when', 'Date and time'], ['where', 'Place'], ['cta', 'Button']],
      variants: { base: { h: 'Getting your affairs in order: a free lunch talk.', sub: 'An hour with time for questions. Bring a friend or your adult children.', when: '[Day, date] · [Time]', where: '[Library or senior center], {area}', cta: 'Save my seat' } }
    },
    callback: {
      name: 'Call or callback', group: 'Offer', desc: 'A big phone number and a one-field callback form.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1], ['cta', 'Button'], ['fine', 'Small print']],
      variants: { base: { h: 'Leave your number and a director will call you back.', sub: 'Day or night. If you would rather talk now, call {phone}.', cta: 'Call me back', fine: 'No email needed. Nothing to sign tonight.' } }
    },
    tour: {
      name: 'Tour booking', group: 'Offer', desc: 'Pick a tour time from open slots.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1], ['cta', 'Button']],
      variants: { base: { h: 'Pick a tour time.', sub: 'About an hour, with lunch if you like. Bring questions, and your parent if they want to come.', cta: 'Book this time' } }
    },
    compare: {
      name: 'Cremation or burial', group: 'Explain', desc: 'A sourced side-by-side comparison.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1]],
      variants: { base: { h: 'Cremation or burial: the facts side by side.', sub: 'National figures from the National Funeral Directors Association. Your choices and our prices are on the price list.' } }
    },
    faq: {
      name: 'Questions to ask', group: 'Explain', desc: 'The state funeral board\'s pre-need questions, answered.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1]],
      variants: { base: { h: 'The questions to ask before you sign.', sub: 'California\'s Cemetery and Funeral Bureau suggests asking these. Here are our answers. [Edit each answer to match your contract.]' } }
    },
    vets: {
      name: 'Veteran benefits', group: 'Explain', desc: 'What the VA may provide, with sources.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1]],
      variants: { base: { h: 'What the VA may provide.', sub: 'Depending on eligibility. We check it with you and file the paperwork.' } }
    },
    reviews: {
      name: 'Real reviews', group: 'Trust', desc: 'Slots for real reviews, never written or edited.',
      fields: [['h', 'Heading']],
      variants: { base: { h: 'What families say.' } }
    },
    area: {
      name: 'Service area', group: 'Trust', desc: 'Where you serve, your license and your phone.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1]],
      variants: { base: { h: 'Serving {area}.', sub: 'One call from anywhere in the area. Licensed {license}.' } }
    },
    cta: {
      name: 'Closing call to action', group: 'Close', desc: 'A last, calm ask.',
      fields: [['h', 'Heading'], ['sub', 'Line under it', 1], ['cta', 'Button']],
      variants: {
        base: { h: 'Ready when you are.', sub: 'Start with the free guide. Talk to us only if you want to.', cta: 'Get the free guide' },
        gift: { h: 'Give your family a plan, not a puzzle.', sub: 'It takes an afternoon. It saves them the hardest week of guessing.', cta: 'Get the free guide' },
        price: { h: 'See every price before you call.', sub: 'The full general price list, and plans in writing.', cta: 'See plans and prices' },
        veteran: { h: 'Make sure their service is part of the plan.', sub: 'We check eligibility with you and file the paperwork.', cta: 'Check veteran benefits' },
        event: { h: 'Save a seat, and bring your questions.', sub: 'Lunch is on us. Nothing is sold at the table.', cta: 'Save my seat' },
        lifestyle: { h: 'Come for lunch and see a normal day.', sub: 'Tours are free and led by a care guide.', cta: 'Book a tour' },
        caregiver: { h: 'Start with two minutes.', sub: 'The care check suggests a level of care. The tour answers the rest.', cta: 'Start the care check' },
        eligible: { h: 'See what a plan would cost at your age.', sub: 'A licensed agent confirms what fits. Not a quote until then.', cta: 'Check my options' },
        now: { h: 'We are here, day or night.', sub: 'Call {phone}, or leave your number and a director will call you.', cta: 'Call {phone}' }
      }
    }
  };

  FB.SECTIONS.costtool = {
    name: 'Cost builder', group: 'Live tools', desc: 'Families untick what they would not want and watch the total move.',
    fields: [['h', 'Heading'], ['sub', 'Line under it', 1]],
    variants: { base: { h: 'Build a funeral, line by line.', sub: 'Untick anything you would not want. The lines are national medians for a funeral with a viewing and burial (NFDA 2023). Our own prices are on the price list.' } }
  };
  FB.SECTIONS.paytool = {
    name: 'Payment plan', group: 'Live tools', desc: 'A slider that spreads a plan price over a few years.',
    fields: [['h', 'Heading'], ['sub', 'Line under it', 1]],
    variants: { base: { h: 'Spread it out, at your own pace.', sub: 'Move the slider to see a monthly amount. Before any plan fees or interest; your contract shows the real terms.' } }
  };
  /* NFDA 2023 General Price List Study medians, burial with viewing (same lines as the toolkit's cost builder) */
  FB.COST_ITEMS = [['Basic services fee', 2459], ['Transfer to the funeral home', 395], ['Embalming', 845], ['Other preparation', 295], ['Viewing: facilities and staff', 475], ['Ceremony: facilities and staff', 550], ['Hearse', 375], ['Service car or van', 175], ['Printed materials', 195], ['Metal casket', 2500], ['Burial vault', 1695]];

  /* The Meta ad that would send traffic to a page with this angle. Original copy; button names are Meta's call-to-action types. */
  FB.ADS = {
    gift: { text: 'Writing your wishes down is something you do for the people you love. Our free guide walks through every choice, with every price listed.', head: 'Plan it once. Spare them the guessing.', btn: 'Download', act: 'guide' },
    choice: { text: 'Burial or cremation, big or small. Decide it yourself, on paper, and change it any time before it is needed.', head: 'Your service, your way', btn: 'Learn more', act: 'plan' },
    noguess: { text: 'Families without a plan make every decision in the first few days. A written plan turns that into one phone call.', head: 'Plan it once', btn: 'Download', act: 'guide' },
    price: { text: 'Cremation and funeral plans with the price on the page. See what is included before you talk to anyone.', head: 'See plans and prices', btn: 'Learn more', act: 'plan' },
    guide: { text: 'What things cost, what to decide first, and how to bring it up with family. Free to download, and no call unless you ask.', head: 'The free planning guide', btn: 'Download', act: 'guide' },
    talk: { text: 'The talk nobody wants to start. Free question cards make it easier, over dinner instead of a hospital hallway.', head: 'Free conversation cards', btn: 'Sign up', act: 'guide' },
    event: { text: 'A free lunch talk on wills, funeral choices and benefits. Lunch is on us, and nothing is sold at the table.', head: 'Getting your affairs in order', btn: 'Sign up', act: 'event' },
    eligible: { text: 'California residents 50 to 85: a funeral plan with a fixed monthly rate. No medical exam on most plans. [Confirm with the carrier]', head: 'Check your options', btn: 'Get quote', act: 'quote' },
    lifestyle: { text: 'Mornings with friends, and help whenever they want it. Come for lunch and see an ordinary day.', head: 'Come for lunch, take a tour', btn: 'Book now', act: 'tour' },
    caregiver: { text: 'Looking for care for Mom or Dad? A two-minute care check suggests a level of care. Then visit and ask everything.', head: 'Start the care check', btn: 'Learn more', act: 'tour' },
    veteran: { text: 'If they served, the VA may cover burial in a national cemetery, a headstone and a flag. We help you check and file.', head: 'Veteran burial benefits', btn: 'Learn more', act: 'guide' }
  };
  FB.AD_WHO = {
    base: 'Adults in the service area, broad. Let the ad set learn from booked calls, not form starts.',
    eligible: 'Insurance-funded plans run under Meta\'s financial products special ad category: no age, gender or ZIP targeting, and no lookalike audiences.',
    lifestyle: 'Adult children and older adults near the community, broad. Senior housing ads can fall under Meta\'s housing special ad category, which limits targeting; check before launch.',
    caregiver: 'Adult children near the community, broad. Senior housing ads can fall under Meta\'s housing special ad category, which limits targeting; check before launch.',
    event: 'Adults within driving distance of the venue, promoted as a Facebook event.'
  };

  /* Compliance check: patterns that read as fear, fake urgency, impossible claims or personal attributes. */
  FB.RULES = [
    { id: 'fear', level: 'stop', re: /funeral debt|burden (on|to) your|leave your (kids|children|family) with|before it'?s too late|fight over|don'?t leave your/i, msg: 'Fear or guilt hook. Meta can throttle these as sensational, and they pull low-quality leads.', src: ['Elevarus', 'https://elevarus.com/final-expense-ad-hooks-that-convert/'] },
    { id: 'urgency', level: 'stop', re: /act now|limited time|only \d+ (left|spots|seats)|hurry|ends (today|tonight|soon)|last chance|countdown|while (supplies|spots) last/i, msg: 'Made-up urgency. The FTC treats false scarcity and fake timers as dark patterns.', src: ['FTC dark patterns report', 'https://www.venable.com/insights/blogs/2022/09/the-ftc-brings-more-light-to-dark-patterns-in-new'] },
    { id: 'claim', level: 'stop', re: /everyone (is )?approved|guaranteed (approval|acceptance)|can'?t be turned down|no one is turned down|\$\s?1 a month|one dollar a month/i, msg: 'A claim most buyers cannot reasonably expect. Cut it or qualify it.', src: ['Elevarus', 'https://elevarus.com/final-expense-ad-hooks-that-convert/'] },
    { id: 'personal', level: 'stop', re: /did you (just )?lose|are you (over \d+|a senior|sick|dying|grieving)|your (diagnosis|illness)|recently widowed|lost a loved one\?/i, msg: 'Implies the viewer\'s age, health or loss. Meta\'s personal attributes policy prohibits it.', src: ['Meta advertising standards', 'https://transparency.meta.com/policies/ad-standards/objectionable-content/privacy-violations-personal-attributes/'] }
  ];

  /* California Cemetery and Funeral Bureau, "Preneed" consumer page: the questions are theirs, the answers are samples to edit. */
  FB.FAQ = [
    ['Are there costs not included in the contract that would be paid at the time of need?', '[Sample] Cemetery fees, flowers and death certificates are listed separately on the price list. Everything in your contract is covered.'],
    ['Are the prices on the contract guaranteed?', '[Sample] Yes, for every good and service listed in the contract. Anything added later is priced at the time.'],
    ['Can the plan move to another funeral home or cemetery if I move or change my mind?', '[Sample] Yes. Funds held in trust can be transferred. We help with the paperwork.'],
    ['What happens if the funeral home closes or is sold?', '[Sample] The money is held by a trust company, not by us, and stays with your contract.'],
    ['Who holds the money, and how do I contact them?', '[Sample] [Trust company name and phone]. You get their details in writing.'],
    ['If the account earns interest, who pays the tax on it?', '[Sample] [Answer for your trust.]'],
    ['Can I cancel, and is there a penalty?', '[Sample] Yes. California rules set what is refunded. We explain it before you sign.']
  ];
  FB.FAQ_SRC = ['California Cemetery and Funeral Bureau', 'https://cfb.ca.gov/consumer/pre_need.shtml'];

  FB.PALETTES = {
    lantern: { name: 'Lantern', bg: '#FBF5F6', soft: '#F3E6EA', ink: '#121416', ink2: '#5A5458', line: '#E7D9DE', accent: '#FF4F9A', on: '#121416', deep: '#C2185B' },
    sage:    { name: 'Sage', bg: '#F5F7F2', soft: '#E6ECE2', ink: '#1C2620', ink2: '#56615A', line: '#D9E1D4', accent: '#3F6F5A', on: '#FFFFFF', deep: '#2E5546' },
    navy:    { name: 'Harbor', bg: '#F5F7FA', soft: '#E4E9F2', ink: '#14213D', ink2: '#56607A', line: '#D7DEEA', accent: '#2F5D9F', on: '#FFFFFF', deep: '#1F4278' },
    plum:    { name: 'Plum', bg: '#FAF5F8', soft: '#EFE2EB', ink: '#2B1B2E', ink2: '#66566A', line: '#E5D5E0', accent: '#8A3F7A', on: '#FFFFFF', deep: '#6B2E5E' },
    stone:   { name: 'Stone', bg: '#F7F5F1', soft: '#ECE6DC', ink: '#22201C', ink2: '#625C53', line: '#E0D9CC', accent: '#7A5A2E', on: '#FFFFFF', deep: '#5E4422' },
    night:   { name: 'Evening', bg: '#141518', soft: '#1E2024', ink: '#F4EFF1', ink2: '#B7B0B4', line: '#2E3136', accent: '#FF8FC0', on: '#121416', deep: '#FFB3D3' }
  };

  FB.FONTS = {
    modern:  { name: 'Modern', head: "'Geist', ui-sans-serif, system-ui, sans-serif", body: "'Geist', ui-sans-serif, system-ui, sans-serif", url: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap', hw: 700, track: '-0.035em' },
    classic: { name: 'Classic', head: "'Cormorant Garamond', Georgia, serif", body: "'Inter', ui-sans-serif, system-ui, sans-serif", url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600&display=swap', hw: 600, track: '-0.01em' },
    warm:    { name: 'Warm', head: "'Fraunces', Georgia, serif", body: "'Inter', ui-sans-serif, system-ui, sans-serif", url: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap', hw: 600, track: '-0.02em' },
    plain:   { name: 'Plain', head: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif", body: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif", url: '', hw: 700, track: '-0.02em' }
  };

  function S(type, angle, layout) { return { type: type, angle: angle || null, layout: layout || null }; }
  FB.TEMPLATES = [
    { id: 'gift', name: 'Gift to your family', desc: 'The classic pre-need page: the family benefit first, then the guide.', palette: 'lantern', font: 'modern',
      sections: [S('hero', 'gift', 'split'), S('picker'), S('trust'), S('steps'), S('guide'), S('reviews'), S('cta', 'gift')] },
    { id: 'price', name: 'Cremation, price first', desc: 'For shoppers who compare prices before they call.', palette: 'stone', font: 'modern',
      sections: [S('hero', 'price', 'split'), S('trust', 'price'), S('prices'), S('costtool'), S('steps'), S('compare'), S('faq'), S('cta', 'price')] },
    { id: 'guide', name: 'Free guide download', desc: 'One clear offer, for people not ready to talk.', palette: 'sage', font: 'warm',
      sections: [S('hero', 'guide', 'center'), S('guide'), S('trust'), S('steps'), S('paytool'), S('faq'), S('cta')] },
    { id: 'veteran', name: 'Veteran families', desc: 'Benefits first, with the checklist as the offer.', palette: 'navy', font: 'classic',
      sections: [S('hero', 'veteran', 'band'), S('vets'), S('guide', 'veteran'), S('trust', 'veteran'), S('faq'), S('cta', 'veteran')] },
    { id: 'event', name: 'Lunch talk', desc: 'A local seminar, promoted as an event.', palette: 'plum', font: 'warm',
      sections: [S('hero', 'event', 'split'), S('seminar'), S('steps', 'event'), S('trust'), S('area'), S('cta', 'event')] },
    { id: 'talk', name: 'Conversation cards', desc: 'A gentle first step: free cards to start the talk.', palette: 'lantern', font: 'classic',
      sections: [S('hero', 'talk', 'center'), S('guide', 'talk'), S('steps'), S('reviews'), S('cta')] },
    { id: 'care', name: 'Senior care tour', desc: 'Daily life first, care detail on the page, tour as the ask.', palette: 'sage', font: 'modern',
      sections: [S('hero', 'lifestyle', 'split'), S('trust', 'lifestyle'), S('steps', 'lifestyle'), S('tour'), S('guide', 'caregiver'), S('reviews'), S('area'), S('cta', 'lifestyle')] },
    { id: 'eligible', name: 'Insurance-funded plan', desc: 'Plain eligibility facts, for final expense coverage.', palette: 'navy', font: 'modern',
      sections: [S('hero', 'eligible', 'center'), S('trust', 'eligible'), S('steps', 'eligible'), S('guide', 'eligible'), S('faq'), S('cta', 'eligible')] },
    { id: 'now', name: 'Help now', desc: 'For a death that just happened: a phone number and calm words.', palette: 'night', font: 'modern',
      sections: [S('hero', 'now', 'center'), S('callback'), S('steps', 'now'), S('trust', 'now'), S('area')] }
  ];

  FB.BRAND = { name: 'Lanternhill', phone: '(555) 010-0144', area: 'Orange County and the Inland Empire', license: 'FD-0000 (sample)', palette: 'lantern', font: 'modern' };
})(typeof globalThis !== 'undefined' ? globalThis : window);
