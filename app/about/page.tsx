import type { Metadata } from 'next';
import { About } from '@/components/pages/about';
import { getDomainMetadata } from '@/lib/seo-config';

// export const dynamic = 'force-dynamic'; // Removed for performance - enables static generation

export async function generateMetadata(): Promise<Metadata> {
  // Use centralized SEO config
  const baseMetadata = await getDomainMetadata({
    title: 'About Degentalk™ - The Satirical Crypto Community',
    description: 'Born in the chaos of market crashes and rug pulls, Degentalk is the most unhinged cryptocurrency forum. Built by degens, for degens.',
    openGraph: {
      images: [{ 
        url: 'https://degentalk.net/banners/unhinged.webp',
        width: 1200,
        height: 630,
        alt: 'About Degentalk - The Most Unhinged Crypto Community'
      }]
    },
    twitter: {
      images: ['https://degentalk.net/banners/unhinged.webp']
    }
  });
  
  return {
    ...baseMetadata,
    // Remove deprecated keywords meta tag
    other: {
      'article:author': 'Degentalk Team',
      'article:section': 'About'
    }
  };
}

// Generate structured data
function generateAboutSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': 'https://degentalk.net/about#aboutpage',
        url: 'https://degentalk.net/about',
        name: 'About Degentalk™',
        description: 'Learn about Degentalk, the satirical crypto community platform.',
        isPartOf: { '@id': 'https://degentalk.net#website' },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              item: {
                '@id': 'https://degentalk.net',
                name: 'Home'
              }
            },
            {
              '@type': 'ListItem',
              position: 2,
              item: {
                '@id': 'https://degentalk.net/about',
                name: 'About'
              }
            }
          ]
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://degentalk.net#organization',
        name: 'Degentalk',
        founder: [
          {
            '@type': 'Person',
            name: 'Goombas',
            jobTitle: 'Co-Founder & Strategic Chaos Officer'
          },
          {
            '@type': 'Person',
            name: 'Gnarcotic',
            jobTitle: 'Co-Founder & Chief Technical Alchemist'
          }
        ],
        foundingDate: '2022',
        description: 'A satirical cryptocurrency community platform built by degens, for degens.'
      }
    ]
  };
}

export default function AboutPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateAboutSchema()) }}
      />
      
      {/* Original About component with handwritten notes */}
      <About />
    </>
  );
}