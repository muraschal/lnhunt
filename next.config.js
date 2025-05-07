/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_LNBITS_API_URL: process.env.LNBITS_API_URL,
    NEXT_PUBLIC_LNBITS_API_KEY: process.env.LNBITS_API_KEY,
    NEXT_PUBLIC_LNBITS_WALLET_ID: process.env.LNBITS_WALLET_ID,
    NEXT_PUBLIC_LNBITS_LNURL: process.env.LNBITS_LNURL,
    NEXT_PUBLIC_LNBITS_LNURL_WITHDRAW: process.env.LNBITS_LNURL_WITHDRAW,
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
            key: 'Content-Security-Policy',
            value: `
              default-src 'self' https://vercel.live https://fonts.googleapis.com https://fonts.gstatic.com https://hwznode.rapold.io *.vercel.com *.vercel-dns.com *.vercel-scripts.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live *.vercel.com *.vercel-dns.com *.vercel-scripts.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com data:;
              img-src 'self' data: https://api.qrserver.com;
              connect-src 'self' https://hwznode.rapold.io *.vercel.com *.vercel-dns.com *.vercel-scripts.com https://vercel.live https://fonts.googleapis.com https://fonts.gstatic.com wss://*.vercel.app;
              frame-src 'self';
              media-src 'self';
            `.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
}

module.exports = nextConfig 