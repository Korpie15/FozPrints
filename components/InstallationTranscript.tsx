'use client';

import { useState } from 'react';
import { Video, ChevronDown, ChevronUp } from 'lucide-react';

export function InstallationTranscript() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          backgroundColor: '#f8fafc',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Video size={22} color="#0284c7" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
              Video Installation Guide & Full Transcript
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              Read the complete audio & video transcript for step-by-step guidance
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
      </button>

      {isOpen && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff', lineHeight: '1.7', color: '#334155' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              Video Summary
            </h4>
            <p>
              In this video, we demonstrate how to upgrade your 2003–2008 USDM Subaru Forester SG dashboard top storage pocket into a clean Double DIN head unit navigation pod using the FozPrints 3D Printed Pod Kit.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              Full Timestamped Transcript
            </h4>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#0284c7' }}>[00:00 - 00:45] Intro & Tool Preparation</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>
                "Hey everyone! Welcome back to FozPrints. Today we're installing the USDM SG Forester Double DIN Pod Upgrade Kit. Before we start, make sure you have your plastic trim tool or flathead screwdriver and a standard Phillips screwdriver ready."
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#0284c7' }}>[00:46 - 02:15] Removing Factory Storage Pocket</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>
                "Gently insert your trim tool along the front edge of the top dashboard pocket. Pry upward with even pressure. The pocket is secured only by retaining clips. Disconnect the clock wiring harness from behind the pocket and tuck the wire low into the dash cavity."
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#0284c7' }}>[02:16 - 04:30] Bracket & Head Unit Assembly</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>
                "Take your aftermarket double DIN head unit and align the FozPrints left and right mounting brackets. Use the supplied M5 screws to secure the brackets on both sides. Hand-tighten first to allow slight movement for alignment."
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#0284c7' }}>[04:31 - 06:10] Wiring & Dash Fitment</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>
                "Route your radio harness, antenna, and auxiliary cables into the dash opening. Connect all plugs behind the head unit. Carefully lower the assembly into place and align the bracket tabs with the factory mounting holes in the Subaru dashboard."
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#0284c7' }}>[06:11 - 07:45] Front Trim Cover & Pod Installation</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>
                "Attach the front cover panel using the original screws saved from the factory pocket. Adjust the head unit position slightly if you see any small gap, then tighten all bracket screws. Finally, press the top nav pod housing firmly down until it clicks flush into place."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
