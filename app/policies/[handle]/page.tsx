import { notFound } from 'next/navigation';
import { getPolicy } from '@/lib/policies';
import '@/styles/policy.css';

interface PolicyPageProps {
  params: Promise<{
    handle: string;
  }>;
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
