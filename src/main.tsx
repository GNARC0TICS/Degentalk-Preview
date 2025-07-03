import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initGA } from '@/lib/analytics'
import { initializeSiteAnalytics } from '@/lib/siteAnalytics'

// Initialize Google Analytics
initGA();

// Initialize Site Analytics
initializeSiteAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)