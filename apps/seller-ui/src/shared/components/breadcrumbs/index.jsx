'use client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BreadCrumbs = ({ title }) => {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname, excluding 'dashboard'
  const pathSegments = pathname
    .split('/')
    .filter(Boolean)
    .filter((segment) => segment !== 'dashboard');

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      label,
      href,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-blue-500 mb-4">
      <Link
        href="/dashboard"
        className="hover:text-white transition-colors flex items-center"
      >
        Dashboard
      </Link>

      {breadcrumbItems.map((item) => (
        <div key={item.href} className="flex items-center space-x-2">
          <ChevronRight size={16} className="text-gray-600" />
          {item.isLast ? (
            <span className="text-white font-medium">
              {title || item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default BreadCrumbs;
