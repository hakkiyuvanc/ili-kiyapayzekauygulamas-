/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Output as static HTML for Electron
  output: 'export',

  // Disable linting during build to prevent failure on warnings
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization (Vercel automatically handles this)
  images: {
    unoptimized: true, // Required for static export
    domains: [], // Add your image domains if needed
    formats: ['image/avif', 'image/webp'],
  },

  // Force webpack (disable Turbopack)
  webpack: (config) => {
    return config;
  },

  // Compression
  compress: true,

  // Production source maps (disabled for smaller bundle)
  productionBrowserSourceMaps: false,

  // Performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
        ]
      }
    ];
  }
};

// const withPWA = require('next-pwa')({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true,
// });

module.exports = nextConfig;
