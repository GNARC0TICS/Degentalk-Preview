/**
 * @file client/src/main.tsx
 * @description Main entry point for the Degentalk frontend application.
 * @purpose Initializes the React application, sets up the root DOM element, and configures global providers and routing.
 * @dependencies
 * - React: Core library for building user interfaces.
 * - ReactDOM: For DOM-specific rendering methods.
 * - RouterProvider: React Router v6 provider for routing.
 * - router: Main router configuration.
 * - index.css: Global CSS styles.
 * - styles/animations.css: Application-wide animation styles.
 * - RootProvider: Aggregates all global context providers.
 * @environment Client-side (browser).
 * @important_notes All global providers are managed by `RootProvider`. Router is now handled by react-router-dom.
 * @status Updated to react-router-dom v6.
 * @last_reviewed 2025-07-16
 * @owner Claude
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './styles/animations.css';
import './features/admin/styles/admin-theme.css'; // Import admin theme
import { RootProvider } from './contexts/root-provider.tsx';
import { router } from './Router.tsx';

// IMPORTANT: All providers are now managed by RootProvider.
// Routing is now handled by react-router-dom RouterProvider.

ReactDOM.createRoot(document.getElementById('root')!).render(
	<RootProvider>
		<App />
		<RouterProvider router={router} />
	</RootProvider>
);
