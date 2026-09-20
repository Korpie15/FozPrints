import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import '../../styles/manuals.css';

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
    url: 'https://fozprints.com/manuals',
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
            <h2>Subaru Forester (SG 2003-2008) Double DIN Pod Upgrade Kit – USDM Spec</h2>
            <p className="manual-description">
              Complete step-by-step installation guide for the Double DIN Pod Upgrade Kit with photos, tool requirements, and video transcript.
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
