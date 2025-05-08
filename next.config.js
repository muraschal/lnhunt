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
  // Webpack-Konfiguration für clientseitige Module
  webpack: (config, { isServer }) => {
    // PDF-Module nur clientseitig verarbeiten
    if (!isServer) {
      config.externals = [...config.externals, 'canvas', 'jsdom'];
    }
    
    return config;
  },
  // Sicherheits-HTTP-Header
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
      {
        // Spezifische Headers für manifest.json
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          }
        ],
      },
      {
        // Headers für MP4-Videos
        source: '/images/:path*.mp4',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          }
        ],
      }
    ];
  },
  reactStrictMode: true,
}

module.exports = nextConfig 