import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('No STRIPE_SECRET_KEY found in process.env.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

function htmlToCleanText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function cleanAllDescriptions() {
  console.log('Fetching all active products from Stripe...');
  const products = await stripe.products.list({ active: true, limit: 100 });

  for (const product of products.data) {
    if (product.description && product.description.includes('<')) {
      const cleaned = htmlToCleanText(product.description);
      console.log(`Cleaning: ${product.name}`);
      await stripe.products.update(product.id, {
        description: cleaned,
      });
      console.log(`  ✓ Updated ${product.name}`);
    }
  }

  console.log('All Stripe products updated with clean newlines and formatting!');
}

cleanAllDescriptions().catch((err) => {
  console.error('Error updating descriptions in Stripe:', err);
});
