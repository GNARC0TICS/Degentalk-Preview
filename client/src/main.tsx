/**
 * @file client/src/main.tsx
 * @description Main entry point for the Degentalk static landing page.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/animations.css';
import { router } from './Router';
import { UIConfigProvider } from './contexts/UIConfigContext';
import { initGA } from './lib/analytics';

// Initialize Google Analytics
initGA();

// Simple error boundary for the static site
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      >
        Reload Page
      </button>
    </div>
  </div>
);

class SimpleErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleErrorBoundary>
      <UIConfigProvider>
        <RouterProvider router={router} />
        <App />
      </UIConfigProvider>
    </SimpleErrorBoundary>
  </React.StrictMode>
);
