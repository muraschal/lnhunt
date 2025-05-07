import '../styles/globals.css';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from 'react';
import ErrorBoundary from '../components/error-boundary';

export default function MyApp({ Component, pageProps }) {
  // Service Worker nur in der echten Produktion registrieren, nicht in Vercel Previews
  useEffect(() => {
    const isVercelPreview = 
      typeof window !== 'undefined' && 
      window.location.hostname.includes('vercel.app');
    
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production' && !isVercelPreview) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(
          function(registration) {
            console.log('Service Worker erfolgreich registriert mit Scope: ', registration.scope);
          },
          function(err) {
            console.log('Service Worker Registrierung fehlgeschlagen: ', err);
          }
        );
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