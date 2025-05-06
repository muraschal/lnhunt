import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        {/* Favicon & App Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logos/LNHunt_favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logos/LNHunt_favicon-16x16.png" />
        <link rel="icon" type="image/x-icon" href="/logos/LNHunt_favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logos/LNHunt_apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logos/LNHunt_android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logos/LNHunt_android-chrome-512x512.png" />
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
        {/* Theme Color */}
        <meta name="theme-color" content="#171717" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 