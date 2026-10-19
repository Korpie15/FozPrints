import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/stripe';
import { ProductDetails } from '@/components/ProductDetails';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { toJsonLd } from '@/lib/utils';
import { SITE_URL } from '@/lib/site';
import { getProductSeoData, NAV_POD_FAQS, isNavPodProduct } from '@/lib/product-seo';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((product) => ({
      handle: product.handle,
    }));
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

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
  const { title, description, keywords } = getProductSeoData(product);

  const images = product.images.map((img) => img.url);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Foz Prints`,
      description,
      url: canonicalUrl,
      images: images.length > 0 ? images.map((url) => ({ url })) : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Foz Prints`,
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
    const isNavPod = isNavPodProduct(product);
    const { title: seoTitle, description: seoDescription } = getProductSeoData(product);

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: seoTitle,
      alternateName: isNavPod
        ? [
            'Subaru Forester SG Double DIN Nav Pod Kit (2003–2008) – USDM Spec',
            'SG Forester Nav Pod',
            'Subaru Forester SG Nav Pod',
            'SG Forester Navigation Pod',
            'Subaru Forester Double DIN Dash Pod',
            'Forester Double DIN Pod Upgrade Kit',
          ]
        : undefined,
      description: seoDescription,
      category: 'Automotive Interior Accessories',
      image: product.images.map((img) => (img.url.startsWith('/') ? `${siteUrl}${img.url}` : img.url)),
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
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'AU',
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
          merchantReturnLink: `${siteUrl}/policies/refund-policy`,
          itemDefectReturnFees: 'https://schema.org/FreeReturn',
          itemDefectReturnShippingFeesAmount: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'AUD',
          },
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: isNavPod ? '18.25' : '10.95',
            currency: 'AUD',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'AU',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 3,
              maxValue: 7,
              unitCode: 'DAY',
            },
          },
        },
      })),
    };

    const faqSchema = isNavPod
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: NAV_POD_FAQS.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

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
          name: seoTitle,
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
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: toJsonLd(faqSchema) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }}
        />
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: seoTitle },
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
