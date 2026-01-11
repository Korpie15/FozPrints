import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import '../../styles/manuals.css';

export default function ManualsPage() {
  return (
    <div className="manuals-page">
      <div className="container">
        <h1>Installation Manuals</h1>
        <p className="manuals-intro">
          Download installation guides and manuals for your FozPrints products.
        </p>

        <div className="manuals-grid">
          {/* Installation Manual Card */}
          <Link href="/manuals/double-DIN-pod-upgrade-kit" className="manual-card">
            <div className="manual-icon">
              <FileText size={48} />
            </div>
            <h2>Subaru Forester (SG 2003-2008) Double DIN Pod Upgrade Kit – USDM Spec</h2>
            <p className="manual-description">
              Complete installation guide for the Double DIN Pod Upgrade Kit
              with step-by-step instructions and photos.
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
