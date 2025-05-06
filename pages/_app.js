import '../styles/globals.css';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }) {
  // Service Worker registrieren für PWA-Funktionalität
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  );
} 