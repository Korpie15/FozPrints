// Copies every product photo from Stripe onto this site (public/product-images)
// and records the mapping in lib/product-images.json.
//
// Why: Stripe's file storage takes 1-2s to serve each photo, so fetching from it
// while a visitor waits is slow. Serving our own copy is fast.
// Photos are resized (max 1600px wide) and saved as WebP.
//
// Run with:  npm run sync-images   (then commit public/product-images and lib/product-images.json)
// Any photo not in the mapping (e.g. newly uploaded to Stripe) still loads from Stripe until this is re-run.
import Stripe from 'stripe';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('No STRIPE_SECRET_KEY in environment');
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), 'public', 'product-images');
const MANIFEST = path.join(process.cwd(), 'lib', 'product-images.json');
const MAX_WIDTH = 1600;

const stripe = new Stripe(key);
await mkdir(OUT_DIR, { recursive: true });

const products = await stripe.products.list({ active: true, limit: 100 });
const urls = [...new Set(products.data.flatMap((p) => p.images))];
console.log(`Found ${urls.length} product photos on ${products.data.length} products.`);

const manifest = {};
for (const url of urls) {
  const file = `${createHash('sha1').update(url).digest('hex').slice(0, 16)}.webp`;
  const dest = path.join(OUT_DIR, file);

  if (!existsSync(dest)) {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) {
      console.warn(`  skipped (HTTP ${res.status}): ${url}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await sharp(buffer)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(dest);
    console.log(`  saved ${file}  (${Math.round(buffer.length / 1024)}KB -> ${Math.round((await sharp(dest).toBuffer()).length / 1024)}KB)`);
  }
  manifest[url] = `/product-images/${file}`;
}

// Remove copies of photos that are no longer on any product
const keep = new Set(Object.values(manifest).map((p) => path.basename(p)));
for (const file of await readdir(OUT_DIR)) {
  if (!keep.has(file)) await rm(path.join(OUT_DIR, file));
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Done. ${Object.keys(manifest).length} photos mirrored.`);
