# The sign in surface: identity, consent and the demo door

Research and build spec, 10 Aug 2026. For The Jar Club, nathanjsong.com/olesmoky.
**Not yet built. This is the spec.**

## Why this screen matters more than it looks

It is the single best place on the whole build to demonstrate **identity
resolution, consent capture, progressive profiling and age gating**, all four of
which the job description names. Right now it demonstrates none of them. It is a
login box with a paragraph of small text explaining that you can click a button.

---

## The five findings that change the build

### 1. The age gate is non-compliant, and it is in the wrong place

The DISCUS Code, Appendix A, B6(i): *"Prior to the collection of any
information, the brand advertiser will require that individual to affirm that
they are of legal purchase age."* Email is information. **So date of birth comes
before the email field, not after it.**

And it must be month, day and year. Appendix A, B2 defines age affirmation as
*"a process or a mechanism by which users provide their full date of birth."* A
checkbox reading "I am 21 or over" is not age affirmation. It is the pattern
used by roughly 9% of alcohol sites; 91% use date of birth, and the FTC
recommended date of birth over simple confirmation back in 2014.

The Code also specifies the fail state: deny access, show an appropriate message
or direct to responsibility.org. Only about one in five alcohol sites blocks a
repeat attempt after an underage entry, which is the difference between a gate
and theatre. **Persist the denial.**

The Code explicitly blesses *"the use of a site's registered user database of
legal purchase age adults"* as a mechanism, which is the argument for storing
the affirmation on the account and never asking again.

Source: [DISCUS Code of Responsible Practices, Dec 2022](https://distilledspirits.org/wp-content/uploads/2022/12/DISCUS_CodeofResponsiblePractices_2022.pdf),
[Alcohol and Alcoholism, Oxford Academic](https://academic.oup.com/alcalc/article/56/1/82/5937308)

### 2. Sign in with Apple is not available here, and that is defensible

Sign in with Apple JS requires an App Store app: *"An app on the App Store is
required in order to use this API."* The Jar Club is a website with no app.

Does offering Google force offering Apple? **No.** App Review Guideline 4.8
governs App Store apps, not websites, and Apple revised it in January 2024 so it
no longer names Sign in with Apple specifically. This turns a possible omission
into a stated decision.

Sources: [Apple usage guidelines](https://developer.apple.com/sign-in-with-apple/usage-guidelines-for-websites-and-other-platforms/),
[9to5Mac, Jan 2024](https://9to5mac.com/2024/01/27/sign-in-with-apple-rules-app-store/)

### 3. The six digit boxes are wrong on four independent grounds

They break `autocomplete="one-time-code"`, which only works reliably on a single
input. They break iOS SMS autofill and the WebOTP API. They give a screen reader
six unlabelled single character fields instead of one control with one name and
one caret. And they complicate paste, which WCAG 2.2 SC 3.3.8 names as a
satisfying mechanism for accessible authentication.

**One input replaces all six:**

```html
<input type="text" inputmode="numeric" autocomplete="one-time-code"
       pattern="[0-9]{6}" maxlength="6">
```

Prefilled in the demo it reads as helpful. Six prefilled boxes read as a
rendering fault, which is exactly how the current build looks.

Sources: [web.dev SMS OTP](https://web.dev/articles/sms-otp-form),
[Cloud Four](https://cloudfour.com/thinks/simple-one-time-passcode-inputs/),
[W3C SC 3.3.8](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)

### 4. The Google button must never be gold

Google forbids the standard colour G on any background other than light, dark or
neutral. Dark theme is the only one that fits this UI:

| | |
|---|---|
| Fill | `#131314` |
| Border | `#8E918F`, 1px, inside |
| Label | `#E3E3E3`, Google Sans Medium 14/20 |
| Padding | 12px, 10px gap to text, 12px |
| Shape | rectangular or pill, both sanctioned |
| Height | 44px here, aspect ratio of the G must be preserved |

Permitted label strings, exactly three: **Sign in with Google**, **Sign up with
Google**, **Continue with Google**. Using the word "Google" alone is forbidden.
Use "Continue with Google", because after the tabs are removed this surface
serves both return and creation.

**Inline Google's own SVG from the [official asset bundle](https://developers.google.com/static/identity/images/signin-assets.zip).**
Do not hand-trace the G. Do not recolour it. Do not use a monochrome version.

Against the Jar Club panel, `#131314` will read as a deliberate foreign object.
That is correct. Every real product has this seam. Matching it to the brand is
the visible tell.

Source: [Sign in with Google Branding Guidelines](https://developers.google.com/identity/branding-guidelines)

### 5. The honesty problem is the biggest opportunity on the screen

There is no OAuth here. A pixel-accurate Google button that does not talk to
Google is a use of Google's mark outside what the guidelines cover.

**Resolution.** The button is built to spec and looks entirely real. Clicking it
does **not** fake a Google account chooser. It opens a Jar Club styled panel, in
Jar Club colours, with no Google chrome:

> **Simulated response.** This prototype does not connect to Google. Here is the
> token a real integration would return, and what the CRM does with each claim.

| Claim | What the CRM does with it |
|---|---|
| `sub` | Stored as a permanent alias. **The durable key.** It survives the member changing their Gmail address, which the email alone does not. |
| `email` | Normalised, hashed, matched against existing members. If it hits, attach the alias to the existing record. **Do not create a second Dale.** |
| `email_verified: true` | Skips the six digit code entirely. Verified at source. |
| `given_name` | Fills the first name so we never ask for it. |
| `picture` | **Not stored.** We do not need it, and storing it creates a deletion obligation. |

A hiring manager clicks the Google button expecting nothing and gets a token
claim to CRM field mapping. That is the moment this stops being a login box.

**Do not simulate One Tap.** The branded button is covered by the guidelines.
Reproducing Google's own floating UI is not, and the catch all clause forbids
uses not expressly covered.

---

## The structural decision: kill the two tabs

Replace Create account / Sign in with a single identify first path. One email
field; the system decides whether this is a return or a creation.

The reason is not aesthetic, and it is the kind a CRM hiring manager notices:
**a two tab surface manufactures duplicate records.** A member who forgot they
signed up in March clicks "Create account", types the same email, and you either
error at them or create a second profile. Identify first eliminates the decision
and therefore the whole duplicate class.

---

## The demo door

A cold visitor must understand in under two seconds that they can enter without
typing. That means it has to be a **surface, not a sentence**, it has to be the
largest thing on the screen, it has to **show the payload** rather than describe
it, and it has to carry a verb on a control.

### Option A, recommended: the member card

118px tall, full width, radius 16px, gold border, gradient fill.

- Left: 54px custom jar mark with the fill level drawn at 62%
- `MEMBER SINCE MARCH` in gold caps
- **`Walk in as Dale`** at 900 19px
- Three chips: `2,140 points`, `Tier 2`, `3 rewards ready`
- Far right: a 28px chevron in a circle
- Hover: lift 2px, border brightens, soft gold shadow

The card is both the door and the explanation, because the payload is the copy.

### Option B: the two door screen
Step zero with two stacked panels and no form at all. **Best on the two second
test, worst as a product**, because it taxes everyone who came to sign up and
buries the Google button a step deep. Worth saying out loud that this was
rejected: "I know the option that tests best and I did not pick it, here is why"
is a stronger signal than picking it.

### Option C: the persistent rail
A 44px strip on every screen: `Prototype. Skip the sign in.` plus an
`Enter as Dale` pill. **Too small as the primary door**, correct as the fallback
everywhere else on the site.

**Build A as primary, C as the persistent fallback. Do not build B.**

Deleting the current dashed callout is the largest single improvement available
on this screen. It is a paragraph, it sits below the fields, it explains a state
instead of offering an action, and the prefilled boxes look broken.

---

## The account creation flow

**Step 1. Age affirmation. Before anything else.**
One field, `MM / DD / YYYY`, auto inserting slashes, `inputmode="numeric"`, 50px
tall, 16px type. Not three dropdowns. Helper text: *"We ask once and store it on
your account. You will never be asked again."* If a site level gate already ran,
inherit the value and render it as a confirm row. Never gate twice.
**Buys:** compliance evidence with a timestamp, the birthday trigger (the
highest performing single automated campaign in spirits loyalty), and an age
cohort without a survey.

**Step 2. Email.** Single field, identify first.
**Buys:** the primary deterministic match key, stored normalised and hashed
alongside the plaintext for sending.

**Step 3. Verification code.** One input, 56px, 900 24px, `.32em` tracking,
centred, tabular numerals. Paste fills and auto submits and is never blocked. A
visible `Verify` button remains, because auto submit alone strands screen reader
users mid announcement.
**Buys:** the `email_verified` flag, and a soft bot filter without a CAPTCHA,
which SC 3.3.8 would penalise.

**Step 4. Consent, on the same panel as the code.**
Two separate **unticked** checkboxes, 44px row hit areas. A pre ticked box is not
an opt in under the Code.
1. `Email me about drops, releases and my rewards.`
2. `Text me. Only about redemptions and pickups.` **The phone field only appears
   once this is ticked.**

Each consent writes a row: channel, state, timestamp, the exact copy shown, and
the surface it was captured on. **Not a boolean on the user record.** A boolean
cannot answer "what did they agree to and when", which is the only question that
matters in an audit.

**Step 5. Nothing.** Account created, straight into the dashboard.

### Progressive profiling, after the account exists

| Ask | Where | What it buys |
|---|---|---|
| First name | Inline, one field. Skipped if Google supplied `given_name` | Personalisation |
| ZIP | First time they open shipping or the tasting room tab | Shipping legality, distance to Gatlinburg, market lift |
| Phone | Only after SMS consent, or at first tasting room visit | Second deterministic key, **and the POS lookup key at the counter.** This is the field that closes the online to retail loop |
| Flavour | Two tap poll on the dashboard, framed as a reward | Segmentation without a survey |

Every ask is paired with the thing it unlocks in the same moment. **Never a
profile completeness bar.**

### What is explicitly not asked

Password, confirm password, last name, full address, phone as required, gender,
CAPTCHA, "how did you hear about us", and Facebook, X or Apple buttons. Each one
has a reason; the short version is that none of them buys anything at this
moment and several create obligations.

---

## Identity resolution, the mechanism

**Deterministic strong key matching feeding an identity graph**, with
probabilistic layered on only where deterministic keys are missing.

| Source | Key | How it joins |
|---|---|---|
| Email signup | `sha256(lower(trim(email)))` | Primary key, created at signup |
| Phone | E.164 normalised, then hashed | Second key, added by progressive profiling |
| In store purchase | `loyalty_id` looked up at POS by phone or scanned QR | POS resolves phone to `loyalty_id`, that resolves to `person_id` |
| Google login | The `sub` claim | **More durable than the email itself**, because it survives an address change |

One canonical `person_id` with an `identity_alias` table of (type, hashed_value,
source, first_seen, confidence). **Nothing overwrites. Everything appends.**

Known failure mode: exact match only breaks on multiple accounts, privacy relay
addresses (Apple Hide My Email, Firefox Relay) and anonymous checkout. That is
why hybrid exists.

Sources: [Amperity](https://amperity.com/blog/identity-resolution-techniques-probabilistic-deterministic-hybrid),
[Deep Sync](https://deepsync.com/identity-graph/)

---

## The CRM commentary strip

Three lines at the foot of the dialog. Three is the ceiling; a fourth turns this
back into the paragraph problem the surface is being rebuilt to solve.

> **One person, one record.** The email, the phone number added later, and the
> Google account ID all resolve to the same member ID, so the tasting room
> counter and the inbox are looking at the same Dale.
>
> **Date of birth is asked once and stored on the account.** That is what lets us
> stop asking, and it is also the birthday trigger.
>
> **Consent is logged per channel with a timestamp and the exact wording shown.**
> An email opt in never becomes permission to text.

---

## Accessibility contract

- `role="dialog" aria-modal="true"`, labelled and described
- **Focus moves to the demo door on open**, not the close button and not the
  email input. The first thing a keyboard user reaches should be the free door
- Focus trap, Esc closes, focus returns to the trigger
- Every target 44x44 including the close X
- `aria-live="polite"` for validation, `role="alert"` for the underage denial
- The prototype ribbon is real text, so it is read out
- Reserved error space so nothing reflows

## Mobile, 390px

A **bottom sheet**, not a centred modal, so the demo door and the Google button
are in thumb reach. `max-height:92svh` not `vh`, so the iOS URL bar does not clip
it. Inputs stay at 16px. Bottom padding
`calc(24px + env(safe-area-inset-bottom))`. Continue becomes sticky once content
exceeds the viewport.

---

## Do not build

No fake One Tap card. No Sign in with Apple. No Facebook, X or Amazon. No six
digit boxes. No password field or strength meter. No CAPTCHA. No pre ticked
consent. No three dropdown date of birth. No second age gate. No infinite
retries after an underage entry. No confetti or counting animation on a login
screen, which is the tell that nothing behind it is real. No invented
"join 40,000 members" counter. No progress bar across three steps. No profile
completeness percentage. No "continue as guest" wording, because the demo door
is a prototype affordance and not a product tier.
