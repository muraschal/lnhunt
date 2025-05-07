import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        {/* Ultra-radikale Service Worker Deaktivierung (höchste Priorität) */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Service Worker safe deactivation
            (function() {
              console.log("Service Worker safe deactivation");
              
              if ('serviceWorker' in navigator) {
                // Existierende Worker deregistrieren
                navigator.serviceWorker.getRegistrations()
                  .then(function(registrations) {
                    if (registrations && registrations.length) {
                      for (let registration of registrations) {
                        registration.unregister().catch(function() {});
                      }
                      console.log('Service Worker deregistriert');
                    }
                  })
                  .catch(function() {
                    console.log('Service Worker deregistrierung fehlgeschlagen (expected)');
                  });
                
                // Caches löschen, falls vorhanden
                if (window.caches) {
                  caches.keys().then(function(keys) {
                    keys.forEach(function(key) {
                      caches.delete(key).catch(function() {});
                    });
                  }).catch(function() {});
                }
              }
            })();
          `
        }} />
        
        {/* Favicon & App Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logos/LNHunt_favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logos/LNHunt_favicon-16x16.png" />
        <link rel="icon" type="image/x-icon" href="/logos/LNHunt_favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logos/LNHunt_apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logos/LNHunt_android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logos/LNHunt_android-chrome-512x512.png" />
        {/* PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="LNHunt" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="LNHunt" />
        <meta name="theme-color" content="#f97316" />
        {/* Content Security Policy - Entwicklungsmodus-freundlich */}
        {process.env.NODE_ENV === 'production' ? (
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self' https://*.vercel.live https://*.vercel.app https://fonts.googleapis.com https://fonts.gstatic.com https://hwznode.rapold.io *.vercel.com *.vercel-dns.com *.vercel-scripts.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.live *.vercel.com *.vercel-dns.com *.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://api.qrserver.com; frame-src 'self' https://*.vercel.live https://*.vercel.app *.vercel-scripts.com *.vercel.com; connect-src 'self' https://hwznode.rapold.io *.vercel.com *.vercel-dns.com *.vercel-scripts.com https://*.vercel.live https://fonts.googleapis.com https://fonts.gstatic.com;"
          />
        ) : null}
        
        {/* Apple Splash Screen */}
        <link
          rel="apple-touch-startup-image"
          href="/logos/LNHunt_apple-splash.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        {/* Google Fonts - Parisienne für eleganten handschriftlichen Stil */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet" />
        {/* Meta Description */}
        <meta name="description" content="LNHunt – Das Bitcoin & Lightning Quiz. Teste dein Wissen, knacke die Fragen und gewinne Sats!" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lnhunt.rapold.io/" />
        <meta property="og:title" content="LNHunt – Bitcoin & Lightning Quiz" />
        <meta property="og:description" content="Teste dein Wissen rund um Bitcoin, Lightning und mehr. Gewinne Sats und werde zum LNHunter!" />
        <meta property="og:image" content="/logos/LNHunt_big.png" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://lnhunt.rapold.io/" />
        <meta name="twitter:title" content="LNHunt – Bitcoin & Lightning Quiz" />
        <meta name="twitter:description" content="Teste dein Wissen rund um Bitcoin, Lightning und mehr. Gewinne Sats und werde zum LNHunter!" />
        <meta name="twitter:image" content="/logos/LNHunt_big.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 