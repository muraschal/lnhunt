import '../styles/globals.css';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from 'react';
import ErrorBoundary from '../components/error-boundary';

export default function MyApp({ Component, pageProps }) {
  // Service Worker deaktivieren
  useEffect(() => {
    // Service Worker komplett deaktivieren
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
          console.log('Service Worker deregistriert');
        }
      });
    }
  }, []);

  return (
    <>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
      <Analytics />
      <SpeedInsights />
    </>
  );
} 