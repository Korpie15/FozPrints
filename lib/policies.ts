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
      <h2>Shipping and Dispatch</h2>
      <p>All FozPrints products are designed, manufactured, and shipped from Australia. Because our products are precision 3D printed using high-grade automotive materials, please allow 1-3 business days for order processing and manufacturing prior to dispatch.</p>
      
      <h3>Domestic Shipping (Australia)</h3>
      <p>We ship nationwide using Australia Post:</p>
      <ul>
        <li><strong>Standard Parcel Post:</strong> 3-7 business days depending on destination.</li>
        <li><strong>Express Post:</strong> 1-3 business days for metro areas.</li>
      </ul>
      <p>Tracking information will be emailed to you as soon as your parcel is lodged with Australia Post.</p>

      <h3>International Shipping</h3>
      <p>We ship internationally to selected countries including the United States, United Kingdom, Canada, and New Zealand. International transit times typically range from 6 to 14 business days. Import duties, taxes, and customs charges are the responsibility of the recipient.</p>
    `,
  },
  'refund-policy': {
    handle: 'refund-policy',
    title: 'Refund and Returns Policy',
    body: `
      <h2>Returns and Guarantees</h2>
      <p>Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage.</p>

      <h3>Fitment and Quality Guarantee</h3>
      <p>Every FozPrints component is test-fitted on actual Subaru Forester vehicles. If your item arrives damaged, defective, or does not fit as described for your specified vehicle model, contact us within 30 days of delivery at <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a> with your order number and photos of the issue.</p>

      <h3>Change of Mind</h3>
      <p>Because many products are printed to order, please choose carefully. For change of mind returns, items must be unused, uninstalled, and in their original packaging. Return shipping costs for change of mind are the responsibility of the customer.</p>
    `,
  },
  'privacy-policy': {
    handle: 'privacy-policy',
    title: 'Privacy Policy',
    body: `
      <h2>Your Privacy Matters</h2>
      <p>FozPrints respects your privacy. We collect only the information necessary to process your orders, deliver products, and communicate important updates regarding your purchases.</p>

      <h3>Information We Collect</h3>
      <ul>
        <li><strong>Contact Information:</strong> Name, email address, shipping and billing addresses, and phone number.</li>
        <li><strong>Payment Information:</strong> All payment transactions are securely processed directly by Stripe. FozPrints does not store or have access to your full credit card details.</li>
      </ul>

      <h3>Third-Party Service Providers</h3>
      <p>We share necessary information with trusted third parties solely to fulfil orders:</p>
      <ul>
        <li><strong>Stripe:</strong> Secure payment processing.</li>
        <li><strong>Australia Post:</strong> Parcel delivery and tracking.</li>
        <li><strong>Resend:</strong> Order confirmation and dispatch emails.</li>
      </ul>
    `,
  },
  'terms-of-service': {
    handle: 'terms-of-service',
    title: 'Terms of Service',
    body: `
      <h2>Terms and Conditions</h2>
      <p>By browsing, purchasing from, or using the FozPrints website, you agree to these Terms of Service.</p>

      <h3>Product Use and Installation</h3>
      <p>FozPrints produces aftermarket automotive accessories and upgrade kits. While our parts are engineered from heat and UV resistant materials suitable for automotive cabin environments, proper installation is essential. Refer to our installation manuals and guides before fitting any component.</p>

      <h3>Pricing and Currency</h3>
      <p>All prices displayed on the store are in Australian Dollars (AUD) unless specified otherwise. We reserve the right to modify pricing at any time without prior notice.</p>
    `,
  },
};

export async function getShopPolicies() {
  return {
    shippingPolicy: POLICIES['shipping-policy'],
    refundPolicy: POLICIES['refund-policy'],
    privacyPolicy: POLICIES['privacy-policy'],
    termsOfService: POLICIES['terms-of-service'],
  };
}

export async function getPolicy(handle: string): Promise<Policy | null> {
  return POLICIES[handle] || null;
}
