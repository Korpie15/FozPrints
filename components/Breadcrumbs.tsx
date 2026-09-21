import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import '../styles/breadcrumbs.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Visible breadcrumb trail; the last item is the current page (no link). */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {items.map((item, i) => (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {i < items.length - 1 && <ChevronRight size={14} aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
