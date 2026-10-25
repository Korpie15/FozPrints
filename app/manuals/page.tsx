import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import '../../styles/manuals.css';
import { SITE_URL } from '@/lib/site';
import { NAV_POD_NAME } from '@/lib/product-seo';

export const metadata: Metadata = {
  title: 'Subaru Forester Installation Manuals & Guides',
  description:
    'Detailed step-by-step installation guides and documentation for FozPrints Subaru Forester 3D printed double DIN pods and custom accessories.',
  alternates: {
    canonical: '/manuals',
  },
  openGraph: {
    title: 'Subaru Forester Installation Manuals | Foz Prints',
    description:
      'Detailed step-by-step installation guides and documentation for FozPrints Subaru Forester 3D printed double DIN pods and custom accessories.',
    url: `${SITE_URL}/manuals`,
  },
};

export default function ManualsPage() {
  return (
    <div className="manuals-page">
      <div className="container">
        <h1>Installation Manuals & Guides</h1>
        <p className="manuals-intro">
          Download and view step-by-step installation guides for FozPrints 3D printed Forester upgrades.
        </p>

        <div className="manuals-grid">
          {/* Installation Manual Card */}
          <Link href="/manuals/double-DIN-pod-upgrade-kit" className="manual-card">
            <div className="manual-icon">
              <FileText size={48} />
            </div>
            <h2>{NAV_POD_NAME}</h2>
            <p className="manual-description">
              Complete step-by-step installation guide for the Nav Pod Kit with photos, wiring notes, tool requirements, and detailed instructions.
            </p>
            <div className="manual-actions">
              <span className="view-button">
                View Instructions
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
