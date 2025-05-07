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
      (window.location.hostname.includes('vercel.app') || 
       window.location.hostname.includes('localhost') || 
       window.location.hostname.includes('127.0.0.1'));
    
    if ('serviceWorker' in navigator) {
      if (isVercelPreview) {
        // Für Vercel Preview: Alle vorhandenen Service Worker sofort deregistrieren
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister().then(function(success) {
              console.log('Service Worker deregistriert:', success);
              if (success && window.caches) {
                // Auch den Cache leeren
                window.caches.keys().then(function(cacheNames) {
                  cacheNames.forEach(function(cacheName) {
                    window.caches.delete(cacheName);
                  });
                  // Nach erfolgreichem Löschen Seite neu laden
                  window.location.reload();
                });
              }
            });
          }
        });
      } else if (process.env.NODE_ENV === 'production') {
        // Echte Produktion: Service Worker registrieren
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