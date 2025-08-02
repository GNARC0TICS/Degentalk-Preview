// This is a wrapper that imports the existing Contact component
// No modifications to the original component are needed
import { Contact } from '@/components/pages/contact';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Degentalk - Get in Touch',
  description: 'Have questions about Degentalk? Contact our team for support, partnerships, or general inquiries about our crypto trading community platform.',
  keywords: 'contact degentalk, crypto forum support, cryptocurrency community contact, get in touch, customer support',
  openGraph: {
    title: 'Contact Degentalk - Get in Touch',
    description: 'Reach out to the Degentalk team for support, partnerships, or general inquiries.',
    type: 'website',
    url: 'https://degentalk.io/contact',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Degentalk',
    description: 'Get in touch with the Degentalk crypto community team.',
  },
  alternates: {
    canonical: 'https://degentalk.io/contact',
  },
};

export default Contact;