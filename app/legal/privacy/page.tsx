// This is a wrapper that imports the existing Privacy Policy component
// No modifications to the original component are needed
import { PrivacyPolicy } from '@/components/pages/legal/privacy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Degentalk | Community Crypto Forum',
  description: 'Read Degentalk\'s privacy policy to understand how we collect, use, and protect your personal information on our crypto community forum platform.',
  keywords: 'degentalk privacy policy, data protection, user privacy, crypto forum privacy, gdpr compliance',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Policy - Degentalk',
    description: 'Learn how Degentalk protects your privacy and handles your data.',
    type: 'website',
    url: 'https://degentalk.net/legal/privacy',
  },
  alternates: {
    canonical: 'https://degentalk.net/legal/privacy',
  },
};

export default function PrivacyPolicyPage() {
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
        name: 'Privacy Policy',
        item: 'https://degentalk.net/legal/privacy'
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
      <PrivacyPolicy />
    </>
  );
}