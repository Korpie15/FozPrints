# Foz Prints to-do

Outstanding steps from the security and QA work (October 2026). Code changes are tracked in git; this list is for things done outside the code. Updated 28 October 2026.

**Deploys are paused until 9 November 2026.** Waiting for the next push:

- [ ] New home page sharing image (option A: textured pod fitted in the car next to the kit parts photo). Saved locally only; if the workspace was cleared, ask Claude to "use share image A" again. After it's live, paste `https://fozprints.com.au` into Facebook's Sharing Debugger and click **Scrape Again**.

## Before announcing (Facebook groups and posts)

- [ ] Place one real order for the cheapest item with a real card, then refund it in Stripe. Check: stock drops by one; the order email to info@ and the customer confirmation both arrive and look right; Google's "rate your experience" box shows on the confirmation page. Then ask Claude to put the stock back.
- [ ] Check each group's selling rules (many only allow sales on certain days, or need admin approval).
- [ ] Paste each link you'll share into Facebook's Sharing Debugger (developers.facebook.com/tools/debug) and click **Scrape Again** to check the preview.
- [ ] Optional: tag shared links so you can see which group sent visitors, e.g. `https://fozprints.com.au/?utm_source=facebook&utm_campaign=forester-group`.
- [ ] Keep post wording to what the site says: made to order with the stated lead time, "not affiliated with Subaru", no claims beyond the product page.

## Analytics (Microsoft Clarity and Google tag)

- [x] Set Clarity masking to **Strict** (project `z0ivapi5ky`).
- [x] Google tag `GT-K46RMMXR` added (27 October 2026). Like Clarity, it only loads after "Allow analytics"; the order confirmation page reports each purchase once (order ID, amount, AUD).
- [ ] On the live site, click "Allow analytics" and check only one Clarity script loads (see `AUDIT_REMAINING.md` section 2B). If two load, check Cloudflare Zaraz and Netlify Snippet injection for a second copy.

## Email spoofing (Cloudflare → DNS)

- [x] Add a TXT record named `_dmarc`: `v=DMARC1; p=none; rua=mailto:info@fozprints.com.au; adkim=s; aspf=s`
- [x] Check the SPF record (TXT on `fozprints.com.au` starting `v=spf1`) lists every sender: the mailbox provider and Resend. Then change `~all` to `-all`.
- [x] Confirm DKIM shows Verified in Resend (Domains → fozprints.com.au) and in the mailbox provider.
- [ ] Around mid-November 2026 (2 to 4 weeks after 25 October): if the DMARC reports only show your own senders passing, change `p=none` to `p=quarantine`, and later to `p=reject`.

## Security

- [x] Content security policy checked and enforced (25 October 2026); Cloudflare Web Analytics, Google Customer Reviews and the Google tag added to it.
- [x] Cloudflare rate limit (27 October 2026): the free plan allows one rule, so the unused "Leaked credential check" rule was replaced with **API abuse limit**: POST requests to checkout, PayPal, contact, international interest and shipping quotes, 10 per 10 seconds per IP, block for 10 seconds. Webhooks are excluded. Blocked requests show under Security → Events.
- [ ] Optional: Cloudflare → SSL/TLS → Edge Certificates → HSTS → tick Include subdomains, only if every subdomain works over HTTPS.

## Framework

- [x] Upgrade Next.js from 16.0.8 to the latest 16.x (16.4.2 or later). Fixes critical advisories, including remote code execution in image optimisation when AVIF is enabled (it is).

## Stock and test data

- [x] Restore stock after testing: Nav Pod Kit (Smooth) 0 → 2, Anderson plug holder 9 → 10. Deleted the 3 test PayPal orders from 22 October and their processed-event records (27 October 2026).
- [ ] An unpaid PayPal order from 25 October (A$21.70, Cable Organiser, `66S13711LW488435L`) was left in the database: it was never paid, so it's harmless. Tell Claude if it was your test and it'll be deleted.
- [ ] Check the stock numbers match what you can actually make. On 27 October: Nav Pod Kit Smooth 2, Textured 3; Cubby Heat Inserts 2, Standard Holes 3; Anderson Plug Holder 10; Cable Organiser 5; Fuel Cap Holder and the separate pod parts 0.
- [ ] Correct stock by hand for any PayPal sales made before 22 October 2026.
- [ ] Check the A$1.11k Stripe payment from around 13 September 2026 (it didn't come through checkout). If it was a real order, its stock was never reduced.
- [ ] Confirm the A$21.70 Stripe test payment was refunded.

## Payments setup

- [ ] Check the PayPal webhook event list (Live) after the first real PayPal order: the `PAYMENT.CAPTURE.COMPLETED` delivery should show 200.
- [ ] Optional: delete the temporary Stripe webhook destination for `security-fixes--fozprints.netlify.app`.

## Google Merchant Center

- [x] Shipping service: **Carrier**, Australia Post Regular Parcel, origin postcode 2036. The Nav Pod Kit gets free shipping through a product-level shipping entry (Australia, Standard, A$0.00).
- [x] Shipping weight and size on each product (kg, cm): Nav Pod Kit 0.34, 31 × 23 × 15; Cubby 0.32, 31 × 23 × 15; Anderson Plug Holder 0.15, 22 × 16 × 5; Cable Organiser 0.13, 22 × 16 × 5. Handling time 1 to 2 days. Weigh a packed parcel when you can and update if it's well off.
- [x] Variant links: `?variant=` on a product address opens the page on that finish (live 27 October 2026), and each finish is listed separately in the data Google reads.
- [ ] In a few days, check **Products**: the website import should switch to the new kit address and list each finish separately. Don't add the finishes by hand as well, or they'll be duplicated. If it hasn't updated after a week, tell Claude.
- [ ] Prices per finish: Nav Pod Kit Smooth A$200, Textured A$215; Cubby Standard holes A$50, Heat inserts A$60 (both layouts). If any were entered by hand the other way round, swap them.
- [x] Cubby now has 4 options (28 October 2026, Stripe and database only): Split section or Single section, each with Standard holes or Heat inserts. Old prices retired; their stock moved to the Split section options; Single section starts at 5 of each. Links are now `?variant=split-section-standard-holes` and so on, so Merchant Center will pick up 4 Cubby listings on its next read.
- [ ] Single section photo: add a render (or a photo once printed) to the Cubby in Stripe and tell Claude its position, so choosing Single section shows it. Say on the page that it's a render.
- [ ] Optional: add a line to the Cubby's Stripe description explaining the two layouts.
- [ ] Conversion tracking: purchase page set to `https://fozprints.com.au/checkout/success`. Google's "tag not detected" check fails because the tag only loads after "Allow analytics"; that's expected. Check with Tag Assistant (tagassistant.google.com): open the site, click Allow analytics, and `GT-K46RMMXR` should fire. If Merchant Center won't accept it, ask Claude about Consent Mode after 9 November.
- [ ] Google Customer Reviews: the opt-in is live on the order confirmation page (merchant ID 5888299609). The Merchant Center setup page moves on by itself after the first order shows the opt-in.

## Google Search

- [ ] Search Console: in URL Inspection, request indexing for each product page not yet indexed, `/manuals/double-DIN-pod-upgrade-kit` and `/about`. Skip the policy pages. "Discovered – currently not indexed" is normal for a new site; leave the "Validate fix" running.
- [ ] Search `site:fozprints.com.au` now and then to see what Google has indexed.
- [ ] Links from elsewhere help Google most: a Foz Prints Facebook page or Instagram with the website in the bio, and helpful posts linking the install guide on Subaru forums, Reddit (r/subaru, r/Forester) or Whirlpool.
- Google Business Profile: not eligible for an online-only shop (Google requires meeting customers in person). Only worth it if you offer local pickup or in-person fitting.

## Product text in Stripe

- [ ] The Nav Pod Kit's Stripe description still says "some deeper units may require minor modification to the dash internal ducting behind the pod". Edit it in Stripe if you don't want it on the page (no deploy needed; the site updates within about 5 minutes).

## Git

- [x] Push `security-fixes` and test on the branch deploy, then merge into `main` (last deploy 27 October 2026, commit `d975812`).
- [ ] Decide whether to commit the local `.gitignore` change and `.neon`.

## Content needed from you

- [x] Install manual (hit list #22): the kit's 4 screws fix the brackets to the head unit (step 5). Kit list and step 5 updated.
- [x] Install manual (hit list #22): step 9's 4 screws are the car's own factory screws. Step 9 updated.
- [ ] Install manual (hit list #22): steps for removing the old stereo and routing the loom up to the top cavity. Step 6 currently just says "run all necessary wiring".
- [ ] Policies (hit list #5): have an adviser review the refund, privacy, shipping and terms wording.
- [ ] Optional: a daytime landscape photo of the pod fitted with the screen on (a map or CarPlay), taken from the passenger seat. It would make a better sharing image.

## Still open from the audits

- [x] Site audit (`FOZPRINTS_HITLIST.md`): code items done; what's left is tracked in `AUDIT_REMAINING.md`.
- [ ] Anti-slop audit (`anti-slop/audit-001-2026-10-21.md`): choose which numbered items to fix.

## Order automation

- [x] Order email to info@fozprints.com.au via Resend on every paid order (Stripe and PayPal), sent once per order (live 27 October 2026).
- [x] Customer confirmation email (made-to-order lead time, delivery address, install guide link and safety reminder for the Nav Pod Kit, refund policy link), sent once per order (live 27 October 2026).
- [ ] Place one real low-value order and check both emails arrive and look right (see "Before announcing").
- [ ] Leave Stripe's own "Successful payments" receipts OFF (Settings → Business → Customer emails): our confirmation email is the receipt, so turning it on would send card buyers two emails. PayPal always sends its own payment receipt, which is fine.
- [x] Australia Post labels: decided to stay manual for now. Create labels in MyPost Business by hand from the order email.
- [ ] Later, if volume grows: Starshipit (about A$35-45/month, linked to MyPost Business, paid orders sent in as drafts) or a "Download orders CSV" export for MyPost Business bulk import (free). Shippit's paid plans (about A$499/month) are too expensive at this volume.
