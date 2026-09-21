import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPolicy } from '@/lib/policies';
import '@/styles/policy.css';
import { SITE_URL } from '@/lib/site';

interface PolicyPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { handle } = await params;
  const policy = await getPolicy(handle);

  if (!policy) {
    return {
      title: 'Policy Not Found',
    };
  }

  const siteUrl = SITE_URL;

  return {
    title: policy.title,
    description: `Read the ${policy.title} for Foz Prints online store.`,
    alternates: {
      canonical: `${siteUrl}/policies/${handle}`,
    },
    openGraph: {
      title: `${policy.title} | Foz Prints`,
      description: `Read the ${policy.title} for Foz Prints online store.`,
      url: `${siteUrl}/policies/${handle}`,
    },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  try {
    const { handle } = await params;
    const policy = await getPolicy(handle);

    if (!policy || !policy.body) {
      notFound();
    }

    return (
      <div className="policy-page">
        <div className="container">
          <div className="policy-content">
            <h1>{policy.title}</h1>
            <div
              className="policy-body"
              dangerouslySetInnerHTML={{ __html: policy.body }}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading policy:', error);
    notFound();
  }
}
