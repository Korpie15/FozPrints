'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TroubleshootingItem {
  id: number;
  question: string;
  answer: string;
}

const items: TroubleshootingItem[] = [
  {
    id: 1,
    question: 'Wiring harness interferes with installation',
    answer:
      'Make sure the clock wiring harness is tucked as low as possible after disconnecting. You may need to push it further down with your fingers to create enough clearance for the head unit.',
  },
  {
    id: 2,
    question: "Brackets don't align with car mounting points",
    answer:
      "Double-check you have the correct model kit for your Forester year (SG 2003-2008 USDM). Ensure the brackets are attached to the correct sides of the head unit. Try loosening the bracket screws slightly to allow for minor adjustments.",
  },
  {
    id: 3,
    question: 'Gap between head unit and front cover',
    answer:
      'This is normal initially. Before tightening, flex and adjust the position of the brackets and head unit. You may need to loosen all screws, reposition, and gradually tighten them evenly to eliminate the gap.',
  },
  {
    id: 4,
    question: 'Screws keep falling into the dashboard',
    answer:
      'Work carefully and consider using magnetic-tip screwdrivers. Hold screws with your fingers as you start threading them. If a screw does fall, you may be able to retrieve it from below.',
  },
  {
    id: 5,
    question: "Nav pod won't press down fully",
    answer:
      'Ensure the front cover is properly installed and all mounting tabs are aligned. Check that no wiring is obstructing the installation. Apply firm, even pressure across the entire nav pod surface until you hear/feel it click into place.',
  },
  {
    id: 6,
    question: 'Head unit feels loose after installation',
    answer:
      'Check all 6 screws are properly tightened (4 for the head unit brackets and 2 for the front cover). Ensure brackets are firmly attached to the head unit. The nav pod pressing down on top also helps secure everything in place.',
  },
];

export function TroubleshootingAccordion() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <div className="troubleshooting-list">
      {items.map((item) => (
        <div key={item.id} className="troubleshooting-item">
          <button
            className={`troubleshooting-question ${openItem === item.id ? 'troubleshooting-question-active' : ''}`}
            onClick={() => setOpenItem(openItem === item.id ? null : item.id)}
          >
            <span>{item.question}</span>
            <ChevronDown
              className={`troubleshooting-icon ${openItem === item.id ? 'troubleshooting-icon-active' : ''}`}
              size={20}
            />
          </button>
          {openItem === item.id && (
            <div className="troubleshooting-answer">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
