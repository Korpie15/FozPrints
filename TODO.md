# Foz Prints to-do

Outstanding steps from the security and QA work (October 2026). Code changes are tracked in git; this list is for things done outside the code.

## Analytics (Microsoft Clarity)

- [x] Set masking to **Strict**: sign in at https://clarity.microsoft.com, open project `z0ivapi5ky`, Settings → Masking → Strict → Save.
- [ ] After deploying, click "Allow analytics" and check only one Clarity script loads. If two versions still load, check Cloudflare Zaraz and Netlify Snippet injection for a second copy.

## Email spoofing (Cloudflare → DNS)

- [x] Add a TXT record named `_dmarc`: `v=DMARC1; p=none; rua=mailto:info@fozprints.com.au; adkim=s; aspf=s`
- [x] Check the SPF record (TXT on `fozprints.com.au` starting `v=spf1`) lists every sender: the mailbox provider and Resend. Then change `~all` to `-all`.
- [x] Confirm DKIM shows Verified in Resend (Domains → fozprints.com.au) and in the mailbox provider.
- [ ] Around mid-November 2026 (2 to 4 weeks after 25 October): if the DMARC reports only show your own senders passing, change `p=none` to `p=quarantine`, and later to `p=reject`.

## Security headers

- [x] Content security policy checked and enforced (25 October 2026); Cloudflare Web Analytics added to it.
- [ ] Optional: Cloudflare → SSL/TLS → Edge Certificates → HSTS → tick Include subdomains, only if every subdomain works over HTTPS.

## Framework

- [x] Upgrade Next.js from 16.0.8 to the latest 16.x (16.4.2 or later). Fixes critical advisories, including remote code execution in image optimisation when AVIF is enabled (it is).

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

- [x] Site audit (`FOZPRINTS_HITLIST.md`): code items done; what's left is tracked in `AUDIT_REMAINING.md`.
- [ ] Anti-slop audit (`anti-slop/audit-001-2026-10-21.md`): choose which numbered items to fix.

## Order automation

- [x] Order email to info@fozprints.com.au via Resend on every paid order (Stripe and PayPal), sent once per order (built, not yet deployed).
- [x] Customer confirmation email (made-to-order lead time, delivery address, install guide link and safety reminder for the Nav Pod Kit, refund policy link), sent once per order (built, not yet deployed).
- [ ] After deploying: place one real low-value order (or a PayPal sandbox order on the test site) and check both emails arrive and look right.
- [ ] Leave Stripe's own "Successful payments" receipts OFF (Settings → Business → Customer emails): our confirmation email is the receipt, so turning it on would send card buyers two emails. PayPal always sends its own payment receipt, which is fine.
- [x] Australia Post labels: decided to stay manual for now. Create labels in MyPost Business by hand from the order email.
- [ ] Later, if volume grows: Starshipit (about A$35-45/month, linked to MyPost Business, paid orders sent in as drafts) or a "Download orders CSV" export for MyPost Business bulk import (free). Shippit's paid plans (about A$499/month) are too expensive at this volume.
