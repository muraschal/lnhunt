/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_LNBITS_API_URL: process.env.LNBITS_API_URL,
    NEXT_PUBLIC_LNBITS_API_KEY: process.env.LNBITS_API_KEY,
    NEXT_PUBLIC_LNBITS_WALLET_ID: process.env.LNBITS_WALLET_ID,
  },
  // Skew Protection: Verhindert Versionskonflikte zwischen Client und Server
  experimental: {
    useDeploymentId: true,
    useDeploymentIdServerActions: true,
  },
}

module.exports = nextConfig 