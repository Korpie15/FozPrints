# Site audit: what's left

Remaining items from the 24 October 2026 site audit (`FOZPRINTS_HITLIST.md`), updated 25 October 2026.

Numbered items done on the `security-fixes` branch: #1 to #3, #7 to #21, #23, #24. #4, #5, #6 and #22 are partly done and need steps from you (section 2).

The list is split into:

1. **Code fixes:** what's been done in the code, and what's left for Claude.
2. **Needs steps from you:** accounts, decisions, content or checks only you can do, with steps to follow.

---

## 1. Code fixes

### Done since the last update

- [x] **#2 Nav Pod opens on an out-of-stock finish:** the product page now preselects the first finish that's in stock (and shows its photo).
- [x] **#18 Next.js upgrade:** 16.0.8 → 16.4.3. Type check and full build pass; the Next.js security advisories no longer show in `npm audit`.
- [x] **ABN and GST:** footer shows "Foz Prints, ABN 21 146 926 791" and "No GST applies"; the cart and the Stripe checkout page show the GST note too.
- [x] **One name for the Nav Pod:** site and manual now use "Subaru Forester SG Double DIN Nav Pod Kit (2003 to 2008)" for titles and Google, and "Nav Pod Kit" for banners, buttons and the manual.
- [x] **Stripe products:** Nav Pod renamed; "2025 vehicle" and "Top Mount Pod" wording fixed. Every product now has a `handle` in its Stripe metadata, so renaming a product no longer changes its web address. (`shopify_handle` is left over from Shopify and isn't used.)
- [x] **Phone carousel dropdown:** opening the finish dropdown on a card no longer scrolls the card up inside the row; the dropdown shows under the card.

### Still to do

- [x] **#6 Enforce the content security policy:** console check came back clean (site pages, Clarity after Allow analytics, PayPal button), so the header is now enforced. Not yet deployed.

---

## 2. Needs steps from you

### A. Clarity masking (#4) ✅ Done (set to Strict)

Without this, Clarity's session recordings can include what people type into the contact form.

1. Go to https://clarity.microsoft.com and sign in with the account the site's Clarity was set up with (Microsoft, Google or Facebook). It may be the business owner's account.
2. Open the project for fozprints.com.au. Check its project ID is `z0ivapi5ky` (shown in the project's Settings → Overview, or in the setup code).
3. Click **Settings** (gear icon), then **Masking**.
4. Choose **Strict** and click **Save**.

If you can't find the account, create a new Clarity project for the site and send Claude its project ID. You'll lose the old project's history.

### B. Check only one Clarity script loads (#4)

Do this after the `security-fixes` changes are on the live site.

1. Open https://fozprints.com.au in Chrome in a private window.
2. Press **Cmd+Option+I** to open DevTools, then click the **Network** tab.
3. Type `clarity` in the Network filter box.
4. Click **Allow analytics** on the site's banner.
5. Look at the requests:
   - **Expected:** one request to `clarity.ms/tag/z0ivapi5ky`, then one `clarity.js` script.
   - **Problem:** two different `clarity.js` versions, or Clarity requests **before** you clicked Allow.
6. If there's a problem, something outside the code is adding Clarity. Check:
   - **Cloudflare:** dashboard → fozprints.com.au → **Zaraz**. Look for a Clarity tool, and remove or disable it.
   - **Netlify:** project → Site configuration → **Build & deploy → Post processing → Snippet injection**. Remove any Clarity snippet.
7. Reload, click **No thanks** in the footer's "Analytics settings", and check no Clarity requests appear.

### C. Content security policy console check (#6)

The policy currently only reports problems. This check tells us whether it's safe to enforce.

1. Open https://security-fixes--fozprints.netlify.app (or the live site once merged) in Chrome.
2. Press **Cmd+Option+I** and click the **Console** tab.
3. Visit these pages one by one, watching for yellow or red messages that mention **Content-Security-Policy**:
   - Home, All Products, a product page, About (scroll to the FAQ and the contact form), Manuals and the install manual
   - Click **Allow analytics** on the banner
   - Cart, then start a **PayPal** checkout (log in to the sandbox buyer, then close the window without paying)
   - Cart, then **Proceed to Checkout** (Stripe page loads, then go back without paying)
4. Copy any Content-Security-Policy messages into a note and send them to Claude.
5. If there are none, tell Claude to enforce the policy (section 1, #6).

### D. HSTS for subdomains (#6, optional)

This tells browsers to only ever use HTTPS for fozprints.com.au **and every subdomain**. Only turn it on if every subdomain works over HTTPS.

1. In Cloudflare, open fozprints.com.au, then **DNS → Records**. Note every subdomain (for example `www`, `send`, any others).
2. For each one that's a website (A, AAAA or CNAME records), visit `https://<subdomain>.fozprints.com.au` and check it loads without a certificate warning. Mail-only records (MX, TXT) don't matter.
3. If they all work:
   1. Go to **SSL/TLS → Edge Certificates**.
   2. Scroll to **HTTP Strict Transport Security (HSTS)** and click **Change settings**.
   3. Turn on **Apply HSTS policy to subdomains (includeSubDomains)**.
   4. Leave Max Age as it is (12 months), and leave **Preload** off.
   5. Save.
4. If any subdomain fails, leave this off and tell Claude which one.

### E. Policy review (#5)

The refund, shipping and terms pages were reworded to fit the Australian Consumer Law. Someone qualified should check them before launch.

1. Open these three pages on the test site (or live site once merged):
   - `/policies/refund-policy`
   - `/policies/shipping-policy`
   - `/policies/terms-of-service`
2. Save each as a PDF (Cmd+P → Save as PDF).
3. Send them to a lawyer or adviser with this note:
   > "These are the refund, shipping and terms pages for a small online store selling made-to-order 3D printed car parts in Australia. Could you check they're consistent with the Australian Consumer Law, especially the change-of-mind wording, faulty goods, and lost or damaged parcels?"
4. Free options if you don't have a lawyer:
   - The ACCC's guide for businesses on consumer guarantees: https://www.accc.gov.au/business/selling-products-and-services/consumer-guarantees
   - The NSW Small Business Commissioner offers free advice: https://www.smallbusiness.nsw.gov.au
5. Send Claude any changes the adviser asks for.

### F. Install manual: stereo removal and wiring (#22)

The manual doesn't yet explain removing the old stereo or getting the wiring up to the top cavity (step 6 just says "run all necessary wiring").

1. Next time you install a kit (or from memory), write down in order:
   1. How the original stereo or lower panel comes out: which trim pieces, clips and screws, and in what order.
   2. Which plugs are unplugged from the back of the old stereo (radio harness, antenna, anything else).
   3. The path the wiring takes up to the top cavity, and anything it must avoid (heater controls, airbag wiring, sharp edges).
   4. Whether the new head unit needs a wiring adapter or antenna adapter, and which one (brand or part number if you know it).
   5. What goes in the old stereo's space afterwards (a storage cubby, a blank panel, nothing).
   6. Anything that commonly goes wrong.
2. Take a photo of each step if you can (landscape, good light).
3. Send Claude the notes and photos. Claude will turn them into numbered steps with images, matching the rest of the manual.

### G. ABN and GST statement ✅ Done

Australian businesses should show their ABN, and prices should say whether they include GST.

1. Find the ABN:
   1. Go to https://abr.business.gov.au.
   2. Search for "Foz Prints" or the owner's name, and copy the 11-digit ABN.
2. Check GST registration:
   1. On the same ABN Lookup result, look at **Goods & Services Tax (GST)**. It says either "Registered from …" or "Not currently registered".
   2. If you're unsure what this means for your prices, ask your accountant.
3. Send Claude:
   - the ABN, and the business name exactly as it should appear (e.g. "Foz Prints, ABN 12 345 678 901");
   - whether you're registered for GST: if yes, prices will say "incl. GST"; if not, the site will say "No GST applies".

Claude will add this to the footer and the checkout pages.

### H. One name for the Nav Pod ✅ Done (site and Stripe)

The same product is called different things in different places, which confuses buyers and search engines. Names currently used include:

- "Subaru Forester SG Double DIN Nav Pod Kit (2003–2008) – USDM Spec" (Stripe product name)
- "Nav Pod Kit" (launch offer)
- "Double DIN Pod Upgrade Kit" (manual)
- "Subaru Forester SG Double DIN Nav Pod" (image descriptions)
- "Full Nav Pod Upgrade Kit" (older cart wording)

Steps:

1. Pick one **full name** (for page titles and Stripe) and one **short name** (for buttons, banners and the cart). For example:
   - Full: "Subaru Forester SG Double DIN Nav Pod Kit (2003 to 2008)"
   - Short: "Nav Pod Kit"
2. Send both to Claude. Claude will update the site, the manual and the product data sent to Google.
3. Rename the product in Stripe yourself:
   1. In the Stripe dashboard (live mode), go to **Product catalogue** and open the product.
   2. Click **Edit product**, change **Name**, and save.
   3. Don't change the product's URL handle (`metadata.handle`) unless Claude adds a redirect first, or old links will break.

### I. Sharing image and icons

When someone shares the site, the preview image is the wrong size, and two standard icons are missing.

1. Make a **sharing image**:
   - Size exactly **1200 × 630 pixels**, PNG or JPG, under 1 MB.
   - A good photo of the Nav Pod installed, with the Foz Prints name on it.
   - Keep important things away from the edges, because some apps crop it.
2. Make the **icons** from your logo. The easiest way:
   1. Go to https://realfavicongenerator.net and upload a square logo (at least 512 × 512).
   2. Download the package.
   3. You need `favicon.ico` and the 180 × 180 `apple-touch-icon.png` from it.
3. Send the three files to Claude, or put them in the project yourself:
   - `app/opengraph-image.png` (the 1200 × 630 image)
   - `app/favicon.ico`
   - `app/apple-icon.png` (the 180 × 180 icon)

   Next.js picks these up automatically from those names.

### J. Marketing copy

The audit flags some product copy as sounding template-written ("engineered specifically", "blend seamlessly", "100% OEM Modular Compatibility"). It suggests matching the About page's voice instead.

1. Find the audit's `content/REPORT.md` (in the same folder as `FOZPRINTS_HITLIST.md`) and copy **section 7**, which has suggested rewrites.
2. Send it to Claude, or paste it into the chat.
3. Read through the suggestions and mark any you don't want (wrong facts, not your voice).
4. Claude will apply the rest to the product pages, FAQ and metadata, and send you a before-and-after list to approve.

### K. Firefox and Safari test pass

The audit only tested in Chrome.

1. **Safari** is already on your Mac. For **Firefox**, download it from https://www.mozilla.org/firefox.
2. In each browser, open the live site (or the test site) and check each item below. Note anything that looks broken, with a screenshot:
   1. **Home:** the hero image loads; the product grid shows four cards on desktop.
   2. **Narrow window (iPad width):** two product cards per row; no sideways scrolling.
   3. **Phone width:** Safari: Develop → Enter Responsive Design Mode (turn on the Develop menu in Settings → Advanced). Firefox: Cmd+Option+M.
      - The header doesn't cover the page.
      - The menu opens and closes.
      - The cart doesn't overflow.
   4. **About page:** click **FAQs** and **Contact** in the header. The page should jump so the heading sits just below the header, not hidden under it.
   5. **Product page:** all photos load; switching finish changes the photo; Add to Cart shows the "added" message above the header.
   6. **Manual page:** every step photo loads (none blank or squashed).
   7. **Checkout:** the cart opens Stripe's page; the PayPal button appears. Don't pay.
   8. **Consent banner:** both buttons work.
3. On your phone (iPhone Safari, or Android Chrome), repeat steps 2.4 to 2.6.
4. Send Claude the notes and screenshots.


### L. Check the new phone carousel and photo viewer

These changed how things work on phones, so give them a quick try on a real phone after the next deploy.

1. On your phone, open the test site: https://security-fixes--fozprints.netlify.app
2. **Home page carousel:**
   1. Scroll to "Featured Products".
   2. Swipe left and right. It should move one card at a time and stop neatly on each.
   3. Tap the arrows and the dots. They should scroll to the right card, and the active dot should follow.
   4. Open the finish dropdown on a card (if it has one). It should open below the card, not get cut off.
3. **Product page photos:**
   1. Open the Nav Pod Kit.
   2. Swipe left and right on the main photo. It should change photo, and scrolling the page up and down should still work.
   3. Tap the photo. It should open full screen.
   4. Swipe, pinch to zoom, then tap ✕ to close.
4. **Cart:**
   1. Add an item and go to the cart.
   2. The minus button should be greyed out at 1.
   3. Press plus until you hit the stock limit. "Only N in stock" should appear.
   4. Type "abc" as the postcode and press Calculate. It should say "Please enter a valid Australian postcode".
5. Tell Claude anything that feels wrong, with a screenshot or screen recording if you can.

### M. Spelling in Stripe product text ✅ Checked: already Australian spelling

Product names and descriptions come from Stripe, so the site's spelling fixes don't cover them.

1. In the Stripe dashboard (live mode), go to **Product catalogue**.
2. Open each product and read its **Name** and **Description**.
3. Change US spellings to Australian ones. Common ones:
   - color → colour
   - organizer → organiser
   - center → centre
   - windshield → windscreen
   - aluminum → aluminium
   - gray → grey
4. Click **Save**. The site picks up the change within 5 minutes.
5. Don't change the product's **metadata** `handle` field, or its page address will change.
