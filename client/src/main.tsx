import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/animations.css';
import { RootProvider } from './providers/root-provider';
import { Router } from 'wouter';
import { BASE_URL } from '@/core/constants';

// IMPORTANT: All providers are now managed by RootProvider.
// Do not add providers directly in this file or in App.tsx.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RootProvider>
    <Router base={BASE_URL}>
      <App />
    </Router>
  </RootProvider>
);
