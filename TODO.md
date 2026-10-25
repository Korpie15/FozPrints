# Foz Prints to-do

Outstanding steps from the security and QA work (October 2026). Code changes are tracked in git; this list is for things done outside the code.

## Analytics (Microsoft Clarity)

- [ ] Set masking to **Strict**: sign in at https://clarity.microsoft.com, open project `z0ivapi5ky`, Settings → Masking → Strict → Save.
- [ ] After deploying, click "Allow analytics" and check only one Clarity script loads. If two versions still load, check Cloudflare Zaraz and Netlify Snippet injection for a second copy.

## Email spoofing (Cloudflare → DNS)

- [x] Add a TXT record named `_dmarc`: `v=DMARC1; p=none; rua=mailto:info@fozprints.com.au; adkim=s; aspf=s`
- [x] Check the SPF record (TXT on `fozprints.com.au` starting `v=spf1`) lists every sender: the mailbox provider and Resend. Then change `~all` to `-all`.
- [x] Confirm DKIM shows Verified in Resend (Domains → fozprints.com.au) and in the mailbox provider.
- [ ] Around mid-November 2026 (2 to 4 weeks after 25 October): if the DMARC reports only show your own senders passing, change `p=none` to `p=quarantine`, and later to `p=reject`.

## Security headers

- [ ] After deploying, browse the site, cart, Stripe checkout and PayPal checkout with the browser console open. If there are no `Content-Security-Policy-Report-Only` warnings, switch the policy to enforced (rename the header in `next.config.js`).
- [ ] Optional: Cloudflare → SSL/TLS → Edge Certificates → HSTS → tick Include subdomains, only if every subdomain works over HTTPS.

## Framework

- [ ] Upgrade Next.js from 16.0.8 to the latest 16.x (16.4.2 or later). Fixes critical advisories, including remote code execution in image optimisation when AVIF is enabled (it is).

## Stock and test data

- [ ] Restore stock after testing: Nav Pod Kit (Smooth) 0 → 2, Anderson plug holder 9 → 10. Delete the 3 test PayPal orders and their processed-event records.
- [ ] Correct stock by hand for any PayPal sales made before 22 October 2026.
- [ ] Check the A$1.11k Stripe payment from around 13 September 2026 (it didn't come through checkout). If it was a real order, its stock was never reduced.
- [ ] Confirm the A$21.70 Stripe test payment was refunded.

## Payments setup

- [ ] Check the PayPal webhook event list (Live) after the first real PayPal order: the `PAYMENT.CAPTURE.COMPLETED` delivery should show 200.
- [ ] Optional: delete the temporary Stripe webhook destination for `security-fixes--fozprints.netlify.app`.

## Git

- [ ] Push `security-fixes` and test on the branch deploy, then merge into `main`.
- [ ] Decide whether to commit the local `.gitignore` change and `.neon`.

## Content needed from you

- [x] Install manual (hit list #22): the kit's 4 screws fix the brackets to the head unit (step 5). Kit list and step 5 updated.
- [x] Install manual (hit list #22): step 9's 4 screws are the car's own factory screws. Step 9 updated.
- [ ] Install manual (hit list #22): steps for removing the old stereo and routing the loom up to the top cavity. Step 6 currently just says "run all necessary wiring".
- [ ] Policies (hit list #5): have an adviser review the new refund, shipping and terms wording.

## Still open from the audits

- [ ] Site audit (`FOZPRINTS_HITLIST.md`): items not yet done include #2 (Nav Pod defaulting to an out-of-stock variant), #5 (policy wording vs Australian Consumer Law), #10 (small-phone overflow) and #12 to #24.
- [ ] Anti-slop audit (`anti-slop/audit-001-2026-10-21.md`): choose which numbered items to fix.
