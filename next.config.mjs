/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Static export for Capacitor (iOS/Android)
  // Note: Only enable this when building for mobile
  // For Vercel deployment, comment out or remove this line
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
}

export default nextConfig
