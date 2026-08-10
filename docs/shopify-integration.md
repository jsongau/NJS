# Shopify integration, and what the checkout mock proves

## Why this exists

Ole Smoky's merch store runs on Shopify. In the Jar Club build, a member who redeems a reward can pay the $9.99 shipping in cash or spend 3,350 more points. Choosing cash takes them out of the loyalty page and into Shopify Checkout.

Rather than fake a generic payment form, the build reproduces Shopify's actual checkout, so the integration question is answered before it is asked.

## Where the numbers came from

Not from screenshots. Two primary sources:

- Shopify's shipped production stylesheet: `https://cdn.shopify.com/shopifycloud/checkout-web/assets/app.esm.en.70e07baaa4dcde9d8e13.css`
- Shopify's open-sourced design tokens: `https://github.com/Shopify/checkout-ui/blob/main/src/style.css`
- Wallet button CSS: `https://cdn.shopify.com/shopifycloud/portable-wallets/latest/accelerated-checkout.css`

Confirm the 750px breakpoint against Shopify's published checkout CSS docs: https://shopify.dev/docs/storefronts/themes/architecture/layouts/checkout-liquid/checkout-css#main-breakpoints

## The tokens the mock uses

| Token or property | Value |
| --- | --- |
| Breakpoint | 750px |
| Font stack | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`, no custom webfont by default |
| Base size | 14px |
| Line height | 1.5 |
| Bold weight | 500, not 600 or 700 |
| Border | #D9D9D9 |
| Border emphasized | #949494 |
| Body text | #545454 |
| Headings | #333333 |
| Muted text | #737373 |
| Accent and focus | #1878B9 |
| Button hover | #115F92 |
| Order summary background | #FAFAFA |
| Error | #E22222 |
| Success | #08871F |
| Input height | 45px |
| Input padding | 11px |
| Border radius | 5px |
| Focus ring | Border colour #1878B9 plus a 1px box shadow of the same |
| Card brand tile | 38 by 24px, 3px radius, 1px rgba(0,0,0,0.07) |
| Pay button | 14px block padding, 17px inline padding, about 51px tall |
| Spacing scale | 5, 6, 7, 9, 11, 14, 17, 21, 26, 32, 38 |

## Express wallets

One flex row, never a 2x2 grid. Each button is `flex: 1 1 0`, `min-width: 100px`, 10px apart, 42px tall, 4px radius. It stacks vertically by container query, and the threshold depends on the count: 4 wallets stack at 430px, 3 at 320px, 2 at 210px.

Shop Pay is #5A31F4. Note the conflict: Shopify's Commerce Components design guidelines give #5433EB for the Shop button, while the checkout asset guide gives #5A31F4. The mock uses #5A31F4 because that page is specifically about the checkout wallet.

PayPal gold is observed as #FFC439. PayPal does not publish the hex.

Google Pay and Apple Pay are black. Google publishes no hex and explicitly forbids building your own button. Apple Pay is minimum 30pt tall.

Wallet order is not merchant controlled. Shopify orders them dynamically to show the fastest method for that customer.

Apple Pay is hidden entirely if the checkout Company field is set to Required.

## Section order, verbatim labels

In order:

1. Header
2. Express checkout, with an OR divider
3. Contact, with a Log in link
4. Delivery
5. Shipping method
6. Payment
7. Billing address
8. Remember me
9. Pay button
10. Policy footer

There is no Cart / Information / Shipping / Payment breadcrumb. That is a three page artifact and does not exist in one page checkout.

The exact strings matter:

- "All transactions are secure and encrypted." is permanent and cannot be removed.
- Billing is "Same as shipping address" and "Use a different billing address", not "Use shipping address as billing address".
- Remember me is "Save my information for a faster checkout with a Shop account".
- The delivery checkbox is "Save this information for next time".
- The pay button is dynamic: "Pay now" by default, "Complete order" when a gift card covers the total, "Pay with {method}" for an offsite gateway.

## Accounts

Modern Shopify checkout has no password based account creation at all. It is passwordless: email, then a six digit code, sessions up to 365 days. If someone signs in with an email that has no profile, a profile is created automatically.

The only account control inside checkout is the Shop account checkbox in Remember me, and it cannot be disabled, because the phone number is needed for authentication.

## The limitation a CRM Director has to know

Points are not a tender type in Shopify checkout. A loyalty app converts points into a discount on the pre-tax subtotal, or into a gift card. The public checkout UI extension surface exposes `applyDiscountCodeChange` and no method to register a partial tender.

Why it matters in one sentence: points as discount reduce the pre-tax subtotal, a gift card reduces the total including tax and shipping, and those are different lines in the order summary and different revenue recognition stories.

Only gift cards and Shopify Store Credit split natively, and store credit cannot be applied partially.

There is a Redeemables payment extension that makes an external balance a real tender, but it is invite only, closed beta, Plus only, approved Partners only, and none of Smile.io, Yotpo, LoyaltyLion or Rivo use it.

All four of those apps are Plus only for in checkout blocks.

## What is customisable and what is locked

On Shopify Plus, via `checkoutBrandingUpsert`: colour schemes, typography including custom WOFF upload, corner radius, header alignment, button padding and radius and letter case, form control border style and label position, section layout, favicon, footer visibility.

Locked everywhere: field order, section order, the card form, the pay button label, the security notice, the Remember me block, the Shop email recognition modal, wallet appearance, wallet order. Styles apply across all of checkout at once; you cannot style one page. SVG is not a supported image type. `checkout.liquid` is fully retired. Background images on Header and Main content were removed on 5 February 2026, and only the Order summary still accepts one.

Below Plus you cannot put a UI extension into the information, shipping or payment steps at all.

The line to say out loud: "On Plus I can restyle every token and inject blocks into the three checkout steps. I cannot move a field, rename the Pay button, remove the security notice, or touch the wallet buttons, and on anything below Plus I cannot put a block in checkout at all."

## Alcohol

Shopify's acceptable use policy no longer has a restricted items list. The operative document requires effective age verification, so alcohol cannot be purchased or received by anyone under 21.

Alcohol is allowed on Shopify Payments in the US. It is banned on the Shop channel.

There is no first party Shopify age gate. Apps split into self declaration modals, real verification, and post checkout hold. The in checkout field is Plus only, because of the UI extension wall.

Adult signature is a carrier mandate, not a Shopify feature. FedEx requires an adult signature for every US package containing alcohol, recipient 21 or over with photo ID, under a FedEx Alcohol Shipping Agreement. UPS requires Adult Signature Required under a UPS wine or spirits shipper agreement. USPS will not carry alcohol at all.

Real merchant copy worth copying, from live Shopify alcohol stores:

- "Someone 21+ must sign for deliveries."
- "By placing an order, you confirm that both you and the recipient are at least 21 years of age."

State restrictions: the folklore list is out of date. Wine ships direct to consumer to 49 states plus DC. The genuinely closed set is Utah, Rhode Island and Delaware. Spirits is roughly 10 states plus DC. ZIP blocking is necessary but insufficient, because Texas dry areas follow justice of the peace precincts and Kentucky follows election precincts.

## What the mock deliberately does not do

It never takes a payment, never stores a card, and carries a visible notice saying so on every screen. It is a demonstration of integration understanding, not a storefront.

## What was approximated rather than sourced

- Page maximum width and column ratio. Shopify does not publish these. The mock uses about 1200px with a 1fr to 0.78fr split.
- Footer link order and divider.
- Padlock placement in the payment section.

Say this out loud in an interview. A candidate who separates what he verified from what he approximated reads as more credible to an e-commerce audience, not less.

## Verified in the build

36 assertions in `tck.js` cover the section order, the wallet row, the card field order, the token values, the alcohol copy, the points limitation, the demo notice, and the confirmation screen.
