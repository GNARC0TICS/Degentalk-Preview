/**
 * @file client/src/main.tsx
 * @description Main entry point for the Degentalk™ frontend application.
 * @purpose Initializes the React application, sets up the root DOM element, and configures global providers and routing.
 * @dependencies
 * - React: Core library for building user interfaces.
 * - ReactDOM: For DOM-specific rendering methods.
 * - App: The root component of the application.
 * - index.css: Global CSS styles.
 * - styles/animations.css: Application-wide animation styles.
 * - RootProvider: Aggregates all global context providers.
 * - wouter (Router): Lightweight routing library.
 * - BASE_URL: Base URL constant for routing.
 * @environment Client-side (browser).
 * @important_notes All global providers are managed by `RootProvider`. Do not add providers directly in this file or in `App.tsx`.
 * @status Stable.
 * @last_reviewed 2025-06-01
 * @owner Cline
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/animations.css';
import { RootProvider } from './providers/root-provider';
import { Router } from 'wouter';
import { BASE_URL } from '@/core/constants';

/**
 * Degentalk™ Main Client Entry
 *
 * This is the main entry point for the React client application.
 * Handles root rendering and global providers.
 */

// IMPORTANT: All providers are now managed by RootProvider.
// Do not add providers directly in this file or in App.tsx.

ReactDOM.createRoot(document.getElementById('root')!).render(
	<RootProvider>
		<Router base={BASE_URL}>
			<App />
		</Router>
	</RootProvider>
);
