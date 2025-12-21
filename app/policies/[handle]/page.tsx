import { notFound } from 'next/navigation';
import { getShopPolicies } from '@/lib/shopify';
import '../../../styles/policy.css';

interface PolicyPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  try {
    const { handle } = await params;
    const policies = await getShopPolicies();

    // Map the handle to the correct policy
    let policy = null;

    switch (handle) {
      case 'privacy-policy':
        policy = policies.privacyPolicy;
        break;
      case 'refund-policy':
        policy = policies.refundPolicy;
        break;
      case 'shipping-policy':
        policy = policies.shippingPolicy;
        break;
      case 'terms-of-service':
        policy = policies.termsOfService;
        break;
      default:
        notFound();
    }

    if (!policy || !policy.body) {
      notFound();
    }

    // Display the policy content directly
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
