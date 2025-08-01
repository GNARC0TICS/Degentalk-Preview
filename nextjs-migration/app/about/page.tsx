// This is a wrapper that imports the existing About component
// No modifications to the original component are needed
import dynamic from 'next/dynamic';

// Use dynamic import to ensure client-side only features work
const AboutPage = dynamic(() => import('@/pages/AboutPage'), { 
  ssr: true 
});

export default AboutPage;