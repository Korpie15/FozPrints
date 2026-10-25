export interface Policy {
  handle: string;
  title: string;
  body: string;
}

export const POLICIES: Record<string, Policy> = {
  'shipping-policy': {
    handle: 'shipping-policy',
    title: 'Shipping Policy',
    body: `
      <h2>1. Processing Time</h2>
      <p>All parts are 3D printed and made to order. Please allow 1–2 business days for manufacturing and order processing before dispatch. Orders are not shipped or delivered on weekends or holidays.</p>
      <p>If we are experiencing a high volume of orders, manufacturing may take slightly longer. If there will be a significant delay in the shipment of your order, we will contact you via email.</p>
      
      <h2>2. Shipping Rates &amp; Delivery Estimates</h2>
      <p>Shipping charges for your order will be calculated and displayed at checkout based on the weight of your items and your delivery location. The Nav Pod Kit ships free with Australia Post standard shipping.</p>
      <ul>
        <li><strong>Domestic (Australia):</strong> We ship via Australia Post standard (typically 3–7 business days) and express (typically 1–3 business days) carrier options.</li>
        <li><strong>International:</strong> We currently ship within Australia only.</li>
      </ul>

      <h2>3. Shipment to P.O. Boxes</h2>
      <p>FozPrints ships to addresses within Australia only. We can deliver to P.O. Boxes and Parcel Lockers via Australia Post.</p>

      <h2>4. Shipment Confirmation &amp; Order Tracking</h2>
      <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). Please allow up to 48 hours for the tracking number to become active in the carrier's system.</p>

      <h2>5. Customs, Duties, and Taxes</h2>
      <p>FozPrints currently ships within Australia only, so customs duties and import taxes do not apply to domestic orders. If we begin offering international shipping in the future, any customs, tariffs, duties, or taxes imposed during or after shipping will be the responsibility of the customer, and we will update this policy before doing so.</p>

      <h2>6. Damaged or Lost Parcels</h2>
      <p>Your order is our responsibility until it is delivered. If your parcel is lost in transit or arrives damaged, we will send a replacement at no cost to you or give you a refund. If it arrives damaged, please keep the packaging and the damaged parts, take a few photos, and email us at <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>. We'll deal with Australia Post ourselves.</p>
    `,
  },

  'refund-policy': {
    handle: 'refund-policy',
    title: 'Refund Policy',
    body: `
      <h2>Change of Mind (Made to Order)</h2>
      <p>Because every part is 3D printed to order, we don't offer refunds or returns if you simply change your mind or no longer want the item. This doesn't affect your rights under the Australian Consumer Law, which are explained below.</p>
      <p>Please ensure you have selected the correct variant (e.g., correct model year or finish) before completing your purchase.</p>

      <h2>Damages, Defects, and Faulty Items</h2>
      <p>We stand by the quality of our prints. If your item arrives damaged, defective, broken, or if you receive the wrong item, we will make it right with a replacement part (sent at no cost to you) or a refund.</p>
      <p>Please check your order when it arrives and contact us as soon as you can if anything is wrong. Telling us early helps us sort it out quickly, but your rights under the Australian Consumer Law don't end after a set number of days.</p>

      <h2>How to Initiate a Claim</h2>
      <p>To report a defective or damaged item, please contact us at <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>.</p>
      <p>Please include:</p>
      <ol>
        <li>Your Order Number.</li>
        <li>A description of the issue.</li>
        <li>Photos of the damage/defect.</li>
      </ol>
      <p>Please contact us before sending anything back. If we need to inspect the item, we'll email you the return address and instructions, and we'll cover the return postage for faulty, damaged or incorrect items.</p>

      <h2>Refunds</h2>
      <p>We will notify you once we've inspected your claim (via photos or returned item) and let you know if the refund or replacement was approved.</p>
      <p>If approved, you will be offered a replacement part (sent at no cost to you) or a refund. If you choose a refund, you will be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund.</p>

      <h2>Australian Consumer Law</h2>
      <p>Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced if the goods fail to be of acceptable quality and the failure does not amount to a major failure.</p>

      <h2>Contact Us</h2>
      <p>For any questions regarding this policy or a specific order, please contact us at <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>.</p>
    `,
  },

  'privacy-policy': {
    handle: 'privacy-policy',
    title: 'Privacy Policy',
    body: `
      <p><em>Last updated: October 25, 2026</em></p>
      <p>Foz Prints operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.</p>
      <p>Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.</p>

      <h2>Personal Information We Collect or Process</h2>
      <p>When we use the term "personal information," we are referring to information that identifies or can reasonably be linked to you or another person. We may collect or process the following categories of personal information:</p>
      <ul>
        <li><strong>Contact details:</strong> including your name, address, billing address, shipping address, phone number, and email address.</li>
        <li><strong>Financial information:</strong> including credit card, debit card, and financial account numbers, payment confirmation and transaction details.</li>
        <li><strong>Account information:</strong> including your username, preferences and settings.</li>
        <li><strong>Transaction information:</strong> including the items you view, put in your cart, purchase, or cancel and your past transactions.</li>
        <li><strong>Communications with us:</strong> including the information you include in customer support inquiries.</li>
        <li><strong>Device information:</strong> including information about your device, browser, network connection, IP address, and unique identifiers.</li>
        <li><strong>Usage information:</strong> including how and when you navigate the Services.</li>
      </ul>

      <h2>Personal Information Sources</h2>
      <p>We may collect personal information from the following sources:</p>
      <ul>
        <li><strong>Directly from you:</strong> when you visit or use the Services, make a purchase, communicate with us, or provide information;</li>
        <li><strong>Automatically through the Services:</strong> from your device when you interact with our website via cookies and similar technologies;</li>
        <li><strong>From service providers:</strong> who enable payment processing, cloud hosting, shipping, and analytics on our behalf.</li>
      </ul>

      <h2>How We Use Your Personal Information</h2>
      <ul>
        <li><strong>Provide, Tailor, and Improve the Services:</strong> To perform our contract with you, process payments, fulfil orders, arrange shipping, facilitate customer support, and improve your shopping experience.</li>
        <li><strong>Marketing and Advertising:</strong> To send promotional communications and show relevant product recommendations where permitted.</li>
        <li><strong>Security and Fraud Prevention:</strong> To authenticate transactions, protect against fraud or unauthorized activity, and secure our systems.</li>
        <li><strong>Communicating with You:</strong> To provide customer support, notify you of order status, and respond to your inquiries.</li>
        <li><strong>Legal Reasons:</strong> To comply with applicable legal obligations and enforce our terms and policies.</li>
      </ul>

      <h2>How We Disclose Personal Information</h2>
      <p>In certain circumstances, we may disclose your personal information to third parties for legitimate purposes:</p>
      <ul>
        <li>With vendors and service providers who perform services on our behalf (e.g. Stripe payment processing, Australia Post shipping, cloud hosting, and data analytics).</li>
        <li>When you direct or consent to our disclosure of information to third parties to fulfil your orders.</li>
        <li>In connection with legal obligations, regulatory compliance, or to protect and defend our rights and the safety of our users.</li>
      </ul>

      <h2>Website Analytics (Microsoft Clarity)</h2>
      <p>If you choose "Allow analytics" in the banner on our website, we use Microsoft Clarity to understand how visitors use the site so we can improve it. Clarity records how you interact with our pages, such as clicks, scrolling, mouse movement and the pages you visit, and can replay these as session recordings. It also collects device and browser details and sets cookies (such as <code>_clck</code> and <code>_clsk</code>) to recognise repeat visits.</p>
      <p>Clarity is provided by Microsoft Corporation, which processes this data on our behalf, including on servers outside Australia (for example in the United States). Microsoft's own use of the data is described in the <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft Privacy Statement</a>.</p>
      <p>Clarity does not load unless you allow it. You can change your choice at any time using the "Analytics settings" link in the footer of our website; choosing "No thanks" stops Clarity and removes its cookies from your browser.</p>

      <h2>Children's Data</h2>
      <p>The Services are not intended for use by children, and we do not knowingly collect personal information about children under the age of majority in your jurisdiction.</p>

      <h2>Security and Retention of Your Information</h2>
      <p>We maintain reasonable security safeguards to protect your personal information. How long we retain your personal information depends on operational and legal requirements such as order fulfilment, warranty handling, accounting, and dispute resolution.</p>

      <h2>Your Rights and Choices</h2>
      <p>Depending on where you live, you may have rights under applicable privacy laws to request access to, correction of, or deletion of your personal information, or to opt out of promotional communications.</p>

      <h2>Contact</h2>
      <p>Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any rights, please contact us:</p>
      <ul>
        <li><strong>Address:</strong> 10 Lawson St, Matraville NSW 2036, Australia</li>
        <li><strong>Email:</strong> <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a></li>
        <li><strong>Phone:</strong> +61 403 736 341</li>
      </ul>
    `,
  },

  'terms-of-service': {
    handle: 'terms-of-service',
    title: 'Terms of Service',
    body: `
      <h2>Overview</h2>
      <p>Welcome to Foz Prints! The terms "we", "us" and "our" refer to Foz Prints. Foz Prints operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated shopping experience (the "Services"). These Terms of Service ("Terms") describe your rights and responsibilities when you use the Services. By visiting or purchasing from us, you agree to be bound by these Terms and our Privacy Policy.</p>

      <h2>Section 1 - Access and Account</h2>
      <p>By agreeing to these Terms, you represent that you are at least the age of majority in your state or country of residence. You agree to provide current, complete, and accurate information for all purchases made at our store.</p>

      <h2>Section 2 - Our Products</h2>
      <p>We have made every effort to display as accurately as possible the colours and images of our products. All descriptions of products and product pricing are subject to change at any time without notice at our sole discretion. We reserve the right to discontinue any product at any time.</p>

      <h2>Section 3 - Orders</h2>
      <p>When you place an order, you are making an offer to purchase. Foz Prints reserves the right to accept or decline your order for any reason at its discretion. Returns, replacements and refunds are handled under our <a href="/policies/refund-policy">Refund Policy</a> and your rights under the Australian Consumer Law.</p>

      <h2>Section 4 - Prices and Billing</h2>
      <p>Prices are subject to change without notice. You agree to provide valid payment details and authorise us or our payment processor (Stripe) to charge your payment method for all orders placed.</p>

      <h2>Section 5 - Shipping and Delivery</h2>
      <p>Delivery times are estimates. We are not responsible for delays caused by events outside our control, but we will keep you informed if your order is held up. Title and risk of loss pass to you when your order is delivered to the address you gave us. If a parcel is lost or damaged before then, see our <a href="/policies/shipping-policy">Shipping Policy</a>.</p>

      <h2>Section 6 - Intellectual Property</h2>
      <p>All content, designs, logos, product models, text, graphics, and images on the Services are owned by Foz Prints and protected by Australian and international intellectual property laws. You must not reproduce, duplicate, copy, sell, or exploit any portion of our products or website without express written permission.</p>

      <h2>Section 7 - Third-Party Links &amp; Tools</h2>
      <p>Certain content, products, and services available via our Services may include materials from third parties. We are not liable for any harm or damages related to the purchase or use of goods, services, resources, or content made in connection with third-party websites.</p>

      <h2>Section 8 - Prohibited Uses</h2>
      <p>You may access and use the Services for lawful purposes only. You are prohibited from using the site or its content for any unlawful purpose, to infringe upon intellectual property rights, to transmit malicious code, or to interfere with the security features of the Services.</p>

      <h2>Section 9 - Disclaimer of Warranties &amp; Limitation of Liability</h2>
      <p>Except as required by Australian Consumer Law, the Services and all products delivered to you are provided 'as is' and 'as available' without warranties of any kind. In no case shall Foz Prints, our directors, officers, or employees be liable for any indirect, incidental, punitive, special, or consequential damages arising from your use of the Services or products.</p>

      <h2>Section 10 - Indemnification</h2>
      <p>You agree to indemnify and hold harmless Foz Prints, its officers, employees, and suppliers from any claim or demand, including reasonable legal fees, arising out of your breach of these Terms of Service or violation of any law.</p>

      <h2>Section 11 - Governing Law</h2>
      <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of New South Wales, Australia.</p>

      <h2>Section 12 - Contact Information</h2>
      <p>Questions about the Terms of Service should be sent to us at <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>.</p>
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
