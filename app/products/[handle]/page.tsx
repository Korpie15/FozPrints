import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/stripe';
import { ProductDetails } from '@/components/ProductDetails';

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fozprints.com';
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fozprints.com';
    const mainImage = product.images[0]?.url;
    const isAvailable = product.variants.some((v) => v.availableForSale);
    const minPrice = product.price;

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.shortDescription || product.description,
      image: mainImage ? [mainImage] : undefined,
      brand: {
        '@type': 'Brand',
        name: 'Foz Prints',
      },
      offers: {
        '@type': 'Offer',
        url: `${siteUrl}/products/${encodeURIComponent(product.handle)}`,
        priceCurrency: product.currencyCode || 'AUD',
        price: minPrice,
        availability: isAvailable
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Foz Prints',
        },
      },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <ProductDetails product={product} />
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}
