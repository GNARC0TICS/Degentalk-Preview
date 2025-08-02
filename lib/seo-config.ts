/**
 * Domain-specific SEO configuration for Degentalk
 * Different domains emphasize different aspects of the platform
 */

export interface DomainSEOConfig {
  domain: string;
  tld: string;
  baseUrl: string;
  brandName: string; // "Degentalk" or "Degentalk™"
  tagline: string;
  focus: string; // Main SEO focus for this domain
  keywords: string[];
}

export const domainConfigs: Record<string, DomainSEOConfig> = {
  '.io': {
    domain: 'degentalk.io',
    tld: '.io',
    baseUrl: 'https://degentalk.io',
    brandName: 'Degentalk™',
    tagline: 'The Premier Crypto Trading Community Platform',
    focus: 'technology',
    keywords: ['crypto platform', 'blockchain technology', 'defi platform', 'web3 community', 'crypto tech']
  },
  '.app': {
    domain: 'degentalk.app',
    tld: '.app',
    baseUrl: 'https://degentalk.app',
    brandName: 'Degentalk',
    tagline: 'Your Crypto Trading Community App',
    focus: 'application',
    keywords: ['crypto app', 'trading application', 'defi app', 'mobile crypto platform', 'crypto community app']
  },
  '.net': {
    domain: 'degentalk.net',
    tld: '.net',
    baseUrl: 'https://degentalk.net',
    brandName: 'Degentalk™',
    tagline: 'The Crypto Trading Network',
    focus: 'network',
    keywords: ['crypto network', 'trading community network', 'defi network', 'blockchain network', 'trader network']
  },
  '.org': {
    domain: 'degentalk.org',
    tld: '.org',
    baseUrl: 'https://degentalk.org',
    brandName: 'Degentalk',
    tagline: 'Open Crypto Community Organization',
    focus: 'community',
    keywords: ['crypto organization', 'community forum', 'defi community', 'open source crypto', 'crypto collective']
  },
  '.info': {
    domain: 'degentalk.info',
    tld: '.info',
    baseUrl: 'https://degentalk.info',
    brandName: 'Degentalk',
    tagline: 'Crypto Trading Information Hub',
    focus: 'information',
    keywords: ['crypto information', 'trading guides', 'defi education', 'crypto resources', 'market insights']
  },
  '.ca': {
    domain: 'degentalk.ca',
    tld: '.ca',
    baseUrl: 'https://degentalk.ca',
    brandName: 'Degentalk™',
    tagline: 'Canada\'s Crypto Trading Community',
    focus: 'regional',
    keywords: ['canadian crypto', 'canada bitcoin', 'canadian defi', 'crypto canada', 'canadian traders']
  }
};

// Get current domain config based on hostname
export function getCurrentDomainConfig(): DomainSEOConfig {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'degentalk.io';
    const tld = '.' + domain.split('.').pop();
    return domainConfigs[tld] || domainConfigs['.io'];
  }
  
  // Client-side: use window.location
  const hostname = window.location.hostname;
  const tld = '.' + hostname.split('.').pop();
  return domainConfigs[tld] || domainConfigs['.io'];
}

// Generate domain-specific metadata
export function getDomainMetadata(baseMeta: {
  title: string;
  description: string;
  keywords?: string;
  openGraph?: any;
  twitter?: any;
  alternates?: any;
}) {
  const config = getCurrentDomainConfig();
  
  // Enhance title with domain-specific tagline
  const enhancedTitle = baseMeta.title.replace('Degentalk', config.brandName);
  
  // Add domain-specific keywords
  const baseKeywords = baseMeta.keywords ? baseMeta.keywords.split(', ') : [];
  const allKeywords = [...new Set([...config.keywords, ...baseKeywords])];
  
  return {
    ...baseMeta,
    title: enhancedTitle,
    keywords: allKeywords.join(', '),
    openGraph: {
      ...baseMeta.openGraph,
      title: enhancedTitle,
      url: `${config.baseUrl}${baseMeta.openGraph?.url || ''}`,
      siteName: config.brandName,
    },
    twitter: {
      ...baseMeta.twitter,
      title: enhancedTitle,
    },
    alternates: {
      canonical: `${config.baseUrl}${baseMeta.alternates?.canonical || ''}`,
    }
  };
}

// SEO Schema for different page types
export const pageSchemas = {
  home: (config: DomainSEOConfig) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.brandName,
    description: `${config.brandName} - ${config.tagline}`,
    url: config.baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }),
  
  organization: (config: DomainSEOConfig) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.brandName,
    url: config.baseUrl,
    logo: `${config.baseUrl}/logo.png`,
    description: `${config.brandName} is a satirical cryptocurrency trading community platform`,
    sameAs: [
      'https://twitter.com/degentalk',
      'https://discord.gg/degentalk',
      'https://github.com/degentalk'
    ]
  }),
  
  faq: (config: DomainSEOConfig, faqs: Array<{question: string; answer: string}>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  })
};