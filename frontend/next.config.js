/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'example.com'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  // Performance оптимизации
  swcMinify: true, // Быстрая минификация через SWC
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Удаляем console.log в production
  },
  // Оптимизация бандла
  experimental: {
    optimizeCss: true, // Оптимизация CSS
  },
};

module.exports = nextConfig;
