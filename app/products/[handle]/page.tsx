import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/stripe';
import { ProductDetails } from '@/components/ProductDetails';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { toJsonLd } from '@/lib/utils';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const siteUrl = SITE_URL;
  const canonicalUrl = `${siteUrl}/products/${encodeURIComponent(product.handle)}`;
  const description =
    product.shortDescription ||
    product.description ||
    `Precision 3D printed ${product.title} designed for Subaru Forester models.`;

  const images = product.images.map((img) => img.url);

  return {
    title: product.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} | Foz Prints`,
      description,
      url: canonicalUrl,
      images: images.length > 0 ? images.map((url) => ({ url })) : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Foz Prints`,
      description,
      images: images[0] ? [images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { handle } = await params;
    const product = await getProduct(handle);

    if (!product) {
      notFound();
    }

    const siteUrl = SITE_URL;
    const productUrl = `${siteUrl}/products/${encodeURIComponent(product.handle)}`;

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.shortDescription || product.description,
      image: product.images.map((img) => img.url),
      url: productUrl,
      brand: {
        '@type': 'Brand',
        name: 'Foz Prints',
      },
      // One offer per variant so each price/availability is described accurately
      offers: product.variants.map((variant) => ({
        '@type': 'Offer',
        name: variant.title,
        url: productUrl,
        priceCurrency: variant.price.currencyCode || 'AUD',
        price: variant.price.amount,
        itemCondition: 'https://schema.org/NewCondition',
        availability: variant.availableForSale
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Foz Prints',
        },
      })),
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: `${siteUrl}/products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.title,
          item: `${siteUrl}/products/${encodeURIComponent(product.handle)}`,
        },
      ],
    };

    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }}
        />
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.title },
          ]}
        />
        <ProductDetails product={product} />
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}
