export interface Policy {
  handle: string;
  title: string;
  /** Search and link-preview description */
  description: string;
  body: string;
}

export const POLICIES: Record<string, Policy> = {
  'shipping-policy': {
    handle: 'shipping-policy',
    title: 'Shipping Policy',
    description:
      'How Foz Prints ships within Australia: made-to-order processing times, Australia Post delivery estimates, free shipping on the Nav Pod Kit, and lost or damaged parcels.',
    body: `
      <h2>1. Processing Time</h2>
      <p>All parts are 3D printed and made to order. Please allow 1–2 business days for manufacturing and order processing before dispatch. We dispatch orders on business days (not weekends or public holidays).</p>
      <p>If we are experiencing a high volume of orders, manufacturing may take slightly longer. If there will be a significant delay in the shipment of your order, we will contact you via email.</p>
      
      <h2>2. Shipping Rates &amp; Delivery Estimates</h2>
      <p>Shipping charges for your order will be calculated and displayed at checkout based on the weight of your items and your delivery location. The Nav Pod Kit ships free with Australia Post standard shipping.</p>
      <ul>
        <li><strong>Domestic (Australia):</strong> We ship via Australia Post standard (typically 3–7 business days) and express (typically 1–3 business days) carrier options.</li>
        <li><strong>International:</strong> We currently ship within Australia only.</li>
      </ul>

      <h2>3. Shipment to P.O. Boxes</h2>
      <p>Foz Prints ships to addresses within Australia only. We can deliver to P.O. Boxes and Parcel Lockers via Australia Post.</p>

      <h2>4. Shipment Confirmation &amp; Order Tracking</h2>
      <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). Please allow up to 48 hours for the tracking number to become active in the carrier's system.</p>

      <h2>5. Customs, Duties, and Taxes</h2>
      <p>Foz Prints currently ships within Australia only, so customs duties and import taxes do not apply to domestic orders. If we begin offering international shipping in the future, any customs, tariffs, duties, or taxes imposed during or after shipping will be the responsibility of the customer, and we will update this policy before doing so.</p>

      <h2>6. Damaged or Lost Parcels</h2>
      <p>Your order is our responsibility until it is delivered. If your parcel is lost in transit or arrives damaged, we will send a replacement at no cost to you or give you a refund. If it arrives damaged, please keep the packaging and the damaged parts, take a few photos, and email us at <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>. We'll deal with Australia Post ourselves.</p>
    `,
  },

  'refund-policy': {
    handle: 'refund-policy',
    title: 'Refund Policy',
    description:
      'Foz Prints refunds and returns: your rights under the Australian Consumer Law, faulty, damaged or incorrect items, and how to make a claim.',
    body: `
      <h2>Your Rights Under the Australian Consumer Law</h2>
      <p>Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced if the goods fail to be of acceptable quality and the failure does not amount to a major failure.</p>
      <p>These guarantees apply to made-to-order parts too: every part must be of acceptable quality, match its description, and be fit for any purpose you told us about or that we said it was fit for. Nothing in this policy limits these rights.</p>

      <h2>Faulty, Damaged or Incorrect Items</h2>
      <p>If your item arrives damaged, is faulty, or isn't what you ordered, we'll put it right:</p>
      <ul>
        <li><strong>Major failure</strong> (for example, the part is unsafe, doesn't do what it's meant to, or you wouldn't have bought it had you known about the problem): you choose a refund or a replacement.</li>
        <li><strong>Other problems</strong>: we'll repair or replace the part, or refund you if we can't fix it within a reasonable time.</li>
      </ul>
      <p>Replacements are sent at no cost to you, and we pay the return postage for faulty, damaged or incorrect items. There's no fixed deadline for reporting a fault, but telling us early helps us sort it out quickly.</p>

      <h2>Change of Mind (Made to Order)</h2>
      <p>Because every part is 3D printed to order, we don't offer refunds or returns if you simply change your mind or no longer want the item. This doesn't affect your rights for faulty, damaged or incorrect items described above.</p>
      <p>Please check you've selected the right option (for example, the finish) and that your dash matches the product photos before ordering. If you're unsure, email us first.</p>

      <h2>How to Make a Claim</h2>
      <p>Email us at <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a> with:</p>
      <ol>
        <li>Your order number.</li>
        <li>A description of the problem.</li>
        <li>Photos of the problem, if you can.</li>
      </ol>
      <p>Please contact us before sending anything back. If we need to see the item, we'll email you the return address and instructions.</p>

      <h2>Refunds</h2>
      <p>We'll reply as soon as we can, usually within 2 business days, to confirm the remedy. Refunds go back to your original payment method, normally within 10 business days of us confirming the refund; your bank or card provider may take a few extra days to show it. These are our usual timeframes and don't limit your rights under the Australian Consumer Law.</p>

      <h2>Contact Us</h2>
      <p>For any questions about this policy or an order, email us at <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>.</p>
    `,
  },

  'privacy-policy': {
    handle: 'privacy-policy',
    title: 'Privacy Policy',
    description:
      'How Foz Prints collects, uses, stores and shares your personal information, including payments, analytics, overseas service providers, and how to access, correct or complain.',
    body: `
      <p><em>Last updated: 25 October 2026</em></p>
      <p>This Privacy Policy explains how Foz Prints (ABN 21 146 926 791) collects, uses, stores and discloses your personal information when you visit fozprints.com.au, buy from us, or contact us. We aim to handle personal information in line with the Australian Privacy Principles.</p>

      <h2>What We Collect</h2>
      <ul>
        <li><strong>Order details:</strong> your name, email address, phone number (if you give it), billing and delivery addresses, what you ordered, and payment confirmation details. Card and PayPal payments are processed by Stripe and PayPal; we never see or store your full card number.</li>
        <li><strong>Messages you send us:</strong> your name, email address and message when you use our contact form or email us.</li>
        <li><strong>International waitlist:</strong> your name, email address, country, the product you're interested in, and any notes, if you register interest in international shipping.</li>
        <li><strong>Website usage:</strong> basic visit details (see Analytics and Cookies below), and, only if you allow it, how you use our pages.</li>
      </ul>
      <p>Your shopping cart and your analytics choice are stored in your own browser, not on our systems.</p>

      <h2>How We Use It</h2>
      <ul>
        <li>To process payments, make and deliver your order, and send you order and delivery updates.</li>
        <li>To handle returns, faults and warranty claims, and to answer your questions.</li>
        <li>To email you about international shipping and a related launch offer, only if you joined the international waitlist. We don't send other marketing, and every email includes a way to unsubscribe.</li>
        <li>To understand how the site is used and improve it.</li>
        <li>To prevent fraud, keep the site secure, and meet our legal obligations (for example, keeping tax records).</li>
      </ul>

      <h2>Who We Share It With</h2>
      <p>We share personal information only with the service providers that help us run the store, and only as needed for the purposes above:</p>
      <ul>
        <li><strong>Stripe</strong> and <strong>PayPal</strong>: payment processing.</li>
        <li><strong>Australia Post</strong>: delivery of your order.</li>
        <li><strong>Netlify</strong>: website hosting.</li>
        <li><strong>Neon</strong>: our order and waitlist database, hosted in Sydney.</li>
        <li><strong>Resend</strong>: sending your order confirmation email, and delivering order notifications and contact form messages to our inbox.</li>
        <li><strong>Cloudflare</strong>: website security, delivery and visit statistics.</li>
        <li><strong>Microsoft</strong>: Clarity analytics, only if you allow it.</li>
      </ul>
      <p>We may also disclose information if required by law, or to protect our rights or the safety of others. We don't sell your personal information.</p>

      <h2>Overseas Disclosure</h2>
      <p>Some of these providers store or process information outside Australia, mainly in the United States and in other countries where they operate: Stripe, PayPal, Netlify, Resend, Cloudflare and Microsoft. We choose established providers and take reasonable steps to make sure they protect your information.</p>

      <h2>Analytics and Cookies</h2>
      <h3>Cloudflare</h3>
      <p>Our website is delivered through Cloudflare. Cloudflare may set security cookies (such as <code>cf_clearance</code>) to protect the site from bots and abuse. We also use Cloudflare Web Analytics to count visits and see how quickly pages load. It runs for all visitors, uses no cookies, and doesn't track you across other websites; Cloudflare does not use this data to identify you. It records basic details of each visit, such as the page viewed, the referring website, your browser and device type, and page load times. See the <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a>.</p>
      <h3>Microsoft Clarity (only if you allow it)</h3>
      <p>If you choose "Allow analytics" in the banner, we use Microsoft Clarity to see how visitors use the site so we can improve it. Clarity records how you interact with our pages, such as clicks, scrolling, mouse movement and the pages you visit, and can replay these as session recordings. Text you type into forms is masked. Clarity collects device and browser details and sets cookies (such as <code>_clck</code> and <code>_clsk</code> on our site, and others on Microsoft's own domains) to recognise repeat visits. Microsoft keeps this data for a limited period it sets, and its own use of the data is described in the <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft Privacy Statement</a>.</p>
      <p>Clarity does not load unless you allow it. You can change your choice at any time using the "Analytics settings" link in the footer. Choosing "No thanks" stops Clarity loading and clears the Clarity cookies set on this site.</p>

      <h2>How Long We Keep It</h2>
      <ul>
        <li><strong>Orders:</strong> 5 years, as required for tax and business records.</li>
        <li><strong>Messages:</strong> as long as needed to deal with your enquiry, and no more than 2 years.</li>
        <li><strong>International waitlist:</strong> until you unsubscribe, or until we've told you international shipping is available, after which we delete it.</li>
      </ul>
      <p>We protect information with reasonable security measures, including encrypted connections and limited access to our systems.</p>

      <h2>Access, Correction and Deletion</h2>
      <p>You can ask to see the personal information we hold about you, ask us to correct it, or ask us to delete it (except where we must keep it, such as tax records). Email <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a> and we'll respond within 30 days. You can unsubscribe from waitlist emails at any time using the link in the email or by replying to it.</p>

      <h2>Children</h2>
      <p>Our store is not directed at children, and we don't knowingly collect personal information from children under 16.</p>

      <h2>Complaints</h2>
      <p>If you have a concern about how we've handled your personal information, please email us first and we'll respond within 30 days. If you're not satisfied with our response, you can contact the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">oaic.gov.au</a> or on 1300 363 992.</p>

      <h2>Changes to This Policy</h2>
      <p>We'll update this page if our practices change, and change the "Last updated" date above.</p>

      <h2>Contact</h2>
      <ul>
        <li><strong>Location:</strong> Sydney NSW 2036, Australia (online store, no shopfront)</li>
        <li><strong>Email:</strong> <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a></li>
      </ul>
    `,
  },

  // Redrafted after the October 2026 audit to remove likely unfair contract terms.
  // NOT yet reviewed by a lawyer: have it checked before relying on it (audit step 2E).
  'terms-of-service': {
    handle: 'terms-of-service',
    title: 'Terms of Service',
    description:
      'The terms for buying from Foz Prints: orders, prices, delivery, the launch offer, installation and safety, and your rights under the Australian Consumer Law.',
    body: `
      <h2>Overview</h2>
      <p>These Terms apply when you use fozprints.com.au or buy from Foz Prints (ABN 21 146 926 791), a business based in New South Wales, Australia. "We", "us" and "our" mean Foz Prints. Please also read our <a href="/policies/refund-policy">Refund Policy</a>, <a href="/policies/shipping-policy">Shipping Policy</a> and <a href="/policies/privacy-policy">Privacy Policy</a>.</p>
      <p>Nothing in these Terms excludes, restricts or changes your rights under the Australian Consumer Law or any other law that can't be excluded.</p>

      <h2>1. Our Products</h2>
      <p>Our parts are aftermarket accessories, 3D printed to order. They are not genuine Subaru parts. Foz Prints is an independent business, not affiliated with, authorised by or endorsed by Subaru Corporation or Subaru Australia; Subaru and Forester are trade marks of their owners and are used only to describe vehicle compatibility.</p>
      <p>We take care to describe and photograph our products accurately. As each part is printed, small variations in finish and colour are normal.</p>

      <h2>2. Orders</h2>
      <p>Placing an order is an offer to buy. We accept it when your payment goes through. We may decline or cancel an order only if the item is unavailable, the price or description was clearly wrong, we can't deliver to your address, or we reasonably suspect fraud. If we do, we'll tell you and refund any payment in full.</p>

      <h2>3. Prices and Payment</h2>
      <p>Prices are in Australian dollars. Foz Prints is not registered for GST, so no GST is charged. Delivery costs are shown before you pay. We may change our prices or products from time to time, but the price you pay is the price shown when you place your order. Payments are processed by Stripe or PayPal.</p>

      <h2>4. Launch Offer</h2>
      <p>Code LAUNCH50 gives A$50 off one Nav Pod Kit per order, for the first 10 orders that use it (card and PayPal combined). It can't be combined with other codes, has no cash value, and ends once 10 orders have used it. Standard shipping on the Nav Pod Kit is always free and isn't part of this offer.</p>

      <h2>5. Delivery</h2>
      <p>We ship within Australia only. Delivery times are estimates, and we'll keep you informed if your order is delayed. Your order is our responsibility until it's delivered to the address you gave us: if it's lost or damaged in transit, see our <a href="/policies/shipping-policy">Shipping Policy</a>.</p>

      <h2>6. Installation and Safety</h2>
      <p>Please read the safety information on the product page and in the installation manual before fitting any part. Fit parts only if you're confident working on your car's interior, or have them fitted by a qualified installer. Do not fit any part in or near the path of an airbag, or modify airbag (SRS) components. You're responsible for making sure your car, once modified, meets your state's road rules and roadworthy and registration requirements. This doesn't limit your rights under the Australian Consumer Law.</p>

      <h2>7. Our Liability</h2>
      <p>Our goods come with guarantees under the Australian Consumer Law, and our Refund Policy explains your remedies. To the extent the law allows, we're not liable for loss caused by fitting or using a part in a way that goes against our instructions or safety information, or by modifying it. We're also not liable for loss that wasn't reasonably foreseeable. These limits don't apply to any liability that can't be excluded by law.</p>

      <h2>8. Intellectual Property</h2>
      <p>Our designs, product models, photos and website content belong to Foz Prints. Please don't copy, reproduce or sell them without our written permission.</p>

      <h2>9. Using Our Website</h2>
      <p>Please use the site lawfully and don't try to interfere with its security or operation. Links to other websites are provided for convenience; we aren't responsible for their content.</p>

      <h2>10. Changes to These Terms</h2>
      <p>We may update these Terms from time to time. The version on this page when you place an order is the one that applies to that order.</p>

      <h2>11. Governing Law</h2>
      <p>These Terms are governed by the laws of New South Wales, Australia.</p>

      <h2>12. Contact</h2>
      <p>Questions about these Terms? Email <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>.</p>
    `,
  },
};

export interface ShopPolicies {
  shippingPolicy?: Policy;
  refundPolicy?: Policy;
  privacyPolicy?: Policy;
  termsOfService?: Policy;
}

export async function getPolicy(handle: string): Promise<Policy | null> {
  return POLICIES[handle] || null;
}

export async function getShopPolicies(): Promise<ShopPolicies> {
  return {
    shippingPolicy: POLICIES['shipping-policy'],
    refundPolicy: POLICIES['refund-policy'],
    privacyPolicy: POLICIES['privacy-policy'],
    termsOfService: POLICIES['terms-of-service'],
  };
}

export async function getAllPolicies(): Promise<Policy[]> {
  return Object.values(POLICIES);
}
