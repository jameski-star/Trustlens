import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
        <li>
          <Link to="/" className="hover:text-[var(--text-accent)] transition-colors">
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5" />
            {item.href ? (
              <Link to={item.href} className="hover:text-[var(--text-accent)] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--text-primary)] font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
