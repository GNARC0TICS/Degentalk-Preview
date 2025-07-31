import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';

// Import only the home page
import HomePage from './pages/home';

/**
 * Simplified Router Configuration for Static Landing Page
 * Only includes the home page route
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> }
    ],
  }
]);