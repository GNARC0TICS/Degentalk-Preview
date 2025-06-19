import React from 'react';
import { Link } from 'wouter';
import {
  Breadcrumb as ShadBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

interface CrumbObject {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  /** Zone information for zone-level & deeper pages */
  zone?: { name: string; slug: string } | null;
  /** Forum information, if inside a forum */
  forum?: { name: string; slug: string } | null;
  /** Thread information, if inside a specific thread */
  thread?: { title: string; slug: string } | null;
  className?: string;
}

/**
 * Shared Breadcrumb component.
 *
 * Usage examples:
 *   <Breadcrumb zone={zone} />                         // /zones/[slug]
 *   <Breadcrumb zone={zone} forum={forum} />            // /forums/[forum_slug]
 *   <Breadcrumb zone={zone} forum={forum} thread={{ title, slug }} /> // /threads/[slug]
 */
export default function Breadcrumb({ zone, forum, thread, className }: BreadcrumbProps) {
  const crumbs: CrumbObject[] = [
    { label: 'Home', href: '/' }
  ];

  if (zone) {
    crumbs.push({ label: zone.name, href: `/zones/${zone.slug}` });
  }
  if (forum) {
    crumbs.push({ label: forum.name, href: `/forums/${forum.slug}` });
  }
  if (thread) {
    crumbs.push({ label: thread.title }); // Last crumb, no href.
  }

  return (
    <ShadBreadcrumb className={className}>
      <BreadcrumbList>
        {crumbs.map((c, idx) => (
          <React.Fragment key={idx}>
            <BreadcrumbItem>
              {c.href && idx !== crumbs.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={c.href as string}>{c.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{c.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {idx < crumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </ShadBreadcrumb>
  );
} 