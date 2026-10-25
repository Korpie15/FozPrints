import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPolicies, getPolicy } from '@/lib/policies';
import '@/styles/policy.css';
import { SITE_URL } from '@/lib/site';

// The policies are a fixed set, so build them all ahead and 404 anything else
export const dynamicParams = false;

export async function generateStaticParams() {
  const policies = await getAllPolicies();
  return policies.map((policy) => ({ handle: policy.handle }));
}

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
    notFound();
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
}
