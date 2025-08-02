'use client';

import { usePathname, useSearchParams, useRouter as useNextRouter } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Compatibility layer for React Router hooks
// This allows existing components using React Router to work without modification

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
  
  return {
    pathname,
    search,
    hash: '',
    state: null,
    key: 'default',
  };
}

export function useNavigate() {
  const router = useNextRouter();
  
  return (to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
      return;
    }
    
    // Scroll to top before navigation
    window.scrollTo(0, 0);
    
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useParams<T = {}>(): T {
  // In Next.js App Router, params are passed as props to the page
  // This is a simplified version for compatibility
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    return segments.reduce((acc, segment, index) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const key = segment.slice(1, -1);
        acc[key] = segments[index + 1] || '';
      }
      return acc;
    }, {} as any) as T;
  }
  return {} as T;
}

// Export a Link component that works like React Router's Link
export { Link };

// NavLink compatibility

interface NavLinkProps {
  to: string;
  children: ReactNode;
  className?: string | ((props: { isActive: boolean }) => string);
  activeClassName?: string;
  [key: string]: any;
}

export function NavLink({ to, children, className, activeClassName, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === to;
  
  const finalClassName = typeof className === 'function' 
    ? className({ isActive })
    : cn(className, isActive && activeClassName);
  
  return (
    <Link href={to} className={finalClassName} {...props}>
      {children}
    </Link>
  );
}