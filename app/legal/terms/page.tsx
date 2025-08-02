// This is a wrapper that imports the existing Terms of Service component
// No modifications to the original component are needed
import { TermsOfService } from '@/components/pages/legal/terms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Degentalk | Community Crypto Forum',
  description: 'Read Degentalk\'s terms of service. By using our crypto community forum platform, you agree to these terms and conditions.',
  keywords: 'degentalk terms, terms of service, user agreement, crypto forum terms, platform rules, community guidelines',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Terms of Service - Degentalk',
    description: 'Terms and conditions for using the Degentalk crypto community forum platform.',
    type: 'website',
    url: 'https://degentalk.net/legal/terms',
  },
  alternates: {
    canonical: 'https://degentalk.net/legal/terms',
  },
};

export default function TermsOfServicePage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://degentalk.net'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Legal',
        item: 'https://degentalk.net/legal'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Terms of Service',
        item: 'https://degentalk.net/legal/terms'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <TermsOfService />
    </>
  );
}