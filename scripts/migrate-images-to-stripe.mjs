import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('No STRIPE_SECRET_KEY in environment');
  process.exit(1);
}

const stripe = new Stripe(key);

async function migrateAllImages() {
  console.log('Fetching all products from Stripe...');
  const products = await stripe.products.list({ limit: 100 });
  console.log(`Found ${products.data.length} products.`);

  const urlMap = new Map();

  for (const product of products.data) {
    console.log(`\nProcessing: ${product.name} (${product.id})`);
    const newImages = [];

    for (let i = 0; i < product.images.length; i++) {
      const originalUrl = product.images[i];

      // If already on Stripe, keep it
      if (originalUrl.startsWith('https://files.stripe.com/')) {
        console.log(`  [${i + 1}/${product.images.length}] Already on Stripe.`);
        newImages.push(originalUrl);
        continue;
      }

      // If we already uploaded this exact URL earlier in the run, reuse it
      if (urlMap.has(originalUrl)) {
        console.log(`  [${i + 1}/${product.images.length}] Reusing cached Stripe file link.`);
        newImages.push(urlMap.get(originalUrl));
        continue;
      }

      console.log(`  [${i + 1}/${product.images.length}] Downloading: ${originalUrl}`);
      try {
        const response = await fetch(originalUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : 'jpg';
        const filename = `product_${product.id.slice(-6)}_${i + 1}.${extension}`;

        console.log(`  Uploading to Stripe Files (${(buffer.length / 1024).toFixed(1)} KB)...`);
        const file = await stripe.files.create({
          purpose: 'product_image',
          file: {
            data: buffer,
            name: filename,
            type: contentType,
          },
        });

        console.log(`  Creating public file link for ${file.id}...`);
        const fileLink = await stripe.fileLinks.create({ file: file.id });
        const stripeUrl = fileLink.url;

        urlMap.set(originalUrl, stripeUrl);
        newImages.push(stripeUrl);
        console.log(`  ✓ Linked: ${stripeUrl}`);
      } catch (err) {
        console.error(`  ✕ Error migrating image: ${err.message}`);
        // Fall back to original URL if download fails
        newImages.push(originalUrl);
      }
    }

    if (newImages.length > 0 && JSON.stringify(newImages) !== JSON.stringify(product.images)) {
      console.log(`  Saving updated images to Stripe product ${product.id}...`);
      await stripe.products.update(product.id, {
        images: newImages,
      });
      console.log(`  ✓ Product ${product.name} updated with Stripe images.`);
    }
  }

  console.log('\nAll products processed successfully!');
}

migrateAllImages().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
