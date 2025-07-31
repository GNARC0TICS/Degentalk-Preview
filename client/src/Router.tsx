import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';

// Import pages
import HomePage from './pages/home';
import { About } from './pages/about';
import { PrivacyPolicy } from './pages/legal/privacy';
import { TermsOfService } from './pages/legal/terms';
import { Contact } from './pages/contact';

/**
 * Router Configuration for Landing Page
 * Includes home, about, and legal pages
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <About /> },
      { path: 'legal/privacy', element: <PrivacyPolicy /> },
      { path: 'legal/terms', element: <TermsOfService /> },
      { path: 'contact', element: <Contact /> },
    ],
  }
]);