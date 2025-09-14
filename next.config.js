/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore ESLint during builds for test files
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure experimental features
  experimental: {
    // Suppress turbopack warnings
    turbo: {
      root: './',
    },
  },
}

module.exports = nextConfig