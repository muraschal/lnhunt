/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_LNBITS_API_URL: process.env.LNBITS_API_URL,
    NEXT_PUBLIC_LNBITS_API_KEY: process.env.LNBITS_API_KEY,
    NEXT_PUBLIC_LNBITS_WALLET_ID: process.env.LNBITS_WALLET_ID,
    NEXT_PUBLIC_LNBITS_LNURL: process.env.LNBITS_LNURL || "LNURL1DP68GURN8GHJ76RH0FHX7ER99EEXZUR0D3JZU6T09AMKJARGV3EXZAE0V9CXJTMKXYHKCMN4WFKZ76J5VEV8JMM5XE3X2NRT0FXHZ62SFEF9JMMF45RXZ3",
  },
  // Experimentelle Features aus Next.js 14.2.28 entfernt, da nicht mehr unterstützt
  experimental: {
    // Alte Konfiguration, die nicht mehr unterstützt wird:
    // useDeploymentId: true,
    // useDeploymentIdServerActions: true,
  },
  // Sicherheits-HTTP-Header
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Angepasste Content Security Policy, die Vercel-Skripte erlaubt
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.com *.vercel-dns.com vercel.live *.vercel.app *.vercel-scripts.com;
              style-src 'self' 'unsafe-inline' fonts.googleapis.com;
              img-src 'self' data: api.qrserver.com;
              font-src 'self' fonts.gstatic.com;
              connect-src 'self' *.vercel.com *.vercel-dns.com *.vercel-scripts.com;
              frame-src 'none';
              media-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
            `.replace(/\s+/g, ' ').trim()
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 