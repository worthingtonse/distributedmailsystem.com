import React from 'react'
import ReactDOM from 'react-dom/client'
import './utils/passiveListeners.js'
import App from './App.jsx'
import './index.css'

// Performance monitoring (optional - remove in production if not needed)
if (typeof window !== 'undefined' && 'performance' in window) {
  // Report Web Vitals
  window.addEventListener('load', () => {
    // Measure First Contentful Paint
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)